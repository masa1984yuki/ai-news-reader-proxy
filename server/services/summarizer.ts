import { invokeLLM } from "../_core/llm";

/**
 * LLMを使用したテキスト要約サービス
 * Claude APIを使用して、ニュース記事を日本語で要約
 */

/**
 * ニュース記事を日本語で要約
 * @param title 記事のタイトル
 * @param content 記事の本文
 * @returns 日本語の要約
 */
export async function summarizeNews(title: string, content: string): Promise<string> {
  try {
    if (!title || !content) {
      return "要約を生成できませんでした。";
    }

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "あなたは日本語のニュース要約専門家です。与えられたニュース記事を、簡潔で分かりやすい日本語で要約してください。要約は2-3文程度で、最も重要な情報を含めてください。",
        },
        {
          role: "user",
          content: `以下のニュース記事を日本語で要約してください。\n\nタイトル: ${title}\n\n本文: ${content}`,
        },
      ],
    });

    const summary = response.choices[0]?.message?.content;
    if (typeof summary === "string" && summary.length > 0) {
      return summary;
    }

    return "要約を生成できませんでした。";
  } catch (error) {
    console.error("[Summarizer] Error summarizing news:", error);
    return "要約を生成できませんでした。";
  }
}

/**
 * YouTube動画の説明を日本語で要約
 * @param title 動画のタイトル
 * @param description 動画の説明
 * @returns 日本語の要約
 */
export async function summarizeYoutubeVideo(title: string, description: string): Promise<string> {
  try {
    if (!title || !description) {
      return "要約を生成できませんでした。";
    }

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "あなたはYouTube動画の説明を日本語で要約する専門家です。与えられた動画情報を、簡潔で分かりやすい日本語で要約してください。要約は1-2文程度で、動画の主要な内容を含めてください。",
        },
        {
          role: "user",
          content: `以下のYouTube動画を日本語で要約してください。\n\nタイトル: ${title}\n\n説明: ${description}`,
        },
      ],
    });

    const summary = response.choices[0]?.message?.content;
    if (typeof summary === "string" && summary.length > 0) {
      return summary;
    }

    return "要約を生成できませんでした。";
  } catch (error) {
    console.error("[Summarizer] Error summarizing YouTube video:", error);
    return "要約を生成できませんでした。";
  }
}
