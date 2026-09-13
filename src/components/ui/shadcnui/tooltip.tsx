'use client'

import * as React from 'react'
import { cn } from '@/lib/shadcn/utils'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-[--radix-tooltip-content-transform-origin] overflow-hidden rounded-md px-3 py-1.5 text-xs',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export interface SimpleTooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipTrigger> {
  text: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  asChild?: boolean // allow overriding the trigger wrapper
}

// forwardRef + prop spreading so SimpleTooltip can itself be the child of another `asChild` trigger
// (e.g. a ConfirmDialog/Dialog trigger). Radix injects onClick/ref onto its child; without forwarding
// them here they'd be swallowed at the tooltip boundary and the wrapped button would never open the
// dialog. Both Slots then merge onto the same underlying button.
export const SimpleTooltip = React.forwardRef<
  React.ElementRef<typeof TooltipTrigger>,
  SimpleTooltipProps
>(({ text, side = 'top', children, asChild = true, ...props }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild={asChild} ref={ref} {...props}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
))
SimpleTooltip.displayName = 'SimpleTooltip'

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
