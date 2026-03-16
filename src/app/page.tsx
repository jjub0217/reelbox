import Link from "next/link";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { ReelGrid } from "@/components/reel-grid";
import { LogoutButton } from "@/components/logout-button";
import { getReels, getCategories } from "@/lib/actions";

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

  const [{ items, nextCursor }, categories] = await Promise.all([
    getReels({ search, categoryId, take: 10 }),
    getCategories(),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <Link href="/"><img src="/logo.png" alt="ReelBox" className="h-8 w-8" /></Link>
        <div className="flex items-center gap-3">
          <LogoutButton />
          <Link href="/reels/new" className="bg-purple-600 px-4 py-2 rounded-lg text-sm">
            + 릴스 추가
          </Link>
        </div>
      </div>
      <Suspense>
        <SearchBar />
      </Suspense>
      <div className="flex items-center gap-2 px-6 pb-1">
        <Suspense>
          <CategoryFilter categories={categories} />
        </Suspense>
        <Link
          href="/categories"
          className="shrink-0 text-gray-500 hover:text-purple-400 text-xs pb-4"
        >
          관리
        </Link>
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
