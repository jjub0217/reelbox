"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CategoryOption } from "@/types";

export function CategoryFilter({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category") || "";

  function handleClick(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  }

  const chips = [
    { id: "", name: "전체" },
    { id: "uncategorized", name: "미분류" },
    ...categories,
  ];

  return (
    <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => handleClick(chip.id)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-colors ${
            activeCategoryId === chip.id
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 border border-gray-600"
          }`}
        >
          {chip.name}
        </button>
      ))}
    </div>
  );
}
