# デプロイ・運用手順

## 公開前チェック

- `.env`の`AUTH_USERNAME`と`AUTH_PASSWORD`を開発用既定値から変更する
- `AUTH_SECRET`へ32バイト以上のランダム値を設定する
- HTTPSのリバースプロキシまたはホスティング環境を使用する
- PostgreSQLとR2バケットを外部公開せず、アプリからだけ接続できるようにする
- R2の`Object Read & Write`トークンを写真用バケットのみに限定し、本番環境の秘密情報管理に登録する
- Google Mapsのキーを設定する場合はHTTPリファラーとAPIを制限する
- `NOMINATIM_USER_AGENT`へ実在する連絡先を設定する

## デプロイ

1. 本番用環境変数を安全なシークレット管理へ登録する。
2. Dockerfileの`production`ターゲットをビルドする。
3. リリース前に`npx prisma migrate deploy`を一度実行する。
4. `R2_ACCOUNT_ID`、`R2_BUCKET_NAME`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`を設定し、既存のローカル写真があれば同じオブジェクトキーでR2へ移行する。
5. 起動後に`GET /api/health`がHTTP 200と`database: connected`を返すことを確認する。

## バックアップ

少なくとも日次でPostgreSQLの`pg_dump`とR2バケット内の写真を同じ世代として別の保存先へバックアップする。

```powershell
docker compose exec -T db pg_dump -U diary -d diary -Fc > backup/diary.dump
```

写真はR2バケットから別の保存先へ複製する。バックアップの世代数と保持期間を運用環境で決める。既存のDocker写真ボリュームはR2への移行を確認するまで削除しない。

## 復元確認

本番DBへ直接復元せず、隔離した検証用DBで定期的に確認する。

```powershell
pg_restore --clean --if-exists --no-owner -d diary_restore backup/diary.dump
```

同じ世代の写真を配置し、詳細画像とサムネイルが表示できることを確認する。

## 監視

- 1分から5分間隔で`GET /api/health`を監視する
- HTTP 5xx、プロセス再起動回数、DB容量、R2の保存容量と操作回数を通知対象にする
- `Place search failed`と`Photo upload failed`をログ収集対象にする
- Nominatimの403・429が継続する場合は商用サービスまたはセルフホストへ切り替える

## 既知の依存関係警告

2026-10-03時点で`npm audit`はLint用依存関係の`braces`に高リスク警告を報告する。最新版3.0.3にも修正版がなく、npmの提案はNext.js 16と互換性のない`eslint-config-next` 14へのダウングレードである。本番ランタイム依存ではないため現状維持とし、修正版公開後に更新する。
