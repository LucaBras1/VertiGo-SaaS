'use client';

import * as React from 'react';

interface UseAICompletionOptions {
  tenantId: string;
  endpoint?: string;
  onComplete?: (result: string) => void;
  onError?: (error: Error) => void;
}

interface UseAICompletionReturn {
  completion: string | null;
  isLoading: boolean;
  error: Error | null;
  complete: (prompt: string, context?: Record<string, unknown>) => Promise<string | null>;
  reset: () => void;
}

export function useAICompletion({
  tenantId,
  endpoint = '/api/ai/complete',
  onComplete,
  onError,
}: UseAICompletionOptions): UseAICompletionReturn {
  const [completion, setCompletion] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const complete = React.useCallback(
    async (prompt: string, context?: Record<string, unknown>): Promise<string | null> => {
      if (!prompt.trim() || isLoading) return null;

      setIsLoading(true);
      setError(null);
      setCompletion(null);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            prompt,
            context,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = data.completion || data.content || data.result;

        setCompletion(result);
        onComplete?.(result);

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, endpoint, isLoading, onComplete, onError]
  );

  const reset = React.useCallback(() => {
    setCompletion(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    completion,
    isLoading,
    error,
    complete,
    reset,
  };
}
