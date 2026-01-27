/**
 * Template Variables for Email Sequences
 *
 * Provides variable replacement for email templates.
 */

interface Client {
  id: string
  name: string
  email: string
  phone?: string | null
  creditsRemaining: number
  membershipType?: string | null
  membershipExpiry?: Date | null
  goals?: string[]
  currentWeight?: number | null
  targetWeight?: number | null
}

interface Tenant {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  website?: string | null
  users?: { name?: string | null; email: string }[]
}

interface TemplateContext {
  client?: Client | null
  tenant?: Tenant | null
  session?: {
    scheduledAt: Date
    duration: number
  } | null
  package?: {
    name: string
    credits: number
    price: number
  } | null
  invoice?: {
    invoiceNumber: string
    total: number
    dueDate: Date
  } | null
  custom?: Record<string, string | number | boolean>
}

/**
 * Available template variables and their descriptions
 */
export const TEMPLATE_VARIABLES = {
  // Client variables
  '{{client.name}}': 'Jmeno klienta',
  '{{client.email}}': 'Email klienta',
  '{{client.phone}}': 'Telefon klienta',
  '{{client.credits}}': 'Zbyvajici kredity',
  '{{client.membershipType}}': 'Typ clenstvi',
  '{{client.membershipExpiry}}': 'Datum expirace clenstvi',
  '{{client.goals}}': 'Cile klienta',

  // Tenant/Business variables
  '{{tenant.name}}': 'Nazev firmy/studia',
  '{{tenant.email}}': 'Email studia',
  '{{tenant.phone}}': 'Telefon studia',
  '{{tenant.website}}': 'Web studia',
  '{{trainer.name}}': 'Jmeno trenera',
  '{{trainer.email}}': 'Email trenera',

  // Session variables
  '{{session.date}}': 'Datum treningu',
  '{{session.time}}': 'Cas treningu',
  '{{session.duration}}': 'Delka treningu',

  // Package variables
  '{{package.name}}': 'Nazev balicku',
  '{{package.credits}}': 'Pocet kreditu v balicku',
  '{{package.price}}': 'Cena balicku',

  // Invoice variables
  '{{invoice.number}}': 'Cislo faktury',
  '{{invoice.total}}': 'Celkova castka',
  '{{invoice.dueDate}}': 'Datum splatnosti',

  // General
  '{{today}}': 'Dnesni datum',
  '{{currentYear}}': 'Aktualni rok',
}

/**
 * Replace template variables in a string
 */
export function replaceTemplateVariables(
  template: string,
  context: TemplateContext
): string {
  let result = template

  // Client variables
  if (context.client) {
    result = result
      .replace(/\{\{client\.name\}\}/g, context.client.name)
      .replace(/\{\{client\.email\}\}/g, context.client.email)
      .replace(/\{\{client\.phone\}\}/g, context.client.phone || '')
      .replace(/\{\{client\.credits\}\}/g, context.client.creditsRemaining.toString())
      .replace(/\{\{client\.membershipType\}\}/g, context.client.membershipType || '-')
      .replace(
        /\{\{client\.membershipExpiry\}\}/g,
        context.client.membershipExpiry
          ? formatDate(context.client.membershipExpiry)
          : '-'
      )
      .replace(
        /\{\{client\.goals\}\}/g,
        context.client.goals?.join(', ') || '-'
      )
  }

  // Tenant variables
  if (context.tenant) {
    result = result
      .replace(/\{\{tenant\.name\}\}/g, context.tenant.name)
      .replace(/\{\{tenant\.email\}\}/g, context.tenant.email || '')
      .replace(/\{\{tenant\.phone\}\}/g, context.tenant.phone || '')
      .replace(/\{\{tenant\.website\}\}/g, context.tenant.website || '')

    // Trainer (first admin user)
    const trainer = context.tenant.users?.[0]
    if (trainer) {
      result = result
        .replace(/\{\{trainer\.name\}\}/g, trainer.name || 'Trener')
        .replace(/\{\{trainer\.email\}\}/g, trainer.email)
    }
  }

  // Session variables
  if (context.session) {
    result = result
      .replace(/\{\{session\.date\}\}/g, formatDate(context.session.scheduledAt))
      .replace(/\{\{session\.time\}\}/g, formatTime(context.session.scheduledAt))
      .replace(/\{\{session\.duration\}\}/g, `${context.session.duration} min`)
  }

  // Package variables
  if (context.package) {
    result = result
      .replace(/\{\{package\.name\}\}/g, context.package.name)
      .replace(/\{\{package\.credits\}\}/g, context.package.credits.toString())
      .replace(/\{\{package\.price\}\}/g, `${context.package.price} CZK`)
  }

  // Invoice variables
  if (context.invoice) {
    result = result
      .replace(/\{\{invoice\.number\}\}/g, context.invoice.invoiceNumber)
      .replace(/\{\{invoice\.total\}\}/g, `${context.invoice.total} CZK`)
      .replace(/\{\{invoice\.dueDate\}\}/g, formatDate(context.invoice.dueDate))
  }

  // Custom variables
  if (context.custom) {
    for (const [key, value] of Object.entries(context.custom)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
    }
  }

  // General variables
  result = result
    .replace(/\{\{today\}\}/g, formatDate(new Date()))
    .replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString())

  return result
}

/**
 * Format date in Czech format
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format time
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Preview template with sample data
 */
export function previewTemplate(template: string): string {
  const sampleContext: TemplateContext = {
    client: {
      id: 'sample',
      name: 'Jan Novak',
      email: 'jan.novak@example.com',
      phone: '+420 123 456 789',
      creditsRemaining: 5,
      membershipType: 'Premium',
      membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      goals: ['hubnutí', 'síla'],
    },
    tenant: {
      id: 'sample',
      name: 'Fitness Studio ABC',
      email: 'info@studio.cz',
      phone: '+420 111 222 333',
      website: 'https://studio.cz',
      users: [{ name: 'Petr Trener', email: 'petr@studio.cz' }],
    },
    session: {
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: 60,
    },
    package: {
      name: 'Mesicni neomezene',
      credits: 20,
      price: 2500,
    },
    invoice: {
      invoiceNumber: 'FA2025001',
      total: 2500,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  }

  return replaceTemplateVariables(template, sampleContext)
}

/**
 * Validate template for missing variables
 */
export function validateTemplate(template: string): {
  valid: boolean
  unknownVariables: string[]
} {
  const variablePattern = /\{\{([^}]+)\}\}/g
  const knownVariables = Object.keys(TEMPLATE_VARIABLES).map((v) =>
    v.replace(/\{\{|\}\}/g, '')
  )

  const unknownVariables: string[] = []
  let match

  while ((match = variablePattern.exec(template)) !== null) {
    const variable = match[1]
    if (!knownVariables.includes(variable)) {
      unknownVariables.push(variable)
    }
  }

  return {
    valid: unknownVariables.length === 0,
    unknownVariables,
  }
}
