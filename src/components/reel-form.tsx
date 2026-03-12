"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TagInput } from "./tag-input";
import { CategorySelect } from "./category-select";
import { createReel, updateReel } from "@/lib/actions";
import { CategoryOption, ReelWithRelations } from "@/types";

export function ReelForm({
  categories,
  reel,
}: {
  categories: CategoryOption[];
  reel?: ReelWithRelations;
}) {
  const router = useRouter();
  const isEdit = !!reel;

  const [url, setUrl] = useState(reel?.url || "");
  const [categoryId, setCategoryId] = useState(reel?.categoryId || "");
  const [tags, setTags] = useState<string[]>(reel?.tags.map(({ tag }) => tag.name) || []);
  const [memo, setMemo] = useState(reel?.memo || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(reel?.thumbnail || null);

  useEffect(() => {
    if (!url.trim() || !url.includes("instagram.com")) {
      setThumbnailPreview(reel?.thumbnail || null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/og?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.thumbnail) setThumbnailPreview(data.thumbnail);
      } catch {
        // ignore
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [url]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError("릴스 URL을 입력해주세요");
      return;
    }
    setSubmitting(true);
    setError("");

    const formData = {
      url: url.trim(),
      memo: memo.trim() || undefined,
      categoryId: categoryId || undefined,
      tagNames: tags,
    };

    const result = isEdit
      ? await updateReel(reel!.id, formData)
      : await createReel(formData);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (isEdit) {
      router.push(`/reels/${reel!.id}`);
    } else {
      router.push("/");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">릴스 URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {thumbnailPreview && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl h-[80px] overflow-hidden">
          <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">카테고리</label>
        <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
      </div>

      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">태그</label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">메모</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="자유롭게 메모를 입력하세요..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-purple-600 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? "저장 중..." : isEdit ? "수정하기" : "저장하기"}
      </button>
    </form>
  );
}
