import { forwardRef, useCallback, useEffect, useRef } from 'react'
import type { ComponentPropsWithoutRef, CSSProperties, PointerEvent } from 'react'
import './SpotlightCard.css'

/**
 * What the glow does once the cursor leaves the card.
 *
 * `fade`    - stays where the cursor crossed the edge and fades out there.
 *             With a long transitionDuration this reads as a light left
 *             behind, which is sometimes the effect you want.
 * `instant` - disappears the moment the cursor leaves, whatever
 *             transitionDuration says. The fade-in is unaffected.
 * `follow`  - keeps tracking the cursor past the edge while it fades, so the
 *             light slides out of the card instead of stopping at the border.
 */
export type LeaveBehavior = 'fade' | 'instant' | 'follow'

export interface SpotlightCardProps extends ComponentPropsWithoutRef<'div'> {
  /** CSS color for the spotlight glow. Any valid CSS color, including rgba() for opacity. */
  spotlightColor?: string
  /** Diameter of the spotlight glow, in pixels. */
  spotlightSize?: number
  /** Whether to also render a glowing gradient border that follows the cursor. */
  borderGlow?: boolean
  /** Fade in/out duration for the glow, in milliseconds. */
  transitionDuration?: number
  /** Corner radius. A number is treated as pixels. */
  radius?: number | string
  /** What the glow does when the cursor leaves the card. */
  leaveBehavior?: LeaveBehavior
  /**
   * React to touch as well as mouse and pen. Off by default: on a phone the
   * glow would light up on tap and then sit there, since there is no cursor
   * to leave the card.
   */
  enableTouch?: boolean
  /** Render the card without any glow at all, keeping layout identical. */
  disabled?: boolean
}

/**
 * A card that renders a soft radial glow following the user's cursor, with an
 * optional matching glow along the border.
 *
 * Nothing here goes through React state, so the component never re-renders
 * while the pointer moves or on enter and leave - the cursor position and the
 * glow's opacity are both written straight to CSS custom properties on the DOM
 * node. In a grid of a hundred cards that is the difference between smooth and
 * not.
 *
 * Every other prop is forwarded to the underlying <div>, so the card can be
 * clickable, labelled, or carry data attributes like any other element.
 */
export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  function SpotlightCard(
    {
      children,
      className = '',
      style,
      spotlightColor = 'rgba(255, 255, 255, 0.20)',
      spotlightSize = 300,
      borderGlow = true,
      transitionDuration = 300,
      radius,
      leaveBehavior = 'fade',
      enableTouch = false,
      disabled = false,
      onPointerMove,
      onPointerEnter,
      onPointerLeave,
      ...rest
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null)
    // Set while the glow is still following a cursor that has already left.
    const chase = useRef<{ move: (event: globalThis.PointerEvent) => void; timer: number } | null>(
      null,
    )

    // Keep our own handle on the node while still honouring whatever ref the
    // consumer passed in, object or callback.
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef],
    )

    const place = useCallback((el: HTMLDivElement, clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--rsc-x', `${clientX - rect.left}px`)
      el.style.setProperty('--rsc-y', `${clientY - rect.top}px`)
    }, [])

    const stopChase = useCallback(() => {
      const running = chase.current
      if (!running) return
      window.removeEventListener('pointermove', running.move)
      window.clearTimeout(running.timer)
      chase.current = null
    }, [])

    const startChase = useCallback(
      (el: HTMLDivElement) => {
        stopChase()
        const move = (event: globalThis.PointerEvent) => place(el, event.clientX, event.clientY)
        window.addEventListener('pointermove', move)
        // Once the glow is invisible there is nothing left to follow.
        const timer = window.setTimeout(stopChase, transitionDuration + 50)
        chase.current = { move, timer }
      },
      [place, stopChase, transitionDuration],
    )

    // A card can be unmounted mid-fade; the window listener must not outlive it.
    useEffect(() => stopChase, [stopChase])

    const tracks = useCallback(
      (event: PointerEvent<HTMLDivElement>) =>
        !disabled && (enableTouch || event.pointerType !== 'touch'),
      [disabled, enableTouch],
    )

    const handlePointerMove = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event)
        const el = innerRef.current
        if (!el || !tracks(event)) return
        place(el, event.clientX, event.clientY)
      },
      [onPointerMove, place, tracks],
    )

    const handlePointerEnter = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(event)
        const el = innerRef.current
        if (!el || !tracks(event)) return
        stopChase()
        // Position first, then light up: otherwise the glow appears for one
        // frame wherever the cursor left it last time.
        place(el, event.clientX, event.clientY)
        el.style.setProperty('--rsc-duration', `${transitionDuration}ms`)
        el.style.setProperty('--rsc-opacity', '1')
      },
      [onPointerEnter, place, stopChase, tracks, transitionDuration],
    )

    const handlePointerLeave = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event)
        const el = innerRef.current
        if (!el) return
        if (leaveBehavior === 'instant') {
          el.style.setProperty('--rsc-duration', '0ms')
        } else if (leaveBehavior === 'follow') {
          startChase(el)
        }
        el.style.setProperty('--rsc-opacity', '0')
      },
      [leaveBehavior, onPointerLeave, startChase],
    )

    const mergedStyle: CSSProperties = {
      ...style,
      ['--rsc-color' as string]: spotlightColor,
      ['--rsc-size' as string]: `${spotlightSize}px`,
      ['--rsc-duration' as string]: `${transitionDuration}ms`,
      ...(radius !== undefined
        ? { ['--rsc-radius' as string]: typeof radius === 'number' ? `${radius}px` : radius }
        : null),
    }

    return (
      <div
        {...rest}
        ref={setRef}
        className={['rsc-card', borderGlow && !disabled ? 'rsc-border-glow' : '', className]
          .filter(Boolean)
          .join(' ')}
        style={mergedStyle}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {!disabled && <div className="rsc-overlay" aria-hidden="true" />}
        <div className="rsc-content">{children}</div>
      </div>
    )
  },
)