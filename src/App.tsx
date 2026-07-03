import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Toaster } from './components/shadcn-ui/sonner'
import { ContentPage } from './pages/ContentPage'

type PageKey = 'dashboard' | 'customers' | 'orders'

const pageTitles: Record<
  PageKey,
  {
    title: string
    description: string
    actionLabel: string
  }
> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Overview of your workspace',
    actionLabel: 'New customer',
  },
  customers: {
    title: 'Customers',
    description: 'Manage customer profiles and contact information',
    actionLabel: 'Add customer',
  },
  orders: {
    title: 'Orders',
    description: 'Track open orders and recent transactions',
    actionLabel: 'Create order',
  },
}

function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const currentPage = pageTitles[activePage]

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            title={currentPage.title}
            description={currentPage.description}
            actionLabel={currentPage.actionLabel}
          />

          <ContentPage activePage={activePage} />
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
