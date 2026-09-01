import type { Animal } from '../types/animal'

export interface AnimalFilters {
  name?: string
  status?: string
  category?: string
  species?: string
}

export interface SpeciesOption {
  value: string
  label: string
}

function isActiveFilter(value?: string): value is string {
  const normalized = value?.trim().toLowerCase()
  return Boolean(normalized) && normalized !== 'all'
}

function normalizeStatus(value?: string): string {
  const normalized = value?.trim().toLowerCase()

  if (normalized === 'sold') {
    return 'sold'
  }

  if (normalized === 'reserved') {
    return 'reserved'
  }

  return 'available'
}

function matchesSearch(animal: Animal, search: string): boolean {
  const haystack = [
    animal.name,
    animal.species,
    animal.breed,
    animal.category,
    animal.location,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesSpecies(animal: Animal, species: string): boolean {
  const needle = species.trim().toLowerCase()
  const speciesValue = animal.species?.trim().toLowerCase() ?? ''
  const breedValue = animal.breed?.trim().toLowerCase() ?? ''

  if (speciesValue === needle) {
    return true
  }

  const word = new RegExp(`\\b${escapeRegExp(needle)}\\b`)
  return word.test(speciesValue) || word.test(breedValue)
}

export function filterAnimals(
  animals: Animal[],
  filters: AnimalFilters = {},
): Animal[] {
  const search = filters.name?.trim().toLowerCase()
  const status = filters.status?.trim()
  const category = filters.category?.trim()
  const species = filters.species?.trim()

  return animals.filter((animal) => {
    if (search && !matchesSearch(animal, search)) {
      return false
    }

    if (
      isActiveFilter(status) &&
      normalizeStatus(animal.status) !== normalizeStatus(status)
    ) {
      return false
    }

    if (
      isActiveFilter(category) &&
      animal.category?.toLowerCase() !== category.toLowerCase()
    ) {
      return false
    }

    if (isActiveFilter(species) && !matchesSpecies(animal, species)) {
      return false
    }

    return true
  })
}

export function getSpeciesOptions(animals: Animal[]): SpeciesOption[] {
  const bySpecies = new Map<string, string>()

  for (const animal of animals) {
    const value = animal.species?.trim()
    if (!value || bySpecies.has(value)) {
      continue
    }

    bySpecies.set(value, animal.breed?.trim() || value)
  }

  return [...bySpecies.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}
