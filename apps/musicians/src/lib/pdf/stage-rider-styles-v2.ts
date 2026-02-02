import { StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts if needed
// Font.register({
//   family: 'Open Sans',
//   fonts: [
//     { src: '/fonts/OpenSans-Regular.ttf' },
//     { src: '/fonts/OpenSans-Bold.ttf', fontWeight: 'bold' },
//   ],
// })

const colors = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  secondary: '#64748b',
  text: '#1f2937',
  textLight: '#6b7280',
  border: '#e5e7eb',
  background: '#f9fafb',
  white: '#ffffff',
  accent: '#7c3aed',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}

export const stageRiderStylesV2 = StyleSheet.create({
  // Page Layout
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  documentType: {
    fontSize: 8,
    color: colors.accent,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  eventName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  dateText: {
    fontSize: 10,
    color: colors.textLight,
  },
  venueText: {
    fontSize: 10,
    color: colors.textLight,
  },

  // Page Header (for subsequent pages)
  pageHeader: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pageHeaderSubtitle: {
    fontSize: 10,
    color: colors.textLight,
  },

  // Summary Box
  summaryBox: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.text,
  },

  // Specs Grid
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingVertical: 15,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  specItem: {
    alignItems: 'center',
  },
  specValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  specLabel: {
    fontSize: 8,
    color: '#93c5fd',
    textTransform: 'uppercase',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 8,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.white,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    fontSize: 9,
    color: colors.text,
  },
  tableColChannel: {
    width: '8%',
    textAlign: 'center',
  },
  tableColInstrument: {
    width: '25%',
  },
  tableColMic: {
    width: '25%',
  },
  tableColPhantom: {
    width: '10%',
    textAlign: 'center',
  },
  tableColNotes: {
    width: '32%',
  },

  // Color Legend
  colorLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
  },
  colorLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorLegendText: {
    fontSize: 8,
    color: colors.textLight,
  },

  // Stage Plot
  stagePlotContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  stagePlotTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  stagePlot: {
    width: '100%',
    height: 150,
  },
  stagePlotLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  stagePlotLegendItem: {
    fontSize: 8,
    color: colors.textLight,
  },

  // Requirements Grid
  requirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  requirementBox: {
    flex: 1,
    minWidth: 100,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  requirementLabel: {
    fontSize: 8,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  requirementValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  requirementNote: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 5,
    fontStyle: 'italic',
  },

  // Backline List
  backlineList: {
    gap: 8,
  },
  backlineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  backlineItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  backlineItemContent: {
    flex: 1,
  },
  backlineItemName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  backlineItemSpec: {
    fontSize: 9,
    color: colors.textLight,
  },
  backlineItemOptional: {
    fontSize: 8,
    color: colors.warning,
    fontStyle: 'italic',
  },

  // Timeline
  timeline: {
    paddingVertical: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 6,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  timelineLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  timelineValue: {
    fontSize: 10,
    color: colors.textLight,
  },

  // Hospitality
  hospitalitySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fef9c3',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#facc15',
  },
  hospitalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  hospitalityItem: {
    flex: 1,
    minWidth: 120,
  },
  hospitalityLabel: {
    fontSize: 8,
    color: '#92400e',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  hospitalityValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#78350f',
  },
  hospitalityNote: {
    fontSize: 9,
    color: '#92400e',
    marginTop: 2,
  },

  // Notes Section
  notesSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 5,
  },
  noteBullet: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.danger,
  },
  noteText: {
    flex: 1,
    fontSize: 9,
    color: '#7f1d1d',
  },

  // Signature Section
  signatureSection: {
    marginTop: 30,
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  signatureGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  signatureBox: {
    flex: 1,
  },
  signatureLabel: {
    fontSize: 8,
    color: colors.textLight,
    marginBottom: 5,
  },
  signatureLine: {
    height: 1,
    backgroundColor: colors.text,
    marginTop: 30,
  },

  // Contact Footer
  contactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactInfo: {},
  contactTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  contactText: {
    fontSize: 9,
    color: colors.text,
  },

  // QR Code
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  qrCodeLabel: {
    fontSize: 7,
    color: colors.textLight,
    marginTop: 3,
  },

  // Page Number
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: colors.textLight,
  },
})
