import { useEffect, useMemo, useState } from 'react'
import type { JSX } from 'react'

import Header, { PawIcon } from './components/Header'
import SearchInput from './components/SearchInput'
import InventoryFilters from './components/InventoryFilters'
import AnimalList from './components/AnimalList'
import AnimalDetails from './components/AnimalDetails'
import AddAnimalForm from './components/AddAnimalForm'
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
  const [formAnimal, setFormAnimal] = useState<Animal | null>(null)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  async function loadAnimals(options?: { silent?: boolean }): Promise<void> {
    if (!options?.silent) {
      setLoading(true)
    }
    setError('')

    try {
      const data: Animal[] = await animalService.fetchAnimals()
      setAnimals(data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Could not fetch animals',
      )
      if (!options?.silent) {
        setAnimals([])
      }
    } finally {
      if (!options?.silent) {
        setLoading(false)
      }
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

  async function handleCreateAnimal(formData: FormData): Promise<void> {
    const created = await animalService.createAnimal(formData)
    closeForm()
    setAnimals((current) => [
      ...current.filter((animal) => animal.id !== created.id),
      created,
    ])
    await loadAnimals({ silent: true })
  }

  async function handleUpdateAnimal(formData: FormData): Promise<void> {
    if (!formAnimal) {
      throw new Error('No animal selected to edit')
    }

    const updated = await animalService.updateAnimal(formAnimal.id, formData)
    closeForm()
    setAnimals((current) =>
      current.map((animal) => (animal.id === updated.id ? updated : animal)),
    )

    if (selectedAnimal?.id === updated.id) {
      setSelectedAnimal(updated)
    }

    await loadAnimals({ silent: true })
  }

  function openAddForm(): void {
    setFormAnimal(null)
    setShowForm(true)
  }

  function openEditForm(animal: Animal): void {
    setFormAnimal(animal)
    setShowForm(true)
  }

  function closeForm(): void {
    setShowForm(false)
    setFormAnimal(null)
  }

  async function handleDeleteAnimal(animal: Animal): Promise<void> {
    const confirmed = window.confirm(
      `Delete ${animal.name}? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setError('')

    try {
      await animalService.deleteAnimal(animal.id)

      if (selectedAnimal?.id === animal.id) {
        setSelectedAnimal(null)
      }

      setAnimals((current) =>
        current.filter((item) => item.id !== animal.id),
      )

      await loadAnimals({ silent: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete animal')
    }
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

          <div className="toolbar-actions">
            <button
              className="add-animal-btn"
              type="button"
              onClick={openAddForm}
            >
              Add Animal
            </button>
          </div>
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

        {!loading && visibleAnimals.length > 0 && (
          <AnimalList
            key={`${statusFilter}-${categoryFilter}-${speciesFilter}-${appliedSearch}`}
            animals={visibleAnimals}
            onViewDetails={setSelectedAnimal}
            onEdit={openEditForm}
            onDelete={(animal) => {
              void handleDeleteAnimal(animal)
            }}
          />
        )}
      </main>

      {selectedAnimal && (
        <AnimalDetails
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
        />
      )}

      {showForm && (
        <AddAnimalForm
          animal={formAnimal ?? undefined}
          onClose={closeForm}
          onSubmit={formAnimal ? handleUpdateAnimal : handleCreateAnimal}
        />
      )}
    </div>
  )
}

export default App
