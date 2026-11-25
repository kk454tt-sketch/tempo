export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN = "/admin/login";

const ADMIN_PATH = /^\/admin(?:[/?#]|$)/;
const LOGIN_PATH = /^\/admin\/login(?:[/?#]|$)/;

/** Only same-site /admin paths are allowed as a post-login target (blocks open redirects). */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !ADMIN_PATH.test(value) || LOGIN_PATH.test(value)) return ADMIN_HOME;
  return value;
}

export function loginUrlFor(pathWithSearch: string): string {
  return `${ADMIN_LOGIN}?next=${encodeURIComponent(pathWithSearch)}`;
}
