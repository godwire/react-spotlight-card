import { useState } from 'react'
import type { ReactNode } from 'react'
import { SpotlightCard } from 'react-spotlight-card'
import type { LeaveBehavior } from 'react-spotlight-card'

/**
 * The card and the code it produces stay pinned to the top of the viewport;
 * the controls run underneath them in a wide strip. Whatever you change is
 * visible in both places at the moment you change it, without scrolling.
 *
 * Every control is named after the prop it sets. The option you picked stays
 * lit, the default option carries a small mark, and anything that is no longer
 * the default is called out on the card, in the panel and in the code.
 */

type Settings = {
  spotlightColor: string
  spotlightSize: number
  transitionDuration: number
  radius: number
  borderGlow: boolean
  leaveBehavior: LeaveBehavior
  enableTouch: boolean
  disabled: boolean
}

const DEFAULTS: Settings = {
  spotlightColor: 'rgba(255, 255, 255, 0.20)',
  spotlightSize: 300,
  transitionDuration: 300,
  radius: 16,
  borderGlow: true,
  leaveBehavior: 'fade',
  enableTouch: false,
  disabled: false,
}

const ORDER = Object.keys(DEFAULTS) as (keyof Settings)[]

const HELP: Record<keyof Settings, string> = {
  spotlightColor: 'Any CSS color. The alpha in rgba() controls how strong the glow reads.',
  spotlightSize: 'Diameter of the glow. Small reads as a torch, large as an ambient wash.',
  transitionDuration: 'How long the glow takes to fade in and out.',
  radius: 'Corner radius. Sets the --rsc-radius custom property on the element.',
  borderGlow: 'Draws a second glow along the border, masked down to a 1px ring.',
  leaveBehavior:
    'What happens when the cursor leaves. Raise transitionDuration first, or the three options look identical.',
  enableTouch:
    'Off by default: a phone has no cursor to leave the card, so the glow would light up on tap and stay lit.',
  disabled: 'Removes the glow and stops tracking. Layout and spacing stay exactly the same.',
}

const COLORS = [
  { label: 'White', value: 'rgba(255, 255, 255, 0.20)' },
  { label: 'Violet', value: 'rgba(139, 92, 246, 0.35)' },
  { label: 'Blue', value: 'rgba(59, 130, 246, 0.30)' },
  { label: 'Emerald', value: 'rgba(16, 185, 129, 0.35)' },
  { label: 'Pink', value: 'rgba(236, 72, 153, 0.40)' },
  { label: 'Amber', value: 'rgba(245, 158, 11, 0.35)' },
]

const PRESETS: { name: string; note: string; values: Partial<Settings> }[] = [
  { name: 'Default', note: 'no props at all', values: {} },
  {
    name: 'Torch',
    note: 'tight, quick, pink',
    values: {
      spotlightColor: 'rgba(236, 72, 153, 0.40)',
      spotlightSize: 140,
      transitionDuration: 120,
    },
  },
  {
    name: 'Ambient',
    note: 'wide, slow, trails out',
    values: {
      spotlightColor: 'rgba(59, 130, 246, 0.30)',
      spotlightSize: 480,
      transitionDuration: 700,
      leaveBehavior: 'follow',
    },
  },
  {
    name: 'Flat',
    note: 'square corners, no ring',
    values: { spotlightColor: 'rgba(16, 185, 129, 0.35)', radius: 0, borderGlow: false },
  },
]

const UNIT: Partial<Record<keyof Settings, string>> = {
  spotlightSize: 'px',
  transitionDuration: 'ms',
  radius: 'px',
}

function display(key: keyof Settings, value: Settings[keyof Settings]): string {
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return `${value}${UNIT[key] ?? ''}`
  return value
}

function jsxValue(value: Settings[keyof Settings]): string | null {
  if (typeof value === 'boolean') return value ? null : '{false}'
  if (typeof value === 'number') return `{${value}}`
  return `"${value}"`
}

function same(a: Settings, b: Settings): boolean {
  return ORDER.every((key) => a[key] === b[key])
}

export function Playground() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [showAll, setShowAll] = useState(false)
  const [copied, setCopied] = useState(false)

  const changed = ORDER.filter((key) => settings[key] !== DEFAULTS[key])

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
    setCopied(false)
  }

  function apply(values: Partial<Settings>) {
    setSettings({ ...DEFAULTS, ...values })
    setCopied(false)
  }

  const lines = (showAll ? ORDER : changed).map((key) => {
    const suffix = jsxValue(settings[key])
    return { key, text: suffix ? `${key}=${suffix}` : key, lit: settings[key] !== DEFAULTS[key] }
  })

  const code = [
    lines.length ? '<SpotlightCard' : '<SpotlightCard>',
    ...lines.map((line) => `  ${line.text}`),
    ...(lines.length ? ['>'] : []),
    '  <h3>Hover me</h3>',
    '</SpotlightCard>',
  ].join('\n')

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="playground" aria-label="Prop playground">
      <div className="stage">
        <SpotlightCard
          className="stage-card"
          spotlightColor={settings.spotlightColor}
          spotlightSize={settings.spotlightSize}
          transitionDuration={settings.transitionDuration}
          radius={settings.radius}
          borderGlow={settings.borderGlow}
          leaveBehavior={settings.leaveBehavior}
          enableTouch={settings.enableTouch}
          disabled={settings.disabled}
        >
          <h3>Move your cursor across this card</h3>
          <p className="stage-note">
            {changed.length === 0
              ? 'Everything is at its default.'
              : changed.map((key) => `${key}=${display(key, settings[key])}`).join('   ')}
          </p>
        </SpotlightCard>
      </div>

      <div className="code">
        <div className="panel-head">
          <h2>{showAll ? 'Every prop, defaults included' : 'Only what you changed'}</h2>
          <div className="head-actions">
            <button
              type="button"
              className={showAll ? 'ghost on' : 'ghost'}
              aria-pressed={showAll}
              onClick={() => setShowAll((value) => !value)}
            >
              Show all
            </button>
            <button type="button" className="ghost" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <pre>
          <code>
            <span className="tag">{lines.length ? '<SpotlightCard' : '<SpotlightCard>'}</span>
            {lines.map((line) => (
              <span key={line.key} className={line.lit ? 'attr lit' : 'attr'}>
                {'\n  '}
                {line.text}
              </span>
            ))}
            {lines.length ? <span className="tag">{'\n>'}</span> : null}
            {'\n  '}
            <span className="muted">&lt;h3&gt;Hover me&lt;/h3&gt;</span>
            {'\n'}
            <span className="tag">&lt;/SpotlightCard&gt;</span>
          </code>
        </pre>
      </div>

      <div className="controls">
        <div className="panel-head">
          <h2>Props</h2>
          <button
            type="button"
            className="ghost"
            onClick={() => apply({})}
            disabled={changed.length === 0}
          >
            Reset all
          </button>
        </div>

        <div className="presets" role="group" aria-label="Starting points">
          {PRESETS.map((preset) => {
            const on = same(settings, { ...DEFAULTS, ...preset.values })
            return (
              <button
                key={preset.name}
                type="button"
                className={on ? 'preset on' : 'preset'}
                aria-pressed={on}
                onClick={() => apply(preset.values)}
              >
                <strong>{preset.name}</strong>
                <span>{preset.note}</span>
              </button>
            )
          })}
        </div>

        <Group title="Glow">
          <Control
            name="spotlightColor"
            settings={settings}
            onReset={() => set('spotlightColor', DEFAULTS.spotlightColor)}
          >
            <div className="swatches" role="group" aria-label="spotlightColor">
              {COLORS.map((color) => {
                const on = settings.spotlightColor === color.value
                return (
                  <button
                    key={color.value}
                    type="button"
                    className={on ? 'swatch on' : 'swatch'}
                    aria-pressed={on}
                    aria-label={`${color.label}, ${color.value}`}
                    title={color.value}
                    style={{ background: color.value.replace(/[\d.]+\)$/, '1)') }}
                    onClick={() => set('spotlightColor', color.value)}
                  />
                )
              })}
            </div>
            <input
              id="spotlightColor"
              type="text"
              className="text-input"
              value={settings.spotlightColor}
              onChange={(event) => set('spotlightColor', event.target.value)}
              spellCheck={false}
            />
          </Control>

          <Control
            name="spotlightSize"
            settings={settings}
            onReset={() => set('spotlightSize', DEFAULTS.spotlightSize)}
          >
            <Choices
              label="spotlightSize"
              value={settings.spotlightSize}
              onPick={(value) => set('spotlightSize', value)}
              options={[
                { label: '140', value: 140 },
                { label: '300', value: 300, isDefault: true },
                { label: '480', value: 480 },
                { label: '700', value: 700 },
              ]}
            />
            <input
              id="spotlightSize"
              type="range"
              min={60}
              max={700}
              step={10}
              value={settings.spotlightSize}
              onChange={(event) => set('spotlightSize', Number(event.target.value))}
            />
          </Control>

          <Control
            name="transitionDuration"
            settings={settings}
            onReset={() => set('transitionDuration', DEFAULTS.transitionDuration)}
          >
            <Choices
              label="transitionDuration"
              value={settings.transitionDuration}
              onPick={(value) => set('transitionDuration', value)}
              options={[
                { label: '0', value: 0 },
                { label: '120', value: 120 },
                { label: '300', value: 300, isDefault: true },
                { label: '700', value: 700 },
              ]}
            />
            <input
              id="transitionDuration"
              type="range"
              min={0}
              max={1200}
              step={20}
              value={settings.transitionDuration}
              onChange={(event) => set('transitionDuration', Number(event.target.value))}
            />
          </Control>
        </Group>

        <Group title="Shape">
          <Control name="radius" settings={settings} onReset={() => set('radius', DEFAULTS.radius)}>
            <Choices
              label="radius"
              value={settings.radius}
              onPick={(value) => set('radius', value)}
              options={[
                { label: '0', value: 0 },
                { label: '8', value: 8 },
                { label: '16', value: 16, isDefault: true },
                { label: '32', value: 32 },
              ]}
            />
            <input
              id="radius"
              type="range"
              min={0}
              max={48}
              step={1}
              value={settings.radius}
              onChange={(event) => set('radius', Number(event.target.value))}
            />
          </Control>

          <Control
            name="borderGlow"
            settings={settings}
            onReset={() => set('borderGlow', DEFAULTS.borderGlow)}
          >
            <Choices
              label="borderGlow"
              value={settings.borderGlow}
              onPick={(value) => set('borderGlow', value)}
              options={[
                { label: 'true', value: true, isDefault: true },
                { label: 'false', value: false },
              ]}
            />
          </Control>
        </Group>

        <Group title="Behaviour">
          <Control
            name="leaveBehavior"
            settings={settings}
            onReset={() => set('leaveBehavior', DEFAULTS.leaveBehavior)}
          >
            <Choices
              label="leaveBehavior"
              value={settings.leaveBehavior}
              onPick={(value) => set('leaveBehavior', value)}
              options={[
                { label: 'fade', value: 'fade' as LeaveBehavior, isDefault: true },
                { label: 'instant', value: 'instant' as LeaveBehavior },
                { label: 'follow', value: 'follow' as LeaveBehavior },
              ]}
            />
          </Control>

          <Control
            name="enableTouch"
            settings={settings}
            onReset={() => set('enableTouch', DEFAULTS.enableTouch)}
          >
            <Choices
              label="enableTouch"
              value={settings.enableTouch}
              onPick={(value) => set('enableTouch', value)}
              options={[
                { label: 'true', value: true },
                { label: 'false', value: false, isDefault: true },
              ]}
            />
          </Control>

          <Control
            name="disabled"
            settings={settings}
            onReset={() => set('disabled', DEFAULTS.disabled)}
          >
            <Choices
              label="disabled"
              value={settings.disabled}
              onPick={(value) => set('disabled', value)}
              options={[
                { label: 'true', value: true },
                { label: 'false', value: false, isDefault: true },
              ]}
            />
          </Control>
        </Group>
      </div>
    </section>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="group">
      <h3 className="group-title">{title}</h3>
      <div className="tiles">{children}</div>
    </section>
  )
}

function Control({
  name,
  settings,
  onReset,
  children,
}: {
  name: keyof Settings
  settings: Settings
  onReset: () => void
  children: ReactNode
}) {
  const isDefault = settings[name] === DEFAULTS[name]
  return (
    <div className={isDefault ? 'control' : 'control is-changed'}>
      <div className="control-head">
        <label htmlFor={name}>{name}</label>
        <span className="value">{display(name, settings[name])}</span>
        <button
          type="button"
          className="reset"
          onClick={onReset}
          disabled={isDefault}
          aria-label={`Reset ${name} to ${display(name, DEFAULTS[name])}`}
          title={`Reset to ${display(name, DEFAULTS[name])}`}
        >
          ↺
        </button>
      </div>
      {children}
      <p className="help">{HELP[name]}</p>
    </div>
  )
}

function Choices<T extends string | number | boolean>({
  label,
  value,
  options,
  onPick,
}: {
  label: string
  value: T
  options: { label: string; value: T; isDefault?: boolean }[]
  onPick: (value: T) => void
}) {
  return (
    <div className="opts" role="group" aria-label={label}>
      {options.map((option) => {
        const on = value === option.value
        return (
          <button
            key={String(option.value)}
            type="button"
            className={on ? 'opt on' : 'opt'}
            aria-pressed={on}
            onClick={() => onPick(option.value)}
          >
            {option.label}
            {option.isDefault ? <i className="dot" aria-hidden="true" /> : null}
          </button>
        )
      })}
    </div>
  )
}