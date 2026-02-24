import type { Role } from "@prisma/client";

export type AppRole = Role;

export function isAdmin(role?: AppRole | null) {
  return role === "ADMIN";
}

export function isLibrarian(role?: AppRole | null) {
  return role === "LIBRARIAN";
}

export function canManageBooks(role?: AppRole | null) {
  return isAdmin(role) || isLibrarian(role);
}

