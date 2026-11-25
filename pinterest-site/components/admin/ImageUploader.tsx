'use client';

import { useEffect, useRef, useState } from 'react';
import { IMAGE_TYPES, MAX_GALLERY, MAX_PICKER_BYTES, validateImageFile } from '@/lib/admin/storage';
import { uploadProductImage, type UploadKind } from '@/lib/admin/upload';
import { Icon } from './Icon';
import { SafeImage } from './SafeImage';
import { ui } from './styles';

interface Pending {
  key: string;
  name: string;
  progress: number;
}

function useImageUpload(productId: string, kind: UploadKind, onBusyChange: (busy: boolean) => void) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    onBusyChange(pending.length > 0);
  }, [pending.length, onBusyChange]);

  async function upload(files: File[], onDone: (url: string) => void) {
    setError('');
    for (const file of files) {
      const problem = validateImageFile(file, MAX_PICKER_BYTES);
      if (problem) {
        setError(`${file.name}: ${problem}`);
        continue;
      }
      const key = crypto.randomUUID();
      setPending((list) => [...list, { key, name: file.name, progress: 0 }]);
      try {
        const result = await uploadProductImage(productId, file, kind, (progress) =>
          setPending((list) => list.map((item) => (item.key === key ? { ...item, progress } : item))),
        );
        onDone(result.url);
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : 'Upload failed.'}`);
      } finally {
        setPending((list) => list.filter((item) => item.key !== key));
      }
    }
  }

  return { pending, error, upload };
}

function Progress({ name, progress }: { name: string; progress: number }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
      <p className="w-full truncate text-body-sm text-on-surface">{name}</p>
      <div
        role="progressbar"
        aria-label={`Uploading ${name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]"
      >
        <div className="h-full bg-[#F59E0B] transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      <p className={ui.muted}>{progress}%</p>
    </div>
  );
}

interface DropzoneProps {
  id: string;
  multiple?: boolean;
  compact?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onFiles: (files: File[]) => void;
}

function Dropzone({ id, multiple, compact, invalid, describedBy, onFiles }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[16px] border-2 border-dashed text-center transition-colors focus-within:ring-2 focus-within:ring-[#F59E0B]/50 ${
        compact ? 'aspect-square px-2' : 'px-4 py-8'
      } ${dragging ? 'border-[#F59E0B] bg-[#F59E0B]/10' : invalid ? 'border-[#DC2626]' : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#F59E0B]'}`}
    >
      <input
        id={id}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        multiple={multiple}
        className="sr-only"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = ''; // lets the same file be picked again
        }}
      />
      <Icon name={compact ? 'add_photo_alternate' : 'cloud_upload'} className={compact ? 'text-[28px] text-primary' : 'text-[40px] text-primary'} />
      {compact ? (
        <span className="text-body-sm font-semibold text-primary">Add image</span>
      ) : (
        <>
          <span className="text-body-md text-on-surface">
            Drop image here or <span className="font-semibold underline">browse to upload</span>
          </span>
          <span className={ui.muted}>PNG, JPG or WEBP up to 10MB</span>
        </>
      )}
    </label>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow ${ui.focusRing}`}
    >
      <Icon name="close" className="text-[18px]" />
    </button>
  );
}

interface UploaderProps {
  id: string;
  productId: string;
  productName: string;
  error?: string;
  onUploaded: (url: string) => void;
  onRemove: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}

/** Main image: dropzone, then progress, then preview with a remove button. */
export function ImageUploader({
  id,
  productId,
  productName,
  value,
  error,
  onChange,
  onUploaded,
  onRemove,
  onBusyChange,
}: UploaderProps & { value: string; onChange: (url: string) => void }) {
  const { pending, error: uploadError, upload } = useImageUpload(productId, 'main', onBusyChange);
  const message = uploadError || error;
  const errorId = `${id}-error`;

  return (
    <div>
      {value ? (
        <div className="relative aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-[12px] border border-[#E2E8F0]">
          <SafeImage src={value} alt={productName || 'Product image preview'} className="h-full w-full" />
          <RemoveButton label="Remove image" onClick={() => onRemove(value)} />
        </div>
      ) : pending[0] ? (
        <div className="rounded-[16px] border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] py-8">
          <Progress name={pending[0].name} progress={pending[0].progress} />
        </div>
      ) : (
        <Dropzone
          id={id}
          invalid={!!error}
          describedBy={message ? errorId : undefined}
          onFiles={(files) =>
            void upload(files.slice(0, 1), (url) => {
              onChange(url);
              onUploaded(url);
            })
          }
        />
      )}
      {message && (
        <p id={errorId} role="alert" className={`mt-1.5 ${ui.error}`}>
          {message}
        </p>
      )}
    </div>
  );
}

/** Up to 4 extra images with the same uploader. */
export function GalleryUploader({
  id,
  productId,
  productName,
  value,
  error,
  onChange,
  onUploaded,
  onRemove,
  onBusyChange,
}: UploaderProps & { value: string[]; onChange: (urls: string[]) => void }) {
  const { pending, error: uploadError, upload } = useImageUpload(productId, 'main', onBusyChange);
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const message = uploadError || error;
  const errorId = `${id}-error`;
  const room = MAX_GALLERY - value.length - pending.length;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((url, index) => (
          <li key={url} className="relative aspect-square overflow-hidden rounded-[12px] border border-[#E2E8F0]">
            <SafeImage src={url} alt={`${productName || 'Product'} extra image ${index + 1}`} className="h-full w-full" />
            <RemoveButton label={`Remove extra image ${index + 1}`} onClick={() => onRemove(url)} />
          </li>
        ))}
        {pending.map((item) => (
          <li key={item.key} className="aspect-square rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC]">
            <Progress name={item.name} progress={item.progress} />
          </li>
        ))}
        {room > 0 && (
          <li>
            <Dropzone
              id={id}
              compact
              multiple
              invalid={!!error}
              describedBy={message ? errorId : undefined}
              onFiles={(files) =>
                void upload(files.slice(0, room), (url) => {
                  latest.current = [...latest.current, url];
                  onChange(latest.current);
                  onUploaded(url);
                })
              }
            />
          </li>
        )}
      </ul>
      {message && (
        <p id={errorId} role="alert" className={`mt-1.5 ${ui.error}`}>
          {message}
        </p>
      )}
    </div>
  );
}
