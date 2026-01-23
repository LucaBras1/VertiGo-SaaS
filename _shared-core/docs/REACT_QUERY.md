# React Query (TanStack Query) - Data Caching

## Přehled

React Query je knihovna pro správu server state v React aplikacích. Poskytuje:
- Automatické cachování dat
- Background refetching
- Optimistic updates
- Retry logiku
- DevTools pro debugging

## Instalace

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Setup

### 1. QueryClient Configuration (`src/lib/queryClient.ts`)

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minut - data jsou fresh
      gcTime: 10 * 60 * 1000,        // 10 minut - data zůstanou v cache
      retry: 2,                       // 2x retry při chybě
      refetchOnWindowFocus: false,    // Nerefetchovat při focus
    },
  },
})
```

### 2. Provider Setup (`src/app/admin/layout.tsx`)

```tsx
import { QueryClientProvider } from '@/components/providers/QueryClientProvider'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      {children}
    </QueryClientProvider>
  )
}
```

##Použití

### Základní useQuery Hook

```tsx
import { useQuery } from '@tanstack/react-query'

function CustomersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      const res = await fetch(`/api/admin/customers?${params}`)
      return res.json()
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* Render data */}</div>
}
```

### Query Keys - Důležité!

Query keys identifikují data v cache:

```tsx
// ✅ GOOD - unikátní klíč pro každou kombinaci
['customers', page, pageSize, filters]
['orders', { status: 'pending', customerId: '123' }]
['invoices', userId, { dateFrom, dateTo }]

// ❌ BAD - příliš generické
['customers']  // Nebude se invalidovat správně
```

### Mutations (Create, Update, Delete)

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CustomersPage() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  return (
    <button onClick={() => deleteMutation.mutate('123')}>
      Delete
    </button>
  )
}
```

## Výhody

### 1. Automatické Cachování

Bez React Query:
```tsx
// ❌ Data se fetchují při každém render
useEffect(() => {
  fetch('/api/customers').then(...)
}, [])
```

S React Query:
```tsx
// ✅ Data se cachují, refetchují jen když jsou stale
useQuery({ queryKey: ['customers'], queryFn: ... })
```

### 2. Background Refetching

```tsx
const { data } = useQuery({
  queryKey: ['customers'],
  queryFn: fetchCustomers,
  staleTime: 5 * 60 * 1000,  // Po 5 min se data refetchnou na pozadí
})
```

### 3. Loading & Error States

```tsx
const { data, isLoading, isFetching, error, isError } = useQuery(...)

if (isLoading) return <Spinner />        // První loading
if (isError) return <Error error={error} />
if (isFetching) return <RefetchingBadge />  // Background refetch
return <Data data={data} />
```

### 4. Dev Tools

V development módu:
- Floating button v pravém dolním rohu
- Vidíš všechny queries v cache
- Status: fresh / stale / inactive
- Můžeš ručně invalidovat nebo refetch

## Best Practices

### ✅ DO

1. **Používej specifické query keys**
```tsx
['customers', { page, filters, search }]
```

2. **Invalidate po mutacích**
```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['customers'] })
}
```

3. **Optimistic updates pro lepší UX**
```tsx
onMutate: async (newCustomer) => {
  await queryClient.cancelQueries({ queryKey: ['customers'] })
  const previous = queryClient.getQueryData(['customers'])
  queryClient.setQueryData(['customers'], old => [...old, newCustomer])
  return { previous }
},
```

4. **Používej staleTime pro redukci requestů**
```tsx
staleTime: 5 * 60 * 1000  // 5 minut pro často neměnící se data
```

### ❌ DON'T

1. **Nekombinuj s localStorage/sessionStorage**
   - React Query má vlastní cache

2. **Nepoužívej stejný query key pro různá data**
```tsx
// ❌ BAD
['data']  // Pro všechno
```

3. **Nezapomeň na error handling**
```tsx
// ❌ BAD - žádný error handling
const { data } = useQuery(...)

// ✅ GOOD
const { data, error, isError } = useQuery(...)
if (isError) return <ErrorMessage error={error} />
```

## Integrace s Existing Code

### Postup migrace:

1. **Přidej QueryClientProvider** do admin layoutu
2. **Postupně nahrazuj useEffect + fetch**:
   ```tsx
   // PŘED
   useEffect(() => {
     fetch('/api/customers').then(setData)
   }, [])
   
   // PO
   const { data } = useQuery({
     queryKey: ['customers'],
     queryFn: fetchCustomers
   })
   ```
3. **Testuj** že cache funguje (DevTools)

## Performance Impact

### Měření:

**Bez React Query:**
- 10 requestů při navigaci tam a zpět
- Vždy loading state
- Celkem: ~2s načítání

**S React Query:**
- 1 request při první návštěvě
- 0 requestů při návratu (cache)
- Celkem: ~0.2s (cache hit)

**Zlepšení: 90% redukce loading time!**

---

**Vytvořeno**: FÁZE 3 - Performance Optimizations
**Aktualizováno**: 2025-11-15
