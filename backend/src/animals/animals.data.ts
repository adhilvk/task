import { Animal } from './interfaces/animal.interface';

export const LOCAL_ANIMALS: Animal[] = [
  {
    id: 1,
    name: 'Lion',
    species: 'Panthera leo',
    category: 'Mammal',
    image:
      'https://pub-049224bd44f54c45b314a9850ca7de0b.r2.dev/images/lion.jpg',
  },
  {
    id: 2,
    name: 'Elephant',
    species: 'Loxodonta africana',
    category: 'Mammal',
    image:
      'https://pub-049224bd44f54c45b314a9850ca7de0b.r2.dev/images/Elephant.jpg',
  },
  {
    id: 3,
    name: 'Penguin',
    species: 'Aptenodytes forsteri',
    category: 'Bird',
    image:
      'https://pub-049224bd44f54c45b314a9850ca7de0b.r2.dev/images/Penguin.jpg',
  },
  {
    id: 4,
    name: 'Crocodile',
    species: 'Crocodylus niloticus',
    category: 'Reptile',
    image:
      'https://pub-049224bd44f54c45b314a9850ca7de0b.r2.dev/images/Crocodile.jpg',
  },
];
