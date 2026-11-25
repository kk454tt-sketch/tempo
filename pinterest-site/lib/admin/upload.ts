import { MAX_UPLOAD_BYTES } from "./storage";

const MAX_SIDE = 1600;
const WEBP_QUALITY = 0.85;

export type UploadKind = "main" | "gallery";

export interface UploadResult {
  url: string;
  thumbUrl: string;
  path: string;
}

/** Resize large images client-side in canvas to WebP (max 1600px) before posting to the server route. */
async function compressInBrowser(file: File): Promise<File> {
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(bitmap, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
      );
      if (!blob) return file;
      if (blob.size > file.size && file.size <= MAX_UPLOAD_BYTES) return file;
      const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
      return new File([blob], `${baseName}.webp`, { type: "image/webp" });
    } finally {
      bitmap.close();
    }
  } catch {
    return file;
  }
}

export async function uploadProductImage(
  productId: string,
  file: File,
  kind: UploadKind,
  onProgress: (percent: number) => void,
): Promise<UploadResult> {
  const prepared = await compressInBrowser(file);
  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is still over 4MB after compression. Choose a smaller image.");
  }

  const formData = new FormData();
  formData.append("file", prepared);
  formData.append("productId", productId);
  formData.append("kind", kind);

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as Partial<UploadResult> & { error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && body.url && body.thumbUrl && body.path) {
          resolve({ url: body.url, thumbUrl: body.thumbUrl, path: body.path });
          return;
        }
        reject(new Error(body.error || "Upload failed. Try again."));
      } catch {
        reject(new Error("Upload failed. Try again."));
      }
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    xhr.send(formData);
  });
}
