import type { ChangeEvent, FormEvent, JSX } from 'react'

function SearchIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
}

function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Search animals...',
}: SearchInputProps): JSX.Element {
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange(event.target.value)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <label className="search">
        <SearchIcon />
        <input
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label="Search animals"
        />
      </label>
      <button className="search-btn" type="submit">
        Search
      </button>
    </form>
  )
}

export default SearchInput
