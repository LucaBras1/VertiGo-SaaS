'use client';

import * as React from 'react';
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle as HeadlessDialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { cn } from '../utils';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right';
}

function SlideOver({ open, onClose, children, className, side = 'right' }: SlideOverProps) {
  return (
    <Transition show={open} as={React.Fragment}>
      <HeadlessDialog as="div" className={cn('relative z-50', className)} onClose={onClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={cn(
                'pointer-events-none fixed inset-y-0 flex max-w-full',
                side === 'right' ? 'right-0 pl-10' : 'left-0 pr-10'
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
SlideOver.displayName = 'SlideOver';

interface SlideOverPanelProps {
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right';
}

function SlideOverPanel({ children, className, side = 'right' }: SlideOverPanelProps) {
  const enterFrom = side === 'right' ? 'translate-x-full' : '-translate-x-full';
  const leaveTo = side === 'right' ? 'translate-x-full' : '-translate-x-full';

  return (
    <TransitionChild
      as={React.Fragment}
      enter="transform transition ease-in-out duration-300"
      enterFrom={enterFrom}
      enterTo="translate-x-0"
      leave="transform transition ease-in-out duration-300"
      leaveFrom="translate-x-0"
      leaveTo={leaveTo}
    >
      <DialogPanel className={cn('pointer-events-auto w-screen', className)}>
        {children}
      </DialogPanel>
    </TransitionChild>
  );
}
SlideOverPanel.displayName = 'SlideOverPanel';

interface SlideOverTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

function SlideOverTitle({ children, className, as: Component = 'h2' }: SlideOverTitleProps) {
  return (
    <HeadlessDialogTitle
      as={Component}
      className={cn('text-lg font-semibold text-neutral-900 dark:text-neutral-50', className)}
    >
      {children}
    </HeadlessDialogTitle>
  );
}
SlideOverTitle.displayName = 'SlideOverTitle';

export { SlideOver, SlideOverPanel, SlideOverTitle };
