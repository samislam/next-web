'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon, MonitorIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '../ui/shadcnui/toggle-group'

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  // The theme is only known on the client, so render nothing selected until mounted (avoids a
  // hydration mismatch). Always pass a string: starting from `undefined` made the ToggleGroup
  // uncontrolled, then switching to the theme made it controlled — which React warns about.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const value = mounted ? (theme ?? '') : ''

  const handleChange = (next: string) => {
    // Clicking the active item makes a single ToggleGroup emit '' — keep the current theme instead.
    if (next) setTheme(next)
  }

  return (
    <ToggleGroup type="single" value={value} onValueChange={handleChange} className="gap-1">
      <ToggleGroupItem
        value="dark"
        aria-label="Dark"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-9 w-9 rounded-full p-0"
      >
        <MoonIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="light"
        aria-label="Light"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-9 w-9 rounded-full p-0"
      >
        <SunIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="system"
        aria-label="System"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-9 w-9 rounded-full p-0"
      >
        <MonitorIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
