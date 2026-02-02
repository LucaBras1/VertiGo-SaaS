/**
 * Reports Page
 * Analytics and reporting dashboard with charts and PDF export
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
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
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface Stats {
  totalPrograms: number
  totalActivities: number
  totalSessions: number
  completedSessions: number
  totalCustomers: number
  totalRevenue: number
  revenueByMonth: { month: string; revenue: number }[]
  sessionsByMonth: { month: string; count: number }[]
  popularPrograms: { name: string; sessions: number }[]
  sessionsByStatus: { status: string; count: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#10b981',
  completed: '#0088FE',
  tentative: '#FFBB28',
  cancelled: '#FF8042',
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats>({
    totalPrograms: 0,
    totalActivities: 0,
    totalSessions: 0,
    completedSessions: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    revenueByMonth: [],
    sessionsByMonth: [],
    popularPrograms: [],
    sessionsByStatus: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch all data in parallel
      const [programsRes, activitiesRes, sessionsRes, customersRes, invoicesRes] = await Promise.all([
        fetch('/api/programs'),
        fetch('/api/activities'),
        fetch('/api/sessions'),
        fetch('/api/customers'),
        fetch('/api/invoices'),
      ])

      const [programs, activities, sessions, customers, invoices] = await Promise.all([
        programsRes.json(),
        activitiesRes.json(),
        sessionsRes.json(),
        customersRes.json(),
        invoicesRes.json(),
      ])

      // Calculate revenue from paid invoices
      const paidInvoices = invoices.success ? invoices.data.filter((inv: any) => inv.status === 'paid') : []
      const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0) / 100

      // Group sessions by month (last 6 months)
      const sessionsByMonth = getSessionsByMonth(sessions.success ? sessions.data : [])

      // Group revenue by month (last 6 months)
      const revenueByMonth = getRevenueByMonth(paidInvoices)

      // Get popular programs
      const popularPrograms = getPopularPrograms(sessions.success ? sessions.data : [], programs.success ? programs.data : [])

      // Get sessions by status
      const sessionsByStatus = getSessionsByStatus(sessions.success ? sessions.data : [])

      if (programs.success && activities.success && sessions.success && customers.success) {
        setStats({
          totalPrograms: programs.data.length,
          totalActivities: activities.data.length,
          totalSessions: sessions.data.length,
          completedSessions: sessions.data.filter((s: any) => s.status === 'completed').length,
          totalCustomers: customers.data.length,
          totalRevenue,
          revenueByMonth,
          sessionsByMonth,
          popularPrograms,
          sessionsByStatus,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Nepodařilo se načíst statistiky')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const getSessionsByMonth = (sessions: any[]) => {
    const months: Record<string, number> = {}
    const now = new Date()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
      months[key] = 0
    }

    sessions.forEach((session) => {
      const date = new Date(session.date)
      const key = date.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
      if (months.hasOwnProperty(key)) {
        months[key]++
      }
    })

    return Object.entries(months).map(([month, count]) => ({ month, count }))
  }

  const getRevenueByMonth = (invoices: any[]) => {
    const months: Record<string, number> = {}
    const now = new Date()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
      months[key] = 0
    }

    invoices.forEach((invoice) => {
      const date = new Date(invoice.paidDate || invoice.issueDate)
      const key = date.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
      if (months.hasOwnProperty(key)) {
        months[key] += (invoice.totalAmount || 0) / 100
      }
    })

    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }))
  }

  const getPopularPrograms = (sessions: any[], programs: any[]) => {
    const programCounts: Record<string, number> = {}

    sessions.forEach((session) => {
      if (session.programId) {
        programCounts[session.programId] = (programCounts[session.programId] || 0) + 1
      }
    })

    const programMap = new Map(programs.map((p: any) => [p.id, p.title]))

    return Object.entries(programCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, sessions]) => ({
        name: programMap.get(id) || 'Unknown',
        sessions,
      }))
  }

  const getSessionsByStatus = (sessions: any[]) => {
    const statusCounts: Record<string, number> = {}

    sessions.forEach((session) => {
      statusCounts[session.status] = (statusCounts[session.status] || 0) + 1
    })

    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
  }

  const handleExportReport = async () => {
    setIsExporting(true)
    try {
      // Dynamic import for jsPDF (client-side only)
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Title
      doc.setFontSize(20)
      doc.text('TeamForge - Report', pageWidth / 2, 20, { align: 'center' })

      // Date
      doc.setFontSize(10)
      doc.text(`Vygenerováno: ${new Date().toLocaleDateString('cs-CZ')}`, pageWidth / 2, 28, { align: 'center' })

      // Summary Section
      doc.setFontSize(14)
      doc.text('Přehled', 14, 45)

      const summaryData = [
        ['Celkem programů', stats.totalPrograms.toString()],
        ['Celkem aktivit', stats.totalActivities.toString()],
        ['Celkem workshopů', stats.totalSessions.toString()],
        ['Dokončených workshopů', stats.completedSessions.toString()],
        ['Celkem zákazníků', stats.totalCustomers.toString()],
        ['Celkové tržby', `${stats.totalRevenue.toLocaleString('cs-CZ')} Kč`],
      ]

      autoTable(doc, {
        startY: 50,
        head: [['Metrika', 'Hodnota']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [6, 182, 212] },
      })

      // Revenue by Month
      let finalY = (doc as any).lastAutoTable?.finalY || 100
      doc.setFontSize(14)
      doc.text('Tržby podle měsíců', 14, finalY + 15)

      const revenueData = stats.revenueByMonth.map(item => [
        item.month,
        `${item.revenue.toLocaleString('cs-CZ')} Kč`,
      ])

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Měsíc', 'Tržby']],
        body: revenueData,
        theme: 'striped',
        headStyles: { fillColor: [6, 182, 212] },
      })

      // Sessions by Month
      finalY = (doc as any).lastAutoTable?.finalY || 150
      doc.setFontSize(14)
      doc.text('Workshopy podle měsíců', 14, finalY + 15)

      const sessionsData = stats.sessionsByMonth.map(item => [
        item.month,
        item.count.toString(),
      ])

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Měsíc', 'Počet workshopů']],
        body: sessionsData,
        theme: 'striped',
        headStyles: { fillColor: [6, 182, 212] },
      })

      // Popular Programs
      if (stats.popularPrograms.length > 0) {
        finalY = (doc as any).lastAutoTable?.finalY || 200

        // Check if we need a new page
        if (finalY > 250) {
          doc.addPage()
          finalY = 20
        }

        doc.setFontSize(14)
        doc.text('Nejpopulárnější programy', 14, finalY + 15)

        const programsData = stats.popularPrograms.map(item => [
          item.name,
          item.sessions.toString(),
        ])

        autoTable(doc, {
          startY: finalY + 20,
          head: [['Program', 'Počet workshopů']],
          body: programsData,
          theme: 'striped',
          headStyles: { fillColor: [6, 182, 212] },
        })
      }

      // Save PDF
      doc.save(`teamforge-report-${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('Report byl úspěšně exportován')
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Nepodařilo se exportovat report')
    } finally {
      setIsExporting(false)
    }
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
        <div className="flex gap-3">
          <Button onClick={fetchStats} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Obnovit
          </Button>
          <Button onClick={handleExportReport} variant="outline" disabled={isExporting}>
            <Download className={`w-5 h-5 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
            {isExporting ? 'Exportuji...' : 'Export PDF'}
          </Button>
        </div>
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
                  {stats.totalRevenue.toLocaleString('cs-CZ')} Kč
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tržby podle měsíců
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString('cs-CZ')} Kč`, 'Tržby']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Zatím nejsou k dispozici žádná data o tržbách
              </div>
            )}
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
            {stats.sessionsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.sessionsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Počet workshopů" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Zatím nejsou k dispozici žádná data o workshopech
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nejpopulárnější programy</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.popularPrograms.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.popularPrograms} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#8884d8" name="Počet workshopů" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Zatím nejsou k dispozici žádná data o programech
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workshopy podle stavu</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.sessionsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.sessionsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.sessionsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Zatím nejsou k dispozici žádná data o stavech workshopů
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
