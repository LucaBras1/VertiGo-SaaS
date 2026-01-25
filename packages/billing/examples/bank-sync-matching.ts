/**
 * Example: Bank Transaction Sync with AI Payment Matching
 */

import { BankTransactionSyncService } from '../src/integrations/bank/transaction-sync';
import { AIPaymentMatcher } from '../src/ai/payment-matcher';
import { InvoiceService } from '../src/services';
import { PrismaClient } from '@prisma/client';
import type { BankAccount } from '../src/types/bank';

const prisma = new PrismaClient();
const syncService = new BankTransactionSyncService(prisma);
const matcher = new AIPaymentMatcher(process.env.OPENAI_API_KEY!);
const invoiceService = new InvoiceService(prisma);

async function syncAndMatchPayments() {
  // Scenario: Sync Fio Bank account and match transactions with invoices

  // Mock bank account
  const bankAccount: BankAccount = {
    id: 'bank_acc_123',
    tenantId: 'tenant_123',
    accountName: 'Main Business Account',
    accountNumber: '1234567890',
    bankCode: '0800',
    iban: 'CZ1234567890123456789012',
    swift: 'FIOBCZPPXXX',
    provider: 'FIO',
    providerAccountId: 'fio_123',
    currency: 'CZK',
    balance: 150000,
    balanceUpdatedAt: new Date(),
    autoSync: true,
    lastSyncAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last sync 24h ago
    syncFrequency: 'DAILY',
    credentials: {
      token: process.env.FIO_API_TOKEN,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('🏦 Syncing bank account:', bankAccount.accountName);

  // Sync transactions from last 30 days
  const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = new Date();

  const syncResult = await syncService.syncAccount(bankAccount, dateFrom, dateTo);

  console.log('\n📊 Sync Results:');
  console.log(`- Transactions imported: ${syncResult.transactionsImported}`);
  console.log(`- Automatically matched: ${syncResult.transactionsMatched}`);

  // Get unpaid invoices
  const unpaidInvoices = await invoiceService.listInvoices({
    tenantId: bankAccount.tenantId,
    status: 'SENT',
  });

  console.log(`\n📄 Unpaid invoices: ${unpaidInvoices.length}`);

  // Mock: Get unmatched transactions (in production, query from database)
  const unmatchedTransactions = [
    {
      id: 'tx_1',
      bankAccountId: bankAccount.id,
      tenantId: bankAccount.tenantId,
      transactionId: '123456789',
      date: new Date(),
      amount: 12100,
      currency: 'CZK',
      type: 'CREDIT' as const,
      counterpartyName: 'Wedding Planners Ltd',
      description: 'Payment for invoice',
      variableSymbol: '2024001',
      isMatched: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Try AI matching for each unmatched transaction
  for (const transaction of unmatchedTransactions) {
    console.log(`\n🤖 AI Matching for transaction ${transaction.transactionId}...`);
    console.log(`Amount: ${transaction.amount} ${transaction.currency}`);
    console.log(`From: ${transaction.counterpartyName}`);

    const matches = await matcher.findMatches(transaction, unpaidInvoices);

    console.log(`\n🎯 Found ${matches.length} potential matches:`);

    for (const match of matches.slice(0, 3)) {
      console.log(`\n  ${match.invoiceNumber}`);
      console.log(`  Confidence: ${(match.confidence * 100).toFixed(0)}%`);
      console.log(`  Reason: ${match.reason}`);

      // Auto-match if confidence > 90%
      if (match.confidence > 0.9) {
        console.log(`  ✅ AUTO-MATCHED (high confidence)`);

        await invoiceService.markAsPaid(
          match.invoiceId,
          transaction.date,
          'BANK_TRANSFER',
          transaction.transactionId
        );

        // Update transaction as matched (in production, update database)
        transaction.isMatched = true;
        transaction.matchedInvoiceId = match.invoiceId;
      }
    }
  }

  return { syncResult, unmatchedTransactions };
}

// Run example
syncAndMatchPayments()
  .then(() => console.log('\n✅ Bank sync and matching example completed'))
  .catch(console.error);
