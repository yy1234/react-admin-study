# React Admin Study 教程笔记

这份文档记录当前 `react-admin-study` 项目的学习路径。目标不是罗列 React API，而是围绕一个能干活的后台模块，理解真实项目里常用的组件拆分、状态管理、组件库、表格和表单写法。

## 当前技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- react-hook-form
- zod
- @hookform/resolvers

常用验证命令：

```bash
pnpm lint
pnpm build
```

## 第一阶段：React 基础和后台骨架

这个阶段完成了一个后台应用的基本布局。

主要文件：

- `src/App.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/pages/ContentPage.tsx`
- `src/components/dashboard/StatCard.tsx`

核心概念：

- 组件就是可复用的 UI 单元。
- props 是父组件传给子组件的数据。
- `useState` 用来保存当前组件的状态。
- 状态变化后，React 会重新执行组件函数并刷新界面。

典型代码：

```tsx
const [activePage, setActivePage] = useState<PageKey>('dashboard')
```

`activePage` 是当前选中的页面。

`setActivePage` 的作用是修改页面状态。状态一变，依赖它的 UI 会跟着更新。

比如：

```tsx
<Sidebar activePage={activePage} onPageChange={setActivePage} />
```

这里把当前页面和修改页面的方法都传给了 `Sidebar`。

## 第二阶段：客户模块和父子通信

这个阶段开始做客户列表。

主要文件：

- `src/components/customers/CustomerSearch.tsx`
- `src/components/customers/CustomerForm.tsx`
- `src/components/customers/CustomerToolbar.tsx`
- `src/components/customers/CustomerTable.tsx`
- `src/components/customers/customerData.ts`
- `src/components/customers/types.ts`

核心概念：

- 父组件管理数据。
- 子组件负责展示或触发事件。
- 子组件通过 callback props 通知父组件。

典型类型：

```ts
export type Customer = {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
}

export type NewCustomerInput = Pick<Customer, 'name' | 'email' | 'status'>
```

`Pick<Customer, 'name' | 'email' | 'status'>` 的意思是从 `Customer` 类型里挑出几个字段，组成新类型。

典型 props：

```ts
type CustomerFormProps = {
  onAddCustomer: (customer: NewCustomerInput) => void
}
```

意思是：`CustomerForm` 需要父组件传进来一个 `onAddCustomer` 函数。

函数签名：

```ts
(customer: NewCustomerInput) => void
```

表示这个函数接收一个新客户对象，不返回值。

组件参数：

```tsx
export function CustomerForm({ onAddCustomer }: CustomerFormProps) {
  ...
}
```

这是解构。意思是从 props 对象里取出 `onAddCustomer`。

等价于：

```tsx
export function CustomerForm(props: CustomerFormProps) {
  const onAddCustomer = props.onAddCustomer
}
```

## 第三阶段：抽自定义 Hook

这个阶段把客户模块的状态和业务逻辑抽到了自定义 Hook。

主要文件：

- `src/components/customers/useCustomers.ts`

现在客户模块的数据流是：

```txt
customerList
  -> filteredCustomers
  -> sortedCustomers
  -> pagedCustomers
  -> CustomerTable
```

核心概念：

- 自定义 Hook 本质上是一个普通函数。
- 它可以调用 React Hook。
- 它用于复用和集中管理状态逻辑。

典型代码：

```ts
export function useCustomers() {
  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>('all')

  ...

  return {
    searchText,
    statusFilter,
    filteredCustomers,
    setSearchText,
    setStatusFilter,
  }
}
```

调用方：

```tsx
const {
  searchText,
  statusFilter,
  filteredCustomers,
  setSearchText,
  setStatusFilter,
} = useCustomers()
```

## 第四阶段：Tailwind 和 shadcn/ui

这个阶段开始使用 shadcn/ui，把手写 UI 逐步替换成组件库组合。

主要文件：

- `src/components/shadcn-ui/button.tsx`
- `src/components/shadcn-ui/dialog.tsx`
- `src/components/shadcn-ui/alert-dialog.tsx`
- `src/components/shadcn-ui/table.tsx`
- `src/components/shadcn-ui/pagination.tsx`
- `src/components/shadcn-ui/sonner.tsx`

### Tailwind

Tailwind 是原子化 CSS。

比如：

```tsx
<div className="flex h-screen items-center justify-center bg-background" />
```

这些 class 不是随便写的字符串，而是 Tailwind 提供的样式工具：

- `flex`：display flex
- `h-screen`：高度等于屏幕高度
- `items-center`：交叉轴居中
- `justify-center`：主轴居中
- `bg-background`：背景色使用主题变量

### shadcn/ui

shadcn/ui 不是传统 npm 黑盒组件库。它是把组件源码生成到项目里。

它适合：

- Tailwind 项目
- 需要高度自定义的后台
- 想理解组件组合方式的 React 学习项目

和 Ant Design 的区别：

```txt
Ant Design = 完整业务组件库，开箱即用
shadcn/ui = 基础组件源码 + 组合方式，自定义能力强
```

项目最好确定一个主 UI 体系。当前项目主体系是：

```txt
Tailwind + shadcn/ui
```

## 第五阶段：企业级表格基础

这个阶段围绕客户列表实现了真实后台常见能力：

- 搜索
- 筛选
- 排序
- 分页
- 页码按钮
- 删除确认
- 表格组件拆分
- 列配置

主要文件：

- `src/components/customers/CustomerTable.tsx`
- `src/components/customers/CustomerPagination.tsx`
- `src/components/customers/CustomerDeleteDialog.tsx`
- `src/components/customers/useCustomers.ts`

### 搜索和筛选

搜索和筛选属于派生数据。

原始数据是：

```ts
customerList
```

派生出来的是：

```ts
filteredCustomers
```

典型写法：

```ts
const filteredCustomers = useMemo(() => {
  const keyword = searchText.toLowerCase()

  return customerList.filter((customer) => {
    const matchesKeyword =
      customer.name.toLowerCase().includes(keyword) ||
      customer.email.toLowerCase().includes(keyword)

    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter

    return matchesKeyword && matchesStatus
  })
}, [customerList, searchText, statusFilter])
```

### 排序

排序状态：

```ts
const [sortField, setSortField] = useState<CustomerSortField | null>(null)
const [sortDirection, setSortDirection] =
  useState<CustomerSortDirection>('asc')
```

排序字段类型：

```ts
export type CustomerSortField = 'name' | 'email' | 'status'
export type CustomerSortDirection = 'asc' | 'desc'
```

动态取字段：

```ts
firstCustomer[sortField].localeCompare(secondCustomer[sortField])
```

因为 `sortField` 的类型限制为：

```ts
'name' | 'email' | 'status'
```

所以 TypeScript 知道它只能访问 `Customer` 上存在的字段。

排序时要复制数组：

```ts
return [...filteredCustomers].sort(...)
```

原因是 `sort()` 会修改原数组。React 中要避免直接修改已有数据。

### 分页

分页状态：

```ts
const [currentPage, setCurrentPage] = useState(1)
const pageSize = 2
```

分页派生数据：

```ts
const totalPageCount = Math.max(1, Math.ceil(sortedCustomers.length / pageSize))
const safeCurrentPage = Math.min(currentPage, totalPageCount)

const startIndex = (safeCurrentPage - 1) * pageSize
const endIndex = startIndex + pageSize

return sortedCustomers.slice(startIndex, endIndex)
```

`slice()` 不会修改原数组，适合 React 派生数据。

完整链路：

```txt
原始客户列表 customerList
  -> 搜索/筛选 filteredCustomers
  -> 排序 sortedCustomers
  -> 计算总页数 totalPageCount
  -> 计算安全页码 safeCurrentPage
  -> slice 当前页 pagedCustomers
  -> CustomerTable 展示当前页
```

点击分页按钮时，真正改变的是 `currentPage`：

```ts
function changePage(nextPage: number) {
  const safePage = Math.min(Math.max(nextPage, 1), totalPageCount)

  setCurrentPage(safePage)
}
```

`changePage` 不直接改表格数据。它只改页码状态。

页码变化后，React 重新渲染，下面这段重新计算：

```ts
const safeCurrentPage = Math.min(currentPage, totalPageCount)

const pagedCustomers = useMemo(() => {
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  return sortedCustomers.slice(startIndex, endIndex)
}, [pageSize, safeCurrentPage, sortedCustomers])
```

所以数据变化链路是：

```txt
setCurrentPage(2)
  -> currentPage 变化
  -> safeCurrentPage 重新计算
  -> pagedCustomers 重新计算
  -> 表格收到新的当前页数据
```

`currentPage` 可以理解成“用户想去的页”，`safeCurrentPage` 是“系统确认后真正展示的页”。

例如：

```txt
currentPage = 5
totalPageCount = 3
safeCurrentPage = min(5, 3) = 3
```

这样即使数据变少，也不会展示一个不存在的第 5 页。

### useMemo

`useMemo` 用来缓存计算结果：

```ts
const result = useMemo(() => {
  return computeValue()
}, [dependencies])
```

意思是：

```txt
依赖没变 -> 继续用上一次的 result
依赖变了 -> 重新执行计算
```

在当前项目里：

```txt
customerList + searchText + statusFilter
  -> filteredCustomers

filteredCustomers + sortField + sortDirection
  -> sortedCustomers

sortedCustomers + safeCurrentPage + pageSize
  -> pagedCustomers
```

这些都是“根据已有状态算出来的数据”，所以适合用 `useMemo`。

注意区分：

```txt
useState 保存业务状态
useMemo 缓存派生计算结果
```

### map 和 key

列表渲染：

```tsx
{customers.map((customer) => (
  <TableRow key={customer.id}>
    ...
  </TableRow>
))}
```

`map` 的作用是把数组渲染成一组 JSX。

`key` 的作用是帮助 React 稳定识别每一项。

推荐：

```tsx
key={customer.id}
```

不推荐：

```tsx
key={index}
```

除非列表是固定静态列表，不会排序、删除、插入。

如果 `title` 或 `label` 可能重复，不要用它做 key。更稳的方式是给配置加一个稳定 id：

```ts
const customerColumns = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
]
```

渲染：

```tsx
{customerColumns.map((column) => (
  <TableHead key={column.id}>{column.label}</TableHead>
))}
```

显示文本是给用户看的，`id/key` 是给程序和 React 用的。

### 删除确认

删除确认被拆成独立组件：

```tsx
<CustomerDeleteDialog
  customer={customer}
  onDeleteCustomer={onDeleteCustomer}
/>
```

主要文件：

- `src/components/customers/CustomerDeleteDialog.tsx`

它负责：

- 渲染 Delete 按钮
- 打开确认弹窗
- 用户确认后调用删除函数
- 删除成功后 toast 提示

表格组件只负责展示行，删除组件负责删除交互。

## 第六阶段：表单进阶

当前状态：已完成。

这个阶段把 `CustomerForm` 从手写 `useState` 表单升级成：

```txt
react-hook-form + zod + @hookform/resolvers + shadcn Field + 新增/编辑复用
```

主要文件：

- `src/components/customers/CustomerForm.tsx`
- `src/components/customers/CustomerSearch.tsx`
- `src/components/customers/CustomerTable.tsx`
- `src/components/customers/useCustomers.ts`
- `src/components/shadcn-ui/field.tsx`
- `src/components/shadcn-ui/label.tsx`
- `src/components/shadcn-ui/separator.tsx`

### 三个库的分工

```txt
react-hook-form      管表单状态
zod                  管校验规则和类型
@hookform/resolvers  把 zod 接进 react-hook-form
```

以前要手写：

```tsx
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [status, setStatus] = useState('active')
```

现在变成：

```ts
const {
  register,
  handleSubmit,
  control,
  reset,
  formState: { errors, isValid, isSubmitting },
} = useForm(...)
```

### zod schema

```ts
const customerFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  status: z.enum(['active', 'inactive']),
})
```

它描述这个表单数据必须满足的规则：

- `name` 是字符串，去掉前后空格后不能为空
- `email` 必须是邮箱
- `status` 只能是 `active` 或 `inactive`

### input 和 output 类型

```ts
type CustomerFormInput = z.input<typeof customerFormSchema>
type CustomerFormValues = z.output<typeof customerFormSchema>
```

含义：

```txt
z.input  = 进入 schema 前的数据类型
z.output = 经过 zod 校验/处理后的数据类型
```

在当前表单里，它们看起来差不多：

```ts
{
  name: string
  email: string
  status: 'active' | 'inactive'
}
```

但 `name` 有 `trim()`，所以用户输入：

```txt
"   Jack   "
```

通过 zod 后会变成：

```txt
"Jack"
```

如果以后 schema 使用 `transform()`，input 和 output 可能完全不同。

例如：

```ts
const schema = z.string().transform((value) => value.length)

type Input = z.input<typeof schema>   // string
type Output = z.output<typeof schema> // number
```

### useForm 返回值

`useForm()` 会返回一个表单工具箱。

当前使用的是：

```ts
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
```

这些工具的作用：

- `register`：绑定普通 input
- `handleSubmit`：提交前先校验，成功后才调用提交函数
- `control`：给复杂受控组件使用
- `reset`：重置表单
- `errors`：字段错误信息
- `isValid`：整个表单是否有效
- `isSubmitting`：是否正在提交

普通输入框：

```tsx
<Input {...register('name')} />
```

复杂组件，比如 shadcn `Select`：

```tsx
<Controller
  control={control}
  name="status"
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      ...
    </Select>
  )}
/>
```

为什么 `Select` 要用 `Controller`？

因为它不是原生 input，不能直接用 `register()`。`Controller` 是 react-hook-form 接入第三方受控组件的标准方式。

### data-invalid 和 aria-invalid

当前表单里有：

```tsx
<Field data-invalid={Boolean(errors.name)}>
```

还有：

```tsx
<Input aria-invalid={Boolean(errors.name)} />
```

区别：

```txt
data-invalid  给 shadcn/Tailwind 做样式状态
aria-invalid  给浏览器辅助能力和无障碍语义
```

完整链路：

```txt
zod 校验失败
  -> react-hook-form 生成 errors.name
  -> data-invalid=true
  -> Field 变成错误样式
  -> aria-invalid=true
  -> Input 有错误语义和错误样式
  -> FieldError 显示错误文案
```

错误显示：

```tsx
<FieldError errors={[errors.name]} />
```

## 第六阶段：表单提交流程

这一节补齐真实项目里最常见的一段链路：

```txt
用户点击提交
  -> handleSubmit 先拦截表单默认提交
  -> zodResolver 做字段校验
  -> 校验通过后调用 handleValidSubmit
  -> handleValidSubmit 等待 onSaveCustomer
  -> 成功：reset + 关闭弹窗
  -> 失败：setError 把服务端错误显示到字段上
```

当前 `CustomerForm` 里这一行很关键：

```tsx
onSubmit={handleSubmit(handleValidSubmit)}
```

不要直接写成：

```tsx
onSubmit={handleValidSubmit}
```

原因是 `handleValidSubmit` 只应该接收“校验通过后的字段值”。

`handleSubmit` 帮我们做了几件事：

- 阻止浏览器默认提交刷新页面
- 收集表单字段值
- 调用 zodResolver 校验
- 校验通过才调用 `handleValidSubmit(values)`
- 校验失败时自动更新 `errors`
- 在异步提交期间维护 `isSubmitting`

### isSubmitting

`isSubmitting` 来自 `useForm`：

```tsx
formState: { errors, isValid, isSubmitting }
```

只要 `handleValidSubmit` 是 async，并且里面 await 了异步逻辑，`react-hook-form` 就能知道当前正在提交。

项目里现在这样用：

```tsx
<Button type="submit" disabled={!isValid || isSubmitting}>
  {isSubmitting ? 'Adding...' : 'Add'}
</Button>
```

作用：

- 表单不合法时不能提交
- 正在提交时不能重复点
- 提交中按钮文案变成 `Adding...`

### setError

`zod` 适合做前端自己能判断的校验，比如：

- 必填
- 邮箱格式
- 字符长度
- 枚举值是否合法

但有些错误必须问服务端或数据层，比如：

- 邮箱是否已经存在
- 用户名是否被占用
- 权限是否允许当前操作
- 库存是否足够

所以重复邮箱没有写进 zod schema，而是写在 `useCustomers` 的 `addCustomer` 里模拟服务端检查。

失败时，`CustomerForm` 用 `setError` 把错误塞回字段：

```tsx
setError(
  'email',
  {
    type: 'server',
    message: 'This email already exists.',
  },
  { shouldFocus: true },
)
```

这段代码的意思是：

```txt
email 字段出错了
错误类型是 server
错误文案显示在 email 下面
并且自动聚焦到 email 输入框
```

### 当前职责边界

`CustomerForm` 负责：

- 表单字段状态
- 表单校验错误展示
- 提交中按钮状态
- 成功后关闭弹窗
- 失败后显示字段错误

`useCustomers` 负责：

- 客户列表数据
- 新增客户
- 删除客户
- 修改客户状态
- 搜索、筛选、排序、分页
- 模拟后端重复邮箱检查

这个边界很重要：表单组件不要知道客户列表内部怎么维护，它只调用 `onSaveCustomer(values)`。

## 第六阶段：新增和编辑复用同一个表单

后台项目里很常见的一种写法是：

```txt
同一套表单
  -> 新增数据
  -> 编辑数据
```

如果新增写一个 `AddCustomerForm`，编辑再写一个 `EditCustomerForm`，字段、校验、错误显示、提交 loading 都会重复。

所以当前项目把 `CustomerForm` 做成复用组件：

```tsx
type CustomerFormProps = {
  customer?: Customer
  onSaveCustomer: (customer: NewCustomerInput) => Promise<void> | void
}
```

这里的关键是：

```txt
customer?: Customer
```

`?` 表示这个 prop 可传可不传：

- 不传 `customer`：新增模式
- 传入 `customer`：编辑模式

代码里用它判断当前模式：

```ts
const isEditing = customer !== undefined
```

然后根据模式决定弹窗文案：

```ts
const dialogTitle = isEditing ? 'Edit customer' : 'Add customer'
const submitLabel = isEditing ? 'Save' : 'Add'
```

### 新增入口

新增客户时，顶部按钮这样使用：

```tsx
<CustomerForm
  triggerClassName="mb-6"
  onSaveCustomer={addCustomer}
/>
```

它没有传 `customer`，所以是新增模式。

### 编辑入口

表格行里这样使用：

```tsx
<CustomerForm
  customer={customer}
  triggerLabel="Edit"
  triggerSize="sm"
  triggerVariant="outline"
  onSaveCustomer={(customerInput) =>
    onUpdateCustomer(customer.id, customerInput)
  }
/>
```

它传了当前行的 `customer`，所以是编辑模式。

这里的回调值得看：

```tsx
onSaveCustomer={(customerInput) =>
  onUpdateCustomer(customer.id, customerInput)
}
```

表单自己只知道字段值：

```txt
name
email
status
```

但编辑某一行时，还需要知道要更新哪条数据，所以表格组件把 `customer.id` 一起带上。

### 为什么打开弹窗时要 reset

编辑模式里，表单默认值来自当前客户：

```ts
reset({
  name: customer?.name ?? '',
  email: customer?.email ?? '',
  status: customer?.status ?? 'active',
})
```

它放在 `useEffect` 里：

```ts
useEffect(() => {
  if (!isDialogOpen) {
    return
  }

  reset(...)
}, [...])
```

原因是：同一个表单组件可能先编辑 A 客户，再编辑 B 客户。打开弹窗时重置一次，可以避免残留上一次输入。

### 新增和编辑的数据层

`useCustomers` 现在有两个保存函数：

```ts
addCustomer(customerInput)
updateCustomer(customerId, customerInput)
```

它们都做了三件事：

- 模拟接口耗时
- 检查邮箱是否重复
- 成功后更新客户列表

区别是：

- 新增：生成一个新 id，插入列表顶部
- 编辑：根据 `customerId` 找到原客户，再合并新字段

编辑时检查重复邮箱要排除自己：

```ts
customer.id !== customerId &&
customer.email.toLowerCase() === normalizedEmail
```

否则你不改邮箱，只改名字，也会被误判成“邮箱重复”。

## 第七阶段：数据请求

当前状态：已完成。

这一阶段把客户模块从“直接操作本地数组”升级成“通过 API 层操作数据”。

这里用的是本地 mock API，不是真实服务器，但调用方式故意设计成真实项目里的样子：

```txt
组件/Hook
  -> customerApi.ts
  -> Promise
  -> loading/error/data
  -> 更新页面
```

主要文件：

- `src/components/customers/customerApi.ts`
- `src/components/customers/useCustomers.ts`
- `src/components/customers/CustomerSearch.tsx`
- `src/components/customers/CustomerTable.tsx`
- `src/components/customers/CustomerDeleteDialog.tsx`

### 为什么要加 customerApi.ts

以前 `useCustomers` 直接持有初始数据：

```ts
const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers)
```

这适合学习 `useState`，但不接近真实项目。

真实项目通常是：

```txt
页面组件
  -> 调用 Hook
  -> Hook 调用 API 模块
  -> API 模块请求后端
  -> Hook 更新状态
  -> 页面重新渲染
```

所以现在新增了：

```ts
customerApi.ts
```

里面提供这些方法：

```ts
listCustomers()
createCustomer(customerInput)
updateCustomer(customerId, customerInput)
deleteCustomer(customerId)
toggleCustomerStatus(customerId)
```

这些方法全部返回 `Promise`。

当前是 mock：

```ts
await waitForRequest()
```

以后接真实接口时，可以替换成：

```ts
await fetch('/api/customers')
```

组件层不需要知道底层到底是 mock、fetch、axios，还是后面要学的 TanStack Query。

### useEffect 做初次加载

客户列表现在初始是空数组：

```ts
const [customerList, setCustomerList] = useState<Customer[]>([])
const [isLoading, setIsLoading] = useState(true)
const [errorMessage, setErrorMessage] = useState<string | null>(null)
```

组件第一次显示后，会发起列表请求：

```ts
const loadCustomers = useCallback(async () => {
  if (!isMountedRef.current) {
    return
  }

  setIsLoading(true)
  setErrorMessage(null)

  try {
    const customers = await listCustomers()

    if (!isMountedRef.current) {
      return
    }

    setCustomerList(customers)
    setCurrentPage(1)
  } finally {
    if (isMountedRef.current) {
      setIsLoading(false)
    }
  }
}, [])

useEffect(() => {
  queueMicrotask(() => {
    void loadCustomers()
  })
}, [loadCustomers])
```

这里有两个关键点。

第一，`useEffect` 适合处理“组件显示以后要同步外部系统”的事情，比如请求接口。

第二，初次加载和 Retry 都复用同一个 `loadCustomers`，避免写两套请求逻辑。

真实项目里更常见的是用 `AbortController` 取消 fetch 请求。当前阶段先用布尔标记，概念更容易看清楚。

### useCallback

`useCallback` 用来缓存函数引用：

```ts
const loadCustomers = useCallback(async () => {
  ...
}, [])
```

普通函数在组件每次重新渲染时都会重新创建：

```txt
组件重新渲染
  -> 重新执行 useCustomers()
  -> 重新创建 loadCustomers 函数
```

如果这个函数被放进 `useEffect` 依赖数组：

```ts
useEffect(() => {
  queueMicrotask(() => {
    void loadCustomers()
  })
}, [loadCustomers])
```

函数引用每次都变，就可能导致 effect 反复执行。

`useCallback(..., [])` 的意思是：

```txt
依赖没变 -> 继续复用上一次的函数
依赖变了 -> 创建新函数
```

这里依赖数组是空数组：

```ts
[]
```

表示 `loadCustomers` 不依赖会变化的外部值，所以它的函数引用保持稳定。

一句话：

```txt
useMemo 缓存计算结果
useCallback 缓存函数本身
```

`useCallback(fn, deps)` 可以粗略理解成：

```ts
useMemo(() => fn, deps)
```

只是 `useCallback` 专门用来表达“我要缓存函数”。

### useEffect 依赖数组

`setState` 会导致组件重新渲染，但不会让所有 `useEffect` 都重新执行。

`useEffect` 是否执行，取决于依赖数组。

没有依赖数组：

```ts
useEffect(() => {
  ...
})
```

每次重新渲染后都会执行。

空依赖数组：

```ts
useEffect(() => {
  ...
}, [])
```

只在组件挂载后执行一次。

有依赖数组：

```ts
useEffect(() => {
  ...
}, [searchText])
```

只有 `searchText` 变化后才执行。

当前项目里：

```ts
useEffect(() => {
  queueMicrotask(() => {
    void loadCustomers()
  })
}, [loadCustomers])
```

因为 `loadCustomers` 被 `useCallback(..., [])` 缓存，引用稳定，所以普通的 `setState` 不会导致它重复请求客户列表。

### 多个 useEffect 怎么判断

不是一个组件只能写一个 `useEffect`。实际项目里多个 `useEffect` 很常见。

判断原则是：

```txt
一个 useEffect 处理一类副作用
```

例如：

```ts
useEffect(() => {
  // 请求列表数据
}, [])

useEffect(() => {
  // 监听窗口尺寸变化
}, [])

useEffect(() => {
  // 同步 document.title
}, [title])
```

这三个 effect 分别做三件事，拆开是合理的。

但如果两个 effect 都围绕同一件事，比如都是客户列表加载，就要小心。

这会让读代码的人产生疑问：

```txt
为什么这里有两个？
是不是请求了两次？
是不是有顺序依赖？
```

所以一般规则是：

```txt
职责明显不同 -> 拆开
属于同一个流程 -> 合并或抽成同一个函数
```

当前代码里：

```txt
effect A：维护 isMountedRef 的挂载/卸载状态
effect B：组件挂载后触发 loadCustomers
```

它们职责不同，但都服务于请求生命周期。后续如果想进一步简化，也可以合并成一个 effect；当前为了教学上看清“生命周期标记”和“初次加载”两个概念，先拆开保留。

### 为什么要 isMountedRef

`loadCustomers` 会暴露给页面上的 Retry 按钮：

```ts
return {
  loadCustomers,
  ...
}
```

这时它不只会被 `useEffect` 调用，也会被用户点击触发。

如果用户点击 Retry 后立刻切换页面，请求回来时组件可能已经卸载。为了避免这种异步请求回来后继续 setState，`useCustomers` 里用了 hook 级别的 ref：

```ts
const isMountedRef = useRef(true)

useEffect(() => {
  isMountedRef.current = true

  return () => {
    isMountedRef.current = false
  }
}, [])
```

然后所有异步请求在 `await` 之后都先判断：

```ts
if (!isMountedRef.current) {
  return
}
```

这个保护不只用在 `loadCustomers`，也用在：

- `addCustomer`
- `updateCustomer`
- `deleteCustomer`
- `toggleCustomerStatus`

因为它们都是：

```txt
发起异步请求
  -> 等待返回
  -> 更新 React state
```

只要有 `await` 后再 `setState`，就要考虑组件是否还存在。

### loading/error/data 三种状态

数据请求页面至少要考虑三种状态：

```txt
loading  请求中
error    请求失败
data     请求成功，有数据或空数据
```

当前页面：

```tsx
{isLoading ? <div>Loading customers...</div> : null}

{errorMessage !== null ? (
  <div>
    <p>{errorMessage}</p>
    <Button onClick={() => void loadCustomers()}>Retry</Button>
  </div>
) : null}
```

列表为空则由表格显示：

```txt
No customers found.
```

这就是后台列表页最基础的状态模型。

### Retry 为什么单独暴露 loadCustomers

`useCustomers` 返回了：

```ts
loadCustomers
```

页面里这样用：

```tsx
<Button onClick={() => void loadCustomers()}>
  Retry
</Button>
```

意思是：请求失败后，用户可以手动重新拉取列表。

这里的 `void` 不是“不执行”，而是告诉 TypeScript/ESLint：这个点击事件里我知道它返回 Promise，但我不在这里 await。

### 新增、编辑、删除、切换状态都变成请求

新增：

```ts
async function addCustomer(customerInput: NewCustomerInput) {
  const nextCustomer = await createCustomer(customerInput)

  setCustomerList((currentCustomers) => [
    nextCustomer,
    ...currentCustomers,
  ])
}
```

编辑：

```ts
async function updateCustomer(customerId: string, customerInput: NewCustomerInput) {
  const updatedCustomer = await updateCustomerRequest(customerId, customerInput)

  setCustomerList((currentCustomers) =>
    currentCustomers.map((customer) =>
      customer.id === customerId ? updatedCustomer : customer,
    ),
  )
}
```

删除：

```ts
async function deleteCustomer(customerId: string) {
  await deleteCustomerRequest(customerId)

  setCustomerList((currentCustomers) =>
    currentCustomers.filter((customer) => customer.id !== customerId),
  )
}
```

切换状态：

```ts
async function toggleCustomerStatus(customerId: string) {
  const updatedCustomer = await toggleCustomerStatusRequest(customerId)

  setCustomerList((currentCustomers) =>
    currentCustomers.map((customer) =>
      customer.id === customerId ? updatedCustomer : customer,
    ),
  )
}
```

注意这个顺序：

```txt
先 await API 成功
再更新本地 UI
```

这叫保守更新。

下一阶段学 TanStack Query 时，会接触另一个概念：

```txt
先更新 UI
失败再回滚
```

那个叫乐观更新。

### API 错误怎么回到页面

当前项目里，错误展示分三类：

```txt
页面级错误 -> errorMessage + Retry
字段级错误 -> setError
操作级错误 -> toast
```

### 页面级错误

列表加载失败属于页面级错误。

`useCustomers` 里请求列表：

```ts
try {
  const customers = await listCustomers()

  setCustomerList(customers)
  setCurrentPage(1)
} catch (error) {
  setErrorMessage(
    error instanceof Error ? error.message : 'Failed to load customers.',
  )
}
```

如果 `listCustomers()` 报错，就会把错误信息存进：

```ts
errorMessage
```

然后 `useCustomers` 把它返回给页面：

```ts
return {
  errorMessage,
  loadCustomers,
  ...
}
```

`CustomerSearch` 拿到后渲染错误区域：

```tsx
{errorMessage !== null ? (
  <div>
    <p>{errorMessage}</p>
    <Button onClick={() => void loadCustomers()}>
      Retry
    </Button>
  </div>
) : null}
```

链路是：

```txt
listCustomers 报错
  -> catch
  -> setErrorMessage(...)
  -> useCustomers 重新渲染
  -> CustomerSearch 拿到 errorMessage
  -> 页面显示错误文本和 Retry 按钮
```

### 字段级错误

新增或编辑客户时，邮箱重复属于字段级错误。

API 抛错：

```ts
throw new Error('This email already exists.')
```

`CustomerForm` 会 catch 到这个错误，然后：

```ts
setError('email', ...)
```

所以重复邮箱会显示在 email 字段下面。

完整链路是：

```txt
createCustomer/updateCustomer 报错
  -> CustomerForm catch
  -> setError('email', ...)
  -> errors.email 有值
  -> FieldError 显示到 email 输入框下面
```

### 操作级错误

删除和切换状态没有表单字段，所以失败时用 toast：

```ts
toast.error('Delete failed', ...)
toast.error('Status update failed', ...)
```

完整链路是：

```txt
deleteCustomer/toggleCustomerStatus 报错
  -> 调用方 catch
  -> toast.error(...)
  -> 右上角显示错误提示
```

## 当前项目能力

当前这个学习项目已经覆盖：

- React 组件
- props
- useState
- useMemo
- 自定义 Hook
- 父子组件通信
- callback props
- Tailwind 样式
- shadcn/ui 组件组合
- Dialog
- AlertDialog
- Toast
- Table
- Pagination
- 搜索
- 筛选
- 排序
- 分页
- map/key
- 表单状态管理
- zod 校验
- Controller 接入复杂组件
- handleSubmit 提交流程
- isSubmitting 提交中状态
- setError 服务端错误回填
- 新增和编辑复用同一个表单
- API 分层
- useEffect 初次加载数据
- loading/error/empty 状态
- Retry 重新请求
- 异步新增、编辑、删除、更新状态

## 还没完成的后续阶段

接下来建议继续：

1. TanStack Query
   - query
   - mutation
   - 缓存
   - 乐观更新
   - 失败回滚

2. React Router
   - 列表页
   - 详情页
   - 编辑页
   - URL 参数
   - query 参数

3. TanStack Table
   - 列定义
   - 排序
   - 筛选
   - 分页
   - 行选择
   - 批量操作

4. 登录和权限
   - token
   - 路由守卫
   - 用户信息
   - 按权限显示菜单和按钮

5. 工程化
   - API 分层
   - 类型分层
   - 环境变量
   - 错误处理
   - 构建部署

## 阅读 chat-langchain/frontend 的建议

你现在已经可以阅读 `/Volumes/data_apfs/self_project/AI/langchin/external/chat-langchain/frontend` 的大部分 React UI 代码。

建议顺序：

```txt
app/page.tsx
  -> components/layout/sidebar.tsx
  -> components/chat/chat-interface.tsx
  -> components/chat/chat-input.tsx
  -> lib/api/langgraph-client.ts
  -> lib/hooks/chat/use-stream-handler.ts
```

先看页面状态、组件树和 props 流动。不要一开始就钻 `use-stream-handler.ts`，那部分属于 LangGraph 流式调用细节。
