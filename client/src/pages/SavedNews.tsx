import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ExternalLink, Calendar } from "lucide-react";

interface SavedArticle {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  sourceUrl: string;
  sourceName: string | null;
  category: "Claude関連" | "ChatGPT関連" | "その他AI";
  publishedAt: Date | null;
  collectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  summary: string | null;
  imageUrl: string | null;
}

export default function SavedNews() {
  const [selectedItem, setSelectedItem] = useState<SavedArticle | null>(null);
  const [daysBack, setDaysBack] = useState(7);

  // 保存されたニュースを取得
  const { data: allArticles, isLoading: allLoading, error: allError } = trpc.newsArticles.getSavedArticles.useQuery({
    category: "すべて",
    daysBack,
  });

  const { data: claudeArticles, isLoading: claudeLoading, error: claudeError } =
    trpc.newsArticles.getSavedArticles.useQuery({
      category: "Claude関連",
      daysBack,
    });

  const { data: chatgptArticles, isLoading: chatgptLoading, error: chatgptError } =
    trpc.newsArticles.getSavedArticles.useQuery({
      category: "ChatGPT関連",
      daysBack,
    });

  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(date);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Claude関連":
        return "bg-blue-500/20 text-blue-300";
      case "ChatGPT関連":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-purple-500/20 text-purple-300";
    }
  };

  const ArticleCard = ({ item }: { item: SavedArticle }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow border-border/50"
      onClick={() => setSelectedItem(item)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2 text-foreground flex-1">
            {item.title}
          </CardTitle>
          <Badge className={getCategoryBadgeColor(item.category)}>{item.category}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2 mt-2">
          <Calendar className="w-4 h-4" />
          {formatDate(item.collectedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b border-border bg-card/30 backdrop-blur">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-foreground">保存されたニュース</h1>
          <p className="text-muted-foreground mt-2">過去のAI関連ニュース記事</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container py-8">
        {/* 日付フィルタ */}
        <div className="mb-6 flex gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setDaysBack(days)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                daysBack === days
                  ? "bg-accent text-accent-foreground"
                  : "bg-card border border-border text-foreground hover:bg-card/80"
              }`}
            >
              過去{days}日間
            </button>
          ))}
        </div>

        {/* ニュースタブ */}
        {(allLoading || claudeLoading || chatgptLoading) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <span className="ml-2 text-muted-foreground">ニュースを読み込み中...</span>
          </div>
        )}

        {allError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">エラーが発生しました</h3>
              <p className="text-destructive/80 text-sm">
                {allError instanceof Error ? allError.message : "ニュースの取得に失敗しました。後でもう一度試してください。"}
              </p>
            </div>
          </div>
        )}

        {!allLoading && !claudeLoading && !chatgptLoading && !allError && !claudeError && !chatgptError && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card">
              <TabsTrigger value="all">
                すべて ({allArticles?.totalCount || 0})
              </TabsTrigger>
              <TabsTrigger value="claude">
                Claude関連 ({claudeArticles?.totalCount || 0})
              </TabsTrigger>
              <TabsTrigger value="chatgpt">
                ChatGPT関連 ({chatgptArticles?.totalCount || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {(allArticles?.articles || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ニュースがありません</p>
              ) : (
                <div className="grid gap-4">
                  {(allArticles?.articles || []).map((item) => (
                    <ArticleCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="claude" className="space-y-4 mt-6">
              {(claudeArticles?.articles || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ニュースがありません</p>
              ) : (
                <div className="grid gap-4">
                  {(claudeArticles?.articles || []).map((item) => (
                    <ArticleCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chatgpt" className="space-y-4 mt-6">
              {(chatgptArticles?.articles || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ニュースがありません</p>
              ) : (
                <div className="grid gap-4">
                  {(chatgptArticles?.articles || []).map((item) => (
                    <ArticleCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* 詳細表示モーダル */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-foreground flex-1">{selectedItem.title}</CardTitle>
                <Badge className={getCategoryBadgeColor(selectedItem.category)}>
                  {selectedItem.category}
                </Badge>
              </div>
              <CardDescription className="mt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    保存日時: {formatDate(selectedItem.collectedAt)}
                  </div>
                  {selectedItem.publishedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      公開日時: {formatDate(selectedItem.publishedAt)}
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {selectedItem.content || selectedItem.description}
                </p>
              </div>
              {selectedItem.sourceUrl && (
                <a
                  href={selectedItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors"
                >
                  元記事を読む
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
