import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ExternalLink, TrendingUp, Volume2, Square } from "lucide-react";

interface NewsItem {
  title?: string;
  link?: string;
  sourceUrl?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
}

interface SummaryItem {
  title: string;
  summary: string;
  sourceUrl?: string;
}

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingItemIndex, setSpeakingItemIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [allSpeakingIndex, setAllSpeakingIndex] = useState<number | null>(null);
  const [optimizationCache, setOptimizationCache] = useState<Record<string, string>>({});

  // tRPCでAIニュースを取得
  const { data: aiNewsData, isLoading, error } = trpc.rss.getAINews.useQuery();

  // 一般ニュース要約を取得
  const { data: generalNewsData, isLoading: generalLoading } =
    trpc.generalNews.getTodaySummaries.useQuery();

  // LLM 最適化エンドポイント
  const optimizeTextMutation = trpc.news.optimizeTextForSpeech.useMutation();

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

  const handleSpeak = async (text: string, index: number, title?: string) => {
    if (isSpeaking && speakingItemIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingItemIndex(null);
      return;
    }

    // 他の読み上げを停止
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }

    // LLM で最適化されたテキストをキャッシュから取得
    const cacheKey = `${title || text}`;
    let optimizedText = optimizationCache[cacheKey];

    if (!optimizedText) {
      try {
        const result = await optimizeTextMutation.mutateAsync({
          title: title || "記事",
          text: text,
        });
        if (result.success) {
          optimizedText = `${result.optimizedTitle}。${result.optimizedText}`;
          setOptimizationCache((prev) => ({
            ...prev,
            [cacheKey]: optimizedText,
          }));
        } else {
          optimizedText = text;
        }
      } catch (error) {
        console.error("Error optimizing text:", error);
        optimizedText = text;
      }
    }

    const utterance = new SpeechSynthesisUtterance(optimizedText);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;  // より自然なスピード
    utterance.pitch = 1.0; // より自然なピッチ
    utterance.volume = 1;

    // 高品質な日本語音声を選択
    const voices = window.speechSynthesis.getVoices();
    // Google Chromeの高品質音声を優先
    let selectedVoice = voices.find(
      (voice) => voice.lang === "ja-JP" && voice.name.includes("Google")
    );
    // Googleがない場合は女性の声を探す
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (voice) => voice.lang.includes("ja") && voice.name.includes("Female")
      );
    }
    // それでもない場合は日本語の任意の音声
    if (!selectedVoice) {
      selectedVoice = voices.find((voice) => voice.lang.includes("ja"));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingItemIndex(index);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingItemIndex(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingItemIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };
  const handleSpeakAll = (newsItems: NewsItem[]) => {
    if (isPlayingAll) {
      window.speechSynthesis.cancel();
      setIsPlayingAll(false);
      setAllSpeakingIndex(null);
      return;
    }

    const speakNextItem = (index: number) => {
      if (index >= newsItems.length) {
        setIsPlayingAll(false);
        setAllSpeakingIndex(null);
        return;
      }

      const item = newsItems[index];
      const text = `${item.title}。${item.contentSnippet || ""}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.9;  // より自然なスピード
      utterance.pitch = 1.0; // より自然なピッチ
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      // Google Chromeの高品質音声を優先
      let selectedVoice = voices.find(
        (voice) => voice.lang === "ja-JP" && voice.name.includes("Google")
      );
      // Googleがない場合は女性の声を探す
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (voice) => voice.lang.includes("ja") && voice.name.includes("Female")
        );
      }
      // それでもない場合は日本語の任意の音声
      if (!selectedVoice) {
        selectedVoice = voices.find((voice) => voice.lang.includes("ja"));
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsPlayingAll(true);
        setAllSpeakingIndex(index);
      };
      utterance.onend = () => {
        speakNextItem(index + 1);
      };
      utterance.onerror = () => {
        setIsPlayingAll(false);
        setAllSpeakingIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextItem(0);
  };

  const NewsCard = ({ item, index }: { item: NewsItem; index: number }) => {
    const sourceUrl = item.link || item.sourceUrl;
    const isCurrentSpeaking = isSpeaking && speakingItemIndex === index;
    const textToSpeak = `${item.title}。${item.contentSnippet || ""}`;

    return (
      <Card className="border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setSelectedItem(item)}
        >
          <CardTitle className="text-base line-clamp-2 text-foreground">{item.title}</CardTitle>
          <CardDescription className="text-muted-foreground">{formatDate(item.pubDate)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-5">{item.contentSnippet}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(textToSpeak, index);
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors ${
                  isCurrentSpeaking
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    : "bg-accent/10 text-accent hover:bg-accent/20"
                }`}
              >
                {isCurrentSpeaking ? (
                  <>
                    <Square className="w-3 h-3" />
                    停止
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3" />
                    読み上げ
                  </>
                )}
              </button>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded transition-colors"
                >
                  ソース元へ
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  ソース元
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
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
        ) : generalNewsData?.success && (Array.isArray(generalNewsData.economy) && generalNewsData.economy.length > 0 || Array.isArray(generalNewsData.technology) && generalNewsData.technology.length > 0 || Array.isArray(generalNewsData.general) && generalNewsData.general.length > 0) ? (
          <Card className="mb-8 border-accent/30 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg text-foreground">📊 今日の主要ニュース</CardTitle>
              </div>
              <CardDescription>経済・最新技術・社会ニュースの最重要情報</CardDescription>
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

              {generalNewsData.general && generalNewsData.general.length > 0 && (
                <div className={(generalNewsData.economy && generalNewsData.economy.length > 0) || (generalNewsData.technology && generalNewsData.technology.length > 0) ? "pt-2 border-t border-border/50" : ""}>
                  <SummarySection title="一般ニュース" icon="🌍" summaries={generalNewsData.general} />
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
          <div className="space-y-4">
            <button
              onClick={() => handleSpeakAll(allAINews)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                isPlayingAll
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                  : "bg-accent/10 text-accent hover:bg-accent/20"
              }`}
            >
              {isPlayingAll ? (
                <>
                  <Square className="w-4 h-4" />
                  すべて停止
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  すべて読み上げ
                </>
              )}
            </button>
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
                    <NewsCard key={index} item={item} index={index} />
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
                    <NewsCard key={index} item={item} index={index} />
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
                    <NewsCard key={index} item={item} index={index} />
                  ))}
                </div>
              )}
              </TabsContent>
            </Tabs>
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
              <CardDescription className="text-muted-foreground">{formatDate(selectedItem.pubDate)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">{selectedItem.content || selectedItem.contentSnippet}</p>
              {(selectedItem.link || selectedItem.sourceUrl) && (
                <a
                  href={selectedItem.link || selectedItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
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
