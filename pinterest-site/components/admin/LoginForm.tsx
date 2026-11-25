"use client";

import { useActionState, useId, useState } from "react";
import { signInAction, type LoginState } from "@/app/admin/login/actions";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { ui } from "@/components/ui/classes";

const initialState: LoginState = { error: null, email: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const hasError = Boolean(state.error);

  return (
    <form action={formAction} aria-label="Admin sign in" className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor={emailId} className={ui.label}>
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={ui.input}
        />
      </div>

      <div>
        <label htmlFor={passwordId} className={ui.label}>
          Password
        </label>
        <div className="relative">
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className={`${ui.input} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
          >
            <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
          </button>
        </div>
      </div>

      <button type="submit" disabled={pending} aria-busy={pending} className={`${ui.btnPrimary} w-full`}>
        {pending ? <Spinner /> : null}
        Sign in
      </button>

      {hasError ? (
        <p id={errorId} role="alert" className="text-body-sm text-[#DC2626]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
