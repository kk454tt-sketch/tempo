'use client';

/**
 * The ONLY file that touches your existing Toast and ConfirmDialog (built in the admin-shell step).
 * If their APIs differ from what is assumed below, change just this file.
 */
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

export function useNotify() {
  const toast = useToast(); // assumed: { success(message), error(message) }
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
  };
}

interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Confirm({ open, title, message, confirmLabel, destructive, loading, onConfirm, onCancel }: ConfirmProps) {
  return (
    <ConfirmDialog
      open={open}
      title={title}
      description={message}
      confirmLabel={confirmLabel}
      destructive={destructive}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
