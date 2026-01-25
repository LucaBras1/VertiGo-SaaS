export interface NumberGeneratorConfig {
  prefix: string;
  separator: string;
  includeYear: boolean;
  yearFormat: 'YYYY' | 'YY';
  sequenceLength: number;
  suffix?: string;
}

export class InvoiceNumberGenerator {
  /**
   * Generate invoice number
   * Example: INV-2024-0001
   */
  static generate(
    sequence: number,
    config: Partial<NumberGeneratorConfig> = {}
  ): string {
    const defaults: NumberGeneratorConfig = {
      prefix: 'INV',
      separator: '-',
      includeYear: true,
      yearFormat: 'YYYY',
      sequenceLength: 4,
    };

    const cfg = { ...defaults, ...config };
    const parts: string[] = [cfg.prefix];

    if (cfg.includeYear) {
      const year = new Date().getFullYear();
      const yearStr = cfg.yearFormat === 'YYYY'
        ? year.toString()
        : year.toString().slice(-2);
      parts.push(yearStr);
    }

    const seqStr = sequence.toString().padStart(cfg.sequenceLength, '0');
    parts.push(seqStr);

    if (cfg.suffix) {
      parts.push(cfg.suffix);
    }

    return parts.join(cfg.separator);
  }

  /**
   * Parse invoice number to extract components
   */
  static parse(
    invoiceNumber: string,
    config: Partial<NumberGeneratorConfig> = {}
  ): { prefix: string; year?: string; sequence: number; suffix?: string } | null {
    const defaults: NumberGeneratorConfig = {
      prefix: 'INV',
      separator: '-',
      includeYear: true,
      yearFormat: 'YYYY',
      sequenceLength: 4,
    };

    const cfg = { ...defaults, ...config };
    const parts = invoiceNumber.split(cfg.separator);

    if (parts.length < 2) {
      return null;
    }

    const result: any = {
      prefix: parts[0],
    };

    let seqIndex = 1;

    if (cfg.includeYear && parts.length >= 3) {
      result.year = parts[1];
      seqIndex = 2;
    }

    result.sequence = parseInt(parts[seqIndex], 10);

    if (parts.length > seqIndex + 1) {
      result.suffix = parts[seqIndex + 1];
    }

    return result;
  }

  /**
   * Generate next invoice number based on last number
   */
  static generateNext(
    lastInvoiceNumber: string,
    config: Partial<NumberGeneratorConfig> = {}
  ): string {
    const parsed = this.parse(lastInvoiceNumber, config);

    if (!parsed) {
      return this.generate(1, config);
    }

    const currentYear = new Date().getFullYear().toString();
    const lastYear = parsed.year;

    // If year changed, reset sequence
    if (config.includeYear && lastYear && lastYear !== currentYear && lastYear !== currentYear.slice(-2)) {
      return this.generate(1, config);
    }

    // Otherwise, increment sequence
    return this.generate(parsed.sequence + 1, config);
  }
}

export class VariableSymbolGenerator {
  /**
   * Generate variable symbol from invoice number
   * Removes non-numeric characters and ensures max 10 digits
   */
  static fromInvoiceNumber(invoiceNumber: string): string {
    const digits = invoiceNumber.replace(/\D/g, '');
    return digits.slice(-10); // Max 10 digits for VS in CZ
  }

  /**
   * Generate variable symbol from date and sequence
   */
  static fromDateAndSequence(date: Date, sequence: number): string {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const seq = sequence.toString().padStart(4, '0');
    return `${year}${month}${seq}`;
  }
}
