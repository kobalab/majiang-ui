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
