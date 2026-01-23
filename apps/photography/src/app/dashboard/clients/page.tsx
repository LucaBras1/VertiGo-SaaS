'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Plus, Search, Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  type: string
  tags: string[]
  packages: { id: string }[]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <div className="text-center py-12">Loading clients...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your photography clients</p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search clients by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="secondary">
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">
              {search ? 'Try adjusting your search terms' : 'Add your first client to get started'}
            </p>
            <Link href="/dashboard/clients/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Add Client
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{client.name}</h3>
                    <Badge variant="default" size="sm">
                      {client.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <Badge variant="info" size="sm">
                      {client.packages.length} {client.packages.length === 1 ? 'pkg' : 'pkgs'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {client.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {client.tags.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{client.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
