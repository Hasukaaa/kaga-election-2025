# GitHub Pages 公開手順書

## 概要

この手順書では、完成した加賀市議会議員選挙特設サイトをGitHub Pagesで公開する方法を説明します。

## 事前準備

### 必要なもの
- GitHubアカウント
- 完成したウェブサイトファイル一式
- Googleスプレッドシートの公開URL

## ステップ1: GitHubリポジトリの作成

### 1-1. 新しいリポジトリを作成
1. GitHub（https://github.com）にログイン
2. 右上の「+」ボタンから「New repository」を選択
3. リポジトリ名を入力（例：`kaga-election-2025`）
4. 「Public」を選択（GitHub Pagesで公開するため）
5. 「Add a README file」にチェック
6. 「Create repository」をクリック

### 1-2. リポジトリの設定
1. 作成されたリポジトリページで「Settings」タブをクリック
2. 左サイドバーの「Pages」をクリック
3. 「Source」で「Deploy from a branch」を選択
4. 「Branch」で「main」を選択
5. フォルダは「/ (root)」を選択
6. 「Save」をクリック

## ステップ2: ファイルのアップロード

### 2-1. ウェブインターフェースでのアップロード
1. リポジトリのメインページで「uploading an existing file」をクリック
2. 以下のファイルをドラッグ&ドロップまたは選択してアップロード：
   - `index.html`
   - `css/style.css`
   - `js/main.js`
   - `README.md`
   - `DEPLOYMENT.md`（この手順書）

### 2-2. Git コマンドラインでのアップロード（上級者向け）
```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/kaga-election-2025.git
cd kaga-election-2025

# ファイルをコピー
cp -r /path/to/kaga-election-site/* .

# ファイルを追加・コミット
git add .
git commit -m "Initial commit: 加賀市議会選挙特設サイト"
git push origin main
```

## ステップ3: スプレッドシートURLの設定

### 3-1. JavaScriptファイルの編集
1. GitHubでリポジトリの `js/main.js` ファイルを開く
2. 「Edit this file」（鉛筆アイコン）をクリック
3. 以下の行を見つけて編集：

```javascript
// 変更前
const SPREADSHEET_CSV_URL = 'YOUR_SPREADSHEET_CSV_URL_HERE';

// 変更後（実際のURLに置き換え）
const SPREADSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0';
```

4. 「Commit changes」をクリック
5. コミットメッセージを入力して「Commit changes」をクリック

### 3-2. スプレッドシートURL取得方法（再掲）
1. Googleスプレッドシートを開く
2. 「ファイル」→「ウェブに公開」をクリック
3. 「公開する範囲とビューア」で「カンマ区切り値(.csv)」を選択
4. 「公開」をクリック
5. 表示されたURLをコピー

## ステップ4: 公開確認

### 4-1. GitHub Pagesの確認
1. リポジトリの「Settings」→「Pages」に移動
2. 「Your site is published at」の下に表示されるURLをクリック
3. サイトが正常に表示されることを確認

### 4-2. 動作確認項目
- [ ] ページが正常に読み込まれる
- [ ] 候補者データが表示される（ダミーデータまたは実データ）
- [ ] フィルター・ソート機能が動作する
- [ ] レスポンシブデザインが機能する（スマートフォンでも確認）
- [ ] ナビゲーションが正常に動作する

## ステップ5: カスタムドメインの設定（任意）

### 5-1. 独自ドメインを使用する場合
1. ドメインのDNS設定でCNAMEレコードを追加：
   ```
   www.your-domain.com CNAME your-username.github.io
   ```
2. GitHub Pagesの設定で「Custom domain」に独自ドメインを入力
3. 「Enforce HTTPS」にチェック

## ステップ6: 継続的な更新

### 6-1. 候補者データの更新
- Googleフォームに新しい回答が追加されると、自動的にスプレッドシートが更新される
- ウェブサイトは次回アクセス時に最新データを取得する

### 6-2. サイトの更新
1. ローカルでファイルを編集
2. GitHubにファイルをアップロード（上書き）
3. 数分後に変更がサイトに反映される

## トラブルシューティング

### よくある問題と解決方法

#### 1. サイトが表示されない
- GitHub Pagesの設定を確認
- ファイル名が正しいか確認（`index.html`）
- 数分待ってから再度アクセス

#### 2. 候補者データが表示されない
- スプレッドシートが公開されているか確認
- URLが正しく設定されているか確認
- ブラウザの開発者ツールでエラーを確認

#### 3. CORSエラーが発生する
- スプレッドシートの公開設定を確認
- CSV形式で公開されているか確認

#### 4. レスポンシブデザインが機能しない
- HTMLの`<meta name="viewport">`タグが正しく設定されているか確認

## セキュリティとプライバシー

### 注意事項
- 個人情報の取り扱いに注意
- 不適切な投稿への対応方針を事前に決定
- 定期的なデータのバックアップ

### 推奨設定
- GitHubリポジトリは公開（Public）に設定
- スプレッドシートの編集権限は制限
- 定期的なセキュリティ確認

## サポート

技術的な問題が発生した場合：
1. GitHub Pagesの公式ドキュメントを確認
2. ブラウザの開発者ツールでエラーログを確認
3. GitHubのIssues機能で問題を報告

---

**注意**: この手順書は技術的な知識を前提としています。不明な点がある場合は、技術者にサポートを依頼することをお勧めします。

