import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { ReelGrid } from "@/components/reel-grid";
import { getReels, getCategories, getUserStats, getUserEmail } from "@/lib/actions";

const SearchBar = nextDynamic(() => import("@/components/search-bar").then((m) => m.SearchBar));
const CategoryFilter = nextDynamic(() => import("@/components/category-filter").then((m) => m.CategoryFilter));

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const categoryId = params.category;

  const [{ items, nextCursor }, categories, stats, email] = await Promise.all([
    getReels({ search, categoryId, take: 10 }),
    getCategories(),
    getUserStats(),
    getUserEmail(),
  ]);

  return (
    <div>
      <Header email={email} totalReels={stats.totalReels} visitedReels={stats.visitedReels} />
      <Suspense>
        <SearchBar />
      </Suspense>
      <div className="px-6 pb-1">
        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>
      <ReelGrid
        initialReels={items}
        initialCursor={nextCursor}
        search={search}
        categoryId={categoryId}
      />
    </div>
  );
}
