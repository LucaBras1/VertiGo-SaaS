import { StyleSheet } from '@react-pdf/renderer'

// PartyPal branding colors
const COLORS = {
  primary: '#EC4899', // Fun Pink
  secondary: '#FACC15', // Playful Yellow
  dark: '#1f2937',
  gray: '#4b5563',
  lightGray: '#9ca3af',
  border: '#e5e7eb',
  background: '#fdf2f8', // Light pink background
  yellowLight: '#fef9c3', // Light yellow
}

export const invoiceStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.dark,
  },

  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: `2px solid ${COLORS.primary}`,
  },
  companyInfo: {
    width: '50%',
  },
  invoiceInfo: {
    width: '45%',
    textAlign: 'right',
  },

  // Typography
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#374151',
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    color: COLORS.gray,
  },
  textBold: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: COLORS.dark,
  },

  // Invoice number badge
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.dark,
  },

  // Customer section
  customerSection: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    borderLeft: `4px solid ${COLORS.primary}`,
  },
  customerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Party details section
  partySection: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.yellowLight,
    borderRadius: 4,
    borderLeft: `4px solid ${COLORS.secondary}`,
  },
  partyTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ca8a04',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partyText: {
    fontSize: 10,
    marginBottom: 4,
    color: '#78350f',
  },

  // Table styles
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 10,
    borderBottom: `2px solid ${COLORS.primary}`,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1px solid ${COLORS.border}`,
    padding: 10,
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: 10,
  },

  // Table columns
  tableColDescription: {
    width: '50%',
    paddingRight: 8,
  },
  tableColQuantity: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 8,
  },
  tableColPrice: {
    width: '17.5%',
    textAlign: 'right',
    paddingRight: 8,
  },
  tableColTotal: {
    width: '17.5%',
    textAlign: 'right',
  },

  // Table header columns (white text)
  tableColDescriptionHeader: {
    width: '50%',
    paddingRight: 8,
    color: '#ffffff',
  },
  tableColQuantityHeader: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 8,
    color: '#ffffff',
  },
  tableColPriceHeader: {
    width: '17.5%',
    textAlign: 'right',
    paddingRight: 8,
    color: '#ffffff',
  },
  tableColTotalHeader: {
    width: '17.5%',
    textAlign: 'right',
    color: '#ffffff',
  },

  // Totals section
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
  },
  totalRowBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 12,
    paddingBottom: 8,
    borderTop: '2px solid #d1d5db',
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.gray,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  totalLabelFinal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValueFinal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Bank details section (yellow accent)
  bankSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: COLORS.yellowLight,
    borderLeft: `4px solid ${COLORS.secondary}`,
    borderRadius: 4,
  },
  bankTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ca8a04',
  },
  bankText: {
    fontSize: 10,
    marginBottom: 4,
    color: '#78350f',
  },

  // Notes section
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderLeft: `4px solid ${COLORS.lightGray}`,
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.gray,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.gray,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
  },
  footerTextBold: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
})
