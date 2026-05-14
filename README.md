# Latest AI News Reader 🤖📰

最新の AI ニュース（Claude、ChatGPT、AI 関連）を自動収集・要約し、AI 最適化された音声読み上げ機能で提供するニュースアグリゲーターアプリケーションです。

## ✨ 主な機能

### 📰 ニュース収集・表示
- **複数カテゴリ対応**：Claude 関連、ChatGPT 関連、全 AI 関連ニュースを自動分類
- **20 記事表示**：各カテゴリから最新 20 件のニュースを表示
- **ソース元リンク**：すべての記事にソース元への直接リンクを提供
- **詳細表示**：クリックで記事の詳細情報をモーダル表示

### 🔊 AI 最適化音声読み上げ
- **自然な日本語音声**：Web Speech API を使用した高品質な女性音声
- **AI テキスト最適化**：LLM を使用してテキストを読みやすく最適化
  - 難しい用語への振り仮名自動付与
  - 自然な句読点と言い回し
  - 読み上げに最適なテキスト変換
- **個別読み上げ**：各ニュースカードの「🔊 読み上げ」ボタンで個別再生
- **一括読み上げ**：「すべて読み上げ」ボタンで全ニュースを連続再生
- **再生制御**：読み上げ中は「⏹ 停止」ボタンで停止可能

### 📊 拡張ニュース情報
- **経済ニュース**：金融・経済関連の最新情報
- **最新技術**：テクノロジー・AI 技術の最新動向
- **一般ニュース**：政治・国際・社会ニュース
- **LLM 要約**：各セクションの主要ニュースを AI で要約

### 🌐 ユーザーフレンドリー
- **ログイン不要**：誰でも自由にアクセス可能
- **ダークテーマ**：目に優しいダークテーマデザイン
- **レスポンシブ**：PC・タブレット・スマートフォン対応
- **リアルタイム更新**：毎日自動で最新ニュースに更新

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | React 19、Tailwind CSS 4、shadcn/ui |
| **バックエンド** | Express 4、tRPC 11、Node.js |
| **データベース** | MySQL/TiDB（Drizzle ORM） |
| **音声処理** | Web Speech API、Manus LLM |
| **テスト** | Vitest |
| **ビルド** | Vite、TypeScript |

## 📋 プロジェクト構成

```
latest-ai-news/
├── client/                    # フロントエンド
│   ├── src/
│   │   ├── pages/            # ページコンポーネント
│   │   │   └── Home.tsx      # メインページ（ニュース表示・音声読み上げ）
│   │   ├── components/       # UI コンポーネント
│   │   ├── lib/
│   │   │   └── trpc.ts       # tRPC クライアント設定
│   │   └── App.tsx           # ルーティング・レイアウト
│   └── index.html
├── server/                    # バックエンド
│   ├── routers.ts            # tRPC ルーター（ニュース取得・音声最適化）
│   ├── db.ts                 # データベースクエリ
│   ├── services/
│   │   └── generalNewsService.ts  # 一般ニュース取得・要約
│   └── _core/                # フレームワーク（OAuth、LLM など）
├── drizzle/
│   └── schema.ts             # データベーススキーマ
├── scripts/
│   └── fetch-ai-news.mjs     # ニュース収集スクリプト
└── package.json
```

## 🚀 セットアップ・実行

### 前提条件
- Node.js 22.13.0 以上
- pnpm 9.0 以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/masa1984yuki/ai-news-reader-proxy.git
cd ai-news-reader-proxy

# 依存関係をインストール
pnpm install
```

### 環境変数設定

`.env` ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース
DATABASE_URL=mysql://user:password@host:port/database

# OAuth（Manus）
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# LLM・API
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key

# セッション
JWT_SECRET=your_jwt_secret

# その他
OWNER_NAME=your_name
OWNER_OPEN_ID=your_open_id
```

### 開発サーバー起動

```bash
# 開発サーバーを起動
pnpm run dev

# ブラウザで http://localhost:3000 にアクセス
```

### テスト実行

```bash
# Vitest でテストを実行
pnpm test

# カバレッジ付きでテストを実行
pnpm test:coverage
```

### ビルド

```bash
# 本番用にビルド
pnpm run build

# ビルド結果を確認
pnpm run preview
```

## 📱 使用方法

### ニュースを読む
1. ホームページを開く
2. 「すべて」「Claude 関連」「ChatGPT 関連」タブから選択
3. ニュースカードをクリックして詳細表示
4. 「ソース元へ」リンクで元記事を確認

### 音声読み上げ機能を使用
1. ニュースカードの「🔊 読み上げ」ボタンをクリック
2. 自然な日本語女性音声で読み上げが開始
3. 読み上げ中は「⏹ 停止」ボタンで停止可能
4. 「すべて読み上げ」ボタンで全ニュースを連続再生

### 保存済みニュースを確認
1. 「保存済みニュース」タブをクリック
2. 以前に保存したニュースを表示

## 🔄 自動更新

このアプリケーションは毎日 14:00（日本時間）に自動でニュースを収集・更新します。

- **AI ニュース**：Google News RSS フィード から自動取得
- **経済・技術・一般ニュース**：複数ソースから自動取得
- **LLM 要約**：Manus LLM を使用して自動生成

## 📊 テスト

プロジェクトには以下のテストが含まれています：

- **認証テスト**：ログアウト機能
- **ニュース取得テスト**：一般ニュース収集・要約
- **UI テスト**：コンポーネント動作確認

```bash
# すべてのテストを実行
pnpm test

# 特定のテストファイルを実行
pnpm test server/generalNews.test.ts

# ウォッチモードでテストを実行
pnpm test --watch
```

## 🤝 貢献

このプロジェクトへの貢献を歓迎します！

1. Fork してください
2. Feature ブランチを作成してください（`git checkout -b feature/AmazingFeature`）
3. 変更をコミットしてください（`git commit -m 'Add some AmazingFeature'`）
4. ブランチにプッシュしてください（`git push origin feature/AmazingFeature`）
5. Pull Request を作成してください

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 📞 サポート

問題が発生した場合や機能提案がある場合は、[GitHub Issues](https://github.com/masa1984yuki/ai-news-reader-proxy/issues) で報告してください。

## 🙏 謝辞

- [Manus](https://manus.im) - AI ツール・LLM 統合
- [Google News](https://news.google.com) - ニュースフィード
- [React](https://react.dev) - UI フレームワーク
- [Tailwind CSS](https://tailwindcss.com) - スタイリング
- [tRPC](https://trpc.io) - 型安全 RPC

---

**Made with ❤️ by masa1984yuki**

最新版：2026 年 5 月 14 日
