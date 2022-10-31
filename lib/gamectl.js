/*
 *  Majiang.UI.GameCtl
 */
"use strict";

const { hide, show } = require('./fadein');

module.exports = class GameCtl {

    constructor(root, game, pref) {
        this._node = {
            controller: $('.controller', root),
            download:   $('.download', root),
        };
        this._game = game;
        this._view = game._view;
        this._pref = pref;

        this._view.no_player_name = true;
        this.redraw();
    }

    redraw() {

        hide($('.exit, .summary, .analyzer', this._node.controller));
        hide($('.first, .last, .prev, .next', this._node.controller));
        hide($('.play', this._node.controller));

        let pref = this.get_pref();
        this.sound(pref.sound_on);
        this.speed(pref.speed);

        this.set_handler();
    }

    speed(speed) {
        if (speed < 1) speed = 1;
        if (speed > 5) speed = 5;
        this._game.speed = speed;
        $('.speed span', this._root).each((i, n)=>{
            $(n).css('visibility', i < speed ? 'visible' : 'hidden');
        });
        this.set_pref();
        return false;
    }

    sound(on) {
        this._view.sound_on = on;
        if (on) {
            hide($('.sound.off', this._node.controller));
            show($('.sound.on', this._node.controller));
        }
        else {
            hide($('.sound.on', this._node.controller));
            show($('.sound.off', this._node.controller));
        }
        this.set_pref();
        return false;
    }

    get_pref() {
        if (localStorage.getItem(this._pref)) {
            return JSON.parse(localStorage.getItem(this._pref));
        }
        else {
            return {
                sound_on: this._view.sound_on,
                speed:    this._game.speed
            };
        }
    }

    set_pref() {
        let pref = {
            sound_on: this._view.sound_on,
            speed:    this._game.speed
        };
        localStorage.setItem(this._pref, JSON.stringify(pref));
    }

    set_handler() {

        this.clear_handler();

        const ctl = this._node.controller;
        $('.sound', ctl).on('click', ()=>this.sound(! this._view.sound_on));
        $('.minus', ctl).on('click', ()=>this.speed(this._game.speed - 1));
        $('.plus',  ctl).on('click', ()=>this.speed(this._game.speed + 1));

        $(window).on('keyup.controler', (ev)=>{
            if      (ev.key == 'a') this.sound(! this._view.sound_on);
            else if (ev.key == '-') this.speed(this._game.speed - 1);
            else if (ev.key == '+') this.speed(this._game.speed + 1);
        });
    }

    clear_handler() {
        $('.sound, .minus, .plus', this._node.controller).off('click');
        $(window).off('.controler');
    }

    stop() {
        this._game.stop();
        let blob  = new Blob([ JSON.stringify(this._game._paipu) ],
                             { type: 'application/json' });
        $('a', this._node.download)
            .attr('href', URL.createObjectURL(blob))
            .attr('download', '牌譜.json');
        show(this._node.download);
        this.stoped = true;
    }

    start() {
        this.stoped = false;
        hide(this._node.download);
        this._game.start();
    }

    shoupai() {
        const game = this._game;
        if (game._status == 'hule')   return true;
        if (game._status == 'pingju') return true;
        if (game._status == 'jieju')  return true;
        game._view.open_shoupai = ! game._view.open_shoupai;
        game._view.redraw();
        return false;
    }

    he() {
        const game = this._game;
        if (game._status == 'hule')   return true;
        if (game._status == 'pingju') return true;
        if (game._status == 'jieju')  return true;
        game._view.open_he = ! game._view.open_he;
        game._view.redraw();
        return false;
    }
}
