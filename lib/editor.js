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

    constructor(root, paipu, pai, callback, save, viewer) {
        this._root     = root;
        this._paipu    = paipu;
        this._pai      = pai;

        $('.menu .title', root).text(paipu.title);
        $('.menu .save', root).off('click').on('click', ()=>{
            this._paipu.rank = get_rank(this._paipu.qijia, this._paipu.defen);
            save();
            this._unsaved = false;
        });
        $('.menu .replay', root).off('click').on('click', ()=>{
            viewer(this._paipu).preview(this._log_idx);
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

        let row = $('.menu select[name="game"]', root).children().eq(0);
        $('.menu select[name="game"]', root).empty();
        for (let i = 0; i < 16; i++) {
            let name = ['東','南','西','北'][i >> 2]
                     + ['一','二','三','四'][i % 4] + '局'
            let r = row.clone().text(name).attr('value', i);
             $('.menu select[name="game"]', root).append(r);
        }

        $('input, textarea, select', root).on('change', ()=>{
            this._unsaved = true;
        });

        if (! paipu.log.length) this.add_log(-1);
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

            $('.paipu .qipai input[name="qipai"]', this._root)
                                                    .attr('tabindex', 1);

            let zimo = $('.paipu .zimo input[name="zimo"]', this._root)
                                                            .eq(0).val('');
            for (let l = 0; l < 4; l++) {
                $('.paipu .zimo').eq(l).empty();
                for (let t = 1; t <= 30; t++) {
                    let r = zimo.clone().attr('tabindex', t);
                    $('.paipu .zimo').eq(l).append(r)
                }
            }
            let dapai = $('.paipu .zimo input[name="dapai"]', this._root)
                                                            .eq(0).val('');
            for (let l = 0; l < 4; l++) {
                $('.paipu .dapai').eq(l).empty();
                for (let t = 1; t <= 30; t++) {
                    let r = zimo.clone().attr('tabindex', t);
                    $('.paipu .dapai').eq(l).append(r)
                }
            }

            this.get_paipu(log_idx);
            $('.menu .score', this._root).css('visibility','visible');
            show($('.paipu', this._root));
        }
        else {
            hide($('.paipu', this._root));
            $('.menu .score', this._root).css('visibility','hidden');
            $('.menu .log', this._root).children().eq(0).addClass('selected');
            show($('.summary', this._root));
        }
    }

    get_paipu(log_idx) {

        const root = this._root;
        const log  = this._paipu.log[log_idx];

        let l = 0, t = 0;

        for (let data of log) {

            if (data.qipai) {

                let qipai = data.qipai;

                for (let l = 0; l < 4; l++) {
                    $('.paipu .player .jia', root).eq(l)
                                    .text(['東','南','西','北'][l]);

                    let id = (this._paipu.qijia + qipai.jushu + l) % 4;
                    $('.paipu .player .name', root).eq(l)
                                    .text(this._paipu.player[id]);

                    $('.paipu .player input[name="defen"]', root).eq(l)
                                    .val(qipai.defen[l]);
                    $('.paipu .player input[name="defen"]', root).eq(l)
                        .off('change').on('change', ()=>
                    {
                        qipai.defen[l]
                            = + $('.paipu .player input[name="defen"]', root)
                                    .eq(l).val();
                    });

                    $('.paipu .qipai input[name="qipai"]', root).eq(l)
                                    .val(qipai.shoupai[l]);
                    $('.paipu .qipai input[name="qipai"]', root).eq(l)
                        .off('change').on('change', ()=>
                    {
                        qipai.shoupai[l]
                            = $('.paipu .qipai input[name="qipai"]', root)
                                    .eq(l).val();
                    });
                }

                $('.menu select[name="game"]', root)
                                    .val(qipai.zhuangfeng * 4 + qipai.jushu);
                $('.menu select[name="game"]', root)
                    .off('change').on('change', ()=>
                {
                    qipai.zhuangfeng
                        = $('.menu select[name="game"]', root).val() >> 2;
                    qipai.jushu
                        = $('.menu select[name="game"]', root).val() % 4;
                    this.select_log(log_idx);
                })

                $('.menu input[name="changbang"]', root).val(qipai.changbang);
                $('.menu input[name="changbang"]', root)
                    .off('change').on('change', ()=>
                {
                    qipai.changbang
                        = + $('.menu input[name="changbang"]', root).val();
                    this.select_log(log_idx);
                });

                $('.menu input[name="lizhibang"]', root).val(qipai.lizhibang);
                $('.menu input[name="lizhibang"]', root)
                    .off('change').on('change', ()=>
                {
                    qipai.lizhibang
                        = + $('.menu input[name="lizhibang"]', root).val();
                });


                $('.menu input[name="baopai"]', root).eq(0).val(qipai.baopai);
                $('.menu input[name="baopai"]', root)
                    .off('change').on('change', ()=>
                {
                    qipai.baopai
                        = $('.menu input[name="baopai"]', root).eq(0).val();
                });
            }
            else if (data.zimo) {
                if (data.zimo.l < l) t++;
                let zimo = $('.paipu .zimo').eq(data.zimo.l);
                zimo.children().eq(t).val(data.zimo.p);
                l = data.zimo.l;
            }
            else if (data.gangzimo) {
                t++;
                let zimo = $('.paipu .zimo').eq(data.gangzimo.l);
                zimo.children().eq(t).val(data.gangzimo.p);
                l = data.gangzimo.l;
            }
            else if (data.fulou) {
                t++;
                let zimo = $('.paipu .zimo').eq(data.fulou.l);
                zimo.children().eq(t).val(data.fulou.m);
                l = data.fulou.l;
            }
            else if (data.dapai) {
                let dapai = $('.paipu .dapai').eq(data.dapai.l);
                let p = data.dapai.p[2] == '_'
                            ? data.dapai.p.slice(2) : data.dapai.p
                dapai.children().eq(t).val(p);
            }
            else if (data.gang) {
                let dapai = $('.paipu .dapai').eq(data.gang.l);
                dapai.children().eq(t).val(data.gang.m);
            }
        }

        $('input, textarea, select', root)
            .on('change', ()=>this._unsaved = true);
    }
}
