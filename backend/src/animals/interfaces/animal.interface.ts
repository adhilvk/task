export type AnimalStatus = 'Available' | 'Reserved' | 'Sold';

export interface Animal {
  id: number;
  name: string;
  species: string;
  category: string;
  breed: string;
  gender: string;
  age: number;
  weight: number;
  healthStatus: string;
  vaccinationStatus: string;
  purchasePrice: number;
  sellingPrice: number;
  status: AnimalStatus;
  location: string;
  description: string;
  image?: string;
}

export interface AnimalQuery {
  name?: string;
  status?: string;
  category?: string;
  species?: string;
}

export interface AnimalImageFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
