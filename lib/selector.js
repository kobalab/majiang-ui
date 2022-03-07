/*
 *  selector.js
 */
"use strict";

let debug = 0;                                                      // for DEBUG
let counter = 0;                                                    // for DEBUG
const selectors = {};

function setSelector(list, namespace, param = {}) {

    clearSelector(namespace);

    let opt = {
        confirm: 'Enter', prev: 'ArrowLeft', next: 'ArrowRight',
        tabindex: 0, focus: 0, touch: true
    };
    Object.assign(opt, param);

    const c = ++counter;                                            // for DEBUG
    if (namespace[0] != '.') namespace = '.' + namespace;
    selectors[namespace] = list;

    let i   = null;
    let len = list.length

    function touchstart(ev) {
        if (opt.touch) {
            $(ev.target).off('touchstart' + namespace).trigger('focus');
            return false;
        }
        else {
            $(ev.target).trigger('focus');
        }
    }

    list.attr('tabindex', opt.tabindex).attr('role','button')
        .on('touchstart' + namespace, touchstart)
        .on('focus'      + namespace, (ev)=>{ i = list.index($(ev.target)) })
        .on('blur'       + namespace, (ev)=>{ i = null;
                        $(ev.target).on('touchstart' + namespace, touchstart)})
        .on('mouseover'  + namespace, (ev)=>$(ev.target).trigger('focus'))
        .on('mouseout'   + namespace, (ev)=>$(ev.target).trigger('blur'));

    if (opt.confirm) {
        $(window).on('keyup' + namespace, (ev)=>{
            if (debug) console.log(c, ev.type+namespace, ev.key, i);// for DEBUG
            if (ev.key == opt.confirm && i != null) {
                list.eq(i).trigger('click');
                return false;
            }
        });
    }
    if (opt.prev || prev.next) {
        $(window).on('keydown' + namespace, (ev)=>{
            if (debug) console.log(c, ev.type+namespace, ev.key, i);// for DEBUG
            if (ev.key == opt.prev) {
                i = (i == null) ? len - 1 :
                    (i <=    0) ?       0 : i - 1;
                list.eq(i).trigger('touchstart');
                return false;
            }
            else if (ev.key == opt.next) {
                i = (i ==    null) ?       0 :
                    (i >= len - 1) ? len - 1 : i + 1;
                list.eq(i).trigger('touchstart');
                return false;
            }
        });
    }
    if (opt.focus != null) {
        list.eq(opt.focus).trigger('touchstart');
    }
    if (debug) console.log('ON', c, namespace,                      // for DEBUG
                            $._data(window).events);                // for DEBUG
    return list;
}

function clearSelector(namespace) {
    if (namespace[0] != '.') namespace = '.' + namespace;
    if (! selectors[namespace]) return;
    selectors[namespace].removeAttr('tabindex role').off(namespace);
    $(window).off(namespace);
    delete selectors[namespace];
    if (debug) console.log('OFF', namespace);                       // for DEBUG
}

module.exports = {
    setSelector:    setSelector,
    clearSelector:  clearSelector
}
