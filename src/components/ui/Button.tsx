import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-3 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
