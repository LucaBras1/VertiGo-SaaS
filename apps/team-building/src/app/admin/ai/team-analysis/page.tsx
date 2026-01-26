/**
 * Team Analysis AI Page
 * Provides AI-powered team dynamics analysis and activity recommendations
 */

'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Brain, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Brain className="w-8 h-8 text-brand-primary" />
          Team Dynamics AI
        </h1>
        <p className="mt-2 text-gray-600">
          AI-powered team analysis and activity recommendations
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Team Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Team Size */}
            <div>
              <label htmlFor="team-size" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                id="industry"
                value={teamProfile.industry}
                onChange={(e) => setTeamProfile((prev) => ({ ...prev, industry: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Objectives
              </label>
              <div className="grid grid-cols-2 gap-3">
                {OBJECTIVES.map((objective) => (
                  <label
                    key={objective.value}
                    className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={teamProfile.objectives.includes(objective.value)}
                      onChange={() => handleObjectiveToggle(objective.value)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{objective.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Physical Level */}
            <div>
              <label htmlFor="physical-level" className="block text-sm font-medium text-gray-700 mb-2">
                Physical Activity Level
              </label>
              <select
                id="physical-level"
                value={teamProfile.physicalLevel}
                onChange={(e) =>
                  setTeamProfile((prev) => ({ ...prev, physicalLevel: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
              <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-2">
                Environment Preference
              </label>
              <select
                id="environment"
                value={teamProfile.indoorOutdoor}
                onChange={(e) =>
                  setTeamProfile((prev) => ({ ...prev, indoorOutdoor: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
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
                  setTeamProfile((prev) => ({ ...prev, duration: parseInt(e.target.value) || 0 }))
                }
                placeholder="Enter duration in minutes"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Team'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Team Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-brand-primary" />
                Team Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strengths */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {result.teamAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Challenges
                </h4>
                <ul className="space-y-2">
                  {result.teamAnalysis.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-primary" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.teamAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-brand-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.recommendedActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-brand-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-lg font-semibold text-gray-900">{activity.title}</h5>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                          {Math.round(activity.matchScore * 100)}% Match
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{activity.duration} min</span>
                      <span>•</span>
                      <span>{activity.physicalLevel}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.objectives.map((obj) => (
                        <span
                          key={obj}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                        >
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Sequence */}
          {result.suggestedSequence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Suggested Activity Sequence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.suggestedSequence.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-gray-700 pt-1">{step}</p>
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
