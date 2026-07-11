import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { getCustomer } from '../components/customers/customerApi'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Button } from '../components/shadcn-ui/button'

export function CustomerDetailPage() {
  const { customerId = '' } = useParams<{ customerId: string }>()
  const customerQuery = useQuery({
    queryKey: ['customers', 'detail', customerId],
    queryFn: () => getCustomer(customerId),
    enabled: customerId !== '',
  })

  if (customerId === '') {
    return (
      <main className="flex-1 p-6">
        <Card>
          <p className="text-sm text-destructive">
            The customer id is missing from the URL.
          </p>
        </Card>
      </main>
    )
  }

  if (customerQuery.isPending) {
    return (
      <main className="flex-1 p-6">
        <Card>
          <p className="text-sm text-muted-foreground">
            Loading customer details...
          </p>
        </Card>
      </main>
    )
  }

  if (customerQuery.isError) {
    return (
      <main className="flex-1 p-6">
        <Button asChild size="sm" variant="ghost">
          <Link to="/customers">
            <ArrowLeft />
            Back to customers
          </Link>
        </Button>

        <Card className="mt-4">
          <h2 className="text-base font-semibold">Customer not found</h2>
          <p className="mt-2 text-sm text-destructive">
            {customerQuery.error instanceof Error
              ? customerQuery.error.message
              : 'Failed to load this customer.'}
          </p>
        </Card>
      </main>
    )
  }

  const customer = customerQuery.data

  return (
    <main className="flex-1 p-6">
      <Button asChild size="sm" variant="ghost">
        <Link to="/customers">
          <ArrowLeft />
          Back to customers
        </Link>
      </Button>

      <Card className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Customer profile</p>
            <h2 className="mt-1 text-xl font-semibold">{customer.name}</h2>
          </div>
          <Badge
            variant={customer.status === 'active' ? 'success' : 'muted'}
          >
            {customer.status}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Customer ID</dt>
            <dd className="mt-1 text-sm font-medium">{customer.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="mt-1 text-sm font-medium">{customer.email}</dd>
          </div>
        </dl>
      </Card>
    </main>
  )
}
