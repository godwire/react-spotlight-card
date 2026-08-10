import { useRef, useState } from 'react'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import './SpotlightCard.css'

export interface SpotlightCardProps {
  /** Card content. */
  children: ReactNode
  /** Extra class name(s) applied to the outer element. */
  className?: string
  /** Inline styles applied to the outer element (merged with the component's own CSS variables). */
  style?: CSSProperties
  /** CSS color for the spotlight glow. Any valid CSS color works, including rgba() for opacity. */
  spotlightColor?: string
  /** Diameter of the spotlight glow, in pixels. */
  spotlightSize?: number
  /** Whether to also render a glowing gradient border that follows the cursor. */
  borderGlow?: boolean
  /** Fade in/out duration for the glow, in milliseconds. */
  transitionDuration?: number
}

/**
 * A card that renders a soft radial glow following the user's cursor, with
 * an optional matching glow along the border. Pure CSS + a single
 * `pointermove` listener -- no other dependencies, and no React re-renders
 * while the cursor moves (the position is written straight to CSS custom
 * properties on the DOM node via a ref).
 */
export function SpotlightCard({
  children,
  className = '',
  style,
  spotlightColor = 'rgba(255, 255, 255, 0.20)',
  spotlightSize = 300,
  borderGlow = true,
  transitionDuration = 300,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    el.style.setProperty('--rsc-x', `${x}px`)
    el.style.setProperty('--rsc-y', `${y}px`)
  }

  const mergedStyle: CSSProperties = {
    ...style,
    ['--rsc-color' as string]: spotlightColor,
    ['--rsc-size' as string]: `${spotlightSize}px`,
    ['--rsc-opacity' as string]: active ? 1 : 0,
    ['--rsc-duration' as string]: `${transitionDuration}ms`,
  }

  return (
    <div
      ref={ref}
      className={['rsc-card', borderGlow ? 'rsc-border-glow' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={mergedStyle}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
    >
      <div className="rsc-overlay" aria-hidden="true" />
      <div className="rsc-content">{children}</div>
    </div>
  )
}
