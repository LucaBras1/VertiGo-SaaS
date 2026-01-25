import QRCode from 'qrcode';

export interface QRPaymentData {
  // Czech QR code for payment (SPD - Short Payment Descriptor)
  accountNumber: string;
  bankCode: string;
  amount?: number;
  currency?: string;
  variableSymbol?: string;
  constantSymbol?: string;
  specificSymbol?: string;
  message?: string;
  dueDate?: Date;
}

export class QRCodeGenerator {
  /**
   * Generate Czech payment QR code (SPD format)
   */
  async generateCzechPaymentQR(data: QRPaymentData): Promise<string> {
    // SPD format: SPD*1.0*ACC:CZ1234567890/0800*AM:1500.00*CC:CZK*X-VS:12345*MSG:Payment
    const parts: string[] = ['SPD*1.0'];

    // Account in IBAN format or CZ format
    const account = data.accountNumber.includes('CZ')
      ? data.accountNumber
      : `CZ${data.accountNumber}/${data.bankCode}`;
    parts.push(`ACC:${account}`);

    if (data.amount) {
      parts.push(`AM:${data.amount.toFixed(2)}`);
    }

    if (data.currency) {
      parts.push(`CC:${data.currency}`);
    }

    if (data.variableSymbol) {
      parts.push(`X-VS:${data.variableSymbol}`);
    }

    if (data.constantSymbol) {
      parts.push(`X-KS:${data.constantSymbol}`);
    }

    if (data.specificSymbol) {
      parts.push(`X-SS:${data.specificSymbol}`);
    }

    if (data.message) {
      parts.push(`MSG:${data.message}`);
    }

    if (data.dueDate) {
      const dateStr = data.dueDate.toISOString().split('T')[0].replace(/-/g, '');
      parts.push(`DT:${dateStr}`);
    }

    const qrContent = parts.join('*');

    // Generate QR code as data URL
    return await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'M',
      width: 300,
    });
  }

  /**
   * Generate SEPA payment QR code (EPC format)
   */
  async generateSepaPaymentQR(data: {
    beneficiaryName: string;
    iban: string;
    amount?: number;
    currency?: string;
    reference?: string;
    remittanceInfo?: string;
  }): Promise<string> {
    // EPC QR code format
    const lines = [
      'BCD', // Service Tag
      '002', // Version
      '1', // Character Set (1 = UTF-8)
      'SCT', // Identification (SEPA Credit Transfer)
      '', // BIC (optional)
      data.beneficiaryName.substring(0, 70),
      data.iban,
      data.currency || 'EUR',
      data.amount ? data.amount.toFixed(2) : '',
      '', // Purpose (optional)
      data.reference || '',
      data.remittanceInfo || '',
    ];

    const qrContent = lines.join('\n');

    return await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'M',
      width: 300,
    });
  }

  /**
   * Generate generic QR code
   */
  async generateQRCode(data: string, options?: {
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }): Promise<string> {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      width: options?.width || 300,
    });
  }

  /**
   * Generate QR code as SVG
   */
  async generateQRCodeSVG(data: string): Promise<string> {
    return await QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel: 'M',
    });
  }
}
