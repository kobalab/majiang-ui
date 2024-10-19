/*
 *  flip.js
 */
"use strict";

module.exports = function flipInput(flip) {
    flip.off('focus').on('focus', (ev)=>{
        let tabindex = $(ev.target).attr('tabindex') || 0;
        $(ev.target).removeAttr('tabindex');
        $(ev.target).children().eq(0).hide();
        let input = $(ev.target).children().eq(1);
        input.show();
        input.attr('tabindex', tabindex);
        input.trigger('focus');
    });
    flip.each((i ,n)=>{
        $(n).children().eq(1).off('blur').on('blur', (ev)=>{
            let tabindex = $(ev.target).attr('tabindex');
            $(ev.target).removeAttr('tabindex');
            $(ev.target).hide();
            $(ev.target).parent().attr('tabindex', tabindex);
            $(ev.target).parent().children().eq(0).show();
        });
        $(n).children().eq(1).hide();
    });
}
