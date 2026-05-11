import { eq, desc, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, newsArticles, youtubeVideos, collectionLogs, InsertNewsArticle, InsertYoutubeVideo, InsertCollectionLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * ニュース記事を取得
 * @param limit 取得数
 * @param offset オフセット
 * @param category カテゴリ（省略可能）
 */
export async function getNewsArticles(
  limit: number = 20,
  offset: number = 0,
  category?: string
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];
    if (category && ["Claude関連", "ChatGPT関連", "その他AI"].includes(category)) {
      conditions.push(eq(newsArticles.category, category as any));
    }

    const query = db
      .select()
      .from(newsArticles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit)
      .offset(offset);

    return query;
  } catch (error) {
    console.error("[Database] Failed to get news articles:", error);
    return [];
  }
}

/**
 * YouTube動画を取得
 * @param limit 取得数
 * @param offset オフセット
 * @param category カテゴリ（省略可能）
 */
export async function getYoutubeVideos(
  limit: number = 20,
  offset: number = 0,
  category?: string
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];
    if (category && ["Claude関連", "ChatGPT関連", "その他AI"].includes(category)) {
      conditions.push(eq(youtubeVideos.category, category as any));
    }

    const query = db
      .select()
      .from(youtubeVideos)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(youtubeVideos.publishedAt))
      .limit(limit)
      .offset(offset);

    return query;
  } catch (error) {
    console.error("[Database] Failed to get YouTube videos:", error);
    return [];
  }
}

/**
 * ニュース記事を保存（重複排除）
 */
export async function saveNewsArticles(articles: InsertNewsArticle[]) {
  const db = await getDb();
  if (!db) return 0;

  try {
    if (articles.length === 0) return 0;

    // 既存のURLをチェック
    const urls = articles.map(a => a.sourceUrl);
    const existing = await db
      .select({ sourceUrl: newsArticles.sourceUrl })
      .from(newsArticles)
      .where(inArray(newsArticles.sourceUrl, urls));

    const existingUrls = new Set(existing.map(e => e.sourceUrl));
    const newArticles = articles.filter(a => !existingUrls.has(a.sourceUrl));

    if (newArticles.length === 0) return 0;

    await db.insert(newsArticles).values(newArticles);
    return newArticles.length;
  } catch (error) {
    console.error("[Database] Failed to save news articles:", error);
    return 0;
  }
}

/**
 * YouTube動画を保存（重複排除）
 */
export async function saveYoutubeVideos(videos: InsertYoutubeVideo[]) {
  const db = await getDb();
  if (!db) return 0;

  try {
    if (videos.length === 0) return 0;

    // 既存のvideoIdをチェック
    const videoIds = videos.map(v => v.videoId);
    const existing = await db
      .select({ videoId: youtubeVideos.videoId })
      .from(youtubeVideos)
      .where(inArray(youtubeVideos.videoId, videoIds));

    const existingIds = new Set(existing.map(e => e.videoId));
    const newVideos = videos.filter(v => !existingIds.has(v.videoId));

    if (newVideos.length === 0) return 0;

    await db.insert(youtubeVideos).values(newVideos);
    return newVideos.length;
  } catch (error) {
    console.error("[Database] Failed to save YouTube videos:", error);
    return 0;
  }
}

/**
 * 収集実行ログを記録
 */
export async function logCollection(log: InsertCollectionLog) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(collectionLogs).values(log);
  } catch (error) {
    console.error("[Database] Failed to log collection:", error);
  }
}

/**
 * 最新のニュース記事を取得（詳細表示用）
 */
export async function getNewsArticleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get news article by ID:", error);
    return undefined;
  }
}

/**
 * YouTube動画を取得（詳細表示用）
 */
export async function getYoutubeVideoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(youtubeVideos)
      .where(eq(youtubeVideos.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get YouTube video by ID:", error);
    return undefined;
  }
}
