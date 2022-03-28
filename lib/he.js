/*
 *  Majiang.UI.He
 */
"use strict";

const $ = require('jquery');

module.exports = class He {

    constructor(root, pai, he, open) {

        this._node = {
            root:   root,
            chouma: $('.chouma', root),
            dapai:  $('.dapai',  root)
        };
        this._pai  = pai;
        this._he   = he;
        this._open = open;
        this._node.chouma.addClass('hide');
    }

    redraw(open) {

        if (open != null) this._open = open;

        this._node.root.attr('aria-label', '捨て牌');
        this._node.chouma.attr('aria-label', 'リーチ');
        this._node.dapai.empty();
        let lizhi = false;
        let i = 0;
        for (let p of this._he._pai) {
            if (p.match(/\*/)) {
                lizhi = true;
                this._node.chouma.removeClass('hide');
            }
            if (p.match(/[\+\=\-]/)) continue;

            let pai = this._pai(p);
            if (this._open && p[2] == '_') {
                pai.addClass('mopai');
            }
            if (lizhi) {
                pai = $('<span class="lizhi">').attr('aria-label', 'リーチ')
                                               .append(pai);
                lizhi = false;
            }
            this._node.dapai.append(pai);

            i++;
            if (i < 6 * 3 && i % 6 == 0) {
                this._node.dapai.append($('<span class="break">'));
            }
        }
        return this;
    }

    dapai(p) {

        let pai = this._pai(p).addClass('dapai').attr('aria-live','assertive');
        if (p[2] == '_') pai.addClass('mopai');
        if (p.match(/\*/)) pai = $('<span class="lizhi">').append(pai);
        this._node.dapai.append(pai);
        return this;
    }
}
