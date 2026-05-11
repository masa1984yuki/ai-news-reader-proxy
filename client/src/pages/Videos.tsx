import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type Category = "Claude関連" | "ChatGPT関連" | "その他AI";

export default function Videos() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  // YouTube動画一覧を取得
  const { data: videosData, isLoading: videosLoading } = trpc.news.listVideos.useQuery({
    limit: 20,
    offset: 0,
    category: selectedCategory,
  });

  // カテゴリ一覧を取得
  const { data: categories } = trpc.news.getCategories.useQuery();

  // 選択された動画の詳細を取得
  const { data: selectedVideo } = trpc.news.getVideo.useQuery(
    { id: selectedVideoId! },
    { enabled: selectedVideoId !== null }
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI関連YouTube動画</h1>
          <p className="text-slate-600">Claude・ChatGPT関連の最新YouTube動画をお届けします</p>
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
          {/* 動画グリッド */}
          <div className="lg:col-span-2">
            {videosLoading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
              </div>
            ) : videosData?.videos && videosData.videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videosData.videos.map((video) => (
                  <Card
                    key={video.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                    onClick={() => setSelectedVideoId(video.id)}
                  >
                    <div className="relative aspect-video bg-slate-200 overflow-hidden group">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400">
                          <Play className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {video.channelTitle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getCategoryColor(video.category)}>
                          {video.category}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {video.publishedAt
                            ? format(new Date(video.publishedAt), "M月d日", { locale: ja })
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
                  <p className="text-slate-500">動画がまだ登録されていません</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 詳細表示パネル */}
          <div className="lg:col-span-1">
            {selectedVideo ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base line-clamp-2">{selectedVideo.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* YouTube埋め込み */}
                  <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-1">チャンネル</h4>
                    <p className="text-sm text-slate-600">{selectedVideo.channelTitle}</p>
                  </div>

                  {selectedVideo.description && (
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">説明</h4>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                        {selectedVideo.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Badge className={getCategoryColor(selectedVideo.category)}>
                      {selectedVideo.category}
                    </Badge>
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedVideo.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500 text-sm">動画を選択して詳細を表示</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
