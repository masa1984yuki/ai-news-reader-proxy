import { InsertYoutubeVideo } from "../../drizzle/schema";

/**
 * YouTube動画収集サービス
 * 本番環境ではYouTube Data API v3を使用
 * 開発環境ではモックデータを使用
 */

// モックYouTube動画データ
const MOCK_YOUTUBE_DATA: InsertYoutubeVideo[] = [
  {
    videoId: "dQw4w9WgXcQ",
    title: "Claude AIの最新機能デモ - コード生成の実力",
    description: "AnthropicのClaude AIの最新バージョンでのコード生成能力をデモンストレーション。複雑なプログラミングタスクをどのように処理するかを実際に見てみましょう。",
    channelId: "UCxxxxxx1",
    channelTitle: "AI Technology Channel",
    thumbnailUrl: "https://via.placeholder.com/320x180?text=Claude+Demo",
    category: "Claude関連",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1日前
  },
  {
    videoId: "jNQXAC9IVRw",
    title: "ChatGPT 4.0の実用的な使い方 - ビジネス編",
    description: "ChatGPT 4.0をビジネスシーンでどのように活用するか、実例を交えて解説します。マーケティング、営業、企画など、様々な業務での活用方法を紹介。",
    channelId: "UCxxxxxx2",
    channelTitle: "Business AI Tips",
    thumbnailUrl: "https://via.placeholder.com/320x180?text=ChatGPT+Business",
    category: "ChatGPT関連",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2日前
  },
  {
    videoId: "kJQDxksHd5M",
    title: "Claude vs ChatGPT - 徹底比較",
    description: "ClaudeとChatGPTの機能、精度、価格などを詳しく比較。どちらがどのようなシーンに適しているのかを分析します。",
    channelId: "UCxxxxxx3",
    channelTitle: "AI Comparison Lab",
    thumbnailUrl: "https://via.placeholder.com/320x180?text=Claude+vs+ChatGPT",
    category: "Claude関連",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3日前
  },
  {
    videoId: "9bZkp7q19f0",
    title: "ChatGPTプラグインで業務自動化 - 実装ガイド",
    description: "ChatGPTのプラグイン機能を使用して、日常業務を自動化する方法を学びます。実装例も多数紹介。",
    channelId: "UCxxxxxx4",
    channelTitle: "Automation Experts",
    thumbnailUrl: "https://via.placeholder.com/320x180?text=ChatGPT+Plugins",
    category: "ChatGPT関連",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4日前
  },
  {
    videoId: "OPf0YbXqDm0",
    title: "Google Geminiの最新アップデート - 何が変わった？",
    description: "GoogleのGeminiの最新アップデートについて、新機能と改善点を詳しく解説します。",
    channelId: "UCxxxxxx5",
    channelTitle: "Google AI Updates",
    thumbnailUrl: "https://via.placeholder.com/320x180?text=Google+Gemini",
    category: "その他AI",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5日前
  },
  {
    videoId: "ZLpSSTNucjE",
    title: "Anthropic Claude 3 - 新しいAIの時代へ",
    description: "AnthropicがリリースしたClaude 3シリーズについて、その特徴と可能性を探ります。",
    channelId: "UCxxxxxx6",
    channelTitle: "AI Future Insights",
    thumbnailUrl: "https://via.placeholder.com/320x180?text=Claude+3",
    category: "Claude関連",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6日前
  },
];

/**
 * YouTube動画を収集
 * 本番環境ではYouTube Data API v3を呼び出し
 * 開発環境ではモックデータを返す
 */
export async function collectYoutubeVideos(): Promise<InsertYoutubeVideo[]> {
  try {
    // 本番環境ではAPIキーをチェック
    if (process.env.YOUTUBE_API_KEY) {
      // TODO: 実装 - YouTube Data API v3を呼び出し
      console.log("[YouTube Collector] Using YouTube Data API");
      return [];
    }

    // 開発環境ではモックデータを返す
    console.log("[YouTube Collector] Using mock data");
    
    // ランダムにモックデータを返す
    const shuffled = [...MOCK_YOUTUBE_DATA].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4件の動画を返す
  } catch (error) {
    console.error("[YouTube Collector] Error collecting videos:", error);
    return [];
  }
}

/**
 * YouTube動画のカテゴリを自動判定
 */
export function categorizeYoutubeVideo(title: string, description: string): "Claude関連" | "ChatGPT関連" | "その他AI" {
  const text = (title + " " + description).toLowerCase();

  if (text.includes("claude") || text.includes("anthropic")) {
    return "Claude関連";
  }
  if (text.includes("chatgpt") || text.includes("openai")) {
    return "ChatGPT関連";
  }
  return "その他AI";
}
