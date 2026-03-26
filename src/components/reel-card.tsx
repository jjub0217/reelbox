"use client";

import { useState } from "react";
import Link from "next/link";
import { ReelWithRelations } from "@/types";
import { toggleVisited } from "@/lib/actions";

export function ReelCard({ reel, priority = false }: { reel: ReelWithRelations; priority?: boolean }) {
  const [visited, setVisited] = useState(reel.visited);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setVisited(!visited);
    await toggleVisited(reel.id);
  }

  return (
    <Link href={`/reels/${reel.id}`}>
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="bg-gray-700 h-30 flex items-center justify-center relative">
          {reel.thumbnail ? (
            <img
              src={reel.thumbnail}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "low"}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-gray-500 text-2xl">🎬</span>
          )}
          <button
            onClick={handleToggle}
            className="absolute top-1.5 left-1.5 text-lg z-10"
            style={{ textShadow: "0 0 4px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.6)" }}
          >
            {visited ? <span style={{ color: "#7eff50" }}>★</span> : <span className="text-white/60">☆</span>}
          </button>
        </div>
        <div className="p-3">
          <div className="flex gap-1 flex-wrap">
            {reel.categories.map(({ category }) => (
              <span key={category.id} className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px]">
                {category.name}
              </span>
            ))}
            {reel.tags.map(({ tag }) => (
              <span key={tag.id} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px]">
                {tag.name}
              </span>
            ))}
          </div>
          {reel.memo && (
            <p className="text-[11px] text-gray-400 truncate mt-2">{reel.memo}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
