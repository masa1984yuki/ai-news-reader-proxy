import { publicProcedure, router } from "../_core/trpc";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [["content:encoded", "content"]],
  },
});

export interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
}

export const rssRouter = router({
  /**
   * Google News のRSSフィードを取得
   */
  getGoogleNews: publicProcedure.query(async () => {
    try {
      const feed = await parser.parseURL(
        "https://news.google.com/rss/search?q=AI&hl=ja&gl=JP&ceid=JP:ja"
      );

      const items: RSSItem[] = (feed.items || []).slice(0, 30).map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content || item.contentSnippet,
        contentSnippet: item.contentSnippet,
      }));

      return {
        success: true,
        items,
        source: "google",
        totalItems: items.length,
      };
    } catch (error) {
      console.error("[RSS] Google News取得エラー:", error);
      return {
        success: false,
        items: [],
        source: "google",
        error: error instanceof Error ? error.message : "Unknown error",
        totalItems: 0,
      };
    }
  }),

  /**
   * 複数キーワードでGoogle Newsを取得（Claude, ChatGPT関連）
   */
  getAINews: publicProcedure.query(async () => {
    try {
      // Claude関連のニュース
      const claudeFeed = await parser.parseURL(
        "https://news.google.com/rss/search?q=Claude+AI&hl=ja&gl=JP&ceid=JP:ja"
      );

      // ChatGPT関連のニュース
      const chatgptFeed = await parser.parseURL(
        "https://news.google.com/rss/search?q=ChatGPT&hl=ja&gl=JP&ceid=JP:ja"
      );

      // 全AI関連ニュース
      const allAIFeed = await parser.parseURL(
        "https://news.google.com/rss/search?q=AI&hl=ja&gl=JP&ceid=JP:ja"
      );

      const claudeItems: RSSItem[] = (claudeFeed.items || []).slice(0, 20).map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content || item.contentSnippet,
        contentSnippet: item.contentSnippet,
      }));

      const chatgptItems: RSSItem[] = (chatgptFeed.items || []).slice(0, 20).map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content || item.contentSnippet,
        contentSnippet: item.contentSnippet,
      }));

      const allAIItems: RSSItem[] = (allAIFeed.items || []).slice(0, 20).map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content || item.contentSnippet,
        contentSnippet: item.contentSnippet,
      }));

      return {
        success: true,
        claude: claudeItems,
        chatgpt: chatgptItems,
        allAI: allAIItems,
        totalItems: claudeItems.length + chatgptItems.length + allAIItems.length,
      };
    } catch (error) {
      console.error("[RSS] AI News取得エラー:", error);
      return {
        success: false,
        claude: [],
        chatgpt: [],
        allAI: [],
        error: error instanceof Error ? error.message : "Unknown error",
        totalItems: 0,
      };
    }
  }),
});
