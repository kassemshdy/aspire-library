"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

type RoleSwitcherProps = {
  currentRole: Role;
};

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter();
  const { update } = useSession();
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (newRole: Role) => {
    if (newRole === currentRole) return;

    setSwitching(true);
    try {
      const res = await fetch("/api/users/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        throw new Error("Failed to switch role");
      }

      toast.success(`Switched to ${newRole} role - Refreshing...`);

      // Update the session to trigger a refresh
      await update();

      // Force a hard refresh to update the session and UI
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Role switch error:", error);
      toast.error("Failed to switch role");
      setSwitching(false);
    }
  };

  const roles: { value: Role; label: string; description: string }[] = [
    { value: "ADMIN", label: "Admin", description: "Full access" },
    { value: "LIBRARIAN", label: "Librarian", description: "Manage books & loans" },
    { value: "MEMBER", label: "Member", description: "Browse & borrow" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">
        Testing as:
      </span>
      <select
        value={currentRole}
        onChange={(e) => handleRoleSwitch(e.target.value as Role)}
        disabled={switching}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        title="Switch role to test different permission levels"
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label} - {role.description}
          </option>
        ))}
      </select>
    </div>
  );
}
