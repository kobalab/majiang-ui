/*
 *  Majiang.UI.pai
 */
"use strict";

const $ = require('jquery');

module.exports = function(loaddata) {

    const _pai = {};

    $('.pai', loaddata).each(function(){
        let p = $(this).data('pai');
        _pai[p] = $(this);
    });

    return function(p){
        return _pai[p.substr(0,2)].clone();
    }
}
