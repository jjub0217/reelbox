"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TagInput } from "./tag-input";
import { CategorySelect } from "./category-select";
import { createReel, updateReel } from "@/lib/actions";
import { CategoryOption, ReelWithRelations } from "@/types";
import { normalizeInstagramUrl } from "@/lib/reel-url";
import { ReelThumbnail } from "./reel-thumbnail";

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
  const [categoryIds, setCategoryIds] = useState<string[]>(reel?.categories.map(({ category }) => category.id) || []);
  const [tags, setTags] = useState<string[]>(reel?.tags.map(({ tag }) => tag.name) || []);
  const [memo, setMemo] = useState(reel?.memo || "");
  const [review, setReview] = useState(reel?.review || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<"home" | "continue">("home");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(reel?.thumbnail || null);
  const [previewAttempted, setPreviewAttempted] = useState(Boolean(reel?.thumbnail));

  useEffect(() => {
    const normalizedUrl = normalizeInstagramUrl(url);
    if (!normalizedUrl) {
      setThumbnailPreview(reel?.thumbnail || null);
      setPreviewAttempted(Boolean(reel?.thumbnail));
      return;
    }

    setPreviewAttempted(false);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/og?url=${encodeURIComponent(normalizedUrl)}`);
        const data = await res.json();
        setThumbnailPreview(data.thumbnail || null);
        setPreviewAttempted(true);
      } catch {
        setThumbnailPreview(null);
        setPreviewAttempted(true);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [url, reel?.thumbnail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError("릴스 URL을 입력해주세요");
      return;
    }

    const normalizedUrl = normalizeInstagramUrl(url);
    if (!normalizedUrl) {
      setError("올바른 인스타그램 릴스 URL을 입력해주세요");
      return;
    }
    setSubmitting(true);
    setError("");

    const formData = {
      url: normalizedUrl,
      memo: memo.trim() || undefined,
      review: review.trim() || undefined,
      categoryIds,
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
      return;
    }

    if (submitMode === "continue") {
      setUrl("");
      setCategoryIds([]);
      setTags([]);
      setMemo("");
      setReview("");
      setThumbnailPreview(null);
      setSubmitting(false);
      setSubmitMode("home");
      return;
    }

    router.push("/");
  }

  function handleContinueClick() {
    setSubmitMode("continue");
  }

  function handleDefaultClick() {
    setSubmitMode("home");
  }

  const submitLabel = submitting
    ? "저장 중..."
    : isEdit
      ? "수정하기"
      : "저장 후 홈으로";

  const continueLabel = submitting ? "저장 중..." : "저장하고 계속 추가";

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
        <p className="mt-2 text-xs text-gray-500">
          인스타그램 게시물 화면에서 주소를 복사한 링크만 저장할 수 있습니다.
        </p>
      </div>

      {(thumbnailPreview || previewAttempted) && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="aspect-square w-full max-h-80">
            <ReelThumbnail
              src={thumbnailPreview}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              fallbackLabel="썸네일을 불러오지 못했지만 저장은 가능합니다."
            />
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">카테고리</label>
        <CategorySelect categories={categories} value={categoryIds} onChange={setCategoryIds} />
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

      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">후기</label>
        <textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="방문/구매 후기를 입력하세요..."
          rows={3}
          className="w-full scroll-mt-24 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
        />
        <p className="mt-2 text-xs text-gray-500">
          후기를 입력하면 방문 완료 상태로 자동 반영됩니다.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {isEdit ? (
        <button
          type="submit"
          disabled={submitting}
          onClick={handleDefaultClick}
          className="w-full bg-purple-600 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {submitLabel}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="submit"
            disabled={submitting}
            onClick={handleDefaultClick}
            className="bg-purple-600 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            {submitLabel}
          </button>
          <button
            type="submit"
            disabled={submitting}
            onClick={handleContinueClick}
            className="bg-gray-800 border border-gray-600 py-3.5 rounded-xl text-sm font-semibold text-gray-100 disabled:opacity-50"
          >
            {continueLabel}
          </button>
        </div>
      )}
    </form>
  );
}
