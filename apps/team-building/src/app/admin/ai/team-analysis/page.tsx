/**
 * Team Analysis AI Page
 * Provides AI-powered team dynamics analysis and activity recommendations
 *
 * Redesigned with VertiGo design system:
 * - AI gradient header with motion
 * - Dark mode support throughout
 * - Semantic neutral-* color tokens
 * - Stagger animations for results
 * - Circular progress rings for match scores
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { staggerContainer, staggerItem } from '@vertigo/ui'
import {
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Sparkles,
  ListOrdered,
} from 'lucide-react'

interface TeamProfile {
  size: number
  objectives: string[]
  industry: string
  physicalLevel: string
  indoorOutdoor: string
  duration: number
}

interface ActivityRecommendation {
  id: string
  title: string
  matchScore: number
  objectives: string[]
  duration: number
  physicalLevel: string
}

interface TeamAnalysis {
  strengths: string[]
  challenges: string[]
  recommendations: string[]
}

interface AnalysisResult {
  teamAnalysis: TeamAnalysis
  recommendedActivities: ActivityRecommendation[]
  suggestedSequence: string[]
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

const PHYSICAL_LEVELS = [
  { value: 'LOW', label: 'Low Physical Demand' },
  { value: 'MEDIUM', label: 'Medium Physical Demand' },
  { value: 'HIGH', label: 'High Physical Demand' },
]

const ENVIRONMENTS = [
  { value: 'INDOOR', label: 'Indoor Only' },
  { value: 'OUTDOOR', label: 'Outdoor Only' },
  { value: 'BOTH', label: 'Indoor & Outdoor' },
]

function MatchScoreRing({ score }: { score: number }) {
  const percentage = Math.round(score * 100)
  const color =
    percentage >= 80
      ? 'text-success-500'
      : percentage >= 60
        ? 'text-warning-500'
        : 'text-error-500'

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          className="text-neutral-200 dark:text-neutral-700"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          className={color}
          strokeWidth="3"
          strokeDasharray={`${percentage}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold text-neutral-900 dark:text-neutral-100">
        {percentage}%
      </span>
    </div>
  )
}

export default function TeamAnalysisPage() {
  const [teamProfile, setTeamProfile] = useState<TeamProfile>({
    size: 10,
    objectives: [],
    industry: 'TECHNOLOGY',
    physicalLevel: 'MEDIUM',
    indoorOutdoor: 'BOTH',
    duration: 120,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleObjectiveToggle = (objective: string) => {
    setTeamProfile((prev) => ({
      ...prev,
      objectives: prev.objectives.includes(objective)
        ? prev.objectives.filter((o) => o !== objective)
        : [...prev.objectives, objective],
    }))
  }

  const handleAnalyze = async () => {
    if (teamProfile.objectives.length === 0) {
      setError('Please select at least one objective')
      return
    }

    if (teamProfile.size < 2) {
      setError('Team size must be at least 2')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamProfile }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze team')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* AI Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50/80 to-blue-50/80 p-8 dark:from-violet-950/30 dark:to-blue-950/30">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-800/20" />
        <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-blue-200/20 blur-2xl dark:bg-blue-800/10" />
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50">
                <Brain className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Team Dynamics AI
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  AI-powered team analysis and activity recommendations
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Input Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card hover={false}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Team Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Team Size */}
              <div>
                <label
                  htmlFor="team-size"
                  className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Team Size
                </label>
                <Input
                  id="team-size"
                  type="number"
                  min="2"
                  max="100"
                  value={teamProfile.size}
                  onChange={(e) =>
                    setTeamProfile((prev) => ({ ...prev, size: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="Enter team size"
                />
              </div>

              {/* Industry */}
              <div>
                <label
                  htmlFor="industry"
                  className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Industry
                </label>
                <select
                  id="industry"
                  value={teamProfile.industry}
                  onChange={(e) =>
                    setTeamProfile((prev) => ({ ...prev, industry: e.target.value }))
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objectives */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Team Objectives
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {OBJECTIVES.map((objective) => (
                    <button
                      key={objective.value}
                      type="button"
                      onClick={() => handleObjectiveToggle(objective.value)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                        teamProfile.objectives.includes(objective.value)
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/30 dark:text-brand-300'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-600'
                      }`}
                    >
                      <CheckCircle
                        className={`h-4 w-4 flex-shrink-0 transition-colors ${
                          teamProfile.objectives.includes(objective.value)
                            ? 'text-brand-500 dark:text-brand-400'
                            : 'text-neutral-300 dark:text-neutral-600'
                        }`}
                      />
                      {objective.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Level */}
              <div>
                <label
                  htmlFor="physical-level"
                  className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Physical Activity Level
                </label>
                <select
                  id="physical-level"
                  value={teamProfile.physicalLevel}
                  onChange={(e) =>
                    setTeamProfile((prev) => ({ ...prev, physicalLevel: e.target.value }))
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {PHYSICAL_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Environment */}
              <div>
                <label
                  htmlFor="environment"
                  className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Environment Preference
                </label>
                <select
                  id="environment"
                  value={teamProfile.indoorOutdoor}
                  onChange={(e) =>
                    setTeamProfile((prev) => ({ ...prev, indoorOutdoor: e.target.value }))
                  }
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  {ENVIRONMENTS.map((env) => (
                    <option key={env.value} value={env.value}>
                      {env.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Program Duration (minutes)
                </label>
                <Input
                  id="duration"
                  type="number"
                  min="30"
                  max="480"
                  step="15"
                  value={teamProfile.duration}
                  onChange={(e) =>
                    setTeamProfile((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="Enter duration in minutes"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-950/20"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-error-600 dark:text-error-400" />
                  <p className="text-sm font-medium text-error-700 dark:text-error-300">{error}</p>
                </motion.div>
              )}

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                isLoading={isLoading}
                variant="ai"
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Team'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Brain className="h-16 w-16 text-violet-500" />
          </motion.div>
          <p className="mt-4 text-lg font-medium text-neutral-600 dark:text-neutral-400">
            AI is analyzing your team...
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
            This may take a few seconds
          </p>
        </motion.div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Team Analysis */}
          <motion.div variants={staggerItem}>
            <Card variant="ai" hover={false}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Team Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Strengths */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.teamAnalysis.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300"
                      >
                        <span className="mt-1 text-success-600 dark:text-success-400">&#8226;</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                    Challenges
                  </h4>
                  <ul className="space-y-2">
                    {result.teamAnalysis.challenges.map((challenge, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300"
                      >
                        <span className="mt-1 text-warning-600 dark:text-warning-400">&#8226;</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    <Target className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {result.teamAnalysis.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300"
                      >
                        <span className="mt-1 text-brand-600 dark:text-brand-400">&#8226;</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommended Activities */}
          <motion.div variants={staggerItem}>
            <Card hover={false}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  Recommended Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.recommendedActivities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      variants={staggerItem}
                      className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-brand-600"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h5 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            {activity.title}
                          </h5>
                          <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {activity.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              {activity.physicalLevel}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activity.objectives.map((obj) => (
                              <span
                                key={obj}
                                className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                              >
                                {obj}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <MatchScoreRing score={activity.matchScore} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Suggested Sequence */}
          {result.suggestedSequence.length > 0 && (
            <motion.div variants={staggerItem}>
              <Card hover={false}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListOrdered className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    Suggested Activity Sequence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.suggestedSequence.map((step, index) => (
                      <motion.div
                        key={index}
                        variants={staggerItem}
                        className="flex items-start gap-4"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-sm">
                          {index + 1}
                        </div>
                        <p className="flex-1 pt-1.5 text-neutral-700 dark:text-neutral-300">
                          {step}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
