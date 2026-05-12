import { collectAndSummarizeGeneralNews } from "../services/generalNewsService";
import { notifyOwner } from "../_core/notification";

/**
 * 毎日14:00に実行：一般ニュース（経済・技術）を取得し、LLMで要約を生成・保存
 */
export async function handleGeneralNewsSummary(req: any, res: any) {
  try {
    console.log("[General News Summary] Handler triggered");

    // 一般ニュースを取得・要約・保存
    await collectAndSummarizeGeneralNews();

    // オーナーに通知
    await notifyOwner({
      title: "一般ニュース要約が更新されました",
      content: "本日の経済・技術ニュースの要約が生成されました。",
    });

    res.json({ success: true, message: "General news summary updated" });
  } catch (error) {
    console.error("[General News Summary] Error:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
}
