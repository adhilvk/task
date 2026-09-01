import type { JSX } from 'react'
import type { Animal } from '../types/animal'
import AnimalCard from './AnimalCard'

export interface AnimalListProps {
  animals: Animal[]
  onViewDetails: (animal: Animal) => void
  onEdit: (animal: Animal) => void
  onDelete: (animal: Animal) => void
}

function AnimalList({
  animals,
  onViewDetails,
  onEdit,
  onDelete,
}: AnimalListProps): JSX.Element {
  return (
    <ul className={animals.length === 1 ? 'list list--single' : 'list'}>
      {animals.map((animal: Animal, index: number) => (
        <AnimalCard
          key={animal.id || animal.name || index}
          animal={animal}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default AnimalList
