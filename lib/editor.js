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

function moda_maker(root) {

    function init(moda) {
        let r = moda.eq(0).children().eq(0).clone();
        $('.flip >.pai',  r).empty();
        $('.flip >input', r).val('');
        $('.text',        r).text('');
        return r;
    }
    const mo = init($('.paipu .mo', root));
    const da = init($('.paipu .da', root));

    return function(t) {
        for (let l = 0; l < 4; l++) {
            let mo_base = $('.paipu .mo', root).eq(l);
            while (mo_base.children().length <= t) {
                let r = mo.clone();
                flipInput($('.flip', r).attr('tabindex',
                                             mo_base.children().length + 1));
                mo_base.append(r);
            }
            let da_base = $('.paipu .da', root).eq(l);
            while (da_base.children().length <= t) {
                let r = da.clone();
                flipInput($('.flip', r).attr('tabindex',
                                             da_base.children().length + 1));
                da_base.append(r);
            }
        }
    }
}

function board_keeper(board) {
    return function(data) {
        try {
            if      (data.qipai)    board.qipai(data.qipai);
            else if (data.zimo)     board.zimo(data.zimo);
            else if (data.dapai)    board.dapai(data.dapai);
            else if (data.fulou)    board.fulou(data.fulou);
            else if (data.gang)     board.gang(data.gang);
            else if (data.gangzimo) board.zimo(data.gangzimo);
            else if (data.kaigang)  board.kaigang(data.gangzimo);
            else if (data.hule)     board.hule(data.hule);
            else if (data.pingju)   board.pingju(data.pingju);
        }
        catch(e) {
            console.log(e);
            return e.message;
        }
    }
}

function get_next(paipu, rule, log) {

    if (! log) {
        return { qipai: {
            zhuangfeng: 0,
            jushu:      0,
            changbang:  0,
            lizhibang:  0,
            defen:      [0,0,0,0].map(x => rule['配給原点']),
            baopai:     '',
            shoupai:    ['','','','']
        } };
    }

    let board = new Majiang.Board(paipu);
    const apply = board_keeper(board);

    let lianzhuang, changbang;
    for (let data of log) {

        apply(data);

        if (data.qipai) {
            changbang = board.changbang;
        }
        if (data.hule) {
            if (rule['連荘方式'] > 0 && data.hule.l == 0) {
                lianzhuang = true;
                changbang++;
            }
            board.lizhibang = 0;
        }
        else if (data.pingju) {
            if (board.shan.paishu > 0)      lianzhuang = true;
            else if (rule['連荘方式'] == 2
                    && Majiang.Util.xiangting(board.shoupai[0]) == 0
                    && Majiang.Util.tingpai(board.shoupai[0]).length)
                                            lianzhuang = true;
            else if (rule['連荘方式'] == 3) lianzhuang = true;
            changbang++;
        }

        /*** 暫定処理 ***/
        if (data.hule || data.pingju) {
            let fenpei = data.hule ? data.hule.fenpei : data.pingju.fenpei;
            for (let l = 0; l < 4; l++) {
                let id = board.player_id[l];
                board.defen[id] += fenpei[l];
            }
        }
    }

    let game = board.zhuangfeng * 4 + board.jushu;
    if (! lianzhuang) game++;

    let defen = board.defen.concat();

    return { qipai: {
        zhuangfeng: game >> 2,
        jushu:      game  % 4,
        changbang:  board.changbang == changbang ? 0 : changbang,
        lizhibang:  board.lizhibang,
        defen:      defen.splice((paipu.qijia + game) % 4).concat(defen),
        baopai:     '',
        shoupai:    ['','','','']
    } };
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

    constructor(root, paipu, rule, pai, callback, save, viewer) {
        this._root  = root;
        this._paipu = paipu;
        this._rule  = rule;
        this._pai   = pai;
        this._model = new Majiang.Board(paipu);

        this.init_menu(callback, save, viewer);

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
        $(window).on('beforeunload', (ev)=>{
            const message = 'ページを離れますがよろしいですか？';
            ev.returnValue = message;
            return message;
        });
        this._unsaved  = true;
    }

    init_menu(callback, save, viewer) {

        const menu   = $('.menu', this._root);

        $('.title', menu).text(this._paipu.title);

        $('.save', menu).off('click').on('click', ()=>{
            this._paipu.rank = get_rank(this._paipu.qijia, this._paipu.defen);
            save();
            fadeIn(this._root);
            this._unsaved = false;
            $(window).off('beforeunload');
        });

        $('.replay', menu).off('click').on('click', ()=>{
            viewer(this._paipu).preview(this._log_idx);
        });

        $('.exit', menu).off('click').on('click', ()=>{
            const message = '未保存の修正がありますが、編集を終了しますか？';
            if (! this._unsaved || window.confirm(message)) {
                $(window).off('beforeunload');
                callback();
            }
        });

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

    select_log(log_idx) {

        this._log_idx = log_idx;

        if (log_idx >= 0) {
            hide($('.overview', this._root));

            this.init_paipu();
            this.draw_score();
            this.draw_logs();
            this.draw_paipu();

            $('.menu .score', this._root).css('visibility','visible');
            show($('.paipu', this._root));
        }
        else {
            hide($('.paipu', this._root));
            $('.menu .score', this._root).css('visibility','hidden');

            this.draw_logs();
            this.draw_overview();

            show($('.overview', this._root));
        }
    }
    add_log(log_idx) {

        let qipai = get_next(this._paipu, this._rule, this._paipu.log[log_idx]);

        this._paipu.log.splice(log_idx + 1, 0, [ qipai ]);

        this.changed();

        this.select_log(log_idx + 1);
        $('.score *[name="game"]', this._root).focus();

        return false;
    }
    delete_log(log_idx) {

        this._paipu.log.splice(log_idx, 1);

        this.changed();

        this.select_log(log_idx - 1);

        return false;
    }

    draw_score() {

        const score = $('.score', this._root);
        const pai   = this._pai;
        const log   = this._paipu.log[this._log_idx];
        const qipai = log[0].qipai;

        $('[name="game"]', score).val(qipai.zhuangfeng * 4 + qipai.jushu);

        $('[name="changbang"]', score).val(qipai.changbang);
        $('[name="lizhibang"]', score).val(qipai.lizhibang);

        $('[name="baopai"]', score).val('');
        $('.flip >.pai', score).empty().append(pai('_'));
        $('.flip', score).attr('tabindex', -1)
        $('[name="baopai"]', score).eq(0).val(qipai.baopai);
        $('.flip >.pai', score).eq(0).empty().append(pai(qipai.baopai||'_'));
        $('.flip', score).eq(0).attr('tabindex', 0)
        let baopai = [], n = 1;
        for (let data of log) {
            if (data.kaigang) {
                $('[name="baopai"]', score).eq(n).val(
                    (baopai.shift() || '') + data.kaigang.baopai);
                $('.flip >.pai', score).eq(n)
                            .empty().append(pai(data.kaigang.baopai||'_'));
                $('.flip', score).eq(n).attr('tabindex', 0)
                n++;
            }
            else {
                baopai.forEach((p, i)=> baopai[i] += '>');
            }
            if (data.gangzimo) {
                 baopai.push('');
            }
        }

        score.off('change').on('change', ()=> this.update_score());
        $('[name=baopai]', score)
                .off('change').on('change', ()=> this.update_paipu());
    }
    update_score() {

        const qipai = this._paipu.log[this._log_idx][0].qipai;
        const score = $('.score', this._root);

        let defen = $('.paipu [name="defen"]').toArray().map(n => + $(n).val());
        let jushu = qipai.jushu;

        qipai.zhuangfeng = $('[name="game"]', score).val() >> 2;
        qipai.jushu      = $('[name="game"]', score).val()  % 4;
        qipai.changbang  = + $('[name="changbang"]', score).val();
        qipai.lizhibang  = + $('[name="lizhibang"]', score).val();
        qipai.baopai     = $('[name=baopai]', score).eq(0).val();

        qipai.defen = defen.splice(qipai.jushu - jushu).concat(defen);

        this.draw_score();
        this.draw_logs();
        this.draw_paipu();

        this.changed();
    }

    draw_logs() {

        const logs = $('.menu .log', this._root);
        const row  = logs.children().eq(0).removeClass('selected');
        logs.empty();
        logs.append(row);

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
            let message = $('.name', r).text() + ' を削除しますか？'
            if (i > 0) $('.minus', r).off('click').on('click', ()=>
                        window.confirm(message) && this.delete_log(i - 1));
        });

        row.on('click', ()=>this.select_log(-1));
        if (this._log_idx == -1) row.addClass('selected');
    }

    draw_overview() {

        const overview = $('.overview', this._root);
        const paipu    = this._paipu;

        $('[name="title"]', overview).val(paipu.title);
        $('[name="qijia"]', overview).val([paipu.qijia]);

        for (let id = 0; id < 4; id++) {
            $('[name="player"]', overview).eq(id).val(paipu.player[id]);
            $('[name="defen"]',  overview).eq(id).val(paipu.defen[id]);
            $('[name="point"]',  overview).eq(id).val(paipu.point[id] || '-');
        }
        overview.on('change', ()=> this.update_overview());
    }
    update_overview() {

        const overview = $('.overview', this._root);
        const paipu    = this._paipu;

        paipu.title  = $('[name="title"]', overview).val();
        paipu.qijia  = + $('[name="qijia"]:checked', overview).val();
        paipu.player = $('[name="player"]', overview)
                                    .toArray().map(n => $(n).val());
        paipu.defen  = $('[name="defen"]', overview)
                                    .toArray().map(n => $(n).val());
        paipu.point  = $('[name="point"]', overview)
                                    .toArray().map(n => $(n).val() || '-');

        this.changed();

        $('.menu .title', this._root).text(paipu.title);
    }

    init_paipu() {
        flipInput($('.paipu .qipai.flip').attr('tabindex', 1));

        const add_moda = moda_maker(this._root);
        $('.paipu .mo', this._root).empty();
        $('.paipu .da', this._root).empty();
        add_moda(0);
    }
    draw_paipu() {

        const paipu = $('.paipu', this._root);
        const log   = this._paipu.log[this._log_idx];
        const moda  = moda_accessor(paipu, this._pai);

        const add_moda = moda_maker(this._root);
        const apply    = board_keeper(this._model);

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
            let error = apply(data);

            if (data.qipai) {
                for (let l = 0; l < 4; l++) {
                    $('.player .jia', paipu).eq(l)
                            .text(['東','南','西','北'][l]);
                    let id = (this._paipu.qijia + data.qipai.jushu + l) % 4;
                    $('.player .name', paipu).eq(l)
                            .text(this._paipu.player[id].replace(/\n.*$/,''));
                    $('[name="defen"]', paipu).eq(l).val(data.qipai.defen[l]);

                    $('[name="qipai"]', paipu).eq(l).val(data.qipai.shoupai[l]);
                    new Shoupai($('.qipai .shoupai', paipu).eq(l), this._pai,
                                    this._model.shoupai[l]).redraw(true);
                }
            }
            else if (data.zimo) {
                if (data.zimo.l < l) t++;
                let text;
                if (log[i + 1] && log[i + 1].hule) text = 'ツモ';
                l = data.zimo.l;
                moda(t, l, 'm', data.zimo.p, text);
            }
            else if (data.dapai) {
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
                let text = 'カン';
                if (log[i + 1] && log[i + 1].hule) text += '放銃';
                moda(t, l, 'd', data.gang.m, text);
            }
            else if (data.gangzimo) {
                t++;
                let text;
                if (log[i + 1] && log[i + 1].hule) text = 'ツモ';
                l = data.gangzimo.l;
                moda(t, l, 'm', data.gangzimo.p, text);
            }
            else if (data.kaigang) {
            }
            else if (data.hule) {
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
                $('.result', paipu).eq(hule.l)
                    .off('click').on('click', ()=> this.open_hule_dialog(hule));
            }
            else if (data.pingju) {
                let pingju = data.pingju;
                let result = '流局';
                if (pingju.name != result) result += `(${pingju.name})`;
                $('.result .text', paipu).eq(0).text(result);
                show($('.result', paipu).eq(0));
                $('.result', paipu).eq(0).off('click').on('click',
                                        ()=>this.open_pingju_dialog(pingju));

                /**** 暫定処理 ****/
                this._model._fenpei = [];
                pingju.fenpei.forEach((fenpei, l) => {
                    this._model._fenpei[l] = fenpei;
                });
            }

            add_moda(t + 1);
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
            $('.result', paipu)
                .off('click').on('click', ()=> this.open_hule_dialog());
        }

        $('.paipu input', this._root)
                .off('change').on('change', (ev)=>this.update_paipu(ev));
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
            if (weikaigang[0] && weikaigang[0][0] != '>')
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

        baopai.forEach(p => p && log.push({ kaigang: { baopai: p } }));

        this._paipu.log[this._log_idx]
                .filter((data)=> data.hule || data.pingju)
                .forEach((data)=> log.push(data));
        this._paipu.log.splice(this._log_idx, 1, log);

        this.changed();

        this.draw_score();
        this.draw_paipu();
    }

    open_hule_dialog(hule) {

        const search_hule = ()=>{
            const model = this._model;
            if (model.lunban >=0 ) {
                for (let i = 0; i < 4; i++) {
                    let l = (model.lunban + i) % 4;
                    hule = this.make_hule(l);
                    if (hule.defen) return hule;
                }
            }
            return {
                fubaopai: [],
                hupai:    [],
                fenpei:   []
            };
        };

        if (! hule) hule = search_hule();

        if (! hule.defen) return this.open_pingju_dialog();

        this.draw_hule_dialog(hule);
        $('dialog.pingju', this._root).get(0).close();
        $('dialog.hule', this._root).get(0).showModal();
    }

    make_hule(l, fubaopai = []) {

        function seek_log(l, log, param) {
            let last, diyizimo, yifa;
            for (let data of log) {
                if (data.qipai) diyizimo = true;
                if (data.dapai && data.dapai.l == l
                    && data.dapai.p.slice(-1) == '*')
                {
                    param.lizhi = diyizimo ? 2 : 1;
                    yifa = true;
                }
                if (data.hule || data.pingju) break;

                if (! data.kaigang) last = data;

                if (last.dapai && last.dapai.l == 3
                    || last.fulou || last.gang) diyizimo = false;
                if (last.zimo && last.zimo.l == l
                    || last.fulou || last.gangzimo) yifa = false;
            }
            if (yifa)           param.yifa      = true;
            if (last.zimo && diyizimo)
                                param.tianhu    = last.zimo.l == 0 ? 1 : 2;
            if (last.gang)      param.qianggang = true;
            if (last.gangzimo)  param.lingshang = true;
            if (! model.shan.paishu && ! last.gangzimo)
                                param.haidi     = last.zimo ? 1 : 2;
            return last;
        }

        const log   = this._paipu.log[this._log_idx];
        const model = this._model;

        let param = {
            rule:       this._rule,
            zhuangfeng: model.zhuangfeng,
            menfeng:    l,
            baopai:     model.shan.baopai,
            fubaopai:   fubaopai,
            changbang:  model.changbang,
            lizhibang:  model.lizhibang
        };
        let last = seek_log(l, log, param);

        let shoupai = model.shoupai[l].clone();
        let rongpai, baojia;
        if (last.dapai || last.gang) {
            if (last.dapai) {
                rongpai = last.dapai.p.slice(0,2);
                baojia  = last.dapai.l;
            }
            if (last.gang) {
                rongpai = last.gang.m[0] + last.gang.m.slice(-1);
                baojia  = last.gang.l;
            }
            if (shoupai._zimo == rongpai) shoupai.dapai(rongpai);
            rongpai = rongpai + ['_','+','=','-'][(4 + baojia - l) % 4];
            if (baojia == l) rongpai = null;
        }

        let hule = Majiang.Util.hule(shoupai, rongpai,
                                     Majiang.Util.hule_param(param));

        if (hule && hule.defen) {
            return {
                l:          l,
                shoupai:    (rongpai ? shoupai.zimo(rongpai) : shoupai)
                                                                .toString(),
                baojia:     baojia,
                fubaopai:   fubaopai,
                damanguan:  hule.damanguan,
                fu:         hule.fu,
                fanshu:     hule.fanshu,
                defen:      hule.defen,
                hupai:      hule.hupai,
                fenpei:     hule.fenpei
            }
        }
        else {
            return {
                l:        l,
                shoupai: (rongpai ? shoupai.zimo(rongpai) : shoupai).toString(),
                baojia:   baojia,
                fubaopai: fubaopai,
                hupai:    [],
                fenpei:   []
            }
        }
    }

    init_hule_dialog() {
        const player    = this._paipu.player;
        const player_id = this._model.player_id;
        const form      = $('.hule form', this._root);

        for (let name of ['l','baojia']) {
            const select = $(`select[name="${name}"]`, form);
            const row = select.children().eq(0);
            select.empty();
            select.append(row);
            for (let l = 0; l < 4; l++) {
                let r = row.clone()
                        .text(['東','南','西','北'][l] + ': '
                            + player[player_id[l]].replace(/\n.*$/,''))
                        .val(l);
                select.append(r);
            }
        }

        flipInput($('.flip'), form);
    }
    draw_hule_dialog(hule) {

        const draw_fubaopai = ()=>{
            for (let i = 0; i < 5; i++) {
                let p = Majiang.Shoupai.valid_pai(
                            $('[name="fubaopai"]', form).eq(i).val());
                $('.flip >.pai', shan).eq(i).empty().append(pai(p||'_'));
            }
        };

        const pai  = this._pai;
        const form = $('.hule form', this._root);

        this.init_hule_dialog();

        $('[name="l"]',      form).val(hule.l);
        $('[name="baojia"]', form).val(hule.baojia);

        const shoupai = Majiang.Shoupai.fromString(hule.shoupai);
        const shan = $('.shan', form);
        $('[name="fubaopai"]', form).val('');
        if (shoupai.lizhi || hule.fubaopai && hule.fubaopai.length ) {
            show($('.fubaopai'), form);
            (hule.fubaopai||[]).forEach((p, i)=>{
                $('[name="fubaopai"]', form).eq(i).val(p);
            });
            draw_fubaopai();
        }
        else {
            hide($('.fubaopai'), form);
        }

        $('[name="shoupai"]', form).val(hule.shoupai);
        new Shoupai($('.shoupai .shoupai', form), this._pai, shoupai)
                                                            .redraw(true);
        const hupai = $('.hupai', form);
        $('input', hupai).val('');
        const row = hupai.children().eq(0);
        hupai.empty();
        for (let h of hule.hupai) {
            let r = row.clone();
            $('[name="hupai"]', r).val(h.name);
            $('[name="fanshu"]', r).val(h.fanshu);
            hupai.append(r);
        }
        hupai.append(row);

        if (hule.damanguan) {
            show($('.damanguan', form));
            hide($('.normal', form));
            $('[name="damanguan"]', form).val(hule.damanguan);
        }
        else {
            hide($('.damanguan', form));
            show($('.normal', form));
            $('[name="damanguan"]', form).val('');
        }
        $('.defen [name="fu"]', form).val(hule.fu);
        $('.defen [name="fanshu"]', form).val(hule.fanshu);
        $('.defen [name="defen"]', form).val(hule.defen);

        for (let l = 0; l < 4; l++) {
            $('[name="fenpei"]', form).eq(l).val(hule.fenpei[l]);
        }

        $('[name="l"]', form).off('change').on('change', ()=>{
            let l = $('[name="l"]', form).val();
            if (! l) this.open_pingju_dialog();
            else     this.draw_hule_dialog(this.make_hule(l));
        });
        $('[name="fubaopai"]', form).off('change').on('change', ()=>{
            let fubaopai = $('[name="fubaopai"]', form)
                            .toArray().map(n => $(n).val()).filter(p => p);
            this.draw_hule_dialog(this.make_hule(hule.l, fubaopai));
        });

        $('input.close',  form).on('click', ()=> this.close_dialog());
        $('input.delete', form).on('click', ()=> this.delete_hule());
        form.off('submit').on('submit', ()=>this.update_hule());
    }
    get_hule() {
        const form = $('.hule form', this._root);
        let baojia = $('[name="baojia"]', form).val();
        let fubaopai = $('[name="fubaopai"]', form)
                            .toArray().map(n => $(n).val()).filter(p => p);
        let damanguan = $('[name="damanguan"]', form).val();
        damanguan = damanguan ? + damanguan : undefined;
        let fu, fanshu;
        if (! damanguan) {
            fu     = + $('.defen [name="fu"]', form).val();
            fanshu = + $('.defen [name="fanshu"]', form).val();
        }
        let hupai = [];
        $('[name="hupai"]', form).each((i, n)=>{
            let name = $(n).val();
            let fanshu = $('[name="fanshu"]', form).eq(i).val();
            if (fanshu[0] != '*') fanshu = + (fanshu || 0);
            if (name) hupai.push({ name: name, fanshu: fanshu });
        });

        return { hule: {
            l:          + $('[name="l"]', form).val(),
            shoupai:    $('[name="shoupai"]', form).val(),
            baojia:     baojia == '' ? null : + baojia,
            fubaopai:   fubaopai.length ? fubaopai : null,
            damanguan:  damanguan,
            fu:         fu,
            fanshu:     fanshu,
            defen:      + $('.defen [name="defen"]', form).val(),
            hupai:      hupai,
            fenpei:     $('[name="fenpei"]', form)
                                .toArray().map(n => + ($(n).val() || 0))
        } };
    }
    update_hule() {
        const hule = this.get_hule();
        const log = this._paipu.log[this._log_idx];
        let idx = -1;
        log.forEach((data, i)=>{
            if (data.hule && data.hule.l == hule.hule.l) idx = i;
        });
        if (idx >= 0) log[idx] = hule;
        else          log.push(hule)
        this.update_paipu();
        this.changed();
    }
    delete_hule() {
        const log_idx = this._log_idx;

        $('dialog.hule',  this._root).get(0).close();
        $('dialog.pingju', this._root).get(0).close();

        let log = this._paipu.log[log_idx]
                        .filter((data)=> ! (data.hule || data.pingju));
        this._paipu.log[log_idx] = log;

        this.update_paipu();
        this.changed();
    }
    close_dialog() {
        $('dialog.hule',   this._root).get(0).close();
        $('dialog.pingju', this._root).get(0).close();
    }

    open_pingju_dialog(pingju) {

        if (! pingju) pingju = this.make_pingju();
        this.init_pingju_dialog();
        this.set_pingju_dialog(pingju);
        this.draw_pingju_dialog();

        $('dialog.hule', this._root).get(0).close();
        $('dialog.pingju', this._root).get(0).showModal();
    }
    make_pingju() {
        const log   = this._paipu.log[this._log_idx];
        const model = this._model;

        let pingju = { name: '', shoupai: ['','','',''], fenpei: [0,0,0,0] };
        let last = log[log.length - 1];

        if (last.dapai) {
            for (let l = 0; l < 4; l++) {
                if (Majiang.Util.xiangting(model.shoupai[l]) == 0) {
                    pingju.shoupai[l] = model.shoupai[l].toString();
                }
            }
            if (! model.shan.paishu) {
                pingju.name = '荒牌平局';
                let n_tingpai = pingju.shoupai.filter(s=>s).length;
                if (0 < n_tingpai && n_tingpai < 4) {
                    for (let l = 0; l < 4; l++) {
                        pingju.fenpei[l]
                            = pingju.shoupai[l] ?   3000 / n_tingpai
                            :                     - 3000 / (4 - n_tingpai);
                    }
                }
            }
        }
        if (last.zimo) {
            pingju.shoupai[last.zimo.l] = model.shoupai[last.zimo.l].toString();
        }

        return pingju;
    }
    init_pingju_dialog() {
        const form  = $('.pingju form', this._root);

        flipInput($('.flip'), form);
        form.off('change').on('change', ()=> this.draw_pingju_dialog());
        form.off('submit').on('submit', ()=> this.submit_pingju_dialog());
        $('input.delete', form).on('click', ()=> this.delete_hule());
        $('input.close',  form).on('click', ()=> this.close_dialog());
    }
    set_pingju_dialog(pingju) {
        const form  = $('.pingju form', this._root);
        const model = this._model;

        $('[name="pingju"]', form).val(pingju.name);
        for (let l = 0; l < 4; l++) {
            $('[name="fenpei"]', form).eq(l).val(pingju.fenpei[l]);
            $('[name="daopai"]', form).eq(l).val([pingju.shoupai[l] ? 1 : 0]);
            let shoupai = pingju.shoupai[l] || model.shoupai[l].toString();
            $('[name="shoupai"]', form).eq(l).val(shoupai);
        }
    }
    draw_pingju_dialog() {
        const form  = $('.pingju form', this._root);

        for (let l = 0; l < 4; l++) {
            new Shoupai($('.shoupai .shoupai', form).eq(l), this._pai,
                        Majiang.Shoupai.fromString(
                            $('[name="shoupai"]', form).eq(l).val())
                    ).redraw($('[name="daopai"]', form).eq(l).prop('checked'));
        }
    }
    get_pingju() {
        const form  = $('.pingju form', this._root);
        return { pingju: {
            name:    $('[name="pingju"]', form).val() || '流局',
            shoupai: $('[name="daopai"]', form).toArray()
                        .map((n, i)=> $(n).prop('checked')
                            ? $('[name="shoupai"]', form).eq(i).val() : ''),
            fenpei:  $('[name="fenpei"]', form).toArray()
                                            .map(n => + $(n).val())
        } };
    }
    submit_pingju_dialog() {
        const log_idx = this._log_idx;

        let log = this._paipu.log[log_idx]
                            .filter((data)=> ! (data.hule || data.pingju));
        log.push(this.get_pingju());
        this._paipu.log[log_idx] = log;

        this.update_paipu();
        this.changed();
    }
}
