/**
 * OpenAI API Mock for TeamForge Testing
 *
 * Provides mock responses for AI modules:
 * - ObjectiveMatcherAI
 * - TeamDynamicsAI
 * - DifficultyCalibratorAI
 * - DebriefGeneratorAI
 */
import { vi } from 'vitest'
import type { ObjectiveMatcherOutput } from '@/lib/ai/objective-matcher'
import type { TeamDynamicsOutput } from '@/lib/ai/team-dynamics'
import type { DifficultyCalibratorOutput } from '@/lib/ai/difficulty-calibrator'
import type { DebriefGeneratorOutput } from '@/lib/ai/debrief-generator'

// ============================================
// MOCK RESPONSES
// ============================================

export const mockObjectiveMatcherOutput: ObjectiveMatcherOutput = {
  matches: [
    {
      objectiveName: 'Improve team communication',
      activityRecommendations: [
        {
          activityId: 'activity-001',
          title: 'Blindfolded Puzzle Challenge',
          alignmentScore: 95,
          how: 'Requires clear verbal communication between team members to solve puzzles without visual cues.',
          expectedImpact: 'Teams develop active listening skills and learn to give precise, clear instructions.',
        },
        {
          activityId: 'activity-002',
          title: 'Team Storytelling Circle',
          alignmentScore: 88,
          how: 'Builds on each other\'s contributions, requiring attentive listening and creative collaboration.',
          expectedImpact: 'Improved group dialogue and appreciation for diverse perspectives.',
        },
      ],
    },
    {
      objectiveName: 'Build trust between departments',
      activityRecommendations: [
        {
          activityId: 'activity-003',
          title: 'Trust Fall & Catch',
          alignmentScore: 92,
          how: 'Physical trust exercise that requires vulnerability and reliability between partners.',
          expectedImpact: 'Creates memorable bonding moments that translate to workplace trust.',
        },
      ],
    },
  ],
  integrationSuggestions: [
    {
      objective: 'Improve team communication',
      strategy: 'Start with low-stakes communication exercises before progressing to complex challenges.',
      implementationTips: [
        'Begin with paired activities before moving to full team exercises',
        'Debrief after each activity to reinforce learning',
        'Connect communication improvements to real workplace scenarios',
      ],
    },
  ],
  measurementMetrics: [
    {
      objective: 'Improve team communication',
      metrics: [
        'Pre/post assessment of communication satisfaction',
        'Number of cross-department conversations in follow-up week',
        'Team feedback survey scores',
      ],
      evaluationMethod: 'Combine quantitative surveys with qualitative observations from facilitators.',
    },
  ],
}

export const mockTeamDynamicsOutput: TeamDynamicsOutput = {
  recommendedActivities: [
    {
      activityId: 'activity-001',
      title: 'Escape Room Challenge',
      matchScore: 92,
      reasoning: 'Ideal for mixed seniority teams as it values diverse thinking styles and requires collaboration without hierarchy.',
      expectedOutcomes: [
        'Improved problem-solving under pressure',
        'Better understanding of individual strengths',
        'Enhanced team cohesion',
      ],
      adaptations: [
        'Add time bonuses for inclusive decision-making',
        'Assign rotating leadership roles',
      ],
    },
    {
      activityId: 'activity-002',
      title: 'Team Canvas Workshop',
      matchScore: 85,
      reasoning: 'Strategic activity suitable for tech industry teams focusing on alignment and shared goals.',
      expectedOutcomes: [
        'Clearer team purpose and values',
        'Improved goal alignment',
        'Better understanding of individual motivations',
      ],
    },
    {
      activityId: 'activity-003',
      title: 'Outdoor Navigation Challenge',
      matchScore: 78,
      reasoning: 'Medium physical activity suitable for the team\'s fitness level while providing fresh perspective.',
      expectedOutcomes: [
        'Enhanced trust through shared challenges',
        'Improved communication in dynamic situations',
        'Fun, memorable bonding experience',
      ],
    },
  ],
  teamAnalysis: {
    strengths: [
      'Diverse range of experience levels enables peer mentoring',
      'Tech industry background suggests comfort with structured problem-solving',
      'Mid-sized team allows for meaningful individual participation',
    ],
    challenges: [
      'Mixed seniority may create hesitation in junior members to speak up',
      'Remote work background may require ice-breakers before collaborative activities',
      'Age range requires activities accessible to all fitness levels',
    ],
    recommendations: [
      'Start with low-risk activities to build psychological safety',
      'Explicitly encourage contributions from all levels during debriefs',
      'Include both cognitive and light physical activities for variety',
    ],
  },
  suggestedSequence: [
    {
      step: 1,
      activityId: 'activity-002',
      duration: 60,
      rationale: 'Start with strategic workshop to align on team goals before action-oriented activities.',
    },
    {
      step: 2,
      activityId: 'activity-001',
      duration: 90,
      rationale: 'Main event with high engagement and clear success metrics.',
    },
    {
      step: 3,
      activityId: 'activity-003',
      duration: 45,
      rationale: 'End with outdoor activity to energize and create positive lasting memories.',
    },
  ],
}

export const mockDifficultyCalibratorOutput: DifficultyCalibratorOutput = {
  calibratedDifficulty: 'medium',
  adjustments: [
    {
      aspect: 'Time limit',
      originalLevel: '30 minutes',
      adjustedLevel: '45 minutes',
      reasoning: 'Extended time accommodates mixed experience levels and ensures completion without excessive pressure.',
    },
    {
      aspect: 'Physical challenge',
      originalLevel: 'High',
      adjustedLevel: 'Medium',
      reasoning: 'Reduced physical demands to accommodate team age range and varied fitness levels.',
    },
    {
      aspect: 'Complexity',
      originalLevel: 'Expert',
      adjustedLevel: 'Intermediate',
      reasoning: 'Simplified puzzle elements while maintaining intellectual engagement for all skill levels.',
    },
  ],
  modifications: [
    {
      category: 'Rules',
      modification: 'Allow one "hint request" per subgroup without penalty.',
      impact: 'Reduces frustration while maintaining challenge, encourages help-seeking behavior.',
    },
    {
      category: 'Equipment',
      modification: 'Provide written instructions in addition to verbal to accommodate different learning styles.',
      impact: 'Ensures all participants can fully engage regardless of processing preferences.',
    },
    {
      category: 'Scoring',
      modification: 'Award bonus points for process quality (communication, inclusion) not just speed.',
      impact: 'Shifts focus from competition to collaboration, reinforcing session objectives.',
    },
  ],
  facilitatorGuidance: {
    setupTips: [
      'Brief team on activity before starting, emphasizing collaboration over competition',
      'Arrange space to allow easy movement and subgroup formation',
      'Prepare simplified backup challenges if team struggles significantly',
    ],
    watchFor: [
      'Individual participants disengaging or being excluded',
      'Single person dominating decision-making',
      'Signs of frustration or anxiety (crossed arms, silence)',
      'Time pressure causing communication breakdown',
    ],
    scalingOptions: [
      {
        trigger: 'Team completes challenge too quickly (under 20 min)',
        action: 'Add bonus challenge layer or debrief more extensively',
      },
      {
        trigger: 'Team struggles after 30 minutes without progress',
        action: 'Provide structured hint and reduce remaining complexity',
      },
      {
        trigger: 'Energy drops significantly mid-activity',
        action: 'Call short break, provide encouragement, consider splitting into smaller subgroups',
      },
    ],
  },
  estimatedCompletionTime: {
    min: 35,
    max: 55,
    likely: 45,
  },
  successPrediction: {
    likelihood: 85,
    factors: [
      'Diverse skill set covers all challenge areas',
      'Team size allows effective communication',
      'Adjusted difficulty matches team profile',
    ],
    riskMitigation: [
      'Pre-activity warm-up to establish psychological safety',
      'Facilitator active monitoring for early intervention',
      'Clear success criteria communicated upfront',
    ],
  },
}

export const mockDebriefOutput: DebriefGeneratorOutput = {
  report: {
    executiveSummary: 'The session successfully achieved 4 of 5 stated objectives, with notable improvements in cross-departmental communication and trust. The team demonstrated strong collaborative potential when given appropriate challenges. Recommended follow-up focuses on maintaining momentum through regular touchpoints.',
    sessionOverview: {
      date: '2025-01-15',
      duration: '4 hours',
      teamSize: 20,
      activitiesCompleted: 3,
      overallSuccess: 'good',
    },
    objectivesAssessment: [
      {
        objective: 'Improve inter-departmental communication',
        achieved: 'fully',
        evidence: [
          'Cross-functional teams successfully solved complex challenges',
          'Observed increase in informal dialogue during breaks',
          'Participants reported feeling more comfortable approaching colleagues from other departments',
        ],
        recommendations: [
          'Schedule monthly cross-departmental lunch meetups',
          'Create Slack channels for project-specific collaboration',
        ],
      },
      {
        objective: 'Build trust between team members',
        achieved: 'partially',
        evidence: [
          'Trust exercises completed with positive engagement',
          'Some hesitation observed in vulnerability-requiring activities',
        ],
        recommendations: [
          'Follow up with smaller trust-building exercises in regular meetings',
          'Consider team coaching for deeper trust development',
        ],
      },
    ],
    keyFindings: {
      strengths: [
        {
          area: 'Problem-solving collaboration',
          description: 'Team naturally formed effective sub-groups with complementary skills when tackling challenges.',
          impact: 'Suggests strong potential for cross-functional project teams.',
        },
        {
          area: 'Leadership emergence',
          description: 'Multiple team members stepped up to guide activities at different points.',
          impact: 'Indicates distributed leadership capability within the team.',
        },
      ],
      areasForGrowth: [
        {
          area: 'Conflict resolution',
          description: 'Some tension observed when opinions diverged, with tendency to avoid rather than address.',
          recommendations: [
            'Provide conflict resolution training',
            'Establish team agreements for handling disagreements',
            'Practice structured debate exercises in future sessions',
          ],
        },
      ],
      breakthroughMoments: [
        {
          moment: 'Escape room collaboration between Sales and Engineering',
          significance: 'Demonstrated that different thinking styles can complement rather than conflict when focused on shared goals.',
        },
      ],
    },
    participantEngagement: {
      overallLevel: 'high',
      patterns: [
        'Initial hesitation gave way to active participation after first activity',
        'Engagement peaked during competitive elements',
        'Sustained energy throughout the session with appropriate breaks',
      ],
      notableParticipation: [
        'Quieter team members contributed more after facilitated sharing rounds',
        'Cross-level interactions increased as session progressed',
      ],
    },
    teamDynamicsAnalysis: {
      communication: {
        assessment: 'Strong verbal communication; written communication not tested. Active listening demonstrated in structured activities but less consistent in free discussion.',
        patterns: [
          'Direct communication style preferred',
          'Tendency to build on ideas rather than critique',
          'Some interruption patterns observed with senior members',
        ],
      },
      collaboration: {
        assessment: 'Excellent collaboration when roles were clear; some overlap and confusion in unstructured situations.',
        patterns: [
          'Natural tendency to divide labor',
          'Willingness to support struggling team members',
          'Preference for consensus over voting',
        ],
      },
      leadership: {
        assessment: 'Distributed leadership emerged organically; formal leaders appropriately stepped back to allow others to lead.',
        patterns: [
          'Situational leadership based on expertise',
          'Support for emerging leaders from senior team members',
          'Some hesitation from mid-level to take charge initially',
        ],
      },
    },
    recommendations: {
      immediate: [
        {
          action: 'Send thank-you and session summary to all participants',
          rationale: 'Reinforces positive experience and maintains engagement momentum.',
          owner: 'HR',
        },
        {
          action: 'Schedule 2-week follow-up check-in with team leads',
          rationale: 'Identify early if session learnings are being applied.',
          owner: 'Team Lead',
        },
      ],
      shortTerm: [
        {
          action: 'Implement monthly cross-departmental coffee chats',
          timeframe: '1 month',
          expectedOutcome: 'Sustained informal relationship building between departments.',
        },
        {
          action: 'Create team communication agreements document',
          timeframe: '2 weeks',
          expectedOutcome: 'Formalized norms to maintain improved communication patterns.',
        },
      ],
      longTerm: [
        {
          action: 'Plan quarterly team development sessions',
          timeframe: '3 months',
          expectedOutcome: 'Continuous team development and reinforcement of positive dynamics.',
        },
        {
          action: 'Develop internal mentorship program across departments',
          timeframe: '6 months',
          expectedOutcome: 'Deeper cross-functional understanding and career development.',
        },
      ],
    },
    nextSteps: {
      followUpActivities: [
        'Mini team challenges in weekly meetings (15-minute activities)',
        'Cross-departmental project collaboration opportunity',
        'Feedback collection survey in 30 days',
      ],
      suggestedTimeline: 'Next team building session recommended in 3-4 months to maintain momentum without fatigue.',
      metrics: [
        'Monthly team satisfaction pulse survey',
        'Cross-departmental collaboration count (projects, meetings)',
        'Employee retention in participating teams',
      ],
    },
    appendix: {
      activityDetails: [
        {
          title: 'Escape Room Challenge',
          duration: '90 minutes',
          objectives: ['Problem-solving', 'Communication', 'Collaboration'],
          outcomes: 'Successfully completed by all teams. Highlighted complementary thinking styles.',
        },
        {
          title: 'Team Canvas Workshop',
          duration: '60 minutes',
          objectives: ['Goal alignment', 'Values clarification'],
          outcomes: 'Produced actionable team agreements document.',
        },
        {
          title: 'Outdoor Navigation Challenge',
          duration: '45 minutes',
          objectives: ['Trust building', 'Fun bonding'],
          outcomes: 'High energy and positive team bonding.',
        },
      ],
      methodologyNotes: 'Session followed experiential learning cycle: experience → reflect → conceptualize → apply. Each activity included structured debrief with transfer questions.',
    },
  },
  htmlReport: `
    <html>
      <head><title>TeamForge Session Debrief</title></head>
      <body>
        <h1>Session Debrief Report</h1>
        <h2>Executive Summary</h2>
        <p>The session successfully achieved 4 of 5 stated objectives...</p>
        <!-- Full HTML report would be generated here -->
      </body>
    </html>
  `,
  metrics: {
    overallScore: 82,
    categoryScores: {
      engagement: 88,
      collaboration: 85,
      communication: 80,
      problemSolving: 78,
      leadership: 79,
    },
  },
}

// ============================================
// MOCK AI CLIENT
// ============================================

export const createMockAIClient = () => ({
  chat: vi.fn().mockResolvedValue({
    data: 'Mock response',
    usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    cached: false,
    latencyMs: 500,
  }),
  chatStructured: vi.fn().mockImplementation(async (_messages, _schema, _context, options) => {
    // Return appropriate mock based on context or schema
    const model = options?.model || 'gpt-4o-mini'

    return {
      data: mockObjectiveMatcherOutput, // Default - will be overridden in specific tests
      usage: { promptTokens: 200, completionTokens: 300, totalTokens: 500 },
      cached: false,
      latencyMs: model === 'gpt-4o' ? 2000 : 800,
    }
  }),
  complete: vi.fn().mockResolvedValue({
    data: 'Mock completion text response for quick summary.',
    usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
    cached: false,
    latencyMs: 300,
  }),
  getUsageStats: vi.fn().mockReturnValue({
    totalRequests: 10,
    totalTokens: 5000,
  }),
})

// Type for mock AI client
export type MockAIClient = ReturnType<typeof createMockAIClient>

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Configure mock to return specific response for ObjectiveMatcherAI
 */
export function mockObjectiveMatcherResponse(
  mockClient: MockAIClient,
  response: ObjectiveMatcherOutput = mockObjectiveMatcherOutput
) {
  mockClient.chatStructured.mockResolvedValueOnce({
    data: response,
    usage: { promptTokens: 200, completionTokens: 300, totalTokens: 500 },
    cached: false,
    latencyMs: 800,
  })
}

/**
 * Configure mock to return specific response for TeamDynamicsAI
 */
export function mockTeamDynamicsResponse(
  mockClient: MockAIClient,
  response: TeamDynamicsOutput = mockTeamDynamicsOutput
) {
  mockClient.chatStructured.mockResolvedValueOnce({
    data: response,
    usage: { promptTokens: 250, completionTokens: 400, totalTokens: 650 },
    cached: false,
    latencyMs: 900,
  })
}

/**
 * Configure mock to return specific response for DifficultyCalibratorAI
 */
export function mockDifficultyCalibratorResponse(
  mockClient: MockAIClient,
  response: DifficultyCalibratorOutput = mockDifficultyCalibratorOutput
) {
  mockClient.chatStructured.mockResolvedValueOnce({
    data: response,
    usage: { promptTokens: 180, completionTokens: 350, totalTokens: 530 },
    cached: false,
    latencyMs: 700,
  })
}

/**
 * Configure mock to return specific response for DebriefGeneratorAI
 */
export function mockDebriefGeneratorResponse(
  mockClient: MockAIClient,
  response: DebriefGeneratorOutput = mockDebriefOutput
) {
  mockClient.chatStructured.mockResolvedValueOnce({
    data: response,
    usage: { promptTokens: 500, completionTokens: 1200, totalTokens: 1700 },
    cached: false,
    latencyMs: 2500, // GPT-4o is slower
  })
}

/**
 * Configure mock to simulate API error
 */
export function mockAIError(mockClient: MockAIClient, errorMessage: string = 'OpenAI API error') {
  mockClient.chatStructured.mockRejectedValueOnce(new Error(errorMessage))
}

/**
 * Configure mock to simulate rate limiting
 */
export function mockRateLimitError(mockClient: MockAIClient) {
  const error = new Error('Rate limit exceeded')
  ;(error as any).status = 429
  mockClient.chatStructured.mockRejectedValueOnce(error)
}

/**
 * Configure mock to return cached response
 */
export function mockCachedResponse<T>(mockClient: MockAIClient, data: T) {
  mockClient.chatStructured.mockResolvedValueOnce({
    data,
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    cached: true,
    latencyMs: 5,
  })
}
