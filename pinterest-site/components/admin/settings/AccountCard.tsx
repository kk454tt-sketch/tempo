"use client";

import { useState } from "react";
import { changePassword } from "@/app/admin/settings/actions";
import { useNotify } from "@/components/admin/settings/bridge";
import { SettingsCard } from "@/components/admin/settings/SettingsCard";
import { buttonClass } from "@/components/ui/button-styles";
import { inputClass } from "@/components/ui/field-styles";
import { MIN_PASSWORD_LENGTH, validateNewPassword } from "@/lib/password";

export function AccountCard({ email }: { email: string }) {
  const notify = useNotify();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const problem = validateNewPassword(password, confirm);
    setError(problem);
    if (problem) {
      notify.error(problem);
      return;
    }
    setSaving(true);
    try {
      const result = await changePassword(password, confirm);
      if (!result.ok) {
        setError(result.error);
        notify.error(result.error);
        return;
      }
      setPassword("");
      setConfirm("");
      notify.success("Password changed");
    } catch {
      notify.error("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard id="account-title" title="Account">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="account-email" className="mb-1.5 block text-label-md font-medium text-on-surface">
            Email
          </label>
          <input id="account-email" className={inputClass} value={email} readOnly aria-readonly="true" />
        </div>

        <form
          className="flex flex-col gap-4 border-t border-slate-100 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <h3 className="text-body-lg font-semibold text-on-surface">Change password</h3>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-label-md font-medium text-on-surface">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className={inputClass}
              value={password}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              aria-describedby="password-hint"
              onChange={(e) => setPassword(e.target.value)}
            />
            <p id="password-hint" className="mt-1 text-label-sm text-on-surface-variant">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-label-md font-medium text-on-surface">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              className={inputClass}
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <p role="alert" className="min-h-5 text-label-md text-red-600">
            {error}
          </p>
          <div>
            <button type="submit" disabled={saving || !password || !confirm} className={`${buttonClass("primary")} disabled:opacity-50`}>
              Change password
            </button>
          </div>
        </form>
      </div>
    </SettingsCard>
  );
}
