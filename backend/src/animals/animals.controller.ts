import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AnimalsService } from './animals.service';
import { Animal } from './interfaces/animal.interface';
import type { AnimalImageFile } from './interfaces/animal.interface';

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  async getAnimals(
    @Query('name') name?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('species') species?: string,
  ): Promise<Animal[]> {
    return this.animalsService.getAnimals({
      name,
      status,
      category,
      species,
    });
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createAnimal(
    @Body() body: Record<string, string>,
    @UploadedFile() image?: AnimalImageFile,
  ): Promise<Animal> {
    return this.animalsService.createAnimal(body, image);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateAnimal(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, string>,
    @UploadedFile() image?: AnimalImageFile,
  ): Promise<Animal> {
    return this.animalsService.updateAnimal(id, body, image);
  }

  @Delete(':id')
  async deleteAnimal(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.animalsService.deleteAnimal(id);
    return { message: 'Animal deleted' };
  }
}
