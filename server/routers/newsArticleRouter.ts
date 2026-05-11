import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { newsArticles } from "../../drizzle/schema";
import { desc, eq, gte, and } from "drizzle-orm";
import { z } from "zod";

export const newsArticleRouter = router({
  /**
   * 保存されたニュース記事を取得
   * カテゴリ・日付でフィルタリング可能
   */
  getSavedArticles: publicProcedure
    .input(
      z.object({
        category: z.enum(["Claude関連", "ChatGPT関連", "その他AI", "すべて"]).optional(),
        daysBack: z.number().min(1).max(30).optional().default(7), // 過去N日間
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          articles: [],
          error: "Database connection failed",
        };
      }

      try {
        const now = new Date();
        const pastDate = new Date(now.getTime() - input.daysBack * 24 * 60 * 60 * 1000);

        // 基本的なフィルタ条件
        let whereCondition = gte(newsArticles.collectedAt, pastDate);

        // カテゴリフィルタ
        if (input.category && input.category !== "すべて") {
          whereCondition = and(whereCondition, eq(newsArticles.category, input.category))!;
        }

        const articles = await db
          .select()
          .from(newsArticles)
          .where(whereCondition)
          .orderBy(desc(newsArticles.collectedAt))
          .limit(100);

        return {
          success: true,
          articles,
          totalCount: articles.length,
        };
      } catch (error) {
        console.error("[NewsArticle] Error fetching articles:", error);
        return {
          success: false,
          articles: [],
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * 本日のニュース記事を取得
   */
  getTodayArticles: publicProcedure
    .input(
      z.object({
        category: z.enum(["Claude関連", "ChatGPT関連", "その他AI", "すべて"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          articles: [],
          error: "Database connection failed",
        };
      }

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 基本的なフィルタ条件
        let whereCondition = gte(newsArticles.collectedAt, today);

        // カテゴリフィルタ
        if (input.category && input.category !== "すべて") {
          whereCondition = and(whereCondition, eq(newsArticles.category, input.category))!;
        }

        const articles = await db
          .select()
          .from(newsArticles)
          .where(whereCondition)
          .orderBy(desc(newsArticles.collectedAt));

        return {
          success: true,
          articles,
          totalCount: articles.length,
        };
      } catch (error) {
        console.error("[NewsArticle] Error fetching today's articles:", error);
        return {
          success: false,
          articles: [],
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * 記事の詳細を取得
   */
  getArticleDetail: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          article: null,
          error: "Database connection failed",
        };
      }

      try {
        const article = await db
          .select()
          .from(newsArticles)
          .where(eq(newsArticles.id, input.articleId))
          .limit(1);

        if (article.length === 0) {
          return {
            success: false,
            article: null,
            error: "Article not found",
          };
        }

        return {
          success: true,
          article: article[0],
        };
      } catch (error) {
        console.error("[NewsArticle] Error fetching article detail:", error);
        return {
          success: false,
          article: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
