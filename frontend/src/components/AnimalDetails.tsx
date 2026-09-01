import { useEffect } from 'react'
import type { JSX, MouseEvent } from 'react'
import type { Animal } from '../types/animal'
import {
  formatAge,
  formatCurrency,
  formatWeight,
  getProfit,
} from '../utils/format'

export interface AnimalDetailsProps {
  animal: Animal
  onClose: () => void
}

function AnimalDetails({ animal, onClose }: AnimalDetailsProps): JSX.Element {
  const profit = getProfit(animal.purchasePrice, animal.sellingPrice)
  const profitLabel = animal.status === 'Sold' ? 'Profit' : 'Estimated profit'
  const status = animal.status || 'Available'

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) {
      onClose()
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
        aria-labelledby="animal-details-title"
      >
        <div className="modal-header">
          <h2 id="animal-details-title">{animal.name}</h2>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        {animal.image && (
          <img className="modal-image" src={animal.image} alt={animal.name} />
        )}

        <span className={`status-badge status-badge--${status.toLowerCase()}`}>
          {status}
        </span>

        {animal.description && (
          <p className="modal-description">{animal.description}</p>
        )}

        <dl className="modal-facts">
          <dt>Species</dt>
          <dd>{animal.species || '—'}</dd>
          <dt>Category</dt>
          <dd>{animal.category || '—'}</dd>
          <dt>Breed</dt>
          <dd>{animal.breed || '—'}</dd>
          <dt>Gender</dt>
          <dd>{animal.gender || '—'}</dd>
          <dt>Age</dt>
          <dd>{formatAge(animal.age)}</dd>
          <dt>Weight</dt>
          <dd>{formatWeight(animal.weight)}</dd>
          <dt>Health status</dt>
          <dd>{animal.healthStatus || '—'}</dd>
          <dt>Vaccination</dt>
          <dd>{animal.vaccinationStatus || '—'}</dd>
          <dt>Location</dt>
          <dd>{animal.location || '—'}</dd>
          <dt>Purchase price</dt>
          <dd>{formatCurrency(animal.purchasePrice)}</dd>
          <dt>Selling price</dt>
          <dd>{formatCurrency(animal.sellingPrice)}</dd>
          {profit !== null && (
            <>
              <dt>{profitLabel}</dt>
              <dd className={profit >= 0 ? 'profit-positive' : 'profit-negative'}>
                {formatCurrency(profit)}
              </dd>
            </>
          )}
        </dl>
      </div>
    </div>
  )
}

export default AnimalDetails
