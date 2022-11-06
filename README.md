# majiang-ui
麻雀UIライブラリ

手牌表示、盤面表示、牌譜再生 など画面表示やユーザとのインタラクションを実現するクラス群を提供します。

## インストール
```sh
$ npm i @kobalab/majiang-ui
```

## 使用法
```javascript
const Majiang = require('@kobalab/majiang-core');
Majiang.UI    = require('@kobalab/majiang-ui');
```

## 提供機能
| クラス名                | 機能
|:------------------------|:---------------------------------------------------
|``Majiang.UI.pai``       | 牌表示関数を生成する関数
|``Majiang.UI.audio``     | 音声出力関数を生成する関数
|``Majiang.UI.Shoupai``   | 手牌を表示するクラス
|``Majiang.UI.Shan``      | 牌山を表示するクラス
|``Majiang.UI.He``        | 捨て牌を表示するクラス
|``Majiang.UI.Board``     | 卓情報を表示するクラス
|``Majiang.UI.HuleDialog``| 和了・流局時のダイアログを表示するクラス
|``Majiang.UI.Player``    | 打牌選択などのUIを実現するクラス
|``Majiang.UI.GameCtl``   | 対局速度などの付属UIを実現するクラス
|``Majiang.UI.PaipuFile`` | 牌譜一覧を表示するクラス
|``Majiang.UI.Paipu``     | 牌譜ビューアを実現するクラス
|``Majiang.UI.Analyzer``  | 検討モードを実現するクラス
|``Majiang.UI.PaipuStat`` | 牌譜を集計するクラス
|``Majiang.UI.Util``      | ユーティリティ・ルーチン(fade-in/out, selector など)

## ライセンス
[MIT](https://github.com/kobalab/majiang-ui/blob/master/LICENSE)

## 作者
[Satoshi Kobayashi](https://github.com/kobalab)
