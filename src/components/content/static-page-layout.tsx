import type { ReactNode } from "react";

type StaticPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export function StaticPageLayout({ title, children }: StaticPageLayoutProps) {
  return (
    <div className="section-padding">
      <div className="container-page max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          {children}
        </div>
      </div>
    </div>
  );
}
