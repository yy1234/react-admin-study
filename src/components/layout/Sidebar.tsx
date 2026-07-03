import { Button } from '../ui/Button'

type PageKey = 'dashboard' | 'customers' | 'orders'

type SidebarProps = {
  activePage: PageKey
  onPageChange: (page: PageKey) => void
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'customers', label: 'Customers' },
  { key: 'orders', label: 'Orders' },
] satisfies Array<{ key: PageKey; label: string }>

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white px-4 py-5">
      <div className="text-lg font-semibold">React Admin</div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.key}
            variant={item.key === activePage ? 'primary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onPageChange(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
