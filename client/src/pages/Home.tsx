import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Sparkles, Newspaper, Video, Filter, Bell } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ナビゲーション */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">最新AI情報</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/news">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    ニュース
                  </Button>
                </Link>
                <Link href="/videos">
                  <Button variant="ghost" className="text-slate-300 hover:text-white">
                    動画
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  ログイン
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* ヒーロー */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            AI最新情報を
            <br />
            毎日お届け
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Claude・ChatGPT関連のニュースとYouTube動画を自動収集・要約。
            <br />
            エレガントなUIで、最新のAI情報をいつでも確認できます。
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex gap-4 justify-center">
            <Link href="/news">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                ニュースを見る
              </Button>
            </Link>
            <Link href="/videos">
              <Button size="lg" variant="outline" className="border-slate-400 text-white hover:bg-slate-800">
                動画を見る
              </Button>
            </Link>
          </div>
        ) : (
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
              ログインして始める
            </Button>
          </a>
        )}
      </div>

      {/* 特徴 */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Newspaper className="w-8 h-8 text-amber-400 mb-2" />
              <CardTitle className="text-white">自動収集</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                毎日自動でAIニュースを収集・更新。最新情報を見落としません。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-amber-400 mb-2" />
              <CardTitle className="text-white">AI要約</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                LLMが記事を日本語で要約。忙しい時も内容を素早く把握できます。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Video className="w-8 h-8 text-amber-400 mb-2" />
              <CardTitle className="text-white">動画対応</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                YouTube動画も自動収集。ニュースと動画を一箇所で確認できます。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Filter className="w-8 h-8 text-amber-400 mb-2" />
              <CardTitle className="text-white">フィルタリング</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Claude・ChatGPT・その他AIでカテゴリ分け。興味のある情報だけ見られます。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 対応カテゴリ */}
      <div className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">対応カテゴリ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
            <h4 className="text-lg font-bold text-white mb-2">Claude関連</h4>
            <p className="text-purple-200">
              AnthropicのClaudeに関する最新ニュース、アップデート、使用例を配信します。
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-700">
            <h4 className="text-lg font-bold text-white mb-2">ChatGPT関連</h4>
            <p className="text-green-200">
              OpenAIのChatGPTに関する最新情報、機能追加、プラグイン情報をお届けします。
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
            <h4 className="text-lg font-bold text-white mb-2">その他AI</h4>
            <p className="text-blue-200">
              Google Gemini、Copilot、その他のAIツールの最新情報も配信します。
            </p>
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 最新AI情報. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
