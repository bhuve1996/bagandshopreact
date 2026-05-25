import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section-padding">
      <div className="container-page max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-4 text-muted">
          The page you are looking for does not exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900"
          >
            Home
          </Link>
          <Link
            href="/collections"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Shop collections
          </Link>
        </div>
      </div>
    </div>
  );
}
