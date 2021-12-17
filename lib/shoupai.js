/*
 *  Majiang.UI.Shoupai
 */
"use strict";

const $ = require('jquery');

module.exports = class Shoupai {

    constructor(root, pai, shoupai, open) {

        this._node = {
            bingpai: $('.bingpai', root),
            fulou:   $('.fulou',   root)
        };
        this._pai     = pai;
        this._shoupai = shoupai;
        this._open    = open;
    }

    redraw(open) {

        if (open != null) this._open = open;

        this._node.bingpai.attr('aria-label', '手牌');
        this._node.bingpai.empty();
        let zimo = this._shoupai._zimo
        let n_pai = this._shoupai._bingpai._ + (zimo == '_' ?  - 1 : 0);
        for (let i = 0; i < n_pai; i++) {
            this._node.bingpai.append(this._pai('_'));
        }
        for (let s of ['m','p','s','z']) {
            let bingpai = this._shoupai._bingpai[s];
            let n_hongpai = bingpai[0];
            for (let n = 1; n < bingpai.length; n++) {
                n_pai = bingpai[n];
                if      (s+n == zimo)           { n_pai--              }
                else if (n == 5 && s+0 == zimo) { n_pai--; n_hongpai-- }
                for (let i = 0; i < n_pai; i++) {
                    let p = (n == 5 && n_hongpai > i) ? s+0 : s+n;
                    this._node.bingpai.append(this._open ? this._pai(p)
                                                         : this._pai('_'));
                }
            }
        }
        if (zimo && zimo.length <= 2) {
            this._node.bingpai.append(
                    $('<span class="zimo">')
                            .append(this._open ? this._pai(zimo)
                                               : this._pai('_')));
        }

        this._node.fulou.empty();
        for (let m of this._shoupai._fulou) {
            let mianzi = $('<span class="mianzi">');
            let s = m[0];
            if (m.replace(/0/g,'5').match(/^[mpsz](\d)\1\1\1$/)) {
                let nn = m.match(/\d/g);
                mianzi.attr('aria-label','アンカン')
                      .append(this._pai('_'))
                      .append(this._pai(s+nn[2]))
                      .append(this._pai(s+nn[3]))
                      .append(this._pai('_'));
            }
            else if (m.replace(/0/g,'5').match(/^[mpsz](\d)\1\1/)) {
                let jiagang = m.match(/[\+\=\-]\d$/);
                let d       = m.match(/[\+\=\-]/);
                let pai     = m.match(/\d/g).map(n => this._pai(s+n));
                let pai_r   = $('<span class="rotate">')
                                    .append(jiagang ? pai.slice(-2)
                                                    : pai.slice(-1));
                let pai_l   = (! jiagang && pai.length == 4)
                                                    ? pai.slice(1, 3)
                                                    : pai.slice(1, 2);
                let label   = (  d == '+' ? 'シモチャから'
                               : d == '=' ? 'トイメンから'
                               :            'カミチャから' )
                            + (  jiagang         ? 'カカン'
                               : pai.length == 4 ? 'カン'
                               :                   'ポン' );
                mianzi.attr('aria-label', label);
                if (d == '+') mianzi.append(pai[0]).append(pai_l).append(pai_r);
                if (d == '=') mianzi.append(pai[0]).append(pai_r).append(pai_l);
                if (d == '-') mianzi.append(pai_r).append(pai[0]).append(pai_l);
            }
            else {
                let nn = m.match(/\d(?=\-)/).concat(m.match(/\d(?!\-)/g));
                mianzi.attr('aria-label', 'チー')
                      .append($('<span class="rotate">')
                                .append(this._pai(s+nn[0])))
                      .append(this._pai(s+nn[1]))
                      .append(this._pai(s+nn[2]));
            }
            this._node.fulou.append(mianzi);
        }

        return this;
    }

    dapai(p) {

        let dapai = $('.pai.dapai', this._node.bingpai);
        if (! dapai.length) {
            if (p[2] == '_') dapai = $('.zimo .pai', this._node.bingpai);
        }
        if (! dapai.length) {
            if (this._open) {
                dapai = $(`.pai[data-pai="${p.substr(0,2)}"]`,
                          this._node.bingpai).eq(0);
            }
            else {
                dapai = $('.pai', this._node.bingpai);
                dapai = dapai.eq(Math.random()*(dapai.length-1)|0);
            }
        }
        dapai.addClass('deleted');

        return this;
    }
}
