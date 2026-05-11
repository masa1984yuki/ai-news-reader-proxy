import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type Category = "Claude関連" | "ChatGPT関連" | "その他AI";

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  // ニュース一覧を取得
  const { data: newsData, isLoading: newsLoading } = trpc.news.listArticles.useQuery({
    limit: 20,
    offset: 0,
    category: selectedCategory,
  });

  // カテゴリ一覧を取得
  const { data: categories } = trpc.news.getCategories.useQuery();

  // 選択されたニュース記事の詳細を取得
  const { data: selectedArticle } = trpc.news.getArticle.useQuery(
    { id: selectedArticleId! },
    { enabled: selectedArticleId !== null }
  );

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case "Claude関連":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "ChatGPT関連":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "その他AI":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">最新AI情報</h1>
          <p className="text-slate-600">Claude・ChatGPT関連の最新ニュースをお届けします</p>
        </div>

        {/* カテゴリフィルター */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === undefined ? "default" : "outline"}
            onClick={() => setSelectedCategory(undefined)}
            className="rounded-full"
          >
            すべて
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.value as Category)}
              className={`rounded-full ${
                selectedCategory === cat.value ? getCategoryColor(cat.value as Category) : ""
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ニュースリスト */}
          <div className="lg:col-span-2">
            {newsLoading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
              </div>
            ) : newsData?.articles && newsData.articles.length > 0 ? (
              <div className="space-y-4">
                {newsData.articles.map((article) => (
                  <Card
                    key={article.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedArticleId(article.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                          <CardDescription className="mt-2 line-clamp-2">
                            {article.description || article.summary}
                          </CardDescription>
                        </div>
                        {article.imageUrl && (
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getCategoryColor(article.category)}>
                          {article.category}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {article.publishedAt
                            ? format(new Date(article.publishedAt), "yyyy年M月d日", { locale: ja })
                            : "日付不明"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500">ニュースがまだ登録されていません</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 詳細表示パネル */}
          <div className="lg:col-span-1">
            {selectedArticle ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base">{selectedArticle.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedArticle.imageUrl && (
                    <img
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}

                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">要約</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedArticle.summary || selectedArticle.description}
                    </p>
                  </div>

                  {selectedArticle.content && (
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">本文</h4>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                        {selectedArticle.content}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Badge className={getCategoryColor(selectedArticle.category)}>
                      {selectedArticle.category}
                    </Badge>
                    <a
                      href={selectedArticle.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      元記事 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500 text-sm">ニュースを選択して詳細を表示</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
