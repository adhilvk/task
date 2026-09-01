import type { Animal, FetchAnimalsParams } from '../types/animal'

const ANIMALS_URL = '/animals'

export async function fetchAnimals(
  params: FetchAnimalsParams = {},
): Promise<Animal[]> {
  const searchParams = new URLSearchParams()

  if (params.name) {
    searchParams.set('name', params.name)
  }

  if (params.status) {
    searchParams.set('status', params.status)
  }

  if (params.category) {
    searchParams.set('category', params.category)
  }

  if (params.species) {
    searchParams.set('species', params.species)
  }

  const query = searchParams.toString()
  const url = query ? `${ANIMALS_URL}?${query}` : ANIMALS_URL
  const response: Response = await fetch(url)

  if (!response.ok) {
    throw new Error('Could not fetch animals')
  }

  const data: unknown = await response.json()
  return Array.isArray(data) ? (data as Animal[]) : []
}
