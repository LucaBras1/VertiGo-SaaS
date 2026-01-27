import { Document, Page, Text, View } from '@react-pdf/renderer'
import { workoutPlanStyles as styles } from './workout-plan-styles'

interface WarmupExercise {
  exercise: string
  duration: string
  notes?: string
}

interface MainExercise {
  exercise: string
  sets: number
  reps: string
  restSeconds: number
  weight?: string
  muscleGroups: string[]
  alternatives: string[]
  formTips: string
}

interface CooldownExercise {
  exercise: string
  duration: string
  notes?: string
}

interface WorkoutSummary {
  totalDuration: number
  estimatedCalories: number
  difficulty: number
  muscleGroupsCovered: string[]
}

interface WorkoutNotes {
  focusPoints: string[]
  safetyReminders: string[]
  motivationalTip: string
  nextSessionSuggestion: string
}

export interface WorkoutPlanData {
  warmup: WarmupExercise[]
  mainWorkout: MainExercise[]
  cooldown: CooldownExercise[]
  summary: WorkoutSummary
  notes: WorkoutNotes
  client: {
    name: string
    fitnessLevel?: string
  }
  session: {
    date: string
    type: string
    duration: number
  }
  tenant: {
    name: string
    email?: string
    phone?: string
  }
}

function formatCzechDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function translateSessionType(type: string): string {
  const translations: Record<string, string> = {
    strength: 'Silový trénink',
    cardio: 'Kardio',
    hiit: 'HIIT',
    flexibility: 'Flexibilita',
    mixed: 'Kombinovaný',
  }
  return translations[type] || type
}

function translateMuscleGroup(muscle: string): string {
  const translations: Record<string, string> = {
    chest: 'Hrudník',
    back: 'Záda',
    shoulders: 'Ramena',
    arms: 'Paže',
    core: 'Střed těla',
    legs: 'Nohy',
    glutes: 'Hýždě',
    full_body: 'Celé tělo',
    hamstrings: 'Hamstringy',
  }
  return translations[muscle] || muscle
}

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 3) return 'Lehký'
  if (difficulty <= 5) return 'Střední'
  if (difficulty <= 7) return 'Náročný'
  return 'Velmi náročný'
}

export function WorkoutPlanPDF({ data }: { data: WorkoutPlanData }) {
  const { warmup, mainWorkout, cooldown, summary, notes, client, session, tenant } = data

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Tréninkový plán</Text>
            <Text style={styles.sessionType}>{translateSessionType(session.type)}</Text>
          </View>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.sessionDate}>{formatCzechDate(session.date)}</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Text style={styles.summaryLabel}>Délka</Text>
            <Text style={[styles.summaryValue, styles.summaryValueGreen]}>{summary.totalDuration} min</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardBlue]}>
            <Text style={styles.summaryLabel}>Kalorie</Text>
            <Text style={[styles.summaryValue, styles.summaryValueBlue]}>~{summary.estimatedCalories} kcal</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardOrange]}>
            <Text style={styles.summaryLabel}>Náročnost</Text>
            <Text style={[styles.summaryValue, styles.summaryValueOrange]}>{getDifficultyLabel(summary.difficulty)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardPurple]}>
            <Text style={styles.summaryLabel}>Cviky</Text>
            <Text style={[styles.summaryValue, styles.summaryValuePurple]}>{mainWorkout.length}</Text>
          </View>
        </View>

        {/* Warmup section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleWarmup]}>Rozcvicka</Text>
          {warmup.map((exercise, index) => (
            <View key={index} style={styles.simpleExercise}>
              <Text style={styles.simpleExerciseName}>{exercise.exercise}</Text>
              <Text style={styles.simpleExerciseDuration}>{exercise.duration}</Text>
              {exercise.notes && <Text style={styles.simpleExerciseNotes}>{exercise.notes}</Text>}
            </View>
          ))}
        </View>

        {/* Main workout section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleMain]}>Hlavni trenink</Text>
          {mainWorkout.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{index + 1}. {exercise.exercise}</Text>
                <Text style={styles.exerciseMuscles}>
                  {exercise.muscleGroups.map(translateMuscleGroup).join(', ')}
                </Text>
              </View>
              <View style={styles.exerciseDetails}>
                <View style={styles.exerciseDetailItem}>
                  <Text style={styles.exerciseDetailLabel}>Série</Text>
                  <Text style={styles.exerciseDetailValue}>{exercise.sets}</Text>
                </View>
                <View style={styles.exerciseDetailItem}>
                  <Text style={styles.exerciseDetailLabel}>Opakování</Text>
                  <Text style={styles.exerciseDetailValue}>{exercise.reps}</Text>
                </View>
                <View style={styles.exerciseDetailItem}>
                  <Text style={styles.exerciseDetailLabel}>Odpočinek</Text>
                  <Text style={styles.exerciseDetailValue}>{exercise.restSeconds}s</Text>
                </View>
                {exercise.weight && (
                  <View style={styles.exerciseDetailItem}>
                    <Text style={styles.exerciseDetailLabel}>Zátěž</Text>
                    <Text style={styles.exerciseDetailValue}>{exercise.weight}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.exerciseFormTips}>Tip: {exercise.formTips}</Text>
              {exercise.alternatives.length > 0 && (
                <Text style={styles.exerciseAlternatives}>
                  Alternativy: {exercise.alternatives.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Cooldown section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleCooldown]}>Zklidneni a protazeni</Text>
          {cooldown.map((exercise, index) => (
            <View key={index} style={styles.simpleExercise}>
              <Text style={styles.simpleExerciseName}>{exercise.exercise}</Text>
              <Text style={styles.simpleExerciseDuration}>{exercise.duration}</Text>
              {exercise.notes && <Text style={styles.simpleExerciseNotes}>{exercise.notes}</Text>}
            </View>
          ))}
        </View>

        {/* Notes section */}
        <View style={styles.notesSection}>
          <Text style={styles.notesSectionTitle}>Dulezite poznamky</Text>

          <Text style={styles.notesSubtitle}>Body zamereni:</Text>
          {notes.focusPoints.map((point, index) => (
            <View key={index} style={styles.noteItem}>
              <View style={styles.noteBullet} />
              <Text style={styles.noteText}>{point}</Text>
            </View>
          ))}

          <Text style={styles.motivationalTip}>"{notes.motivationalTip}"</Text>
        </View>

        {/* Safety reminders */}
        <View style={styles.safetySection}>
          <Text style={styles.safetyTitle}>Bezpecnostni pripominky</Text>
          {notes.safetyReminders.map((reminder, index) => (
            <Text key={index} style={styles.safetyText}>• {reminder}</Text>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerBold}>{tenant.name}</Text>
            {tenant.email && <Text style={styles.footerText}>{tenant.email}</Text>}
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.nextSession}>{notes.nextSessionSuggestion}</Text>
            <Text style={styles.footerText}>
              Svalove partie: {summary.muscleGroupsCovered.map(translateMuscleGroup).join(', ')}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
