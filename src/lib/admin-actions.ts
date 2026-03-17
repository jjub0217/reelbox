"use server";

import { prisma } from "./db";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Pool } from "pg";

const ADMIN_EMAIL = "devel.jjub@gmail.com";

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/");
  return user.id;
}

function getPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
}

export async function getDashboardStats() {
  await requireAdmin();

  const pool = getPool();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usersResult, todayUsersResult, totalReels, todayReels] =
      await Promise.all([
        pool.query("SELECT count(*)::int FROM auth.users"),
        pool.query("SELECT count(*)::int FROM auth.users WHERE created_at >= $1", [
          today.toISOString(),
        ]),
        prisma.reel.count(),
        prisma.reel.count({ where: { createdAt: { gte: today } } }),
      ]);

    return {
      totalUsers: usersResult.rows[0].count,
      todayUsers: todayUsersResult.rows[0].count,
      totalReels,
      todayReels,
    };
  } finally {
    await pool.end();
  }
}

export async function getMemberStats() {
  await requireAdmin();

  const pool = getPool();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalResult, todayResult, weekResult, recentResult, withdrawalCount] = await Promise.all([
      pool.query("SELECT count(*)::int FROM auth.users"),
      pool.query("SELECT count(*)::int FROM auth.users WHERE created_at >= $1", [today.toISOString()]),
      pool.query("SELECT count(*)::int FROM auth.users WHERE created_at >= $1", [weekAgo.toISOString()]),
      pool.query("SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10"),
      prisma.withdrawal.count(),
    ]);

    return {
      totalUsers: totalResult.rows[0].count,
      todaySignups: todayResult.rows[0].count,
      weekSignups: weekResult.rows[0].count,
      totalWithdrawals: withdrawalCount,
      recentUsers: recentResult.rows.map((u: { id: string; email: string; created_at: string }) => ({
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
      })),
    };
  } finally {
    await pool.end();
  }
}

export async function getSignupTrend() {
  await requireAdmin();

  const pool = getPool();
  try {
    const result = await pool.query(`
      SELECT
        DATE(created_at) as date,
        count(*)::int as count
      FROM auth.users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 빈 날짜 채우기
    const data: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = result.rows.find((r: { date: Date }) => r.date.toISOString().split("T")[0] === dateStr);
      data.push({ date: dateStr, count: found ? found.count : 0 });
    }

    return data;
  } finally {
    await pool.end();
  }
}

export async function getReelTrend() {
  await requireAdmin();

  const result = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE("createdAt") as date, count(*)::int as count
    FROM "Reel"
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const data: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = result.find((r) => r.date.toISOString().split("T")[0] === dateStr);
    data.push({ date: dateStr, count: found ? Number(found.count) : 0 });
  }

  return data;
}

export async function getWithdrawalStats() {
  await requireAdmin();

  const [withdrawals, trend] = await Promise.all([
    prisma.withdrawal.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.withdrawal.groupBy({
      by: ["reason"],
      _count: true,
    }),
  ]);

  const reasonMap: Record<string, string> = {
    SERVICE_DISSATISFACTION: "서비스 불만족",
    PRIVACY_CONCERN: "개인정보 우려",
    LOW_USAGE: "사용 빈도 낮음",
    COMPETITOR: "다른 서비스 이용",
    OTHER: "기타",
  };

  const reasonStats = trend.map((t) => ({
    reason: reasonMap[t.reason] || t.reason,
    count: t._count,
  }));

  return {
    total: withdrawals.length,
    withdrawals: withdrawals.map((w) => ({
      id: w.id,
      email: w.email,
      reason: reasonMap[w.reason] || w.reason,
      detail: w.detail,
      createdAt: w.createdAt.toISOString(),
    })),
    reasonStats,
  };
}

export async function getWithdrawalTrend() {
  await requireAdmin();

  const result = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE("createdAt") as date, count(*)::int as count
    FROM "Withdrawal"
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const data: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = result.find((r) => r.date.toISOString().split("T")[0] === dateStr);
    data.push({ date: dateStr, count: found ? Number(found.count) : 0 });
  }

  return data;
}

export async function getAdminUsers({
  search,
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();

  const pool = getPool();
  try {
    const offset = (page - 1) * pageSize;

    let query: string;
    let countQuery: string;
    const params: (string | number)[] = [];

    if (search) {
      query = `SELECT id, email, created_at FROM auth.users WHERE email ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      countQuery = `SELECT count(*)::int FROM auth.users WHERE email ILIKE $1`;
      params.push(`%${search}%`, pageSize, offset);
    } else {
      query = `SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      countQuery = `SELECT count(*)::int FROM auth.users`;
      params.push(pageSize, offset);
    }

    const [usersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    const userIds = usersResult.rows.map((u: { id: string }) => u.id);

    const [reelCounts, categoryCounts, tagCounts] = await Promise.all([
      prisma.reel.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _count: true,
      }),
      prisma.category.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _count: true,
      }),
      prisma.tag.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _count: true,
      }),
    ]);

    const reelMap = Object.fromEntries(
      reelCounts.map((r) => [r.userId, r._count])
    );
    const categoryMap = Object.fromEntries(
      categoryCounts.map((c) => [c.userId, c._count])
    );
    const tagMap = Object.fromEntries(
      tagCounts.map((t) => [t.userId, t._count])
    );

    const users = usersResult.rows.map(
      (u: { id: string; email: string; created_at: string }) => ({
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        reelCount: reelMap[u.id] || 0,
        categoryCount: categoryMap[u.id] || 0,
        tagCount: tagMap[u.id] || 0,
      })
    );

    return {
      users,
      total: countResult.rows[0].count,
      page,
      pageSize,
      totalPages: Math.ceil(countResult.rows[0].count / pageSize),
    };
  } finally {
    await pool.end();
  }
}

export async function getUserDetail(userId: string) {
  await requireAdmin();

  const pool = getPool();
  try {
    const userResult = await pool.query(
      "SELECT id, email, created_at FROM auth.users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) return null;

    const user = userResult.rows[0] as {
      id: string;
      email: string;
      created_at: string;
    };

    const [reels, categories, tags] = await Promise.all([
      prisma.reel.findMany({
        where: { userId },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      reels,
      categories,
      tags,
    };
  } finally {
    await pool.end();
  }
}
