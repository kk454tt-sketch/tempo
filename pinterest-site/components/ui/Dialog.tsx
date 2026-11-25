"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** When false, Escape and backdrop clicks are ignored (e.g. while saving). */
  dismissible?: boolean;
  labelledBy?: string;
  describedBy?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Thin wrapper around the native <dialog>. showModal() gives us a focus trap,
 * Escape handling and focus return to the trigger. We add backdrop click,
 * body scroll lock and the blurred backdrop.
 * Keep the dialog itself padding-free so a click on the dialog element means a click on the backdrop.
 */
export function Dialog({
  open,
  onClose,
  dismissible = true,
  labelledBy,
  describedBy,
  className = "",
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={`backdrop:bg-[rgba(15,23,42,0.35)] backdrop:backdrop-blur-[12px] ${className}`}
    >
      {children}
    </dialog>
  );
}
