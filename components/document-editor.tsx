"use client";

import type { JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Save,
  Underline,
  Undo2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveDocument } from "@/app/actions";
import { Button } from "./button";

type SaveState = "idle" | "saving" | "saved" | "error" | "readonly";

type DocumentEditorProps = {
  documentId: string;
  initialContent: JSONContent;
  canEdit: boolean;
};

export function DocumentEditor({ documentId, initialContent, canEdit }: DocumentEditorProps) {
  const [saveState, setSaveState] = useState<SaveState>(canEdit ? "saved" : "readonly");
  const [message, setMessage] = useState(canEdit ? "Saved" : "View-only access");
  const [isPending, startTransition] = useTransition();
  const latestContentRef = useRef<JSONContent>(initialContent);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRevisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const activeSaveRevisionRef = useRef<number | null>(null);
  const saveQueuedRef = useRef(false);
  const mountedRef = useRef(true);
  const persistRef = useRef<() => void>(() => undefined);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] }
      }),
      UnderlineExtension,
      Placeholder.configure({
        placeholder: "Write the decision, context, and next steps..."
      })
    ],
    content: initialContent,
    editable: canEdit,
    editorProps: {
      attributes: {
        "aria-label": "Document body",
        class: "prose prose-neutral max-w-none"
      }
    },
    onUpdate: ({ editor: updatedEditor }) => {
      latestContentRef.current = updatedEditor.getJSON();
      if (!canEdit) return;
      latestRevisionRef.current += 1;
      setSaveState("idle");
      setMessage("Unsaved changes");
      scheduleSave();
    }
  });

  const toolbarButtons = useMemo(
    () => [
      {
        label: "Bold",
        icon: Bold,
        active: editor?.isActive("bold"),
        action: () => editor?.chain().focus().toggleBold().run()
      },
      {
        label: "Italic",
        icon: Italic,
        active: editor?.isActive("italic"),
        action: () => editor?.chain().focus().toggleItalic().run()
      },
      {
        label: "Underline",
        icon: Underline,
        active: editor?.isActive("underline"),
        action: () => editor?.chain().focus().toggleUnderline().run()
      },
      {
        label: "Heading 1",
        icon: Heading1,
        active: editor?.isActive("heading", { level: 1 }),
        action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run()
      },
      {
        label: "Heading 2",
        icon: Heading2,
        active: editor?.isActive("heading", { level: 2 }),
        action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run()
      },
      {
        label: "Bulleted list",
        icon: List,
        active: editor?.isActive("bulletList"),
        action: () => editor?.chain().focus().toggleBulletList().run()
      },
      {
        label: "Numbered list",
        icon: ListOrdered,
        active: editor?.isActive("orderedList"),
        action: () => editor?.chain().focus().toggleOrderedList().run()
      }
    ],
    [editor]
  );

  function clearScheduledSave() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }

  function scheduleSave(delay = 850) {
    if (!canEdit) return;
    clearScheduledSave();
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      persistRef.current();
    }, delay);
  }

  function persist() {
    if (!canEdit) return;

    clearScheduledSave();
    if (activeSaveRevisionRef.current !== null) {
      saveQueuedRef.current = latestRevisionRef.current > activeSaveRevisionRef.current;
      return;
    }

    const revision = latestRevisionRef.current;
    if (revision <= savedRevisionRef.current) {
      return;
    }

    const content = latestContentRef.current;
    activeSaveRevisionRef.current = revision;
    setSaveState("saving");
    setMessage("Saving...");

    startTransition(async () => {
      let result;
      try {
        result = await saveDocument({ documentId, content });
      } catch {
        result = { ok: false as const, message: "Save failed. Please try again." };
      }

      activeSaveRevisionRef.current = null;
      const hasNewerChanges = latestRevisionRef.current > revision;
      const shouldSaveAgain = saveQueuedRef.current || hasNewerChanges;
      saveQueuedRef.current = false;

      if (!mountedRef.current) {
        if (result.ok && hasNewerChanges) {
          void saveDocument({ documentId, content: latestContentRef.current });
        }
        return;
      }

      if (!result.ok) {
        if (hasNewerChanges) {
          setSaveState("idle");
          setMessage("Unsaved changes");
          scheduleSave(0);
        } else {
          setSaveState("error");
          setMessage(result.message);
        }
        return;
      }

      savedRevisionRef.current = Math.max(savedRevisionRef.current, revision);
      if (shouldSaveAgain) {
        setSaveState("idle");
        setMessage("Unsaved changes");
        scheduleSave(0);
        return;
      }

      setSaveState("saved");
      const savedAt = new Date(result.data?.updatedAt ?? Date.now()).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      });
      setMessage(`Saved at ${savedAt}`);
    });
  }

  useEffect(() => {
    persistRef.current = persist;
  });

  useEffect(() => {
    mountedRef.current = true;

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (latestRevisionRef.current > savedRevisionRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => {
      mountedRef.current = false;
      clearScheduledSave();
      window.removeEventListener("beforeunload", warnBeforeUnload);

      if (
        canEdit &&
        activeSaveRevisionRef.current === null &&
        latestRevisionRef.current > savedRevisionRef.current
      ) {
        void saveDocument({ documentId, content: latestContentRef.current });
      }
    };
  }, [canEdit, documentId]);

  return (
    <section className="overflow-hidden rounded-md border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/70 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Document formatting">
          {toolbarButtons.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                disabled={!canEdit}
                title={item.label}
                aria-label={item.label}
                aria-pressed={Boolean(item.active)}
                onClick={item.action}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                  item.active ? "border-moss/25 bg-sage text-moss" : "border-transparent hover:bg-zinc-200"
                }`}
              >
                <Icon size={17} aria-hidden="true" />
              </button>
            );
          })}
          <span className="mx-1 h-5 w-px bg-zinc-200" aria-hidden="true" />
          <button
            type="button"
            disabled={!canEdit}
            title="Undo"
            aria-label="Undo"
            onClick={() => editor?.chain().focus().undo().run()}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={!canEdit}
            title="Redo"
            aria-label="Redo"
            onClick={() => editor?.chain().focus().redo().run()}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Redo2 size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <p
            className={`text-xs font-medium ${
              saveState === "error" ? "text-clay" : saveState === "saving" ? "text-cornflower" : "text-moss"
            }`}
            aria-live="polite"
          >
            {message}
          </p>
          {canEdit ? (
            <Button
              type="button"
              onClick={persist}
              disabled={isPending || saveState === "saving"}
              variant="secondary"
              className="min-h-8 px-2.5 text-xs"
            >
              <Save size={16} aria-hidden="true" />
              Save
            </Button>
          ) : null}
        </div>
      </div>
      <EditorContent editor={editor} />
    </section>
  );
}
