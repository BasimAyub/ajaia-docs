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
      className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm sm:flex-row"
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
          className="min-h-10 w-full rounded-md border border-ink/12 px-3 py-2 text-sm outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
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
