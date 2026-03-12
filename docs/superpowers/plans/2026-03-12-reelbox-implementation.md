# ReelBox Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app to save Instagram reel URLs with categories, tags, and memos, and search/filter through them.

**Architecture:** Next.js App Router with Server Actions for backend logic. Prisma ORM connects to PostgreSQL. Mobile-first responsive layout with max-width constraint on desktop.

**Tech Stack:** Next.js 15 (App Router), Prisma, PostgreSQL, TypeScript, Tailwind CSS, Vercel

**Spec:** `docs/superpowers/specs/2026-03-12-reelbox-design.md`

---

## File Structure

```
reelbox/
├── prisma/
│   └── schema.prisma              # Data model (Reel, Category, Tag, ReelTag)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (mobile-first, max-width wrapper)
│   │   ├── page.tsx               # Main screen (search + filter + reel grid)
│   │   ├── globals.css            # Global styles + Tailwind
│   │   ├── reels/
│   │   │   ├── new/
│   │   │   │   └── page.tsx       # Add reel screen
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Reel detail screen
│   │   │       ├── detail-actions.tsx  # Client-side delete/edit actions
│   │   │       └── edit/
│   │   │           └── page.tsx   # Edit reel screen (reuses form)
│   │   └── api/
│   │       └── og/
│   │           └── route.ts       # OG metadata extraction API route
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── actions.ts             # Server Actions (CRUD for reels, categories, tags)
│   │   └── og.ts                  # OG metadata extraction utility
│   ├── components/
│   │   ├── reel-card.tsx          # Reel card for grid display
│   │   ├── reel-form.tsx          # Shared form for add/edit reel
│   │   ├── reel-grid.tsx          # Infinite scroll grid of reel cards
│   │   ├── search-bar.tsx         # Search input component
│   │   ├── category-filter.tsx    # Category chip filter list
│   │   ├── tag-input.tsx          # Tag input with chips
│   │   ├── category-select.tsx    # Category dropdown with inline create
│   │   └── delete-dialog.tsx      # Delete confirmation dialog
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton
│   │   └── actions.ts             # Server Actions (CRUD for reels, categories, tags)
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Chunk 1: Project Setup & Database

### Task 1: Initialize Next.js Project

**Files:**
- Create: `reelbox/` project root (via create-next-app)

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/osejin/Desktop
npx create-next-app@latest reelbox --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

- [ ] **Step 2: Verify project runs**

```bash
cd /Users/osejin/Desktop/reelbox
npm run dev
```

Expected: Dev server starts on localhost:3000

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

### Task 2: Setup Prisma & Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Install Prisma**

```bash
cd /Users/osejin/Desktop/reelbox
npm install prisma @prisma/client
npx prisma init
```

- [ ] **Step 2: Write schema**

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Reel {
  id         String    @id @default(cuid())
  url        String    @unique
  thumbnail  String?
  memo       String?
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
  tags       ReelTag[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Category {
  id    String @id @default(cuid())
  name  String @unique
  reels Reel[]
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  reels ReelTag[]
}

model ReelTag {
  reelId String
  tagId  String
  reel   Reel @relation(fields: [reelId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([reelId, tagId])
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Set up local database and run migration**

Ensure PostgreSQL is running locally. Set `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://osejin:@localhost:5432/reelbox?schema=public"
```

```bash
createdb reelbox
npx prisma migrate dev --name init
```

Expected: Migration applied, Prisma client generated.

- [ ] **Step 5: Verify with Prisma Studio**

```bash
npx prisma studio
```

Expected: Opens browser, shows empty Reel, Category, Tag, ReelTag tables.

- [ ] **Step 6: Commit**

```bash
git add prisma/ src/lib/db.ts .env.example
git commit -m "feat: add Prisma schema with Reel, Category, Tag, ReelTag models"
```

Note: Create `.env.example` with placeholder `DATABASE_URL`. Never commit `.env`.

### Task 3: Create Shared Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Define types**

Create `src/types/index.ts`:

```typescript
export type ReelWithRelations = {
  id: string;
  url: string;
  thumbnail: string | null;
  memo: string | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  tags: { tag: { id: string; name: string } }[];
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryOption = {
  id: string;
  name: string;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/types/
git commit -m "feat: add shared TypeScript types"
```

---

## Chunk 2: Server Actions (CRUD)

### Task 4: Reel CRUD Server Actions

**Files:**
- Create: `src/lib/actions.ts`

- [ ] **Step 1: Create server actions file**

Create `src/lib/actions.ts`:

```typescript
"use server";

import { prisma } from "./db";
import { extractThumbnail } from "./og";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// ---- Reel Actions ----

export async function createReel(formData: {
  url: string;
  memo?: string;
  categoryId?: string;
  tagNames: string[];
}) {
  const { url, memo, categoryId, tagNames } = formData;

  // Check duplicate URL
  const existing = await prisma.reel.findUnique({ where: { url } });
  if (existing) {
    return { error: "이미 저장된 릴스입니다" };
  }

  // Fetch thumbnail directly (no self-fetch)
  const thumbnail = await extractThumbnail(url);

  // Upsert tags (normalize to lowercase)
  const tags = await Promise.all(
    tagNames.map(async (name) => {
      const normalized = name.trim().toLowerCase();
      return prisma.tag.upsert({
        where: { name: normalized },
        update: {},
        create: { name: normalized },
      });
    })
  );

  const reel = await prisma.reel.create({
    data: {
      url,
      thumbnail,
      memo: memo || null,
      categoryId: categoryId || null,
      tags: {
        create: tags.map((tag) => ({ tagId: tag.id })),
      },
    },
  });

  revalidatePath("/");
  return { success: true, id: reel.id };
}

export async function updateReel(
  id: string,
  formData: {
    url: string;
    memo?: string;
    categoryId?: string;
    tagNames: string[];
  }
) {
  const { url, memo, categoryId, tagNames } = formData;

  // Check duplicate URL (exclude current reel)
  const existing = await prisma.reel.findFirst({
    where: { url, NOT: { id } },
  });
  if (existing) {
    return { error: "이미 저장된 릴스입니다" };
  }

  // Upsert tags
  const tags = await Promise.all(
    tagNames.map(async (name) => {
      const normalized = name.trim().toLowerCase();
      return prisma.tag.upsert({
        where: { name: normalized },
        update: {},
        create: { name: normalized },
      });
    })
  );

  // Atomic update: delete old tags + update reel in transaction
  await prisma.$transaction([
    prisma.reelTag.deleteMany({ where: { reelId: id } }),
    prisma.reel.update({
      where: { id },
      data: {
        url,
        memo: memo || null,
        categoryId: categoryId || null,
        tags: {
          create: tags.map((tag) => ({ tagId: tag.id })),
        },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath(`/reels/${id}`);
  return { success: true };
}

export async function deleteReel(id: string) {
  await prisma.reel.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}

export async function getReels({
  search,
  categoryId,
  cursor,
  take = 20,
}: {
  search?: string;
  categoryId?: string | "uncategorized";
  cursor?: string;
  take?: number;
}) {
  const where: Prisma.ReelWhereInput = {};

  // Category filter
  if (categoryId === "uncategorized") {
    where.categoryId = null;
  } else if (categoryId) {
    where.categoryId = categoryId;
  }

  // Search filter (LIKE on memo, tag name, category name)
  if (search) {
    where.OR = [
      { memo: { contains: search, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } } },
      { category: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const reels = await prisma.reel.findMany({
    where,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
    take: take + 1, // Fetch one extra to detect "has more"
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = reels.length > take;
  const items = hasMore ? reels.slice(0, take) : reels;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

export async function getReel(id: string) {
  return prisma.reel.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

// ---- Category Actions ----

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "카테고리명을 입력해주세요" };

  const existing = await prisma.category.findUnique({ where: { name: trimmed } });
  if (existing) return { error: "이미 존재하는 카테고리입니다" };

  const category = await prisma.category.create({ data: { name: trimmed } });
  return { success: true, category };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions.ts
git commit -m "feat: add server actions for reel and category CRUD"
```

### Task 5: OG Metadata Extraction Utility & API Route

**Files:**
- Create: `src/lib/og.ts`
- Create: `src/app/api/og/route.ts`

- [ ] **Step 1: Create shared OG utility**

Create `src/lib/og.ts`:

```typescript
export async function extractThumbnail(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      signal: AbortSignal.timeout(5000),
    });

    const html = await response.text();

    // Try property before content
    const match1 = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    );
    if (match1) return match1[1];

    // Try content before property
    const match2 = html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    );
    return match2?.[1] || null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Create API route (for client-side thumbnail preview)**

Create `src/app/api/og/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { extractThumbnail } from "@/lib/og";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const thumbnail = await extractThumbnail(url);
  return NextResponse.json({ thumbnail });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/og.ts src/app/api/og/route.ts
git commit -m "feat: add OG metadata extraction utility and API route"
```

---

## Chunk 3: UI Components

### Task 6: Root Layout (Mobile-First Wrapper)

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update root layout**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelBox",
  description: "인스타그램 릴스 스마트 저장 & 검색",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <div className="mx-auto max-w-[420px] min-h-screen bg-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Clean up globals.css**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Verify layout renders**

```bash
npm run dev
```

Visit localhost:3000. Expected: Dark background, centered container on desktop.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: mobile-first root layout with max-width constraint"
```

### Task 7: Reel Card Component

**Files:**
- Create: `src/components/reel-card.tsx`

- [ ] **Step 1: Create component**

Create `src/components/reel-card.tsx`:

```typescript
import Link from "next/link";
import { ReelWithRelations } from "@/types";

export function ReelCard({ reel }: { reel: ReelWithRelations }) {
  return (
    <Link href={`/reels/${reel.id}`}>
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
        {/* Thumbnail */}
        <div className="bg-gray-700 h-[120px] flex items-center justify-center">
          {reel.thumbnail ? (
            <img
              src={reel.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-2xl">🎬</span>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Tags */}
          <div className="flex gap-1 flex-wrap mb-2">
            {reel.category && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px]">
                {reel.category.name}
              </span>
            )}
            {reel.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px]"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Memo preview */}
          {reel.memo && (
            <p className="text-[11px] text-gray-400 truncate">{reel.memo}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reel-card.tsx
git commit -m "feat: add ReelCard component"
```

### Task 8: Search Bar Component

**Files:**
- Create: `src/components/search-bar.tsx`

- [ ] **Step 1: Create component**

Create `src/components/search-bar.tsx`:

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      router.push(`/?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="px-6 pt-5 pb-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 검색 (태그, 메모, 카테고리...)"
        className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/search-bar.tsx
git commit -m "feat: add SearchBar component with debounced search"
```

### Task 9: Category Filter Component

**Files:**
- Create: `src/components/category-filter.tsx`

- [ ] **Step 1: Create component**

Create `src/components/category-filter.tsx`:

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CategoryOption } from "@/types";

export function CategoryFilter({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category") || "";

  function handleClick(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  }

  const chips = [
    { id: "", name: "전체" },
    { id: "uncategorized", name: "미분류" },
    ...categories,
  ];

  return (
    <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => handleClick(chip.id)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-colors ${
            activeCategoryId === chip.id
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 border border-gray-600"
          }`}
        >
          {chip.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/category-filter.tsx
git commit -m "feat: add CategoryFilter chip component"
```

### Task 10: Reel Grid with Infinite Scroll

**Files:**
- Create: `src/components/reel-grid.tsx`

- [ ] **Step 1: Create component**

Create `src/components/reel-grid.tsx`:

```typescript
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

  // Reset when filters change
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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

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

      {/* Infinite scroll trigger */}
      {cursor && (
        <div ref={observerRef} className="py-4 text-center">
          {loading && (
            <span className="text-gray-500 text-sm">로딩 중...</span>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reel-grid.tsx
git commit -m "feat: add ReelGrid with infinite scroll"
```

### Task 11: Tag Input Component

**Files:**
- Create: `src/components/tag-input.tsx`

- [ ] **Step 1: Create component**

Create `src/components/tag-input.tsx`:

```typescript
"use client";

import { useState } from "react";

export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed && !value.includes(trimmed.toLowerCase())) {
        onChange([...value, trimmed.toLowerCase()]);
      }
      setInput("");
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 flex gap-1.5 flex-wrap items-center">
      {value.map((tag, i) => (
        <span
          key={i}
          className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="text-green-400/60 hover:text-green-400"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? "태그 입력 후 엔터..." : ""}
        className="bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none flex-1 min-w-[80px]"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tag-input.tsx
git commit -m "feat: add TagInput component"
```

### Task 12: Category Select Component

**Files:**
- Create: `src/components/category-select.tsx`

- [ ] **Step 1: Create component**

Create `src/components/category-select.tsx`:

```typescript
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
  const [localCategories, setLocalCategories] =
    useState<CategoryOption[]>(categories);

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
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <button
            type="button"
            onClick={handleCreate}
            className="bg-purple-600 px-3 py-2 rounded-xl text-sm"
          >
            추가
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="text-gray-400 px-2 text-sm"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/category-select.tsx
git commit -m "feat: add CategorySelect with inline create"
```

### Task 13: Delete Confirmation Dialog

**Files:**
- Create: `src/components/delete-dialog.tsx`

- [ ] **Step 1: Create component**

Create `src/components/delete-dialog.tsx`:

```typescript
"use client";

export function DeleteDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-[320px]">
        <h3 className="text-base font-semibold mb-2">릴스 삭제</h3>
        <p className="text-sm text-gray-400 mb-6">
          이 릴스를 삭제하시겠습니까?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 py-2.5 rounded-xl text-sm"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 py-2.5 rounded-xl text-sm"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/delete-dialog.tsx
git commit -m "feat: add DeleteDialog component"
```

### Task 14: Reel Form (Shared Add/Edit)

**Files:**
- Create: `src/components/reel-form.tsx`

- [ ] **Step 1: Create component**

Create `src/components/reel-form.tsx`:

```typescript
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
  const [tags, setTags] = useState<string[]>(
    reel?.tags.map(({ tag }) => tag.name) || []
  );
  const [memo, setMemo] = useState(reel?.memo || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    reel?.thumbnail || null
  );

  // Thumbnail preview on URL input
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
      {/* URL */}
      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">
          릴스 URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Thumbnail Preview */}
      {thumbnailPreview && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl h-[80px] overflow-hidden">
          <img
            src={thumbnailPreview}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Category */}
      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">
          카테고리
        </label>
        <CategorySelect
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">
          태그
        </label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      {/* Memo */}
      <div>
        <label className="text-xs text-gray-400 font-semibold mb-2 block">
          메모
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="자유롭게 메모를 입력하세요..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Submit */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reel-form.tsx
git commit -m "feat: add shared ReelForm component for add/edit"
```

---

## Chunk 4: Pages

### Task 15: Main Page (홈)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create main page**

Replace `src/app/page.tsx`:

```typescript
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilter } from "@/components/category-filter";
import { ReelGrid } from "@/components/reel-grid";
import { getReels, getCategories } from "@/lib/actions";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const categoryId = params.category;

  const [{ items, nextCursor }, categories] = await Promise.all([
    getReels({ search, categoryId }),
    getCategories(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-purple-100">ReelBox</h1>
        <Link
          href="/reels/new"
          className="bg-purple-600 px-4 py-2 rounded-lg text-sm"
        >
          + 릴스 추가
        </Link>
      </div>

      <SearchBar />
      <CategoryFilter categories={categories} />
      <ReelGrid
        initialReels={items}
        initialCursor={nextCursor}
        search={search}
        categoryId={categoryId}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Visit localhost:3000. Expected: Header with "ReelBox" + search + category filters + empty grid message.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add main page with search, filter, and reel grid"
```

### Task 16: Add Reel Page

**Files:**
- Create: `src/app/reels/new/page.tsx`

- [ ] **Step 1: Create page**

Create `src/app/reels/new/page.tsx`:

```typescript
import Link from "next/link";
import { ReelForm } from "@/components/reel-form";
import { getCategories } from "@/lib/actions";

export default async function NewReelPage() {
  const categories = await getCategories();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <Link href="/" className="text-gray-400">
          ← 뒤로
        </Link>
        <h1 className="text-lg font-bold text-purple-100">릴스 추가</h1>
      </div>

      <ReelForm categories={categories} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/reels/new/page.tsx
git commit -m "feat: add new reel page"
```

### Task 17: Reel Detail Page

**Files:**
- Create: `src/app/reels/[id]/page.tsx`
- Create: `src/app/reels/[id]/detail-actions.tsx`

- [ ] **Step 1: Create page**

Create `src/app/reels/[id]/page.tsx`:

```typescript
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReel } from "@/lib/actions";
import { ReelDetailActions } from "./detail-actions";

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reel = await getReel(id);

  if (!reel) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <Link href="/" className="text-gray-400">
          ← 뒤로
        </Link>
        <ReelDetailActions reelId={reel.id} />
      </div>

      <div className="p-6">
        {/* Thumbnail */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl h-[200px] flex items-center justify-center mb-5 overflow-hidden">
          {reel.thumbnail ? (
            <img
              src={reel.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-3xl">🎬</span>
          )}
        </div>

        {/* Instagram link */}
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-pink-600 py-3 rounded-xl text-center text-sm font-semibold mb-6"
        >
          인스타그램에서 보기 ↗
        </a>

        {/* Category */}
        {reel.category && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">
              카테고리
            </p>
            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-xl text-sm">
              {reel.category.name}
            </span>
          </div>
        )}

        {/* Tags */}
        {reel.tags.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">
              태그
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {reel.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="bg-green-500/20 text-green-400 px-3 py-1 rounded-xl text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Memo */}
        {reel.memo && (
          <div className="mb-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">
              메모
            </p>
            <div className="bg-gray-800 rounded-xl px-4 py-3.5 text-sm text-gray-300 leading-relaxed">
              {reel.memo}
            </div>
          </div>
        )}

        {/* Created date */}
        <p className="text-xs text-gray-600 text-right">
          저장일: {reel.createdAt.toLocaleDateString("ko-KR")}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create detail actions client component**

Create `src/app/reels/[id]/detail-actions.tsx`:

```typescript
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
        <Link
          href={`/reels/${reelId}/edit`}
          className="text-purple-400 text-sm"
        >
          수정
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          className="text-red-400 text-sm"
        >
          삭제
        </button>
      </div>

      <DeleteDialog
        open={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/reels/\[id\]/
git commit -m "feat: add reel detail page with delete confirmation"
```

### Task 18: Edit Reel Page

**Files:**
- Create: `src/app/reels/[id]/edit/page.tsx`

- [ ] **Step 1: Create page**

Create `src/app/reels/[id]/edit/page.tsx`:

```typescript
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReel, getCategories } from "@/lib/actions";
import { ReelForm } from "@/components/reel-form";

export default async function EditReelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reel, categories] = await Promise.all([
    getReel(id),
    getCategories(),
  ]);

  if (!reel) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <Link href={`/reels/${id}`} className="text-gray-400">
          ← 뒤로
        </Link>
        <h1 className="text-lg font-bold text-purple-100">릴스 수정</h1>
      </div>

      <ReelForm categories={categories} reel={reel} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/reels/\[id\]/edit/
git commit -m "feat: add edit reel page"
```

---

## Chunk 5: Final Polish & Verification

### Task 19: Scrollbar Hide Utility

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add scrollbar hide utility**

Append to `src/app/globals.css`:

```css
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add scrollbar-hide utility for category chips"
```

### Task 20: End-to-End Verification

- [ ] **Step 1: Start dev server and verify all screens**

```bash
cd /Users/osejin/Desktop/reelbox
npm run dev
```

Verify:
1. Main page loads with empty state message
2. "릴스 추가" navigates to add form
3. Can create a category inline
4. Can add tags
5. Save a reel — redirects to home, card appears
6. Card click → detail page
7. "인스타그램에서 보기" opens URL
8. Edit button → edit form with pre-populated values
9. Delete button → confirmation dialog → deletes
10. Search filters by tag/memo/category
11. Category chips filter correctly
12. "미분류" chip shows uncategorized reels

- [ ] **Step 2: Run build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: verify all features working"
```
