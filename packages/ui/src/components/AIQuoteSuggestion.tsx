'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Check, ChevronRight } from 'lucide-react';
import { cn, formatCurrency } from '../utils';
import { Button } from './Button';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import type { QuoteSuggestion } from '../types';

interface AIQuoteSuggestionProps {
  orderId?: string;
  orderData?: Record<string, unknown>;
  onSelectQuote?: (quote: QuoteSuggestion) => void;
  onRefresh?: () => void;
  className?: string;
}

export function AIQuoteSuggestion({
  orderId,
  orderData,
  onSelectQuote,
  onRefresh,
  className,
}: AIQuoteSuggestionProps) {
  const [quotes, setQuotes] = React.useState<QuoteSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedTier, setSelectedTier] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchQuotes = React.useCallback(async () => {
    if (!orderId && !orderData) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderData }),
      });

      if (!response.ok) throw new Error('Failed to generate quotes');

      const data = await response.json();
      setQuotes(data.quotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, orderData]);

  React.useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const tierColors = {
    economy: 'border-gray-300 bg-gray-50',
    standard: 'border-blue-300 bg-blue-50',
    premium: 'border-purple-300 bg-purple-50',
  };

  const tierLabels = {
    economy: 'Economy',
    standard: 'Standard',
    premium: 'Premium',
  };

  if (isLoading) {
    return (
      <Card variant="ai" className={cn('p-6', className)}>
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="font-medium">AI is analyzing your order...</span>
        </div>
        <div className="mt-4 flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="ai" className={cn('p-6', className)}>
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchQuotes}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (quotes.length === 0) {
    return null;
  }

  return (
    <Card variant="ai" className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="font-medium">AI Quote Suggestions</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh || fetchQuotes}>
          Refresh
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <AnimatePresence>
          {quotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                className={cn(
                  'w-full rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
                  tierColors[quote.tier],
                  selectedTier === quote.tier && 'ring-2 ring-primary'
                )}
                onClick={() => {
                  setSelectedTier(quote.tier);
                  onSelectQuote?.(quote);
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {tierLabels[quote.tier]}
                  </span>
                  {quote.tier === 'standard' && (
                    <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <span className="text-2xl font-bold">
                    {formatCurrency(quote.price, quote.currency)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {quote.description}
                </p>

                <div className="mt-3 space-y-1">
                  {quote.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{item.name}</span>
                    </div>
                  ))}
                  {quote.items.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{quote.items.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-md bg-white/50 p-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {Math.round(quote.conversionProbability * 100)}% conversion
                    probability
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-end text-sm text-primary">
                  <span>Select</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selectedTier && (
        <motion.div
          className="mt-4 rounded-lg bg-muted p-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h4 className="font-medium">AI Reasoning</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            {quotes.find((q) => q.tier === selectedTier)?.reasoning}
          </p>
        </motion.div>
      )}
    </Card>
  );
}
