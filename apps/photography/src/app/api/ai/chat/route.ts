import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const ChatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.object({
    page: z.string().optional(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
  }).optional(),
})

const PHOTOGRAPHY_SYSTEM_PROMPT = `You are ShootFlow AI Assistant, an expert photography business assistant.
You help photographers with:
- Shot list creation and planning
- Client management advice
- Pricing and package recommendations
- Workflow optimization
- Business best practices
- Technical photography tips

Keep responses concise and actionable. Use bullet points when listing multiple items.
You have access to the photographer's business data to provide personalized advice.`

/**
 * POST /api/ai/chat
 *
 * AI chat assistant for photography business queries
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, context } = ChatMessageSchema.parse(body)

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: {
          response: "I'm currently unavailable. Please configure the OpenAI API key to enable AI assistance.",
          suggestions: [
            'Check your shot lists',
            'View upcoming shoots',
            'Review pending invoices'
          ]
        }
      })
    }

    try {
      const { createAIClient } = await import('@vertigo/ai-core')
      const ai = createAIClient({
        apiKey,
        defaultModel: 'gpt-4o-mini',
        cache: { enabled: true, ttlMs: 60000 },
        rateLimit: { enabled: true, requestsPerMinute: 60 }
      })

      // Build context-aware prompt
      let contextInfo = ''
      if (context?.page) {
        contextInfo += `\nUser is currently on: ${context.page}`
      }
      if (context?.entityType && context?.entityId) {
        contextInfo += `\nViewing ${context.entityType}: ${context.entityId}`
      }

      const userMessage = contextInfo
        ? `${message}\n\n[Context: ${contextInfo}]`
        : message

      const response = await ai.chat<string>(
        [
          { role: 'system', content: PHOTOGRAPHY_SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        { tenantId: session.user.tenantId, vertical: 'photography' },
        { model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 500 }
      )

      // Generate follow-up suggestions based on context
      const suggestions = generateSuggestions(context?.page)

      return NextResponse.json({
        success: true,
        data: {
          response: response.data,
          suggestions,
          usage: response.usage
        }
      })
    } catch (error) {
      console.error('AI chat error:', error)
      return NextResponse.json({
        success: true,
        data: {
          response: "I encountered an issue processing your request. Please try again.",
          suggestions: ['Try rephrasing your question', 'Check the FAQ section']
        }
      })
    }
  } catch (error) {
    console.error('Chat endpoint error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

function generateSuggestions(page?: string): string[] {
  const baseSuggestions = [
    'How can I improve my workflow?',
    'Suggest shot list ideas',
    'Help with pricing'
  ]

  const pageSuggestions: Record<string, string[]> = {
    '/dashboard': [
      'Summarize my business this month',
      'What should I focus on today?',
      'Show upcoming deadlines'
    ],
    '/dashboard/packages': [
      'Suggest package pricing',
      'How to upsell packages?',
      'Create a new package template'
    ],
    '/dashboard/clients': [
      'Client communication tips',
      'How to get more referrals?',
      'Draft a follow-up email'
    ],
    '/dashboard/shoots': [
      'What to prepare for shoots?',
      'Location scouting tips',
      'Equipment checklist'
    ],
    '/dashboard/galleries': [
      'Gallery curation tips',
      'How to present galleries?',
      'Best delivery practices'
    ],
    '/dashboard/shot-lists': [
      'Generate a wedding shot list',
      'Must-have portrait shots',
      'Corporate event essentials'
    ],
    '/dashboard/invoices': [
      'Invoice best practices',
      'How to handle late payments?',
      'Payment terms suggestions'
    ]
  }

  return pageSuggestions[page || ''] || baseSuggestions
}
