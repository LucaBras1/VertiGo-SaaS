import { StyleSheet } from '@react-pdf/renderer'

// Blue/grey color scheme for technical documents
export const stageRiderStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },

  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '3px solid #2563eb',
  },
  headerLeft: {
    width: '60%',
  },
  headerRight: {
    width: '35%',
    textAlign: 'right',
  },

  // Typography
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1e40af',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  documentType: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
    color: '#4b5563',
  },
  textBold: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1f2937',
  },

  // Summary section
  summarySection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderLeft: '4px solid #2563eb',
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1e40af',
  },

  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingBottom: 5,
    borderBottom: '2px solid #dbeafe',
  },
  sectionContent: {
    paddingLeft: 10,
  },

  // Table styles (for input list)
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    padding: 8,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 6,
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 6,
    backgroundColor: '#f9fafb',
  },
  tableColChannel: {
    width: '10%',
    textAlign: 'center',
  },
  tableColInstrument: {
    width: '35%',
  },
  tableColMic: {
    width: '35%',
  },
  tableColNotes: {
    width: '20%',
  },

  // Grid layout for requirements
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '48%',
    marginBottom: 8,
    marginRight: '2%',
  },
  gridItemFull: {
    width: '100%',
    marginBottom: 8,
  },

  // Info box styles
  infoBox: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 8,
  },
  infoBoxLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoBoxValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },

  // Backline list
  backlineItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '1px dashed #e5e7eb',
  },
  backlineItemName: {
    width: '30%',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#1f2937',
  },
  backlineItemSpec: {
    width: '60%',
    fontSize: 10,
    color: '#4b5563',
  },
  backlineItemOptional: {
    width: '10%',
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'right',
  },

  // Timing section
  timingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timingItem: {
    width: '50%',
    marginBottom: 10,
    paddingRight: 10,
  },
  timingLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  timingValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
  },

  // Hospitality
  hospitalitySection: {
    padding: 12,
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    borderRadius: 4,
    marginBottom: 15,
  },
  hospitalityTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#d97706',
  },

  // Notes section
  notesSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderLeft: '4px solid #ef4444',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#dc2626',
  },
  noteItem: {
    fontSize: 9,
    marginBottom: 4,
    color: '#7f1d1d',
  },

  // Contact footer
  contactFooter: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '2px solid #2563eb',
    paddingTop: 15,
  },
  contactTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 9,
    color: '#4b5563',
    marginBottom: 2,
  },

  // Page number
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    right: 40,
    color: '#9ca3af',
  },
})
