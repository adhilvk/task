import type { JSX } from 'react'
import type { Animal } from '../types/animal'

export interface AnimalCardProps {
  animal: Animal
}

function AnimalCard({ animal }: AnimalCardProps): JSX.Element {
  const name: string = animal.name || 'Unknown animal'

  return (
    <li className="animal-card">
      {animal.image && (
        <img className="animal-card-image" src={animal.image} alt={name} />
      )}
      <div>
        {name}
        {animal.species && (
          <p className="animal-card-meta">{animal.species}</p>
        )}
        {animal.category && (
          <p className="animal-card-meta">{animal.category}</p>
        )}
      </div>
    </li>
  )
}

export default AnimalCard
