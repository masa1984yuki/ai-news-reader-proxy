import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { dailySummaries } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

interface NewsItem {
  title: string;
  description?: string;
  link?: string;
  pubDate?: string;
}

interface SummaryItem {
  title: string;
  summary: string;
}

/**
 * Google News RSS から経済・技術ニュースを取得
 */
export async function fetchGeneralNews(keyword: string): Promise<NewsItem[]> {
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ja&gl=JP&ceid=JP:ja`;
    
    const response = await fetch(rssUrl);
    if (!response.ok) {
      console.error(`[General News] Failed to fetch RSS: ${response.status}`);
      return [];
    }

    const text = await response.text();
    
    // 簡易的な XML パース（正規表現を使用）
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items: NewsItem[] = [];
    
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const itemContent = match[1];
      
      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
      const descMatch = /<description>([\s\S]*?)<\/description>/.exec(itemContent);
      const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent);
      
      if (titleMatch) {
        items.push({
          title: titleMatch[1].replace(/<[^>]*>/g, ""),
          description: descMatch ? descMatch[1].replace(/<[^>]*>/g, "") : undefined,
          link: linkMatch ? linkMatch[1] : undefined,
          pubDate: pubDateMatch ? pubDateMatch[1] : undefined,
        });
      }
    }
    
    return items.slice(0, 5); // トップ5を返す
  } catch (error) {
    console.error("[General News] Error fetching news:", error);
    return [];
  }
}

/**
 * ニュースをLLMで日本語要約（構造化形式）
 */
export async function summarizeNews(newsItems: NewsItem[]): Promise<SummaryItem[]> {
  if (newsItems.length === 0) {
    return [
      { title: "ニュースなし", summary: "本日のニュースはありません" },
    ];
  }

  const newsText = newsItems
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item.title}\n${item.description || ""}`)
    .join("\n\n");

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "あなたはニュース要約の専門家です。与えられたニュースを3件まで、各50文字以内で日本語で要約してください。JSON配列形式で、各要素は {\"title\": \"ニュースタイトル\", \"summary\": \"50文字以内の要約\"} という構造で返してください。",
        },
        {
          role: "user",
          content: `以下のニュースを要約してください（JSON配列形式で）：\n\n${newsText}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      try {
        // JSON形式の検証
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 最大3件に制限し、各項目を検証
          const limited = parsed.slice(0, 3).map((item: any) => ({
            title: String(item.title || "タイトル不明").substring(0, 100),
            summary: String(item.summary || "要約不明").substring(0, 50),
          }));
          return limited;
        }
      } catch (parseError) {
        console.warn("[General News] Failed to parse LLM JSON response, using raw text");
      }
      // フォールバック：テキスト形式を配列に変換
      return [
        { title: "要約生成完了", summary: content.substring(0, 50) },
      ];
    }
    return [
      { title: "エラー", summary: "要約生成に失敗しました" },
    ];
  } catch (error) {
    console.error("[General News] Error summarizing news:", error);
    return [
      { title: "エラー", summary: "要約生成に失敗しました" },
    ];
  }
}

/**
 * 経済・技術ニュースを取得し、要約を生成・保存
 */
export async function collectAndSummarizeGeneralNews(): Promise<void> {
  try {
    console.log("[General News] Starting collection and summarization...");

    const db = await getDb();
    if (!db) {
      console.error("[General News] Database not available");
      return;
    }

    // 経済ニュース取得
    const economyNews = await fetchGeneralNews("経済 日本");
    const economySummaries = await summarizeNews(economyNews);

    // 技術ニュース取得
    const techNews = await fetchGeneralNews("最新技術 社会実装");
    const techSummaries = await summarizeNews(techNews);

    // 今日の日付（UTC）
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 既存の要約を削除（今日のデータがあれば）
    await db.delete(dailySummaries).where(eq(dailySummaries.summaryDate, today));

    // 経済ニュース要約を保存
    await db.insert(dailySummaries).values({
      summaryDate: today,
      summaries: JSON.stringify(economySummaries),
      sourceType: "economy",
    });

    // 技術ニュース要約を保存
    await db.insert(dailySummaries).values({
      summaryDate: today,
      summaries: JSON.stringify(techSummaries),
      sourceType: "technology",
    });

    console.log("[General News] Collection and summarization completed");
  } catch (error) {
    console.error("[General News] Error in collection and summarization:", error);
  }
}

/**
 * 今日の要約を取得
 */
export async function getTodaySummaries() {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const summaries = await db
      .select()
      .from(dailySummaries)
      .where(eq(dailySummaries.summaryDate, today));

    const economyData = summaries.find((s) => s.sourceType === "economy");
    const technologyData = summaries.find((s) => s.sourceType === "technology");

    // JSON パース
    let economySummaries: SummaryItem[] = [];
    let techSummaries: SummaryItem[] = [];

    try {
      if (economyData?.summaries) {
        economySummaries = JSON.parse(economyData.summaries);
      }
      if (technologyData?.summaries) {
        techSummaries = JSON.parse(technologyData.summaries);
      }
    } catch (parseError) {
      console.error("[General News] Error parsing summaries:", parseError);
    }

    return {
      success: true,
      economy: economySummaries,
      technology: techSummaries,
    };
  } catch (error) {
    console.error("[General News] Error getting today's summaries:", error);
    return { success: false, error: String(error) };
  }
}
