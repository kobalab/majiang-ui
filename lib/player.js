/*
 *  Majiang.UI.Player
 */
"use strict";

const $ = require('jquery');
const Majiang = require('@kobalab/majiang-core');

const { hide, show, fadeIn }         = require('./fadein');
const { setSelector, clearSelector } = require('./selector');

module.exports = class Player extends Majiang.Player {

    constructor(root) {
        super();
        this._node = {
            root:   root,
            button: $('.player-button', root),
            dapai:  $('.shoupai.main .bingpai', root),
        };
        this.clear_handler();
    }

    clear_handler() {
        this.clear_button();
        $('.pai', this._node.dapai).removeAttr('tabindex role');
        clearSelector('.dapai');
    }

    callback(reply) {
        this.clear_handler();
        this._callback(reply);
        return false;
    }

    set_button(type, callback) {
        show($(`.${type}`, this._node.button)
                .attr('tabindex', 0).attr('role','button')
                .on('click.button', callback));
        this._show_button = true;
    }

    show_button(callback = ()=>{}) {
        if (! this._show_button) return callback();
        const handler = ()=>{ this.clear_button(); callback() };
        this.set_button('cansel', handler);
        this._node.root.on('click.button', handler);

        show($(this._node.button).width($(this._node.dapai).width()));
        const key = { confirm: 'Enter', prev: 'ArrowLeft', next: 'ArrowRight' };
        setSelector($('.button[tabindex]', this._node.button), 'button', key)
                .eq(-1).trigger('touchstart');
    }

    clear_button() {
        hide($('.button', this._node.button).removeAttr('tabindex role'));
        clearSelector('.button');
        hide(this._node.button);
        this._node.root.off('.button');
        this._show_button = false;
    }

    select_dapai(lizhi) {

        for (let p of lizhi || this.get_dapai(this.shoupai)) {
            let pai = $(p.substr(-1) == '_'
                            ? `.zimo .pai[data-pai=${p.substr(0,2)}]`
                            : `> .pai[data-pai="${p}"]`,
                        this._node.dapai);
            if (lizhi) {
                pai.addClass('blink');
                p += '*';
            }
            pai.attr('tabindex', 0).attr('role','button')
                .on('click.dapai', (ev)=>{
                    $(ev.target).addClass('dapai');
                    this.callback({dapai: p});
                });
        }

        const key = { confirm: 'Enter', prev: 'ArrowLeft', next: 'ArrowRight' };
        setSelector($('.pai[tabindex]', this._node.dapai), 'dapai', key).eq(-1)
            .trigger('touchstart');
    }

    action_kaiju(kaiju) { this.callback() }
    action_qipai(qipai) { this.callback() }

    action_zimo(zimo, gangzimo) {
        if (zimo.l != this._menfeng) return this._callback();

        if (this.allow_hule(this.shoupai, null, gangzimo)) {
            this.set_button('zimo', ()=>this.callback({hule: '-'}));
        }

        if (this.allow_pingju(this.shoupai)) {
            this.set_button('pingju', ()=>this.callback({daopai: '-'}));
        }

        let gang_mianzi = this.get_gang_mianzi(this.shoupai);
        if (gang_mianzi.length == 1) {
            this.set_button('gang', ()=>this.callback({gang: gang_mianzi[0]}));
        }

        if (this.shoupai.lizhi) {
            this.show_button(()=>this.callback({dapai: zimo.p + '_'}));
            return;
        }

        let lizhi_dapai = this.allow_lizhi(this.shoupai);
        if (lizhi_dapai.length) {
            this.set_button('lizhi', ()=>{
                this.clear_handler();
                this.select_dapai(lizhi_dapai);
            });
        }

        this.show_button(()=>this.select_dapai());
    }

    action_dapai(dapai) {
        if (dapai.l == this._menfeng) return this._callback();

        let d = ['','+','=','-'][(4 + this._model.lunban - this._menfeng) % 4];
        let p = dapai.p + d;

        if (this.allow_hule(this.shoupai, p)) {
            this.set_button('rong', ()=>this.callback({hule: '-'}));
        }

        let gang_mianzi = this.get_gang_mianzi(this.shoupai, p);
        if (gang_mianzi.length == 1) {
            this.set_button('gang', ()=>this.callback({fulou: gang_mianzi[0]}));
        }

        let peng_mianzi = this.get_peng_mianzi(this.shoupai, p);
        if (peng_mianzi.length == 1) {
            this.set_button('peng', ()=>this.callback({fulou: peng_mianzi[0]}));
        }

        let chi_mianzi = this.get_chi_mianzi(this.shoupai, p);
        if (chi_mianzi.length == 1) {
            this.set_button('chi', ()=>this.callback({fulou: chi_mianzi[0]}));
        }

        this.show_button(()=>this.callback());
    }

    action_fulou(fulou) {
        if (fulou.l != this._menfeng) return this._callback();
        if (fulou.m.match(/^[mpsz]\d{4}/)) return this._callback();
        
        this.select_dapai();
    }

    action_gang(gang) {
        if (gang.l == this._menfeng) return this._callback();
        if (gang.m.match(/^[mpsz]\d{4}$/)) return this._callback();

        let d = ['','+','=','-'][(4 + this._model.lunban - this._menfeng) % 4];
        let p = gang.m[0] + gang.m.substr(-1) + d;

        if (this.allow_hule(this.shoupai, p, true)) {
            this.set_button('rong', ()=>this.callback({hule: '-'}));
        }

        this.show_button(()=>this.callback());
    }

    action_hule(hule) {
        $('.hule-dialog', this._node.root).on('click', ()=>this.callback());
        setTimeout(()=>{
            $('.hule-dialog', this._node.root)
                            .attr('tabindex', 0)
                            .trigger('focus');
        }, 800);
    }

    action_pingju(pingju) {
        $('.hule-dialog', this._node.root).on('click', ()=>this.callback());
        setTimeout(()=>{
            $('.hule-dialog', this._node.root)
                            .attr('tabindex', 0)
                            .trigger('focus');
        }, 800);
    }

    action_jieju(jieju)   { this.callback() }
}
