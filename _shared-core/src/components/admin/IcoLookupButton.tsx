/**
 * IČO Lookup Button Component
 * Button to fetch company info from ARES by IČO
 */
'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface IcoLookupButtonProps {
  ico: string
  onDataFetched: (data: {
    companyName: string
    dic?: string
    address?: {
      street?: string
      city?: string
      postalCode?: string
      country?: string
    }
  }) => void
  disabled?: boolean
}

export function IcoLookupButton({ ico, onDataFetched, disabled = false }: IcoLookupButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLookup = async () => {
    if (!ico || ico.length < 8) {
      toast('Zadejte platné IČO (8 číslic)', 'error')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/ares/lookup?ico=${encodeURIComponent(ico)}`)
      const data = await response.json()

      if (!response.ok) {
        toast(data.error || 'Chyba při načítání dat z ARES', 'error')
        return
      }

      // Show warning if company is inactive
      if (data.warning) {
        toast(data.warning, 'error')
      } else {
        toast('Údaje úspěšně načteny z ARES', 'success')
      }

      // Call callback with fetched data
      onDataFetched({
        companyName: data.companyName,
        dic: data.dic,
        address: data.address,
      })
    } catch (error) {
      console.error('Error fetching ARES data:', error)
      toast('Chyba při komunikaci s ARES', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLookup}
      disabled={disabled || isLoading || !ico}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Načíst údaje z registru ARES"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Načítám...
        </>
      ) : (
        <>
          <Search className="h-4 w-4" />
          Doplnit z ARES
        </>
      )}
    </button>
  )
}
