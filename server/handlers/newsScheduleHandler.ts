import { Request, Response } from "express";
import { getDb } from "../db";
import { newsArticles, InsertNewsArticle } from "../../drizzle/schema";
import { sdk } from "../_core/sdk";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [["content:encoded", "content"]],
  },
});

/**
 * ニュース自動収集スケジュールハンドラー
 * 毎日14:00（日本時間）に実行される
 */
export async function newsScheduleHandler(req: Request, res: Response) {
  try {
    // 認証チェック（スケジュールタスクのみ）
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        error: "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("[NewsSchedule] Starting news collection...");

    // Google News RSS フィードから記事を取得
    const allAIFeed = await parser.parseURL(
      "https://news.google.com/rss/search?q=AI&hl=ja&gl=JP&ceid=JP:ja"
    );
    const claudeFeed = await parser.parseURL(
      "https://news.google.com/rss/search?q=Claude+AI&hl=ja&gl=JP&ceid=JP:ja"
    );
    const chatgptFeed = await parser.parseURL(
      "https://news.google.com/rss/search?q=ChatGPT&hl=ja&gl=JP&ceid=JP:ja"
    );

    // 記事をカテゴリ分けして保存
    const articlesToInsert: InsertNewsArticle[] = [];

    // Claude関連の記事
    (claudeFeed.items || []).slice(0, 20).forEach((item) => {
      articlesToInsert.push({
        title: item.title || "No title",
        description: item.contentSnippet,
        content: item.content || item.contentSnippet,
        sourceUrl: item.link || "",
        sourceName: "Google News",
        category: "Claude関連",
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        collectedAt: new Date(),
      });
    });

    // ChatGPT関連の記事
    (chatgptFeed.items || []).slice(0, 20).forEach((item) => {
      articlesToInsert.push({
        title: item.title || "No title",
        description: item.contentSnippet,
        content: item.content || item.contentSnippet,
        sourceUrl: item.link || "",
        sourceName: "Google News",
        category: "ChatGPT関連",
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        collectedAt: new Date(),
      });
    });

    // その他AI関連の記事
    (allAIFeed.items || []).slice(0, 20).forEach((item) => {
      articlesToInsert.push({
        title: item.title || "No title",
        description: item.contentSnippet,
        content: item.content || item.contentSnippet,
        sourceUrl: item.link || "",
        sourceName: "Google News",
        category: "その他AI",
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        collectedAt: new Date(),
      });
    });

    // 重複排除（同じURLは保存しない）
    const uniqueArticles = Array.from(
      new Map(articlesToInsert.map((item) => [item.sourceUrl, item])).values()
    );

    // データベースに保存
    if (uniqueArticles.length > 0) {
      await db.insert(newsArticles).values(uniqueArticles);
      console.log(`[NewsSchedule] Saved ${uniqueArticles.length} articles`);
    }

    return res.json({
      ok: true,
      articlesCollected: uniqueArticles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[NewsSchedule] Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        url: req.url,
        taskUid: (await sdk.authenticateRequest(req)).taskUid,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
