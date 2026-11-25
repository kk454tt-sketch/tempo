"use client";

// The settings cards depend on two pieces that already exist in your admin
// area. They are imported here, once, so a mismatch is a two-line fix.
//
// ASSUMED: components/ui/ConfirmDialog exports ConfirmDialog with props
//   { open, title, message, confirmLabel, destructive, onConfirm, onCancel }
// ASSUMED: components/ui/Toast exports useToast() returning { success(msg), error(msg) }
import { useToast } from "@/components/ui/Toast";

export { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function useNotify() {
  const toast = useToast();
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
  };
}
