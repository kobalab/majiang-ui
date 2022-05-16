/*
 *  Majiang.UI.Paipu
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');
const Board   = require('./board');

const { hide, show } = require('./fadein');

module.exports = class Paipu {

    constructor(root, paipu, pai, audio, pref) {
        this._root  = root;
        this._paipu = paipu;
        this._model = new Majiang.Board(paipu);
        this._view  = new Board(root, pai, audio, this._model);
        this._pref  = pref;

        this._view.open_shoupai = true;
        this._view.open_he      = true;

        this.close_viewer = ()=>{};
    }

    set_handler() {
        this.clear_handler();
        this.update_controler();

        $(this._root).on('click.paipu', (ev)=> this.next());

        $(window).on('keyup.paipu', (ev)=>{
            if      (ev.key == 'v') this.viewpoint(this._view.viewpoint + 1);
            else if (ev.key == 's') this.shoupai();
            else if (ev.key == 'h') this.he();
            else if (ev.key == 'q' || ev.key == 'Escape')
                                    this.exit();
        });

        $(window).on('keydown.paipu', (ev)=>{

            if (ev.key.match(/^Arrow/)) ev.preventDefault();

            if (this._deny_repeat && ev.originalEvent.repeat) return;

            if      (ev.key == 'Enter')     this.next();
            else if (ev.key == 'ArrowDown') this.next();
            else if (ev.key == 'ArrowUp')   this.prev();
        });
    }

    clear_handler() {
        $(this._root).off('.paipu');
        $(window).off('.paipu');
    }

    update_controler() {
        const ctrl = $('.controller', this._root);
        hide($('.sound.off, .play.off', ctrl));
    }

    start(viewpoint, log_idx, idx) {
        this.set_handler();
        if (viewpoint != null) this._view.viewpoint = viewpoint;
        if (log_idx == null)   this._view.kaiju();
    }

    exit() {
        this.clear_handler();
        this.close_viewer();
    }

    seek(log_idx, idx) {

        this._deny_repeat = false;

        log_idx = log_idx < 0   ? 0
                : this._paipu.log.length - 1 < log_idx
                                ? this._paipu.log.length
                : log_idx;
        idx     = idx < 0       ? 0
                : this._paipu.log[log_idx].length - 1 < idx
                                ? this._paipu.log[log_idx].length - 1
                : idx;

        this._log_idx = log_idx;
        this._idx     = 0;
        this._redo    = false;

        while (this._idx <= idx) {

            let data = this._paipu.log[this._log_idx][this._idx];

            if      (data.qipai)    this._model.qipai(data.qipai);
            else if (data.zimo)     this._model.zimo(data.zimo);
            else if (data.dapai)    this._model.dapai(data.dapai);
            else if (data.fulou)    this._model.fulou(data.fulou);
            else if (data.gang)     this._model.gang(data.gang);
            else if (data.gangzimo) this._model.zimo(data.gangzimo);
            else if (data.kaigang)  this._model.kaigang(data.kaigang);
            else if (data.hule)     this._model.hule(data.hule);
            else if (data.pingju)   this._model.pingju(data.pingju);

            this._idx++;
        }

        this._view.redraw();
    }

    next() {

        if (this._log_idx == null) {
            this._log_idx = 0;
            this._idx = 0;
        }
        if (this._log_idx == this._paipu.log.length) {
            this.exit();
            return;
        }
        if (this._idx >= this._paipu.log[this._log_idx].length) {
            this._log_idx++;
            this._idx = 0;
        }
        if (this._log_idx == this._paipu.log.length) {
            this.summary();
            return;
        }

        let data = this._paipu.log[this._log_idx][this._idx];

        if      (data.qipai)    this.qipai(data);
        else if (data.zimo)     this.zimo(data);
        else if (data.dapai)    this.dapai(data);
        else if (data.fulou)    this.fulou(data);
        else if (data.gang)     this.gang(data);
        else if (data.gangzimo) this.gangzimo(data);
        else if (data.kaigang)  this.kaigang(data);
        else if (data.hule)     this.hule(data);
        else if (data.pingju)   this.pingju(data);

        if (! this._redo) this._idx++;

        if (this._paipu.log[this._log_idx][this._idx]
            && this._paipu.log[this._log_idx][this._idx].kaigang) this.next();
    }

    prev() {
        let idx  = this._idx >= 2 ? this._idx - 2: 0;
        let data = this._paipu.log[this._log_idx][idx];
        while (idx > 0 && ! (data.zimo || data.gangzimo
                            || data.fulou && ! data.fulou.m.match(/\d{4}/)))
        {
            data = this._paipu.log[this._log_idx][--idx];
        }
        this.seek(this._log_idx, idx);
    }

    qipai(data) {
        this._deny_repeat = false;
        this._model.qipai(data.qipai);
        this._view.redraw();
    }

    zimo(data) {
        this._model.zimo(data.zimo);
        this._view.update(data);
    }

    dapai(data) {
        if (data.dapai.p.substr(-1) == '*' && ! this._redo) {
            this._redo = true;
            this._view.say('lizhi', data.dapai.l);
            return;
        }
        this._redo = false;
        this._model.dapai(data.dapai);
        this._view.update(data);
    }

    fulou(data) {
        if (! this._redo) {
            this._redo = true;
            let m = data.fulou.m.replace(/0/,'5');
            if      (m.match(/^[mpsz](\d)\1\1\1/))
                                        this._view.say('gang', data.fulou.l);
            else if (m.match(/^[mpsz](\d)\1\1/))
                                        this._view.say('peng', data.fulou.l);
            else                        this._view.say('chi',  data.fulou.l);
            return;
        }
        this._redo = false;
        this._model.fulou(data.fulou);
        this._view.update(data);
    }

    gang(data) {
        if (! this._redo) {
            this._redo = true;
            this._view.say('gang', data.gang.l);
            return;
        }
        this._redo = false;
        this._model.gang(data.gang);
        this._view.update(data);
    }

    gangzimo(data) {
        this._model.zimo(data.gangzimo);
        this._view.update(data);
    }

    kaigang(data) {
        this._model.kaigang(data.kaigang);
        this._view.update(data);
    }

    hule(data) {
        if (! this._redo
            && ! this._paipu.log[this._log_idx][this._idx - 1].hule)
        {
            this._redo = true;
            if (data.hule.baojia == null) this._view.say('zimo', data.hule.l);
            else                          this._view.say('rong', data.hule.l);
            let i = 1;
            while (this._idx + i < this._paipu.log[this._log_idx].length) {
                let data = this._paipu.log[this._log_idx][this._idx + i];
                this._view.say('rong', data.hule.l)
                i++;
            }
            return;
        }
        this._redo = false;
        this._model.hule(data.hule);
        this._view.update(data);
        this._deny_repeat = true;
    }

    pingju(data) {
        if (! this._redo && data.pingju.name.match(/^三家和/)) {
            this._redo = true;
            for (let i = 1; i < 4; i++) {
                let l = (this._model.lunban + i) % 4;
                this._view.say('rong', l);
            }
            return;
        }
        this._redo = false;
        this._model.pingju(data.pingju);
        this._view.update(data);
        this._deny_repeat = true;
    }

    summary() {
        this._view.summary(this._paipu);
        return false;
    }

    viewpoint(viewpoint) {
        this._view.viewpoint = viewpoint % 4;
        if (this._log_idx == null) {
            this._view.kaiju();
            return false;
        }
        this._view.redraw();
        let data = this._paipu.log[this._log_idx][this._idx - 1];
        if (data.hule || data.pingju) this._view.update(data);
        return false;
    }

    shoupai() {
        this._view.open_shoupai = ! this._view.open_shoupai;
        this._view.redraw();
        let data = this._paipu.log[this._log_idx][this._idx - 1];
        if (data.hule || data.pingju) this._view.update(data);
        return false;
    }

    he() {
        this._view.open_he = ! this._view.open_he;
        this._view.redraw();
        let data = this._paipu.log[this._log_idx][this._idx - 1];
        if (data.hule || data.pingju) this._view.update(data);
        return false;
    }
}
