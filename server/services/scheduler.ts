import { collectNews, categorizeNews } from "./newsCollector";
import { collectYoutubeVideos, categorizeYoutubeVideo } from "./youtubeCollector";
import { summarizeNews, summarizeYoutubeVideo } from "./summarizer";
import { saveNewsArticles, saveYoutubeVideos, logCollection } from "../db";
import { notifyOwner } from "../_core/notification";

/**
 * スケジュールサービス
 * 毎日定時にニュース・動画を収集・要約・保存
 */

/**
 * ニュース・動画の収集・要約・保存を実行
 */
export async function runCollectionTask(): Promise<void> {
  console.log("[Scheduler] Starting collection task...");

  try {
    // ニュース収集
    await collectAndSaveNews();

    // YouTube動画収集
    await collectAndSaveYoutubeVideos();

    console.log("[Scheduler] Collection task completed successfully");
  } catch (error) {
    console.error("[Scheduler] Error during collection task:", error);
  }
}

/**
 * ニュース記事を収集・要約・保存
 */
async function collectAndSaveNews(): Promise<void> {
  try {
    console.log("[Scheduler] Collecting news articles...");

    // ニュース記事を収集
    const articles = await collectNews();

    if (articles.length === 0) {
      console.log("[Scheduler] No news articles collected");
      await logCollection({
        type: "news",
        status: "success",
        itemsCollected: 0,
      });
      return;
    }

    // 記事を要約し、カテゴリを判定
    const articlesWithSummary = await Promise.all(
      articles.map(async (article) => {
        // カテゴリを自動判定
        const category = categorizeNews(article.title, article.description || "");

        // 要約を生成
        const summary = await summarizeNews(
          article.title,
          article.content || article.description || ""
        );

        return {
          ...article,
          category,
          summary,
        };
      })
    );

    // データベースに保存
    const savedCount = await saveNewsArticles(articlesWithSummary);

    console.log(`[Scheduler] Saved ${savedCount} news articles`);

    // ログを記録
    await logCollection({
      type: "news",
      status: "success",
      itemsCollected: savedCount,
    });

    // オーナーに通知
    if (savedCount > 0) {
      await notifyOwner({
        title: "新しいAIニュースが収集されました",
        content: `${savedCount}件の新しいニュース記事が収集・要約されました。`,
      });
    }
  } catch (error) {
    console.error("[Scheduler] Error collecting news:", error);

    await logCollection({
      type: "news",
      status: "failure",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * YouTube動画を収集・要約・保存
 */
async function collectAndSaveYoutubeVideos(): Promise<void> {
  try {
    console.log("[Scheduler] Collecting YouTube videos...");

    // YouTube動画を収集
    const videos = await collectYoutubeVideos();

    if (videos.length === 0) {
      console.log("[Scheduler] No YouTube videos collected");
      await logCollection({
        type: "youtube",
        status: "success",
        itemsCollected: 0,
      });
      return;
    }

    // 動画をカテゴリ判定
    const videosWithCategory = videos.map((video) => {
      const category = categorizeYoutubeVideo(video.title, video.description || "");
      return {
        ...video,
        category,
      };
    });

    // データベースに保存
    const savedCount = await saveYoutubeVideos(videosWithCategory);

    console.log(`[Scheduler] Saved ${savedCount} YouTube videos`);

    // ログを記録
    await logCollection({
      type: "youtube",
      status: "success",
      itemsCollected: savedCount,
    });

    // オーナーに通知
    if (savedCount > 0) {
      await notifyOwner({
        title: "新しいAI関連YouTube動画が追加されました",
        content: `${savedCount}件の新しいYouTube動画が収集されました。`,
      });
    }
  } catch (error) {
    console.error("[Scheduler] Error collecting YouTube videos:", error);

    await logCollection({
      type: "youtube",
      status: "failure",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
