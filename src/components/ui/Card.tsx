import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn('rounded-lg border border-slate-200 bg-white p-6', className)}
    >
      {children}
    </section>
  )
}
