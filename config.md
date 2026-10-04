# 外部サービス設定

## 設定方法

プロジェクト直下に`.env`を作成し、`.env.example`を参考に値を設定する。`.env`はGit管理対象外である。

設定を変更した後はコンテナを再作成する。

```bash
docker compose up -d --force-recreate app
```

## スポット名称検索

初期設定では、OpenStreetMapの公開Nominatimを検索ボタンから利用する。公開サービスの利用規約に従い、逐次オートコンプリートは行わず、サーバー側で1秒に1回以下へ制限し、結果を一時キャッシュする。

`NOMINATIM_USER_AGENT`にはアプリ名と、管理者へ連絡可能なメールアドレスまたはURLを設定する。

```env
NOMINATIM_BASE_URL="https://nominatim.openstreetmap.org"
NOMINATIM_USER_AGENT="outing-diary/0.1 (contact: you@example.com)"
```

利用者や検索回数が増える場合は、公開Nominatimではなく、商用のジオコーディングサービスまたはセルフホスト環境へ切り替える。

## Google Maps Embed API

スポット詳細へGoogle Mapsを埋め込む場合にだけ設定する。未設定でもアプリは動作し、代わりにGoogle Mapsを別画面で開くリンクを表示する。

1. Google Cloudでプロジェクトを作成する
2. Maps Embed APIを有効にする
3. Embed専用APIキーを作成する
4. API制限を「Maps Embed APIのみ」にする
5. Webサイト制限へ利用元を登録する

開発環境の例：

```text
http://localhost:3000/*
http://127.0.0.1:3000/*
```

`.env`へキーを設定する。

```env
GOOGLE_MAPS_EMBED_API_KEY="取得したEmbed専用キー"
```

このキーはiframeのURLに含まれ、ブラウザから閲覧可能である。Places APIなどのキーと共用せず、必ずAPI制限とWebサイト制限を設定する。

## ログイン設定

公開前に`.env`へ推測困難なユーザー名、パスワード、署名用シークレットを設定する。`AUTH_SECRET`は32バイト以上のランダム値を推奨する。

```env
AUTH_USERNAME="diary"
AUTH_PASSWORD="推測困難なパスワード"
AUTH_SECRET="32バイト以上のランダム値"
AUTH_OWNER_ID="owner"
```

設定変更後はアプリコンテナを再作成する。Docker Composeで使う認証情報は`.env`に設定し、公開環境では秘密情報管理機能から設定する。
