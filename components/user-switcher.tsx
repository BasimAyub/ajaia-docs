"use client";

import { useTransition } from "react";
import { switchUser } from "@/app/actions";
import { seededUsers } from "@/lib/users";

export function UserSwitcher({ currentUserId }: { currentUserId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm">
      <span className="text-xs font-medium text-zinc-500">Demo identity</span>
      <select
        value={currentUserId}
        disabled={pending}
        onChange={(event) => {
          const userId = event.target.value;
          startTransition(() => {
            void switchUser(userId);
          });
        }}
        className="max-w-36 bg-transparent text-sm font-semibold text-ink outline-none sm:max-w-none"
        aria-label="Switch demo identity"
      >
        {seededUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </label>
  );
}
