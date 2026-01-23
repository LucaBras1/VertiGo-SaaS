/**
 * Types for VertiGo UI components
 */

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AIWidgetProps {
  tenantId: string;
  vertical: string;
  onMessage?: (message: AIMessage) => void;
  onError?: (error: Error) => void;
  className?: string;
  placeholder?: string;
  welcomeMessage?: string;
}

export interface QuoteSuggestion {
  id: string;
  tier: 'economy' | 'standard' | 'premium';
  name: string;
  price: number;
  currency: string;
  description: string;
  items: QuoteItem[];
  conversionProbability: number;
  reasoning: string;
}

export interface QuoteItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InsightData {
  id: string;
  type: 'revenue' | 'churn' | 'opportunity' | 'alert';
  title: string;
  description: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  productName: string;
  tagline: string;
  icon: string;
}
