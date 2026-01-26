import { StyleSheet } from '@react-pdf/renderer'

export const invoiceStyles = StyleSheet.create({
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
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: '2px solid #e5e7eb',
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
    color: '#111827',
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
    color: '#4b5563',
  },
  textBold: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },

  // Invoice number badge
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },

  // Customer section
  customerSection: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  customerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Table styles
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderBottom: '2px solid #d1d5db',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
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
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalLabelFinal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValueFinal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },

  // Bank details section
  bankSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderLeft: '4px solid #059669',
    borderRadius: 4,
  },
  bankTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#047857',
  },
  bankText: {
    fontSize: 10,
    marginBottom: 4,
    color: '#065f46',
  },

  // Notes section
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#d97706',
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#92400e',
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
    color: '#6b7280',
  },
  footerTextBold: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4b5563',
  },
})
