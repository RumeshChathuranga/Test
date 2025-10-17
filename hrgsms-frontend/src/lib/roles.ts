import type { UserRole } from "./storage";

export function hasAnyRole(
  userRole: UserRole | null,
  allowed: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}
