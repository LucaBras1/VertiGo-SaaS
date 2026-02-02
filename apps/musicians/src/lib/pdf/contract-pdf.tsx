/**
 * Contract PDF Template
 * Professional A4 contract document with react-pdf
 */

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type {
  PerformerInfo,
  ClientInfo,
  EventDetails,
  FinancialTerms,
  ContractSection,
  ContractClauseData,
} from '@/lib/services/contracts'
import { substituteVariables } from '@/lib/services/contracts'
import { buildVariableMap } from '@/lib/ai/contract-generator'

// Register fonts for better Czech text support
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 700,
    },
  ],
})

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    padding: 50,
    paddingBottom: 70,
    color: '#1f2937',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  contractNumber: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#2563eb',
    marginBottom: 8,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },
  sectionContent: {
    fontSize: 10,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  clause: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  clauseTitle: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 5,
  },
  clauseContent: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#4b5563',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af',
  },
  signatureBlock: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureArea: {
    width: '45%',
  },
  signatureLine: {
    borderTop: '1px solid #1f2937',
    marginTop: 50,
    paddingTop: 5,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
})

// Props interface
export interface ContractPDFProps {
  contractNumber: string
  title: string
  language: 'CS' | 'EN'
  performerInfo: PerformerInfo
  clientInfo: ClientInfo
  eventDetails: EventDetails
  financialTerms: FinancialTerms
  sections: ContractSection[]
  clauses: ContractClauseData[]
  createdAt?: Date
}

// Main component
export function ContractPDF({
  contractNumber,
  title,
  language,
  performerInfo,
  clientInfo,
  eventDetails,
  financialTerms,
  sections,
  clauses,
  createdAt = new Date(),
}: ContractPDFProps) {
  // Build variable map for substitution
  const variables = buildVariableMap(
    performerInfo,
    clientInfo,
    eventDetails,
    financialTerms,
    contractNumber
  )

  // Labels based on language
  const labels = {
    contract: language === 'CS' ? 'SMLOUVA O HUDEBNÍ PRODUKCI' : 'PERFORMANCE CONTRACT',
    contractNumber: language === 'CS' ? 'Číslo smlouvy' : 'Contract Number',
    date: language === 'CS' ? 'Datum' : 'Date',
    page: language === 'CS' ? 'Strana' : 'Page',
    of: language === 'CS' ? 'z' : 'of',
    additionalTerms: language === 'CS' ? 'Dodatečná ustanovení' : 'Additional Terms',
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title || labels.contract}</Text>
          <Text style={styles.subtitle}>
            {labels.contractNumber}: {contractNumber}
          </Text>
          <Text style={styles.contractNumber}>
            {labels.date}: {createdAt.toLocaleDateString(language === 'CS' ? 'cs-CZ' : 'en-US')}
          </Text>
        </View>

        {/* Sections */}
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>
                {substituteVariables(section.content, variables)}
              </Text>
            </View>
          ))}

        {/* Clauses */}
        {clauses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.additionalTerms}</Text>
            {clauses
              .sort((a, b) => a.order - b.order)
              .map((clause) => (
                <View key={clause.clauseId} style={styles.clause}>
                  <Text style={styles.clauseTitle}>{clause.title}</Text>
                  <Text style={styles.clauseContent}>
                    {substituteVariables(clause.content, variables)}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {contractNumber} | {performerInfo.name}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}

export default ContractPDF
