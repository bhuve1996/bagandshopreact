export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute left-4 top-4 z-100 -translate-y-20 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
    >
      Skip to main content
    </a>
  );
}
