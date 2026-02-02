/**
 * AI Contract Generator
 * Generates professional performance contracts using GPT-4
 */

import { generateStructuredCompletion, isOpenAIAvailable } from './openai-client'
import { ContractLanguage } from '@/generated/prisma'
import type {
  PerformerInfo,
  ClientInfo,
  EventDetails,
  FinancialTerms,
  ContractSection,
  ContractClauseData,
} from '@/lib/services/contracts'

// ========================================
// TYPES
// ========================================

export interface GenerateContractInput {
  language: ContractLanguage
  performerInfo: PerformerInfo
  clientInfo: ClientInfo
  eventDetails: EventDetails
  financialTerms: FinancialTerms
  eventType?: string
  customInstructions?: string
  includeDefaultClauses?: boolean
}

export interface GeneratedContract {
  title: string
  sections: ContractSection[]
  clauses: ContractClauseData[]
}

// ========================================
// SYSTEM PROMPT
// ========================================

const SYSTEM_PROMPT = `You are an expert legal document generator specializing in performance contracts for musicians and bands.

Your task is to generate a professional, legally sound performance contract based on the provided details.

IMPORTANT RULES:
1. Generate the contract in the specified language (CS = Czech, EN = English)
2. Use formal legal language appropriate for contracts
3. Include all standard sections for performance contracts
4. Use placeholder variables in the format {{VARIABLE_NAME}} for dynamic content
5. Ensure the contract is fair to both parties
6. Include appropriate liability clauses
7. Always respond with valid JSON

STANDARD SECTIONS TO INCLUDE:
1. Parties - Identification of performer and client
2. Event Details - Date, time, venue, duration
3. Performance Scope - What will be performed
4. Technical Requirements - Sound, lighting, stage needs
5. Financial Terms - Price, deposit, payment schedule
6. Cancellation Policy - Conditions and penalties
7. Force Majeure - Circumstances beyond control
8. Liability - Insurance and responsibility
9. Intellectual Property - Rights to recordings/photos
10. Signatures - Signature blocks for both parties

AVAILABLE VARIABLES:
- {{PERFORMER_NAME}} - Name of the performer/band
- {{PERFORMER_ADDRESS}} - Performer's address
- {{PERFORMER_ICO}} - Performer's company ID
- {{PERFORMER_DIC}} - Performer's tax ID
- {{PERFORMER_EMAIL}} - Performer's email
- {{PERFORMER_PHONE}} - Performer's phone
- {{CLIENT_NAME}} - Client's name
- {{CLIENT_ADDRESS}} - Client's address
- {{CLIENT_COMPANY}} - Client's company name
- {{CLIENT_EMAIL}} - Client's email
- {{CLIENT_PHONE}} - Client's phone
- {{EVENT_TITLE}} - Name of the event
- {{EVENT_DATE}} - Date of the event
- {{EVENT_TIME}} - Start time
- {{EVENT_VENUE}} - Venue name and address
- {{EVENT_DURATION}} - Duration in hours
- {{TOTAL_PRICE}} - Total price
- {{DEPOSIT_AMOUNT}} - Deposit amount
- {{DEPOSIT_DUE}} - Deposit due date
- {{PAYMENT_DUE}} - Final payment due date
- {{CURRENCY}} - Currency symbol
- {{CONTRACT_NUMBER}} - Contract reference number
- {{CONTRACT_DATE}} - Date of contract creation

OUTPUT FORMAT (JSON):
{
  "title": "Contract title",
  "sections": [
    {
      "id": "unique-id",
      "title": "Section Title",
      "content": "Section content with {{VARIABLES}}",
      "order": 1
    }
  ],
  "clauses": [
    {
      "clauseId": "clause-id",
      "title": "Clause Title",
      "content": "Clause content",
      "order": 1
    }
  ]
}`

// ========================================
// GENERATOR
// ========================================

export async function generateContract(input: GenerateContractInput): Promise<GeneratedContract> {
  const langText = input.language === 'CS' ? 'Czech' : 'English'

  const userPrompt = `Generate a performance contract with the following details:

LANGUAGE: ${langText}

PERFORMER INFORMATION:
- Name: ${input.performerInfo.name}
- Address: ${input.performerInfo.address || 'Not provided'}
- IČO: ${input.performerInfo.ico || 'Not provided'}
- DIČ: ${input.performerInfo.dic || 'Not provided'}
- Email: ${input.performerInfo.email || 'Not provided'}
- Phone: ${input.performerInfo.phone || 'Not provided'}

CLIENT INFORMATION:
- Name: ${input.clientInfo.name}
- Company: ${input.clientInfo.company || 'Not provided'}
- Address: ${input.clientInfo.address || 'Not provided'}
- Email: ${input.clientInfo.email || 'Not provided'}
- Phone: ${input.clientInfo.phone || 'Not provided'}

EVENT DETAILS:
- Title: ${input.eventDetails.title}
- Date: ${input.eventDetails.date}
- Time: ${input.eventDetails.time || 'To be confirmed'}
- Venue: ${input.eventDetails.venue || 'To be confirmed'}
- Duration: ${input.eventDetails.duration ? `${input.eventDetails.duration} hours` : 'To be confirmed'}
- Description: ${input.eventDetails.description || 'Not provided'}
- Event Type: ${input.eventType || 'General performance'}

FINANCIAL TERMS:
- Total Price: ${input.financialTerms.totalPrice} ${input.financialTerms.currency}
- Deposit: ${input.financialTerms.deposit ? `${input.financialTerms.deposit} ${input.financialTerms.currency}` : 'Not required'}
- Deposit Due: ${input.financialTerms.depositDue || 'Not applicable'}
- Payment Due: ${input.financialTerms.paymentDue || 'On event date'}

${input.customInstructions ? `CUSTOM INSTRUCTIONS:\n${input.customInstructions}` : ''}

Generate a complete, professional performance contract using the variables where appropriate.`

  // Try AI generation
  if (isOpenAIAvailable()) {
    const result = await generateStructuredCompletion<GeneratedContract>(
      SYSTEM_PROMPT,
      userPrompt,
      {
        model: 'gpt-4o',
        temperature: 0.5,
        maxTokens: 4000,
      }
    )

    if (result) {
      return result
    }
  }

  // Fallback to default contract
  return generateDefaultContract(input)
}

// ========================================
// FALLBACK DEFAULT CONTRACT
// ========================================

function generateDefaultContract(input: GenerateContractInput): GeneratedContract {
  const isCs = input.language === 'CS'

  const sections: ContractSection[] = [
    {
      id: 'parties',
      title: isCs ? 'Smluvní strany' : 'Contracting Parties',
      content: isCs
        ? `Poskytovatel: {{PERFORMER_NAME}}\nSídlo: {{PERFORMER_ADDRESS}}\nIČO: {{PERFORMER_ICO}}\nDIČ: {{PERFORMER_DIC}}\nEmail: {{PERFORMER_EMAIL}}\nTelefon: {{PERFORMER_PHONE}}\n\nObjednatel: {{CLIENT_NAME}}\nSpolečnost: {{CLIENT_COMPANY}}\nAdresa: {{CLIENT_ADDRESS}}\nEmail: {{CLIENT_EMAIL}}\nTelefon: {{CLIENT_PHONE}}`
        : `Provider: {{PERFORMER_NAME}}\nAddress: {{PERFORMER_ADDRESS}}\nCompany ID: {{PERFORMER_ICO}}\nTax ID: {{PERFORMER_DIC}}\nEmail: {{PERFORMER_EMAIL}}\nPhone: {{PERFORMER_PHONE}}\n\nClient: {{CLIENT_NAME}}\nCompany: {{CLIENT_COMPANY}}\nAddress: {{CLIENT_ADDRESS}}\nEmail: {{CLIENT_EMAIL}}\nPhone: {{CLIENT_PHONE}}`,
      order: 1,
    },
    {
      id: 'event',
      title: isCs ? 'Předmět smlouvy' : 'Subject of Contract',
      content: isCs
        ? `Poskytovatel se zavazuje poskytnout hudební produkci na akci "{{EVENT_TITLE}}" za podmínek stanovených touto smlouvou.\n\nDatum: {{EVENT_DATE}}\nČas: {{EVENT_TIME}}\nMísto: {{EVENT_VENUE}}\nDélka vystoupení: {{EVENT_DURATION}}`
        : `The Provider agrees to provide musical performance at the event "{{EVENT_TITLE}}" under the conditions set forth in this contract.\n\nDate: {{EVENT_DATE}}\nTime: {{EVENT_TIME}}\nVenue: {{EVENT_VENUE}}\nDuration: {{EVENT_DURATION}}`,
      order: 2,
    },
    {
      id: 'financial',
      title: isCs ? 'Finanční podmínky' : 'Financial Terms',
      content: isCs
        ? `Celková cena za vystoupení: {{TOTAL_PRICE}} {{CURRENCY}}\nZáloha: {{DEPOSIT_AMOUNT}} {{CURRENCY}}\nSplatnost zálohy: {{DEPOSIT_DUE}}\nDoplatek splatný: {{PAYMENT_DUE}}\n\nPlatba bude provedena bankovním převodem na účet poskytovatele.`
        : `Total price for the performance: {{TOTAL_PRICE}} {{CURRENCY}}\nDeposit: {{DEPOSIT_AMOUNT}} {{CURRENCY}}\nDeposit due: {{DEPOSIT_DUE}}\nBalance due: {{PAYMENT_DUE}}\n\nPayment shall be made by bank transfer to the Provider's account.`,
      order: 3,
    },
    {
      id: 'technical',
      title: isCs ? 'Technické požadavky' : 'Technical Requirements',
      content: isCs
        ? `Objednatel zajistí:\n- Přístup na místo konání min. 2 hodiny před začátkem\n- Stabilní elektrické připojení (230V, min. 16A)\n- Krytou plochu pro vystoupení\n- Šatnu pro účinkující\n\nPoskytovatel zajistí vlastní zvukovou aparaturu, pokud není dohodnuto jinak.`
        : `The Client shall provide:\n- Access to the venue at least 2 hours before the event\n- Stable electrical connection (230V, min. 16A)\n- Covered performance area\n- Dressing room for performers\n\nThe Provider shall bring their own sound equipment unless otherwise agreed.`,
      order: 4,
    },
    {
      id: 'cancellation',
      title: isCs ? 'Storno podmínky' : 'Cancellation Policy',
      content: isCs
        ? `Zrušení smlouvy objednatelem:\n- Více než 30 dnů před akcí: vrácení zálohy mínus 10% administrativní poplatek\n- 14-30 dnů před akcí: záloha propadá\n- Méně než 14 dnů před akcí: splatná celá částka\n\nZrušení smlouvy poskytovatelem:\n- Vrácení celé zálohy a kompenzace do výše 20% ceny`
        : `Cancellation by the Client:\n- More than 30 days before the event: deposit refund minus 10% administrative fee\n- 14-30 days before the event: deposit forfeited\n- Less than 14 days before the event: full amount due\n\nCancellation by the Provider:\n- Full deposit refund plus compensation up to 20% of the price`,
      order: 5,
    },
    {
      id: 'force_majeure',
      title: isCs ? 'Vyšší moc' : 'Force Majeure',
      content: isCs
        ? `V případě zrušení akce z důvodu vyšší moci (přírodní katastrofa, pandemie, válečný stav, apod.) budou strany spolupracovat na nalezení náhradního termínu. Pokud náhradní termín není možný, záloha bude vrácena v plné výši.`
        : `In case of event cancellation due to force majeure (natural disaster, pandemic, war, etc.), the parties shall cooperate to find an alternative date. If an alternative date is not possible, the deposit shall be refunded in full.`,
      order: 6,
    },
    {
      id: 'signatures',
      title: isCs ? 'Podpisy' : 'Signatures',
      content: isCs
        ? `Tato smlouva nabývá platnosti dnem podpisu oběma stranami.\n\nV _________________ dne _______________\n\n\n_______________________________\nPoskytovatel: {{PERFORMER_NAME}}\n\n\n_______________________________\nObjednatel: {{CLIENT_NAME}}`
        : `This contract becomes effective upon signing by both parties.\n\nIn _________________ on _______________\n\n\n_______________________________\nProvider: {{PERFORMER_NAME}}\n\n\n_______________________________\nClient: {{CLIENT_NAME}}`,
      order: 7,
    },
  ]

  const clauses: ContractClauseData[] = [
    {
      clauseId: 'liability',
      title: isCs ? 'Odpovědnost' : 'Liability',
      content: isCs
        ? `Poskytovatel nenese odpovědnost za škody způsobené třetími osobami nebo okolnostmi mimo jeho kontrolu. Objednatel zodpovídá za bezpečnost místa konání.`
        : `The Provider shall not be liable for damages caused by third parties or circumstances beyond their control. The Client is responsible for the safety of the venue.`,
      order: 1,
    },
    {
      clauseId: 'ip_rights',
      title: isCs ? 'Autorská práva' : 'Intellectual Property',
      content: isCs
        ? `Pořizování audio a video záznamů vystoupení je povoleno pouze pro osobní účely. Komerční využití vyžaduje písemný souhlas poskytovatele.`
        : `Recording audio and video of the performance is permitted for personal use only. Commercial use requires written consent from the Provider.`,
      order: 2,
    },
    {
      clauseId: 'confidentiality',
      title: isCs ? 'Důvěrnost' : 'Confidentiality',
      content: isCs
        ? `Obě strany se zavazují zachovávat důvěrnost finančních a osobních údajů obsažených v této smlouvě.`
        : `Both parties agree to maintain the confidentiality of financial and personal information contained in this contract.`,
      order: 3,
    },
  ]

  const title = isCs
    ? `Smlouva o hudební produkci - ${input.eventDetails.title}`
    : `Performance Contract - ${input.eventDetails.title}`

  return { title, sections, clauses }
}

// ========================================
// VARIABLE SUBSTITUTION
// ========================================

export function buildVariableMap(
  performerInfo: PerformerInfo,
  clientInfo: ClientInfo,
  eventDetails: EventDetails,
  financialTerms: FinancialTerms,
  contractNumber?: string
): Record<string, string> {
  return {
    PERFORMER_NAME: performerInfo.name || '',
    PERFORMER_ADDRESS: performerInfo.address || '',
    PERFORMER_ICO: performerInfo.ico || '',
    PERFORMER_DIC: performerInfo.dic || '',
    PERFORMER_EMAIL: performerInfo.email || '',
    PERFORMER_PHONE: performerInfo.phone || '',
    CLIENT_NAME: clientInfo.name || '',
    CLIENT_ADDRESS: clientInfo.address || '',
    CLIENT_COMPANY: clientInfo.company || '',
    CLIENT_EMAIL: clientInfo.email || '',
    CLIENT_PHONE: clientInfo.phone || '',
    EVENT_TITLE: eventDetails.title || '',
    EVENT_DATE: eventDetails.date || '',
    EVENT_TIME: eventDetails.time || '',
    EVENT_VENUE: eventDetails.venue || '',
    EVENT_DURATION: eventDetails.duration ? `${eventDetails.duration}h` : '',
    TOTAL_PRICE: financialTerms.totalPrice?.toLocaleString('cs-CZ') || '0',
    DEPOSIT_AMOUNT: financialTerms.deposit?.toLocaleString('cs-CZ') || '0',
    DEPOSIT_DUE: financialTerms.depositDue || '',
    PAYMENT_DUE: financialTerms.paymentDue || '',
    CURRENCY: financialTerms.currency || 'CZK',
    CONTRACT_NUMBER: contractNumber || '',
    CONTRACT_DATE: new Date().toLocaleDateString('cs-CZ'),
  }
}
