'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Flag } from '@/components/ui/Flag';
import { createCategoryAction, discardUploadsAction, saveProductAction } from '@/app/admin/products/actions';
import { validateProduct, type CategoryOption, type FieldErrors, type LinkValue, type ProductInput } from '@/lib/admin/product-schema';
import { STORE_CODES, type CountryCode } from '@/lib/admin/stores';
import { Confirm, useNotify } from './adapters';
import { Field, describedBy } from './Field';
import { Icon } from './Icon';
import { GalleryUploader, ImageUploader } from './ImageUploader';
import { InputGroup } from './InputGroup';
import { LinkRow } from './LinkRow';
import { Spinner } from './Spinner';
import { Switch } from './Switch';
import { ui } from './styles';

const NEW_CATEGORY = '__new__';
const ID_HINT = 'Leave empty to use the US link.';
const SLUG_HINT = 'Changing the slug changes the product link. Old links stop working.';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initial: ProductInput;
  categories: CategoryOption[];
}

export function ProductForm({ mode, initial, categories: initialCategories }: ProductFormProps) {
  const router = useRouter();
  const notify = useNotify();

  const [values, setValues] = useState<ProductInput>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [mainBusy, setMainBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const [categories, setCategories] = useState(initialCategories);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categoryBusy, setCategoryBusy] = useState(false);

  const initialJson = useRef(JSON.stringify(initial));
  const sessionUploads = useRef(new Set<string>()); // files uploaded in this visit and not saved yet

  const dirty = JSON.stringify(values) !== initialJson.current;
  const hasStoreLink = STORE_CODES.some((code) => values.links[code].url.trim() !== '');
  const uploading = mainBusy || galleryBusy;

  useEffect(() => {
    if (!dirty || saving) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);

  const clearErrors = (...keys: string[]) =>
    setErrors((current) => {
      if (!keys.some((key) => key in current)) return current;
      const next = { ...current };
      for (const key of keys) delete next[key];
      return next;
    });

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    clearErrors(key as string);
  }

  function setLink(code: CountryCode, patch: Partial<LinkValue>) {
    setValues((current) => ({ ...current, links: { ...current.links, [code]: { ...current.links[code], ...patch } } }));
    clearErrors(`links.${code}.url`, `links.${code}.price`, 'links');
  }

  const discard = useCallback(
    (urls: string[]) => {
      const mine = urls.filter((url) => sessionUploads.current.delete(url));
      if (mine.length > 0) void discardUploadsAction(initial.id, mine);
    },
    [initial.id],
  );

  const leave = () => {
    discard([...sessionUploads.current]);
    router.push('/admin/products');
  };

  async function addCategory() {
    if (categoryBusy) return;
    setCategoryBusy(true);
    setCategoryError('');
    try {
      const result = await createCategoryAction(newCategory);
      if (!result.ok) return setCategoryError(result.message);
      setCategories((list) => (list.some((c) => c.id === result.category.id) ? list : [...list, result.category]));
      set('categoryId', result.category.id);
      setAddingCategory(false);
      setNewCategory('');
    } catch {
      setCategoryError('Could not create the category. Try again.');
    } finally {
      setCategoryBusy(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving || uploading) return;

    const showErrors = (fieldErrors: FieldErrors) => {
      setErrors(fieldErrors);
      // DOM order = visual order, so the first invalid control is the first problem
      setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
    };

    const { errors: clientErrors } = validateProduct(values);
    if (Object.keys(clientErrors).length > 0) return showErrors(clientErrors);

    setSaving(true);
    try {
      const result = await saveProductAction(values); // the server validates everything again
      if (!result.ok) {
        notify.error(result.message);
        showErrors(result.fieldErrors ?? {});
        setSaving(false);
        return;
      }
      notify.success(result.slugChanged ? `Saved. The URL was set to /products/${result.slug} because the first one was taken.` : 'Product saved.');
      router.push('/admin/products');
    } catch {
      notify.error('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  const imageId = 'image';
  const galleryId = 'gallery';

  return (
    <>
      <form onSubmit={onSubmit} noValidate className={`${ui.card} mx-auto max-w-[640px] p-5 sm:p-8`}>
        <div className="space-y-6">
          {/* 1. name + category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Product name" error={errors.name}>
              <input
                id="name"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                maxLength={120}
                autoComplete="off"
                aria-invalid={!!errors.name || undefined}
                aria-describedby={describedBy('name', errors.name)}
                className={ui.input}
              />
            </Field>
            <Field id="category" label="Category" error={errors.categoryId}>
              <div className="relative">
                <select
                  id="category"
                  value={addingCategory ? NEW_CATEGORY : values.categoryId}
                  onChange={(e) => {
                    if (e.target.value === NEW_CATEGORY) return setAddingCategory(true);
                    setAddingCategory(false);
                    set('categoryId', e.target.value);
                  }}
                  aria-invalid={!!errors.categoryId || undefined}
                  aria-describedby={describedBy('category', errors.categoryId)}
                  className={`${ui.input} appearance-none pr-9`}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY}>+ New category</option>
                </select>
                <Icon name="expand_more" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              </div>
            </Field>
          </div>

          {addingCategory && (
            <div className="-mt-2">
              <div className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void addCategory();
                    }
                  }}
                  placeholder="New category name"
                  aria-label="New category name"
                  aria-invalid={!!categoryError || undefined}
                  maxLength={60}
                  autoFocus
                  className={ui.input}
                />
                <button type="button" onClick={() => void addCategory()} disabled={categoryBusy} className={`${ui.btn} ${ui.btnPrimary}`}>
                  {categoryBusy ? <Spinner /> : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingCategory(false);
                    setCategoryError('');
                  }}
                  className={`${ui.btn} ${ui.btnGhost}`}
                >
                  Cancel
                </button>
              </div>
              {categoryError && (
                <p role="alert" className={`mt-1.5 ${ui.error}`}>
                  {categoryError}
                </p>
              )}
            </div>
          )}

          {/* 2. images */}
          <Field id={imageId} label="Product image">
            <ImageUploader
              id={imageId}
              productId={values.id}
              productName={values.name}
              value={values.imageUrl}
              error={errors.imageUrl}
              onChange={(url) => set('imageUrl', url)}
              onUploaded={(url) => sessionUploads.current.add(url)}
              onRemove={(url) => {
                discard([url]);
                set('imageUrl', '');
              }}
              onBusyChange={setMainBusy}
            />
          </Field>

          {mode === 'edit' && (
            <Field id={galleryId} label="Extra images" optional hint="Up to 4 more images.">
              <GalleryUploader
                id={galleryId}
                productId={values.id}
                productName={values.name}
                value={values.galleryUrls}
                error={errors.galleryUrls}
                onChange={(urls) => set('galleryUrls', urls)}
                onUploaded={(url) => sessionUploads.current.add(url)}
                onRemove={(url) => {
                  discard([url]);
                  set('galleryUrls', values.galleryUrls.filter((u) => u !== url));
                }}
                onBusyChange={setGalleryBusy}
              />
            </Field>
          )}

          {/* 3. description */}
          <Field id="description" label="Short description" optional error={errors.description}>
            <textarea
              id="description"
              rows={4}
              maxLength={400}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              aria-invalid={!!errors.description || undefined}
              aria-describedby={describedBy('description', errors.description)}
              className={ui.textarea}
            />
            <p className="mt-1 text-right text-body-sm text-on-surface-variant">{values.description.length}/400</p>
          </Field>

          {/* 4. Amazon links */}
          <fieldset className="space-y-3">
            <legend className="mb-1 text-body-sm font-semibold text-primary">Amazon links</legend>
            <p className={ui.muted}>Leave a store empty to skip it. At least one link is required.</p>
            {STORE_CODES.map((code) => (
              <LinkRow
                key={code}
                code={code}
                value={values.links[code]}
                urlError={errors[`links.${code}.url`]}
                priceError={errors[`links.${code}.price`]}
                onChange={(patch) => setLink(code, patch)}
              />
            ))}
            {errors.links && (
              <p role="alert" className={ui.error}>
                {errors.links}
              </p>
            )}
          </fieldset>

          {/* 5. Indonesia fallback */}
          <Field
            id="link-ID"
            label="Indonesia fallback link"
            optional
            error={errors['links.ID.url']}
            hint={ID_HINT}
          >
            <div className="flex items-center gap-2">
              <Flag code="ID" />
              <input
                id="link-ID"
                type="url"
                inputMode="url"
                value={values.links.ID.url}
                onChange={(e) => setLink('ID', { url: e.target.value })}
                placeholder="https://amazon.com/dp/... (defaults to US store)"
                autoComplete="off"
                aria-invalid={!!errors['links.ID.url'] || undefined}
                aria-describedby={describedBy('link-ID', errors['links.ID.url'], ID_HINT)}
                className={ui.input}
              />
            </div>
          </Field>

          {/* 6. edit only: slug + switches */}
          {mode === 'edit' && (
            <>
              <Field
                id="slug"
                label="Slug"
                error={errors.slug}
                hint={SLUG_HINT}
              >
                <InputGroup prefix="/products/" invalid={!!errors.slug}>
                  <input
                    id="slug"
                    value={values.slug}
                    onChange={(e) => set('slug', e.target.value.toLowerCase())}
                    autoComplete="off"
                    aria-invalid={!!errors.slug || undefined}
                    aria-describedby={describedBy('slug', errors.slug, SLUG_HINT)}
                    className={ui.inputInner}
                  />
                </InputGroup>
              </Field>

              <div className="space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-body-md font-semibold text-primary">Published</span>
                    <span className={ui.muted}>Drafts are hidden from the public site.</span>
                  </span>
                  <Switch checked={values.isPublished} onChange={(v) => set('isPublished', v)} />
                </label>
                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-body-md font-semibold text-primary">Featured on home</span>
                    <span className={ui.muted}>Shown as the large card in the home hero.</span>
                  </span>
                  <Switch checked={values.isFeatured} onChange={(v) => set('isFeatured', v)} />
                </label>
              </div>
            </>
          )}
        </div>

        {/* sticky action bar */}
        <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-8 flex flex-wrap items-center justify-end gap-3 rounded-b-[16px] border-t border-[#E2E8F0] bg-white/90 px-5 py-4 backdrop-blur sm:-mx-8 sm:-mb-8 sm:px-8">
          {!hasStoreLink && <p className={`${ui.muted} mr-auto`}>Add at least one Amazon link to save.</p>}
          <button type="button" onClick={() => (dirty ? setConfirmCancel(true) : leave())} className={`${ui.btn} ${ui.btnGhost}`}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading || !hasStoreLink}
            aria-busy={saving}
            className={`${ui.btn} ${ui.btnPrimary} min-w-[104px]`}
          >
            {saving ? (
              <>
                <Spinner /> Saving
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </form>

      <Confirm
        open={confirmCancel}
        title="Discard changes?"
        message="You have unsaved changes. Leave without saving?"
        confirmLabel="Discard changes"
        destructive
        onConfirm={() => {
          setConfirmCancel(false);
          leave();
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  );
}
