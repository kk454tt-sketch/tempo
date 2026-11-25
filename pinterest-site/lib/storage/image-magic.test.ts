import { describe, expect, it } from "vitest";
import { detectImageMime } from "./image-magic";

describe("detectImageMime", () => {
  it("detects PNG magic bytes", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    expect(detectImageMime(png)).toBe("image/png");
  });

  it("detects JPEG magic bytes", () => {
    const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(detectImageMime(jpg)).toBe("image/jpeg");
  });

  it("detects WEBP magic bytes", () => {
    const webp = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50,
    ]);
    expect(detectImageMime(webp)).toBe("image/webp");
  });

  it("rejects text files, empty buffers and unknown formats", () => {
    const text = new TextEncoder().encode("not really a jpg file");
    expect(detectImageMime(text)).toBeNull();
    expect(detectImageMime(new Uint8Array())).toBeNull();
    expect(detectImageMime(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBeNull();
  });
});
