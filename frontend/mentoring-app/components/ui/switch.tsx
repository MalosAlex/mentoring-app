"use client"

/**
 * Switch Component
 * 
 * A toggle switch UI component for boolean settings.
 * 
 * 
 * Usage:
 * <Switch
 *   checked={isEnabled}
 *   onCheckedChange={(checked) => setIsEnabled(checked)}
 * />
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * SwitchProps interface
 * @property checked - Whether the switch is on or off
 * @property onCheckedChange - Callback fired when the switch state changes
 */
interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

/**
 * Switch Component
 * 
 * Renders an accessible toggle switch with:
 * - Visual button that users can click
 * - Hidden checkbox for form compatibility
 * - Smooth transition animations
 * - Keyboard accessibility (via the hidden checkbox)
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          // Base styles: pill shape with transition
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          // Focus styles for accessibility
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Background color based on checked state
          checked ? "bg-primary" : "bg-input",
          className
        )}
      >
        {/* The circular thumb that slides left/right */}
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            // Slide thumb based on checked state
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
        {/* Hidden checkbox for form compatibility and accessibility */}
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only" // Screen reader only - visually hidden
          {...props}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
