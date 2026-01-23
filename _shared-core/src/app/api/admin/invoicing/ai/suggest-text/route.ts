/**
 * Text Suggestions API
 *
 * Generuje návrhy textů pro faktury, upomínky a emaily.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  generateInvoiceSuggestions,
  generateReminderText,
  generateInvoiceEmail,
  suggestItemDescription,
  generatePersonalizedText,
  analyzeAndSuggest,
} from '@/lib/invoicing/ai'
import type { DocumentType } from '@/types/invoicing'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const documentType = searchParams.get('documentType') as DocumentType
    const customerId = searchParams.get('customerId')

    // Návrhy pro fakturu
    if (type === 'invoice' && documentType) {
      const suggestions = await generateInvoiceSuggestions(
        documentType,
        customerId || undefined
      )
      return NextResponse.json(suggestions)
    }

    // Personalizované texty
    if (type === 'personalized' && customerId) {
      const textType = searchParams.get('textType') as
        | 'greeting'
        | 'closing'
        | 'thanks'

      if (!textType) {
        return NextResponse.json(
          { error: 'textType is required' },
          { status: 400 }
        )
      }

      const text = await generatePersonalizedText(customerId, textType)
      return NextResponse.json({ text })
    }

    // Analýza a návrhy pro zákazníka
    if (type === 'analyze' && customerId) {
      const analysis = await analyzeAndSuggest(customerId)
      return NextResponse.json(analysis)
    }

    // Autocomplete pro popis položky
    if (type === 'item') {
      const partialText = searchParams.get('q') || ''
      const suggestions = await suggestItemDescription(
        partialText,
        customerId || undefined
      )
      return NextResponse.json({ suggestions })
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    // Generovat text upomínky
    if (type === 'reminder') {
      const {
        level,
        invoiceNumber,
        issueDate,
        amount,
        daysOverdue,
        bankAccount,
        variableSymbol,
        customerName,
      } = body

      if (!level || !invoiceNumber || !amount || !bankAccount) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      const reminder = generateReminderText(level, {
        invoiceNumber,
        issueDate: new Date(issueDate),
        amount,
        daysOverdue: daysOverdue || 0,
        bankAccount,
        variableSymbol: variableSymbol || invoiceNumber,
        customerName,
      })

      return NextResponse.json(reminder)
    }

    // Generovat email pro fakturu
    if (type === 'email') {
      const {
        emailType,
        invoiceNumber,
        amount,
        dueDate,
        validUntil,
        bankAccount,
        variableSymbol,
        companyName,
      } = body

      if (!emailType || !invoiceNumber || !companyName) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      const email = generateInvoiceEmail(emailType, {
        invoiceNumber,
        amount: amount || 0,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        bankAccount,
        variableSymbol,
        companyName,
      })

      return NextResponse.json(email)
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error generating text:', error)
    return NextResponse.json(
      { error: 'Failed to generate text' },
      { status: 500 }
    )
  }
}
