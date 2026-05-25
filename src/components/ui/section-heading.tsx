import Link from "next/link";
import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  /** For `aria-labelledby` on parent sections */
  headingId?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  linkText,
  linkHref,
  align = "left",
  className,
  titleClassName,
  headingId,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-2",
        centered && "mb-10 text-center",
        !centered && "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn(centered && "mx-auto max-w-2xl")}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={headingId}
          className={cn(
            "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
            eyebrow && "mt-2",
            titleClassName
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-2 max-w-lg text-sm text-muted",
              centered && "mx-auto"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {linkText && linkHref && !centered ? (
        <Link
          href={linkHref}
          className="shrink-0 text-sm font-medium underline-offset-4 hover:underline"
        >
          {linkText}
        </Link>
      ) : null}
      {linkText && linkHref && centered ? (
        <Link
          href={linkHref}
          className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline"
        >
          {linkText}
        </Link>
      ) : null}
    </div>
  );
}
