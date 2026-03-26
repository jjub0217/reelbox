"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TAB_OPTIONS = [
  { id: "visited", label: "방문 완료" },
  { id: "reviewed", label: "후기 있음" },
] as const;

export function ArchiveTabs({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleTabChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {TAB_OPTIONS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => handleTabChange(tab.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
            activeTab === tab.id
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 border border-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
