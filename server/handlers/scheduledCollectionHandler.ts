import { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { runCollectionTask } from "../services/scheduler";

/**
 * 定期実行タスク用ハンドラー
 * /api/scheduled/collection エンドポイント
 * 毎日定時にニュース・動画を収集・要約・保存
 */

export async function scheduledCollectionHandler(req: Request, res: Response) {
  try {
    // Cron認証チェック
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    console.log(`[Scheduled Collection] Starting collection task (taskUid: ${user.taskUid})`);

    // ニュース・動画収集タスクを実行
    await runCollectionTask();

    console.log(`[Scheduled Collection] Collection task completed successfully`);

    return res.json({
      ok: true,
      message: "Collection task completed successfully",
      taskUid: user.taskUid,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Scheduled Collection] Error during collection task:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";

    return res.status(500).json({
      error: "Collection task failed",
      message: errorMessage,
      stack: errorStack,
      context: {
        url: req.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
