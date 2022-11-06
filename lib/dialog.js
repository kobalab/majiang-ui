/*
 *  Majiang.UI.HuleDialog
 */
"use strict";

const $ = require('jquery');

const Majiang = require('@kobalab/majiang-core');

const Shoupai = require('./shoupai');
const Shan    = require('./shan');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

module.exports = class HuleDialog {

    constructor(root, pai, model, viewpoint = 0) {

        this._node = {
            root:   root,
            hule:   $('.hule',   root),
            pingju: $('.pingju', root),
            fenpei: $('.fenpai', root),
        };
        this._r_hupai = $('.r_hupai', root).eq(0);
        this._r_defen = $('.r_defen', root).eq(0);
        this.hide();

        this._pai = pai;

        this._model     = model;
        this._viewpoint = viewpoint
    }

    hule(hule) {

        hide(this._node.root);
        hide(this._node.pingju);
        show(this._node.hule);

        if (hule.fubaopai) show($('.shan.fubaopai', this._node.hule));
        else               hide($('.shan.fubaopai', this._node.hule));

        new Shan($('.shan', this._node.hule), this._pai, this._model.shan)
                                                            .redraw();

        new Shoupai($('.shoupai', this._node.hule), this._pai,
                    Majiang.Shoupai.fromString(hule.shoupai)).redraw(true);

        let hupai = $('.hupai', this._node.hule).empty();
        if (hule.hupai) {
            for (let h of hule.hupai) {
                let r_hupai = this._r_hupai.clone();
                $('.name',   r_hupai).text(h.name);
                $('.fanshu', r_hupai).text(
                                    h.fanshu + (h.fanshu[0] == '*' ?'' : '翻'));
                hupai.append(show(r_hupai));
            }
            let text = hule.damanguan ? ''
                                      : hule.fu + '符 ' + hule.fanshu + '翻 ';
            let manguan = hule.defen / (hule.l == 0 ? 6 : 4) / 2000;
            text += (manguan >= 4 * 6) ? '六倍役満 '
                  : (manguan >= 4 * 5) ? '五倍役満 '
                  : (manguan >= 4 * 4) ? '四倍役満 '
                  : (manguan >= 4 * 3) ? 'トリプル役満 '
                  : (manguan >= 4 * 2) ? 'ダブル役満 '
                  : (manguan >= 4)     ? '役満 '
                  : (manguan >= 3)     ? '三倍満 '
                  : (manguan >= 2)     ? '倍満 '
                  : (manguan >= 1.5)   ? '跳満 '
                  : (manguan >= 1)     ? '満貫 '
                  :                      '';
            text += hule.defen + '点';
            let r_defen = this._r_defen.clone();
            $('.defen', r_defen).text(text).removeClass('no_hule');
            hupai.append(r_defen);
        }
        else {
            let r_hupai = this._r_hupai.clone();
            hupai.append(hide(r_hupai));
            let r_defen = this._r_defen.clone();
            $('.defen', r_defen).text('役なし').addClass('no_hule');
            hupai.append(r_defen);
        }

        $('.jicun .changbang', this._node.hule).text(this._model.changbang);
        $('.jicun .lizhibang', this._node.hule).text(this._model.lizhibang);

        if (hule.fenpei) this.fenpei(hule.fenpei);

        this._node.root.attr('aria-label', 'ホーラ情報')
        fadeIn(this._node.root);
        return this;
    }

    pingju(pingju) {

        hide(this._node.root);
        hide(this._node.hule);
        show(this._node.pingju);

        this._node.pingju.text(pingju.name);

        if (pingju.fenpei) this.fenpei(pingju.fenpei);

        this._node.root.attr('aria-label', '流局情報')
        fadeIn(this._node.root);
        return this;
    }

    fenpei(fenpei) {

        const feng_hanzi = ['東','南','西','北'];
        const class_name = ['main','xiajia','duimian','shangjia'];

        $('.diff', this._node.fenpai).removeClass('plus minus');

        for (let l = 0; l < 4; l++) {

            let id = this._model.player_id[l];
            let c  = class_name[(id + 4 - this._viewpoint) % 4];
            let node = $(`.${c}`, this._node.fenpai);

            $('.feng', node).text(feng_hanzi[l]);

            let player = this._model.player[id].replace(/\n.*$/,'');
            $('.player', node).text(player);

            let defen = (''+this._model.defen[id])
                                .replace(/(\d)(\d{3})$/, '$1,$2');
            $('.defen', node).text(defen);

            let diff = fenpei[l];
            if      (diff > 0) $('.diff', node).addClass('plus');
            else if (diff < 0) $('.diff', node).addClass('minus');
            diff = diff > 0 ? '+' + diff
                 : diff < 0 ? ''  + diff
                 :            '';
            diff = diff.replace(/(\d)(\d{3})$/, '$1,$2');
            $('.diff', node).text(diff);
        }
    }

    hide() {
        this._node.root.scrollTop(0);
        hide(this._node.root);
        return this;
    }
}
