import type { ChangeEvent, JSX } from 'react'
import type { SpeciesOption } from '../utils/filterAnimals'

export const STATUS_FILTERS = ['All', 'Available', 'Reserved', 'Sold'] as const
export const CATEGORY_FILTERS = ['All', 'Mammal', 'Bird', 'Reptile'] as const

export type StatusFilter = (typeof STATUS_FILTERS)[number]
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number]

export interface InventoryFiltersProps {
  status: StatusFilter
  category: CategoryFilter
  species: string
  speciesOptions: SpeciesOption[]
  onStatusChange: (value: StatusFilter) => void
  onCategoryChange: (value: CategoryFilter) => void
  onSpeciesChange: (value: string) => void
}

function InventoryFilters({
  status,
  category,
  species,
  speciesOptions,
  onStatusChange,
  onCategoryChange,
  onSpeciesChange,
}: InventoryFiltersProps): JSX.Element {
  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>): void {
    const value = event.target.value
    if (
      value === 'All' ||
      value === 'Available' ||
      value === 'Reserved' ||
      value === 'Sold'
    ) {
      onStatusChange(value)
    }
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>): void {
    onCategoryChange(event.target.value as CategoryFilter)
  }

  function handleSpeciesChange(event: ChangeEvent<HTMLSelectElement>): void {
    onSpeciesChange(event.target.value)
  }

  return (
    <div className="filters">
      <label className="filter">
        Status
        <select value={status} onChange={handleStatusChange} aria-label="Filter by status">
          {STATUS_FILTERS.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All statuses' : option}
            </option>
          ))}
        </select>
      </label>

      <label className="filter">
        Category
        <select
          value={category}
          onChange={handleCategoryChange}
          aria-label="Filter by category"
        >
          {CATEGORY_FILTERS.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All categories' : option}
            </option>
          ))}
        </select>
      </label>

      <label className="filter">
        Species
        <select
          value={species}
          onChange={handleSpeciesChange}
          aria-label="Filter by species"
        >
          <option value="All">All species</option>
          {speciesOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default InventoryFilters
