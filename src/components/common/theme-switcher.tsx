'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon, MonitorIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '../ui/shadcnui/toggle-group'

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const [value, setValue] = useState<string>()

  const handleChange = (value: string) => {
    setTheme(value)
    // ... Your logic to server actions
  }

  useEffect(() => {
    setValue(theme)
  }, [value, theme])

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
