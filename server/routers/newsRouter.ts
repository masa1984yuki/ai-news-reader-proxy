import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getNewsArticles, getYoutubeVideos, getNewsArticleById, getYoutubeVideoById } from "../db";
import { invokeLLM } from "../_core/llm";

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

  /**
   * 記事を読みやすいように最適化して音声読み上げ用に整形
   */
  optimizeTextForSpeech: publicProcedure
    .input(
      z.object({
        title: z.string(),
        text: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const systemPrompt = `あなたは日本語の読みやすさ専門家です。

以下の記事を音声読み上げ用に最適化してください：

1. 難しい漢字や専門用語には、一度記載した後に、カッコを使ってひらがなを追加してください。
   例：「人工知能（AI）」、「機械学習（きけいがくしゅう）」

2. 粗い言い回しや後ろ向きな表現を、より自然で日常的な言い回しに置き換えてください。

3. 長い文を、音声読み上げに適した長さに分割してください。

4. 一文一文を明確に、できるだけ粗い言い回しで記載してください。

5. 記号や数字は、読み上げやすい形式に変換してください。
   例：「2026年」→「2026年（にせんにじゅうろくねん）」

以下の形式で結果を返してください：
{
  "optimizedTitle": "最適化されたタイトル",
  "optimizedText": "最適化された本文"
}`;

        const userMessage = `タイトル: ${input.title}\n\n本文: ${input.text}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "optimized_text",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  optimizedTitle: { type: "string", description: "最適化されたタイトル" },
                  optimizedText: { type: "string", description: "最適化された本文" },
                },
                required: ["optimizedTitle", "optimizedText"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message.content;
        if (!content || typeof content !== 'string') {
          throw new Error("Empty response from LLM");
        }

        const result = JSON.parse(content);
        return {
          success: true,
          optimizedTitle: result.optimizedTitle,
          optimizedText: result.optimizedText,
        };
      } catch (error) {
        console.error("Error optimizing text:", error);
        return {
          success: false,
          optimizedTitle: input.title,
          optimizedText: input.text,
        };
      }
    }),
});
