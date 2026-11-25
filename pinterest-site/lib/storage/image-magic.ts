export type DetectedImageMime = "image/png" | "image/jpeg" | "image/webp";

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Detect PNG, JPEG or WEBP purely from magic bytes (never trust filename or Content-Type). */
export function detectImageMime(bytes: Uint8Array): DetectedImageMime | null {
  if (bytes.length >= 8 && PNG_SIG.every((b, i) => bytes[i] === b)) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    return "image/webp";
  }
  return null;
}

export function thumbPathFor(path: string): string | null {
  if (!/\.webp$/i.test(path) || /-sm\.webp$/i.test(path)) return null;
  return path.replace(/\.webp$/i, "-sm.webp");
}

export function withThumbPaths(paths: readonly string[]): string[] {
  const out = new Set<string>();
  for (const p of paths) {
    if (!p) continue;
    out.add(p);
    const thumb = thumbPathFor(p);
    if (thumb) out.add(thumb);
  }
  return [...out];
}
