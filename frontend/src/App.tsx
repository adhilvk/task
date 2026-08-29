import { useEffect, useState } from 'react'
import type { JSX } from 'react'

import Header, { PawIcon } from './components/Header'
import SearchInput from './components/SearchInput'
import AnimalList from './components/AnimalList'
import * as animalService from './services/animalService'
import type { Animal } from './types/animal'

import './App.css'

function App(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>('')
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  async function loadAnimals(name?: string): Promise<void> {
    setLoading(true)
    setError('')

    try {
      const data: Animal[] = await animalService.fetchAnimals(name)
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

  function handleSearch(): void {
    void loadAnimals(inputValue.trim())
  }

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="badge">
          <PawIcon />
        </div>

        <h1>Animal Data</h1>

        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          onSearch={handleSearch}
        />

        {loading && (
          <p className="status">Loading animals...</p>
        )}

        {error && (
          <p className="error">{error}</p>
        )}

        {!loading && !error && animals.length === 0 && (
          <p className="status">No animals found</p>
        )}

        {!loading && !error && animals.length > 0 && (
          <AnimalList animals={animals} />
        )}
      </main>
    </div>
  )
}

export default App