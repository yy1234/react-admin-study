import { StatCard } from '../components/dashboard/StatCard'
import { CustomerSearch } from '../components/customers/CustomerSearch'
import { Card } from '../components/ui/Card'

type PageKey = 'dashboard' | 'customers' | 'orders'

type ContentPageProps = {
  activePage: PageKey
}

const pageContent: Record<
  PageKey,
  {
    heading: string
    description: string
    cards: Array<{
      label: string
      value: string
    }>
  }
> = {
  dashboard: {
    heading: 'Welcome back',
    description: 'Review the most important numbers across your workspace.',
    cards: [
      { label: 'Customers', value: '1,248' },
      { label: 'Open orders', value: '86' },
      { label: 'Revenue', value: '$42,680' },
    ],
  },
  customers: {
    heading: 'Customer overview',
    description: 'Track active customers, new signups, and accounts needing attention.',
    cards: [
      { label: 'Active customers', value: '1,024' },
      { label: 'New this week', value: '38' },
      { label: 'Needs follow-up', value: '12' },
    ],
  },
  orders: {
    heading: 'Order activity',
    description: 'Monitor order volume, fulfillment status, and delayed shipments.',
    cards: [
      { label: 'Processing', value: '42' },
      { label: 'Shipped today', value: '128' },
      { label: 'Delayed', value: '6' },
    ],
  },
}

export function ContentPage({ activePage }: ContentPageProps) {
  const content = pageContent[activePage]

  return (
    <main className="flex-1 p-6">
      <Card>
        <h2 className="text-lg font-semibold">{content.heading}</h2>
        <p className="mt-2 text-sm text-slate-500">{content.description}</p>
      </Card>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {content.cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
          />
        ))}
      </section>

      {activePage === 'customers' ? <CustomerSearch /> : null}
    </main>
  )
}
