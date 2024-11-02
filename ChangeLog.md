### v1.4.2 / 2024-11-02

  - 牌譜エディタで配牌1枚目の入力にエラーがあるとその配牌全体にエラーが残ってしまうバグを修正

### v1.4.1 / 2024-10-31

  - #9 牌譜エディタに牌数をチェックする処理を追加
  - カンドラ後乗せのタイミングを制御する > が正しく処理されていないバグを修正
  - 摸打の回数を30固定で処理しているバグを修正

## v1.4.0 / 2024-10-27

  - #8 牌譜エディタの機能を追加
  - 牌譜ビューアの HTML の title に対局名を設定するよう修正
  - 牌譜ビューアが自動再生中に和了・流局画面で停止しないよう修正
  - @kobalab/majiang-core 1.2.1 → 1.3.1

### v1.3.1 / 2024-02-25

  - 開局、和了・流局、終局画面から応答が重複して送信されることがあるバグを修正
  - 秒読みのときの描画回数を少なくするよう修正
  - コントロールの表示をCSSで制御するよう修正
  - String の非推奨のメソッドを変更: substr() → slice()
  - @kobalab/majiang-core 1.2.0 → 1.2.1
  - @kobalab/majiang-ai 1.0.9 → 1.0.10

## v1.3.0 / 2024-02-19

  - Majiang.UI.GameCtl のパラメータの順序を変更し、複数のviewに対して音声有無を設定できるようにした
  - タイムアウトを知らせる警告音を追加

### v1.2.1 / 2024-02-17

  - #7 持ち時間切れのタイマーにクリア漏れがあるバグを修正

## v1.2.0 / 2024-02-16

  - 持ち時間の表示と時間切れによる強制打牌の処理を追加

## v1.1.0 / 2024-02-11

  - #3 麻雀サーバーに関する処理を追加
  - @kobalab/majiang-core 1.1.2 → 1.2.0
  - @kobalab/majiang-ai 1.0.8 → 1.0.9

### v1.0.8 / 2023-12-26

  - @kobalab/majiang-core 1.1.1 → 1.1.2
  - @kobalab/majiang-ai 1.0.7 → 1.0.8
  - パッケージを最新化(jquery 3.6.0 → 3.7.1)

### v1.0.7 / 2023-12-19

  - @kobalab/majiang-core 1.1.0 → 1.1.1
  - @kobalab/majiang-ai 1.0.5 → 1.0.7

### v1.0.6 / 2023-04-10

  - #6 ダブロンの牌譜のUIが正しく動作しないバグを修正

### v1.0.5 / 2023-04-09

  - #6 ダブロンの牌譜再生のUIを変更
  - @kobalab/majiang-ai 1.0.4 → 1.0.5
  - @kobalab/majiang-core 1.0.2 → 1.1.0

### v1.0.4 / 2023-02-04

  - #5 検討モードが被リーチ後にシャンテン数の戻る暗槓を選択するように見えるバグを修正
    - @kobalab/majiang-ai 1.0.3 → 1.0.4

### v1.0.3 / 2023-01-21

  - #4 検討モードが2シャンテンからリーチ宣言牌を鳴くべきと評価するバグを修正
  - @kobalab/majiang-core 1.0.1 → 1.0.2
  - @kobalab/majiang-ai 1.0.2 → 1.0.3

### v1.0.2 / 2022-12-26

  - @kobalab/majiang-core 1.0.0 → 1.0.1
    - ゲーム停止時にコールバックが呼ばれないことがあるバグを修正
  - @kobalab/majiang-ai 1.0.1 → 1.0.2

### v1.0.1 / 2022-12-02

  - #2 検討モードで全ての牌が「現物」と表示されるバグを修正
  - @kobalab/majiang-ai 1.0.0 → 1.0.1

# v1.0.0 / 2022-11-11

  - 正式版リリース
  - パッケージを最新化
    - @kobalab/majiang-core 0.5.0 → 1.0.0
    - @kobalab/majiang-ai 0.6.5 → 1.0.0

### v0.4.3 / 2022-11-10

  - Majiang.UI.Board
    - インスタンス生成時にスコアを非表示にする処理を追加

### v0.4.2 / 2022-11-06

  - Majiang.UI.Paipu
    - 牌譜再生でオーラスの点移動が反映されないバグを修正
  - Majiang.UI.HuleDialog
    - 役なしのケースに対応
  - パッケージを最新化
    - @kobalab/majiang-core 0.4.0 → 0.5.0
    - @kobalab/majiang-ai 0.6.4 → 0.6.5

### v0.4.1 / 2022-10-31

  - Majiang.UI.GameCtl
    - メソッド start(), stop(), shoupai(), he() を追加
  - パッケージを最新化
    - @kobalab/majiang-core 0.3.1 → 0.4.0
    - @kobalab/majiang-ai 0.6.3 → 0.6.4

## v0.4.0 / 2022-10-29

  - Majiang.UI.PaipuStat を追加
  - Majiang.UI.PaipuFile
    - 集計表への遷移を追加
    - tenhou-log のURLを引数で受け取るよう修正
    - tenhou-log が同一のサイトにある場合、URLを省略するよう修正
  - Majiang.UI.Analyzer
    - 危険度 0 (現物)の牌を識別できるよう修正
  - パッケージを最新化
    - @kobalab/majiang-core 0.3.0 → 0.3.1
    - @kobalab/majiang-ai 0.6.2 → 0.6.3

### v0.3.3 / 2022-10-01

  - Majiang.UI.Player
    - ノーテン宣言可否の判断に allow_no_daopai() を使用するよう変更
  - パッケージを最新化
    - @kobalab/majiang-core 0.2.11 → 0.3.0
    - @kobalab/majiang-ai 0.6.1 → 0.6.2

### v0.3.2 / 2022-09-17

  - Majiang.UI.Analyzer
    - 牌の危険度の評価指標を変更
  - パッケージを最新化
    - @kobalab/majiang-core 0.2.9 → 0.2.11
    - @kobalab/majiang-ai 0.4.0 → 0.6.1
  - 脆弱性警告に対処(jquery-ui 1.13.1 → 1.13.2)

### v0.3.1 / 2022-05-30

  - Majiang.UI.Analyzer
    - 遠い鳴きで打牌の検討情報がない場合にエラーとなるバグを修正
    - 副露時に評価値の枚数に負の値が表示されることがあるバグを修正

## v0.3.0 / 2022-05-29

  - Majiang.UI.Analyzer を追加

## v0.2.0 / 2022-05-22

  - Majiang.UI.PaipuFile を追加
  - Majiang.UI.Paipu を追加

### v0.1.2 / 2022-05-08

  - package.json に publishConfig が漏れていたので追加

### v0.1.1 / 2022-05-08

  - package.json のバージョンの誤りを修正

## v0.1.0 / 2022-05-08

  - β版リリース
