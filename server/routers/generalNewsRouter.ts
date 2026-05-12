import { publicProcedure, router } from "../_core/trpc";
import { getTodaySummaries } from "../services/generalNewsService";

export const generalNewsRouter = router({
  /**
   * 今日の要約を取得
   */
  getTodaySummaries: publicProcedure.query(async () => {
    return await getTodaySummaries();
  }),
});
