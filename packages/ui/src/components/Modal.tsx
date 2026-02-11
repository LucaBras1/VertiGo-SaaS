'use client';

import * as React from 'react';
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle as HeadlessDialogTitle,
  Description as HeadlessDescription,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../utils';

// --- Modal (Root) ---
// Controlled dialog wrapper matching Radix API: open + onOpenChange
interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Modal({ open, onOpenChange, children }: ModalProps) {
  // Store internal state for uncontrolled usage via ModalTrigger
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <ModalContext.Provider value={{ isOpen, setOpen: handleOpenChange }}>
      {children}
    </ModalContext.Provider>
  );
}
Modal.displayName = 'Modal';

// Internal context for ModalTrigger / ModalClose
interface ModalContextValue {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
}

const ModalContext = React.createContext<ModalContextValue>({
  isOpen: false,
  setOpen: () => {},
});

function useModalContext() {
  return React.useContext(ModalContext);
}

// --- ModalTrigger ---
const ModalTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { setOpen } = useModalContext();
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        setOpen(true);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
ModalTrigger.displayName = 'ModalTrigger';

// --- ModalClose ---
const ModalClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { setOpen } = useModalContext();
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        setOpen(false);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
ModalClose.displayName = 'ModalClose';

// --- ModalPortal --- (HeadlessUI auto-portals, this is a passthrough)
function ModalPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
ModalPortal.displayName = 'ModalPortal';

// --- ModalOverlay --- (standalone overlay, used internally by ModalContent)
const ModalOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-sm', className)}
    {...props}
  />
));
ModalOverlay.displayName = 'ModalOverlay';

// --- ModalContent ---
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]',
};

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ModalSize;
  showClose?: boolean;
}

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, size = 'md', showClose = true, ...props }, ref) => {
    const { isOpen, setOpen } = useModalContext();

    return (
      <Transition show={isOpen}>
        <HeadlessDialog
          as="div"
          className="relative z-50"
          onClose={() => setOpen(false)}
        >
          {/* Overlay */}
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </TransitionChild>

          {/* Content */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel
                  ref={ref}
                  className={cn(
                    'w-full',
                    'rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl',
                    'dark:border-neutral-800 dark:bg-neutral-900',
                    sizeClasses[size],
                    className
                  )}
                  {...props}
                >
                  {children}
                  {showClose && (
                    <button
                      type="button"
                      className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                      onClick={() => setOpen(false)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </button>
                  )}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </HeadlessDialog>
      </Transition>
    );
  }
);
ModalContent.displayName = 'ModalContent';

// --- ModalHeader ---
const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col gap-1.5 border-b border-neutral-100 px-6 py-5 dark:border-neutral-800',
      className
    )}
    {...props}
  />
);
ModalHeader.displayName = 'ModalHeader';

// --- ModalFooter ---
const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800',
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = 'ModalFooter';

// --- ModalTitle ---
const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <HeadlessDialogTitle
    ref={ref}
    className={cn(
      'text-lg font-semibold text-neutral-900 dark:text-neutral-50',
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

// --- ModalDescription ---
const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <HeadlessDescription
    ref={ref}
    className={cn('text-sm text-neutral-500 dark:text-neutral-400', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

// --- ModalBody ---
const ModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4', className)} {...props} />
);
ModalBody.displayName = 'ModalBody';

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalBody,
};
