/*
 *  scale.js
 */
"use strict";

const $ = require('jquery');

function scale(board, space) {

    let dh = $('body').height();
    let bh = board.height();
    if (bh > dh) {
        let scale  = dh / bh;
        let margin = (dh - bh) / 2;
        board.css('transform', `translate(0px, ${margin}px) scale(${scale})`);
        $(window).scrollTop(space.height());
    }
    else {
        board.css('transform', '');
    }
}

module.exports = { scale: scale };
