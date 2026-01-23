'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, RefreshCw, Check, X } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';

interface AIDraftEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  context?: Record<string, unknown>;
  promptType?: 'email' | 'description' | 'proposal' | 'custom';
  customPrompt?: string;
  className?: string;
}

export function AIDraftEditor({
  value,
  onChange,
  placeholder = 'Start typing or let AI help...',
  context,
  promptType = 'email',
  customPrompt,
  className,
}: AIDraftEditorProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentText: value,
          context,
          promptType,
          customPrompt,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate draft');

      const data = await response.json();
      setSuggestion(data.draft);
      setShowSuggestion(true);
    } catch (error) {
      console.error('AI draft error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const improveDraft = async () => {
    if (!value.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value,
          context,
          promptType,
        }),
      });

      if (!response.ok) throw new Error('Failed to improve draft');

      const data = await response.json();
      setSuggestion(data.improved);
      setShowSuggestion(true);
    } catch (error) {
      console.error('AI improve error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptSuggestion = () => {
    if (suggestion) {
      onChange(suggestion);
      setSuggestion(null);
      setShowSuggestion(false);
    }
  };

  const rejectSuggestion = () => {
    setSuggestion(null);
    setShowSuggestion(false);
  };

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, suggestion, showSuggestion]);

  return (
    <div className={cn('relative', className)}>
      {/* Main Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full resize-none rounded-lg border bg-background p-4 pb-16 text-sm focus:outline-none focus:ring-2 focus:ring-primary',
            showSuggestion && 'opacity-50'
          )}
          rows={6}
          disabled={isGenerating || showSuggestion}
        />

        {/* AI Toolbar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateDraft}
              disabled={isGenerating || showSuggestion}
              className="gap-2"
            >
              {isGenerating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generate Draft
            </Button>
            {value.trim() && (
              <Button
                variant="outline"
                size="sm"
                onClick={improveDraft}
                disabled={isGenerating || showSuggestion}
                className="gap-2"
              >
                {isGenerating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Improve
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            AI-powered
          </div>
        </div>
      </div>

      {/* Suggestion Overlay */}
      <AnimatePresence>
        {showSuggestion && suggestion && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-purple-300 bg-white p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">
                AI Suggestion
              </span>
            </div>

            <div className="max-h-[200px] overflow-y-auto pr-2">
              <p className="whitespace-pre-wrap text-sm">{suggestion}</p>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={rejectSuggestion}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Discard
              </Button>
              <Button
                variant="ai"
                size="sm"
                onClick={acceptSuggestion}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
