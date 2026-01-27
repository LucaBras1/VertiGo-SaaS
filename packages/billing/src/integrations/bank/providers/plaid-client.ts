import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import type { BankTransaction, PlaidTransaction } from '../../../types/bank';
import type { Currency } from '../../../types/currency';

export interface PlaidClientConfig {
  clientId: string;
  secret: string;
  environment: 'sandbox' | 'development' | 'production';
  accessToken: string;
  accountId: string;
}

export class PlaidClient {
  private client: PlaidApi;
  private config: PlaidClientConfig;

  constructor(config: PlaidClientConfig) {
    this.config = config;

    const configuration = new Configuration({
      basePath: PlaidEnvironments[config.environment],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': config.clientId,
          'PLAID-SECRET': config.secret,
        },
      },
    });

    this.client = new PlaidApi(configuration);
  }

  /**
   * Fetch transactions for a date range
   */
  async fetchTransactions(
    dateFrom: Date,
    dateTo: Date
  ): Promise<BankTransaction[]> {
    try {
      const response = await this.client.transactionsGet({
        access_token: this.config.accessToken,
        start_date: this.formatDate(dateFrom),
        end_date: this.formatDate(dateTo),
        options: {
          account_ids: [this.config.accountId],
        },
      });

      const transactions = response.data.transactions;

      return transactions.map(tx => this.mapPlaidTransaction(tx as any));
    } catch (error) {
      console.error('Error fetching Plaid transactions:', error);
      throw new Error('Failed to fetch Plaid transactions');
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ balance: number; currency: Currency }> {
    try {
      const response = await this.client.accountsBalanceGet({
        access_token: this.config.accessToken,
        options: {
          account_ids: [this.config.accountId],
        },
      });

      const account = response.data.accounts[0];
      if (!account) {
        throw new Error('Account not found');
      }

      return {
        balance: account.balances.current || 0,
        currency: (account.balances.iso_currency_code || 'USD') as Currency,
      };
    } catch (error) {
      console.error('Error fetching Plaid balance:', error);
      throw new Error('Failed to fetch Plaid account balance');
    }
  }

  /**
   * Map Plaid transaction to our BankTransaction format
   */
  private mapPlaidTransaction(plaidTx: PlaidTransaction): BankTransaction {
    const isDebit = plaidTx.amount > 0; // In Plaid, positive = debit

    return {
      id: `plaid_${plaidTx.transaction_id}`,
      bankAccountId: this.config.accountId,
      tenantId: '', // Will be set by the service
      transactionId: plaidTx.transaction_id,
      date: new Date(plaidTx.date),
      amount: Math.abs(plaidTx.amount),
      currency: 'USD', // Plaid is primarily US-based
      type: isDebit ? 'DEBIT' : 'CREDIT',
      counterpartyName: plaidTx.merchant_name || plaidTx.name,
      description: plaidTx.name,
      isMatched: false,
      metadata: {
        pending: plaidTx.pending,
        category: plaidTx.category,
        location: plaidTx.location,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Format date for Plaid API (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Exchange public token for access token (initial setup)
   */
  static async exchangePublicToken(
    clientId: string,
    secret: string,
    environment: 'sandbox' | 'development' | 'production',
    publicToken: string
  ): Promise<string> {
    const configuration = new Configuration({
      basePath: PlaidEnvironments[environment],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': secret,
        },
      },
    });

    const client = new PlaidApi(configuration);

    try {
      const response = await client.itemPublicTokenExchange({
        public_token: publicToken,
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging Plaid public token:', error);
      throw new Error('Failed to exchange Plaid public token');
    }
  }
}
