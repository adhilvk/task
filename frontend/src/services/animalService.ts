import type { Animal } from '../types/animal'

const ANIMALS_URL = '/animals.json'

export async function fetchAnimals(
  name?: string,
): Promise<Animal[]> {
  const response: Response = await fetch(ANIMALS_URL)

  if (!response.ok) {
    throw new Error('Could not fetch animals')
  }

  const data: unknown = await response.json()
  const animals: Animal[] = Array.isArray(data) ? (data as Animal[]) : []

  if (!name) {
    return animals
  }

  return animals.filter((animal) =>
    animal.name.toLowerCase().includes(name.toLowerCase()),
  )
}
