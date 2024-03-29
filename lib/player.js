/*
 *  Majiang.UI.Player
 */
"use strict";

const $ = require('jquery');
const Majiang = require('@kobalab/majiang-core');

const { hide, show, fadeIn }         = require('./fadein');
const { setSelector, clearSelector } = require('./selector');

const mianzi = require('./mianzi');

module.exports = class Player extends Majiang.Player {

    constructor(root, pai, audio) {
        super();
        this._node = {
            root:   root,
            timer:  $('.timer', root),
            button: $('.player-button', root),
            mianzi: $('.select-mianzi', root),
            dapai:  $('.shoupai.main .bingpai', root),
        };
        this._mianzi = mianzi(pai);

        this.sound_on = true;
        this._audio   = { beep: audio('beep') };

        this.clear_handler();
    }

    clear_handler() {
        this.clear_button();
        this.clear_mianzi();
        this.clear_dapai();
        clearSelector('kaiju');
        clearSelector('dialog');
        clearSelector('summary');
    }

    callback(reply) {
        this.clear_timer();
        this.clear_handler();
        this._callback(reply);
        return false;
    }

    set_button(type, callback) {
        show($(`.${type}`, this._node.button)
                .attr('tabindex', 0)
                .on('click.button', callback));
        this._show_button = true;
    }

    show_button(callback = ()=>{}) {
        this.show_timer();
        if (! this._show_button) return callback();
        const handler = ()=>{ this.clear_button(); callback() };
        this.set_button('cansel', handler);
        this._node.root.on('click.button', handler);

        show(this._node.button.width($(this._node.dapai).width()));
        setSelector($('.button[tabindex]', this._node.button),
                    'button', {focus: -1, touch: false});
    }

    clear_button() {
        hide($('.button', this._node.button));
        clearSelector('button');
        hide(this._node.button);
        this._node.root.off('.button');
        this._show_button = false;
    }

    select_mianzi(mianzi) {
        this.clear_button();
        this._node.mianzi.empty();
        for (let m of mianzi) {
            let msg = m.match(/\d/g).length == 4 ? {gang: m} : {fulou: m}
            if (! this._default_reply) this._default_reply = msg;
            this._node.mianzi.append(
                    this._mianzi(m, true)
                        .on('click.mianzi',()=>this.callback(msg)));
        }
        show(this._node.mianzi.width($(this._node.dapai).width()));
        setSelector($('.mianzi', this._node.mianzi), 'mianzi',
                    {touch: false, focus: null});
        return false;
    }

    clear_mianzi() {
        setTimeout(()=>hide(this._node.mianzi), 400);
        clearSelector('mianzi');
    }

    select_dapai(lizhi) {

        if (lizhi) this._default_reply = { dapai: lizhi[0] + '*' };

        for (let p of lizhi || this.get_dapai(this.shoupai)) {
            let pai = $(p.slice(-1) == '_'
                            ? `.zimo .pai[data-pai="${p.slice(0,2)}"]`
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

        setSelector($('.pai[tabindex]', this._node.dapai),
                    'dapai', {focus: -1});
    }

    clear_dapai() {
        $('.pai', this._node.dapai).removeClass('blink');
        clearSelector('dapai');
    }

    set_timer(limit, allowed = 0, audio) {

        delete this._default_reply;

        let time_limit = Date.now() + (limit + allowed) * 1000;

        if (this._timer_id) clearInterval(this._timer_id);
        this._timer_id = setInterval(()=>{
            if (time_limit <= Date.now()) {
                this.callback(this._default_reply);
                return;
            }
            let time = Math.ceil((time_limit - Date.now()) / 1000);
            if (time <= limit || time <= allowed) {
                if (time != this._node.timer.text()) {
                    if (this.sound_on && audio && time <= 5) {
                        audio.currentTime = 0;
                        audio.play();
                    }
                    this._node.timer.text(time);
                }
            }
        }, 200);
    }

    show_timer() {
        show(this._node.timer.width($(this._node.dapai).width() + 20));
    }

    clear_timer() {
        this._timer_id = clearInterval(this._timer_id);
        hide(this._node.timer.text(''));
    }

    action(msg, callback) {
        let limit, allowed;
        if (msg.timer) [ limit, allowed ] = msg.timer;
        let audio = ! (msg.kaiju || msg.hule || msg.pingju) && this._audio.beep;
        if (limit) this.set_timer(limit, allowed, audio);

        super.action(msg, callback);
    }

    action_kaiju(kaiju) {
        if (! this._view) this.callback();
        $('.kaiju', this._node.root).off('click')
                                    .on('click.kaiju', ()=>this.callback());
        setTimeout(()=>{
            setSelector($('.kaiju', this._node.root), 'kaiju',
                        { touch: false });
        }, 800);
    }

    action_qipai(qipai) { this.callback() }

    action_zimo(zimo, gangzimo) {
        if (zimo.l != this._menfeng) return this.callback();

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
        else if (gang_mianzi.length > 1) {
            this.set_button('gang', ()=>this.select_mianzi(gang_mianzi));
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

        if (this.allow_no_daopai(this.shoupai)) {
            this.set_button('daopai', ()=>this.callback());
        }

        if (dapai.l == this._menfeng) {

            if (! this._show_button) return this.callback();

            setTimeout(()=>{
                this.show_button(()=>this.callback({daopai: '-'}))
            }, 500);
            return;
        }

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
        else if (peng_mianzi.length > 1) {
            this.set_button('peng', ()=>this.select_mianzi(peng_mianzi));
        }

        let chi_mianzi = this.get_chi_mianzi(this.shoupai, p);
        if (chi_mianzi.length == 1) {
            this.set_button('chi', ()=>this.callback({fulou: chi_mianzi[0]}));
        }
        else if (chi_mianzi.length > 1) {
            this.set_button('chi', ()=>this.select_mianzi(chi_mianzi));
        }

        this.show_button(()=>{
            if (this._model.shan.paishu == 0
                && Majiang.Util.xiangting(this.shoupai) == 0)
                    this.callback({daopai: '-'});
            else    this.callback();
        });
    }

    action_fulou(fulou) {
        if (fulou.l != this._menfeng) return this.callback();
        if (fulou.m.match(/^[mpsz]\d{4}/)) return this.callback();

        this.show_button(()=>this.select_dapai());
    }

    action_gang(gang) {
        if (gang.l == this._menfeng) return this.callback();
        if (gang.m.match(/^[mpsz]\d{4}$/)) return this.callback();

        let d = ['','+','=','-'][(4 + this._model.lunban - this._menfeng) % 4];
        let p = gang.m[0] + gang.m.slice(-1) + d;

        if (this.allow_hule(this.shoupai, p, true)) {
            this.set_button('rong', ()=>this.callback({hule: '-'}));
        }

        this.show_button(()=>this.callback());
    }

    action_hule() {
        $('.hule-dialog', this._node.root).off('click')
                                    .on('click.dialog', ()=>this.callback());
        setTimeout(()=>{
            setSelector($('.hule-dialog', this._node.root), 'dialog',
                        { touch: false });
        }, 800);
    }

    action_pingju() {
        this.action_hule();
    }

    action_jieju(jieju) {
        $('.summary', this._node.root).off('click')
                                    .on('click.summary', ()=>this.callback());
        setTimeout(()=>{
            setSelector($('.summary', this._node.root), 'summary',
                        { touch: false });
        }, 800);
    }
}
