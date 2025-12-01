'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
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
    <ToggleGroup type="single" value={value} onValueChange={handleChange}>
      <ToggleGroupItem value="dark" aria-label="Dark">
        <MoonIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="light" aria-label="Light">
        <SunIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
