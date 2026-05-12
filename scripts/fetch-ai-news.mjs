import Parser from "rss-parser";
import { getDb } from "../server/db.ts";
import { newsArticles } from "../drizzle/schema.ts";
import { inArray } from "drizzle-orm";

const parser = new Parser();

// Google News RSS フィード URL（AI関連）
const feedUrl = "https://news.google.com/rss/search?q=Claude+ChatGPT+AI&hl=ja&gl=JP&ceid=JP:ja";

async function fetchAndSaveAINews() {
  try {
    console.log("[AI News] Fetching AI news from Google News...");
    const feed = await parser.parseURL(feedUrl);
    
    if (!feed.items || feed.items.length === 0) {
      console.log("[AI News] No items found");
      return;
    }

    console.log(`[AI News] Got ${feed.items.length} items`);

    const db = await getDb();
    if (!db) {
      console.error("[AI News] Database not available");
      return;
    }

    // 既存のAIニュースを削除
    await db.delete(newsArticles).where(
      inArray(newsArticles.category, ["Claude関連", "ChatGPT関連", "その他AI"])
    );

    let insertCount = 0;

    // 最初の20件を保存
    for (const item of feed.items.slice(0, 20)) {
      try {
        const title = item.title || "タイトルなし";
        const description = item.content || item.summary || "";
        const sourceUrl = item.link || "";
        const sourceName = item.source?.title || "Google News";
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

        // カテゴリを判定
        let category = "その他AI";
        if (title.toLowerCase().includes("claude") || description.toLowerCase().includes("claude")) {
          category = "Claude関連";
        } else if (title.toLowerCase().includes("chatgpt") || description.toLowerCase().includes("chatgpt")) {
          category = "ChatGPT関連";
        }

        await db.insert(newsArticles).values({
          title,
          description,
          content: description,
          summary: description.substring(0, 200),
          sourceUrl,
          sourceName,
          category,
          publishedAt,
        });

        insertCount++;
      } catch (itemError) {
        console.error("[AI News] Error inserting item:", itemError);
      }
    }

    console.log(`[AI News] Successfully saved ${insertCount} articles`);
  } catch (error) {
    console.error("[AI News] Error fetching news:", error);
  }
}

await fetchAndSaveAINews();
