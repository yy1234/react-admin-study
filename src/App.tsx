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

const customerDetailPageTitle = {
  title: 'Customer details',
  description: 'Review customer profile and account status',
  actionLabel: 'Customers',
}

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/customers/')) {
    return customerDetailPageTitle
  }

  return pageTitles[pathname] ?? notFoundPageTitle
}

function App() {
  // useLocation 返回当前浏览器地址栏信息，pathname 是路径部分，不包含域名和查询参数。
  const { pathname } = useLocation()
  // 把当前路径翻译成 Header 需要显示的标题、描述和操作按钮文案。
  const currentPage = getPageTitle(pathname)

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
