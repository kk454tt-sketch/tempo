"use client";

import { useState } from "react";
import { saveAffiliateTags } from "@/app/admin/settings/actions";
import { useNotify } from "@/components/admin/settings/bridge";
import { SettingsCard } from "@/components/admin/settings/SettingsCard";
import { Flag } from "@/components/ui/Flag";
import { buttonClass } from "@/components/ui/button-styles";
import { inputClass } from "@/components/ui/field-styles";
import { AFFILIATE_COUNTRIES, isValidTag, normalizeTag, type AffiliateCountry } from "@/lib/affiliate-shared";
import { getCountry } from "@/lib/storefront";

type Tags = Record<AffiliateCountry, string>;

export function AffiliateTagsCard({ initial }: { initial: Tags }) {
  const notify = useNotify();
  const [saved, setSaved] = useState<Tags>(initial);
  const [values, setValues] = useState<Tags>(initial);
  const [saving, setSaving] = useState(false);

  const invalid = (code: AffiliateCountry) => {
    const tag = normalizeTag(values[code]);
    return tag !== "" && !isValidTag(tag);
  };
  const hasInvalid = AFFILIATE_COUNTRIES.some(invalid);
  const dirty = AFFILIATE_COUNTRIES.some((code) => normalizeTag(values[code]) !== saved[code]);

  async function save() {
    setSaving(true);
    try {
      const result = await saveAffiliateTags(values);
      if (!result.ok) {
        notify.error(result.error);
        return;
      }
      const clean = Object.fromEntries(AFFILIATE_COUNTRIES.map((c) => [c, normalizeTag(values[c])])) as Tags;
      setSaved(clean);
      setValues(clean);
      notify.success("Affiliate tags saved");
    } catch {
      notify.error("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      id="tags-title"
      title="Affiliate tags"
      description="Added to outgoing links when the URL has no tag. Indonesia uses the US tag. Clear a field to remove its tag."
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        {AFFILIATE_COUNTRIES.map((code) => {
          const info = getCountry(code);
          const bad = invalid(code);
          return (
            <div key={code} className="grid gap-1.5 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-4">
              <label htmlFor={`tag-${code}`} className="flex items-center gap-2 text-body-md font-medium text-on-surface">
                <Flag code={code} />
                {info.name}
              </label>
              <div>
                <input
                  id={`tag-${code}`}
                  className={inputClass}
                  value={values[code]}
                  maxLength={70}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="No tag"
                  aria-invalid={bad}
                  aria-describedby={bad ? `tag-${code}-error` : undefined}
                  onChange={(e) => setValues((v) => ({ ...v, [code]: e.target.value }))}
                />
                {bad && (
                  <p id={`tag-${code}-error`} className="mt-1 text-label-sm text-red-600">
                    Letters, numbers, hyphens and underscores only.
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div>
          <button type="submit" disabled={saving || !dirty || hasInvalid} className={`${buttonClass("primary")} disabled:opacity-50`}>
            Save tags
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}
