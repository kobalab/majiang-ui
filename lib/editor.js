/*
 *  Majiang.UI.PaipuEditor
 */
"use strict";

const $ = require('jquery');
const Majiang = require('@kobalab/majiang-core');

const Shoupai = require('./shoupai');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

function flipInput(paiin) {
    paiin.off('focus').on('focus', (ev)=>{
        let tabindex = $(ev.target).attr('tabindex') || 0;
        $(ev.target).removeAttr('tabindex');
        $(ev.target).children().eq(0).hide();
        let input = $(ev.target).children().eq(1);
        input.show();
        input.attr('tabindex', tabindex);
        input.trigger('focus');
    });
    paiin.each((i ,n)=>{
        $(n).children().eq(1).off('blur').on('blur', (ev)=>{
            let tabindex = $(ev.target).attr('tabindex');
            $(ev.target).removeAttr('tabindex');
            $(ev.target).hide();
            $(ev.target).parent().attr('tabindex', tabindex);
            $(ev.target).parent().children().eq(0).show();
        });
        $(n).children().eq(1).hide();
    });
}

function moda_accessor(root, pai) {
    return function(t, l, md, val, text) {
        const moda = (t, l, md)=>
                (md == 'm')
                        ? $('.moda', $('.mo', root).eq(l)).eq(t)
                        : $('.moda', $('.da', root).eq(l)).eq(t);
        if (val == null) {
            return  $('input', moda(t, l, md)).val();
        }
        else {
            $('input', moda(t, l, md)).val(val);
            if (md == 'd' && val[0] == '_') {
                $('.pai', moda(t, l, 'm')).text('↓');
                val = $('input', moda(t, l, 'm')).val() + val;
            }
            $('.pai', moda(t, l, md)).append(
                    pai(val.replace(/^([mpsz])\d{3}[+\=\-](\d)$/, '$1$2')
                           .replace(/^([mpsz]).*(\d)[\+\=\-].*$/, '$1$2')
                           .replace(/^([mpsz]\d).*$/, '$1')));
            $('.text', moda(t, l, md)).text(text);
        }
    }
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
        this._model = new Majiang.Board(paipu);

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

        $(root).on('change', ()=>{
            $(window).on('beforeunload', (ev)=>{
                const message = 'ページを離れますがよろしいですか？';
                ev.returnValue = message;
                return message;
            });
        });

        $('.menu .title', root).text(paipu.title);

        this.init_score();

        if (paipu.log.length) {
            this.select_log(0);
        }
        else {
            this.add_log(-1);
            this.select_log(-1);
        }

        this._unsaved = false;
    }

    changed() {
        this._unsaved  = true;
        $(this._root).trigger('change');
    }

    init_score() {

        const score  = $('.score', this._root);
        const select = $('select[name="game"]', score);

        const row = select.children().eq(0);
        select.empty();
        for (let i = 0; i < 16; i++) {
            let name = ['東','南','西','北'][i >> 2]
                     + ['一','二','三','四'][i % 4] + '局'
            let r = row.clone().text(name).attr('value', i);
            select.append(r);
        }

        flipInput($('.shan .flip'), score);
    }

    init_moda() {

        let mo = $('.paipu .mo', this._root).children().eq(0);
        for (let l = 0; l < 4; l++) {
            $('.paipu .mo').eq(l).empty();
            for (let t = 1; t <= 30; t++) {
                let r = mo.clone();
                $('.flip', r).attr('tabindex', t);
                $('.paipu .mo').eq(l).append(r)
            }
        }
        let da = $('.paipu .da', this._root).children().eq(0);
        for (let l = 0; l < 4; l++) {
            $('.paipu .da').eq(l).empty();
            for (let t = 1; t <= 30; t++) {
                let r = da.clone();
                $('.flip', r).attr('tabindex', t);
                $('.paipu .da').eq(l).append(r)
            }
        }

        flipInput($('.paipu .flip', this._root));

        $('.paipu input', this._root)
                .off('change').on('change', (ev)=>this.update_paipu(ev));
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
        $('.flip > .pai', score).empty().append(pai('_'));
        $('*[name="baopai"]', score).eq(0).val(qipai.baopai);
        $('.flip > .pai', score).eq(0).empty().append(pai(qipai.baopai||'_'));
        let baopai = [], n = 1;
        for (let data of log) {
            if (data.kaigang) {
                $('*[name="baopai"]', score).eq(n).val(
                    (baopai.shift() || '') + data.kaigang.baopai);
                $('.flip > .pai', score).eq(n)
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
        $('*[name=baopai]', score).on('change', ()=> this.update_paipu());
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
        this.draw_paipu();

        this.changed();
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
        $('.score *[name="game"]', this._root).focus();

        return false;
    }

    select_log(log_idx) {

        this._log_idx = log_idx;

        if (log_idx >= 0) {

            hide($('.summary', this._root));
            $('.hule input', this._root).val('');

            this.init_moda();

            this.draw_score();
            this.draw_logs();
            this.draw_paipu();

            $('.menu .score', this._root).css('visibility','visible');
            show($('.paipu', this._root));
        }
        else {
            hide($('.paipu', this._root));

            this.draw_logs();
            this.draw_summary();

            $('.menu .score', this._root).css('visibility','hidden');
            $('.menu .log', this._root).children().eq(0).addClass('selected');
            show($('.summary', this._root));
        }
    }

    draw_paipu() {

        const paipu = $('.paipu', this._root);
        const log   = this._paipu.log[this._log_idx];
        const moda  = moda_accessor(paipu, this._pai);

        $('input', paipu).val('');
        $('.pai', paipu).empty();
        $('.text', paipu).text('');
        $('.defen .fenpei', paipu).removeClass('plus minus').text('');
        hide($('.result', paipu));
        hide($('.result .button', paipu));
        show($('.result .text', paipu));

        let l = 0, t = 0;

        for (let i = 0; i < log.length; i++) {

            let data = log[i];

            if (data.qipai) {
                this._model.qipai(data.qipai);
                for (let l = 0; l < 4; l++) {
                    $('.player .jia', paipu).eq(l)
                            .text(['東','南','西','北'][l]);
                    let id = (this._paipu.qijia + data.qipai.jushu + l) % 4;
                    $('.player .name', paipu).eq(l)
                            .text(this._paipu.player[id].replace(/\n.*$/,''));
                    $('[name="defen"]', paipu).eq(l).val(data.qipai.defen[l]);

                    $('[name="qipai"]', paipu).eq(l).val(data.qipai.shoupai[l]);
                    new Shoupai($('.qipai .shoupai', paipu).eq(l), this._pai,
                            Majiang.Shoupai.fromString(data.qipai.shoupai[l])
                        ).redraw(true);
                }
            }
            else if (data.zimo) {
                this._model.zimo(data.zimo);
                if (data.zimo.l < l) t++;
                let text;
                if (log[i + 1] && log[i + 1].hule) text = 'ツモ';
                l = data.zimo.l;
                moda(t, l, 'm', data.zimo.p, text);
            }
            else if (data.dapai) {
                this._model.dapai(data.dapai);
                if (data.dapai.l < l) t++;
                let text = '';
                let p = data.dapai.p.replace(/[\+\=\-]$/,'');
                if (p.match(/\*$/)) text = 'リーチ';
                if (log[i + 1] && log[i + 1].hule) text += '放銃';
                l = data.dapai.l;
                moda(t, l, 'd',
                        data.dapai.p[2] == '_' ? data.dapai.p.slice(2)
                                               : data.dapai.p,
                        text);
            }
            else if (data.fulou) {
                this._model.fulou(data.fulou);
                t++;
                let text;
                let m = data.fulou.m.replace(/0/,'5');
                if      (m.match(/(\d)\1\1\1/)) text = 'カン';　
                else if (m.match(/(\d)\1\1/))   text = 'ポン';
                else                            text = 'チー';
                l = data.fulou.l;
                moda(t, l, 'm', data.fulou.m, text);
            }
            else if (data.gang) {
                this._model.gang(data.gang);
                moda(t, l, 'd', data.gang.m, 'カン');
            }
            else if (data.gangzimo) {
                this._model.zimo(data.gangzimo);
                t++;
                l = data.gangzimo.l;
                moda(t, l, 'm', data.gangzimo.p);
            }
            else if (data.kaigang) {
                this._model.kaigang(data.kaigang);
            }
            else if (data.hule) {
                this._model.hule(data.hule);
                let hule = data.hule;
                this._model.shoupai[hule.l].fromString(hule.shoupai);
                let result = (hule.baojia != null ? 'ロン: ' : 'ツモ: ')
                           + (hule.baojia != null ? hule.defen
                               : l == 0 ? `${hule.defen / 3} オール`
                               : (Math.ceil(hule.defen / 200) * 100 / 2) + ' / '
                                    + (Math.floor(hule.defen / 200) * 100));
                $('.result .text', paipu).eq(hule.l).text(result);
                show($('.result', paipu).eq(hule.l));
                $('.defen .fenpei', paipu).eq(hule.l).addClass('plus');
                if (hule.baojia != null)
                    $('.defen .fenpei', paipu).eq(hule.baojia)
                                                    .addClass('minus');
            }
            else if (data.pingju) {
                this._model.pingju(data.pingju);
                let pingju = data.pingju;
                let result = '流局';
                if (pingju.name != result) result += `(${pingju.name})`;
                $('.result .text', paipu).eq(0).text(result);
                show($('.result', paipu).eq(0));
                /**** 暫定処理 ****/
                this._model._fenpei = [];
                pingju.fenpei.forEach((fenpei, l) => {
                    this._model._fenpei[l] = fenpei;
                });

            }
        }

        for (let l = 0; l < 4; l++) {
            if (log[0].qipai.shoupai[l]) {
                $('>.shoupai', paipu).eq(l).css('visibility','visible')
                new Shoupai($('>.shoupai', paipu).eq(l), this._pai,
                            this._model.shoupai[l]).redraw(true);
            }
            else {
                $('>.shoupai', paipu).eq(l).css('visibility','hidden')
            }
            if (this._model._fenpei) {
                let id = this._model.player_id[l];
                this._model.defen[id] += this._model._fenpei[l];
                let fenpei = this._model.defen[id] - log[0].qipai.defen[l]
                if (fenpei > 0) fenpei = '+' + fenpei;
                $('.defen .fenpei', paipu).eq(l).text(fenpei);
            }
        }

        if (! log.find(data => data.hule || data.pingju)) {
            hide($('.result .text', paipu));
            show($('.result .button', paipu).eq(0));
            show($('.result', paipu).eq(0));
        }
    }
    update_paipu() {

        const score = $('.score', this._root);
        const paipu = $('.paipu', this._root);
        const moda  = moda_accessor(paipu);

        let log        = [];
        let baopai     = $('.score [name="baopai"]', this._root)
                                    .toArray().map(n => $(n).val());
        let weikaigang = [];

        const kaigang = ()=>{
            if (weikaigang[0][0] != '>')
                log.push({ kaigang: { baopai: weikaigang.shift() } });
            weikaigang.forEach((p, i) => weikaigang[i] = p.slice(1));
        };

        let qipai = {
            zhuangfeng: $('[name="game"]', score).val() >> 2,
            jushu:      $('[name="game"]', score).val()  % 4,
            changbang:  + $('[name="changbang"]', score).val(),
            lizhibang:  + $('[name="lizhibang"]', score).val(),
            defen:      $('[name="defen"]', paipu)
                                .toArray().map(n => + $(n).val()),
            baopai:     baopai.shift(),
            shoupai:    $('[name="qipai"]', paipu)
                                .toArray().map(n => $(n).val())
        };
        log.push({ qipai: qipai });

        let gang = false;

        for (let t = 0; t < 30; t++) {
            for (let l = 0; l < 4; l++) {
                let mo = moda(t, l, 'm');
                if (mo) {
                    if (! mo.match(/\d\d/)) {
                        if (! gang) {
                            log.push({ zimo: { l: l, p: mo } });
                        }
                        else {
                            log.push({ gangzimo: { l: l, p: mo } });
                            gang = false;
                            weikaigang.push(baopai.shift());
                        }
                    }
                    else {
                        log.push({ fulou: { l: l, m: mo } });
                        if (mo.match(/\d{3}.*\d/)) gang = true;
                    }
                }
                if (weikaigang.length) kaigang();

                let da = moda(t, l, 'd');
                if (da) {
                    if (! da.match(/\d\d/)) {
                        let p = da[0] == '_' ? mo + da : da;
                        log.push({ dapai: { l: l, p: p } });
                    }
                    else {
                        log.push({ gang: { l: l, m: da } });
                        gang = true;
                    }
                }
                if (weikaigang.length) kaigang();
            }
        }

        this._paipu.log[this._log_idx]
                .filter((data)=> data.hule || data.pingju)
                .forEach((data)=> log.push(data));
        this._paipu.log.splice(this._log_idx, 1, log);

        this.changed();

        this.draw_score();
        this.draw_paipu();
    }
}
