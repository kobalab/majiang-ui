/*
 *  Majiang.UI.PaipuEditor
 */
"use strict";

const $ = require('jquery');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

function get_rank(qijia, defen) {

    let paiming = [];
    for (let i = 0; i < 4; i++) {
        let id = (qijia + i) % 4;
        for (let j = 0; j < 4; j++) {
            if (j == paiming.length || defen[id] > defen[paiming[j]]) {
                paiming.splice(j, 0, id);
                break;
            }
        }
    }

    let rank = [0,0,0,0];
    for (let i = 0; i < 4; i++) {
        rank[paiming[i]] = i + 1;
    }
    return rank;
}

module.exports = class PaipuEditor {

    constructor(root, paipu, pai, callback, save) {
        this._root     = root;
        this._paipu    = paipu;
        this._pai      = pai;

        $('.menu .title', root).text(paipu.title);
        $('.menu .save', root).off('click').on('click', ()=>{
            this._paipu.rank = get_rank(this._paipu.qijia, this._paipu.defen);
            save();
            this._unsaved = false;
        });
        $('.menu .exit', root).off('click').on('click', ()=>{
            const message = '未保存の修正がありますが、編集を終了しますか？';
            if (! this._unsaved || window.confirm(message)) callback();
        });

        $('.summary textarea[name="title"]', root).val(paipu.title)
            .off('change').on('change', (ev)=>{
                paipu.title =  $(ev.target).val();
                $('.menu .title', root).text(paipu.title);
            });

        $('.summary input[name="qijia"]', root).val([paipu.qijia])
            .off('change').on('change', (ev)=>{
                paipu.qijia = + $(ev.target).val();
            });

        for (let id = 0; id < 4; id++) {
            $('.summary textarea[name="player"]', root)
                                        .eq(id).val(paipu.player[id])
                .off('change').on('change', (ev)=>{
                    paipu.player[id] = $(ev.target).val();
                });
            $('.summary input[name="defen"]', root).eq(id).val(paipu.defen[id])
                .off('change').on('change', (ev)=>{
                    paipu.defen[id] = $(ev.target).val();
                });
            $('.summary input[name="point"]', root).eq(id).val(paipu.point[id])
                .off('change').on('change', (ev)=>{
                    paipu.point[id] = $(ev.target).val();
                });
        }

        $('input, textarea', root).on('change', ()=>{
            this._unsaved = true;
        });

        if (! paipu.log.length) this.add_log();
        this.select_log(-1);

        this._unsaved  = false;
    }

    add_log(log_idx) {

        let qipai = {
            zhuangfeng: 0,
            jushu:      0,
            changbang:  0,
            lizhibang:  0,
            defen:      [ 25000, 25000, 25000, 25000 ],
            baopai:     '',
            shoupai:    ['','','','']
        };
        if (log_idx >= 0) {
            qipai.zhuangfeng = this._paipu.log[log_idx][0].qipai.zhuangfeng;
            qipai.jushu      = this._paipu.log[log_idx][0].qipai.jushu;
            qipai.changbang  = this._paipu.log[log_idx][0].qipai.changbang + 1;
            qipai.lizhibang  = 0;
        }
        this._paipu.log.splice(log_idx + 1, 0, [ { qipai: qipai } ]);
        this._unsaved  = true;

        this.select_log(log_idx + 1);

        return false;
    }

    select_log(log_idx) {

        const row = $('.menu .log', this._root).children().eq(0)
                                            .removeClass('selected');
        $('.menu .log', this._root).empty();
        $('.menu .log', this._root).append(row);

        row.on('click', ()=>this.select_log(-1));

        this._log_idx = log_idx;
        for (let i = 0; i < this._paipu.log.length; i++) {
            let r = row.clone();
            let qipai = this._paipu.log[i][0].qipai;
            $('.name', r).text(['東','南','西','北'][qipai.zhuangfeng]
                             + ['一','二','三','四'][qipai.jushu] + '局 '
                             + qipai.changbang + '本場');
            r.on('click', ()=>this.select_log(i));
            $('.menu .log', this._root).append(r);
            if (i == log_idx) r.addClass('selected');
        }
        $('.menu .log', this._root).children().each((i, r)=>{
            $('.plus', r).off('click').on('click', ()=>this.add_log(i - 1));
        });

        if (log_idx >= 0) {
            hide($('.summary', this._root));
        }
        else {
            $('.menu .log', this._root).children().eq(0).addClass('selected');
            show($('.summary', this._root));
        }
    }
}
