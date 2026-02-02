import { Document, Page, Text, View, Image, Svg, Path, Circle, Rect, Line } from '@react-pdf/renderer'
import { stageRiderStylesV2 as styles } from './stage-rider-styles-v2'
import type { StageRider } from '../ai/stage-rider-generator'

export interface StageRiderPDFV2Data extends StageRider {
  logoUrl?: string
  eventName?: string
  eventDate?: string
  venueName?: string
  venueAddress?: string
  bandMembers?: number
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Simple QR Code component (placeholder - real QR would need a library)
function ContactQRCode({ contact }: { contact: { email?: string; phone?: string } }) {
  const contactData = [contact.phone, contact.email].filter(Boolean).join(' | ')
  return (
    <View style={styles.qrCodeContainer}>
      <Svg viewBox="0 0 100 100" style={styles.qrCode}>
        {/* QR Code placeholder pattern */}
        <Rect x="0" y="0" width="100" height="100" fill="#ffffff" />
        <Rect x="5" y="5" width="25" height="25" fill="#000000" />
        <Rect x="70" y="5" width="25" height="25" fill="#000000" />
        <Rect x="5" y="70" width="25" height="25" fill="#000000" />
        <Rect x="10" y="10" width="15" height="15" fill="#ffffff" />
        <Rect x="75" y="10" width="15" height="15" fill="#ffffff" />
        <Rect x="10" y="75" width="15" height="15" fill="#ffffff" />
        <Rect x="13" y="13" width="9" height="9" fill="#000000" />
        <Rect x="78" y="13" width="9" height="9" fill="#000000" />
        <Rect x="13" y="78" width="9" height="9" fill="#000000" />
        {/* Data pattern */}
        <Rect x="35" y="35" width="30" height="30" fill="#000000" />
        <Rect x="40" y="40" width="20" height="20" fill="#ffffff" />
        <Rect x="45" y="45" width="10" height="10" fill="#000000" />
      </Svg>
      <Text style={styles.qrCodeLabel}>Scan pro kontakt</Text>
    </View>
  )
}

// Stage Plot Diagram Component
function StagePlotDiagram({ bandMembers, instruments }: {
  bandMembers?: number
  instruments?: { instrument: string }[]
}) {
  const memberCount = bandMembers || 4
  const width = 200
  const height = 120
  const stageWidth = 180
  const stageHeight = 100

  // Calculate positions for band members
  const positions = []
  const cols = Math.min(memberCount, 4)
  const rows = Math.ceil(memberCount / 4)

  for (let i = 0; i < memberCount; i++) {
    const row = Math.floor(i / 4)
    const col = i % 4
    const colsInRow = row === rows - 1 ? memberCount % 4 || 4 : 4
    const x = 10 + (stageWidth / (colsInRow + 1)) * (col + 1)
    const y = 15 + (stageHeight / (rows + 1)) * (row + 1)
    positions.push({ x, y, label: instruments?.[i]?.instrument || `#${i + 1}` })
  }

  return (
    <View style={styles.stagePlotContainer}>
      <Text style={styles.stagePlotTitle}>Stage Plot</Text>
      <Svg viewBox={`0 0 ${width} ${height}`} style={styles.stagePlot}>
        {/* Stage outline */}
        <Rect
          x="10"
          y="10"
          width={stageWidth}
          height={stageHeight}
          fill="#f3f4f6"
          stroke="#374151"
          strokeWidth="2"
        />
        {/* Front of stage label */}
        <Text x={width / 2} y={height - 2} style={{ fontSize: 6, textAnchor: 'middle' }}>
          FRONT
        </Text>
        {/* Band member positions */}
        {positions.map((pos, i) => (
          <View key={i}>
            <Circle cx={pos.x} cy={pos.y} r="12" fill="#6366f1" />
            <Text
              x={pos.x}
              y={pos.y + 3}
              style={{ fontSize: 6, fill: '#ffffff', textAnchor: 'middle' }}
            >
              {i + 1}
            </Text>
          </View>
        ))}
        {/* Drum riser (if drums detected) */}
        {instruments?.some(i => i.instrument.toLowerCase().includes('drum')) && (
          <Rect
            x={stageWidth / 2 - 20}
            y="25"
            width="50"
            height="35"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}
      </Svg>
      <View style={styles.stagePlotLegend}>
        {positions.map((pos, i) => (
          <Text key={i} style={styles.stagePlotLegendItem}>
            {i + 1}: {pos.label}
          </Text>
        ))}
      </View>
    </View>
  )
}

// Timeline visualization component
function TimelineVisualization({ timing }: { timing: StageRider['timing'] }) {
  return (
    <View style={styles.timeline}>
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineLabel}>Load-in</Text>
          <Text style={styles.timelineValue}>{timing.loadInTime}</Text>
        </View>
      </View>
      <View style={styles.timelineLine} />
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: '#3b82f6' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineLabel}>Soundcheck</Text>
          <Text style={styles.timelineValue}>{timing.soundcheckDuration}</Text>
        </View>
      </View>
      <View style={styles.timelineLine} />
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineLabel}>Setup</Text>
          <Text style={styles.timelineValue}>{timing.setupTime}</Text>
        </View>
      </View>
      <View style={styles.timelineLine} />
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: '#8b5cf6' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineLabel}>Performance</Text>
          <Text style={styles.timelineValue}>-</Text>
        </View>
      </View>
      <View style={styles.timelineLine} />
      <View style={styles.timelineItem}>
        <View style={[styles.timelineDot, { backgroundColor: '#ef4444' }]} />
        <View style={styles.timelineContent}>
          <Text style={styles.timelineLabel}>Teardown</Text>
          <Text style={styles.timelineValue}>{timing.teardownTime}</Text>
        </View>
      </View>
    </View>
  )
}

export function StageRiderPDFV2({ data }: { data: StageRiderPDFV2Data }) {
  // Group input list by instrument type for color coding
  const groupedInputs = data.inputList.reduce((acc, input) => {
    const type = input.instrument.toLowerCase().includes('drum') ? 'drums' :
                 input.instrument.toLowerCase().includes('vocal') ? 'vocals' :
                 input.instrument.toLowerCase().includes('guitar') ? 'guitars' :
                 input.instrument.toLowerCase().includes('bass') ? 'bass' :
                 input.instrument.toLowerCase().includes('key') ? 'keys' : 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(input)
    return acc
  }, {} as Record<string, typeof data.inputList>)

  const typeColors: Record<string, string> = {
    drums: '#fef3c7',
    vocals: '#dbeafe',
    guitars: '#dcfce7',
    bass: '#f3e8ff',
    keys: '#fce7f3',
    other: '#f3f4f6',
  }

  return (
    <Document>
      {/* Page 1: Cover & Input List */}
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {data.logoUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={data.logoUrl} style={styles.logo} />
            )}
            <View>
              <Text style={styles.documentType}>TECHNICAL RIDER</Text>
              <Text style={styles.title}>{data.bandName}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {data.eventName && (
              <Text style={styles.eventName}>{data.eventName}</Text>
            )}
            <Text style={styles.dateText}>{formatDate(data.riderDate)}</Text>
            {data.venueName && (
              <Text style={styles.venueText}>{data.venueName}</Text>
            )}
          </View>
        </View>

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>{data.summary}</Text>
        </View>

        {/* Key Specs Grid */}
        <View style={styles.specsGrid}>
          <View style={styles.specItem}>
            <Text style={styles.specValue}>{data.inputList.length}</Text>
            <Text style={styles.specLabel}>Kanálů</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specValue}>{data.monitors.quantity}</Text>
            <Text style={styles.specLabel}>Monitorů</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specValue}>{data.stage.minimumSize}</Text>
            <Text style={styles.specLabel}>Stage</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specValue}>{data.bandMembers || '-'}</Text>
            <Text style={styles.specLabel}>Členů</Text>
          </View>
        </View>

        {/* Input List with Color Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>INPUT LIST</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableColChannel]}>CH</Text>
              <Text style={[styles.tableHeaderText, styles.tableColInstrument]}>Instrument</Text>
              <Text style={[styles.tableHeaderText, styles.tableColMic]}>Mikrofon</Text>
              <Text style={[styles.tableHeaderText, styles.tableColPhantom]}>+48V</Text>
              <Text style={[styles.tableHeaderText, styles.tableColNotes]}>Poznámky</Text>
            </View>
            {Object.entries(groupedInputs).map(([type, inputs]) => (
              inputs.map((input, index) => (
                <View
                  key={`${type}-${index}`}
                  style={[styles.tableRow, { backgroundColor: typeColors[type] || '#ffffff' }]}
                >
                  <Text style={[styles.tableCell, styles.tableColChannel]}>{input.channel}</Text>
                  <Text style={[styles.tableCell, styles.tableColInstrument]}>{input.instrument}</Text>
                  <Text style={[styles.tableCell, styles.tableColMic]}>{input.microphone || '-'}</Text>
                  <Text style={[styles.tableCell, styles.tableColPhantom]}>
                    {input.microphone?.toLowerCase().includes('condenser') ? 'ANO' : '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableColNotes]}>{input.notes || ''}</Text>
                </View>
              ))
            ))}
          </View>

          {/* Color Legend */}
          <View style={styles.colorLegend}>
            {Object.entries(typeColors).filter(([type]) => groupedInputs[type]?.length).map(([type, color]) => (
              <View key={type} style={styles.colorLegendItem}>
                <View style={[styles.colorBox, { backgroundColor: color }]} />
                <Text style={styles.colorLegendText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* Page 2: Stage Plot & Technical Requirements */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>{data.bandName}</Text>
          <Text style={styles.pageHeaderSubtitle}>Stage Plot & Requirements</Text>
        </View>

        {/* Stage Plot */}
        <StagePlotDiagram
          bandMembers={data.bandMembers}
          instruments={data.inputList}
        />

        {/* Monitor Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>MONITOR REQUIREMENTS</Text>
          <View style={styles.requirementsGrid}>
            <View style={styles.requirementBox}>
              <Text style={styles.requirementLabel}>Počet</Text>
              <Text style={styles.requirementValue}>{data.monitors.quantity}x wedge</Text>
            </View>
            <View style={styles.requirementBox}>
              <Text style={styles.requirementLabel}>Mix Type</Text>
              <Text style={styles.requirementValue}>{data.monitors.mixType}</Text>
            </View>
          </View>
          <Text style={styles.requirementNote}>{data.monitors.configuration}</Text>
          {data.monitors.notes && (
            <Text style={styles.requirementNote}>{data.monitors.notes}</Text>
          )}
        </View>

        {/* Stage Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>STAGE REQUIREMENTS</Text>
          <View style={styles.requirementsGrid}>
            <View style={styles.requirementBox}>
              <Text style={styles.requirementLabel}>Min. velikost</Text>
              <Text style={styles.requirementValue}>{data.stage.minimumSize}</Text>
            </View>
            {data.stage.ceilingHeight && (
              <View style={styles.requirementBox}>
                <Text style={styles.requirementLabel}>Výška stropu</Text>
                <Text style={styles.requirementValue}>{data.stage.ceilingHeight}</Text>
              </View>
            )}
            <View style={styles.requirementBox}>
              <Text style={styles.requirementLabel}>Elektřina</Text>
              <Text style={styles.requirementValue}>{data.stage.powerOutlets}</Text>
            </View>
          </View>
          {data.stage.notes && (
            <Text style={styles.requirementNote}>{data.stage.notes}</Text>
          )}
        </View>

        {/* Backline */}
        {data.backline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>BACKLINE REQUIREMENTS</Text>
            <View style={styles.backlineList}>
              {data.backline.map((item, index) => (
                <View key={index} style={styles.backlineItem}>
                  <View style={styles.backlineItemDot} />
                  <View style={styles.backlineItemContent}>
                    <Text style={styles.backlineItemName}>{item.item}</Text>
                    <Text style={styles.backlineItemSpec}>{item.specifications}</Text>
                    {item.optional && (
                      <Text style={styles.backlineItemOptional}>(optional)</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* Page 3: Timeline, Hospitality & Contact */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderTitle}>{data.bandName}</Text>
          <Text style={styles.pageHeaderSubtitle}>Timing & Hospitality</Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>TIMELINE</Text>
          <TimelineVisualization timing={data.timing} />
        </View>

        {/* Hospitality */}
        <View style={styles.hospitalitySection}>
          <Text style={styles.sectionHeader}>HOSPITALITY</Text>
          <View style={styles.hospitalityGrid}>
            <View style={styles.hospitalityItem}>
              <Text style={styles.hospitalityLabel}>Green Room</Text>
              <Text style={styles.hospitalityValue}>
                {data.hospitality.greenRoom ? 'Ano' : 'Není nutné'}
              </Text>
              {data.hospitality.greenRoomRequirements && (
                <Text style={styles.hospitalityNote}>{data.hospitality.greenRoomRequirements}</Text>
              )}
            </View>
            <View style={styles.hospitalityItem}>
              <Text style={styles.hospitalityLabel}>Parkování</Text>
              <Text style={styles.hospitalityValue}>{data.hospitality.parking}</Text>
            </View>
            {data.hospitality.catering && (
              <View style={styles.hospitalityItem}>
                <Text style={styles.hospitalityLabel}>Catering</Text>
                <Text style={styles.hospitalityValue}>{data.hospitality.catering}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Notes */}
        {data.additionalNotes && data.additionalNotes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionHeader}>DŮLEŽITÉ POZNÁMKY</Text>
            {data.additionalNotes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Text style={styles.noteBullet}>!</Text>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Signature Area */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Potvrzení venue</Text>
          <View style={styles.signatureGrid}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Podpis venue managera</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Datum</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
        </View>

        {/* Contact Footer with QR */}
        <View style={styles.contactFooter}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Kontakt pro technické dotazy</Text>
            {data.contactPerson?.name && (
              <Text style={styles.contactText}>{data.contactPerson.name}</Text>
            )}
            {data.contactPerson?.phone && (
              <Text style={styles.contactText}>{data.contactPerson.phone}</Text>
            )}
            {data.contactPerson?.email && (
              <Text style={styles.contactText}>{data.contactPerson.email}</Text>
            )}
          </View>
          <ContactQRCode contact={data.contactPerson || {}} />
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}
