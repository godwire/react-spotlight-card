import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SpotlightCard } from './SpotlightCard'

/**
 * These cover the things that would silently break and still typecheck: the
 * CSS variables the stylesheet reads, the props a consumer forwards, and the
 * touch and disabled escape hatches.
 */

function pointer(
  type: string,
  { pointerType = 'mouse', ...init }: MouseEventInit & { pointerType?: string } = {},
) {
  // jsdom has no PointerEvent. A MouseEvent carries everything React reads
  // except pointerType, which is a read-only accessor and has to be defined
  // rather than assigned.
  const event = new MouseEvent(type, { bubbles: true, ...init })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  return event
}

// React does not listen for pointerenter/pointerleave directly - it derives
// them from pointerover/pointerout during delegation. Firing the enter events
// by name would do nothing and the test would pass for the wrong reason.
const enter = (el: HTMLElement, init: MouseEventInit & { pointerType?: string } = {}) =>
  fireEvent(el, pointer('pointerover', { relatedTarget: null, ...init }))
const leave = (el: HTMLElement, init: MouseEventInit & { pointerType?: string } = {}) =>
  fireEvent(el, pointer('pointerout', { relatedTarget: null, ...init }))

const cardIn = (container: HTMLElement) => container.querySelector('.rsc-card') as HTMLElement

describe('SpotlightCard', () => {
  it('renders its children', () => {
    render(<SpotlightCard>hello</SpotlightCard>)
    expect(screen.getByText('hello')).toBeTruthy()
  })

  it('writes the configured values as CSS custom properties', () => {
    const { container } = render(
      <SpotlightCard spotlightColor="red" spotlightSize={120} transitionDuration={50} radius={8}>
        x
      </SpotlightCard>,
    )
    const card = cardIn(container)
    expect(card.style.getPropertyValue('--rsc-color')).toBe('red')
    expect(card.style.getPropertyValue('--rsc-size')).toBe('120px')
    expect(card.style.getPropertyValue('--rsc-duration')).toBe('50ms')
    expect(card.style.getPropertyValue('--rsc-radius')).toBe('8px')
  })

  it('tracks the pointer and toggles the glow', () => {
    const { container } = render(<SpotlightCard>x</SpotlightCard>)
    const card = cardIn(container)

    enter(card)
    expect(card.style.getPropertyValue('--rsc-opacity')).toBe('1')

    fireEvent(card, pointer('pointermove', { clientX: 40, clientY: 25 }))
    expect(card.style.getPropertyValue('--rsc-x')).toBe('40px')
    expect(card.style.getPropertyValue('--rsc-y')).toBe('25px')

    leave(card)
    expect(card.style.getPropertyValue('--rsc-opacity')).toBe('0')
  })

  it('ignores touch pointers unless asked to', () => {
    const { container } = render(<SpotlightCard>x</SpotlightCard>)
    const card = cardIn(container)
    enter(card, { pointerType: 'touch' })
    expect(card.style.getPropertyValue('--rsc-opacity')).toBe('')
  })

  it('forwards arbitrary div props and the consumer handlers', () => {
    const onClick = vi.fn()
    const onPointerEnter = vi.fn()
    const { container } = render(
      <SpotlightCard id="card" data-testid="c" onClick={onClick} onPointerEnter={onPointerEnter}>
        x
      </SpotlightCard>,
    )
    const card = container.querySelector('#card') as HTMLElement
    fireEvent.click(card)
    enter(card)
    expect(onClick).toHaveBeenCalledOnce()
    expect(onPointerEnter).toHaveBeenCalledOnce()
    expect(card.getAttribute('data-testid')).toBe('c')
  })

  it('exposes the underlying node through ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<SpotlightCard ref={ref}>x</SpotlightCard>)
    expect(ref.current?.classList.contains('rsc-card')).toBe(true)
  })

  it('renders no overlay and stops tracking when disabled', () => {
    const { container } = render(<SpotlightCard disabled>x</SpotlightCard>)
    const card = cardIn(container)
    expect(container.querySelector('.rsc-overlay')).toBeNull()
    expect(card.classList.contains('rsc-border-glow')).toBe(false)
    enter(card)
    expect(card.style.getPropertyValue('--rsc-opacity')).toBe('')
  })

  it('leaveBehavior="instant" kills the fade-out but not the fade-in', () => {
    const { container } = render(
      <SpotlightCard transitionDuration={600} leaveBehavior="instant">
        x
      </SpotlightCard>,
    )
    const card = cardIn(container)

    enter(card)
    expect(card.style.getPropertyValue('--rsc-duration')).toBe('600ms')

    leave(card)
    expect(card.style.getPropertyValue('--rsc-duration')).toBe('0ms')
    expect(card.style.getPropertyValue('--rsc-opacity')).toBe('0')
  })

  it('leaveBehavior="follow" keeps tracking the cursor past the edge', () => {
    const { container } = render(
      <SpotlightCard transitionDuration={300} leaveBehavior="follow">
        x
      </SpotlightCard>,
    )
    const card = cardIn(container)

    enter(card)
    leave(card)
    fireEvent(window, pointer('pointermove', { clientX: 900, clientY: 700 }))
    expect(card.style.getPropertyValue('--rsc-x')).toBe('900px')
    expect(card.style.getPropertyValue('--rsc-y')).toBe('700px')
  })

  it('stops following once the fade is over', () => {
    vi.useFakeTimers()
    try {
      const { container } = render(
        <SpotlightCard transitionDuration={100} leaveBehavior="follow">
          x
        </SpotlightCard>,
      )
      const card = cardIn(container)
      enter(card)
      leave(card)
      vi.advanceTimersByTime(400)
      fireEvent(window, pointer('pointermove', { clientX: 900, clientY: 700 }))
      expect(card.style.getPropertyValue('--rsc-x')).not.toBe('900px')
    } finally {
      vi.useRealTimers()
    }
  })

  it('positions the glow before lighting it, so it never flashes at the old spot', () => {
    const { container } = render(<SpotlightCard>x</SpotlightCard>)
    const card = cardIn(container)
    enter(card, { clientX: 55, clientY: 33 })
    expect(card.style.getPropertyValue('--rsc-x')).toBe('55px')
    expect(card.style.getPropertyValue('--rsc-opacity')).toBe('1')
  })
})