'use client'

import * as React from 'react'
import { cn } from '@/lib/shadcn/utils'
import { Slot } from '@radix-ui/react-slot'
import { useRipple } from '@/hooks/use-ripple'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcnui/tooltip'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        info: 'bg-blue-500 text-white shadow-sm hover:bg-blue-600',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
      clickable: {
        true: 'origin-center transform transition-transform duration-100 hover:scale-105 active:scale-95',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      clickable: true,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Material-style tap ripple from the press point. Opt-in, for two reasons: it needs
   * `relative overflow-hidden` (which clips anything a button deliberately overflows, such as a
   * badge hanging off the corner), and it renders an extra child — which `asChild` cannot accept,
   * since Slot requires exactly one. Ignored when `asChild` is set.
   */
  ripple?: boolean
  /**
   * This button navigates (it calls `router.push`) rather than being a link. Tags it for
   * `NavigationWaveListener`, which otherwise only waves real anchors — see that component.
   */
  navigates?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      clickable,
      ripple,
      navigates,
      children,
      onPointerDown: onPointerDownProp,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const useRippleEffect = Boolean(ripple) && !asChild
    const { onPointerDown, ripple: rippleNode } = useRipple()

    return (
      <Comp
        className={cn(
          'cursor-pointer hover:brightness-110',
          useRippleEffect && 'relative overflow-hidden',
          buttonVariants({ variant, size, clickable, className })
        )}
        ref={ref}
        {...(navigates ? { 'data-wave-nav': '' } : {})}
        {...props}
        onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
          if (useRippleEffect) onPointerDown(event)
          onPointerDownProp?.(event)
        }}
      >
        {/* Slot takes exactly one child, so an asChild button never gets the ripple overlay. */}
        {asChild ? (
          children
        ) : (
          <>
            {children}
            {useRippleEffect ? rippleNode : null}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

export interface ButtonWithTooltipProps extends ButtonProps {
  tooltipText: string
}

export function ButtonWithTooltip({
  tooltipText,
  children,
  ...buttonProps
}: ButtonWithTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button {...buttonProps}>{children}</Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
