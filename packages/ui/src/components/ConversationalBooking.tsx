'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Calendar, Clock, MapPin, DollarSign, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn, formatCurrency, formatDate } from '../utils';
import { Button } from './Button';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';

interface BookingStep {
  id: string;
  type: 'date' | 'time' | 'location' | 'details' | 'confirm';
  question: string;
  answer?: string;
  options?: string[];
}

interface ConversationalBookingProps {
  tenantId: string;
  vertical: string;
  performanceId?: string;
  onComplete?: (bookingData: Record<string, unknown>) => void;
  className?: string;
}

export function ConversationalBooking({
  tenantId,
  vertical,
  performanceId,
  onComplete,
  className,
}: ConversationalBookingProps) {
  const [messages, setMessages] = React.useState<
    { role: 'assistant' | 'user'; content: string; options?: string[] }[]
  >([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [bookingData, setBookingData] = React.useState<Record<string, unknown>>({});
  const [isComplete, setIsComplete] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Initial greeting
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm here to help you book the perfect experience. Let's start with some details about your event. What date are you looking at?`,
        options: ['This weekend', 'Next week', 'Specific date...'],
      },
    ]);
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          vertical,
          performanceId,
          messages: [...messages, userMessage],
          bookingData,
        }),
      });

      if (!response.ok) throw new Error('Failed to process');

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          options: data.options,
        },
      ]);

      if (data.extractedData) {
        setBookingData((prev) => ({ ...prev, ...data.extractedData }));
      }

      if (data.isComplete) {
        setIsComplete(true);
        onComplete?.(data.bookingData);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Could you please try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    handleSend(option);
  };

  return (
    <Card className={cn('flex h-[600px] flex-col overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-white">
        <Sparkles className="h-5 w-5" />
        <div>
          <h3 className="font-semibold">Book Your Experience</h3>
          <p className="text-xs opacity-80">AI-powered booking assistant</p>
        </div>
      </div>

      {/* Progress Bar */}
      {Object.keys(bookingData).length > 0 && !isComplete && (
        <div className="border-b px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {bookingData.date && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-700">
                <Calendar className="h-3 w-3" />
                {bookingData.date as string}
              </span>
            )}
            {bookingData.time && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                <Clock className="h-3 w-3" />
                {bookingData.time as string}
              </span>
            )}
            {bookingData.location && (
              <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-purple-700">
                <MapPin className="h-3 w-3" />
                {(bookingData.location as string).slice(0, 20)}...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                    {message.content}
                  </ReactMarkdown>

                  {/* Quick Options */}
                  {message.options && message.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option, i) => (
                        <button
                          key={i}
                          className="rounded-full border bg-white px-3 py-1 text-sm transition-colors hover:bg-gray-100"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Thinking...</span>
              </div>
            </motion.div>
          )}

          {/* Booking Complete */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800">
                Booking Request Submitted!
              </h3>
              <p className="mt-2 text-sm text-green-600">
                We've received your booking request. You'll hear from us shortly.
              </p>

              <div className="mt-4 space-y-2 text-left">
                {bookingData.date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>{bookingData.date as string}</span>
                  </div>
                )}
                {bookingData.time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{bookingData.time as string}</span>
                  </div>
                )}
                {bookingData.estimatedPrice && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>
                      Estimated: {formatCurrency(bookingData.estimatedPrice as number)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {!isComplete && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              variant="ai"
              className="rounded-full"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
