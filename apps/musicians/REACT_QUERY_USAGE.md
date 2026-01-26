# React Query Integration - Usage Guide

## Overview

React Query has been successfully integrated into the GigBook musicians app. All data fetching is now centralized using custom hooks with proper caching, loading states, and error handling.

## Files Created

### Providers
- `src/providers/query-provider.tsx` - QueryClientProvider wrapper with devtools

### Custom Hooks
- `src/hooks/useGigs.ts` - Gigs management (CRUD + stats)
- `src/hooks/useClients.ts` - Clients management (CRUD + stats)
- `src/hooks/useRepertoire.ts` - Songs/repertoire management (CRUD + stats)
- `src/hooks/useSetlists.ts` - Setlists management (CRUD + stats)
- `src/hooks/useInvoices.ts` - Invoices management (CRUD + stats)
- `src/hooks/index.ts` - Barrel export for convenience

### Updated Files
- `src/app/layout.tsx` - Added QueryProvider wrapper

## Usage Examples

### Fetching Data

```tsx
'use client'

import { useGigs, useGig } from '@/hooks'

export function GigsList() {
  // Fetch all gigs with optional filters
  const { data, isLoading, error } = useGigs({
    status: 'CONFIRMED',
    search: 'jazz',
    limit: 20
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data.gigs.map(gig => (
        <div key={gig.id}>{gig.title}</div>
      ))}
    </div>
  )
}

export function GigDetail({ id }: { id: string }) {
  // Fetch single gig
  const { data: gig, isLoading } = useGig(id)

  if (isLoading) return <div>Loading...</div>

  return <div>{gig?.title}</div>
}
```

### Creating Data

```tsx
'use client'

import { useCreateGig } from '@/hooks'
import { useSession } from 'next-auth/react'

export function CreateGigForm() {
  const { data: session } = useSession()
  const createGig = useCreateGig()

  const handleSubmit = async (formData: any) => {
    try {
      await createGig.mutateAsync({
        tenantId: session?.user?.tenant?.id || '',
        title: formData.title,
        clientName: formData.clientName,
        eventDate: new Date(formData.eventDate),
        // ... other fields
      })
      // Success! Query will auto-invalidate and refetch
    } catch (error) {
      console.error('Failed to create gig:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={createGig.isPending}>
        {createGig.isPending ? 'Creating...' : 'Create Gig'}
      </button>
      {createGig.error && <p>Error: {createGig.error.message}</p>}
    </form>
  )
}
```

### Updating Data

```tsx
'use client'

import { useUpdateGig } from '@/hooks'

export function UpdateGigButton({ gigId }: { gigId: string }) {
  const updateGig = useUpdateGig()

  const handleUpdate = async () => {
    await updateGig.mutateAsync({
      id: gigId,
      data: {
        status: 'CONFIRMED',
        deposit: 500,
        depositPaid: true
      }
    })
  }

  return (
    <button onClick={handleUpdate} disabled={updateGig.isPending}>
      Confirm Gig
    </button>
  )
}
```

### Deleting Data

```tsx
'use client'

import { useDeleteGig } from '@/hooks'

export function DeleteGigButton({ gigId }: { gigId: string }) {
  const deleteGig = useDeleteGig()

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteGig.mutateAsync(gigId)
    }
  }

  return (
    <button onClick={handleDelete} disabled={deleteGig.isPending}>
      Delete
    </button>
  )
}
```

### Stats Queries

```tsx
'use client'

import { useGigStats } from '@/hooks'

export function GigStats() {
  const { data: stats, isLoading } = useGigStats()

  if (isLoading) return <div>Loading stats...</div>

  return (
    <div>
      <div>Total Gigs: {stats?.total}</div>
      <div>Confirmed: {stats?.confirmed}</div>
      <div>Revenue: ${stats?.revenue}</div>
    </div>
  )
}
```

## All Available Hooks

### Gigs
- `useGigs(filters?)` - List all gigs
- `useGig(id)` - Get single gig
- `useGigStats()` - Get gig statistics
- `useCreateGig()` - Create new gig
- `useUpdateGig()` - Update existing gig
- `useDeleteGig()` - Delete gig

### Clients
- `useClients(filters?)` - List all clients
- `useClient(id)` - Get single client
- `useClientStats()` - Get client statistics
- `useCreateClient()` - Create new client
- `useUpdateClient()` - Update existing client
- `useDeleteClient()` - Delete client

### Repertoire
- `useRepertoire(filters?)` - List all songs
- `useSong(id)` - Get single song
- `useRepertoireStats()` - Get repertoire statistics
- `useCreateSong()` - Create new song
- `useUpdateSong()` - Update existing song
- `useDeleteSong()` - Delete song

### Setlists
- `useSetlists(filters?)` - List all setlists
- `useSetlist(id)` - Get single setlist
- `useSetlistStats()` - Get setlist statistics
- `useCreateSetlist()` - Create new setlist
- `useUpdateSetlist()` - Update existing setlist
- `useDeleteSetlist()` - Delete setlist

### Invoices
- `useInvoices(filters?)` - List all invoices
- `useInvoice(id)` - Get single invoice
- `useInvoiceStats()` - Get invoice statistics
- `useCreateInvoice()` - Create new invoice
- `useUpdateInvoice()` - Update existing invoice
- `useDeleteInvoice()` - Delete invoice

## Filter Options

### Gigs Filters
```typescript
{
  status?: GigStatus,
  search?: string,
  limit?: number,
  offset?: number
}
```

### Clients Filters
```typescript
{
  search?: string,
  limit?: number,
  offset?: number
}
```

### Repertoire Filters
```typescript
{
  search?: string,
  mood?: string,
  genre?: string,
  limit?: number,
  offset?: number
}
```

### Setlists Filters
```typescript
{
  status?: SetlistStatus,
  gigId?: string,
  search?: string,
  limit?: number,
  offset?: number
}
```

### Invoices Filters
```typescript
{
  status?: string,
  customerId?: string,
  gigId?: string,
  search?: string,
  limit?: number,
  offset?: number
}
```

## Features

- **Automatic Caching**: Data is cached for 1 minute (staleTime: 60000ms)
- **Query Invalidation**: Mutations automatically invalidate related queries
- **Loading States**: Built-in `isLoading` and `isPending` states
- **Error Handling**: Errors are captured and exposed
- **TypeScript Support**: Full type safety with existing service types
- **DevTools**: React Query DevTools available in development
- **Optimistic Updates**: Can be added for better UX
- **Window Focus Refetch**: Disabled by default (can be enabled per query)

## Configuration

The QueryClient is configured with sensible defaults in `src/providers/query-provider.tsx`:

```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minute
      refetchOnWindowFocus: false // Disabled by default
    }
  }
}
```

You can override these per-query if needed:

```typescript
const { data } = useGigs({}, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true
})
```

## DevTools

React Query DevTools are available in development mode. They appear as a floating icon in the bottom-right corner and show:

- All active queries
- Query cache
- Query states (fresh, stale, fetching)
- Mutation states
- Manual cache manipulation

## Next Steps

1. Replace existing `fetch` calls with React Query hooks
2. Remove duplicate loading/error state management
3. Add optimistic updates for better UX
4. Consider implementing pagination with `useInfiniteQuery`
5. Add retry logic for failed requests
6. Implement background refetch strategies

## Benefits

- **Single Source of Truth**: All data fetching centralized
- **Better UX**: Instant updates with cache invalidation
- **Less Boilerplate**: No manual loading/error state management
- **Performance**: Automatic deduplication of requests
- **Developer Experience**: DevTools for debugging
- **Type Safety**: Full TypeScript support
