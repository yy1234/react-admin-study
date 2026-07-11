import { Link } from 'react-router'
import { Card } from '../components/ui/Card'

export function NotFoundPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <p className="text-sm font-medium text-slate-500">404</p>
        <h2 className="mt-2 text-lg font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The page you requested does not exist.
        </p>
        <Link
          className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
          to="/dashboard"
        >
          Back to dashboard
        </Link>
      </Card>
    </main>
  )
}
