import { getDb } from '../server/db.ts';
import { dailySummaries } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';
import { invokeLLM } from '../server/_core/llm.ts';

async function fetchGeneralNews(keyword) {
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ja&gl=JP&ceid=JP:ja`;
    
    const response = await fetch(rssUrl);
    if (!response.ok) {
      console.error(`[Manual] Failed to fetch RSS: ${response.status}`);
      return [];
    }

    const text = await response.text();
    
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [];
    
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
    
    return items.slice(0, 5);
  } catch (error) {
    console.error("[Manual] Error fetching news:", error);
    return [];
  }
}

async function summarizeNews(newsItems) {
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
            "あなたはニュース要約の専門家です。与えられたニュースを3件まで、各50文字以内で日本語で要約してください。必ずJSON配列形式で、各要素は {\"title\": \"ニュースタイトル\", \"summary\": \"50文字以内の要約\"} という構造で返してください。JSONのみを返し、他の説明は不要です。",
        },
        {
          role: "user",
          content: `以下のニュースを要約してください（JSON配列形式のみで返してください）:\n\n${newsText}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      try {
        // JSON部分を抽出（```json ... ``` で囲まれている場合に対応）
        let jsonStr = content;
        const jsonMatch = /```json\s*([\s\S]*?)\s*```/.exec(content);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }
        
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const limited = parsed.slice(0, 3).map((item) => ({
            title: String(item.title || "タイトル不明").substring(0, 100),
            summary: String(item.summary || "要約不明").substring(0, 50),
          }));
          return limited;
        }
      } catch (parseError) {
        console.warn("[Manual] Failed to parse LLM JSON response:", parseError);
        // フォールバック：テキストから手動で要約を抽出
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          return lines.slice(0, 3).map((line, idx) => ({
            title: `要約 ${idx + 1}`,
            summary: line.substring(0, 50),
          }));
        }
      }
      return [
        { title: "要約生成完了", summary: content.substring(0, 50) },
      ];
    }
    return [
      { title: "エラー", summary: "要約生成に失敗しました" },
    ];
  } catch (error) {
    console.error("[Manual] Error summarizing news:", error);
    return [
      { title: "エラー", summary: "要約生成に失敗しました" },
    ];
  }
}

async function main() {
  try {
    console.log("[Manual] Starting collection and summarization...");

    const db = await getDb();
    if (!db) {
      console.error("[Manual] Database not available");
      process.exit(1);
    }

    // 経済ニュース取得
    console.log("[Manual] Fetching economy news...");
    const economyNews = await fetchGeneralNews("経済 日本");
    console.log(`[Manual] Got ${economyNews.length} economy news items`);
    
    const economySummaries = await summarizeNews(economyNews);
    console.log("[Manual] Generated economy summaries:", economySummaries);

    // 技術ニュース取得
    console.log("[Manual] Fetching technology news...");
    const techNews = await fetchGeneralNews("最新技術 社会実装");
    console.log(`[Manual] Got ${techNews.length} technology news items`);
    
    const techSummaries = await summarizeNews(techNews);
    console.log("[Manual] Generated technology summaries:", techSummaries);

    // 一般ニュース取得（政治・国際・社会）
    console.log("[Manual] Fetching general news...");
    const generalNews = await fetchGeneralNews("政治 国際 社会");
    console.log(`[Manual] Got ${generalNews.length} general news items`);
    
    const generalSummaries = await summarizeNews(generalNews);
    console.log("[Manual] Generated general summaries:", generalSummaries);

    // 今日の日付（UTC）
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 既存の要約を削除（今日のデータがあれば）
    console.log("[Manual] Deleting existing summaries for today...");
    await db.delete(dailySummaries).where(eq(dailySummaries.summaryDate, today));

    // 経済ニュース要約を保存
    console.log("[Manual] Saving economy summaries...");
    await db.insert(dailySummaries).values({
      summaryDate: today,
      summaries: JSON.stringify(economySummaries),
      sourceType: "economy",
    });

    // 技術ニュース要約を保存
    console.log("[Manual] Saving technology summaries...");
    await db.insert(dailySummaries).values({
      summaryDate: today,
      summaries: JSON.stringify(techSummaries),
      sourceType: "technology",
    });

    // 一般ニュース要約を保存
    console.log("[Manual] Saving general summaries...");
    await db.insert(dailySummaries).values({
      summaryDate: today,
      summaries: JSON.stringify(generalSummaries),
      sourceType: "general",
    });

    console.log("[Manual] Collection and summarization completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Manual] Error:", error);
    process.exit(1);
  }
}

main();
