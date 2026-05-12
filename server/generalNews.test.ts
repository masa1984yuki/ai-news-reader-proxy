import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { dailySummaries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("generalNews.getTodaySummaries", () => {
  let db: Awaited<ReturnType<typeof getDb>> | null = null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // テスト用のサマリーデータを挿入
    await db.delete(dailySummaries).where(eq(dailySummaries.summaryDate, today));

    const testSummaries = [
      {
        title: "テスト経済ニュース1",
        summary: "テスト経済要約1",
      },
      {
        title: "テスト経済ニュース2",
        summary: "テスト経済要約2",
      },
      {
        title: "テスト経済ニュース3",
        summary: "テスト経済要約3",
      },
    ];

    await db.insert(dailySummaries).values({
      summaryDate: today,
      summaries: JSON.stringify(testSummaries),
      sourceType: "economy",
    });

    const techSummaries = [
      {
        title: "テスト技術ニュース1",
        summary: "テスト技術要約1",
      },
      {
        title: "テスト技術ニュース2",
        summary: "テスト技術要約2",
      },
    ];

    await db.insert(dailySummaries).values({
      summaryDate: today,
      summaries: JSON.stringify(techSummaries),
      sourceType: "technology",
    });

    const generalSummaries = [
      {
        title: "テスト一般ニュース1",
        summary: "テスト一般要約1",
      },
      {
        title: "テスト一般ニュース2",
        summary: "テスト一般要約2",
      },
    ];

    await db.insert(dailySummaries).values({
      summaryDate: today,
      summaries: JSON.stringify(generalSummaries),
      sourceType: "general",
    });
  });

  afterAll(async () => {
    if (db) {
      await db.delete(dailySummaries).where(eq(dailySummaries.summaryDate, today));
    }
  });

  it("returns today's summaries with all three categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.generalNews.getTodaySummaries();

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.economy).toBeDefined();
    expect(result.technology).toBeDefined();
    expect(result.general).toBeDefined();
  });

  it("returns economy summaries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.generalNews.getTodaySummaries();

    expect(result.economy).toHaveLength(3);
    expect(result.economy[0]).toMatchObject({
      title: "テスト経済ニュース1",
      summary: "テスト経済要約1",
    });
  });

  it("returns technology summaries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.generalNews.getTodaySummaries();

    expect(result.technology).toHaveLength(2);
    expect(result.technology[0]).toMatchObject({
      title: "テスト技術ニュース1",
      summary: "テスト技術要約1",
    });
  });

  it("returns general summaries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.generalNews.getTodaySummaries();

    expect(result.general).toHaveLength(2);
    expect(result.general[0]).toMatchObject({
      title: "テスト一般ニュース1",
      summary: "テスト一般要約1",
    });
  });
});
