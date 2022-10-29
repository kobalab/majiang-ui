/*
 *  Majiang.UI.PaipuStat
 */
"use strict";

const $ = require('jquery');

function make_stat(paipu_list) {
    let title  = paipu_list[0].title.replace(/\n.*$/,'');
    let player = {};
    for (let paipu of paipu_list) {
        if (paipu.title.replace(/\n.*$/,'') != title) title = '';
        for (let id = 0; id < 4; id++) {
            let name = paipu.player[id].replace(/\n.*$/,'');
            player[name] = player_stat(player[name], paipu, id);
        }
    }
    return { title: title, player: player };
}

function player_stat(stat, paipu, id) {
    if (! stat) {
        stat = {
            n_game:     0,
            n_rank:     [ 0, 0, 0, 0 ],
            sum_point:  0,
            n_ju:       0,
            n_hule:     0,
            n_baojia:   0,
            n_lizhi:    0,
            n_fulou:    0,
            sum_defen:  0
        };
    }
    for (let log of paipu.log) {
        stat.n_ju++;
        let l = (id + 4 - paipu.qijia + 4 - log[0].qipai.jushu) % 4;
        let data = log.find(data => data.hule && data.hule.l == l);
        if (data) {
            stat.n_hule++;
            stat.sum_defen += + data.hule.defen;
        }
        if (log.find(data => data.hule && data.hule.baojia == l)) {
            stat.n_baojia++;
        }
        if (log.find(data => data.dapai && data.dapai.l == l
                && data.dapai.p.substr(-1) == '*'))
        {
            stat.n_lizhi++;
        }
        if (log.find(data => data.fulou && data.fulou.l == l)) {
            stat.n_fulou++;
        }
    }
    stat.n_game++;
    stat.n_rank[paipu.rank[id] - 1]++;
    stat.sum_point += + paipu.point[id];
    return stat;
}

function make_table(player) {
    let table = [];
    for (let name of Object.keys(player)) {
        let r = player[name];
        table.push([
            name,
            r.n_game,
            format(r.sum_point, 1, 2),
            format((r.n_rank[0] + r.n_rank[1] * 2 + r.n_rank[2] * 3
                        + r.n_rank[3] * 4)      / r.n_game, 2),
            format(r.n_rank[0]                  / r.n_game, 3, 1),
            format((r.n_rank[0] + r.n_rank[1])  / r.n_game, 3, 1),
            format(r.n_rank[3]                  / r.n_game, 3, 1),

            format(r.n_hule   / r.n_ju, 3, 1),
            format(r.n_baojia / r.n_ju, 3, 1),
            format(r.n_lizhi  / r.n_ju, 3, 1),
            format(r.n_fulou  / r.n_ju, 3, 1),

            format(r.sum_defen / (r.n_hule || 1), 0, 0)
        ]);
    }
    return table;
}

function format(n, r, f) {
    let s = n.toFixed(r);
    return  f == 1          ? s.replace(/^0\./,'.')
          : f == 2 && n > 0 ? '+' + s
          :                   s;
}

module.exports = class PaipuStat {

    constructor(root, paipu_list, callback) {

        this._root = root;
        this._tr   = $('tbody tr', root).eq(0);

        let { title, player } = make_stat(paipu_list);
        this._table = make_table(player);

        $('input[name="cut-off"]', this._root).prop('checked', true);
        let cut_off = (Math.max(... this._table.map(x => x[1])) / 5) | 0;
        $('input[name="n_game"]', this._root).val(cut_off || '');
        $('.button input', this._root).on('change', ()=> this.show());

        $('.title', this._root).text(title);
        $('.file', this._root).on('click', ()=>{
            $('.stat', this._root).scrollLeft(0);
            history.replaceState('', '', location.href.replace(/#.*$/,''));
            callback();
        });

        for (let i = 1; i < this._table[0].length; i++) {
            $('th', this._root).eq(i).on('click', ()=> this.sort(i).show());
        }

        this.sort(2).sort(1).show();
    }

    sort(i) {
        this._order = Math.abs(this._order) == i ? -this._order : -i;
        $('th', this._root).removeClass('asc').removeClass('desc')
            .eq(i).addClass(this._order > 0 ? 'asc' : 'desc');

        this._table = this._table.sort(
                        (x, y)=> this._order > 0 ? x[i] - y[i] : y[i] - x[i]);
        return this;
    }

    show() {
        let cut_off = $('input[name="cut-off"]', this._root).prop('checked')
                        && + $('input[name="n_game"]', this._root).val() || 0;
        const tbody = $('tbody', this._root);
        tbody.empty();
        for (let stat of this._table.filter(r => r[1] > cut_off)) {
            let tr = this._tr.clone();
            for (let i = 0; i < stat.length; i++) {
                $('td', tr).eq(i).text(stat[i]);
            }
            tbody.append(tr);
        }
    }
}
