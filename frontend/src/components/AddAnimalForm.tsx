import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, JSX, MouseEvent } from 'react'
import type { AnimalStatus } from '../types/animal'

export interface AddAnimalFormProps {
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}

const CATEGORIES = ['Mammal', 'Bird', 'Reptile'] as const
const STATUSES: AnimalStatus[] = ['Available', 'Reserved', 'Sold']

function AddAnimalForm({ onClose, onSubmit }: AddAnimalFormProps): JSX.Element {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [category, setCategory] = useState<string>('Mammal')
  const [breed, setBreed] = useState('')
  const [gender, setGender] = useState('Male')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [healthStatus, setHealthStatus] = useState('Healthy')
  const [vaccinationStatus, setVaccinationStatus] = useState('Up to date')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [status, setStatus] = useState<AnimalStatus>('Available')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape' && !submitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
    if (!submitting && event.target === event.currentTarget) {
      onClose()
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    setImage(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('species', species.trim())
    formData.append('category', category)
    formData.append('breed', breed.trim())
    formData.append('gender', gender)
    formData.append('age', age)
    formData.append('weight', weight)
    formData.append('healthStatus', healthStatus.trim())
    formData.append('vaccinationStatus', vaccinationStatus.trim())
    formData.append('purchasePrice', purchasePrice)
    formData.append('sellingPrice', sellingPrice)
    formData.append('status', status)
    formData.append('location', location.trim())
    formData.append('description', description.trim())

    if (image) {
      formData.append('image', image)
    }

    try {
      await onSubmit(formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create animal')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-animal-title"
      >
        <div className="modal-header">
          <h2 id="add-animal-title">Add Animal</h2>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close add animal form"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form className="animal-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Species
            <input
              value={species}
              onChange={(event) => setSpecies(event.target.value)}
              required
            />
          </label>

          <label>
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Breed
            <input
              value={breed}
              onChange={(event) => setBreed(event.target.value)}
              required
            />
          </label>

          <label>
            Gender
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          <label>
            Age
            <input
              type="number"
              min="0"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              required
            />
          </label>

          <label>
            Weight
            <input
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              required
            />
          </label>

          <label>
            Health status
            <input
              value={healthStatus}
              onChange={(event) => setHealthStatus(event.target.value)}
              required
            />
          </label>

          <label>
            Vaccination status
            <input
              value={vaccinationStatus}
              onChange={(event) => setVaccinationStatus(event.target.value)}
              required
            />
          </label>

          <label>
            Purchase price
            <input
              type="number"
              min="0"
              step="0.01"
              value={purchasePrice}
              onChange={(event) => setPurchasePrice(event.target.value)}
              required
            />
          </label>

          <label>
            Selling price
            <input
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
              required
            />
          </label>

          <label>
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as AnimalStatus)}
            >
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
            />
          </label>

          <label className="animal-form-wide">
            Description
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="animal-form-wide">
            Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button
              className="details-btn"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button className="search-btn" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddAnimalForm
