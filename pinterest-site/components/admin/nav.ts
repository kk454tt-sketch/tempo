export type AdminNavItem = { href: string; label: string; icon: string };

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/products", label: "Products", icon: "inventory_2" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { href: "/admin/pin-links", label: "Pin links", icon: "link" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
