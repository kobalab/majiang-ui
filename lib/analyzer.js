/*
 *  Majiang.UI.Paipu
 */
"use strict";

const AI = require('@kobalab/majiang-ai');

const Shoupai = require('./shoupai');

const { show, hide } = require('./fadein');

module.exports = class Analyzer extends AI {

    constructor(root, kaiju, pai, callback) {
        super();
        this._node = {
            root:      root,
            shoupai:   $('> .shoupai', root),
            dapai:     $('> .dapai',   root),
            r_shoupai: $('> .shoupai .row', root).eq(0),
            r_dapai:   $('> .dapai   .row', root).eq(0),
        };
        this._pai  = pai;
        this.close = callback;
        this.action(kaiju);
    }

    id(id) {
        this.action({ kaiju: {
            id:     id,
            rule:   this._rule,
            title:  this._model.title,
            player: this._model.player,
            qijia:  this._model.qijia,
        }})
    }

    next(msg) {
        super.action(msg);
    }

    action(msg) {
        super.action(msg, ()=>{});
    }

    action_kaiju() {
        this.active(false);
        hide(this._node.shoupai);
        hide(this._node.dapai);
    }

    action_qipai() {
        this.redraw_shoupai([]);
        this.active(true);
    }

    action_zimo(zimo) {
        if (zimo.l != this._menfeng) {
            this.redraw_shoupai([]);
            return;
        }
        let info = [];
        let m = this.select_gang(info);
        if (m) info.find(i => i.m == m).selected = true;
        let p = this.select_dapai(info).substr(0,2);
        if (! m) info.find(i => i.p == p).selected = true;
        this.redraw_dapai(info);
    }

    action_dapai(dapai) {
        if (dapai.l == this._menfeng) {
            this.update_dapai(dapai.p.substr(0,2));
            return;
        }
        let info = [];
        let m = this.select_fulou(dapai, info);
        if (m) info.find(i => i.m == m).selected = true;
        this.redraw_shoupai(info);
    }

    action_fulou(fulou) {
        if (fulou.l != this._menfeng) {
            this.redraw_shoupai([]);
            return;
        }
        if (fulou.m.match(/\d{4}/)) return;
        let info = [];
        let p = this.select_dapai(info).substr(0,2);
        info.find(i => i.p == p).selected = true;
        this.redraw_dapai(info);
        this.active(true);
    }

    action_gang(gang) {
        if (gang.l == this._menfeng) {
            this.update_dapai(gang.m);
            return;
        }
        hide(this._node.dapai);
    }

    action_hule()   { this.active(false) }
    action_pingju() { this.active(false) }

    active(on) {
        if (on) this._node.root.addClass('active');
        else    this._node.root.removeClass('active');
    }

    redraw_shoupai(info) {

        show(this._node.shoupai.empty());
        hide(this._node.dapai);

        if (! info.length) {
            let n_xiangting = Majiang.Util.xiangting(this.shoupai);
            let paishu = this._suanpai.paishu_all();
            let ev     = this.eval_shoupai(this.shoupai, paishu);
            let n_tingpai = Majiang.Util.tingpai(this.shoupai)
                                .map(p => this._suanpai._paishu[p[0]][p[1]])
                                .reduce((x, y)=> x + y, 0);
            info.push({
                m: '', n_xiangting: n_xiangting, n_tingpai: n_tingpai,
                ev: ev, shoupai: this.shoupai.toString(),
            });
        }

        const cmp = (a, b)=> a.selected ? -1
                           : b.selected ?  1
                           : b.ev - a.ev;
        for (let i of info.sort(cmp)) {
            let row = this._node.r_shoupai.clone();
            $('.xiangting', row).text(i.n_xiangting ? `${i.n_xiangting}向聴`
                                                    : '聴牌');
            if (i.ev == null) {
                $('.eval', row).text('');
            }
            else if (i.n_xiangting > 2) {
                let x = i.ev - i.n_tingpai;
                $('.eval', row).text(x ? `${i.n_tingpai}(+${x})枚`
                                       : `${i.n_tingpai}枚`);
            }
            else {
                $('.eval', row).text(i.ev.toFixed(2));
            }
            new Shoupai($('.shoupai', row), this._pai,
                        Majiang.Shoupai.fromString(i.shoupai)).redraw(true);
            let action = ! i.m                                  ? ''
                       : i.m.match(/\d{4}/)                     ? 'カン'
                       : i.m.replace(/0/,'5').match(/(\d)\1\1/) ? 'ポン'
                       :                                          'チー';
            $('.action', row).text(action);

            this._node.shoupai.append(row);
        }

        if (info.length == 1) this.active(false);
        else                  this.active(true);
    }

    redraw_dapai(info) {

        hide(this._node.shoupai);
        show(this._node.dapai.empty());

        const cmp = (a, b)=> a.selected ? -1
                           : b.selected ?  1
                           : b.ev - a.ev;
        for (let i of info.sort(cmp)) {
            let row = this._node.r_dapai.clone().removeClass('selected')
                                                .attr('data-dapai', i.m || i.p);
            $('.p', row).empty().append(this._pai(i.p));
            if (i.m) $('.p', row).append($('<span>').text('カン'));
            $('.xiangting', row).text(i.n_xiangting ? `${i.n_xiangting}向聴`
                                                    : '聴牌');
            if (i.ev == null) {
                $('.eval', row).text('オリ');
            }
            else if (i.n_xiangting > 2) {
                let x = i.ev - i.n_tingpai;
                $('.eval', row).text(x ? `${i.n_tingpai}(+${x})枚`
                                       : `${i.n_tingpai}枚`);
            }
            else {
                $('.eval', row).text(i.ev.toFixed(2));
            }
            $('.tingpai', row).empty();
            for (let p of i.tingpai || []) {
                $('.tingpai', row).append(this._pai(p));
            }
            if (i.n_xiangting <= 2 && i.ev != null) {
                $('.tingpai', row)
                    .append($('<span>').text(`(${i.n_tingpai}枚)`));
            }
            let weixian = ! i.weixian     ? ''
                        :   i.weixian > 5 ? 'middle'
                        :   i.weixian > 0 ? 'low'
                        :                   '';
            $('.eval', row).removeClass('high middle low')
                           .addClass(weixian);

            this._node.dapai.append(row);
        }

        if (this.shoupai.lizhi && info.length == 1) this.active(false);
        else                                        this.active(true);
    }

    update_dapai(p) {
        $(`.row[data-dapai="${p}"]`, this._node.dapai).addClass('selected');
    }
}