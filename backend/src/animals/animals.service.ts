import { Injectable } from '@nestjs/common';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { Animal } from './interfaces/animal.interface';

@Injectable()
export class AnimalsService {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async getAnimals(name?: string): Promise<Animal[]> {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: 'animals.json',
    });

    const response = await this.s3.send(command);

    const data = await response.Body?.transformToString();

    if (!data) {
      return [];
    }

    const animals = JSON.parse(data) as Animal[];

    if (!name) {
      return animals;
    }

    return animals.filter((animal) =>
      animal.name.toLowerCase().includes(name.toLowerCase()),
    );
  }
}
