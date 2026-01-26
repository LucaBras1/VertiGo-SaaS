# Skeleton Components

Loading skeleton components for the GigBook musicians app. These provide visual feedback during data fetching and improve perceived performance.

## Components

### Base Skeleton
```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-full" />
```

### CardSkeleton
Generic card skeleton for list items.
```tsx
import { CardSkeleton } from '@/components/skeletons'

<CardSkeleton />
```

### GigCardSkeleton
Skeleton for gig cards with status badge and metadata.
```tsx
import { GigCardSkeleton } from '@/components/skeletons'

<GigCardSkeleton />
```

### ClientCardSkeleton
Skeleton for client cards with avatar and contact info.
```tsx
import { ClientCardSkeleton } from '@/components/skeletons'

<ClientCardSkeleton />
```

### TableRowSkeleton
Skeleton for table rows with customizable column count.
```tsx
import { TableRowSkeleton } from '@/components/skeletons'

<table>
  <tbody>
    <TableRowSkeleton columns={5} />
    <TableRowSkeleton columns={5} />
  </tbody>
</table>
```

### StatsCardSkeleton
Skeleton for dashboard statistics cards.
```tsx
import { StatsCardSkeleton } from '@/components/skeletons'

<StatsCardSkeleton />
```

### DashboardSkeleton
Complete dashboard page skeleton.
```tsx
import { DashboardSkeleton } from '@/components/skeletons'

{isLoading ? <DashboardSkeleton /> : <DashboardContent />}
```

## Usage Examples

### With React Query
```tsx
import { useQuery } from '@tanstack/react-query'
import { GigCardSkeleton } from '@/components/skeletons'

function GigsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['gigs'],
    queryFn: fetchGigs
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GigCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return <GigsGrid gigs={data} />
}
```

### With Suspense
```tsx
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/skeletons'

<Suspense fallback={<DashboardSkeleton />}>
  <Dashboard />
</Suspense>
```

### Table Loading State
```tsx
import { TableRowSkeleton } from '@/components/skeletons'

<table className="w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Date</th>
      <th>Status</th>
      <th>Amount</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {isLoading ? (
      <>
        <TableRowSkeleton columns={5} />
        <TableRowSkeleton columns={5} />
        <TableRowSkeleton columns={5} />
      </>
    ) : (
      data.map(row => <TableRow key={row.id} {...row} />)
    )}
  </tbody>
</table>
```

## Styling

All skeletons use:
- `animate-pulse` - Built-in Tailwind animation
- `bg-gray-200` - Light gray background
- `rounded-md` - Consistent border radius
- Consistent spacing with existing UI components

## Customization

You can customize individual skeletons by passing className:

```tsx
<Skeleton className="h-6 w-32 bg-gray-300" />
```

Or extend the base Skeleton component for custom loading states:

```tsx
export function CustomCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <Skeleton className="h-8 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
```
