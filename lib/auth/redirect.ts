/** Only allow same-site relative paths as post-login destinations. */
export function safeCallbackUrl(url: string | null | undefined, fallback = "/dashboard") {
  if (!url) return fallback;
  if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) {
    return fallback;
  }
  return url;
}
