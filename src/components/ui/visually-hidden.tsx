import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Screen-reader-only text; prefer over duplicating visible labels in aria-label. */
export function VisuallyHidden({
  children,
  as: Component = "span",
  className,
  id,
}: {
  children: ReactNode;
  as?: "span" | "h2" | "p" | "legend";
  className?: string;
  id?: string;
}) {
  return (
    <Component id={id} className={cn("sr-only", className)}>
      {children}
    </Component>
  );
}
