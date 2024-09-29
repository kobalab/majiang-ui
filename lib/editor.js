/*
 *  Majiang.UI.PaipuEditor
 */
"use strict";

const $ = require('jquery');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

function flopInput(paiin) {
    paiin.on('focus', (ev)=>{
        let tabindex = $(ev.target).attr('tabindex') || 0;
        $(ev.target).removeAttr('tabindex');
        $(ev.target).children().eq(0).hide();
        let input = $(ev.target).children().eq(1);
        input.show();
        input.attr('tabindex', tabindex);
        input.trigger('focus');
    });
    paiin.each((i ,n)=>{
        $(n).children().eq(1).on('blur', (ev)=>{
            let tabindex = $(ev.target).attr('tabindex');
            $(ev.target).removeAttr('tabindex');
            $(ev.target).hide();
            $(ev.target).parent().attr('tabindex', tabindex);
            $(ev.target).parent().children().eq(0).show();
        });
        $(n).children().eq(1).hide();
    });
}

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
            fadeIn(root);
            this._unsaved = false;
            $(window).off('beforeunload');
        });

        $('.menu .replay', root).off('click').on('click', ()=>{
            viewer(this._paipu).preview(this._log_idx);
        });

        $('.menu .exit', root).off('click').on('click', ()=>{
            const message = '未保存の修正がありますが、編集を終了しますか？';
            if (! this._unsaved || window.confirm(message)) {
                $(window).off('beforeunload');
                callback();
            }
        });

        let row = $('.menu select[name="game"]', root).children().eq(0);
        $('.menu select[name="game"]', root).empty();
        for (let i = 0; i < 16; i++) {
            let name = ['東','南','西','北'][i >> 2]
                     + ['一','二','三','四'][i % 4] + '局'
            let r = row.clone().text(name).attr('value', i);
             $('.menu select[name="game"]', root).append(r);
        }
        flopInput($('.score .shan .paiin'));

        $('input, textarea, select', root).on('change', ()=>{
            this._unsaved = true;
        });

        if (paipu.log.length) {
            this.select_log(0);
        }
        else {
            this.add_log(-1);
            this.select_log(-1);
        }

        $(root).on('change', ()=>{
            $(window).on('beforeunload', (ev)=>{
                const message = 'ページを離れますがよろしいですか？';
                ev.returnValue = message;
                return message;
            });
        });

        this._unsaved = false;
    }

    changed() {
        this._unsaved  = true;
        $(this._root).trigger('change');
    }

    draw_summary() {

        const summary = $('.summary', this._root);
        const paipu   = this._paipu;

        $('*[name="title"]', summary).val(paipu.title);
        $('input[name="qijia"]', summary).val([paipu.qijia]);

        for (let id = 0; id < 4; id++) {
            $('*[name="player"]', summary).eq(id).val(paipu.player[id]);
            $('*[name="defen"]',  summary).eq(id).val(paipu.defen[id]);
            $('*[name="point"]',  summary).eq(id).val(paipu.point[id] || '-');
        }
        summary.on('change', ()=> this.update_summary());
    }
    update_summary() {

        const summary = $('.summary', this._root);
        const paipu   = this._paipu;

        paipu.title  = $('*[name="title"]', summary).val();
        paipu.qijia  = + $('input[name="qijia"]:checked', summary).val();
        paipu.player = $('*[name="player"]', summary)
                                    .toArray().map(n => $(n).val());
        paipu.defen  = $('*[name="defen"]', summary)
                                    .toArray().map(n => $(n).val());
        paipu.point  = $('*[name="point"]', summary)
                                    .toArray().map(n => $(n).val() || '-');

        this.changed();

        $('.menu .title', this._root).text(paipu.title);
    }

    draw_logs() {

        const logs = $('.menu .log', this._root);
        const row  = logs.children().eq(0).removeClass('selected');
        logs.empty();
        logs.append(row);

        row.on('click', ()=>this.select_log(-1));

        for (let i = 0; i < this._paipu.log.length; i++) {
            let r = row.clone();
            let qipai = this._paipu.log[i][0].qipai;
            $('.name', r).text(['東','南','西','北'][qipai.zhuangfeng]
                             + ['一','二','三','四'][qipai.jushu] + '局 '
                             + qipai.changbang + '本場');
            r.on('click', ()=>this.select_log(i));
            logs.append(r);
            if (i == this._log_idx) r.addClass('selected');
        }
        logs.children().each((i, r)=>{
            $('.plus', r).off('click').on('click', ()=>this.add_log(i - 1));
        });
    }

    draw_score() {

        const score = $('.score', this._root);
        const pai   = this._pai;
        const log   = this._paipu.log[this._log_idx];
        const qipai = log[0].qipai;

        $('*[name="game"]', score).val(qipai.zhuangfeng * 4 + qipai.jushu);

        $('*[name="changbang"]', score).val(qipai.changbang);
        $('*[name="lizhibang"]', score).val(qipai.lizhibang);

        $('*[name="baopai"]', score).val('');
        $('.paiin > .pai', score).empty().append(pai('_'));
        $('*[name="baopai"]', score).eq(0).val(qipai.baopai);
        $('.paiin > .pai', score).eq(0).empty().append(pai(qipai.baopai||'_'));
        let baopai = [], n = 1;
        for (let data of log) {
            if (data.kaigang) {
                $('*[name="baopai"]', score).eq(n).val(
                    (baopai.shift() || '') + data.kaigang.baopai);
                $('.paiin > .pai', score).eq(n)
                            .empty().append(pai(data.kaigang.baopai||'_'));
                n++;
            }
            else {
                baopai.forEach((p, i)=> baopai[i] += '>');
            }
            if (data.gangzimo) {
                 baopai.push('');
            }
        }

        score.on('change', ()=> this.update_score());
        $('*[name=baopai]', score).on('change', ()=> this.set_paipu());
    }
    update_score() {
        const qipai = this._paipu.log[this._log_idx][0].qipai;
        const score = $('.score', this._root);

        qipai.zhuangfeng = $('*[name="game"]', score).val() >> 2;
        qipai.jushu      = $('*[name="game"]', score).val()  % 4;
        qipai.changbang  = + $('*[name="changbang"]', score).val();
        qipai.lizhibang  = + $('*[name="lizhibang"]', score).val();
        qipai.baopai     = $('*[name=baopai]', score).eq(0).val();

        this.draw_score();
        this.draw_logs();
        this.get_paipu();
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

        this.changed();

        this.select_log(log_idx + 1);

        return false;
    }

    select_log(log_idx) {

        this._log_idx = log_idx;

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
            $('.hule input', this._root).val('');

            this.draw_score();
            this.draw_logs();
            this.get_paipu();

            $('.menu .score', this._root).css('visibility','visible');
            show($('.paipu', this._root));
            show($('.hule', this._root));
        }
        else {
            this.draw_logs();
            this.draw_summary();

            hide($('.paipu', this._root));
            hide($('.hule', this._root));
            $('.menu .score', this._root).css('visibility','hidden');
            $('.menu .log', this._root).children().eq(0).addClass('selected');
            show($('.summary', this._root));
        }
    }

    get_paipu() {

        const log_idx = this._log_idx;

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
            else if (data.hule) {
                $('.hule input[name="l"]').val(data.hule.l);
                $('.hule input[name="baojia"]').val(data.hule.baojia);
                if (data.hule.fubaopai) {
                    data.hule.fubaopai.forEach((p, i)=>{
                        $('.hule input[name="fubaopai"]').eq(i).val(p);
                    });
                }
                $('.hule .shoupai input[name="shoupai"]')
                                    .val(data.hule.shoupai);
                $('.hule .hupai input[name="hupai"]').each((i, n)=>{
                    if (data.hule.hupai[i]) $(n).val(data.hule.hupai[i].name);
                });
                $('.hule .hupai input[name="fanshu"]').each((i, n)=>{
                    if (data.hule.hupai[i]) $(n).val(data.hule.hupai[i].fanshu);
                });
                $('.hule .defen input[name="fu"]').val(data.hule.fu);
                $('.hule .defen input[name="fanshu"]').val(data.hule.fanshu);
                $('.hule .defen input[name="defen"]').val(data.hule.defen);
                $('.hule input[name="fenpei"]').each((i, n)=>{
                    $(n).val(data.hule.fenpei[i]);
                });
            }
            else if (data.pingju) {
                $('.pingju input[name="pingju"]').val(data.pingju.name);
                $('.pingju input[name="shoupai"]').each((i, n)=>{
                    $(n).val(data.pingju.shoupai[i]);
                });
                $('.hule input[name="fenpei"]').each((i, n)=>{
                    $(n).val(data.pingju.fenpei[i]);
                });
            }
        }

        $('input, textarea, select', root)
            .on('change', ()=>this._unsaved = true);

        $('.paipu input').on('change', ()=>this.set_paipu());
        $('.hule  input').on('change', ()=>this.set_paipu());
    }

    set_paipu() {

        const log_idx = this._log_idx;

        this._unsaved = true;

        const root = this._root;

        let log = [];
        let baopai = $('.score input[name="baopai"]', root).toArray()
                                                        .map(n => $(n).val());
        let qipai = {
            zhuangfeng: $('.menu select[name="game"]', root).val() >> 2,
            jushu:      $('.menu select[name="game"]', root).val() % 4,
            changbang:  + $('.menu input[name="changbang"]', root).val(),
            lizhibang:  + $('.menu input[name="lizhibang"]', root).val(),
            defen:      [],
            baopai:     baopai.shift(),
            shoupai:    []
        };
        for (let l = 0; l < 4; l++) {
            qipai.defen[l]   = + $('.paipu .player input[name="defen"]', root)
                                            .eq(l).val();
            qipai.shoupai[l] = $('.paipu .qipai input[name="qipai"]', root)
                                            .eq(l).val();
        }
        log.push({ qipai: qipai });

        let weikaigang;
        const kaigang = ()=>{
            if (! baopai[0]) {
                weikaigang = false;
                return;
            }
            if (baopai[0][0] != '>') {
                log.push({ kaigang: { baopai: baopai.shift() } });
                weikaigang = false;
            }
            else {
                baopai[0] = baopai[0].slice(1);
            }
        };

        for (let t = 0; t < 30; t++) {
            for (let l = 0; l < 4; l++) {
                let list = $('.paipu .zimo').eq(l);
                let zimo = list.children().eq(t).val();
                if (zimo) {
                    if (zimo.match(/[\+\=\-]/)) {
                        log.push({ fulou: { l: l, m: zimo } });
                    }
                    else {
                        if (weikaigang)
                                log.push({ gangzimo: { l: l, p: zimo } });
                        else    log.push({ zimo:     { l: l, p: zimo } });
                    }
                    if (weikaigang) kaigang();
                    if (zimo.match(/\d{4}/)) weikaigang = true;
                }

                list = $('.paipu .dapai').eq(l);
                let dapai = list.children().eq(t).val();
                if (dapai) {
                    if (dapai[0] == '_') dapai = zimo + dapai;
                    if (dapai.match(/\d\d/))
                            log.push({ gang:  { l: l, m: dapai } });
                    else    log.push({ dapai: { l: l, p: dapai } });
                    if (weikaigang) kaigang();
                    if (dapai.match(/\d\d/)) weikaigang = true;
                }
            }
        }

        if ($('.hule input[name="l"]').val()) {
            let hule = {
                l:          + $('.hule input[name="l"]').val(),
                shoupai:    $('.hule .shoupai input[name="shoupai"]').val(),
                baojia:     + $('.hule input[name="baojia"]').val() || null,
                fubaopai:   null,
                fu:         + $('.hule .defen input[name="fu"]').val(),
                fanshu:     + $('.hule .defen input[name="fanshu"]').val(),
                defen:      + $('.hule .defen input[name="defen"]').val(),
                hupai:      [],
                fenpei:     $('.hule input[name="fenpei"]').toArray()
                                .map(n => + $(n).val())
            };
            let fubaopai = $('.hule input[name="fubaopai"]').toArray()
                                .map(n => $(n).val()).filter(p => p);
            if (fubaopai.length) hule.fubaopai = fubaopai;
            $('.hule input[name="hupai"]').each((i, n)=>{
                let name = $(n).val();
                if (name) {
                    hule.hupai.push({
                        name:   name,
                        fanshu: + $('.hule .hupai [name="fanshu"]').eq(i).val()
                    });
                }
            });

            log.push({ hule: hule });
        }
        else {
            let pingju = {
                name:       $('.pingju input[name="pingju"]').val(),
                shoupai:    $('.pingju input[name="shoupai"]').toArray()
                                .map(n => $(n).val()),
                fenpei:     $('.hule input[name="fenpei"]').toArray()
                                .map(n => + $(n).val())
            };
            log.push({ pingju: pingju });
        }

        this._paipu.log[log_idx] = log;
    }
}
