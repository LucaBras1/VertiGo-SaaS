/**
 * @vertigo/ui
 * Shared UI components for VertiGo SaaS platform
 */

// Components
export { AIAssistantWidget } from './components/AIAssistantWidget';
export { AIQuoteSuggestion } from './components/AIQuoteSuggestion';
export { AIDraftEditor } from './components/AIDraftEditor';
export { AIInsightsPanel } from './components/AIInsightsPanel';
export { ConversationalBooking } from './components/ConversationalBooking';
export { Button, buttonVariants } from './components/Button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/Card';
export { LoadingSpinner } from './components/LoadingSpinner';

// Pricing Components
export {
  PricingCard,
  PricingToggle,
  PricingTable,
  defaultTiers,
} from './components/pricing';
export type {
  PricingCardProps,
  PricingToggleProps,
  PricingTableProps,
  TierConfig,
  SubscriptionTier,
  BillingInterval,
} from './components/pricing';

// Hooks
export { useAIChat } from './hooks/useAIChat';
export { useAICompletion } from './hooks/useAICompletion';
export { useVerticalTheme } from './hooks/useVerticalTheme';

// Types
export type { AIMessage, AIWidgetProps, QuoteSuggestion, InsightData } from './types';

// Utils
export { cn } from './utils';
