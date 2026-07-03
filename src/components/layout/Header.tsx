import { Button } from '../ui/Button'

type HeaderProps = {
  title: string
  description: string
  actionLabel: string
}

export function Header({ title, description, actionLabel }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-base font-semibold">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <Button>{actionLabel}</Button>
    </header>
  )
}
