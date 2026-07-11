import { Navigate, createBrowserRouter } from 'react-router'
import App from './App'
import { CustomerDetailPage } from './pages/CustomerDetailPage'
import { ContentPage } from './pages/ContentPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/dashboard" />,
      },
      {
        path: 'dashboard',
        element: <ContentPage activePage="dashboard" />,
      },
      {
        path: 'customers',
        element: <ContentPage activePage="customers" />,
      },
      {
        path: 'customers/:customerId',
        element: <CustomerDetailPage />,
      },
      {
        path: 'orders',
        element: <ContentPage activePage="orders" />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
