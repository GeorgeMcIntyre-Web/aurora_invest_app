'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

/**
 * TooltipProvider - Wraps the application to provide tooltip context
 * 
 * Accessibility features:
 * - Configurable delay for showing tooltips
 * - Skip delay when moving between tooltips
 * - Automatic ARIA attributes
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Tooltip - Root component for tooltip
 * 
 * Accessibility features (provided by Radix UI):
 * - Automatic aria-describedby on trigger
 * - Keyboard accessible (focus to show, ESC to hide)
 * - Screen reader announcements
 * - Proper focus management
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * TooltipTrigger - Element that triggers the tooltip
 * 
 * Usage: Wrap any interactive element to add tooltip functionality
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * TooltipContent - The tooltip content that appears on hover/focus
 * 
 * Props:
 * - sideOffset: Distance from trigger (default: 4px)
 * - side: Preferred side ('top' | 'right' | 'bottom' | 'left')
 * - align: Alignment ('start' | 'center' | 'end')
 * 
 * Accessibility features:
 * - High z-index (z-50) ensures visibility above other content
 * - Semantic role="tooltip" automatically applied
 * - Associated with trigger via aria-describedby
 * - Smooth animations for better UX
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
