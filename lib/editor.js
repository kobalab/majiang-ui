/*
 *  Majiang.UI.PaipuEditor
 */
"use strict";

const $ = require('jquery');

const { hide, show, fadeIn, fadeOut } = require('./fadein');

module.exports = class PaipuEditor {

    constructor(root, paipu, pai, callback, save) {
        this._root     = root;
        this._paipu    = paipu;
        this._pai      = pai;
        this._callback = callback;

        $('.menu .title', root).text(paipu.title);
        $('.summary textarea[name="title"]', root).text(paipu.title)
        $('.summary input[name="qijia"]', root).val([paipu.qijia]);
        for (let id = 0; id < 4; id++) {
            $('.summary textarea[name="player"]', root)
                                        .eq(id).text(paipu.player[id]);
            $('.summary input[name="defen"]', root).eq(id).val(paipu.defen[id]);
            $('.summary input[name="point"]', root).eq(id).val(paipu.point[id]);
        }
    }
}
