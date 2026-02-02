/**
 * Email Sequence Templates API
 * GET /api/email-sequences/templates - List available templates
 * POST /api/email-sequences/templates - Create sequence from template
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { defaultTemplates, createFromTemplate } from '@/lib/email-sequences/templates'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return available templates
    const templates = Object.entries(defaultTemplates).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      triggerType: template.triggerType,
      stepsCount: template.steps.length,
    }))

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateKey } = body

    if (!templateKey || !(templateKey in defaultTemplates)) {
      return NextResponse.json({ error: 'Invalid template key' }, { status: 400 })
    }

    const sequenceId = await createFromTemplate(
      templateKey as keyof typeof defaultTemplates,
      prisma
    )

    if (!sequenceId) {
      return NextResponse.json({ error: 'Failed to create sequence from template' }, { status: 500 })
    }

    const sequence = await prisma.emailSequence.findUnique({
      where: { id: sequenceId },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(sequence, { status: 201 })
  } catch (error) {
    console.error('Error creating from template:', error)
    return NextResponse.json({ error: 'Failed to create from template' }, { status: 500 })
  }
}
