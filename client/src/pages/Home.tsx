import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface NewsItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
}

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  // tRPCでAIニュースを取得
  const { data: aiNewsData, isLoading, error } = trpc.rss.getAINews.useQuery();

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
              <p className="text-destructive/80 text-sm">
                {error instanceof Error ? error.message : "ニュースの取得に失敗しました。後でもう一度試してください。"}
              </p>
            </div>
          </div>
        )}

        {!isLoading && (claudeNews.length > 0 || chatgptNews.length > 0 || allAINews.length > 0) && (
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
                  {allAINews.map((item, idx) => (
                    <NewsCard key={`all-${idx}`} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="claude" className="space-y-4 mt-6">
              {claudeNews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ニュースがありません</p>
              ) : (
                <div className="grid gap-4">
                  {claudeNews.map((item, idx) => (
                    <NewsCard key={`claude-${idx}`} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chatgpt" className="space-y-4 mt-6">
              {chatgptNews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">ニュースがありません</p>
              ) : (
                <div className="grid gap-4">
                  {chatgptNews.map((item, idx) => (
                    <NewsCard key={`chatgpt-${idx}`} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!isLoading && claudeNews.length === 0 && chatgptNews.length === 0 && allAINews.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">ニュースを読み込めませんでした</p>
          </div>
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
