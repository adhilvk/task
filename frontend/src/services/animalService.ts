import type { Animal, FetchAnimalsParams } from '../types/animal'

const ANIMALS_URL = '/animals'

function readErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message

    if (typeof message === 'string' && message.trim()) {
      return message
    }

    if (Array.isArray(message) && message.length > 0) {
      return message.map(String).join(' ')
    }
  }

  return fallback
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await response.json()
    return readErrorMessage(data, fallback)
  } catch {
    return fallback
  }
}

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
    throw new Error(await readError(response, 'Could not fetch animals'))
  }

  const data: unknown = await response.json()
  return Array.isArray(data) ? (data as Animal[]) : []
}

export async function createAnimal(formData: FormData): Promise<Animal> {
  const response: Response = await fetch(ANIMALS_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Could not create animal'))
  }

  return (await response.json()) as Animal
}

export async function deleteAnimal(id: number): Promise<void> {
  const response: Response = await fetch(`${ANIMALS_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Could not delete animal'))
  }
}

export async function updateAnimal(
  id: number,
  formData: FormData,
): Promise<Animal> {
  const response: Response = await fetch(`${ANIMALS_URL}/${id}`, {
    method: 'PUT',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Could not update animal'))
  }

  return (await response.json()) as Animal
}
