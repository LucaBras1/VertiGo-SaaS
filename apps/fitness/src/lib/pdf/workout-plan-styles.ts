import { StyleSheet } from '@react-pdf/renderer'

export const workoutPlanStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },

  // Header
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: '3px solid #10B981',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
  },
  sessionType: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4 10',
    borderRadius: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 5,
  },
  sessionDate: {
    fontSize: 11,
    color: '#6b7280',
  },

  // Summary cards row
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  summaryCardGreen: {
    backgroundColor: '#ecfdf5',
    borderBottom: '3px solid #10B981',
  },
  summaryCardBlue: {
    backgroundColor: '#eff6ff',
    borderBottom: '3px solid #3b82f6',
  },
  summaryCardOrange: {
    backgroundColor: '#fff7ed',
    borderBottom: '3px solid #f97316',
  },
  summaryCardPurple: {
    backgroundColor: '#faf5ff',
    borderBottom: '3px solid #8b5cf6',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryValueGreen: { color: '#059669' },
  summaryValueBlue: { color: '#2563eb' },
  summaryValueOrange: { color: '#ea580c' },
  summaryValuePurple: { color: '#7c3aed' },

  // Section styling
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '2px solid #e5e7eb',
  },
  sectionTitleWarmup: {
    color: '#f59e0b',
    borderBottomColor: '#fcd34d',
  },
  sectionTitleMain: {
    color: '#10B981',
    borderBottomColor: '#6ee7b7',
  },
  sectionTitleCooldown: {
    color: '#3b82f6',
    borderBottomColor: '#93c5fd',
  },

  // Warmup/Cooldown exercises
  simpleExercise: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1px solid #f3f4f6',
  },
  simpleExerciseName: {
    width: '45%',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  simpleExerciseDuration: {
    width: '25%',
    fontSize: 10,
    color: '#6b7280',
  },
  simpleExerciseNotes: {
    width: '30%',
    fontSize: 9,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // Main workout exercise card
  exerciseCard: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderLeft: '4px solid #10B981',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  exerciseMuscles: {
    fontSize: 8,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    padding: '2 6',
    borderRadius: 3,
  },
  exerciseDetails: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 15,
  },
  exerciseDetailItem: {
    alignItems: 'center',
  },
  exerciseDetailLabel: {
    fontSize: 7,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  exerciseDetailValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  exerciseFormTips: {
    fontSize: 9,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  exerciseAlternatives: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 4,
  },

  // Notes section
  notesSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    borderLeft: '4px solid #f59e0b',
  },
  notesSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 8,
  },
  notesSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
    marginTop: 8,
    marginBottom: 4,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  noteBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f59e0b',
    marginRight: 6,
    marginTop: 4,
  },
  noteText: {
    fontSize: 9,
    color: '#92400e',
    flex: 1,
  },
  motivationalTip: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#d97706',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fde68a',
    borderRadius: 4,
    textAlign: 'center',
  },

  // Safety reminders
  safetySection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderLeft: '4px solid #ef4444',
  },
  safetyTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 6,
  },
  safetyText: {
    fontSize: 9,
    color: '#991b1b',
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
  nextSession: {
    fontSize: 9,
    color: '#059669',
    fontWeight: 'bold',
  },
})
