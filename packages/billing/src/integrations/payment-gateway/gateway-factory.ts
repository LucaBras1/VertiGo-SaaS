import type { PaymentGatewayProvider } from '../../types/payment';
import { StripeClient, type StripeClientConfig } from './providers/stripe-client';

export class PaymentGatewayFactory {
  /**
   * Create payment gateway client
   */
  createClient(
    provider: PaymentGatewayProvider,
    config: any
  ): StripeClient {
    switch (provider) {
      case 'STRIPE':
        return new StripeClient(config as StripeClientConfig);

      case 'PAYPAL':
      case 'GOPAY':
      case 'ADYEN':
      case 'SQUARE':
        throw new Error(`${provider} client not yet implemented`);

      default:
        throw new Error(`Unknown payment gateway provider: ${provider}`);
    }
  }

  /**
   * Validate provider configuration
   */
  validateConfig(provider: PaymentGatewayProvider, config: any): boolean {
    switch (provider) {
      case 'STRIPE':
        return !!config.secretKey;

      case 'PAYPAL':
        return !!(config.clientId && config.clientSecret);

      case 'GOPAY':
        return !!(config.goId && config.clientId && config.clientSecret);

      case 'ADYEN':
        return !!(config.apiKey && config.merchantAccount);

      case 'SQUARE':
        return !!(config.accessToken && config.locationId);

      default:
        return false;
    }
  }

  /**
   * Get required config fields
   */
  getRequiredFields(provider: PaymentGatewayProvider): string[] {
    switch (provider) {
      case 'STRIPE':
        return ['secretKey', 'webhookSecret'];

      case 'PAYPAL':
        return ['clientId', 'clientSecret', 'mode'];

      case 'GOPAY':
        return ['goId', 'clientId', 'clientSecret'];

      case 'ADYEN':
        return ['apiKey', 'merchantAccount', 'environment'];

      case 'SQUARE':
        return ['accessToken', 'locationId', 'environment'];

      default:
        return [];
    }
  }
}
