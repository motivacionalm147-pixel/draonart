/**
 * Generate a UUID that works on HTTP (not just HTTPS).
 * crypto.randomUUID() requires a secure context, so we fall back
 * to a manual implementation when it's not available.
 */
export function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {}

  // Fallback for non-secure contexts (HTTP on mobile)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getAvatarFallback(url: string | null | undefined, seed: string = ''): string {
  if (!url || url === '' || url === 'null') {
    // If no URL, use a high-quality UI-generated avatar from a public service as a fallback
    // This is much better than a black pixel and ensures the UI always looks full.
    const name = seed || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&size=128`;
  }
  return url;
}
