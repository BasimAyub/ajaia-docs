"use client";

import type { DocumentShare, User } from "@prisma/client";
import { Share2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { shareDocument } from "@/app/actions";
import { seededUsers } from "@/lib/users";
import { Button } from "./button";

type SharePanelProps = {
  documentId: string;
  ownerId: string;
  canShare: boolean;
  shares: Array<Pick<DocumentShare, "userId" | "role"> & { user: Pick<User, "name" | "email" | "color"> }>;
};

export function SharePanel({ documentId, ownerId, canShare, shares }: SharePanelProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const shareableUsers = useMemo(() => seededUsers.filter((user) => user.id !== ownerId), [ownerId]);

  return (
    <aside className="border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Sharing</h2>
          <p className="mt-0.5 text-xs text-zinc-500">{canShare ? "Owner controls access" : "Owner-only controls"}</p>
        </div>
        <Share2 size={17} className="text-zinc-400" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-2">
        {shares.length === 0 ? (
          <p className="border-l-2 border-zinc-200 pl-3 text-sm leading-6 text-zinc-500">
            This document is private to its owner.
          </p>
        ) : (
          shares.map((share) => (
            <div key={share.userId} className="flex items-center justify-between gap-3 border-b border-zinc-100 py-2 last:border-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{share.user.name}</p>
                <p className="truncate text-xs text-zinc-500">{share.user.email}</p>
              </div>
              <span className="text-xs font-medium text-zinc-600">
                {share.role === "EDITOR" ? "Can edit" : "Can view"}
              </span>
            </div>
          ))
        )}
      </div>

      {canShare ? (
        <form
          className="mt-4 space-y-3 border-t border-zinc-200 pt-4"
          action={(formData) => {
            setMessage(null);
            startTransition(async () => {
              const result = await shareDocument(formData);
              setMessage(result.ok ? "Sharing updated." : result.message);
            });
          }}
        >
          <input type="hidden" name="documentId" value={documentId} />
          <label className="block text-sm font-semibold text-ink" htmlFor="share-user">
            Add or update access
          </label>
          <select
            id="share-user"
            name="userId"
            className="min-h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            {shareableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <select
            name="role"
            aria-label="Access level"
            className="min-h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            <option value="EDITOR">Can edit</option>
            <option value="VIEWER">Can view</option>
          </select>
          <Button type="submit" disabled={pending} className="w-full">
            <Share2 size={16} aria-hidden="true" />
            {pending ? "Updating" : "Share document"}
          </Button>
          {message ? <p className="text-sm font-medium text-moss">{message}</p> : null}
        </form>
      ) : null}
    </aside>
  );
}
