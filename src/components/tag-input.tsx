"use client";

import { useState } from "react";

export function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed.toLowerCase())) {
      onChange([...value, trimmed.toLowerCase()]);
    }
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 flex gap-1.5 flex-wrap items-center">
      {value.map((tag, i) => (
        <span key={i} className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1">
          {tag}
          <button type="button" onClick={() => removeTag(i)} className="text-green-400/60 hover:text-green-400">✕</button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        enterKeyHint="done"
        placeholder={value.length === 0 ? "태그 입력 후 완료..." : ""}
        className="bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none flex-1 min-w-[80px]"
      />
    </div>
  );
}
