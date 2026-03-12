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
  value: string;
  onChange: (categoryId: string) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [localCategories, setLocalCategories] = useState<CategoryOption[]>(categories);

  async function handleCreate() {
    if (!newName.trim()) return;
    const result = await createCategory(newName);
    if (result.success && result.category) {
      setLocalCategories((prev) => [...prev, result.category!]);
      onChange(result.category!.id);
      setNewName("");
      setIsCreating(false);
    }
  }

  return (
    <div>
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === "__new__") {
            setIsCreating(true);
          } else {
            onChange(e.target.value);
          }
        }}
        className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
      >
        <option value="">카테고리 선택</option>
        {localCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
        <option value="__new__">+ 새 카테고리 추가</option>
      </select>
      {isCreating && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="새 카테고리명"
            className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreate(); } }}
          />
          <button type="button" onClick={handleCreate} className="bg-purple-600 px-3 py-2 rounded-xl text-sm">추가</button>
          <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 px-2 text-sm">취소</button>
        </div>
      )}
    </div>
  );
}
