/*
 *  Majiang.UI.Paipu
 */
"use strict";

const AI = require('@kobalab/majiang-ai');

module.exports = class Analyzer extends AI {

    constructor(root, kaiju, callback) {
        super();
        this._root = root;
        this.close = callback;
        this.next(kaiju);
    }

    next(msg) {
        super.action(msg);
    }

    action(msg) {
        super.action(msg, ()=>{});
    }
}
