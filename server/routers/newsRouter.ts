import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getNewsArticles, getYoutubeVideos, getNewsArticleById, getYoutubeVideoById } from "../db";

/**
 * ニュース・動画関連のtRPCルーター
 */

const CategoryEnum = z.enum(["Claude関連", "ChatGPT関連", "その他AI"]);

export const newsRouter = router({
  /**
   * ニュース記事一覧を取得
   */
  listArticles: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        category: CategoryEnum.optional(),
      })
    )
    .query(async ({ input }) => {
      const articles = await getNewsArticles(input.limit, input.offset, input.category);
      return {
        articles,
        total: articles.length,
      };
    }),

  /**
   * ニュース記事の詳細を取得
   */
  getArticle: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const article = await getNewsArticleById(input.id);
      if (!article) {
        throw new Error("Article not found");
      }
      return article;
    }),

  /**
   * YouTube動画一覧を取得
   */
  listVideos: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        category: CategoryEnum.optional(),
      })
    )
    .query(async ({ input }) => {
      const videos = await getYoutubeVideos(input.limit, input.offset, input.category);
      return {
        videos,
        total: videos.length,
      };
    }),

  /**
   * YouTube動画の詳細を取得
   */
  getVideo: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const video = await getYoutubeVideoById(input.id);
      if (!video) {
        throw new Error("Video not found");
      }
      return video;
    }),

  /**
   * カテゴリ一覧を取得
   */
  getCategories: publicProcedure.query(() => {
    return [
      { value: "Claude関連", label: "Claude関連" },
      { value: "ChatGPT関連", label: "ChatGPT関連" },
      { value: "その他AI", label: "その他AI" },
    ];
  }),
});
