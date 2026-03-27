"use client";

import { useRouter } from "next/navigation";
import { readListReturnState } from "@/lib/list-navigation";

export function BackToListButton({
  fallbackHref = "/",
  backHref,
}: {
  fallbackHref?: string;
  backHref?: string;
}) {
  const router = useRouter();

  function handleClick() {
    const state = readListReturnState();
    router.push(backHref || state?.url || fallbackHref, { scroll: false });
  }

  return (
    <button type="button" onClick={handleClick} className="text-gray-400" aria-label="뒤로가기">
      ←
    </button>
  );
}
