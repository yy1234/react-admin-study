import { useEffect, useState, type ComponentProps } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/shadcn-ui/field'
import { Input } from '@/components/shadcn-ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'
/**
 *- react-hook-form：替你管字段值、错误、提交、重置
  - zod：替你描述校验规则
  - @hookform/resolvers：把 zod 校验接进表单
 * **/
type CustomerFormProps = {
  customer?: Customer
  triggerLabel?: string
  triggerClassName?: string
  triggerDisabled?: boolean
  triggerSize?: ComponentProps<typeof Button>['size']
  triggerVariant?: ComponentProps<typeof Button>['variant']
  onSaveCustomer: (customer: NewCustomerInput) => Promise<void> | void
}
//负责描述字段规则
const customerFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  status: z.enum(['active', 'inactive']),
})

type CustomerFormInput = z.input<typeof customerFormSchema>
type CustomerFormValues = z.output<typeof customerFormSchema>

// 同一个表单组件同时支持新增和编辑：有 customer 就是编辑，没有 customer 就是新增。
export function CustomerForm({
  customer,
  triggerLabel,
  triggerClassName,
  triggerDisabled = false,
  triggerSize = 'default',
  triggerVariant = 'default',
  onSaveCustomer,
}: CustomerFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const isEditing = customer !== undefined
  const dialogTitle = isEditing ? 'Edit customer' : 'Add customer'
  const dialogDescription = isEditing
    ? 'Update this customer profile in the local list.'
    : 'Create a customer in the local list.'
  const submitLabel = isEditing ? 'Save' : 'Add'
  const submittingLabel = isEditing ? 'Saving...' : 'Adding...'
  const customerNameInputId = isEditing
    ? `customer-name-${customer.id}`
    : 'customer-name'
  const customerEmailInputId = isEditing
    ? `customer-email-${customer.id}`
    : 'customer-email'

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      status: customer?.status ?? 'active',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!isDialogOpen) {
      return
    }

    // 打开弹窗时重置默认值，避免编辑不同客户时残留上一次的输入。
    reset({
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      status: customer?.status ?? 'active',
    })
  }, [
    customer?.email,
    customer?.name,
    customer?.status,
    isDialogOpen,
    reset,
  ])

  async function handleValidSubmit(values: CustomerFormValues) {
    try {
      await onSaveCustomer(values)
    } catch (error) {
      // 后端返回的业务错误，通常用 setError 塞回具体字段。
      setError(
        'email',
        {
          type: 'server',
          message:
            error instanceof Error ? error.message : 'Failed to add customer.',
        },
        { shouldFocus: true },
      )
      return
    }

    reset()
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className={triggerClassName}
          disabled={triggerDisabled}
          size={triggerSize}
          variant={triggerVariant}
        >
          {triggerLabel ?? (isEditing ? 'Edit' : 'Add customer')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleValidSubmit)}
        >
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <FieldGroup className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor={customerNameInputId}>Name</FieldLabel>
              <Input
                id={customerNameInputId}
                aria-invalid={Boolean(errors.name)}
                placeholder="Customer name"
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor={customerEmailInputId}>Email</FieldLabel>
              <Input
                id={customerEmailInputId}
                aria-invalid={Boolean(errors.email)}
                placeholder="Email"
                type="email"
                {...register('email')}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.status)}>
              <FieldLabel>Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      aria-invalid={Boolean(errors.status)}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="inactive">inactive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
