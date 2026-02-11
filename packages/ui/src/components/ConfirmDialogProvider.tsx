'use client';

import * as React from 'react';
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './Button';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export interface ConfirmDefaults {
  confirmText: string;
  cancelText: string;
  deleteTitle: string;
  deleteMessage: (itemName: string) => string;
  actionConfirmText: string;
  actionCancelText: string;
}

const ConfirmContext = React.createContext<ConfirmFn | null>(null);
const ConfirmDefaultsContext = React.createContext<ConfirmDefaults>({
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  deleteTitle: 'Delete item',
  deleteMessage: (itemName: string) => `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
  actionConfirmText: 'Confirm',
  actionCancelText: 'Cancel',
});

export function useConfirmContext(): ConfirmFn {
  const context = React.useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmContext must be used within ConfirmDialogProvider');
  }
  return context;
}

export function useConfirmDefaults(): ConfirmDefaults {
  return React.useContext(ConfirmDefaultsContext);
}

export interface ConfirmDialogProviderProps {
  children: React.ReactNode;
  defaultConfirmText?: string;
  defaultCancelText?: string;
  defaultDeleteTitle?: string;
  defaultDeleteMessage?: (itemName: string) => string;
  defaultActionConfirmText?: string;
  defaultActionCancelText?: string;
}

export function ConfirmDialogProvider({
  children,
  defaultConfirmText = 'Confirm',
  defaultCancelText = 'Cancel',
  defaultDeleteTitle = 'Delete item',
  defaultDeleteMessage = (itemName: string) => `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
  defaultActionConfirmText = 'Confirm',
  defaultActionCancelText = 'Cancel',
}: ConfirmDialogProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = React.useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const variantConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonVariant: 'destructive' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      buttonVariant: 'default' as const,
    },
    default: {
      icon: AlertTriangle,
      iconBg: 'bg-brand-100 dark:bg-brand-900/30',
      iconColor: 'text-brand-600 dark:text-brand-400',
      buttonVariant: 'default' as const,
    },
  };

  const variant = options?.variant || 'default';
  const config = variantConfig[variant];
  const Icon = config.icon;

  const defaults = React.useMemo<ConfirmDefaults>(() => ({
    confirmText: defaultConfirmText,
    cancelText: defaultCancelText,
    deleteTitle: defaultDeleteTitle,
    deleteMessage: defaultDeleteMessage,
    actionConfirmText: defaultActionConfirmText,
    actionCancelText: defaultActionCancelText,
  }), [defaultConfirmText, defaultCancelText, defaultDeleteTitle, defaultDeleteMessage, defaultActionConfirmText, defaultActionCancelText]);

  return (
    <ConfirmContext.Provider value={confirm}>
      <ConfirmDefaultsContext.Provider value={defaults}>
        {children}

        <Transition appear show={isOpen} as={React.Fragment}>
          <HeadlessDialog as="div" className="relative z-50" onClose={handleCancel}>
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <TransitionChild
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel
                    className={cn(
                      'w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all',
                      'dark:bg-neutral-900 dark:text-neutral-100'
                    )}
                  >
                    {options && (
                      <>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-neutral-100 transition-colors dark:hover:bg-neutral-800"
                        >
                          <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                        </button>

                        <div
                          className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center mb-4',
                            config.iconBg
                          )}
                        >
                          <Icon className={cn('w-6 h-6', config.iconColor)} />
                        </div>

                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                          {options.title}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                          {options.message}
                        </p>

                        <div className="flex gap-3">
                          <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={handleCancel}
                          >
                            {options.cancelText || defaultCancelText}
                          </Button>
                          <Button
                            variant={config.buttonVariant}
                            className="flex-1"
                            onClick={handleConfirm}
                          >
                            {options.confirmText || defaultConfirmText}
                          </Button>
                        </div>
                      </>
                    )}
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </HeadlessDialog>
        </Transition>
      </ConfirmDefaultsContext.Provider>
    </ConfirmContext.Provider>
  );
}
