import { Suspense } from "react";
import { SearchResults } from "@/features/search/search-results";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Search",
};

export default function SearchPage() {
  return (
    <div className="section-padding">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
        <Suspense
          fallback={
            <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-4/5" />
              ))}
            </div>
          }
        >
          <div className="mt-12">
            <SearchResults />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
