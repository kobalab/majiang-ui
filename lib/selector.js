/*
 *  selector.js
 */
"use strict";

const $ = require('jquery');

const touchstart = (ev)=>{
    $(ev.target).off('touchstart').trigger('focus');
    return false;
}

module.exports = (list, namespace = '', keys = ['ArrowLeft','ArrowRight'])=>{

    if (namespace) namespace = '.' + namespace;

    let i = -1;

    list.on('touchstart' + namespace, touchstart)
        .on('focus'      + namespace, (ev)=>{ i = list.index($(ev.target)) })
        .on('blur'       + namespace, (ev)=>
                $(ev.target).on('touchstart' + namespace, touchstart))
        .on('mouseover'  + namespace, (ev)=>$(ev.target).trigger('focus'))
        .on('mouseout'   + namespace, (ev)=>$(ev.target).trigger('blur'));

    $(window).on('keyup' + namespace, (ev)=>{
        if (ev.key == 'Enter') list.eq(i).trigger('click');
        return false;
    }).on('keydown' + namespace, (ev)=>{
        if (ev.key == keys[0] && i > 0)
                list.eq(i - 1).trigger('touchstart');
        else if (ev.key == keys[1])
                list.eq(i + 1).trigger('touchstart');
        return false;
    });
}