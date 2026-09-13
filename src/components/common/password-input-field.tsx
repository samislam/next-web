'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/shadcnui/input'
import { Button } from '@/components/ui/shadcnui/button'
import { InputField } from '@/components/common/input-field'
import { Control, FieldValues, Path } from 'react-hook-form'

type PasswordInputFieldProps<T extends FieldValues> = {
  control: Control<T, unknown>
  name: Path<T>
  label: string
  placeholder: string
  showPasswordLabel?: string
  hidePasswordLabel?: string
}

export const PasswordInputField = <T extends FieldValues>(props: PasswordInputFieldProps<T>) => {
  const {
    name,
    label,
    control,
    placeholder,
    showPasswordLabel = 'Show password',
    hidePasswordLabel = 'Hide password',
  } = props

  const [showPassword, setShowPassword] = useState(false)

  return (
    <InputField
      required
      name={name}
      label={label}
      control={control}
      render={(field) => (
        <Input
          {...field}
          dir="ltr"
          icon="lucide:LockKeyhole"
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          rootClassname="bg-background h-12 rounded-2xl border-border px-4 shadow-none"
          endAction={
            <Button
              clickable
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          }
        />
      )}
    />
  )
}
