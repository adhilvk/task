import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, JSX, MouseEvent } from 'react'
import type { Animal, AnimalStatus } from '../types/animal'

export interface AddAnimalFormProps {
  animal?: Animal
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}

const CATEGORIES = ['Mammal', 'Bird', 'Reptile'] as const
const STATUSES: AnimalStatus[] = ['Available', 'Reserved', 'Sold']
const GENDERS = ['Male', 'Female'] as const

function isAnimalStatus(value: string): value is AnimalStatus {
  return STATUSES.includes(value as AnimalStatus)
}

function AddAnimalForm({
  animal,
  onClose,
  onSubmit,
}: AddAnimalFormProps): JSX.Element {
  const isEdit = Boolean(animal)
  const [name, setName] = useState(animal?.name ?? '')
  const [species, setSpecies] = useState(animal?.species ?? '')
  const [category, setCategory] = useState(animal?.category || 'Mammal')
  const [breed, setBreed] = useState(animal?.breed ?? '')
  const [gender, setGender] = useState(animal?.gender || 'Male')
  const [age, setAge] = useState(
    animal?.age !== undefined ? String(animal.age) : '',
  )
  const [weight, setWeight] = useState(
    animal?.weight !== undefined ? String(animal.weight) : '',
  )
  const [healthStatus, setHealthStatus] = useState(
    animal?.healthStatus || 'Healthy',
  )
  const [vaccinationStatus, setVaccinationStatus] = useState(
    animal?.vaccinationStatus || 'Up to date',
  )
  const [purchasePrice, setPurchasePrice] = useState(
    animal?.purchasePrice !== undefined ? String(animal.purchasePrice) : '',
  )
  const [sellingPrice, setSellingPrice] = useState(
    animal?.sellingPrice !== undefined ? String(animal.sellingPrice) : '',
  )
  const [status, setStatus] = useState<AnimalStatus>(
    animal && isAnimalStatus(animal.status) ? animal.status : 'Available',
  )
  const [location, setLocation] = useState(animal?.location ?? '')
  const [description, setDescription] = useState(animal?.description ?? '')
  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categoryOptions =
    animal?.category &&
    !CATEGORIES.includes(animal.category as (typeof CATEGORIES)[number])
      ? [...CATEGORIES, animal.category]
      : [...CATEGORIES]

  const genderOptions =
    animal?.gender && !GENDERS.includes(animal.gender as (typeof GENDERS)[number])
      ? [...GENDERS, animal.gender]
      : [...GENDERS]

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
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? 'Could not update animal'
            : 'Could not create animal',
      )
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
        aria-labelledby="animal-form-title"
      >
        <div className="modal-header">
          <h2 id="animal-form-title">
            {isEdit ? 'Edit Animal' : 'Add Animal'}
          </h2>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label={isEdit ? 'Close edit animal form' : 'Close add animal form'}
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
              {categoryOptions.map((option) => (
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
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
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
            {isEdit && animal?.image && !image && (
              <img
                className="form-current-image"
                src={animal.image}
                alt={animal.name}
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
            />
            {isEdit && (
              <span className="form-hint">
                Leave empty to keep the current image.
              </span>
            )}
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
              {submitting
                ? 'Saving...'
                : isEdit
                  ? 'Save Changes'
                  : 'Add Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddAnimalForm
