import type { Animal } from '../types/animal'

const ANIMALS_URL = '/animals'

export async function fetchAnimals(
  name?: string,
): Promise<Animal[]> {
  const url = name
    ? `${ANIMALS_URL}?name=${encodeURIComponent(name)}`
    : ANIMALS_URL

  const response: Response = await fetch(url)

  if (!response.ok) {
    throw new Error('Could not fetch animals')
  }

  const data: unknown = await response.json()

  return Array.isArray(data) ? (data as Animal[]) : []
}