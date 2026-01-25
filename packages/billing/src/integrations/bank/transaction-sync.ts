import { PrismaClient } from '@prisma/client';
import type { BankAccount, BankTransaction, BankSyncResult } from '../../types/bank';
import { BankFactory } from './bank-factory';

export class BankTransactionSyncService {
  private prisma: PrismaClient;
  private factory: BankFactory;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.factory = new BankFactory();
  }

  /**
   * Sync transactions for a specific bank account
   */
  async syncAccount(
    bankAccount: BankAccount,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<BankSyncResult> {
    const startTime = Date.now();

    try {
      // Create bank client
      const client = this.factory.createClient(
        bankAccount.provider,
        bankAccount.credentials
      );

      // Default date range: last 30 days
      const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = dateTo || new Date();

      // Fetch transactions from bank
      const transactions = await client.fetchTransactions(from, to);

      // Import transactions to database
      let imported = 0;
      let matched = 0;

      for (const transaction of transactions) {
        // Check if transaction already exists
        const exists = await this.transactionExists(
          bankAccount.id,
          transaction.transactionId
        );

        if (!exists) {
          // Add tenantId to transaction
          transaction.tenantId = bankAccount.tenantId;
          transaction.bankAccountId = bankAccount.id;

          // Save to database (would use Prisma in production)
          // await this.saveTransaction(transaction);

          imported++;

          // Try to match with existing invoices
          const matchResult = await this.attemptAutoMatch(transaction);
          if (matchResult) {
            matched++;
          }
        }
      }

      // Update bank account last sync time
      // await this.updateLastSync(bankAccount.id);

      return {
        bankAccountId: bankAccount.id,
        success: true,
        transactionsImported: imported,
        transactionsMatched: matched,
        dateFrom: from,
        dateTo: to,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Bank sync error:', error);

      return {
        bankAccountId: bankAccount.id,
        success: false,
        transactionsImported: 0,
        transactionsMatched: 0,
        dateFrom: dateFrom || new Date(),
        dateTo: dateTo || new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Sync all active accounts for a tenant
   */
  async syncAllAccounts(tenantId: string): Promise<BankSyncResult[]> {
    // In production:
    // 1. Fetch all active bank accounts for tenant
    // 2. Sync each account
    // 3. Return results

    const results: BankSyncResult[] = [];

    // Mock: would query BankAccount table
    // const accounts = await this.prisma.bankAccount.findMany({
    //   where: { tenantId, isActive: true, autoSync: true },
    // });

    // for (const account of accounts) {
    //   const result = await this.syncAccount(account as any);
    //   results.push(result);
    // }

    return results;
  }

  /**
   * Check if transaction already exists
   */
  private async transactionExists(
    bankAccountId: string,
    transactionId: string
  ): Promise<boolean> {
    // In production, query BankTransaction table
    // const existing = await this.prisma.bankTransaction.findFirst({
    //   where: { bankAccountId, transactionId },
    // });
    // return !!existing;

    return false; // Mock
  }

  /**
   * Save transaction to database
   */
  private async saveTransaction(transaction: BankTransaction): Promise<void> {
    // In production, save to BankTransaction table
    // await this.prisma.bankTransaction.create({
    //   data: transaction,
    // });
  }

  /**
   * Attempt to automatically match transaction with invoice
   */
  private async attemptAutoMatch(
    transaction: BankTransaction
  ): Promise<boolean> {
    // In production:
    // 1. Look for unpaid invoices matching the amount
    // 2. Check variable symbol (VS) if present
    // 3. Check counterparty name
    // 4. Use AI to suggest matches if no exact match
    // 5. Auto-match if confidence > 90%

    // Mock: would implement matching logic
    return false;
  }

  /**
   * Update last sync timestamp
   */
  private async updateLastSync(bankAccountId: string): Promise<void> {
    // In production, update BankAccount
    // await this.prisma.bankAccount.update({
    //   where: { id: bankAccountId },
    //   data: { lastSyncAt: new Date() },
    // });
  }

  /**
   * Schedule automatic syncs
   */
  async scheduleAutoSync(tenantId: string): Promise<void> {
    // In production:
    // 1. Query accounts with autoSync enabled
    // 2. For each account, check syncFrequency
    // 3. Schedule sync job (using cron, BullMQ, or similar)

    // Example with cron:
    // - HOURLY: sync every hour
    // - DAILY: sync at midnight
    // - WEEKLY: sync on Mondays
  }
}
