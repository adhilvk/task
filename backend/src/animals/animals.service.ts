import { Injectable, Logger } from '@nestjs/common';
import { LOCAL_ANIMALS } from './animals.data';
import { Animal, AnimalQuery } from './interfaces/animal.interface';

@Injectable()
export class AnimalsService {
  private readonly logger = new Logger(AnimalsService.name);

  async getAnimals(query: AnimalQuery = {}): Promise<Animal[]> {
    const animals = await this.loadAnimals();

    return animals.filter((animal) => this.matchesQuery(animal, query));
  }

  private matchesQuery(animal: Animal, query: AnimalQuery): boolean {
    const search = query.name?.trim().toLowerCase();
    const status = query.status?.trim().toLowerCase();
    const category = query.category?.trim().toLowerCase();
    const species = query.species?.trim().toLowerCase();

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

    if (status && animal.status?.toLowerCase() !== status) {
      return false;
    }

    if (category && animal.category?.toLowerCase() !== category) {
      return false;
    }

    if (species && animal.species?.toLowerCase() !== species) {
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

  private async loadAnimals(): Promise<Animal[]> {
    // If R2 environment variables are missing,
    // use the local data as a fallback.
    if (!this.hasR2Config()) {
      return LOCAL_ANIMALS;
    }

    try {
      const { GetObjectCommand, S3Client } = await import('@aws-sdk/client-s3');

      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      });

      const response = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: 'animals.json',
        }),
      );

      const data = await response.Body?.transformToString();

      if (!data) {
        return LOCAL_ANIMALS;
      }

      const animals = JSON.parse(data) as Animal[];

      return Array.isArray(animals) ? animals : LOCAL_ANIMALS;
    } catch (error) {
      this.logger.warn(
        `R2 fetch failed, using local animal data: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );

      return LOCAL_ANIMALS;
    }
  }
}
