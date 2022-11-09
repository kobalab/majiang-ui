/*
 *  Majiang.UI.Board
 */
"use strict";

const $ = require('jquery');

const Shoupai    = require('./shoupai');
const Shan       = require('./shan');
const He         = require('./he');
const HuleDialog = require('./dialog');
const summary    = require('./summary');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

const class_name = ['main','xiajia','duimian','shangjia'];
const feng_hanzi = ['東','南','西','北'];
const shu_hanzi  = ['一','二','三','四'];

const say_text   = { chi:   'チー',
                     peng:  'ポン',
                     gang:  'カン',
                     lizhi: 'リーチ',
                     rong:  'ロン',
                     zimo:  'ツモ'    };

class Score {

    constructor(root, model) {
        this._model = model;
        this._view = {
            root:      root,
            jushu:     $('.jushu', root),
            changbang: $('.changbang', root),
            lizhibang: $('.lizhibang', root),
            defen:     [],
        };
        this._viewpoint = 0;
        hide(this._view.root);
    }

    redraw(viewpoint) {

        if (viewpoint != null) this._viewpoint = viewpoint;

        show(this._view.root);

        let jushu = feng_hanzi[this._model.zhuangfeng]
                  + shu_hanzi[this._model.jushu] + '局';
        this._view.jushu.text(jushu);
        this._view.changbang.text(this._model.changbang);
        this._view.lizhibang.text(this._model.lizhibang);

        for (let l = 0; l < 4; l++) {
            let id = this._model.player_id[l];
            let defen = '' + this._model.defen[id];
            defen = defen.replace(/(\d)(\d{3})$/,'$1,$2');
            defen = `${feng_hanzi[l]}: ${defen}`;
            let c = class_name[(id + 4 - this._viewpoint) % 4];
            this._view.defen[l] = $(`.defen .${c}`, this._root);
            this._view.defen[l].removeClass('lunban').text(defen);
            if (l == this._model.lunban) this._view.defen[l].addClass('lunban');
        }
        return this;
    }

    update() {
        let lunban = this._model.lunban < 0 ? 0 : this._model.lunban;
        for (let l = 0; l < 4; l++) {
            if (l == lunban) this._view.defen[l].addClass('lunban');
            else             this._view.defen[l].removeClass('lunban');
        }
        return this;
    }
}

module.exports = class Board {

    constructor(root, pai, audio, model) {
        this._root  = root;
        this._model = model;
        this._pai   = pai;
        this._view  = {
            score:   new Score($('.score', root), model),
            shan:    null,
            shoupai: [],
            he:      [],
            say:     [],
            dialog:  null,
            summary: hide($('> .summary', root)),
            kaiju:   hide($('> .kaiju', root)),
        };
        this._say = [];
        this._lizhi = false;

        this.viewpoint = 0;
        this.sound_on  = true
        this.open_shoupai;
        this.open_he;
        this.no_player_name;

        this._timeout_id;

        this.set_audio(audio);
    }

    set_audio(audio) {
        this._audio = {};
        for (let name of ['dapai','chi','peng','gang','rong','zimo','lizhi']) {
            this._audio[name] = [];
            for (let l = 0; l < 4; l++) {
                this._audio[name][l] = audio(name);
            }
        }
        this._audio.gong = audio('gong');
        return this;
    }

    redraw() {

        this._timeout_id = clearTimeout(this._timeout_id);
        hide(this._view.summary);
        hide(this._view.kaiju);

        this._view.score.redraw(this.viewpoint);

        this._view.shan = new Shan($('.score .shan', this._root), this._pai,
                                    this._model.shan).redraw();

        for (let l = 0; l < 4; l++) {
            let id   = this._model.player_id[l];
            let c    = class_name[(id + 4 - this.viewpoint) % 4];

            show($(`> .player.${c}`, this._root).text(
                    this._model.player[id].replace(/\n.*$/,'')));
            if (this.no_player_name) hide($(`> .player.${c}`, this._root));

            let open = this._model.player_id[l] == this.viewpoint;
            this._view.shoupai[l]
                    = new Shoupai(show($(`.shoupai.${c}`, this._root)),
                                    this._pai, this._model.shoupai[l])
                        .redraw(open || this.open_shoupai);

            this._view.he[l]
                    = new He(show($(`.he.${c}`, this._root)),
                                    this._pai, this._model.he[l])
                        .redraw(this.open_he);

            this._view.say[l] = hide($(`.say.${c}`, this._root).text(''));
            this._say[l] = null;
        }

        this._lunban = this._model.lunban;
        this._view.score.update();

        this._view.dialog
            = new HuleDialog($('.hule-dialog', this._root), this._pai,
                            this._model, this.viewpoint).hide();

        return this;
    }

    update(data = {}) {

        if (this._lunban >= 0 && this._lunban != this._model.lunban) {
            if (this._say[this._lunban]) {
                fadeOut(this._view.say[this._lunban]);
                this._say[this._lunban] = null;
            }
            else {
                hide(this._view.say[this._lunban].text(''));
            }
            if (this._lizhi) {
                this._view.score.redraw();
                this._lizhi = false;
            }
            this._view.he[this._lunban].redraw();
            this._view.shoupai[this._lunban].redraw();
        }

        if (   (this._say[this._lunban] == 'lizhi')
            || (this._say[this._lunban] == 'chi'   && ! data.fulou)
            || (this._say[this._lunban] == 'peng'  && ! data.fulou)
            || (this._say[this._lunban] == 'gang'
                            && !(data.fulou || data.gang || data.kaigang)))
        {
            fadeOut(this._view.say[this._lunban]);
            this._say[this._lunban] = null;
        }

        if (data.zimo) {
            this._view.shan.update();
            this._view.shoupai[data.zimo.l].redraw();
        }
        else if (data.dapai) {
            this._view.shoupai[data.dapai.l].dapai(data.dapai.p);
            if (this.sound_on) {
                this._audio.dapai[data.dapai.l].currentTime = 0;
                this._audio.dapai[data.dapai.l].play();
            }
            this._view.he[data.dapai.l].dapai(data.dapai.p);
            this._lizhi = data.dapai.p.substr(-1) == '*';
        }
        else if (data.fulou) {
            this._view.shoupai[data.fulou.l].redraw();
        }
        else if (data.gang) {
            this._view.shoupai[data.gang.l].redraw();
        }
        else if (data.gangzimo) {
            this._view.shan.update();
            this._view.shoupai[data.gangzimo.l].redraw();
        }
        else if (data.kaigang) {
            this._view.shan.redraw();
        }
        else if (data.hule) {
            this.hule(data.hule);
        }
        else if (data.pingju) {
            this.pingju(data.pingju);
        }
        else {
            this._view.score.redraw();
        }

        this._lunban = this._model.lunban;
        if (this._lunban >= 0) this._view.score.update();

        return this;
    }

    hule(hule) {

        for (let l = 0; l < 4; l++) {
            fadeOut(this._view.say[l]);
            this._say[l] = null;
        }

        this._timeout_id = setTimeout(()=>{
            this._view.shoupai[hule.l].redraw(true);
            this._view.dialog.hule(hule);
            if (this.sound_on && hule.damanguan) this._audio.gong.play();
        }, 400);
    }

    pingju(pingju) {

        for (let l = 0; l < 4; l++) {
            fadeOut(this._view.say[l]);
            this._say[l] = null;
        }
        let duration = 0;
        if (pingju.name.match(/^三家和/)) {
            duration = 400;
        }
        else {
            this._view.he[this._lunban].redraw();
            this._view.shoupai[this._lunban].redraw();
        }

        this._timeout_id = setTimeout(()=>{
            for (let l = 0; l < 4; l++) {
                let open = this._model.player_id[l] == this.viewpoint
                            || pingju.shoupai[l];
                this._view.shoupai[l].redraw(open);
            }
            this._view.dialog.pingju(pingju);
        }, duration);
    }

    say(name, l) {
        if (this.sound_on) {
            this._audio[name][l].currentTime = 0;
            this._audio[name][l].play();
        }
        show(this._view.say[l].text(say_text[name]));
        this._say[l] = name;
    }

    kaiju() {
        if (this.no_player_name) return;
        hide($('> *', this._root));
        let title = $('<span>').text(this._model.title).html()
                                            .replace(/\n/g,'<br>');
        $('.title', this._view.kaiju).html(title);
        for (let id = 0; id < 4; id++) {
            let c = class_name[(4 - this.viewpoint + id) % 4];
            let name = this._model.player[id].replace(/\n.*$/,'');
            $(`.player .${c}`, this._view.kaiju).text(name);
        }
        show(this._view.kaiju);
    }

    summary(paipu) {
        this._timeout_id = clearTimeout(this._timeout_id);
        this._view.dialog.hide();
        this._view.summary.scrollTop(0);
        if (paipu) fadeIn(summary(this._view.summary, paipu, this.viewpoint));
        else       hide(this._view.summary);
    }
}
