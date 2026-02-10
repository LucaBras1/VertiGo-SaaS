/**
 * Admin Packages List Page
 * Display and manage all party packages
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface Package {
  id: string
  title: string
  slug: string
  category: string
  status: string
  featured: boolean
  price?: number
  duration: number
  ageGroups: string[]
  createdAt: string
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [])

  async function fetchPackages() {
    try {
      const response = await fetch('/api/packages')
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Opravdu chcete smazat tento balíček?')) return

    try {
      await fetch(`/api/packages/${id}`, { method: 'DELETE' })
      fetchPackages()
    } catch (error) {
      console.error('Error deleting package:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info'> = {
      published: 'success',
      draft: 'warning',
      archived: 'info',
    }
    const labels: Record<string, string> = {
      published: 'Publikováno',
      draft: 'Koncept',
      archived: 'Archivováno',
    }
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-partypal-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Balíčky</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Spravujte party balíčky</p>
        </div>
        <Link href="/admin/packages/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nový balíček
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} variant="outlined" className="flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-1">
                    {pkg.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {pkg.duration} minut
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(pkg.status)}
                  {pkg.featured && (
                    <Badge variant="pink" size="sm">
                      Doporučeno
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-1">
                  {pkg.ageGroups.map((age) => (
                    <Badge key={age} variant="info" size="sm">
                      {age}
                    </Badge>
                  ))}
                </div>
                {pkg.price && (
                  <p className="text-lg font-bold text-partypal-pink-600">
                    {pkg.price.toLocaleString('cs-CZ')} Kč
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between">
              <Link href={`/packages/${pkg.slug}`} target="_blank">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-1.5" />
                  Zobrazit
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Link href={`/admin/packages/${pkg.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(pkg.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Žádné balíčky
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Začněte vytvořením prvního party balíčku
            </p>
            <Link href="/admin/packages/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Vytvořit balíček
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
