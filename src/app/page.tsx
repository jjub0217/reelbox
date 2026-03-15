import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilter } from "@/components/category-filter";
import { ReelGrid } from "@/components/reel-grid";
import { getReels, getCategories } from "@/lib/actions";

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
    getReels({ search, categoryId }),
    getCategories(),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-purple-100">ReelBox</h1>
        <Link href="/reels/new" className="bg-purple-600 px-4 py-2 rounded-lg text-sm">
          + 릴스 추가
        </Link>
      </div>
      <SearchBar />
      <div className="flex items-center gap-2 px-6 pb-1">
        <CategoryFilter categories={categories} />
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
