import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * ニュース記事テーブル
 * NewsData.ioから収集した記事を保存
 */
export const newsArticles = mysqlTable("newsArticles", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  summary: text("summary"), // LLMで生成された日本語要約
  sourceUrl: text("sourceUrl").notNull(),
  sourceName: varchar("sourceName", { length: 255 }),
  imageUrl: text("imageUrl"),
  category: mysqlEnum("category", ["Claude関連", "ChatGPT関連", "その他AI"]).notNull(),
  publishedAt: timestamp("publishedAt"),
  collectedAt: timestamp("collectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;

/**
 * YouTube動画テーブル
 * YouTube Data APIから収集した動画を保存
 */
export const youtubeVideos = mysqlTable("youtubeVideos", {
  id: int("id").autoincrement().primaryKey(),
  videoId: varchar("videoId", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  channelId: varchar("channelId", { length: 255 }),
  channelTitle: varchar("channelTitle", { length: 255 }),
  thumbnailUrl: text("thumbnailUrl"),
  category: mysqlEnum("category", ["Claude関連", "ChatGPT関連", "その他AI"]).notNull(),
  publishedAt: timestamp("publishedAt"),
  collectedAt: timestamp("collectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type YoutubeVideo = typeof youtubeVideos.$inferSelect;
export type InsertYoutubeVideo = typeof youtubeVideos.$inferInsert;

/**
 * 収集実行履歴テーブル
 * ニュース・動画の収集実行履歴を記録
 */
export const collectionLogs = mysqlTable("collectionLogs", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["news", "youtube"]).notNull(),
  status: mysqlEnum("status", ["success", "failure"]).notNull(),
  itemsCollected: int("itemsCollected").default(0),
  errorMessage: text("errorMessage"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export type CollectionLog = typeof collectionLogs.$inferSelect;
export type InsertCollectionLog = typeof collectionLogs.$inferInsert;
/**
 * 主要ニュース要約テーブル
 * 毎日の経済・技術ニュースをLLMで要約し保存
 */
export const dailySummaries = mysqlTable("dailySummaries", {
  id: int("id").autoincrement().primaryKey(),
  summaryDate: timestamp("summaryDate").notNull(), // 要約対象日
  summaries: text("summaries").notNull(), // JSON形式で複数の要約を保存
  sourceType: mysqlEnum("sourceType", ["economy", "technology", "general"]).notNull(), // 経済・技術・一般
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailySummary = typeof dailySummaries.$inferSelect;
export type InsertDailySummary = typeof dailySummaries.$inferInsert;
