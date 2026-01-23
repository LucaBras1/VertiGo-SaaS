'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  DollarSign,
  UserMinus,
  Lightbulb,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { cn, formatCurrency } from '../utils';
import { Card } from './Card';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import type { InsightData } from '../types';

interface AIInsightsPanelProps {
  tenantId: string;
  onInsightClick?: (insight: InsightData) => void;
  className?: string;
}

export function AIInsightsPanel({
  tenantId,
  onInsightClick,
  className,
}: AIInsightsPanelProps) {
  const [insights, setInsights] = React.useState<InsightData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const fetchInsights = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ai/insights?tenantId=${tenantId}`);
      if (!response.ok) throw new Error('Failed to fetch insights');

      const data = await response.json();
      setInsights(data.insights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  React.useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getIcon = (type: InsightData['type']) => {
    const icons = {
      revenue: DollarSign,
      churn: UserMinus,
      opportunity: Lightbulb,
      alert: AlertTriangle,
    };
    return icons[type] || Lightbulb;
  };

  const getTrendIcon = (trend?: InsightData['trend']) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getPriorityColor = (priority: InsightData['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    };
    return colors[priority];
  };

  const getTypeColor = (type: InsightData['type']) => {
    const colors = {
      revenue: 'text-green-500 bg-green-100',
      churn: 'text-red-500 bg-red-100',
      opportunity: 'text-blue-500 bg-blue-100',
      alert: 'text-amber-500 bg-amber-100',
    };
    return colors[type];
  };

  if (isLoading) {
    return (
      <Card variant="insight" className={cn('p-6', className)}>
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="font-medium">Loading AI Insights...</span>
        </div>
        <div className="mt-6 flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="insight" className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-medium">AI Business Insights</h3>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchInsights}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {insights.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No insights available yet. Keep using the platform to generate insights!
          </p>
        ) : (
          insights.map((insight, index) => {
            const Icon = getIcon(insight.type);

            return (
              <motion.button
                key={insight.id}
                className="flex w-full items-start gap-3 rounded-lg border bg-white/50 p-4 text-left transition-all hover:bg-white hover:shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onInsightClick?.(insight)}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                    getTypeColor(insight.type)
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <span
                      className={cn(
                        'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                        getPriorityColor(insight.priority)
                      )}
                    >
                      {insight.priority}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {insight.description}
                  </p>

                  <div className="mt-2 flex items-center gap-4">
                    {insight.value !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">
                          {formatCurrency(insight.value)}
                        </span>
                        {getTrendIcon(insight.trend)}
                      </div>
                    )}

                    {insight.actionLabel && (
                      <div className="flex items-center gap-1 text-sm text-primary">
                        <span>{insight.actionLabel}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </Card>
  );
}
