"use client";

import { useState } from "react";
import { CategoryOption } from "@/types";
import { createCategory } from "@/lib/actions";

export function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: CategoryOption[];
  value: string[];
  onChange: (categoryIds: string[]) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [localCategories, setLocalCategories] = useState<CategoryOption[]>(categories);

  function toggleCategory(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    const result = await createCategory(newName);
    if (result.success && result.category) {
      setLocalCategories((prev) => [...prev, result.category!]);
      onChange([...value, result.category!.id]);
      setNewName("");
      setIsCreating(false);
    }
  }

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap">
        {localCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggleCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              value.includes(cat.id)
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300 border border-gray-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-dashed border-gray-600"
        >
          + 추가
        </button>
      </div>
      {isCreating && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="새 카테고리명"
            className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); handleCreate(); } }}
          />
          <button type="button" onClick={handleCreate} className="bg-purple-600 px-3 py-2 rounded-xl text-sm">추가</button>
          <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 px-2 text-sm">취소</button>
        </div>
      )}
    </div>
  );
}
