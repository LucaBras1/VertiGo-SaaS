import { Document, Page, Text, View } from '@react-pdf/renderer'
import { progressReportStyles as styles } from './progress-report-styles'

interface MeasurementData {
  date: string
  weight?: number | null
  bodyFat?: number | null
  measurements?: {
    chest?: number
    waist?: number
    hips?: number
    arms?: number
    thighs?: number
  } | null
  notes?: string | null
}

interface ClientInfo {
  name: string
  email: string
  fitnessLevel?: string | null
  goals?: string[]
  startDate: string
}

interface TenantInfo {
  name: string
  email?: string | null
  phone?: string | null
  website?: string | null
}

interface ProgressSummary {
  weightChange: number
  bodyFatChange: number
  periodStart: string
  periodEnd: string
  totalMeasurements: number
}

export interface ProgressReportData {
  client: ClientInfo
  measurements: MeasurementData[]
  summary: ProgressSummary
  tenant: TenantInfo
  generatedAt: string
}

function formatCzechDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatNumber(value: number | null | undefined, suffix: string = ''): string {
  if (value === null || value === undefined) return '-'
  return `${value.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })}${suffix}`
}

function formatChange(value: number, suffix: string = ''): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })}${suffix}`
}

function translateGoal(goal: string): string {
  const translations: Record<string, string> = {
    weight_loss: 'Hubnutí',
    muscle_gain: 'Nabírání svalů',
    strength: 'Zvýšení síly',
    endurance: 'Vytrvalost',
    flexibility: 'Flexibilita',
    general_fitness: 'Celková kondice',
    sports_performance: 'Sportovní výkon',
    rehabilitation: 'Rehabilitace',
  }
  return translations[goal] || goal
}

function translateFitnessLevel(level: string | null | undefined): string {
  if (!level) return '-'
  const translations: Record<string, string> = {
    beginner: 'Začátečník',
    intermediate: 'Pokročilý',
    advanced: 'Expert',
  }
  return translations[level] || level
}

export function ProgressReportPDF({ data }: { data: ProgressReportData }) {
  const { client, measurements, summary, tenant } = data

  // Get latest measurement for display
  const latestMeasurement = measurements[0]
  const firstMeasurement = measurements[measurements.length - 1]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Progress Report</Text>
            <Text style={styles.subtitle}>{client.name}</Text>
            <Text style={styles.text}>
              Období: {formatCzechDate(summary.periodStart)} - {formatCzechDate(summary.periodEnd)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.textBold}>{tenant.name}</Text>
            {tenant.email && <Text style={styles.text}>{tenant.email}</Text>}
            {tenant.phone && <Text style={styles.text}>{tenant.phone}</Text>}
            <Text style={styles.text}>Vygenerováno: {formatCzechDate(data.generatedAt)}</Text>
          </View>
        </View>

        {/* Client info section */}
        <View style={styles.clientSection}>
          <Text style={styles.clientSectionTitle}>Informace o klientovi</Text>
          <View style={styles.clientInfoGrid}>
            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>E-mail</Text>
              <Text style={styles.clientInfoValue}>{client.email}</Text>
            </View>
            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Fitness úroveň</Text>
              <Text style={styles.clientInfoValue}>{translateFitnessLevel(client.fitnessLevel)}</Text>
            </View>
            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Datum registrace</Text>
              <Text style={styles.clientInfoValue}>{formatCzechDate(client.startDate)}</Text>
            </View>
            <View style={styles.clientInfoItem}>
              <Text style={styles.clientInfoLabel}>Počet měření</Text>
              <Text style={styles.clientInfoValue}>{summary.totalMeasurements}</Text>
            </View>
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Text style={styles.summaryCardLabel}>Aktuální váha</Text>
            <Text style={[styles.summaryCardValue, styles.summaryCardValueGreen]}>
              {formatNumber(latestMeasurement?.weight, ' kg')}
            </Text>
            <Text style={[
              styles.summaryCardChange,
              summary.weightChange <= 0 ? styles.summaryCardChangePositive : styles.summaryCardChangeNegative
            ]}>
              {formatChange(summary.weightChange, ' kg')}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardBlue]}>
            <Text style={styles.summaryCardLabel}>Tělesný tuk</Text>
            <Text style={[styles.summaryCardValue, styles.summaryCardValueBlue]}>
              {formatNumber(latestMeasurement?.bodyFat, ' %')}
            </Text>
            <Text style={[
              styles.summaryCardChange,
              summary.bodyFatChange <= 0 ? styles.summaryCardChangePositive : styles.summaryCardChangeNegative
            ]}>
              {formatChange(summary.bodyFatChange, ' %')}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardPurple]}>
            <Text style={styles.summaryCardLabel}>Sledované období</Text>
            <Text style={[styles.summaryCardValue, styles.summaryCardValuePurple]}>
              {summary.totalMeasurements}
            </Text>
            <Text style={styles.summaryCardChange}>měření</Text>
          </View>
        </View>

        {/* Measurements table */}
        <View style={styles.measurementsSection}>
          <Text style={styles.sectionTitle}>Historie měření</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDate]}>Datum</Text>
              <Text style={[styles.tableHeaderCell, styles.colWeight]}>Váha</Text>
              <Text style={[styles.tableHeaderCell, styles.colBodyFat]}>Tuk %</Text>
              <Text style={[styles.tableHeaderCell, styles.colChest]}>Hrudník</Text>
              <Text style={[styles.tableHeaderCell, styles.colWaist]}>Pas</Text>
              <Text style={[styles.tableHeaderCell, styles.colHips]}>Boky</Text>
              <Text style={[styles.tableHeaderCell, styles.colArms]}>Paže</Text>
              <Text style={[styles.tableHeaderCell, styles.colThighs]}>Stehna</Text>
            </View>

            {/* Rows */}
            {measurements.slice(0, 10).map((m, index) => (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCellBold, styles.colDate]}>{formatCzechDate(m.date)}</Text>
                <Text style={[styles.tableCell, styles.colWeight]}>{formatNumber(m.weight, ' kg')}</Text>
                <Text style={[styles.tableCell, styles.colBodyFat]}>{formatNumber(m.bodyFat, ' %')}</Text>
                <Text style={[styles.tableCell, styles.colChest]}>{formatNumber(m.measurements?.chest, ' cm')}</Text>
                <Text style={[styles.tableCell, styles.colWaist]}>{formatNumber(m.measurements?.waist, ' cm')}</Text>
                <Text style={[styles.tableCell, styles.colHips]}>{formatNumber(m.measurements?.hips, ' cm')}</Text>
                <Text style={[styles.tableCell, styles.colArms]}>{formatNumber(m.measurements?.arms, ' cm')}</Text>
                <Text style={[styles.tableCell, styles.colThighs]}>{formatNumber(m.measurements?.thighs, ' cm')}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Goals section */}
        {client.goals && client.goals.length > 0 && (
          <View style={styles.goalsSection}>
            <Text style={styles.goalsSectionTitle}>Cíle klienta</Text>
            {client.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View style={styles.goalBullet} />
                <Text style={styles.goalText}>{translateGoal(goal)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerBold}>{tenant.name}</Text>
            {tenant.website && <Text style={styles.footerText}>{tenant.website}</Text>}
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.footerText}>Progress Report - {client.name}</Text>
            <Text style={styles.footerText}>{formatCzechDate(data.generatedAt)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
