/**
 * Objective Matcher AI Page
 * AI-powered activity matching based on team objectives
 */

'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Target, Lightbulb, TrendingUp, AlertCircle, Link as LinkIcon } from 'lucide-react'

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Target className="w-8 h-8 text-brand-primary" />
          Objective Matcher AI
        </h1>
        <p className="mt-2 text-gray-600">
          Find the perfect activities for your team's objectives
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Team Objectives & Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Objectives
              </label>
              <div className="grid grid-cols-2 gap-3">
                {OBJECTIVES.map((objective) => (
                  <label
                    key={objective.value}
                    className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={matchRequest.objectives.includes(objective.value)}
                      onChange={() => handleObjectiveToggle(objective.value)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{objective.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Objectives */}
            <div>
              <label htmlFor="custom-objectives" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Describe any specific goals or outcomes you want to achieve
              </p>
            </div>

            {/* Team Context */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="team-size" className="block text-sm font-medium text-gray-700 mb-2">
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
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Find Activities Button */}
            <Button
              onClick={handleFindActivities}
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Finding Activities...' : 'Find Activities'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Matched Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Matched Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.matches.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No matching activities found. Try adjusting your objectives.
                  </p>
                ) : (
                  result.matches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-brand-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-lg font-semibold text-gray-900">{match.title}</h5>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                            {Math.round(match.matchScore * 100)}% Match
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{match.rationale}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{match.duration} min</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.objectives.map((obj) => (
                          <span
                            key={obj}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                          >
                            {obj}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Integration Suggestions */}
          {result.integrationSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-6 h-6 text-brand-primary" />
                  Integration Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.integrationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">
                        {suggestion.title}
                      </h5>
                      <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.activities.map((activity, actIndex) => (
                          <span
                            key={actIndex}
                            className="px-3 py-1 bg-white text-blue-700 text-xs font-medium rounded-full border border-blue-200"
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
          )}

          {/* Measurement Metrics */}
          {result.measurementMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-brand-primary" />
                  Success Measurement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.measurementMetrics.map((metric, index) => (
                    <div key={index} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                      <h5 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-brand-primary" />
                        {metric.objective}
                      </h5>
                      <div className="mb-3">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Key Metrics:</h6>
                        <ul className="space-y-1">
                          {metric.metrics.map((m, mIndex) => (
                            <li key={mIndex} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-brand-primary mt-1">•</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h6 className="text-sm font-medium text-gray-700 mb-1">
                          Assessment Method:
                        </h6>
                        <p className="text-sm text-gray-600">{metric.assessmentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
