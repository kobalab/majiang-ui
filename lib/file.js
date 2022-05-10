/*
 *  Majiang.UI.PaipuFile
 */
"use strict";

const { hide, show, fadeIn, fadeOut } = require('./fadein');

function fix(paipu) {
    const keys = ['title','player','qijia','log','defen','rank','point'];
    for (let p of [].concat(paipu)) {
        for (let key of keys) {
            if (p[key] == undefined) throw new Error(`${key}: undefined`);
        }
    }
    return paipu;
}

class PaipuStorage {

    constructor(name) {
        this._paipu = [];
        this._name  = name;
        try {
            if (name) {
                this._paipu = fix(JSON.parse(
                                    localStorage.getItem(name) || '[]'));
            }
        }
        catch(e) {
            console.log(e);
        }
    }
    get length() {
        return this._paipu.length;
    }
    stringify(idx) {
        return JSON.stringify(idx == null ? this._paipu : this._paipu[idx]);
    }
    save() {
        if (! this._name) return;
        localStorage.setItem(this._name, this.stringify());
    }
    add(paipu) {
        this._paipu = this._paipu.concat(fix(paipu));
        this.save();
    }
    del(idx) {
        this._paipu.splice(idx, 1);
        this.save();
    }
    get(idx) {
        if (idx == null) return this._paipu;
        else             return this._paipu[idx];
    }
    sort(sort) {
        let tmp = this._paipu.concat();
        for (let i = 0; i < this.length; i++) {
            this._paipu[i] = tmp[sort[i]];
        }
        this.save();
    }
}

module.exports = class PaipuFile {

    constructor(root, storage) {
        this._node = {
            root:   root,
        }
        this._storage = storage;
        this._paipu   = new PaipuStorage(storage);
    }

    add(paipu, truncate) {
        this._paipu.add(paipu);
        while (truncate, this._paipu.length > truncate) this._paipu.del(0);
    }
}
