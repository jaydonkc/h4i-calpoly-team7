export function safeNextPath(value: string | null, fallback = "/profile") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) {
    return fallback;
  }
  const url = new URL(value, "https://local.invalid");
  if (url.origin !== "https://local.invalid" || url.pathname.startsWith("/auth/callback")) return fallback;
  return url.pathname + url.search + url.hash;
}
