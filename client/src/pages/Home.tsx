import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ExternalLink, TrendingUp } from "lucide-react";

interface NewsItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
}

interface SummaryItem {
  title: string;
  summary: string;
}

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  // tRPCでAIニュースを取得
  const { data: aiNewsData, isLoading, error } = trpc.rss.getAINews.useQuery();

  // 一般ニュース要約を取得
  const { data: generalNewsData, isLoading: generalLoading } =
    trpc.generalNews.getTodaySummaries.useQuery();

  const claudeNews: NewsItem[] = aiNewsData?.claude || [];
  const chatgptNews: NewsItem[] = aiNewsData?.chatgpt || [];
  const allAINews: NewsItem[] = aiNewsData?.allAI || [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const NewsCard = ({ item }: { item: NewsItem }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow border-border/50"
      onClick={() => setSelectedItem(item)}
    >
      <CardHeader>
        <CardTitle className="text-base line-clamp-2 text-foreground">{item.title}</CardTitle>
        <CardDescription className="text-muted-foreground">{formatDate(item.pubDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{item.contentSnippet}</p>
      </CardContent>
    </Card>
  );

  const SummarySection = ({ title, icon, summaries }: { title: string; icon: string; summaries: SummaryItem[] }) => {
    if (!summaries || summaries.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-accent">{icon} {title}</h3>
        <div className="space-y-2">
          {summaries.map((item, idx) => (
            <div key={idx} className="text-sm text-foreground/80 leading-relaxed">
              <span className="font-medium">{idx + 1}. {item.title}</span>
              <p className="text-xs text-foreground/60 mt-1">{item.summary}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b border-border bg-card/30 backdrop-blur">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-foreground">最新AI情報</h1>
          <p className="text-muted-foreground mt-2">Claude・ChatGPT・AI関連の最新ニュース</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container py-8">
        {/* 主要ニュース要約パネル */}
        {generalLoading ? (
          <div className="flex items-center justify-center py-6 mb-8">
            <Loader2 className="w-5 h-5 animate-spin text-accent mr-2" />
            <span className="text-muted-foreground">主要ニュースを読み込み中...</span>
          </div>
        ) : generalNewsData?.success && (Array.isArray(generalNewsData.economy) && generalNewsData.economy.length > 0 || Array.isArray(generalNewsData.technology) && generalNewsData.technology.length > 0) ? (
          <Card className="mb-8 border-accent/30 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg text-foreground">今日の主要ニュース</CardTitle>
              </div>
              <CardDescription>経済・最新技術の社会実装に関するニュース</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generalNewsData.economy && generalNewsData.economy.length > 0 && (
                <SummarySection title="経済ニュース" icon="📊" summaries={generalNewsData.economy} />
              )}

              {generalNewsData.technology && generalNewsData.technology.length > 0 && (
                <div className={generalNewsData.economy && generalNewsData.economy.length > 0 ? "pt-2 border-t border-border/50" : ""}>
                  <SummarySection title="最新技術" icon="🚀" summaries={generalNewsData.technology} />
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* AIニュース */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <span className="ml-2 text-muted-foreground">ニュースを読み込み中...</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">エラーが発生しました</h3>
              <p className="text-destructive/80 text-sm">ニュースの取得に失敗しました。後でもう一度試してください。</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card">
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="claude">Claude関連</TabsTrigger>
              <TabsTrigger value="chatgpt">ChatGPT関連</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {allAINews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ニュースがありません</p>
              ) : (
                <div className="grid gap-4">
                  {allAINews.map((item, index) => (
                    <NewsCard key={index} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="claude" className="space-y-4 mt-6">
              {claudeNews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ニュースがありません</p>
              ) : (
                <div className="grid gap-4">
                  {claudeNews.map((item, index) => (
                    <NewsCard key={index} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chatgpt" className="space-y-4 mt-6">
              {chatgptNews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ニュースがありません</p>
              ) : (
                <div className="grid gap-4">
                  {chatgptNews.map((item, index) => (
                    <NewsCard key={index} item={item} />
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
              <CardTitle className="text-foreground">{selectedItem.title}</CardTitle>
              <CardDescription>{formatDate(selectedItem.pubDate)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {selectedItem.content || selectedItem.contentSnippet}
                </p>
              </div>
              {selectedItem.link && (
                <a
                  href={selectedItem.link}
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
