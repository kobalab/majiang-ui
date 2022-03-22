/*
 *  Majiang.UI.GameCtl
 */
"use strict";

const { hide, show } = require('./fadein');

module.exports = class GameCtl {

    constructor(root, game, pref) {
        this._root = root;
        this._game = game;
        this._view = game._view;
        this._pref = pref;
        this.redraw();
    }

    redraw() {

        hide($('.exit, .summary, .analyzer', this._root));
        hide($('.first, .last, .prev, .next', this._root));
        hide($('.play', this._root));

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
            hide($('.sound.off', this._root));
            show($('.sound.on', this._root));
        }
        else {
            hide($('.sound.on', this._root));
            show($('.sound.off', this._root));
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

        const root = this._root;
        $('.sound', root).on('click', ()=>this.sound(! this._view.sound_on));
        $('.minus', root).on('click', ()=>this.speed(this._game.speed - 1));
        $('.plus',  root).on('click', ()=>this.speed(this._game.speed + 1));

        $(window).on('keyup.controler', (ev)=>{
            if      (ev.key == 'a') this.sound(! this._view.sound_on);
            else if (ev.key == '-') this.speed(this._game.speed - 1);
            else if (ev.key == '+') this.speed(this._game.speed + 1);
        });
    }

    clear_handler() {
        $('.sound, .minus, .plus', this._root).off('click');
        $(window).off('.controler');
    }
}
