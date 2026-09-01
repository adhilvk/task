import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { LOCAL_ANIMALS } from './animals.data';
import {
  Animal,
  AnimalImageFile,
  AnimalQuery,
  AnimalStatus,
} from './interfaces/animal.interface';

const ANIMALS_KEY = 'animals.json';
const IMAGE_FOLDER = 'images';
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_STATUSES: AnimalStatus[] = ['Available', 'Reserved', 'Sold'];

@Injectable()
export class AnimalsService {
  private readonly logger = new Logger(AnimalsService.name);
  private localAnimals: Animal[] = LOCAL_ANIMALS.map((animal) => ({
    ...animal,
  }));

  async getAnimals(query: AnimalQuery = {}): Promise<Animal[]> {
    const animals = await this.loadAnimals();

    return animals.filter((animal) => this.matchesQuery(animal, query));
  }

  async createAnimal(
    body: Record<string, string>,
    image?: AnimalImageFile,
  ): Promise<Animal> {
    const animals = await this.loadAnimalsForWrite();
    const animal = this.buildAnimal(body, animals);

    if (image) {
      animal.image = await this.uploadImage(image, animals);
    }

    animals.push(animal);
    await this.persistAnimals(animals);

    return animal;
  }

  async deleteAnimal(id: number): Promise<void> {
    const animals = await this.loadAnimalsForWrite();
    const index = animals.findIndex((animal) => animal.id === id);

    if (index === -1) {
      throw new NotFoundException(`Animal ${id} was not found`);
    }

    const [removed] = animals.splice(index, 1);
    const imageStillUsed = animals.some(
      (animal) => animal.image && animal.image === removed.image,
    );

    if (removed.image && !imageStillUsed) {
      await this.deleteImage(removed.image);
    }

    await this.persistAnimals(animals);
  }

  private isActiveFilter(value?: string): value is string {
    const normalized = value?.trim().toLowerCase();
    return Boolean(normalized) && normalized !== 'all';
  }

  private normalizeStatus(value?: string): string {
    const normalized = value?.trim().toLowerCase();

    if (normalized === 'sold') {
      return 'sold';
    }

    if (normalized === 'reserved') {
      return 'reserved';
    }

    return 'available';
  }

  private matchesSpecies(animal: Animal, species: string): boolean {
    const needle = species.trim().toLowerCase();
    const speciesValue = animal.species?.trim().toLowerCase() ?? '';
    const breedValue = animal.breed?.trim().toLowerCase() ?? '';

    if (speciesValue === needle) {
      return true;
    }

    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const word = new RegExp(`\\b${escaped}\\b`);
    return word.test(speciesValue) || word.test(breedValue);
  }

  private matchesQuery(animal: Animal, query: AnimalQuery): boolean {
    const search = query.name?.trim().toLowerCase();
    const status = query.status?.trim();
    const category = query.category?.trim();
    const species = query.species?.trim();

    if (search) {
      const searchableFields = [
        animal.name,
        animal.species,
        animal.breed,
        animal.category,
        animal.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchableFields.includes(search)) {
        return false;
      }
    }

    if (
      this.isActiveFilter(status) &&
      this.normalizeStatus(animal.status) !== this.normalizeStatus(status)
    ) {
      return false;
    }

    if (
      this.isActiveFilter(category) &&
      animal.category?.toLowerCase() !== category.toLowerCase()
    ) {
      return false;
    }

    if (this.isActiveFilter(species) && !this.matchesSpecies(animal, species)) {
      return false;
    }

    return true;
  }

  private hasR2Config(): boolean {
    return Boolean(
      process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME,
    );
  }

  private getS3Client(): S3Client {
    return new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  private async loadAnimals(): Promise<Animal[]> {
    if (!this.hasR2Config()) {
      return this.localAnimals;
    }

    try {
      return await this.fetchAnimalsFromR2();
    } catch (error) {
      this.logger.warn(
        `R2 fetch failed, using local animal data: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );

      return this.localAnimals;
    }
  }

  private async loadAnimalsForWrite(): Promise<Animal[]> {
    if (!this.hasR2Config()) {
      return this.localAnimals.map((animal) => ({ ...animal }));
    }

    try {
      return await this.fetchAnimalsFromR2();
    } catch (error) {
      this.logger.error(
        `Could not load animals from R2: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      throw new ServiceUnavailableException(
        'Could not load animal data from storage',
      );
    }
  }

  private async fetchAnimalsFromR2(): Promise<Animal[]> {
    const response = await this.getS3Client().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: ANIMALS_KEY,
      }),
    );

    const data = await response.Body?.transformToString();

    if (!data) {
      return [];
    }

    const animals = JSON.parse(data) as Animal[];
    return Array.isArray(animals) ? animals : [];
  }

  private async persistAnimals(animals: Animal[]): Promise<void> {
    this.localAnimals = animals.map((animal) => ({ ...animal }));

    if (!this.hasR2Config()) {
      return;
    }

    try {
      await this.getS3Client().send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: ANIMALS_KEY,
          Body: JSON.stringify(animals, null, 2),
          ContentType: 'application/json',
        }),
      );
    } catch (error) {
      this.logger.error(
        `Could not save animals to R2: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      throw new ServiceUnavailableException(
        'Could not save animal data to storage',
      );
    }
  }

  private buildAnimal(
    body: Record<string, string>,
    animals: Animal[],
  ): Animal {
    const name = this.requireText(body.name, 'name');
    const status = this.parseStatus(body.status);
    const nextId =
      animals.reduce((max, animal) => Math.max(max, animal.id || 0), 0) + 1;

    return {
      id: nextId,
      name,
      species: this.requireText(body.species, 'species'),
      category: this.requireText(body.category, 'category'),
      breed: this.requireText(body.breed, 'breed'),
      gender: this.requireText(body.gender, 'gender'),
      age: this.parseNumber(body.age, 'age', { min: 0 }),
      weight: this.parseNumber(body.weight, 'weight', { min: 0 }),
      healthStatus: this.requireText(body.healthStatus, 'healthStatus'),
      vaccinationStatus: this.requireText(
        body.vaccinationStatus,
        'vaccinationStatus',
      ),
      purchasePrice: this.parseNumber(body.purchasePrice, 'purchasePrice', {
        min: 0,
      }),
      sellingPrice: this.parseNumber(body.sellingPrice, 'sellingPrice', {
        min: 0,
      }),
      status,
      location: this.requireText(body.location, 'location'),
      description: body.description?.trim() ?? '',
    };
  }

  private requireText(value: string | undefined, field: string): string {
    const text = value?.trim() ?? '';

    if (!text) {
      throw new BadRequestException(`${field} is required`);
    }

    return text;
  }

  private parseNumber(
    value: string | undefined,
    field: string,
    options: { min?: number } = {},
  ): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`${field} must be a valid number`);
    }

    if (options.min !== undefined && parsed < options.min) {
      throw new BadRequestException(`${field} must be at least ${options.min}`);
    }

    return parsed;
  }

  private parseStatus(value: string | undefined): AnimalStatus {
    const status = this.requireText(value, 'status') as AnimalStatus;

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new BadRequestException(
        'status must be Available, Reserved, or Sold',
      );
    }

    return status;
  }

  private async uploadImage(
    image: AnimalImageFile,
    animals: Animal[],
  ): Promise<string> {
    if (!image.buffer || image.size === 0) {
      throw new BadRequestException('The selected image is empty');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(image.mimetype)) {
      throw new BadRequestException(
        'Image must be a JPEG, PNG, WebP, or GIF file',
      );
    }

    if (!this.hasR2Config()) {
      throw new ServiceUnavailableException(
        'Image upload requires R2 storage to be configured',
      );
    }

    const extension = this.getImageExtension(image);
    const key = `${IMAGE_FOLDER}/${Date.now()}-${nextIdSafe()}.${extension}`;

    try {
      await this.getS3Client().send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: image.buffer,
          ContentType: image.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Could not upload image to R2: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      throw new ServiceUnavailableException(
        'Could not upload the animal image',
      );
    }

    return `${this.getPublicBaseUrl(animals)}/${key}`;
  }

  private async deleteImage(imageUrl: string): Promise<void> {
    if (!this.hasR2Config()) {
      return;
    }

    const key = this.getImageKey(imageUrl);

    if (!key) {
      return;
    }

    try {
      await this.getS3Client().send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Could not delete image from R2: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  private getImageExtension(image: AnimalImageFile): string {
    const fromName = image.originalname.split('.').pop()?.toLowerCase();

    if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fromName)) {
      return fromName === 'jpeg' ? 'jpg' : fromName;
    }

    if (image.mimetype === 'image/png') {
      return 'png';
    }

    if (image.mimetype === 'image/webp') {
      return 'webp';
    }

    if (image.mimetype === 'image/gif') {
      return 'gif';
    }

    return 'jpg';
  }

  private getImageKey(imageUrl: string): string | null {
    try {
      const pathname = new URL(imageUrl).pathname.replace(/^\/+/, '');
      return pathname.startsWith(`${IMAGE_FOLDER}/`) ? pathname : null;
    } catch {
      return null;
    }
  }

  private getPublicBaseUrl(animals: Animal[]): string {
    const configured = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');

    if (configured) {
      return configured;
    }

    const existingImage = animals.find((animal) => animal.image)?.image;

    if (existingImage) {
      try {
        return new URL(existingImage).origin;
      } catch {
        // Fall through to the error below.
      }
    }

    throw new ServiceUnavailableException(
      'R2_PUBLIC_URL is required to store animal images',
    );
  }
}

function nextIdSafe(): string {
  return Math.random().toString(36).slice(2, 8);
}
