import { SpotlightCard } from 'react-spotlight-card'

const cards = [
  {
    title: 'Default',
    color: 'rgba(255, 255, 255, 0.20)',
    desc: 'No props beyond children -- sensible defaults out of the box.',
  },
  {
    title: 'Violet glow',
    color: 'rgba(139, 92, 246, 0.35)',
    desc: "spotlightColor=\"rgba(139, 92, 246, 0.35)\"",
  },
  {
    title: 'Emerald glow',
    color: 'rgba(16, 185, 129, 0.35)',
    desc: "spotlightColor=\"rgba(16, 185, 129, 0.35)\"",
  },
  {
    title: 'Large, soft spotlight',
    color: 'rgba(59, 130, 246, 0.25)',
    desc: 'spotlightSize={480}',
    size: 480,
  },
  {
    title: 'Tight spotlight',
    color: 'rgba(236, 72, 153, 0.4)',
    desc: 'spotlightSize={140}',
    size: 140,
  },
  {
    title: 'No border glow',
    color: 'rgba(255, 255, 255, 0.25)',
    desc: 'borderGlow={false}',
    borderGlow: false,
  },
]

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <h1>react-spotlight-card</h1>
        <p>
          A lightweight, dependency-free React card with a cursor-tracking spotlight and
          glowing border. Move your mouse over any card below.
        </p>
      </header>

      <div className="grid">
        {cards.map((card) => (
          <SpotlightCard
            key={card.title}
            className="demo-card"
            spotlightColor={card.color}
            spotlightSize={card.size}
            borderGlow={card.borderGlow}
          >
            <h3>{card.title}</h3>
            <code>{card.desc}</code>
          </SpotlightCard>
        ))}
      </div>

      <footer>
        <a href="https://github.com/godwire/react-spotlight-card" target="_blank" rel="noreferrer">
          github.com/godwire/react-spotlight-card
        </a>
      </footer>
    </div>
  )
}
