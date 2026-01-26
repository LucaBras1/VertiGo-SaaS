import { Document, Page, Text, View } from '@react-pdf/renderer'
import { stageRiderStyles as styles } from './stage-rider-styles'
import type { StageRider } from '../ai/stage-rider-generator'

export interface StageRiderPDFData extends StageRider {
  // Additional fields for PDF generation
  generatedDate?: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function StageRiderPDF({ data }: { data: StageRiderPDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.documentType}>Technical Rider</Text>
            <Text style={styles.title}>{data.bandName}</Text>
            <Text style={styles.subtitle}>Stage & Sound Requirements</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.text}>Datum: {formatDate(data.riderDate)}</Text>
            {data.contactPerson?.name && (
              <Text style={styles.text}>Kontakt: {data.contactPerson.name}</Text>
            )}
            {data.contactPerson?.phone && (
              <Text style={styles.text}>{data.contactPerson.phone}</Text>
            )}
            {data.contactPerson?.email && (
              <Text style={styles.text}>{data.contactPerson.email}</Text>
            )}
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryText}>{data.summary}</Text>
        </View>

        {/* Input List */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            Input List ({data.inputList.length} channels)
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableColChannel]}>CH</Text>
              <Text style={[styles.tableHeaderText, styles.tableColInstrument]}>Instrument</Text>
              <Text style={[styles.tableHeaderText, styles.tableColMic]}>Mikrofon</Text>
              <Text style={[styles.tableHeaderText, styles.tableColNotes]}>Pozn.</Text>
            </View>
            {data.inputList.map((input, index) => (
              <View
                key={index}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.text, styles.tableColChannel]}>{input.channel}</Text>
                <Text style={[styles.text, styles.tableColInstrument]}>{input.instrument}</Text>
                <Text style={[styles.text, styles.tableColMic]}>{input.microphone || '-'}</Text>
                <Text style={[styles.text, styles.tableColNotes]}>{input.notes || ''}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monitor Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Monitor Requirements</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Pocet monitoru</Text>
                <Text style={styles.infoBoxValue}>{data.monitors.quantity}x</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Mix Type</Text>
                <Text style={styles.infoBoxValue}>{data.monitors.mixType}</Text>
              </View>
            </View>
            <View style={styles.gridItemFull}>
              <Text style={styles.text}>{data.monitors.configuration}</Text>
              {data.monitors.notes && (
                <Text style={[styles.text, { fontStyle: 'italic' }]}>{data.monitors.notes}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Backline Requirements */}
        {data.backline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Backline Requirements</Text>
            <View style={styles.sectionContent}>
              {data.backline.map((item, index) => (
                <View key={index} style={styles.backlineItem}>
                  <Text style={styles.backlineItemName}>{item.item}</Text>
                  <Text style={styles.backlineItemSpec}>{item.specifications}</Text>
                  <Text style={styles.backlineItemOptional}>
                    {item.optional ? '(opt.)' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stage Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Stage Requirements</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Minimalni velikost</Text>
                <Text style={styles.infoBoxValue}>{data.stage.minimumSize}</Text>
              </View>
            </View>
            {data.stage.ceilingHeight && (
              <View style={styles.gridItem}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>Vyska stropu</Text>
                  <Text style={styles.infoBoxValue}>{data.stage.ceilingHeight}</Text>
                </View>
              </View>
            )}
            <View style={styles.gridItemFull}>
              <Text style={styles.textBold}>Elektrina: </Text>
              <Text style={styles.text}>{data.stage.powerOutlets}</Text>
              {data.stage.notes && (
                <Text style={[styles.text, { marginTop: 4 }]}>{data.stage.notes}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Sound System */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Sound System</Text>
          <View style={styles.sectionContent}>
            {data.soundSystem.required ? (
              <>
                <Text style={styles.textBold}>Vyzadovan zvukovy system od venue</Text>
                {data.soundSystem.specifications && (
                  <Text style={styles.text}>{data.soundSystem.specifications}</Text>
                )}
                {data.soundSystem.notes && (
                  <Text style={[styles.text, { fontStyle: 'italic' }]}>{data.soundSystem.notes}</Text>
                )}
              </>
            ) : (
              <Text style={styles.text}>Kapela pouziva vlastni PA system</Text>
            )}
          </View>
        </View>

        {/* Lighting (if applicable) */}
        {data.lighting && data.lighting.required && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Lighting</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.text}>{data.lighting.specifications || 'Basic stage lighting required'}</Text>
            </View>
          </View>
        )}

        {/* Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Timing</Text>
          <View style={styles.timingGrid}>
            <View style={styles.timingItem}>
              <Text style={styles.timingLabel}>Load-in</Text>
              <Text style={styles.timingValue}>{data.timing.loadInTime}</Text>
            </View>
            <View style={styles.timingItem}>
              <Text style={styles.timingLabel}>Soundcheck</Text>
              <Text style={styles.timingValue}>{data.timing.soundcheckDuration}</Text>
            </View>
            <View style={styles.timingItem}>
              <Text style={styles.timingLabel}>Setup</Text>
              <Text style={styles.timingValue}>{data.timing.setupTime}</Text>
            </View>
            <View style={styles.timingItem}>
              <Text style={styles.timingLabel}>Teardown</Text>
              <Text style={styles.timingValue}>{data.timing.teardownTime}</Text>
            </View>
          </View>
        </View>

        {/* Hospitality */}
        <View style={styles.hospitalitySection}>
          <Text style={styles.hospitalityTitle}>Hospitality</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.textBold}>Green Room: </Text>
              <Text style={styles.text}>
                {data.hospitality.greenRoom ? 'Ano' : 'Neni nutne'}
              </Text>
              {data.hospitality.greenRoomRequirements && (
                <Text style={styles.text}>{data.hospitality.greenRoomRequirements}</Text>
              )}
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.textBold}>Parkovani: </Text>
              <Text style={styles.text}>{data.hospitality.parking}</Text>
            </View>
            {data.hospitality.catering && (
              <View style={styles.gridItemFull}>
                <Text style={styles.textBold}>Catering: </Text>
                <Text style={styles.text}>{data.hospitality.catering}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Notes */}
        {data.additionalNotes && data.additionalNotes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Dulezite poznamky</Text>
            {data.additionalNotes.map((note, index) => (
              <Text key={index} style={styles.noteItem}>
                - {note}
              </Text>
            ))}
          </View>
        )}

        {/* Contact Footer */}
        <View style={styles.contactFooter}>
          <Text style={styles.contactTitle}>Kontakt pro technicke dotazy</Text>
          <Text style={styles.contactText}>{data.footer}</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
