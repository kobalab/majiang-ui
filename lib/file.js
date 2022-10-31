/*
 *  Majiang.UI.PaipuFile
 */
"use strict";

const $ = require('jquery');
require('jquery-ui/ui/widgets/sortable');

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

function http_error(res) {
    const statusText = {
        '400':  'Bad Request',
        '401':  'Unauthorized',
        '402':  'Payment Required',
        '403':  'Forbidden',
        '404':  'Not Found',
        '405':  'Method Not Allowed',
        '406':  'Not Acceptable',
        '407':  'Proxy Authentication Required',
        '408':  'Request Timeout',
        '409':  'Conflict',
        '410':  'Gone',
        '411':  'Length Required',
        '412':  'Precondition Failed',
        '413':  'Request Entity Too Large',
        '414':  'Request-URI Too Long',
        '415':  'Unsupported Media Type',
        '416':  'Requested Range Not Satisfiable',
        '417':  'Expectation Failed',
        '500':  'Internal Server Error',
        '501':  'Not Implemented',
        '502':  'Bad Gateway',
        '503':  'Service Unavailable',
        '504':  'Gateway Timeout',
        '505':  'HTTP Version Not Supported',
    };
    return res.statusText ? `${res.status} ${res.statusText}`
                          : `${res.status} ${statusText[res.status]}`;
}

module.exports = class PaipuFile {

    constructor(root, storage, viewer, stat, tenhou, url, hash) {
        this._root    = root;
        this._row     = $('.row', root);
        this._storage = storage;
        this._paipu   = new PaipuStorage(storage);
        this._max_idx = 0;

        this.open_viewer = viewer;
        this.goto_stat   = stat;

        if (tenhou) {
            let base   = location.href.replace(/\?.*$/,'')
                                      .replace(/[^\/]*$/,'');
            let otigin = location.origin;
            if (tenhou.substr(0, base.length) == base) {
                this._tenhou = tenhou.substr(base.length);
            }
            else if (tenhou.substr(0, origin.length) == origin) {
                this._tenhou = tenhou.substr(origin.length);
            }
            else {
                this._tenhou = tenhou;
            }
        }

        $('input[name="storage"]', root).prop('checked', true);

        $('.upload input', root).on('change', (ev)=>{
            for (let file of ev.target.files) {
                this.read_paipu(file);
            }
            $(ev.target).val(null);
        });
        $('input[name="storage"]', root).on('change', (ev)=>{
            this.storage($(ev.target).prop('checked'));
            fadeIn($('body'));
        });
        $('.stat', root).on('click', ()=>{
            if (this._url) history.replaceState('', '', '#stat');
            this.goto_stat(this._paipu.get());
        });
        $('.error', root).on('click', ()=>fadeOut($('.error', root)));
        $('form').on('submit', (ev)=>{
            let url = $('input[name="url"]', $(ev.target)).val();
            let hash = url.match(/#.*$/) || '';
            let id = url.replace(/^.*\?log=/,'')
                        .replace(/\&.*$/,'')
                        .replace(/#.*$/, '')
                        .replace(/^.*\//,'')
                        .replace(/\..*$/,'');
            location = '?' + this._tenhou + id + '.json' + hash;
            return false;
        });

        if (url) this.load_paipu(url, hash);
        else if (this.isEmpty)
                $('input[name="storage"]', root).trigger('click');
    }

    storage(on) {
        if (on) {
            delete this._url;
            history.replaceState('', '', location.pathname);
        }
        this._paipu = new PaipuStorage(on ? this._storage : null);
        $('input[name="storage"]', this._root).prop('checked', on);
        this.redraw();
    }

    get isEmpty() { return ! this._paipu.length }

    add(paipu, truncate) {
        delete this._url;
        this._paipu.add(paipu);
        while (truncate, this._paipu.length > truncate) this._paipu.del(0);
    }

    read_paipu(file) {

        if (! file.type.match(/^application\/json$/i)
            && ! file.name.match(/\.json$/i))
        {
            this.error(`${file.name}: 不正なファイルです`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev)=>{
            try {
                let paipu = JSON.parse(ev.target.result);
                this.add(paipu);
            }
            catch(e) {
                if (e instanceof DOMException)
                        this.error('ローカルストレージ容量オーバー');
                else    this.error(`${file.name}: 牌譜形式が不正です`);

            }
            this.redraw();
        };
        reader.readAsText(file);
    }

    load_paipu(url, hash) {

        this.storage(false);

        fetch(url)
            .then(res =>{
                if (! res.ok) {
                    this.error(`${decodeURI(url)}: ${http_error(res)}`);
                    throw new Error();
                }
                return res.json();
            })
            .then(data =>{
                this.add(data);
                this.redraw();
                this._url = url;
                if (hash) this.open(hash);
            })
            .catch(e =>{
                if (e instanceof TypeError)
                    this.error(`${decodeURI(url)}: ${e.message}`);
                else if (e.message)
                    this.error(`${decodeURI(url)}: 牌譜形式が不正です`);
            });
    }

    redraw() {

        let list = $('.list', this._root).empty();
        for (let i = 0; i < this._paipu.length; i++) {
            let paipu = this._paipu.get(i);
            let player = [];
            if (! paipu.rank.length) {
                for (let l = 0; l < 4; l ++) {
                    let id = (paipu.qijia + l) % 4;
                    paipu.rank[id] = l + 1;
                    paipu.point[id] = paipu.point[id] ?? '-';
                }
            }
            for (let l = 0; l < 4; l++) {
                let point = (paipu.point[l] > 0 ? '+' : '') + paipu.point[l];
                player[paipu.rank[l] - 1] = `${paipu.player[l]} (${point})`;
            }

            let row = this._row.clone();
            row.attr('data-idx', i);
            $('.title', row).text(paipu.title);
            $('.player', row).text(player.join(' / '));
            list.append(hide(row));
            if (i < this._max_idx) show(row);
        }
        this._max_idx = this._paipu.length;

        if (this.isEmpty) {
            hide($('.file > .button', this._root));
            if ($('input[name="storage"]', this._root).prop('checked'))
                    hide($('form', this._root));
            else if (this._tenhou)
                    show($('form', this._root));
        }
        else {
            show($('.file > .button', this._root));
            hide($('form', this._root));
        }


        this.set_handler();

        $('.list', this._node).sortable({
            opacity:     0.7,
            cursor:      'move',
            axis:        'y',
            containment: 'parent',
            tolerance:   'pointer',
            handle:      '.move',
            update:      (ev, ui)=>{
                delete this._url;
                let sort = $.makeArray($(ev.target).children().map(
                                (i, row)=>$(row).data('idx')));
                this._paipu.sort(sort);
                this.redraw();
            }
        });
        if (navigator.maxTouchPoints) hide($('.move', this._node));

        show($('.file', this._root));
        fadeIn($('.row.hide'), this._root);
    }

    set_handler() {

        if (this.isEmpty) return;

        let row = $('.row', this._root);
        for (let i = 0; i < this._paipu.length; i++) {

            $('.replay', row.eq(i)).on('click', ()=>{
                const viewer = this.open_viewer(this._paipu.get(i));
                if (this._url) viewer.set_fragment(`#${i||''}`);
                viewer.start();
            });

            $('.delete', row.eq(i)).on('click', ()=>{
                delete this._url;
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

    open(hash) {

        if (hash == 'stat') {
            this.goto_stat(this._paipu.get());
        }
        else if (hash) {
            let [ state, opt ] = hash.split(':');
            state = state.split('/').map(x => isNaN(x) ? 0 : +x|0);
            let i = state.shift();
            if (i >= this._paipu.length) return;
            const viewer = this.open_viewer(this._paipu.get(i))
            viewer.set_fragment('#' + hash);
            viewer.start(...state);
            if (opt) {
                if (opt.match(/s/)) viewer.shoupai();
                if (opt.match(/h/)) viewer.he();
                if (opt.match(/i/)) viewer.analyzer();
                for (let x of opt.match(/\+/g)||[]) {
                    if (viewer._deny_repeat) break;
                    viewer.next();
                }
            }
        }
    }

    error(msg) {
        const error = $('.error', this._root).text(msg);
        fadeIn(error);
        setTimeout(()=>error.trigger('click'), 5000);
    }
}
