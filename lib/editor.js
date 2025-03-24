/*
 *  Majiang.UI.PaipuEditor
 */
"use strict";

const $ = require('jquery');
const Majiang = require('@kobalab/majiang-core');

const Shoupai = require('./shoupai');

const { hide, show, fadeIn, fadeOut } = require('./fadein');
const flipInput = require('./flip');

function split_paistr(paistr) {
    let pai = [];
    for (let suitstr of paistr.match(/[mpsz]\d[\d\+\=\-]*/g)||[]) {
        let s = suitstr[0];
        for (let n of suitstr.match(/\d/g)) {
            pai.push(s+n);
        }
    }
    return pai;
}

function baopai_drawer(root, pai) {
    $('.pai', root).empty().append(pai('_'));
    $('[name="baopai"]', root).val('');
    root.children().attr('tabindex', -1).removeClass('error');
    let n = 0;
    return function(val, error) {
        root.children().eq(n).attr('tabindex', 0);
        if (! val) return;
        let p = val.replace(/^>+/,'');
        if (Majiang.Shoupai.valid_pai(p)) {
            $('>.pai', root.children().eq(n)).empty().append(pai(p));
        }
        else {
            root.children().eq(n).addClass('error');
            $('>.pai', root.children().eq(n)).empty().text(p);
        }
        if (error) {
            root.children().eq(n).addClass('error');
        }
        $('[name="baopai"]', root).eq(n).val(val);
        n++;
    }
}

function draw_qipai(root, pai, paistr, badpai) {
    let col = root.children().eq(0).empty().removeClass('error');
    root.empty();
    let n = 0;
    for (let p of split_paistr(Majiang.Shoupai.fromString(paistr).toString())) {
        let c = col.clone().append(pai(p));
        if (badpai(p)) c.addClass('error');
        root.append(c);
        n++;
    }
    for (let i = 0; i < 13 - n; i++) {
        let c = col.clone().append(pai('_'));
        root.append(c);
    }
}

function moda_accessor(root, pai) {
    return function(t, l, md, val, text, error) {
        const moda = (t, l, md)=>
                (md == 'm')
                        ? $('.moda', $('.mo', root).eq(l)).eq(t)
                        : $('.moda', $('.da', root).eq(l)).eq(t);
        if (val == null) {
            return  $('input', moda(t, l, md)).val();
        }
        else {
            if (error) {
                moda(t, l, md).addClass('error');
            }
            $('input', moda(t, l, md)).val(val);
            if (md == 'd' && val[0] == '_') {
                $('.pai', moda(t, l, 'm')).text('↓');
                val = $('input', moda(t, l, 'm')).val() + val;
                if (moda(t, l, 'm').hasClass('error')) {
                    moda(t, l, 'm').removeClass('error');
                    moda(t, l, 'd').addClass('error');
                }
            }
            if (Majiang.Shoupai.valid_pai(val)
                || Majiang.Shoupai.valid_mianzi(val))
            {
                $('.pai', moda(t, l, md)).append(
                        pai(val.replace(/^([mpsz])\d{3}[+\=\-](\d)$/, '$1$2')
                               .replace(/^([mpsz]).*(\d)[\+\=\-].*$/, '$1$2')
                               .replace(/^([mpsz]\d).*$/, '$1')));
                $('.text', moda(t, l, md)).text(text);
            }
            else {
                moda(t, l, md).addClass('error');
                $('.pai', moda(t, l, md)).text(val);
            }
        }
    }
}

function moda_maker(root) {

    function init(moda) {
        let r = moda.eq(0).children().eq(0).clone();
        $('.flip >.pai',  r).empty();
        $('.flip >input', r).val('');
        $('.text',        r).text('');
        r.removeClass('error');
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
            else if (data.kaigang)  board.kaigang(data.kaigang);
            else if (data.hule)     board.hule(data.hule);
            else if (data.pingju)   board.pingju(data.pingju);
        }
        catch(e) {
            return e;
        }
    }
}

function count_pai(log) {

    let paishu = {
        m: [0,4,4,4,4,4,4,4,4,4],
        p: [0,4,4,4,4,4,4,4,4,4],
        s: [0,4,4,4,4,4,4,4,4,4],
        z: [0,4,4,4,4,4,4,4]
    };
    let fubaopai = [];
    let badpai = {};

    function decrease(p) {
        let s = p[0], n = +p[1]||5;
        if (! paishu[s]) return;
        paishu[s][n]--;
        if (paishu[s][n] < 0) badpai[p] = true;
    }

    for (let data of log) {
        if (data.qipai) {
            for (let l = 0; l < 4; l++) {
                for (let p of split_paistr(data.qipai.shoupai[l])) {
                    decrease(p);
                }
            }
            if (data.qipai.baopai) decrease(data.qipai.baopai);
        }
        else if (data.zimo) {
            decrease(data.zimo.p);
        }
        else if (data.gangzimo) {
            decrease(data.gangzimo.p);
        }
        else if (data.kaigang) {
            decrease(data.kaigang.baopai);
        }
        else if (data.hule) {
            if (data.hule.fubaopai) fubaopai = data.hule.fubaopai;
        }
    }
    fubaopai.forEach(p => decrease(p));

    return function(p) {
        let s = p[0], n = +p[1]||5;
        return badpai[s+n];
    }
}

function get_next_qipai(paipu, rule, log) {

    if (! log) {
        return {
            zhuangfeng: 0,
            jushu:      0,
            changbang:  0,
            lizhibang:  0,
            defen:      [0,0,0,0].map(x => rule['配給原点']),
            baopai:     '',
            shoupai:    ['','','','']
        };
    }

    let board = new Majiang.Board(paipu);
    const apply = board_keeper(board);

    let lianzhuang;
    for (let data of log) {

        apply(data);

        if (data.hule) {
            if (rule['連荘方式'] > 0 && data.hule.l == 0) lianzhuang = true;
        }
        else if (data.pingju) {
            if (board.shan.paishu > 0)      lianzhuang = true;
            else if (rule['連荘方式'] == 2
                    && Majiang.Util.xiangting(board.shoupai[0]) == 0
                    && Majiang.Util.tingpai(board.shoupai[0]).length)
                                            lianzhuang = true;
            else if (rule['連荘方式'] == 3) lianzhuang = true;
        }
    }
    board.last();

    let game = board.zhuangfeng * 4 + board.jushu;
    if (! lianzhuang) game++;

    if (rule['連荘方式'] == 0) board.changbang = 0;

    let defen = board.defen.concat();

    return {
        zhuangfeng: game >> 2,
        jushu:      game  % 4,
        changbang:  board.changbang,
        lizhibang:  board.lizhibang,
        defen:      defen.splice((paipu.qijia + game) % 4).concat(defen),
        baopai:     '',
        shoupai:    ['','','','']
    };
}

function remake_defen(hule, rule) {
    let base;
    if (hule.hupai.find(h => h.fanshu[0] == '*')) {
        delete hule.fu;
        delete hule.fanshu;
        hule.hupai.forEach(h =>{
            if (h.fanshu[0] != '*') h.fanshu = '';
            delete h.baojia;
        });
        hule.damanguan
                = Math.min(hule.hupai.filter(h => h.fanshu.match(/^\*+$/))
                                     .map(h => h.fanshu.length)
                                     .reduce((x, y)=> x + y),
                           hule.damanguan || Infinity);
        base = 8000 * hule.damanguan;
    }
    else {
        delete hule.damanguan;
        hule.hupai  = hule.hupai.filter(h => h.name);
        hule.fu     = hule.fu || 30;
        hule.fanshu = hule.hupai.map(h => h.fanshu).reduce((x, y)=> x + y);
        base = (hule.fanshu >= 13 && rule['数え役満あり'])
                                   ? 8000
             : (hule.fanshu >= 11) ? 6000
             : (hule.fanshu >=  8) ? 4000
             : (hule.fanshu >=  6) ? 3000
             : rule['切り上げ満貫あり'] && hule.fu << (2 + hule.fanshu) == 1920
                                ? 2000
                                : Math.min(hule.fu << (2 + hule.fanshu), 2000);
    }

    if (hule.baojia == null) {
        let zhuanjia = Math.ceil(base * 2 / 100) * 100;
        let sanjia   = Math.ceil(base     / 100) * 100;
        hule.defen = hule.l == 0 ? zhuanjia * 3
                                 : zhuanjia + sanjia * 2;
    }
    else {
        hule.defen = hule.l == 0 ? Math.ceil(base * 6 / 100) * 100
                                 : Math.ceil(base * 4 / 100) * 100
    }
    return hule;
}

function remake_fenpei(hule) {
    let changbang = hule._changbang;
    let lizhibang = hule._lizhibang;
    let zhuanjia = Math.floor(hule.defen / 2 / 100) * 100;
    for (let l = 0; l < 4; l++) {
        if (hule.baojia == null) {
            hule.fenpei[l]
                = hule.l == l ?
                        hule.defen + changbang * 100 * 3 + lizhibang * 1000
                : hule.l == 0 ? - (hule.defen / 3 + changbang * 100)
                : l == 0      ? - (zhuanjia       + changbang * 100)
                :  - ((hule.defen - zhuanjia) / 2 + changbang * 100);
        }
        else {
            hule.fenpei[l]
                = hule.l == l ?
                        hule.defen + changbang * 100 * 3 + lizhibang * 1000
                : hule.baojia == l ? - (hule.defen + changbang * 100 * 3)
                : 0;
        }
    }
    return hule;
}

function pingju_fenpei(pingju) {
    pingju.fenpei = [ 0, 0, 0, 0 ];
    let n_tingpai = pingju.shoupai.filter(s=>s).length;
    if (0 < n_tingpai && n_tingpai < 4) {
        for (let l = 0; l < 4; l++) {
            pingju.fenpei[l] = pingju.shoupai[l] ?   3000 / n_tingpai
                                                 : - 3000 / (4 - n_tingpai);
        }
    }
    return pingju;
}

function jieju(paipu, rule) {

    if (! paipu.log.length) return { defen: [], rank: [], point: [] };

    const log = paipu.log[paipu.log.length - 1];
    let qipai = get_next_qipai(paipu, rule, log);

    let defen = paipu.defen.concat();
    if (! paipu.defen.length) {
        defen = qipai.defen.concat();
        defen = defen.splice((8 - paipu.qijia - qipai.jushu) % 4).concat(defen);
    }

    let paiming = [];
    for (let i = 0; i < 4; i++) {
        let id = (paipu.qijia + i) % 4;
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

    if (! paipu.defen.length) {
        defen[paiming[0]] += qipai.lizhibang * 1000;
        if (! log.find(data => data.hule || data.pingju))
                            return { defen: [], rank: rank, point: [] };
    }

    const round = ! rule['順位点'].find(p=>p.match(/\.\d$/));
    let point = [0,0,0,0];
    for (let i = 1; i < 4; i++) {
        let id = paiming[i];
        point[id] = (defen[id] - 30000) / 1000
                  + + rule['順位点'][i];
        if (round) point[id] = Math.round(point[id]);
        point[paiming[0]] -= point[id];
    }
    point = point.map(p=> p.toFixed(round ? 0 : 1));

    return { defen: defen, rank: rank, point: point };
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

        $(window).off('beforeunload');
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
            if (this._log_idx == -1) this.update_overview();
            this._paipu.rank = jieju(this._paipu, this._rule).rank;
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

        flipInput($('.shan .flip', score));
    }

    select_log(log_idx) {

        this._log_idx = log_idx;

        if (log_idx >= 0) {
            hide($('.overview', this._root));

            this.init_paipu();
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

        let qipai = get_next_qipai(this._paipu, this._rule,
                                   this._paipu.log[log_idx]);

        this._paipu.log.splice(log_idx + 1, 0, [ { qipai: qipai } ]);

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

        let r;
        if (! paipu.defen.length) r = jieju(paipu, this._rule);
        else                      r = paipu;

        $('[name="title"]', overview).val(paipu.title);
        $('[name="qijia"]', overview).val([paipu.qijia]);

        for (let id = 0; id < 4; id++) {
            $('[name="player"]', overview).eq(id).val(paipu.player[id]);
            $('[name="defen"]',  overview).eq(id).val(r.defen[id]);
            $('[name="point"]',  overview).eq(id).val(r.point[id]);
        }
        overview.off('change').on('change', ()=> this.update_overview());
    }
    update_overview() {

        const overview = $('.overview', this._root);
        const paipu    = this._paipu;

        paipu.title  = $('[name="title"]', overview).val();
        paipu.qijia  = + $('[name="qijia"]:checked', overview).val();
        paipu.player = $('[name="player"]', overview)
                            .toArray().map(n => $(n).val());
        paipu.defen  = $('[name="defen"]', overview)
                            .toArray().map(n => $(n).val() && + $(n).val());
        paipu.point  = $('[name="point"]', overview)
                            .toArray().map(n => $(n).val());

        if (! paipu.defen.filter(defen => defen != '').length) paipu.defen = [];
        if (! paipu.point.filter(defen => defen != '').length) paipu.point = [];

        this.changed();

        $('.menu .title', this._root).text(paipu.title);
    }

    init_paipu() {
        flipInput($('.paipu .qipai.flip', this._root).attr('tabindex', 1));

        const add_moda = moda_maker(this._root);
        $('.paipu .mo', this._root).empty();
        $('.paipu .da', this._root).empty();
        add_moda(0);
    }
    draw_paipu() {

        const score = $('.score', this._root);
        const paipu = $('.paipu', this._root);
        const log   = this._paipu.log[this._log_idx];
        const moda  = moda_accessor(paipu, this._pai);

        const add_baopai = baopai_drawer($('.shan', score), this._pai);
        const add_moda = moda_maker(this._root);
        const apply    = board_keeper(this._model);

        const next = (s)=>{
            for (let i = s + 1; i < log.length; i++) {
                if (log[i] && ! log[i].kaigang) return log[i];
            }
        };

        $('.moda', paipu).removeClass('error');
        $('input', paipu).val('');
        $('.pai', paipu).empty();
        $('.text', paipu).text('');
        $('.defen .fenpei', paipu).removeClass('plus minus').text('');
        hide($('.result', paipu));
        hide($('.result .button', paipu));
        show($('.result .text', paipu));

        const badpai = count_pai(log);

        let l = -1, t = 0, md,
            delay = [], shoupai = [];

        for (let i = 0; i < log.length; i++) {

            let data = log[i];
            let error = apply(data);

            if (data.qipai) {
                $('[name="game"]', score)
                            .val(data.qipai.zhuangfeng * 4 + data.qipai.jushu);
                $('[name="changbang"]', score).val(data.qipai.changbang);
                $('[name="lizhibang"]', score).val(data.qipai.lizhibang);
                add_baopai(data.qipai.baopai, badpai(data.qipai.baopai));
                for (let l = 0; l < 4; l++) {
                    $('.player .jia', paipu).eq(l)
                            .text(['東','南','西','北'][l]);
                    let id = (this._paipu.qijia + data.qipai.jushu + l) % 4;
                    $('.player .name', paipu).eq(l)
                            .text(this._paipu.player[id].replace(/\n.*$/,''));
                    $('[name="defen"]', paipu).eq(l).val(data.qipai.defen[l]);

                    $('[name="qipai"]', paipu).eq(l).val(data.qipai.shoupai[l]);
                    draw_qipai($('.qipai .shoupai', paipu).eq(l), this._pai,
                                data.qipai.shoupai[l], badpai);
                }
            }
            else if (data.zimo) {
                if (data.zimo.l <= l) t++;
                let text;
                if (next(i) && next(i).hule) text = 'ツモ';
                l  = data.zimo.l;
                md = 'm';
                error = error || badpai(data.zimo.p);
                moda(t, l, md, data.zimo.p, text, error);
            }
            else if (data.dapai) {
                if (data.dapai.l < l || data.dapai.l == l && md == 'd') t++;
                let text = '';
                let p = data.dapai.p.replace(/[\+\=\-]$/,'');
                if (p.match(/\*$/)) text = 'リーチ';
                if (next(i) && next(i).hule) text += '放銃';
                l  = data.dapai.l;
                md = 'd';
                moda(t, l, md,
                        data.dapai.p[2] == '_' ? data.dapai.p.slice(2)
                                               : data.dapai.p,
                        text, error);
            }
            else if (data.fulou) {
                t++;
                let text;
                let m = data.fulou.m.replace(/0/,'5');
                if      (m.match(/(\d)\1\1\1/)) text = 'カン';　
                else if (m.match(/(\d)\1\1/))   text = 'ポン';
                else                            text = 'チー';
                l  = data.fulou.l;
                md = 'm';
                moda(t, l, md, data.fulou.m, text, error);
            }
            else if (data.gang) {
                if (data.gang.l < l || data.gang.l == l && md == 'd') t++;
                let text = 'カン';
                if (next(i) && next(i).hule) text += '放銃';
                md = 'd';
                moda(t, l, md, data.gang.m, text, error);
            }
            else if (data.gangzimo) {
                t++;
                let text;
                if (next(i) && next(i).hule) text = 'ツモ';
                l  = data.gangzimo.l;
                md = 'm';
                error = error || badpai(data.gangzimo.p);
                moda(t, l, md, data.gangzimo.p, text, error);
            }
            else if (data.kaigang) {
                add_baopai((delay.shift() || '') + data.kaigang.baopai,
                            badpai(data.kaigang.baopai));
            }
            else if (data.hule) {
                let hule = data.hule;
                shoupai[hule.l] = Majiang.Shoupai.fromString(hule.shoupai);
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
                    .off('click').on('click',
                            ()=>this.open_hule_dialog(this.make_hule(hule.l)));
            }
            else if (data.pingju) {
                let pingju = data.pingju;
                let result = '流局';
                if (pingju.name != result) result += `(${pingju.name})`;
                $('.result .text', paipu).eq(0).text(result);
                show($('.result', paipu).eq(0));
                $('.result', paipu).eq(0).off('click').on('click',
                                        ()=>this.open_pingju_dialog(pingju));
            }

            if (! data.kaigang) delay.forEach((p, i)=> delay[i] += '>');
            if (data.gangzimo)  delay.push('');

            add_moda(t + 1);
        }
        this._model.last();

        for (let l = 0; l < 4; l++) {
            if (log[0].qipai.shoupai[l]) {
                $('>.shoupai', paipu).eq(l).css('visibility','visible')
                new Shoupai($('>.shoupai', paipu).eq(l), this._pai,
                            shoupai[l] || this._model.shoupai[l]).redraw(true);
            }
            else {
                $('>.shoupai', paipu).eq(l).css('visibility','hidden')
            }
            let id = this._model.player_id[l];
            let fenpei = this._model.defen[id] - log[0].qipai.defen[l]
            if (fenpei > 0) fenpei = '+' + fenpei;
            if (fenpei != 0) $('.defen .fenpei', paipu).eq(l).text(fenpei);
        }

        if (! log.find(data => data.hule || data.pingju)) {
            hide($('.result .text', paipu));
            show($('.result .button', paipu).eq(0));
            show($('.result', paipu).eq(0));
            $('.result', paipu)
                .off('click').on('click', ()=> this.open_dialog());
        }

        score.off('change').on('change', ()=> this.update_score());
        $('[name=baopai]', score)
                .off('change').on('change', ()=> this.update_paipu());

        $('input', paipu)
                .off('change').on('change', ()=>this.update_paipu());
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
            while (weikaigang[0] && weikaigang[0][0] != '>') {
                log.push({ kaigang: { baopai: weikaigang.shift() } });
            }
            weikaigang.forEach((p, i) => weikaigang[i] = p.replace(/^>/,''));
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
        let len = $('.mo .moda', paipu.eq(0)).length;

        for (let t = 0; t < len; t++) {
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
                        mo = Majiang.Shoupai.valid_mianzi(mo) || mo;
                        log.push({ fulou: { l: l, m: mo } });
                        if (mo.match(/\d{3}.*\d/)) gang = true;
                    }
                    if (weikaigang.length) kaigang();
                }

                let da = moda(t, l, 'd');
                if (da) {
                    if (! da.match(/\d\d/)) {
                        let p = da[0] == '_' ? mo + da : da;
                        log.push({ dapai: { l: l, p: p } });
                    }
                    else {
                        da = Majiang.Shoupai.valid_mianzi(da) || da;
                        log.push({ gang: { l: l, m: da } });
                        gang = true;
                    }
                    if (weikaigang.length) kaigang();
                }
            }
        }

        baopai.forEach(p => p && log.push({ kaigang: { baopai: p } }));

        this._paipu.log[this._log_idx]
                .filter((data)=> data.hule || data.pingju)
                .forEach((data)=> log.push(data));
        this._paipu.log[this._log_idx] = log;

        this.changed();

        this.draw_paipu();
    }

    open_dialog() {
        let hule = this.search_hule();
        if (hule.defen) this.open_hule_dialog(hule);
        else            this.open_pingju_dialog(this.make_pingju());
    }
    close_dialog() {
        $('dialog.hule',   this._root).get(0).close();
        $('dialog.pingju', this._root).get(0).close();
    }

    open_hule_dialog(hule) {
        if (! hule) hule = this.search_hule();

        this.init_hule_dialog();
        this.draw_hule_dialog(hule);

        $('dialog.pingju', this._root).get(0).close();
        $('dialog.hule',   this._root).get(0).showModal();
    }
    search_hule() {
        const model = this._model;
        if (model.lunban >=0 ) {
            for (let i = 0; i < 4; i++) {
                let l = (model.lunban + i) % 4;
                let hule = this.make_hule(l);
                if (hule.defen) return hule;
            }
        }
        return {
            fubaopai: [],
            hupai:    [],
            fenpei:   []
        };
    }
    make_hule(l, fubaopai) {

        function seek_log(l, log, param) {
            let last, diyizimo, lizhi, yifa;
            for (let data of log) {
                if (data.qipai) {
                    param.changbang = data.qipai.changbang;
                    param.lizhibang = data.qipai.lizhibang;
                    diyizimo = true;
                }
                else if (data.dapai) {
                    if (data.dapai.p.slice(-1) == '*') {
                        if (data.dapai.l == l) {
                            param.lizhi = diyizimo ? 2 : 1;
                            yifa = true;
                        }
                        lizhi = true;
                    }
                    else if (data.dapai.l == l) {
                        yifa = false;
                    }
                }
                else if (data.kaigang) continue;
                else if (data.hule) {
                    if (data.hule.l == l) return data;
                    param.changbang = 0;
                    param.lizhibang = 0;
                    break;
                }
                else if (data.pingju) break;

                last = data;

                if (last.dapai && last.dapai.l == 3
                    || last.fulou || last.gang) diyizimo = false;
                if (last.fulou || last.gangzimo) yifa = false;
                if (lizhi && (last.zimo || last.fulou)) {
                    param.lizhibang++;
                    lizhi = false;
                }
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
            fubaopai:   fubaopai || model.shan.fubaopai
        };
        let last = seek_log(l, log, param);
        if (last.hule) {
            return {
                l:          l,
                shoupai:    last.hule.shoupai,
                baojia:     last.hule.baojia,
                fubaopai:   last.hule.fubaopai,
                damanguan:  last.hule.damanguan,
                fu:         last.hule.fu,
                fanshu:     last.hule.fanshu,
                defen:      last.hule.defen,
                hupai:      last.hule.hupai,
                fenpei:     last.hule.fenpei,
                _changbang: param.changbang,
                _lizhibang: param.lizhibang
            };
        }

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
                fubaopai:   param.fubaopai,
                damanguan:  hule.damanguan,
                fu:         hule.fu,
                fanshu:     hule.fanshu,
                defen:      hule.defen,
                hupai:      hule.hupai,
                fenpei:     hule.fenpei,
                _changbang: param.changbang,
                _lizhibang: param.lizhibang
            }
        }
        else {
            return {
                l:        l,
                shoupai: (rongpai ? shoupai.zimo(rongpai) : shoupai).toString(),
                baojia:   baojia,
                fubaopai: fubaopai,
                hupai:    [],
                fenpei:   [],
                _changbang: param.changbang,
                _lizhibang: param.lizhibang
            }
        }
    }
    init_hule_dialog() {

        const seek_last = (log)=>{
            let last;
            for (let data of log) {
                if (data.zimo || data.dapai || data.fulou
                    || data.gang || data.gangzimo)
                {
                    last = data;
                }
            }
            return last;
        };

        const player    = this._paipu.player;
        const player_id = this._model.player_id;
        const form      = $('.hule form', this._root);

        let hule, baojia;
        let last = seek_last(this._paipu.log[this._log_idx]);
        if (last) {
            if      (last.zimo)     hule   = last.zimo.l;
            else if (last.dapai)    baojia = last.dapai.l;
            else if (last.gang)     baojia = last.gang.l;
            else if (last.gangzimo) hule   = last.gangzimo.l;
        }

        for (let name of ['l','baojia']) {
            const select = $(`select[name="${name}"]`, form);
            const row = select.children().eq(0);
            select.empty();
            select.append(row);
            for (let l = 0; l < 4; l++) {
                if (name == 'l') {
                    if (baojia == l)                 continue;
                    if (baojia == null && hule != l) continue;
                }
                else if (baojia != l)                continue;

                let r = row.clone()
                        .text(['東','南','西','北'][l] + ': '
                            + player[player_id[l]].replace(/\n.*$/,''))
                        .val(l);
                select.append(r);
            }
        }

        flipInput($('.flip', form));

        $('[name="l"], [name="fubaopai"]', form)
                .off('change').on('change', ()=>
        {
            let l = $('[name="l"]', form).val();
            let fubaopai = $('[name="fubaopai"]', form)
                            .toArray().map(n => $(n).val()).filter(p => p);
            if (! l) this.open_pingju_dialog(this.make_pingju());
            else     this.draw_hule_dialog(this.make_hule(+l, fubaopai));
        });
        $('.hupai, [name="fu"], [name="damanguan"]', form)
                .off('change').on('change', ()=>
        {
            this.draw_hule_dialog(
                    remake_fenpei(remake_defen(this.get_hule(), this._rule)));
        });
        $('[name="defen"], .jicun').off('change').on('change', ()=>{
            this.draw_hule_dialog(remake_fenpei(this.get_hule()));
        });

        $('input.close', form)
                .off('click').on('click', ()=> this.close_dialog());
        $('input.delete', form)
                .off('click').on('click', ()=> this.delete_hule());
        form.off('submit').on('submit', ()=>this.update_hule());
    }
    draw_hule_dialog(hule) {

        const draw_fubaopai = (n)=>{
            for (let i = 0; i < 5; i++) {
                let p = Majiang.Shoupai.valid_pai(
                            $('[name="fubaopai"]', form).eq(i).val());
                $('.flip >.pai', shan).eq(i).empty().append(pai(p||'_'));
                if (i < n) $('.flip', shan).eq(i).attr('tabindex', 0);
            }
        };

        const pai  = this._pai;
        const form = $('.hule form', this._root);

        $('[name="l"]',      form).val(hule.l);
        $('[name="baojia"]', form).val(hule.baojia);

        const shoupai = Majiang.Shoupai.fromString(hule.shoupai);
        const shan = $('.shan', form);
        $('[name="fubaopai"]', form).val('');
        $('.flip', shan).attr('tabindex', -1);
        if (shoupai.lizhi || hule.fubaopai && hule.fubaopai.length ) {
            show($('.fubaopai'), form);
            (hule.fubaopai||[]).forEach((p, i)=>{
                $('[name="fubaopai"]', form).eq(i).val(p);
            });
            draw_fubaopai(this._model.shan.baopai.length);
        }
        else {
            hide($('.fubaopai'), form);
        }

        $('[name="shoupai"]', form).val(hule.shoupai);
        new Shoupai($('.shoupai', form), this._pai, shoupai).redraw(true);

        const hupai = $('.hupai', form);
        $('input', hupai).val('');
        const row = hupai.children().eq(0);
        hupai.empty();
        for (let h of hule.hupai) {
            let r = row.clone();
            $('[name="hupai"]', r).val(h.name);
            $('[name="fanshu"]', r).val(h.fanshu);
            $('[name="baojia"]', r).val(h.baojia);
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

        $('[name="changbang"]', form).val(hule._changbang);
        $('[name="lizhibang"]', form).val(hule._lizhibang);

        for (let l = 0; l < 4; l++) {
            $('[name="fenpei"]', form).eq(l).val(hule.fenpei[l]);
        }
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
        $('.hupai', form).children().each((i, n)=>{
            let name   = $('[name="hupai"]', n).val();
            let fanshu = $('[name="fanshu"]', n).val();
            if (fanshu[0] != '*') fanshu = + (fanshu || 0);
            let baojia = $('[name="baojia"]', n).val()
            if (name) {
                if (baojia) hupai.push({ name: name, fanshu: fanshu,
                                         baojia: baojia });
                else        hupai.push({ name: name, fanshu: fanshu });
            }
        });

        return {
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
                                .toArray().map(n => + ($(n).val() || 0)),
            _changbang: + $('[name="changbang"]', form).val(),
            _lizhibang: + $('[name="lizhibang"]', form).val()
        };
    }
    update_hule() {
        const log_idx = this._log_idx;

        const hule = this.get_hule();
        delete hule._changbang;
        delete hule._lizhibang;

        const log = this._paipu.log[log_idx].filter((data)=> ! data.pingju);
        let idx = -1;
        log.forEach((data, i)=>{
            if (data.hule && data.hule.l == hule.l) idx = i;
        });
        if (idx >= 0) log[idx] = { hule: hule };
        else          log.push({ hule: hule })
        this._paipu.log[log_idx] = log;

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

    open_pingju_dialog(pingju) {

        this.init_pingju_dialog();
        this.draw_pingju_dialog(pingju);

        $('dialog.hule', this._root).get(0).close();
        $('dialog.pingju', this._root).get(0).showModal();
    }
    make_pingju() {

        function pingju_manguan(model, pingju) {
            for (let l = 0; l < 4; l++) {
                let all_yaojiu = true;
                for (let p of model.he[l]._pai) {
                    if (p.match(/[\+\=\-]$/)) { all_yaojiu = false; break }
                    if (p.match(/^z/))          continue;
                    if (p.match(/^[mps][19]/))  continue;
                    all_yaojiu = false; break;
                }
                if (all_yaojiu) {
                    pingju.name = '流し満貫';
                    for (let i = 0; i < 4; i++) {
                        pingju.fenpei[i] += l == 0 && i == l ? 12000
                                          : l == 0           ? -4000
                                          : l != 0 && i == l ?  8000
                                          : l != 0 && i == 0 ? -4000
                                          :                    -2000;
                    }
                }
            }
            return pingju;
        }

        const log   = this._paipu.log[this._log_idx];
        const model = this._model;

        let pingju = { name: '', shoupai: ['','','',''], fenpei: [0,0,0,0] };

        let last, n_lizhi = 0, n_gang = 0, diyizimo = true, fengpai = null;
        for (let data of log) {
            if (data.dapai && data.dapai.p.slice(-1) == '*') n_lizhi++;
            if (data.kaigang) n_gang++;
            if (data.dapai && fengpai == null)
                                        fengpai = data.dapai.p.slice(0,2);
            if (data.dapai && fengpai) {
                if (! diyizimo) fengpai = false;
                else if (! data.dapai.p.match(/^z[0-3]/)) fengpai = false;
                else if (data.dapai.p.slice(0,2) != fengpai) fengpai = false;
            }
            if (data.fulou || data.gang
                || data.dapai && data.dapai.l == 3) diyizimo = false;
            if (data.kaigang || data.hule || data.pingju) continue;
            last = data;
        }
        if (last.dapai) {
            for (let l = 0; l < 4; l++) {
                if (Majiang.Util.xiangting(model.shoupai[l]) == 0) {
                    pingju.shoupai[l] = model.shoupai[l].toString();
                }
            }
            if (! model.shan.paishu) {
                if (this._rule['流し満貫あり']) {
                    pingju = pingju_manguan(this._model, pingju);
                }
                if (! pingju.name) {
                    pingju.name = '荒牌平局';
                    pingju = pingju_fenpei(pingju);
                }
            }
            else {
                if (fengpai) {
                    pingju.name = '四風連打';
                    pingju.shoupai = ['','','',''];
                }
                if (n_gang == 4) {
                    pingju.name = '四開槓';
                    pingju.shoupai = ['','','',''];
                }
                if (n_lizhi == 4) {
                    pingju.name = '四家立直';
                }
            }
        }
        if (last.zimo) {
            if (Majiang.Game.allow_pingju(Majiang.rule({'途中流局あり':true}),
                                        model.shoupai[last.zimo.l], diyizimo))
            {
                pingju.name = '九種九牌';
                pingju.shoupai[last.zimo.l]
                            = model.shoupai[last.zimo.l].toString();
            }
        }

        return pingju;
    }
    init_pingju_dialog() {
        const form  = $('.pingju form', this._root);
        const model = this._model;

        $('[name="pingju"]', form).off('change').on('change', ()=>{
            $('[name="daopai"]', form).val([0]);
            $('[name="fenpei"]', form).val(0);
            this.draw_pingju_dialog(this.get_pingju());
        });
        $('[name="daopai"]', form).off('change').on('change', ()=>{
            if (! model.shan.paishu)
                    this.draw_pingju_dialog(pingju_fenpei(this.get_pingju()));
            else    this.draw_pingju_dialog(this.get_pingju());
        })

        $('input.hule', form)
                .off('click').on('click', ()=> this.open_hule_dialog());
        $('input.delete', form)
                .off('click').on('click', ()=> this.delete_pingju());
        $('input.close',  form)
                .off('click').on('click', ()=> this.close_dialog());
        form.off('submit').on('submit', ()=> this.update_pingju());
    }
    draw_pingju_dialog(pingju) {
        const form  = $('.pingju form', this._root);
        const model = this._model;

        $('[name="pingju"]', form).val(pingju.name);
        for (let l = 0; l < 4; l++) {
            $('[name="fenpei"]', form).eq(l).val(pingju.fenpei[l]);
            $('[name="daopai"]', form).eq(l).val([pingju.shoupai[l] ? 1 : 0]);
            let shoupai = pingju.shoupai[l] || model.shoupai[l].toString();
            $('[name="shoupai"]', form).eq(l).val(shoupai);

            new Shoupai($('.shoupai', form).eq(l), this._pai,
                        Majiang.Shoupai.fromString(
                            $('[name="shoupai"]', form).eq(l).val())
                    ).redraw($('[name="daopai"]', form).eq(l).prop('checked'));
        }
    }
    get_pingju() {
        const form  = $('.pingju form', this._root);
        return {
            name:    $('[name="pingju"]', form).val() || '流局',
            shoupai: $('[name="daopai"]', form).toArray()
                        .map((n, i)=> $(n).prop('checked')
                            ? $('[name="shoupai"]', form).eq(i).val() : ''),
            fenpei:  $('[name="fenpei"]', form).toArray()
                                            .map(n => + $(n).val())
        };
    }
    update_pingju() {
        const log_idx = this._log_idx;

        let pingju = this.get_pingju();
        let log = this._paipu.log[log_idx]
                            .filter((data)=> ! (data.hule || data.pingju));
        log.push({ pingju: pingju });
        this._paipu.log[log_idx] = log;

        this.update_paipu();
        this.changed();
    }
    delete_pingju() {
        this.delete_hule();
    }
}
