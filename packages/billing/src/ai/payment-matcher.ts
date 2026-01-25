import OpenAI from 'openai';
import type { BankTransaction } from '../types/bank';
import type { Invoice } from '../types/invoice';

export interface PaymentMatchSuggestion {
  invoiceId: string;
  invoiceNumber: string;
  confidence: number; // 0-1
  reason: string;
  matchFactors: {
    amountMatch: boolean;
    dateProximity: number; // days
    vsMatch: boolean; // Variable symbol match
    nameMatch: boolean;
    textSimilarity: number; // 0-1
  };
}

export class AIPaymentMatcher {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Find matching invoices for a bank transaction using AI
   */
  async findMatches(
    transaction: BankTransaction,
    candidateInvoices: Invoice[]
  ): Promise<PaymentMatchSuggestion[]> {
    // First, apply rule-based filtering
    const ruleBasedMatches = this.ruleBasedMatching(transaction, candidateInvoices);

    // If we have high-confidence rule-based matches, return them
    if (ruleBasedMatches.some(m => m.confidence > 0.9)) {
      return ruleBasedMatches;
    }

    // Otherwise, use AI for fuzzy matching
    const aiMatches = await this.aiBasedMatching(transaction, candidateInvoices);

    // Combine and deduplicate
    const allMatches = [...ruleBasedMatches, ...aiMatches];
    const uniqueMatches = this.deduplicateMatches(allMatches);

    // Sort by confidence descending
    return uniqueMatches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Rule-based matching (fast, deterministic)
   */
  private ruleBasedMatching(
    transaction: BankTransaction,
    invoices: Invoice[]
  ): PaymentMatchSuggestion[] {
    const matches: PaymentMatchSuggestion[] = [];

    for (const invoice of invoices) {
      const factors = {
        amountMatch: this.amountsMatch(transaction.amount, invoice.total),
        dateProximity: this.calculateDateProximity(transaction.date, invoice.dueDate),
        vsMatch: this.variableSymbolsMatch(transaction.variableSymbol, invoice.invoiceNumber),
        nameMatch: this.namesMatch(transaction.counterpartyName, invoice.billingName),
        textSimilarity: 0,
      };

      // Calculate confidence based on factors
      let confidence = 0;

      if (factors.amountMatch) confidence += 0.4;
      if (factors.vsMatch) confidence += 0.3;
      if (factors.nameMatch) confidence += 0.2;
      if (factors.dateProximity <= 7) confidence += 0.1;

      if (confidence > 0.5) {
        matches.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          confidence,
          reason: this.generateReason(factors),
          matchFactors: factors,
        });
      }
    }

    return matches;
  }

  /**
   * AI-based matching (slower, fuzzy)
   */
  private async aiBasedMatching(
    transaction: BankTransaction,
    invoices: Invoice[]
  ): Promise<PaymentMatchSuggestion[]> {
    if (invoices.length === 0) {
      return [];
    }

    try {
      const prompt = this.buildMatchingPrompt(transaction, invoices);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a financial transaction matching expert. Analyze bank transactions and match them with invoices based on amount, date, description, and other factors.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      return this.parseAIResponse(result);
    } catch (error) {
      console.error('AI matching error:', error);
      return [];
    }
  }

  /**
   * Build prompt for AI matching
   */
  private buildMatchingPrompt(
    transaction: BankTransaction,
    invoices: Invoice[]
  ): string {
    return `
Match this bank transaction with the most likely invoice(s):

**Transaction:**
- Amount: ${transaction.amount} ${transaction.currency}
- Date: ${transaction.date.toISOString().split('T')[0]}
- Counterparty: ${transaction.counterpartyName || 'Unknown'}
- Description: ${transaction.description || 'N/A'}
- Variable Symbol: ${transaction.variableSymbol || 'N/A'}

**Candidate Invoices:**
${invoices.map((inv, i) => `
${i + 1}. Invoice ${inv.invoiceNumber}
   - Amount: ${inv.total} ${inv.currency}
   - Due Date: ${inv.dueDate.toISOString().split('T')[0]}
   - Customer: ${inv.billingName}
   - Status: ${inv.status}
`).join('\n')}

Return JSON with this structure:
{
  "matches": [
    {
      "invoiceId": "invoice_id",
      "invoiceNumber": "INV-001",
      "confidence": 0.85,
      "reason": "Amount matches exactly, date within 3 days, customer name similar"
    }
  ]
}

Only include matches with confidence > 0.5. If no good matches, return empty array.
    `.trim();
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(response: any): PaymentMatchSuggestion[] {
    if (!response.matches || !Array.isArray(response.matches)) {
      return [];
    }

    return response.matches.map((match: any) => ({
      invoiceId: match.invoiceId,
      invoiceNumber: match.invoiceNumber,
      confidence: match.confidence,
      reason: match.reason,
      matchFactors: {
        amountMatch: false,
        dateProximity: 0,
        vsMatch: false,
        nameMatch: false,
        textSimilarity: match.confidence,
      },
    }));
  }

  /**
   * Check if amounts match (with small tolerance for rounding)
   */
  private amountsMatch(txAmount: number, invoiceAmount: number): boolean {
    const tolerance = 0.01; // 1 cent tolerance
    return Math.abs(txAmount - invoiceAmount) <= tolerance;
  }

  /**
   * Calculate date proximity in days
   */
  private calculateDateProximity(txDate: Date, invoiceDate: Date): number {
    const diffMs = Math.abs(txDate.getTime() - invoiceDate.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if variable symbols match
   */
  private variableSymbolsMatch(txVS?: string, invoiceNumber?: string): boolean {
    if (!txVS || !invoiceNumber) return false;

    // Extract numbers from both
    const txNumbers = txVS.replace(/\D/g, '');
    const invNumbers = invoiceNumber.replace(/\D/g, '');

    return txNumbers === invNumbers;
  }

  /**
   * Check if names match (fuzzy)
   */
  private namesMatch(txName?: string, invoiceName?: string): boolean {
    if (!txName || !invoiceName) return false;

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const txNorm = normalize(txName);
    const invNorm = normalize(invoiceName);

    // Check if one contains the other
    return txNorm.includes(invNorm) || invNorm.includes(txNorm);
  }

  /**
   * Generate human-readable reason
   */
  private generateReason(factors: PaymentMatchSuggestion['matchFactors']): string {
    const reasons: string[] = [];

    if (factors.amountMatch) reasons.push('exact amount match');
    if (factors.vsMatch) reasons.push('variable symbol match');
    if (factors.nameMatch) reasons.push('customer name match');
    if (factors.dateProximity <= 3) reasons.push('date within 3 days');

    return reasons.join(', ') || 'no strong indicators';
  }

  /**
   * Deduplicate matches
   */
  private deduplicateMatches(
    matches: PaymentMatchSuggestion[]
  ): PaymentMatchSuggestion[] {
    const seen = new Set<string>();
    const unique: PaymentMatchSuggestion[] = [];

    for (const match of matches) {
      if (!seen.has(match.invoiceId)) {
        seen.add(match.invoiceId);
        unique.push(match);
      }
    }

    return unique;
  }
}
