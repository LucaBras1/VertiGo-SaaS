import type { BankProvider } from '../../types/bank';
import { FioClient, type FioClientConfig } from './providers/fio-client';
import { PlaidClient, type PlaidClientConfig } from './providers/plaid-client';

export interface BankClientFactory {
  createClient(provider: BankProvider, config: any): any;
}

export class BankFactory implements BankClientFactory {
  /**
   * Create bank client based on provider
   */
  createClient(provider: BankProvider, config: any): FioClient | PlaidClient {
    switch (provider) {
      case 'FIO':
        return new FioClient(config as FioClientConfig);

      case 'PLAID':
        return new PlaidClient(config as PlaidClientConfig);

      case 'WISE':
      case 'REVOLUT':
      case 'NORDIGEN':
        // These would be implemented similarly
        throw new Error(`${provider} client not yet implemented`);

      case 'MANUAL':
        throw new Error('Manual provider does not have a client');

      default:
        throw new Error(`Unknown bank provider: ${provider}`);
    }
  }

  /**
   * Validate provider configuration
   */
  validateConfig(provider: BankProvider, config: any): boolean {
    switch (provider) {
      case 'FIO':
        return !!(config.token && config.accountId);

      case 'PLAID':
        return !!(
          config.clientId &&
          config.secret &&
          config.environment &&
          config.accessToken &&
          config.accountId
        );

      case 'WISE':
      case 'REVOLUT':
      case 'NORDIGEN':
        // Would validate specific configs
        return true;

      case 'MANUAL':
        return true; // Manual always valid

      default:
        return false;
    }
  }

  /**
   * Get required config fields for a provider
   */
  getRequiredFields(provider: BankProvider): string[] {
    switch (provider) {
      case 'FIO':
        return ['token', 'accountId'];

      case 'PLAID':
        return ['clientId', 'secret', 'environment', 'accessToken', 'accountId'];

      case 'WISE':
        return ['apiKey', 'profileId'];

      case 'REVOLUT':
        return ['apiKey', 'accountId'];

      case 'NORDIGEN':
        return ['secretId', 'secretKey', 'requisitionId'];

      case 'MANUAL':
        return [];

      default:
        return [];
    }
  }
}
