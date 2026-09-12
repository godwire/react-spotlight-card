import { Playground } from './Playground'

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <h1>react-spotlight-card</h1>
        <p>
          A cursor-tracking spotlight card for React, with no dependencies beyond React itself.
          Change any prop below and the card and the code both follow.
        </p>
        <div className="install">
          <code>npm install react-spotlight-card</code>
        </div>
      </header>

      <Playground />

      <footer>
        <a href="https://github.com/godwire/react-spotlight-card" target="_blank" rel="noreferrer">
          github.com/godwire/react-spotlight-card
        </a>
      </footer>
    </div>
  )
}