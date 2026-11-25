"use client";

import { useId } from "react";
import { Dialog } from "./Dialog";
import { Spinner } from "./Spinner";
import { ui } from "./classes";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button, for deletes. */
  destructive?: boolean;
  /** Disables both buttons and shows a spinner while the action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      dismissible={!loading}
      labelledBy={titleId}
      describedBy={description ? descriptionId : undefined}
      className="m-auto w-[calc(100%-2rem)] max-w-[420px] bg-transparent p-0"
    >
      <div className="rounded-[20px] bg-white p-7 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.25)]">
        <h2 id={titleId} className="text-headline-sm font-bold text-[#0F172A]">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-2 text-body-sm text-[#64748B]">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={loading} className={ui.btnGhost}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={destructive ? ui.btnDanger : ui.btnPrimary}
          >
            {loading ? <Spinner /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
