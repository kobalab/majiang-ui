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
        try {
            localStorage.setItem(this._name, this.stringify());
        }
        catch(e) {
            this._paipu = fix(JSON.parse(
                                localStorage.getItem(this._name) || '[]'));
            throw e;
        }
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

    constructor(root, storage, callback) {
        this._root    = root;
        this._row     = $('.row', root);
        this._storage = storage;
        this._paipu   = new PaipuStorage(storage);
        this._max_idx = 0;

        this.open_viewer = callback;

        $('.upload input', root).on('change', (ev)=>{
            for (let file of ev.target.files) {
                this.read_paipu(file);
            }
            $(ev.target).val(null);
        });

        $('.error', root).on('click', ()=>fadeOut($('.error', root)));
    }

    get isEmpty() { return ! this._paipu.length }

    add(paipu, truncate) {
        this._paipu.add(paipu);
        while (truncate, this._paipu.length > truncate) this._paipu.del(0);
    }

    read_paipu(file) {

        if (! file.type.match(/^application\/json$/i)
            && ! file.name.match(/\.json$/i))
        {
            this.error(`不正なファイル: ${file.name}`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev)=>{
            try {
                let paipu = JSON.parse(ev.target.result);
                this._paipu.add(paipu);
            }
            catch(e) {
                if (e instanceof DOMException)
                        this.error('ローカルストレージ容量オーバー');
                else    this.error(`不正なファイル: ${file.name}`);

            }
            this.redraw();
        };
        reader.readAsText(file);
    }

    redraw() {

        let list = $('.list', this._root).empty();
        for (let i = 0; i < this._paipu.length; i++) {
            let paipu = this._paipu.get(i);
            let player = [];
            for (let l = 0; l < 4; l++) {
                let point = (paipu.point[l] > 0 ? '+' : '') + paipu.point[l];
                player[paipu.rank[l] - 1] = `${paipu.player[l]} (${point})`;
            }

            let row = this._row.clone();
            $('.title', row).text(paipu.title);
            $('.player', row).text(player.join(' / '));
            list.append(hide(row));
            if (i < this._max_idx) show(row);
        }
        this._max_idx = this._paipu.length;

        if (this.isEmpty) hide($('.download', this._root));
        else              show($('.download', this._root));

        this.set_handler();

        show($('.file', this._root));
        fadeIn($('.row.hide'), this._root);
    }

    set_handler() {

        if (this.isEmpty) return;

        let row = $('.row', this._root);
        for (let i = 0; i < this._paipu.length; i++) {

            $('.replay', row.eq(i)).on('click', ()=>{
                const viewer = this.open_viewer(this._paipu.get(i));
                viewer.start();
            });

            $('.delete', row.eq(i)).on('click', ()=>{
                this._paipu.del(i);
                this.redraw();
            });

            let title = this._paipu.get(i).title.replace(/[\s\n\\\/\:]/g, '_');
            let blob  = new Blob([ this._paipu.stringify(i) ],
                                 { type: 'application/json' });
            $('.download', row.eq(i))
                        .attr('href', URL.createObjectURL(blob))
                        .attr('download', `牌譜(${title}).json`);
        }

        let title = this._paipu.get(0).title.replace(/[\s\n\\\/\:]/g, '_');
        let blob  = new Blob([ this._paipu.stringify() ],
                             { type: 'application/json' });
        $('.file > .button .download', this._root)
                    .attr('href', URL.createObjectURL(blob))
                    .attr('download', `牌譜(${title}).json`);
    }

    error(msg) {
        const error = $('.error', this._root).text(msg);
        fadeIn(error);
        setTimeout(()=>error.trigger('click'), 5000);
    }
}
