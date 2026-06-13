export function proxiedImg(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return url;
  try {
    const host = new URL(url).hostname;
    if (!/(cdninstagram\.com|fbcdn\.net|instagram\.com)$/i.test(host)) return url;
  } catch {
    return url;
  }
  return `/api/public/img?u=${encodeURIComponent(url)}`;
}