/**
 * Reports Page
 * Analytics and reporting dashboard with charts and PDF export
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { motion } from 'framer-motion'
import { Button, Card, fadeIn, staggerContainer, staggerItem } from '@vertigo/ui'
import { chartTheme } from '@vertigo/admin'
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

const COLORS = ['#6366F1', '#0EA5E9', '#22C55E', '#F59E0B', '#EC4899']

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22C55E',
  completed: '#6366F1',
  tentative: '#F59E0B',
  cancelled: '#EF4444',
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Načítám statistiky...</p>
        </div>
      </div>
    )
  }

  const statsItems = [
    {
      label: 'Programy',
      value: stats.totalPrograms,
      icon: Users,
      bgClass: 'bg-brand-100 dark:bg-brand-900/30',
      iconClass: 'text-brand-600 dark:text-brand-400',
    },
    {
      label: 'Aktivity',
      value: stats.totalActivities,
      icon: Activity,
      bgClass: 'bg-success-100 dark:bg-success-900/30',
      iconClass: 'text-success-600 dark:text-success-400',
    },
    {
      label: 'Workshopy',
      value: stats.totalSessions,
      icon: Calendar,
      bgClass: 'bg-violet-100 dark:bg-violet-900/30',
      iconClass: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Dokončené workshopy',
      value: stats.completedSessions,
      icon: FileText,
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      iconClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Zákazníci',
      value: stats.totalCustomers,
      icon: Users,
      bgClass: 'bg-amber-100 dark:bg-amber-900/30',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Celkové tržby',
      value: `${stats.totalRevenue.toLocaleString('cs-CZ')} Kč`,
      icon: DollarSign,
      bgClass: 'bg-success-100 dark:bg-success-900/30',
      iconClass: 'text-success-600 dark:text-success-400',
    },
  ]

  return (
    <div>
      {/* Header */}
      <motion.div className="flex items-center justify-between mb-6" {...fadeIn}>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reporty</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">Přehled výkonnosti a statistiky</p>
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
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statsItems.map((item) => (
          <motion.div key={item.label} variants={staggerItem}>
            <Card>
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.label}</p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{item.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bgClass}`}>
                  <item.icon className={`h-6 w-6 ${item.iconClass}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <Card>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Tržby podle měsíců</h3>
              </div>
              {stats.revenueByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.revenueByMonth}>
                    <CartesianGrid strokeDasharray={chartTheme.grid.strokeDasharray} stroke={chartTheme.grid.stroke} />
                    <XAxis dataKey="month" tick={chartTheme.axis.tick} />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={chartTheme.axis.tick} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString('cs-CZ')} Kč`, 'Tržby']}
                      contentStyle={{
                        backgroundColor: chartTheme.tooltip.bg,
                        borderColor: chartTheme.tooltip.border,
                        color: chartTheme.tooltip.text,
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={chartTheme.colors.primary}
                      strokeWidth={2}
                      dot={{ fill: chartTheme.colors.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  Zatím nejsou k dispozici žádná data o tržebách
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-success-600 dark:text-success-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Workshopy podle měsíců</h3>
              </div>
              {stats.sessionsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.sessionsByMonth}>
                    <CartesianGrid strokeDasharray={chartTheme.grid.strokeDasharray} stroke={chartTheme.grid.stroke} />
                    <XAxis dataKey="month" tick={chartTheme.axis.tick} />
                    <YAxis tick={chartTheme.axis.tick} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartTheme.tooltip.bg,
                        borderColor: chartTheme.tooltip.border,
                        color: chartTheme.tooltip.text,
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill={chartTheme.colors.success} name="Počet workshopů" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  Zatím nejsou k dispozici žádná data o workshopech
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <Card>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Nejpopulárnější programy</h3>
              </div>
              {stats.popularPrograms.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.popularPrograms} layout="vertical">
                    <CartesianGrid strokeDasharray={chartTheme.grid.strokeDasharray} stroke={chartTheme.grid.stroke} />
                    <XAxis type="number" tick={chartTheme.axis.tick} />
                    <YAxis dataKey="name" type="category" width={150} tick={chartTheme.axis.tick} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartTheme.tooltip.bg,
                        borderColor: chartTheme.tooltip.border,
                        color: chartTheme.tooltip.text,
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="sessions" fill={chartTheme.colors.primary} name="Počet workshopů" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  Zatím nejsou k dispozici žádná data o programech
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Workshopy podle stavu</h3>
              </div>
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
                      fill={chartTheme.colors.primary}
                      dataKey="count"
                    >
                      {stats.sessionsByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartTheme.tooltip.bg,
                        borderColor: chartTheme.tooltip.border,
                        color: chartTheme.tooltip.text,
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  Zatím nejsou k dispozici žádná data o stavech workshopů
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
