import type { JSX } from 'react'
import type { Animal, AnimalStatus } from '../types/animal'
import {
  formatAge,
  formatCurrency,
  formatWeight,
} from '../utils/format'

export interface AnimalCardProps {
  animal: Animal
  onViewDetails: (animal: Animal) => void
}

function statusClassName(status: AnimalStatus | string | undefined): string {
  const normalized = (status || 'Available').toLowerCase()

  if (normalized === 'reserved') {
    return 'status-badge status-badge--reserved'
  }

  if (normalized === 'sold') {
    return 'status-badge status-badge--sold'
  }

  return 'status-badge status-badge--available'
}

function AnimalCard({ animal, onViewDetails }: AnimalCardProps): JSX.Element {
  const name: string = animal.name || 'Unknown animal'
  const status = animal.status || 'Available'
  const speciesBreed = [animal.species, animal.breed].filter(Boolean).join(' · ')

  return (
    <li className={`animal-card${status === 'Sold' ? ' animal-card--sold' : ''}`}>
      <div className="animal-card-media">
        {animal.image && (
          <img className="animal-card-image" src={animal.image} alt={name} />
        )}
        <span className={statusClassName(status)}>{status}</span>
      </div>

      <div className="animal-card-body">
        <h2 className="animal-card-name">{name}</h2>
        {speciesBreed && <p className="animal-card-meta">{speciesBreed}</p>}

        <dl className="animal-card-facts">
          {animal.gender && (
            <>
              <dt>Gender</dt>
              <dd>{animal.gender}</dd>
            </>
          )}
          {animal.age !== undefined && (
            <>
              <dt>Age</dt>
              <dd>{formatAge(animal.age)}</dd>
            </>
          )}
          {animal.weight !== undefined && (
            <>
              <dt>Weight</dt>
              <dd>{formatWeight(animal.weight)}</dd>
            </>
          )}
          {animal.healthStatus && (
            <>
              <dt>Health</dt>
              <dd>{animal.healthStatus}</dd>
            </>
          )}
          {animal.vaccinationStatus && (
            <>
              <dt>Vaccination</dt>
              <dd>{animal.vaccinationStatus}</dd>
            </>
          )}
          {animal.location && (
            <>
              <dt>Location</dt>
              <dd>{animal.location}</dd>
            </>
          )}
        </dl>

        {animal.sellingPrice !== undefined && (
          <p className="animal-card-price">{formatCurrency(animal.sellingPrice)}</p>
        )}

        <button
          className="details-btn"
          type="button"
          onClick={() => onViewDetails(animal)}
        >
          View Details
        </button>
      </div>
    </li>
  )
}

export default AnimalCard
