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

        $('.menu .title', root).text(paipu.title);
        $('.menu .save', root).off('click').on('click', save);
        $('.menu .exit', root).off('click').on('click', callback);

        $('.summary textarea[name="title"]', root).val(paipu.title)
            .off('change').on('change', (ev)=>{
                paipu.title =  $(ev.target).val();
                $('.menu .title', root).text(paipu.title);
            });

        $('.summary input[name="qijia"]', root).val([paipu.qijia])
            .off('change').on('change', (ev)=>{
                paipu.qijia = + $(ev.target).val();
            });

        for (let id = 0; id < 4; id++) {
            $('.summary textarea[name="player"]', root)
                                        .eq(id).val(paipu.player[id])
                .off('change').on('change', (ev)=>{
                    paipu.player[id] = $(ev.target).val();
                });
            $('.summary input[name="defen"]', root).eq(id).val(paipu.defen[id])
                .off('change').on('change', (ev)=>{
                    paipu.defen[id] = $(ev.target).val();
                });
            $('.summary input[name="point"]', root).eq(id).val(paipu.point[id])
                .off('change').on('change', (ev)=>{
                    paipu.point[id] = $(ev.target).val();
                });
        }
    }
}
