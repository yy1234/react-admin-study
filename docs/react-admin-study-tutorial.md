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
const startIndex = (currentPage - 1) * pageSize
const endIndex = startIndex + pageSize

return sortedCustomers.slice(startIndex, endIndex)
```

`slice()` 不会修改原数组，适合 React 派生数据。

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

这个阶段把 `CustomerForm` 从手写 `useState` 表单升级成：

```txt
react-hook-form + zod + @hookform/resolvers + shadcn Field
```

主要文件：

- `src/components/customers/CustomerForm.tsx`
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

## 还没完成的后续阶段

接下来建议继续：

1. 表单进阶收尾
   - 提交中 loading
   - 服务端错误
   - 编辑客户表单

2. 数据请求
   - fetch 或 axios
   - loading/error/empty
   - 列表接口
   - 新增/删除/更新接口

3. TanStack Query
   - query
   - mutation
   - 缓存
   - 乐观更新
   - 失败回滚

4. React Router
   - 列表页
   - 详情页
   - 编辑页
   - URL 参数
   - query 参数

5. TanStack Table
   - 列定义
   - 排序
   - 筛选
   - 分页
   - 行选择
   - 批量操作

6. 登录和权限
   - token
   - 路由守卫
   - 用户信息
   - 按权限显示菜单和按钮

7. 工程化
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

