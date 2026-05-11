import { InsertNewsArticle } from "../../drizzle/schema";

/**
 * ニュース収集サービス
 * 本番環境ではNewsData.io APIを使用
 * 開発環境ではモックデータを使用
 */

// モックニュースデータ
const MOCK_NEWS_DATA: InsertNewsArticle[] = [
  {
    title: "Claude 3.5 Sonnetが新機能を追加、コード生成能力が向上",
    description: "AnthropicがClaude 3.5 Sonnetの最新版をリリース。コード生成とテスト作成の精度が大幅に改善されました。",
    content: "AnthropicはClaude 3.5 Sonnetの最新版をリリースしました。この新バージョンでは、コード生成能力が向上し、複雑なプログラミングタスクをより正確に処理できるようになりました。また、テスト作成の自動化機能も強化され、開発効率が大幅に向上することが期待されています。",
    summary: "Claude 3.5 Sonnetが更新され、コード生成とテスト作成の能力が向上しました。",
    sourceUrl: "https://example.com/claude-3-5-sonnet-update",
    sourceName: "AI News Daily",
    imageUrl: "https://via.placeholder.com/600x400?text=Claude+3.5",
    category: "Claude関連",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1日前
  },
  {
    title: "ChatGPT、新しい会話スタイルオプションが利用可能に",
    description: "OpenAIがChatGPTに複数の会話スタイルオプションを追加。ユーザーは自分の好みに合わせてAIの応答スタイルをカスタマイズできます。",
    content: "OpenAIはChatGPTに複数の会話スタイルオプションを追加しました。これにより、ユーザーは『フォーマル』『カジュアル』『テクニカル』など、さまざまなスタイルから選択でき、AIの応答をより自分の好みに合わせることができるようになりました。",
    summary: "ChatGPTに会話スタイルカスタマイズ機能が追加されました。",
    sourceUrl: "https://example.com/chatgpt-conversation-styles",
    sourceName: "OpenAI Blog",
    imageUrl: "https://via.placeholder.com/600x400?text=ChatGPT+Styles",
    category: "ChatGPT関連",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2日前
  },
  {
    title: "Claude APIの利用料金が20%削減、開発者にとってより手頃に",
    description: "AnthropicがClaude APIの価格を引き下げ、開発者がより手軽にAIを活用できるようになりました。",
    content: "AnthropicはClaude APIの利用料金を20%削減することを発表しました。この価格引き下げにより、スタートアップから大企業まで、より多くの開発者がClaude APIを活用できるようになることが期待されています。",
    summary: "Claude APIの料金が20%削減されました。",
    sourceUrl: "https://example.com/claude-api-price-cut",
    sourceName: "Anthropic News",
    imageUrl: "https://via.placeholder.com/600x400?text=Claude+API",
    category: "Claude関連",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3日前
  },
  {
    title: "ChatGPT Plus、新しいプラグインエコシステムが拡大",
    description: "OpenAIがChatGPT Plusのプラグインエコシステムを拡大。数百の新しいプラグインが利用可能になりました。",
    content: "OpenAIはChatGPT Plusのプラグインエコシステムを大幅に拡大しました。新しいプラグインにより、ユーザーはChatGPTを使用してメール管理、スケジュール調整、データ分析など、さまざまなタスクを実行できるようになりました。",
    summary: "ChatGPT Plusのプラグイン数が大幅に増加しました。",
    sourceUrl: "https://example.com/chatgpt-plugins-expansion",
    sourceName: "Tech Crunch",
    imageUrl: "https://via.placeholder.com/600x400?text=ChatGPT+Plugins",
    category: "ChatGPT関連",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4日前
  },
  {
    title: "Google Gemini、マルチモーダル能力が大幅に向上",
    description: "GoogleがGeminiの画像・音声・テキスト処理能力を向上。複雑なマルチモーダルタスクに対応可能に。",
    content: "GoogleはGeminiのマルチモーダル能力を大幅に向上させました。新バージョンでは、画像、音声、テキストを組み合わせた複雑なタスクをより正確に処理できるようになりました。",
    summary: "Google Geminiのマルチモーダル処理能力が向上しました。",
    sourceUrl: "https://example.com/google-gemini-multimodal",
    sourceName: "Google AI Blog",
    imageUrl: "https://via.placeholder.com/600x400?text=Google+Gemini",
    category: "その他AI",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5日前
  },
];

/**
 * ニュース記事を収集
 * 本番環境ではNewsData.io APIを呼び出し
 * 開発環境ではモックデータを返す
 */
export async function collectNews(): Promise<InsertNewsArticle[]> {
  try {
    // 本番環境ではAPIキーをチェック
    if (process.env.NEWSDATA_API_KEY) {
      // TODO: 実装 - NewsData.io APIを呼び出し
      console.log("[News Collector] Using NewsData.io API");
      return [];
    }

    // 開発環境ではモックデータを返す
    console.log("[News Collector] Using mock data");
    
    // ランダムにモックデータを返す（毎回異なるデータセットを返すシミュレーション）
    const shuffled = [...MOCK_NEWS_DATA].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4件のニュースを返す
  } catch (error) {
    console.error("[News Collector] Error collecting news:", error);
    return [];
  }
}

/**
 * ニュース記事のカテゴリを自動判定
 */
export function categorizeNews(title: string, description: string): "Claude関連" | "ChatGPT関連" | "その他AI" {
  const text = (title + " " + description).toLowerCase();

  if (text.includes("claude") || text.includes("anthropic")) {
    return "Claude関連";
  }
  if (text.includes("chatgpt") || text.includes("openai")) {
    return "ChatGPT関連";
  }
  return "その他AI";
}
