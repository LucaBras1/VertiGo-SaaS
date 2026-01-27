import OpenAI from 'openai';
import type { Invoice } from '../types/invoice';

export interface PaymentPrediction {
  invoiceId: string;
  invoiceNumber: string;
  predictedPaymentDate: Date;
  confidence: number; // 0-1
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: {
    historicalPaymentBehavior: number; // 0-1
    invoiceAge: number; // days
    customerReputation: number; // 0-1
    amountSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  };
}

export class AIPaymentPredictor {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Predict when an invoice will be paid
   */
  async predictPaymentDate(
    invoice: Invoice,
    historicalData?: {
      previousInvoices: Invoice[];
      averageDaysToPayment: number;
      paymentReliability: number; // 0-1
    }
  ): Promise<PaymentPrediction> {
    const invoiceAge = this.calculateInvoiceAge(invoice);
    const amountSize = this.categorizeAmount(invoice.total);

    // Use historical data if available
    if (historicalData && historicalData.previousInvoices.length > 0) {
      return this.predictWithHistoricalData(invoice, historicalData, invoiceAge, amountSize);
    }

    // Otherwise, use simple heuristics
    return this.predictWithHeuristics(invoice, invoiceAge, amountSize);
  }

  /**
   * Predict with historical data
   */
  private async predictWithHistoricalData(
    invoice: Invoice,
    historical: {
      previousInvoices: Invoice[];
      averageDaysToPayment: number;
      paymentReliability: number;
    },
    invoiceAge: number,
    amountSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  ): Promise<PaymentPrediction> {
    try {
      const prompt = this.buildPredictionPrompt(invoice, historical);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst specializing in payment predictions. Analyze invoice and customer payment history to predict when payment will be received.',
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

      return this.parseAIPrediction(invoice, result, invoiceAge, amountSize, historical);
    } catch (error) {
      console.error('AI prediction error:', error);
      return this.predictWithHeuristics(invoice, invoiceAge, amountSize);
    }
  }

  /**
   * Predict with simple heuristics
   */
  private predictWithHeuristics(
    invoice: Invoice,
    invoiceAge: number,
    amountSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  ): PaymentPrediction {
    // Simple heuristic: add 0-7 days to due date based on invoice status
    let daysAfterDue = 0;

    if (invoice.status === 'SENT') {
      daysAfterDue = 0; // Expect payment on due date
    } else if (invoice.status === 'OVERDUE') {
      daysAfterDue = 7; // Expect payment 7 days after now
    }

    const predictedDate = new Date(invoice.dueDate);
    predictedDate.setDate(predictedDate.getDate() + daysAfterDue);

    // Risk increases with invoice age and amount
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (invoiceAge > 30) riskLevel = 'HIGH';
    else if (invoiceAge > 14 || amountSize === 'LARGE') riskLevel = 'MEDIUM';

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      predictedPaymentDate: predictedDate,
      confidence: 0.6, // Medium confidence with heuristics
      riskLevel,
      factors: {
        historicalPaymentBehavior: 0.5, // Unknown
        invoiceAge,
        customerReputation: 0.5, // Unknown
        amountSize,
      },
    };
  }

  /**
   * Build prompt for AI prediction
   */
  private buildPredictionPrompt(
    invoice: Invoice,
    historical: {
      previousInvoices: Invoice[];
      averageDaysToPayment: number;
      paymentReliability: number;
    }
  ): string {
    return `
Predict when this invoice will be paid based on customer's payment history:

**Current Invoice:**
- Invoice Number: ${invoice.invoiceNumber}
- Amount: ${invoice.total} ${invoice.currency}
- Issue Date: ${invoice.issueDate.toISOString().split('T')[0]}
- Due Date: ${invoice.dueDate.toISOString().split('T')[0]}
- Status: ${invoice.status}
- Customer: ${invoice.buyer.name}

**Customer Payment History:**
- Average Days to Payment: ${historical.averageDaysToPayment}
- Payment Reliability: ${(historical.paymentReliability * 100).toFixed(0)}%
- Previous Invoices: ${historical.previousInvoices.length}

**Sample Previous Invoices:**
${historical.previousInvoices.slice(0, 5).map(inv => `
- ${inv.invoiceNumber}: ${inv.total} ${inv.currency}, Due: ${inv.dueDate.toISOString().split('T')[0]}, Paid: ${inv.paidAt ? inv.paidAt.toISOString().split('T')[0] : 'Not yet'}
`).join('\n')}

Return JSON with this structure:
{
  "predictedDaysFromNow": 7,
  "confidence": 0.85,
  "riskLevel": "LOW",
  "reasoning": "Customer typically pays 3 days before due date"
}
    `.trim();
  }

  /**
   * Parse AI prediction
   */
  private parseAIPrediction(
    invoice: Invoice,
    result: any,
    invoiceAge: number,
    amountSize: 'SMALL' | 'MEDIUM' | 'LARGE',
    historical: { paymentReliability: number }
  ): PaymentPrediction {
    const daysFromNow = result.predictedDaysFromNow || 7;
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysFromNow);

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      predictedPaymentDate: predictedDate,
      confidence: result.confidence || 0.7,
      riskLevel: result.riskLevel || 'MEDIUM',
      factors: {
        historicalPaymentBehavior: historical.paymentReliability,
        invoiceAge,
        customerReputation: historical.paymentReliability,
        amountSize,
      },
    };
  }

  /**
   * Calculate invoice age in days
   */
  private calculateInvoiceAge(invoice: Invoice): number {
    const now = new Date();
    const diffMs = now.getTime() - invoice.issueDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Categorize invoice amount
   */
  private categorizeAmount(amount: number): 'SMALL' | 'MEDIUM' | 'LARGE' {
    if (amount < 1000) return 'SMALL';
    if (amount < 10000) return 'MEDIUM';
    return 'LARGE';
  }
}
