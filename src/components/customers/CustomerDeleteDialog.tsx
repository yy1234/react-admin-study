import type { Customer } from './types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/shadcn-ui/alert-dialog'
import { Button } from '@/components/shadcn-ui/button'
import { toast } from 'sonner'

type CustomerDeleteDialogProps = {
  customer: Customer
  onDeleteCustomer: (customerId: string) => Promise<void> | void
}

export function CustomerDeleteDialog({
  customer,
  onDeleteCustomer,
}: CustomerDeleteDialogProps) {
  async function handleDeleteCustomer() {
    try {
      await onDeleteCustomer(customer.id)
      toast.success('Customer deleted', {
        description: `${customer.name} has been removed from the list.`,
      })
    } catch (error) {
      toast.error('Delete failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Please try deleting this customer again.',
      })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete customer?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {customer.name} from the local customer list.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* 用户确认后，才真正调用父组件传进来的删除函数。 */}
          <AlertDialogAction
            variant="destructive"
            onClick={() => void handleDeleteCustomer()}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
