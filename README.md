# おでかけ記録

出かけたスポットを写真、位置、感想、ラベルとともに保存するWebアプリです。フェーズ4まで完了し、フェーズ5のローカル実装と自動テストまで完了しています。

デプロイ、バックアップ、復元、監視については[`docs/deployment-and-operations.md`](docs/deployment-and-operations.md)を参照してください。

## 必要なもの

- Docker
- Docker Compose

ホストにNode.jsやPostgreSQLをインストールする必要はありません。

## 開発環境の起動

初回起動前に`.env.example`を`.env`へコピーし、`POSTGRES_PASSWORD`、`AUTH_PASSWORD`、`AUTH_SECRET`を設定してください。

```bash
docker compose up --build
```

- アプリ: <http://localhost:3000>
- DB接続確認: <http://localhost:3000/api/health>

地図表示にはインターネット接続が必要です。開発環境ではOpenStreetMapの標準タイルを使用しています。本番公開前に、利用規模と規約に合うタイルサービスへ切り替えてください。

スポット名称検索とGoogle Maps埋め込みに関する設定は`config.md`を参照してください。Google Maps Embed APIキーが未設定でも、名称検索、座標入力、保存などの基本機能は利用できます。

ソースコードを変更した場合は、次のコマンドでアプリイメージを再ビルドして起動します。この方式はホスト側のパス共有設定に依存しません。

```bash
docker compose up --build app
```

## 初回マイグレーション

別のターミナルで実行します。

```bash
docker compose exec app npm run db:deploy
```

開発中にスキーマを変更し、新しいマイグレーションを作る場合は次を実行します。

```bash
docker compose exec app npm run db:migrate -- --name change_name
```

## 検証

```bash
docker compose run --rm app npm test
docker compose run --rm app npm run lint
docker compose run --rm app npm run build
```

## 環境変数

Docker Composeの起動前に、`.env.example`を参考に`.env`を作成し、`POSTGRES_PASSWORD`、`AUTH_PASSWORD`、`AUTH_SECRET`を設定してください。ホストからDBへ接続する場合は、`DATABASE_URL`にも同じDBパスワードを設定します。`.env`はGitの管理対象外です。

本番環境では、推測困難なDBパスワードをデプロイ先の秘密情報管理機能から設定してください。
