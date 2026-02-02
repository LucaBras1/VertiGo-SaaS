/**
 * Email Sequence Templates
 * Template processing and default templates for TeamForge
 */

import type { Customer, EmailSequence } from '@/generated/prisma'

interface TemplateContext {
  customer: Customer
  sequence: EmailSequence
}

/**
 * Process template variables in email content
 */
export function processTemplate(template: string, context: TemplateContext): string {
  const { customer, sequence } = context

  const variables: Record<string, string> = {
    '{{customer.firstName}}': customer.firstName,
    '{{customer.lastName}}': customer.lastName,
    '{{customer.fullName}}': `${customer.firstName} ${customer.lastName}`,
    '{{customer.email}}': customer.email,
    '{{customer.organization}}': customer.organization || '',
    '{{customer.phone}}': customer.phone || '',
    '{{sequence.name}}': sequence.name,
    '{{date}}': new Date().toLocaleDateString('cs-CZ'),
    '{{year}}': new Date().getFullYear().toString(),
    '{{unsubscribeUrl}}': `${process.env.NEXTAUTH_URL || ''}/unsubscribe?email=${encodeURIComponent(customer.email)}`,
  }

  let processed = template
  for (const [key, value] of Object.entries(variables)) {
    processed = processed.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
  }

  return processed
}

/**
 * Default email templates for common scenarios
 */
export const defaultTemplates = {
  sessionFollowUp: {
    name: 'Follow-up po session',
    description: 'Automatický follow-up email po dokončení team building session',
    triggerType: 'session_completed' as const,
    steps: [
      {
        stepOrder: 0,
        delayDays: 1,
        delayHours: 0,
        subject: 'Děkujeme za váš team building s TeamForge!',
        htmlContent: `
<h2>Dobrý den {{customer.firstName}},</h2>
<p>Děkujeme, že jste si vybrali TeamForge pro váš team building!</p>
<p>Doufáme, že session splnila vaše očekávání a váš tým si ji užil. Rádi bychom slyšeli váš feedback.</p>
<p>Pokud máte jakékoli dotazy nebo byste chtěli naplánovat další session, neváhejte nás kontaktovat.</p>
<p>S pozdravem,<br>Tým TeamForge</p>
<p style="font-size: 12px; color: #666;"><a href="{{unsubscribeUrl}}">Odhlásit z odběru</a></p>
        `.trim(),
      },
      {
        stepOrder: 1,
        delayDays: 7,
        delayHours: 0,
        subject: 'Jak to šlo s vaším týmem?',
        htmlContent: `
<h2>Dobrý den {{customer.firstName}},</h2>
<p>Uplynul týden od vašeho team buildingu a rádi bychom věděli, jak se u vás věci vyvíjejí.</p>
<p>Pozorujete nějaké pozitivní změny v týmové spolupráci? Máte zájem o další aktivity pro váš tým?</p>
<p>Nabízíme širokou škálu programů od komunikačních workshopů po outdoorové aktivity. Rádi vám připravíme nabídku na míru.</p>
<p>S pozdravem,<br>Tým TeamForge</p>
<p style="font-size: 12px; color: #666;"><a href="{{unsubscribeUrl}}">Odhlásit z odběru</a></p>
        `.trim(),
      },
    ],
  },

  reEngagement: {
    name: 'Re-engagement kampaň',
    description: 'Oslovení zákazníků, kteří delší dobu neobjednali',
    triggerType: 'no_booking_days' as const,
    triggerConfig: { inactiveDays: 90 },
    steps: [
      {
        stepOrder: 0,
        delayDays: 0,
        delayHours: 0,
        subject: 'Chybíte nám! Co nového u TeamForge',
        htmlContent: `
<h2>Dobrý den {{customer.firstName}},</h2>
<p>Nějaký čas jsme od vás neslyšeli a rádi bychom zjistili, jak se vašemu týmu daří.</p>
<p>Za tu dobu jsme přidali několik nových programů a vylepšili naše AI nástroje pro lepší přizpůsobení aktivit vašim cílům.</p>
<p>Máte zájem o nezávaznou konzultaci? Rádi s vámi prodiskutujeme možnosti pro váš tým.</p>
<p>S pozdravem,<br>Tým TeamForge</p>
<p style="font-size: 12px; color: #666;"><a href="{{unsubscribeUrl}}">Odhlásit z odběru</a></p>
        `.trim(),
      },
      {
        stepOrder: 1,
        delayDays: 14,
        delayHours: 0,
        subject: 'Speciální nabídka pro naše věrné zákazníky',
        htmlContent: `
<h2>Dobrý den {{customer.firstName}},</h2>
<p>Jako poděkování za vaši dřívější důvěru bychom vám rádi nabídli speciální podmínky pro vaši další session.</p>
<p>Kontaktujte nás a zmíňte kód <strong>COMEBACK10</strong> pro 10% slevu na váš příští team building.</p>
<p>Těšíme se na spolupráci!</p>
<p>S pozdravem,<br>Tým TeamForge</p>
<p style="font-size: 12px; color: #666;"><a href="{{unsubscribeUrl}}">Odhlásit z odběru</a></p>
        `.trim(),
      },
    ],
  },

  paymentThankYou: {
    name: 'Poděkování za platbu',
    description: 'Email po úspěšném zaplacení faktury',
    triggerType: 'invoice_paid' as const,
    steps: [
      {
        stepOrder: 0,
        delayDays: 0,
        delayHours: 1,
        subject: 'Děkujeme za vaši platbu',
        htmlContent: `
<h2>Dobrý den {{customer.firstName}},</h2>
<p>Děkujeme za vaši včasnou platbu. Vaše faktura byla úspěšně uhrazena.</p>
<p>Pokud máte jakékoli dotazy ohledně vaší objednávky nebo plánované session, neváhejte nás kontaktovat.</p>
<p>Těšíme se na spolupráci!</p>
<p>S pozdravem,<br>Tým TeamForge</p>
        `.trim(),
      },
    ],
  },
}

/**
 * Create a sequence from a default template
 */
export async function createFromTemplate(
  templateKey: keyof typeof defaultTemplates,
  prisma: any
): Promise<string | null> {
  const template = defaultTemplates[templateKey]
  if (!template) return null

  try {
    const sequence = await prisma.emailSequence.create({
      data: {
        name: template.name,
        description: template.description,
        triggerType: template.triggerType,
        triggerConfig: 'triggerConfig' in template ? template.triggerConfig : null,
        isActive: false, // Created as inactive, user activates manually
        steps: {
          create: template.steps,
        },
      },
    })

    return sequence.id
  } catch (error) {
    console.error('Error creating sequence from template:', error)
    return null
  }
}
