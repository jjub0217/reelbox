import Link from "next/link";
import nextDynamic from "next/dynamic";
import { Suspense } from "react";
import { getReels } from "@/lib/actions";
import { ReelGrid } from "@/components/reel-grid";

const SearchBar = nextDynamic(() => import("@/components/search-bar").then((m) => m.SearchBar));
const ArchiveTabs = nextDynamic(() => import("@/components/archive-tabs").then((m) => m.ArchiveTabs));

export const dynamic = "force-dynamic";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "reviewed" ? "reviewed" : "visited";
  const search = params.search;

  const { items, nextCursor } = await getReels({
    search,
    status: tab,
    take: 10,
  });

  return (
    <div>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <Link href="/" className="text-gray-400" aria-label="뒤로가기">←</Link>
        <h1 className="text-lg font-bold text-purple-100">기록 보기</h1>
      </div>

      <div className="px-6 pt-5 pb-3">
        <Suspense>
          <ArchiveTabs activeTab={tab} />
        </Suspense>
      </div>

      <Suspense>
        <SearchBar />
      </Suspense>

      <ReelGrid
        initialReels={items}
        initialCursor={nextCursor}
        search={search}
        status={tab}
      />
    </div>
  );
}
