import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Pill : badge arrondi style "calculateur legacy".
 * Border-radius full (99px), typo uppercase optionnelle, plusieurs variants
 * sémantiques.
 */
const pillVariants = cva(
  'inline-flex items-center rounded-full font-semibold whitespace-nowrap border',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-foreground border-border',
        primary: 'bg-primary-soft text-primary border-primary/30',
        accent: 'bg-accent-soft text-accent border-accent/30',
        success: 'bg-green-100 text-green-800 border-green-300',
        warning: 'bg-amber-100 text-amber-800 border-amber-300',
        destructive: 'bg-destructive/10 text-destructive border-destructive/30',
        muted: 'bg-muted text-muted-foreground border-border',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {}

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(pillVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Pill.displayName = 'Pill';
