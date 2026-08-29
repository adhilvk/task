import type { JSX } from 'react'

export function PawIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="6.5" cy="8" rx="2.1" ry="2.6" />
      <ellipse cx="12" cy="5.2" rx="2.1" ry="2.6" />
      <ellipse cx="17.5" cy="8" rx="2.1" ry="2.6" />
      <ellipse cx="5.2" cy="13.2" rx="1.8" ry="2.2" />
      <path d="M12 10.5c-3.4 0-5.8 2.6-5.8 5.4 0 2.2 1.8 3.6 3.6 3.6 1.1 0 1.7-.5 2.2-.5s1.1.5 2.2.5c1.8 0 3.6-1.4 3.6-3.6 0-2.8-2.4-5.4-5.8-5.4z" />
    </svg>
  )
}

export interface HeaderProps {}

function Header(_props: HeaderProps = {}): JSX.Element {
  return (
    <header className="header">
      <span className="logo">
        <PawIcon />
        Animal Explorer
      </span>
    </header>
  )
}

export default Header
