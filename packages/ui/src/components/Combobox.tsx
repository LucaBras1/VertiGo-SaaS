'use client';

import * as React from 'react';
import {
  Combobox as HeadlessCombobox,
  ComboboxInput as HeadlessComboboxInput,
  ComboboxButton as HeadlessComboboxButton,
  ComboboxOptions as HeadlessComboboxOptions,
  ComboboxOption as HeadlessComboboxOption,
  Transition,
} from '@headlessui/react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '../utils';

const Combobox = HeadlessCombobox;

interface ComboboxInputProps {
  className?: string;
  displayValue?: (item: any) => string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ className, ...props }, ref) => (
    <HeadlessComboboxInput
      ref={ref}
      className={cn(
        'w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg',
        'focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
        'dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100',
        'dark:focus:ring-brand-400 dark:focus:border-brand-400',
        className
      )}
      {...props}
    />
  )
);
ComboboxInput.displayName = 'ComboboxInput';

interface ComboboxButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const ComboboxButton = React.forwardRef<HTMLButtonElement, ComboboxButtonProps>(
  ({ className, children, ...props }, ref) => (
    <HeadlessComboboxButton
      ref={ref}
      className={cn('absolute inset-y-0 right-0 flex items-center pr-2', className)}
      {...props}
    >
      {children ?? <ChevronsUpDown className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />}
    </HeadlessComboboxButton>
  )
);
ComboboxButton.displayName = 'ComboboxButton';

interface ComboboxOptionsProps {
  className?: string;
  children: React.ReactNode;
}

const ComboboxOptions = React.forwardRef<HTMLUListElement, ComboboxOptionsProps>(
  ({ className, children, ...props }, ref) => (
    <Transition
      as={React.Fragment}
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <HeadlessComboboxOptions
        ref={ref}
        className={cn(
          'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1',
          'shadow-lg ring-1 ring-black/5 focus:outline-none',
          'dark:bg-neutral-900 dark:ring-white/10',
          className
        )}
        {...props}
      >
        {children}
      </HeadlessComboboxOptions>
    </Transition>
  )
);
ComboboxOptions.displayName = 'ComboboxOptions';

const ComboboxOption = HeadlessComboboxOption;

interface ComboboxEmptyProps {
  className?: string;
  children?: React.ReactNode;
}

function ComboboxEmpty({ className, children }: ComboboxEmptyProps) {
  return (
    <div className={cn('px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400', className)}>
      {children ?? 'No results found'}
    </div>
  );
}
ComboboxEmpty.displayName = 'ComboboxEmpty';

interface ComboboxLoadingProps {
  className?: string;
  children?: React.ReactNode;
}

function ComboboxLoading({ className, children }: ComboboxLoadingProps) {
  return (
    <div className={cn('px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400', className)}>
      {children ?? 'Loading...'}
    </div>
  );
}
ComboboxLoading.displayName = 'ComboboxLoading';

export {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  ComboboxEmpty,
  ComboboxLoading,
};
