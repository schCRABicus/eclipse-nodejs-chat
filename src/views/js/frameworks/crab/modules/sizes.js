/**
 * @module Collects information about browser size and provides it;
 */
(function(){

    CRABMCE.create('sizes', [], function(){

        var
            /**
             * Stores browser's width;
             *
             * @property _browserWidth
             * @type {Number}
             * @private
             */
            _browserWidth,

            /**
             * Stores browser's height;
             *
             * @property _browserHeight
             * @type {Number}
             * @private
             */
            _browserHeight,

            /**
             * Stores block's width;
             * Block is a separate page and its width is set in css as 75% of width;
             * But for some plugins ( for example, jScrollBar) it's necessary to know block's width;
             *
             * @property _blockWidth
             * @type {Number}
             * @private
             */
            _blockWidth,

            /**
             * Gets browser's width;
             *
             * @method getBrowserWidth
             * @public
             * @return {Number} Returns browser's width;
             */
            getBrowserWidth = function(){
                return _browserWidth;
            },

            /**
             * Gets browser's height;
             *
             * @method getBrowserHeight
             * @public
             * @return {Number} Returns browser's height;
             */
            getBrowserHeight = function(){
                return _browserHeight;
            },

            /**
             * Gets block's width;
             *
             * @method getBlockWidth
             * @public
             * @return {Number} Returns block's width;
             */
            getBlockWidth = function(){
                return _blockWidth;
            },

            /**
             * Initializes plugin
             *
             * @method init
             * @public
             */
            init = function(){
                var w = $(window),
                    b = $('.block');

                _browserWidth = w.width();
                _browserHeight = w.height();
                _blockWidth = b.width();
            };

        return {
            init : init,
            getBrowserWidth : getBrowserWidth,
            getBrowserHeight : getBrowserHeight,
            getBlockWidth : getBlockWidth
        }

    });

})();