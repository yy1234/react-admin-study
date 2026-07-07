import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { NewCustomerInput } from './types'
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
  onAddCustomer: (customer: NewCustomerInput) => void
}
//负责描述字段规则
const customerFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  status: z.enum(['active', 'inactive']),
})

type CustomerFormInput = z.input<typeof customerFormSchema>
type CustomerFormValues = z.output<typeof customerFormSchema>

// 接收父组件传入的 props，并从中解构出 onAddCustomer 回调函数。
export function CustomerForm({ onAddCustomer }: CustomerFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'active',
    },
    mode: 'onChange',
  })

  function handleValidSubmit(values: CustomerFormValues) {
    onAddCustomer(values)

    reset()
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="mb-6">Add customer</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleValidSubmit)}
        >
          <DialogHeader>
            <DialogTitle>Add customer</DialogTitle>
            <DialogDescription>
              Create a customer in the local list.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="customer-name">Name</FieldLabel>
              <Input
                id="customer-name"
                aria-invalid={Boolean(errors.name)}
                placeholder="Customer name"
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="customer-email">Email</FieldLabel>
              <Input
                id="customer-email"
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
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
