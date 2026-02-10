'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Images, Eye, Download, Clock, CheckCircle, Truck, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface Gallery {
  id: string
  name: string
  status: 'PROCESSING' | 'READY' | 'DELIVERED'
  totalPhotos: number
  selectedPhotos: number
  aiCurated: boolean
  publicUrl: string | null
  createdAt: string
  shoot: {
    date: string
    package: {
      title: string
      client: {
        name: string
      }
    }
  }
}

const statusConfig = {
  PROCESSING: { label: 'Processing', color: 'yellow' as const, icon: Clock },
  READY: { label: 'Ready', color: 'green' as const, icon: CheckCircle },
  DELIVERED: { label: 'Delivered', color: 'blue' as const, icon: Truck }
}

export default function GalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchGalleries()
  }, [])

  const fetchGalleries = async () => {
    try {
      const res = await fetch('/api/galleries')
      const data = await res.json()
      setGalleries(data)
    } catch (error) {
      console.error('Failed to fetch galleries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGalleries = galleries.filter(gallery =>
    gallery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gallery.shoot?.package?.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Galleries</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage your photo galleries and client deliverables</p>
        </div>
        <Link href="/admin/galleries/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Gallery
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search galleries..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Processing</p>
              <p className="text-xl font-bold">{galleries.filter(g => g.status === 'PROCESSING').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Ready</p>
              <p className="text-xl font-bold">{galleries.filter(g => g.status === 'READY').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Delivered</p>
              <p className="text-xl font-bold">{galleries.filter(g => g.status === 'DELIVERED').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gallery Grid */}
      {filteredGalleries.length === 0 ? (
        <Card className="p-12 text-center">
          <Images className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No galleries yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">Create your first gallery to start organizing photos</p>
          <Link href="/admin/galleries/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Gallery
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGalleries.map(gallery => {
            const StatusIcon = statusConfig[gallery.status].icon
            return (
              <Link key={gallery.id} href={`/admin/galleries/${gallery.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  {/* Thumbnail placeholder */}
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                    <Images className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{gallery.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{gallery.shoot?.package?.client?.name}</p>
                      </div>
                      <Badge variant={statusConfig[gallery.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[gallery.status].label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mt-3">
                      <span className="flex items-center gap-1">
                        <Images className="w-4 h-4" />
                        {gallery.selectedPhotos}/{gallery.totalPhotos}
                      </span>
                      {gallery.aiCurated && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Sparkles className="w-4 h-4" />
                          AI Curated
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Button size="sm" variant="ghost" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {gallery.publicUrl && (
                        <Button size="sm" variant="ghost" className="flex-1">
                          <Download className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
