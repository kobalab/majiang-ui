/*
 *  summary
 */
"use strict";

const $ = require('jquery');

const Majiang = require('@kobalab/majiang-core');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

module.exports = function(root, paipu, viewpoint) {

    let player = $('.r_player .player', root);
    for (let i = 0; i < 4; i++) {
        let id = (viewpoint + i) % 4;
        player.eq(i).text(paipu.player[id].replace(/\n.*$/,''));
    }

    let r_diff = $('.r_diff', root).eq(0).clone();
    let body   = $('.body', root).empty();
    for (let log of paipu.log) {

        if (log.length == 0) continue;

        let qipai = log[0].qipai;

        let last = [], lizhi = [0,0,0,0], lunban = null;
        for (let data of log) {
            if (lunban != null) {
                if (data.hule)  lunban = null;
                else if (data.pingju && data.pingju.name.match(/^三家和/))
                                lunban = null;
                else            lizhi[lunban] = 1;
            }
            if (data.dapai && data.dapai.p.substr(-1) == '*')
                                lunban = data.dapai.l;
            if (data.hule || data.pingju) last.push(data);
        }

        r_diff = r_diff.clone();
        $('.jushu', r_diff).text(['東','南','西','北'][qipai.zhuangfeng]
                               + ['一','二','三','四'][qipai.jushu] + '局');
        $('.changbang', r_diff).text(`${qipai.changbang}本場`);
        $('.last', r_diff).text(
              last.length == 0            ? '−'
            : last[0].pingju              ? '流局'
            : last[0].hule.baojia == null ? 'ツモ'
            :                               'ロン'
        );
        $('.back',  r_diff).removeClass('zhuangjia');
        $('.diff',  r_diff).removeClass('baojia hule').text('');
        $('.lizhi', r_diff).text('');

        for (let i = 0; i < 4; i++) {

            let l = (viewpoint + 4 - paipu.qijia + 4 - qipai.jushu + i) % 4;

            if (l == 0) $('.back', r_diff).eq(i).addClass('zhuangjia');

            if (last.length == 0) continue;

            if (lizhi[l]) $('.lizhi', r_diff).eq(i).text('*');

            let diff = 0;
            for (let data of last) {
                if (data.hule)   diff += data.hule.fenpei[l];
                if (data.pingju) diff += data.pingju.fenpei[l];
                if (! data.hule) continue;
                if (data.hule.baojia == l)
                        $('.diff', r_diff).eq(i).addClass('baojia');
                if (data.hule.l      == l)
                        $('.diff', r_diff).eq(i).addClass('hule');
            }
            diff = diff > 0 ? '+' + diff
                 : diff < 0 ? ''  + diff
                 :            '';
            diff = diff.replace(/(\d)(\d{3})$/,'$1,$2');
            $('.diff', r_diff).eq(i).text(diff);
        }

        body.append(r_diff);
    }

    let defen = $('.r_defen .defen', root);
    for (let i = 0; i < 4; i++) {
        defen.eq(i).removeClass('plus minus');
        let id = (viewpoint + i) % 4;
        defen.eq(i).text((''+paipu.defen[id]).replace(/(\d)(\d{3})$/,'$1,$2'));
        if (paipu.rank[id] == 1) defen.eq(i).addClass('plus');
        if (paipu.defen[id] < 0) defen.eq(i).addClass('minus');
    }

    let point = $('.r_point .point', root);
    for (let i = 0; i < 4; i++) {
        point.eq(i).removeClass('plus minus');
        let id = (viewpoint + i) % 4;
        point.eq(i).text((paipu.point[id] > 0 ? '+' : '')
                            + (paipu.point[id] ?? '−'));
        if (paipu.point[id] > 0) point.eq(i).addClass('plus');
        if (paipu.point[id] < 0) point.eq(i).addClass('minus');
    }

    return root;
}
