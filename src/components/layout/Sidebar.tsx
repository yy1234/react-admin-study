import { NavLink } from 'react-router'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white px-4 py-5">
      <div className="text-lg font-semibold">React Admin</div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              cn(
                'flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              )
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
