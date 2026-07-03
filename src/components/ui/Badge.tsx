import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type BadgeProps = ComponentProps<'span'> & {
  variant?: 'success' | 'muted'
}

const variants = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  muted: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

export function Badge({ variant = 'muted', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
