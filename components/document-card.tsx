import type { Document, User } from "@prisma/client";
import Link from "next/link";
import { FileText } from "lucide-react";

type DocumentCardProps = {
  document: Pick<Document, "id" | "title" | "plainText" | "updatedAt"> & {
    owner: Pick<User, "name">;
  };
  label: string;
};

export function DocumentCard({ document, label }: DocumentCardProps) {
  return (
    <Link
      href={`/documents/${document.id}`}
      className="group grid grid-cols-[auto_1fr] gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-moss"
    >
      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 group-hover:text-moss">
        <FileText aria-hidden="true" size={17} />
      </span>
      <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold text-ink group-hover:text-moss">
          {document.title}
        </span>
          <span className="mt-0.5 block truncate text-sm leading-5 text-zinc-500">
          {document.plainText || "Blank document ready for a first draft."}
        </span>
          <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <span>{document.owner.name}</span>
            <span aria-hidden="true">{"\u00B7"}</span>
            <span className="font-medium text-zinc-600">{label}</span>
            <span className="hidden sm:inline" aria-hidden="true">{"\u00B7"}</span>
            <span className="sm:ml-auto">Updated {formatRelative(document.updatedAt)}</span>
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
