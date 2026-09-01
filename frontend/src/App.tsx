import { useEffect, useMemo, useState } from 'react'
import type { JSX } from 'react'

import Header, { PawIcon } from './components/Header'
import SearchInput from './components/SearchInput'
import InventoryFilters from './components/InventoryFilters'
import AnimalList from './components/AnimalList'
import AnimalDetails from './components/AnimalDetails'
import * as animalService from './services/animalService'
import type { Animal } from './types/animal'
import type {
  CategoryFilter,
  StatusFilter,
} from './components/InventoryFilters'
import { filterAnimals, getSpeciesOptions } from './utils/filterAnimals'

import './App.css'

function App(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>('')
  const [appliedSearch, setAppliedSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [speciesFilter, setSpeciesFilter] = useState<string>('All')
  const [animals, setAnimals] = useState<Animal[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  async function loadAnimals(): Promise<void> {
    setLoading(true)
    setError('')

    try {
      const data: Animal[] = await animalService.fetchAnimals()
      setAnimals(data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Could not fetch animals',
      )
      setAnimals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAnimals()
  }, [])

  const speciesOptions = useMemo(
    () => getSpeciesOptions(animals),
    [animals],
  )

  const visibleAnimals = useMemo(
    () =>
      filterAnimals(animals, {
        name: appliedSearch,
        status: statusFilter,
        category: categoryFilter,
        species: speciesFilter,
      }),
    [animals, appliedSearch, statusFilter, categoryFilter, speciesFilter],
  )

  function handleSearch(): void {
    setAppliedSearch(inputValue.trim())
  }

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="badge">
          <PawIcon />
        </div>

        <h1>Animal Inventory</h1>
        <p className="subtitle">
          Track health, location, and pricing for animals you buy, manage, and sell.
        </p>

        <div className="toolbar">
          <SearchInput
            value={inputValue}
            onChange={setInputValue}
            onSearch={handleSearch}
            placeholder="Search by name, species, breed, category, or location"
          />

          <InventoryFilters
            status={statusFilter}
            category={categoryFilter}
            species={speciesFilter}
            speciesOptions={speciesOptions}
            onStatusChange={(value) => setStatusFilter(value)}
            onCategoryChange={(value) => setCategoryFilter(value)}
            onSpeciesChange={(value) => setSpeciesFilter(value)}
          />
        </div>

        {loading && (
          <p className="status">Loading animals...</p>
        )}

        {error && (
          <p className="error">{error}</p>
        )}

        {!loading && !error && visibleAnimals.length === 0 && (
          <p className="status">No animals found</p>
        )}

        {!loading && !error && visibleAnimals.length > 0 && (
          <AnimalList
            key={`${statusFilter}-${categoryFilter}-${speciesFilter}-${appliedSearch}`}
            animals={visibleAnimals}
            onViewDetails={setSelectedAnimal}
          />
        )}
      </main>

      {selectedAnimal && (
        <AnimalDetails
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
        />
      )}
    </div>
  )
}

export default App
