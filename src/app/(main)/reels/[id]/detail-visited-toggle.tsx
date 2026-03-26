"use client";

import { useState } from "react";
import { toggleVisited } from "@/lib/actions";

export function DetailVisitedToggle({
  reelId,
  initialVisited,
}: {
  reelId: string;
  initialVisited: boolean;
}) {
  const [visited, setVisited] = useState(initialVisited);

  async function handleToggle() {
    setVisited((prev) => !prev);
    await toggleVisited(reelId);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="absolute top-3 left-3 text-2xl z-10"
      aria-label={visited ? "방문 완료 해제" : "방문 완료 표시"}
      style={{ textShadow: "0 0 4px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.6)" }}
    >
      {visited ? <span style={{ color: "#7eff50" }}>★</span> : <span className="text-white/70">☆</span>}
    </button>
  );
}
