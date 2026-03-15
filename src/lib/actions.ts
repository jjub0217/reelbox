"use server";

import { prisma } from "./db";
import { extractThumbnail } from "./og";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createReel(formData: {
  url: string;
  memo?: string;
  review?: string;
  categoryIds: string[];
  tagNames: string[];
}) {
  const { url, memo, review, categoryIds, tagNames } = formData;

  const existing = await prisma.reel.findUnique({ where: { url } });
  if (existing) {
    return { error: "이미 저장된 릴스입니다" };
  }

  const thumbnail = await extractThumbnail(url);

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
      review: review || null,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
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
    review?: string;
    categoryIds: string[];
    tagNames: string[];
  }
) {
  const { url, memo, review, categoryIds, tagNames } = formData;

  const existing = await prisma.reel.findFirst({
    where: { url, NOT: { id } },
  });
  if (existing) {
    return { error: "이미 저장된 릴스입니다" };
  }

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

  await prisma.$transaction([
    prisma.reelCategory.deleteMany({ where: { reelId: id } }),
    prisma.reelTag.deleteMany({ where: { reelId: id } }),
    prisma.reel.update({
      where: { id },
      data: {
        url,
        memo: memo || null,
        review: review || null,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
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

export async function toggleVisited(id: string) {
  const reel = await prisma.reel.findUnique({ where: { id }, select: { visited: true } });
  if (!reel) return { error: "릴스를 찾을 수 없습니다" };

  await prisma.reel.update({ where: { id }, data: { visited: !reel.visited } });
  revalidatePath("/");
  revalidatePath(`/reels/${id}`);
  return { success: true, visited: !reel.visited };
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

  if (categoryId === "uncategorized") {
    where.categories = { none: {} };
  } else if (categoryId) {
    where.categories = { some: { categoryId } };
  }

  if (search) {
    const keywords = search.trim().split(/\s+/).filter(Boolean);
    where.AND = keywords.map((keyword) => ({
      OR: [
        { memo: { contains: keyword, mode: "insensitive" as const } },
        { tags: { some: { tag: { name: { contains: keyword, mode: "insensitive" as const } } } } },
        { categories: { some: { category: { name: { contains: keyword, mode: "insensitive" as const } } } } },
      ],
    }));
  }

  const reels = await prisma.reel.findMany({
    where,
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
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
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
}

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

export async function updateCategory(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "카테고리명을 입력해주세요" };

  const existing = await prisma.category.findFirst({
    where: { name: trimmed, NOT: { id } },
  });
  if (existing) return { error: "이미 존재하는 카테고리입니다" };

  await prisma.category.update({ where: { id }, data: { name: trimmed } });
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}
