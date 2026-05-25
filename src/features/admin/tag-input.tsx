"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  placeholder?: string;
};

function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function TagInput({
  value,
  onChange,
  className,
  placeholder = "Type a tag and press Enter",
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTags(...incoming: string[]) {
    const next = [...value];
    for (const raw of incoming) {
      const tag = normalizeTag(raw);
      if (!tag) continue;
      const exists = next.some((t) => t.toLowerCase() === tag.toLowerCase());
      if (!exists) next.push(tag);
    }
    onChange(next);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function commitDraft() {
    if (!draft.trim()) return;
    addTags(...draft.split(","));
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-border px-2 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs dark:bg-stone-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-32 flex-1 border-0 bg-transparent px-1 text-sm outline-none focus:ring-0"
        />
      </div>
      <p className="text-xs text-muted">
        Press Enter or comma to add. Example: bluetooth speaker, portable audio
      </p>
    </div>
  );
}
