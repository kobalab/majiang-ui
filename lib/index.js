/*!
 *  @kobalab/majiang-ui v0.1.2
 *
 *  Copyright(C) 2021 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/majiang-ui/blob/master/LICENSE
 */

"use strict";

module.exports = {
    pai:        require('./pai'),
    audio:      require('./audio'),
    Shoupai:    require('./shoupai'),
    He:         require('./he'),
    Shan:       require('./shan'),
    Board:      require('./board'),
    HuleDialog: require('./dialog'),
    Player:     require('./player'),
    GameCtl:    require('./gamectl'),
    PaipuFile:  require('./file'),
    Util:       Object.assign(require('./fadein'),
                              require('./selector'))
}
