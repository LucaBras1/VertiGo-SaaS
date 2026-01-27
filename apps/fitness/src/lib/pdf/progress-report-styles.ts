import { StyleSheet } from '@react-pdf/renderer'

export const progressReportStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '3px solid #10B981',
  },
  headerLeft: {
    width: '60%',
  },
  headerRight: {
    width: '35%',
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  textBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },

  // Client info section
  clientSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  clientSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clientInfoItem: {
    width: '50%',
    marginBottom: 6,
  },
  clientInfoLabel: {
    fontSize: 8,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  clientInfoValue: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: 'bold',
  },

  // Summary cards
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  summaryCardGreen: {
    backgroundColor: '#ecfdf5',
    borderLeft: '4px solid #10B981',
  },
  summaryCardBlue: {
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
  },
  summaryCardPurple: {
    backgroundColor: '#faf5ff',
    borderLeft: '4px solid #8b5cf6',
  },
  summaryCardLabel: {
    fontSize: 9,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  summaryCardValueGreen: {
    color: '#059669',
  },
  summaryCardValueBlue: {
    color: '#2563eb',
  },
  summaryCardValuePurple: {
    color: '#7c3aed',
  },
  summaryCardChange: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryCardChangePositive: {
    color: '#10B981',
  },
  summaryCardChangeNegative: {
    color: '#ef4444',
  },

  // Measurements table
  measurementsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottom: '2px solid #e5e7eb',
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 4,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 10,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  // Column widths
  colDate: { width: '15%' },
  colWeight: { width: '12%' },
  colBodyFat: { width: '12%' },
  colChest: { width: '10%' },
  colWaist: { width: '10%' },
  colHips: { width: '10%' },
  colArms: { width: '10%' },
  colThighs: { width: '10%' },
  colNotes: { width: '11%' },

  // Goals section
  goalsSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    borderRadius: 6,
  },
  goalsSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 10,
  },
  goalItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  goalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
    marginRight: 8,
    marginTop: 3,
  },
  goalText: {
    fontSize: 10,
    color: '#92400e',
  },

  // Progress notes
  notesSection: {
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    borderLeft: '4px solid #10B981',
  },
  notesSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 10,
    color: '#047857',
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  footerBold: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
  },
})
