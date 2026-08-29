"use client";

import { useTransition } from "react";
import { switchUser } from "@/app/actions";
import { seededUsers } from "@/lib/users";

export function UserSwitcher({ currentUserId }: { currentUserId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm shadow-sm">
      <span className="text-ink/60">Demo identity</span>
      <select
        value={currentUserId}
        disabled={pending}
        onChange={(event) => {
          const userId = event.target.value;
          startTransition(() => {
            void switchUser(userId);
          });
        }}
        className="bg-transparent font-semibold text-ink outline-none"
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
