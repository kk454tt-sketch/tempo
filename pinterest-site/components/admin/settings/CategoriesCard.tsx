"use client";

import { useState } from "react";
import {
  addCategory,
  deleteCategory,
  moveCategory,
  renameCategory,
  type ActionResult,
} from "@/app/admin/settings/actions";
import { ConfirmDialog, useNotify } from "@/components/admin/settings/bridge";
import { IconButton } from "@/components/admin/settings/IconButton";
import { SettingsCard } from "@/components/admin/settings/SettingsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClass } from "@/components/ui/button-styles";
import { inputClass } from "@/components/ui/field-styles";
import { slugify } from "@/lib/slug";

export type CategoryRow = { id: string; name: string; slug: string; productCount: number };

const plural = (n: number) => `${n} product${n === 1 ? "" : "s"}`;

export function CategoriesCard({ categories }: { categories: CategoryRow[] }) {
  const notify = useNotify();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null);
  const locked = busy !== null;

  async function run(key: string, task: () => Promise<ActionResult>, success: string): Promise<boolean> {
    setBusy(key);
    try {
      const result = await task();
      if (result.ok) {
        notify.success(success);
        return true;
      }
      notify.error(result.error);
      return false;
    } catch {
      notify.error("Something went wrong. Try again.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function confirmDelete() {
    const category = toDelete;
    setToDelete(null);
    if (category) await run(`delete:${category.id}`, () => deleteCategory(category.id), "Category deleted");
  }

  return (
    <SettingsCard
      id="categories-title"
      title="Categories"
      description="Shown in this order on the site. Deleting a category keeps its products; they become uncategorized."
    >
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-start"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await run("add", () => addCategory(name), "Category added")) setName("");
        }}
      >
        <div className="flex-1">
          <label htmlFor="new-category" className="sr-only">
            New category name
          </label>
          <input
            id="new-category"
            className={inputClass}
            value={name}
            maxLength={60}
            placeholder="New category name"
            onChange={(e) => setName(e.target.value)}
            aria-describedby="new-category-slug"
          />
          <p id="new-category-slug" className="mt-1 min-h-4 text-label-sm text-on-surface-variant">
            {name.trim() ? `Slug: ${slugify(name, "category")}` : ""}
          </p>
        </div>
        <button type="submit" disabled={locked || !name.trim()} className={`${buttonClass("primary")} disabled:opacity-50`}>
          Add category
        </button>
      </form>

      {categories.length === 0 ? (
        <EmptyState icon="category" title="No categories yet" />
      ) : (
        <ol className="mt-3 flex flex-col divide-y divide-slate-100 rounded-[12px] border border-slate-200">
          {categories.map((category, index) => {
            const editing = editingId === category.id;
            return (
              <li key={category.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <form
                      className="flex items-center gap-1"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (await run(`rename:${category.id}`, () => renameCategory(category.id, draft), "Category renamed")) {
                          setEditingId(null);
                        }
                      }}
                    >
                      <label htmlFor={`rename-${category.id}`} className="sr-only">
                        Category name
                      </label>
                      <input
                        id={`rename-${category.id}`}
                        className={inputClass}
                        value={draft}
                        maxLength={60}
                        autoFocus
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingId(null);
                          }
                        }}
                      />
                      <IconButton type="submit" label="Save name" icon="check" disabled={locked || !draft.trim()} />
                      <IconButton label="Cancel rename" icon="close" onClick={() => setEditingId(null)} />
                    </form>
                  ) : (
                    <>
                      <p className="truncate text-body-md font-semibold text-on-surface">{category.name}</p>
                      <p className="truncate text-label-sm text-on-surface-variant">
                        <span>{category.slug}</span>
                        <span className="ml-3 rounded-full bg-surface-container px-2 py-0.5">{plural(category.productCount)}</span>
                      </p>
                    </>
                  )}
                </div>
                {!editing && (
                  <div className="flex shrink-0 items-center">
                    <IconButton
                      label={`Move ${category.name} up`}
                      icon="arrow_upward"
                      disabled={locked || index === 0}
                      onClick={() => run(`move:${category.id}`, () => moveCategory(category.id, "up"), "Category moved")}
                    />
                    <IconButton
                      label={`Move ${category.name} down`}
                      icon="arrow_downward"
                      disabled={locked || index === categories.length - 1}
                      onClick={() => run(`move:${category.id}`, () => moveCategory(category.id, "down"), "Category moved")}
                    />
                    <IconButton
                      label={`Rename ${category.name}`}
                      icon="edit"
                      disabled={locked}
                      onClick={() => {
                        setDraft(category.name);
                        setEditingId(category.id);
                      }}
                    />
                    <IconButton
                      label={`Delete ${category.name}`}
                      icon="delete"
                      disabled={locked}
                      onClick={() => setToDelete(category)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete ? `Delete “${toDelete.name}”?` : ""}
        description={
          toDelete && toDelete.productCount > 0
            ? `${plural(toDelete.productCount)} in this category will become uncategorized. This cannot be undone.`
            : "This cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </SettingsCard>
  );
}
