# API調査結果

## ニュース収集API

### 比較対象
- **NewsAPI.org**: 150,000以上のニュースソース、14言語、55カ国対応。シンプルで使いやすい。無料プランあり。
- **NewsData.io**: 92,134以上のニュースソース、89言語、206カ国対応。AI要約・タグ・センチメント分析機能が充実。無料プランで200クレジット/日。
- **NewsAPI.ai**: 150,000以上のニュースソース、60言語対応。AI分析（センチメント、エンティティ抽出、イベントクラスタリング）が強力。有料のみ。

### 選定: **NewsData.io**
**理由:**
1. 無料プランが充実（200クレジット/日）
2. AI要約機能が標準搭載されている
3. ドキュメントが明確で実装しやすい
4. 多言語・多国対応で拡張性が高い
5. キーワード検索、フィルタリング機能が豊富

## YouTube動画収集API

### YouTube Data API v3
- Google公式API
- 動画検索、チャンネル情報、プレイリスト取得が可能
- 無料クォータあり（1日100万ユニット）
- 検索結果にはvideoId、title、description、thumbnail、publishedAtなどが含まれる

### 選定: **YouTube Data API v3**
**理由:**
1. 公式で信頼性が高い
2. 豊富な検索パラメータ
3. サムネイル画像が複数解像度で取得可能
4. 無料クォータで十分な規模の収集が可能

## 実装方針

### ニュース収集
- NewsData.ioのREST APIを使用
- 検索キーワード: "Claude", "ChatGPT", "Anthropic", "OpenAI"
- 毎日定時に実行し、新着記事を自動収集
- AI要約機能を活用して日本語要約を取得

### YouTube動画収集
- YouTube Data API v3を使用
- 検索キーワード: "Claude AI", "ChatGPT", "Anthropic Claude", "OpenAI ChatGPT"
- 毎日定時に実行し、新着動画を自動収集
- サムネイル画像URLを保存

### カテゴリ判定
- 記事・動画のタイトル・説明文からキーワードマッチングでカテゴリを自動判定
- "Claude"を含む → 「Claude関連」
- "ChatGPT" or "OpenAI"を含む → 「ChatGPT関連」
- その他 → 「その他AI」

## 必要な環境変数
- `NEWSDATA_API_KEY`: NewsData.io APIキー
- `YOUTUBE_API_KEY`: YouTube Data API v3キー
