import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';

export const EVENT_LOGOS_SUBDIR = 'event-logos';

/** 2 MB */
export const EVENT_LOGO_MAX_BYTES = 2 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export function extForImageMime(mime: string): string | null {
  return MIME_TO_EXT[mime] ?? null;
}

export function publicEventLogoPath(eventId: string, ext: string): string {
  return `/uploads/${EVENT_LOGOS_SUBDIR}/${eventId}${ext}`;
}

export function absolutePathFromPublicUploads(publicPath: string): string {
  const rel = publicPath.replace(/^\/+/, '');
  return join(process.cwd(), rel);
}

export function safeUnlinkUpload(publicPath: string | null | undefined): void {
  if (!publicPath?.startsWith('/uploads/')) {
    return;
  }
  const abs = absolutePathFromPublicUploads(publicPath);
  if (existsSync(abs)) {
    try {
      unlinkSync(abs);
    } catch {
      /* ignore */
    }
  }
}

export function eventLogosAbsoluteDir(): string {
  return join(process.cwd(), 'uploads', EVENT_LOGOS_SUBDIR);
}
