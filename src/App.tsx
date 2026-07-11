import { Outlet, useLocation } from 'react-router'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Toaster } from './components/shadcn-ui/sonner'

const pageTitles: Record<
  string,
  {
    title: string
    description: string
    actionLabel: string
  }
> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your workspace',
    actionLabel: 'New customer',
  },
  '/customers': {
    title: 'Customers',
    description: 'Manage customer profiles and contact information',
    actionLabel: 'Add customer',
  },
  '/orders': {
    title: 'Orders',
    description: 'Track open orders and recent transactions',
    actionLabel: 'Create order',
  },
}

const notFoundPageTitle = {
  title: 'Page not found',
  description: 'The requested page does not exist',
  actionLabel: 'React Admin',
}

function App() {
  const { pathname } = useLocation()
  const currentPage = pageTitles[pathname] ?? notFoundPageTitle

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            title={currentPage.title}
            description={currentPage.description}
            actionLabel={currentPage.actionLabel}
          />

          <Outlet />
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
