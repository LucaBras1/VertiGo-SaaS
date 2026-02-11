'use client';

import { useConfirmContext, useConfirmDefaults } from '../components/ConfirmDialogProvider';

export function useConfirm() {
  const confirm = useConfirmContext();
  const defaults = useConfirmDefaults();

  return {
    confirm,
    confirmDelete: (itemName: string) =>
      confirm({
        title: defaults.deleteTitle,
        message: defaults.deleteMessage(itemName),
        confirmText: defaults.confirmText,
        cancelText: defaults.cancelText,
        variant: 'danger',
      }),
    confirmAction: (title: string, message: string) =>
      confirm({
        title,
        message,
        confirmText: defaults.actionConfirmText,
        cancelText: defaults.actionCancelText,
        variant: 'warning',
      }),
  };
}
