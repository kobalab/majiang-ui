/*
 *  Majiang.UI.Shan
 */
"use strict";

module.exports = class Shan {

    constructor(root, pai, shan) {

        this._node = {
            baopai:   $('.baopai',   root),
            fubaopai: $('.fubaopai', root),
            paishu:   $('.paishu',   root)
        };
        this._pai  = pai;
        this._shan = shan;
    }

    redraw() {

        let baopai = this._shan.baopai;
        this._node.baopai.attr('aria-label', 'ドラ');
        this._node.baopai.empty();
        for (let i = 0; i < 5; i++) {
            this._node.baopai.append(this._pai(baopai[i] || '_'));
        }

        let fubaopai = this._shan.fubaopai || [];
        this._node.fubaopai.attr('aria-label', '裏ドラ');
        this._node.fubaopai.empty();
        for (let i = 0; i < 5; i++) {
            this._node.fubaopai.append(this._pai(fubaopai[i] || '_'));
        }

        this._node.paishu.text(this._shan.paishu);

        return this;
    }

    update() {
        this._node.paishu.text(this._shan.paishu);
        return this;
    }
}
