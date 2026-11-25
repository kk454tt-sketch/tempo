"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCountry } from "@/components/providers/country-context";
import { Flag } from "@/components/ui/Flag";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/button-styles";
import { nextRadioIndex } from "@/lib/roving";
import { listCountries } from "@/lib/storefront";

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/** Mounted once by CountryProvider. Renders nothing while closed. */
export function CountrySelectorModal() {
  const { isModalOpen } = useCountry();
  if (!isModalOpen) return null;
  return createPortal(<ModalContent />, document.body);
}

function ModalContent() {
  const { country, setCountry, closeCountryModal } = useCountry();
  const countries = listCountries();
  const [initial] = useState<string>(country);
  const [selected, setSelected] = useState<string>(country);
  const [entered, setEntered] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const radioRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Enter transition (skipped by motion-reduce classes).
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus management, Escape, Tab trap, scroll lock, focus return.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    radioRefs.current[initial]?.focus();

    const onKeyDown = (e: { key: string; shiftKey: boolean; preventDefault(): void }) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCountryModal();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = dialog.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      const outside = !dialog.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const { body } = document;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
      // Back to whatever opened the modal; if that is gone (e.g. the banner
      // just hid itself), use the header chip.
      const target =
        opener && opener !== document.body && document.contains(opener)
          ? opener
          : document.querySelector<HTMLElement>("[data-country-chip]");
      target?.focus();
    };
  }, [closeCountryModal, initial]);

  function onRadioKeyDown(e: { key: string; preventDefault(): void }) {
    const current = countries.findIndex((c) => c.code === selected);
    const next = nextRadioIndex(e.key, current, countries.length);
    if (next === null) return;
    e.preventDefault();
    const code = countries[next].code;
    setSelected(code);
    radioRefs.current[code]?.focus();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={closeCountryModal}
        className={`absolute inset-0 bg-[rgba(15,23,42,0.35)] backdrop-blur-[12px] transition-opacity duration-200 motion-reduce:transition-none ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-modal-title"
        aria-describedby="country-modal-note"
        className={`relative max-h-[90dvh] w-full overflow-y-auto overscroll-contain rounded-t-[24px] bg-white p-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.28)] transition-[transform,opacity] duration-200 motion-reduce:transition-none sm:max-w-[420px] sm:rounded-[20px] sm:pb-7 ${
          entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="country-modal-title" className="text-headline-sm font-bold text-primary">
            Choose your country
          </h2>
          <button
            type="button"
            onClick={closeCountryModal}
            aria-label="Close"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="close" />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="country-modal-title"
          onKeyDown={onRadioKeyDown}
          className="mt-5 flex flex-col gap-3"
        >
          {countries.map((c) => {
            const isSelected = c.code === selected;
            return (
              <button
                key={c.code}
                ref={(el) => {
                  radioRefs.current[c.code] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setSelected(c.code)}
                className={`flex h-[52px] w-full items-center gap-3 rounded-[12px] border px-4 text-left text-body-md font-medium text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isSelected ? "border-amber-500 bg-amber-500/10" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Flag code={c.code} />
                <span className="flex-1">{c.name}</span>
                {isSelected && <Icon name="check" className="text-[22px] text-amber-500" />}
              </button>
            );
          })}
        </div>

        <p id="country-modal-note" className="mt-4 text-label-sm text-slate-500">
          Indonesia opens Amazon US.
        </p>

        <button
          type="button"
          onClick={() => setCountry(selected)}
          className={`mt-5 ${buttonClass("primary", "md", "w-full")}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
