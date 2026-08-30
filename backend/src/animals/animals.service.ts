import { Injectable } from '@nestjs/common';

import { LOCAL_ANIMALS } from './animals.data';
import { Animal } from './interfaces/animal.interface';

@Injectable()
export class AnimalsService {
  getAnimals(name?: string): Animal[] {
    if (!name) {
      return LOCAL_ANIMALS;
    }

    return LOCAL_ANIMALS.filter((animal) =>
      animal.name.toLowerCase().includes(name.toLowerCase()),
    );
  }
}
