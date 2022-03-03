/*
 *  selector.js
 */
"use strict";

const debug = 0;                                                    // for DEBUG
let counter = 0;                                                    // for DEBUG
                                                                    // for DEBUG
let cansel = ()=>{};

module.exports = (list, namespace, key)=>{

    cansel();
    cansel = ()=>{
        list.off(namespace);
        $(window).off(namespace);
    };

    const c = ++counter;                                            // for DEBUG
    namespace = namespace ? '.' + namespace : '';

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
        .on('mouseout'   + namespace, (ev)=>$(ev.target).trigger('blur'))
        .on('click'      + namespace, cansel);

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
