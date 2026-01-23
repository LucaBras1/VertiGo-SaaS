/**
 * Admin Message Reply API
 * POST /api/admin/messages/[id]/reply - Send reply to contact message
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { generateContactReplyEmail } from '@/lib/email/templates/contact-reply'
import { z } from 'zod'

const replySchema = z.object({
  subject: z.string().min(1, 'Předmět je povinný'),
  message: z.string().min(1, 'Zpráva je povinná'),
})

// Subject labels mapping
const subjectLabels: Record<string, string> = {
  reservation: 'Objednávka představení',
  info: 'Dotaz na představení',
  technical: 'Technické informace',
  price: 'Cenová nabídka',
  other: 'Jiné',
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validationResult = replySchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ')
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400 }
      )
    }

    const { subject, message } = validationResult.data

    // Get the original message
    const originalMessage = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!originalMessage) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    // Get settings for company info
    const settings = await prisma.settings.findFirst()

    // Generate email content
    const originalSubjectLabel = subjectLabels[originalMessage.subject] || originalMessage.subject
    const { html, text } = generateContactReplyEmail({
      recipientName: originalMessage.name,
      originalSubject: originalSubjectLabel,
      originalMessage: originalMessage.message,
      replyMessage: message,
      companyName: settings?.offerEmailCompanyName || 'Divadlo Studna',
      companyEmail: settings?.offerEmailCompanyEmail || settings?.contactEmail || '',
      companyWeb: settings?.offerEmailCompanyWeb || undefined,
    })

    // Send email
    const emailSent = await sendEmail({
      to: originalMessage.email,
      subject: `Re: ${subject}`,
      html,
      text,
      replyTo: settings?.contactEmail || undefined,
    })

    // Create reply record
    const replyRecord = {
      id: crypto.randomUUID(),
      subject,
      message,
      sentAt: new Date().toISOString(),
      sentBy: session.user?.email || 'admin',
      emailSent,
      emailError: emailSent ? null : 'Failed to send email',
    }

    // Get existing replies
    const existingReplies = (originalMessage.replies as any[]) || []

    // Update message with reply and status
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: 'replied',
        repliedAt: new Date(),
        repliedBy: session.user?.email || 'admin',
        replies: [...existingReplies, replyRecord],
      },
    })

    if (!emailSent) {
      return NextResponse.json({
        success: false,
        error: 'Odpověď byla uložena, ale email se nepodařilo odeslat. Zkontrolujte SMTP nastavení.',
        data: updatedMessage,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Odpověď byla úspěšně odeslána',
      data: updatedMessage,
    })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}
