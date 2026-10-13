export function safeNextPath(value: string | null, fallback = "/profile") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) {
    return fallback;
  }
  const url = new URL(value, "https://local.invalid");
  if (url.origin !== "https://local.invalid" || url.pathname.startsWith("/auth/callback") || url.pathname === "/login")
    return fallback;
  return url.pathname + url.search + url.hash;
}

export function loginPath(next = "/profile", authError?: string) {
  const query = new URLSearchParams({ next: safeNextPath(next) });
  if (authError) query.set("authError", authError);
  return `/login?${query}`;
}
export function classReturnPath(id: string, date: string) {
  return `/classes?${new URLSearchParams({ day: date, class: id })}#class-${id}-${date}`;
}
