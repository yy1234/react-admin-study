import { useState } from 'react'
import type { Customer, NewCustomerInput } from './types'
import { Button } from '@/components/shadcn-ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn-ui/dialog'
import { Input } from '@/components/shadcn-ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'

type CustomerFormProps = {
  onAddCustomer: (customer: NewCustomerInput) => void

}

type PreventableEvent = {
  preventDefault: () => void
}

// 接收父组件传入的 props，并从中解构出 onAddCustomer 回调函数。
export function CustomerForm({ onAddCustomer }: CustomerFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCustomerStatus, setNewCustomerStatus] =
    useState<Customer['status']>('active')

  const canAddCustomer =
    newCustomerName.trim() !== '' && newCustomerEmail.trim() !== ''

  function handleSubmit(event: PreventableEvent) {
    event.preventDefault()

    const name = newCustomerName.trim()
    const email = newCustomerEmail.trim()

    if (name === '' || email === '') {
      return
    }

    onAddCustomer({
      name,
      email,
      status: newCustomerStatus,
    })

    setNewCustomerName('')
    setNewCustomerEmail('')
    setNewCustomerStatus('active')
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="mb-6">Add customer</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add customer</DialogTitle>
            <DialogDescription>
              Create a customer in the local list.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
            <Input
              placeholder="Customer name"
              value={newCustomerName}
              onChange={(event) => setNewCustomerName(event.target.value)}
            />

            <Input
              placeholder="Email"
              type="email"
              value={newCustomerEmail}
              onChange={(event) => setNewCustomerEmail(event.target.value)}
            />

            <Select
              value={newCustomerStatus}
              onValueChange={(value) =>
                setNewCustomerStatus(value as Customer['status'])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canAddCustomer}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
