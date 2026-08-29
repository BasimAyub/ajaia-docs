import type { Document, User } from "@prisma/client";
import Link from "next/link";
import { FileText } from "lucide-react";

type DocumentCardProps = {
  document: Pick<Document, "id" | "title" | "plainText" | "updatedAt"> & {
    owner: Pick<User, "name" | "color">;
  };
  label: string;
};

export function DocumentCard({ document, label }: DocumentCardProps) {
  return (
    <Link
      href={`/documents/${document.id}`}
      className="group grid grid-cols-[auto_1fr] gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-moss/35 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2"
    >
      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-md bg-sage text-moss">
        <FileText aria-hidden="true" size={20} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold text-ink group-hover:text-moss">
          {document.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-sm leading-6 text-ink/64">
          {document.plainText || "Blank document ready for a first draft."}
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink/55">
          <span>{label}</span>
          <span aria-hidden="true">/</span>
          <span>Edited {formatRelative(document.updatedAt)}</span>
          <span aria-hidden="true">/</span>
          <span className="inline-flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: document.owner.color }}
              aria-hidden="true"
            />
            {document.owner.name}
          </span>
        </span>
      </span>
    </Link>
  );
}

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
