"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { createDocument } from "@/app/actions";
import { Button } from "./button";

export function CreateDocumentForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
      action={(formData) => {
        setMessage(null);
        startTransition(async () => {
          const result = await createDocument(formData);
          if (result && !result.ok) {
            setMessage(result.message);
          }
        });
      }}
    >
      <div className="flex-1">
        <label className="sr-only" htmlFor="title">
          Document title
        </label>
        <input
          id="title"
          name="title"
          placeholder="Name a new document"
          className="min-h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-zinc-400 focus:border-moss focus:ring-2 focus:ring-moss/20 sm:w-56"
        />
        {message ? <p className="mt-2 text-sm font-medium text-clay">{message}</p> : null}
      </div>
      <Button type="submit" disabled={pending}>
        <Plus size={16} aria-hidden="true" />
        {pending ? "Creating" : "New document"}
      </Button>
    </form>
  );
}
