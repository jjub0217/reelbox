"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryOption } from "@/types";
import { updateCategory, deleteCategory } from "@/lib/actions";

export function CategoryFilter({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category") || "";
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  function handleClick(categoryId: string) {
    if (editMode) return;
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  }

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditName(name);
    setError("");
  }

  async function handleUpdate() {
    if (!editingId) return;
    const result = await updateCategory(editingId, editName);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 카테고리를 삭제하시겠습니까?\n이 카테고리의 릴스는 미분류로 변경됩니다.`)) return;
    await deleteCategory(id);
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategoryId === id) {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
    router.refresh();
  }

  const chips = [
    { id: "", name: "전체" },
    { id: "uncategorized", name: "미분류" },
    ...categories,
  ];

  return (
    <div className="px-6 pb-4 space-y-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center">
        {chips.map((chip) => (
          <div key={chip.id} className="shrink-0 flex items-center gap-1">
            <button
              onClick={() => handleClick(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                activeCategoryId === chip.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 border border-gray-600"
              }`}
            >
              {chip.name}
            </button>
            {editMode && chip.id && chip.id !== "uncategorized" && (
              <div className="flex gap-0.5">
                <button
                  onClick={() => startEdit(chip.id, chip.name)}
                  className="text-gray-400 hover:text-blue-400 text-xs px-1"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(chip.id, chip.name)}
                  className="text-gray-400 hover:text-red-400 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => { setEditMode(!editMode); setEditingId(null); setError(""); }}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
            editMode
              ? "bg-purple-600/20 text-purple-400 border-purple-500"
              : "bg-gray-800 text-gray-500 border-gray-700"
          }`}
        >
          {editMode ? "완료" : "편집"}
        </button>
      </div>

      {editingId && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            autoFocus
          />
          <button
            onClick={handleUpdate}
            className="bg-purple-600 px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            저장
          </button>
          <button
            onClick={() => { setEditingId(null); setError(""); }}
            className="text-gray-400 text-xs"
          >
            취소
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
