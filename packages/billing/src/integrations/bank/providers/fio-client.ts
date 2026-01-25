import axios from 'axios';
import type { BankTransaction, FioTransaction } from '../../../types/bank';
import type { Currency } from '../../../types/currency';

export interface FioClientConfig {
  token: string; // API token from Fio banka
  accountId: string;
}

export class FioClient {
  private config: FioClientConfig;
  private baseUrl = 'https://www.fio.cz/ib_api/rest';

  constructor(config: FioClientConfig) {
    this.config = config;
  }

  /**
   * Fetch transactions for a date range
   */
  async fetchTransactions(
    dateFrom: Date,
    dateTo: Date
  ): Promise<BankTransaction[]> {
    const fromStr = this.formatDate(dateFrom);
    const toStr = this.formatDate(dateTo);

    const url = `${this.baseUrl}/periods/${this.config.token}/${fromStr}/${toStr}/transactions.json`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (!data.accountStatement?.transactionList?.transaction) {
        return [];
      }

      const fioTransactions: FioTransaction[] = data.accountStatement.transactionList.transaction;

      return fioTransactions.map(tx => this.mapFioTransaction(tx));
    } catch (error) {
      console.error('Error fetching Fio transactions:', error);
      throw new Error('Failed to fetch Fio bank transactions');
    }
  }

  /**
   * Fetch new transactions since last sync
   */
  async fetchNewTransactions(): Promise<BankTransaction[]> {
    const url = `${this.baseUrl}/last/${this.config.token}/transactions.json`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (!data.accountStatement?.transactionList?.transaction) {
        return [];
      }

      const fioTransactions: FioTransaction[] = data.accountStatement.transactionList.transaction;

      return fioTransactions.map(tx => this.mapFioTransaction(tx));
    } catch (error) {
      console.error('Error fetching new Fio transactions:', error);
      throw new Error('Failed to fetch new Fio bank transactions');
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ balance: number; currency: Currency }> {
    const url = `${this.baseUrl}/last/${this.config.token}/transactions.json`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const info = data.accountStatement?.info;
      if (!info) {
        throw new Error('No account info found');
      }

      return {
        balance: parseFloat(info.closingBalance?.value || '0'),
        currency: (info.currency?.value || 'CZK') as Currency,
      };
    } catch (error) {
      console.error('Error fetching Fio balance:', error);
      throw new Error('Failed to fetch Fio account balance');
    }
  }

  /**
   * Map Fio transaction to our BankTransaction format
   */
  private mapFioTransaction(fioTx: FioTransaction): BankTransaction {
    const amount = fioTx.column1?.value || 0;
    const isDebit = amount < 0;

    return {
      id: `fio_${fioTx.column22?.value}`,
      bankAccountId: this.config.accountId,
      tenantId: '', // Will be set by the service
      transactionId: fioTx.column22?.value?.toString() || '',
      date: new Date(fioTx.column0?.value || ''),
      amount: Math.abs(amount),
      currency: (fioTx.column14?.value || 'CZK') as Currency,
      type: isDebit ? 'DEBIT' : 'CREDIT',
      counterpartyName: fioTx.column10?.value,
      counterpartyAccount: fioTx.column2?.value,
      counterpartyBankCode: fioTx.column3?.value,
      description: fioTx.column16?.value,
      variableSymbol: fioTx.column5?.value,
      specificSymbol: fioTx.column6?.value,
      constantSymbol: fioTx.column4?.value,
      isMatched: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Format date for Fio API (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Set last download marker (to avoid re-downloading same transactions)
   */
  async setLastDownloadMarker(transactionId: string): Promise<void> {
    const url = `${this.baseUrl}/set-last-id/${this.config.token}/${transactionId}/`;

    try {
      await axios.get(url);
    } catch (error) {
      console.error('Error setting Fio last download marker:', error);
      // Non-critical, don't throw
    }
  }
}
