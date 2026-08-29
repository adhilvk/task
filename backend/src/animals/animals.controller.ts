import { Controller, Get, Query } from '@nestjs/common';

import { AnimalsService } from './animals.service';
import { Animal } from './interfaces/animal.interface';

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  async getAnimals(@Query('name') name?: string): Promise<Animal[]> {
    return this.animalsService.getAnimals(name);
  }
}
