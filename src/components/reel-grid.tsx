"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ReelCard } from "./reel-card";
import { getReels } from "@/lib/actions";
import { ReelWithRelations } from "@/types";

export function ReelGrid({
  initialReels,
  initialCursor,
  search,
  categoryId,
}: {
  initialReels: ReelWithRelations[];
  initialCursor: string | null;
  search?: string;
  categoryId?: string;
}) {
  const [reels, setReels] = useState(initialReels);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReels(initialReels);
    setCursor(initialCursor);
  }, [initialReels, initialCursor]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    const result = await getReels({ search, categoryId, cursor });
    setReels((prev) => [...prev, ...result.items]);
    setCursor(result.nextCursor);
    setLoading(false);
  }, [cursor, loading, search, categoryId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  if (reels.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-gray-500 text-sm">
        저장된 릴스가 없습니다
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      <div className="grid grid-cols-2 gap-3.5">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
      {cursor && (
        <div ref={observerRef} className="py-4 text-center">
          {loading && <span className="text-gray-500 text-sm">로딩 중...</span>}
        </div>
      )}
    </div>
  );
}
