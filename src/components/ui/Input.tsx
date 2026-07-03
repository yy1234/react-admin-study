import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type InputProps = ComponentProps<'input'>

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
