'use client';

import * as React from 'react';
import type { AIMessage } from '../types';

interface UseAIChatOptions {
  tenantId: string;
  vertical: string;
  initialMessages?: AIMessage[];
  onMessage?: (message: AIMessage) => void;
  onError?: (error: Error) => void;
}

interface UseAIChatReturn {
  messages: AIMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  regenerateLastResponse: () => Promise<void>;
}

export function useAIChat({
  tenantId,
  vertical,
  initialMessages = [],
  onMessage,
  onError,
}: UseAIChatOptions): UseAIChatReturn {
  const [messages, setMessages] = React.useState<AIMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const sendMessage = React.useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            vertical,
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const assistantMessage: AIMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content,
          createdAt: new Date(),
          metadata: data.metadata,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        onMessage?.(assistantMessage);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, vertical, messages, isLoading, onMessage, onError]
  );

  const clearMessages = React.useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const regenerateLastResponse = React.useCallback(async () => {
    // Find the last user message
    const lastUserMessageIndex = messages
      .slice()
      .reverse()
      .findIndex((m) => m.role === 'user');

    if (lastUserMessageIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserMessageIndex;
    const lastUserMessage = messages[actualIndex];

    // Remove all messages after the last user message
    setMessages((prev) => prev.slice(0, actualIndex));

    // Resend the last user message
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    regenerateLastResponse,
  };
}
