"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteReel } from "@/lib/actions";
import { DeleteDialog } from "@/components/delete-dialog";

export function ReelDetailActions({ reelId }: { reelId: string }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  async function handleDelete() {
    await deleteReel(reelId);
    router.push("/");
  }

  return (
    <>
      <div className="flex gap-3">
        <Link href={`/reels/${reelId}/edit`} className="text-purple-400 text-sm">수정</Link>
        <button onClick={() => setShowDelete(true)} className="text-red-400 text-sm">삭제</button>
      </div>
      <DeleteDialog open={showDelete} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </>
  );
}
