/**
 * Reports Page
 * Analytics and reporting dashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalActivities: 0,
    totalSessions: 0,
    completedSessions: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch all data in parallel
      const [programsRes, activitiesRes, sessionsRes, customersRes] = await Promise.all([
        fetch('/api/programs'),
        fetch('/api/activities'),
        fetch('/api/sessions'),
        fetch('/api/customers'),
      ])

      const [programs, activities, sessions, customers] = await Promise.all([
        programsRes.json(),
        activitiesRes.json(),
        sessionsRes.json(),
        customersRes.json(),
      ])

      if (programs.success && activities.success && sessions.success && customers.success) {
        setStats({
          totalPrograms: programs.data.length,
          totalActivities: activities.data.length,
          totalSessions: sessions.data.length,
          completedSessions: sessions.data.filter((s: any) => s.status === 'completed').length,
          totalCustomers: customers.data.length,
          totalRevenue: 0, // TODO: Calculate from orders/invoices
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Nepodařilo se načíst statistiky')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = () => {
    toast.success('Export reportu bude brzy k dispozici')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám statistiky...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reporty</h1>
          <p className="text-gray-600 mt-2">Přehled výkonnosti a statistiky</p>
        </div>
        <Button onClick={handleExportReport} variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Programy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPrograms}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aktivity</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalActivities}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Workshopy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dokončené workshopy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Zákazníci</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Celkové tržby</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString()} Kč
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Výkonnost programů
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              Vizualizace výkonnosti programů bude k dispozici brzy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Workshopy podle měsíců
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              Graf workshopů podle měsíců bude k dispozici brzy
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Programs */}
      <Card>
        <CardHeader>
          <CardTitle>Nejpopulárnější programy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Seznam nejpopulárnějších programů bude k dispozici brzy
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
