/**
 * Objective Matcher AI Page
 * AI-powered activity matching based on team objectives
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { staggerContainer, staggerItem, slideUp } from '@vertigo/ui'
import {
  Target,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Link as LinkIcon,
  Loader2,
  SearchX,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react'

interface MatchRequest {
  objectives: string[]
  customObjectives: string
  teamContext: {
    size: number
    industry: string
  }
}

interface ActivityMatch {
  id: string
  title: string
  matchScore: number
  objectives: string[]
  duration: number
  rationale: string
}

interface IntegrationSuggestion {
  title: string
  description: string
  activities: string[]
}

interface MeasurementMetric {
  objective: string
  metrics: string[]
  assessmentMethod: string
}

interface MatchResult {
  matches: ActivityMatch[]
  integrationSuggestions: IntegrationSuggestion[]
  measurementMetrics: MeasurementMetric[]
}

const OBJECTIVES = [
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'TRUST', label: 'Trust Building' },
  { value: 'LEADERSHIP', label: 'Leadership Development' },
  { value: 'PROBLEM_SOLVING', label: 'Problem Solving' },
  { value: 'CREATIVITY', label: 'Creative Thinking' },
  { value: 'COLLABORATION', label: 'Team Collaboration' },
]

const INDUSTRIES = [
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'OTHER', label: 'Other' },
]

function MatchScoreCircle({ score }: { score: number }) {
  const percentage = Math.round(score * 100)
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage >= 80)
      return {
        stroke: 'text-emerald-500 dark:text-emerald-400',
        bg: 'text-emerald-100 dark:text-emerald-900/30',
        label: 'text-emerald-700 dark:text-emerald-300',
      }
    if (percentage >= 60)
      return {
        stroke: 'text-brand-500 dark:text-brand-400',
        bg: 'text-brand-100 dark:text-brand-900/30',
        label: 'text-brand-700 dark:text-brand-300',
      }
    return {
      stroke: 'text-amber-500 dark:text-amber-400',
      bg: 'text-amber-100 dark:text-amber-900/30',
      label: 'text-amber-700 dark:text-amber-300',
    }
  }

  const colors = getColor()

  return (
    <div className="flex flex-col items-center">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          className={colors.bg}
          stroke="currentColor"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className={colors.stroke}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className={`text-xs font-bold mt-1 ${colors.label}`}>{percentage}%</span>
    </div>
  )
}

export default function ObjectiveMatcherPage() {
  const [matchRequest, setMatchRequest] = useState<MatchRequest>({
    objectives: [],
    customObjectives: '',
    teamContext: {
      size: 10,
      industry: 'TECHNOLOGY',
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleObjectiveToggle = (objective: string) => {
    setMatchRequest((prev) => ({
      ...prev,
      objectives: prev.objectives.includes(objective)
        ? prev.objectives.filter((o) => o !== objective)
        : [...prev.objectives, objective],
    }))
  }

  const handleFindActivities = async () => {
    if (matchRequest.objectives.length === 0 && !matchRequest.customObjectives.trim()) {
      setError('Please select at least one objective or enter custom objectives')
      return
    }

    if (matchRequest.teamContext.size < 2) {
      setError('Team size must be at least 2')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/match-objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchRequest),
      })

      if (!response.ok) {
        throw new Error('Failed to match objectives')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Matching error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* AI Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50/80 to-blue-50/80 p-8 dark:from-violet-950/30 dark:to-blue-950/30">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-800/20" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-violet-200/20 blur-3xl dark:bg-violet-800/15" />
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Objective Matcher AI
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Find the perfect activities for your team&apos;s objectives
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Input Form */}
      <motion.div variants={slideUp} initial="hidden" animate="visible">
        <Card hover={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500 dark:text-brand-400" />
              Team Objectives &amp; Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Objectives */}
            <div>
                <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Primary Objectives
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {OBJECTIVES.map((objective) => (
                    <button
                      key={objective.value}
                      type="button"
                      onClick={() => handleObjectiveToggle(objective.value)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                        matchRequest.objectives.includes(objective.value)
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/30 dark:text-brand-300'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-600'
                      }`}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 transition-colors ${
                          matchRequest.objectives.includes(objective.value)
                            ? 'text-brand-500 dark:text-brand-400'
                            : 'text-neutral-300 dark:text-neutral-600'
                        }`}
                      />
                      {objective.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Objectives */}
            <div>
              <label htmlFor="custom-objectives" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Custom Objectives (Optional)
              </label>
              <textarea
                id="custom-objectives"
                value={matchRequest.customObjectives}
                onChange={(e) =>
                  setMatchRequest((prev) => ({ ...prev, customObjectives: e.target.value }))
                }
                placeholder="Enter any additional objectives or specific goals for your team..."
                rows={4}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 resize-none"
              />
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Describe any specific goals or outcomes you want to achieve
              </p>
            </div>

            {/* Team Context */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="team-size" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Team Size
                </label>
                <Input
                  id="team-size"
                  type="number"
                  min="2"
                  max="100"
                  value={matchRequest.teamContext.size}
                  onChange={(e) =>
                    setMatchRequest((prev) => ({
                      ...prev,
                      teamContext: { ...prev.teamContext, size: parseInt(e.target.value) || 0 },
                    }))
                  }
                  placeholder="Enter team size"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Industry
                </label>
                <select
                  id="industry"
                  value={matchRequest.teamContext.industry}
                  onChange={(e) =>
                    setMatchRequest((prev) => ({
                      ...prev,
                      teamContext: { ...prev.teamContext, industry: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/20"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

            {/* Find Activities Button */}
            <Button
              onClick={handleFindActivities}
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding Activities...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Find Activities
                  </span>
                )}
            </Button>
          </div>
        </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="relative mb-6">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500 dark:border-brand-900/30 dark:border-t-brand-400" />
              <Target className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-brand-500 dark:text-brand-400" />
            </div>
            <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Analyzing Objectives
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              AI is finding the best activity matches for your team...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Matched Activities */}
            <motion.div variants={staggerItem}>
              <Card hover={false}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-brand-500 dark:text-brand-400" />
                    Matched Activities
                  </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.matches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                      <SearchX className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                      <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                    No matching activities found
                      </p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Try adjusting your objectives or team context
                      </p>
                    </div>
                ) : (
                  result.matches.map((match) => (
                    <motion.div
                      key={match.id}
                      variants={staggerItem}
                      className="flex gap-4 rounded-xl border border-neutral-200 p-4 transition-colors hover:border-brand-300 dark:border-neutral-700 dark:hover:border-brand-600"
                    >
                      <div className="flex-shrink-0 pt-1">
                        <MatchScoreCircle score={match.matchScore} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {match.title}
                        </h5>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          {match.rationale}
                        </p>
                        <div className="mt-3 flex items-center gap-4">
                          <span className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                            <Clock className="h-3.5 w-3.5" />
                            {match.duration} min
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {match.objectives.map((obj) => (
                            <span
                              key={obj}
                              className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950/30 dark:text-brand-300"
                            >
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
              </Card>
            </motion.div>

            {/* Integration Suggestions */}
            {result.integrationSuggestions.length > 0 && (
              <motion.div variants={staggerItem}>
                <Card hover={false}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-6 h-6 text-brand-500 dark:text-brand-400" />
                  Integration Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.integrationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-800 dark:bg-brand-950/20"
                    >
                      <h5 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        {suggestion.title}
                      </h5>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{suggestion.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.activities.map((activity, actIndex) => (
                          <span
                            key={actIndex}
                            className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-700 dark:bg-brand-950/30 dark:text-brand-300"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Measurement Metrics */}
            {result.measurementMetrics.length > 0 && (
              <motion.div variants={staggerItem}>
                <Card hover={false}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-brand-500 dark:text-brand-400" />
                  Success Measurement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.measurementMetrics.map((metric, index) => (
                    <div key={index} className="pb-6 border-b border-neutral-200 dark:border-neutral-700 last:border-0 last:pb-0">
                      <h5 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-brand-500 dark:text-brand-400" />
                        {metric.objective}
                      </h5>
                      <div className="mb-3">
                        <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Key Metrics:</h6>
                        <ul className="space-y-1">
                          {metric.metrics.map((m, mIndex) => (
                            <li key={mIndex} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                              <span className="text-brand-500 dark:text-brand-400 mt-1">•</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                        <h6 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Assessment Method:
                        </h6>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{metric.assessmentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
