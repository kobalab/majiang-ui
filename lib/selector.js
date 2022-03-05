/*
 *  selector.js
 */
"use strict";

let debug = 0;                                                      // for DEBUG
let counter = 0;                                                    // for DEBUG
const selectors = {};

function setSelector(list, namespace, key) {

    clearSelector(namespace);

    const c = ++counter;                                            // for DEBUG
    if (namespace[0] != '.') namespace = '.' + namespace;
    selectors[namespace] = list;

    let i   = null;
    let len = list.length

    function touchstart(ev) {
        $(ev.target).off('touchstart' + namespace).trigger('focus');
        return false;
    }

    list.on('touchstart' + namespace, touchstart)
        .on('focus'      + namespace, (ev)=>{ i = list.index($(ev.target)) })
        .on('blur'       + namespace, (ev)=>{ i = null;
                        $(ev.target).on('touchstart' + namespace, touchstart)})
        .on('mouseover'  + namespace, (ev)=>$(ev.target).trigger('focus'))
        .on('mouseout'   + namespace, (ev)=>$(ev.target).trigger('blur'));

    if (key) {
        $(window).on('keyup' + namespace, (ev)=>{
            if (debug) console.log(c, ev.type+namespace, ev.key, i);// for DEBUG
            if (ev.key == key.confirm && i != null) {
                list.eq(i).trigger('click');
                return false;
            }
        }).on('keydown' + namespace, (ev)=>{
            if (debug) console.log(c, ev.type+namespace, ev.key, i);// for DEBUG
            if (ev.key == key.prev) {
                i = (i == null) ? len - 1 :
                    (i <=    0) ?       0 : i - 1;
                list.eq(i).trigger('touchstart');
                return false;
            }
            else if (ev.key == key.next) {
                i = (i ==    null) ?       0 :
                    (i >= len - 1) ? len - 1 : i + 1;
                list.eq(i).trigger('touchstart');
                return false;
            }
        });
    }
    if (debug) console.log('ON', c, namespace,                      // for DEBUG
                            $._data(window).events);                // for DEBUG

    return list;
}

function clearSelector(namespace) {
    if (namespace[0] != '.') namespace = '.' + namespace;
    if (! selectors[namespace]) return;
    selectors[namespace].off(namespace);
    $(window).off(namespace);
    if (debug) console.log('OFF', namespace);                       // for DEBUG
}

module.exports = {
    setSelector:    setSelector,
    clearSelector:  clearSelector
}
