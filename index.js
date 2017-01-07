var BotScrollVerifier = require('./verifiers/bot'),
    UserScrollVerifier = require('./verifiers/user'),
    $ = require('jquery');

function ScrollListener($el, verifiers) {
    this.$el = $el;
    this.verifiers = verifiers || [];
    this.init();
}

ScrollListener.prototype = {
    init: function () {
        var validationIdx = 0;
        while (this.verifiers[validationIdx]) {
            if (this.verifiers[validationIdx].init) {
                this.verifiers[validationIdx].init()
            }
            validationIdx++;
        }
    },
    checkValidity: function (evt) {
        var result = false,
            validationIdx = 0;
        while (!result && this.verifiers[validationIdx]) {
            result = this.verifiers[validationIdx++].validate(evt);
        }
        return result;
    },
    build: function(callback){
        var self = this;
        return function(evt){
            var result = self.checkValidity(evt);
            if (result) {
                if (callback) callback(evt);
                self.$el.trigger('smart-scroll:' + result, evt);
                self.$el.trigger('smart-scroll', evt);
            }
        }
    }
};

$.fn.userScroll = function (callback) {
    var $el = this,
        scrollListener = new ScrollListener($el, [
            new UserScrollVerifier()
        ]);
    $el.on('scroll', scrollListener.build(callback));
    return $el;
};

$.fn.botScroll = function (callback) {
    var $el = this,
        scrollListener = new ScrollListener($el, [
            new BotScrollVerifier()
        ]);
    $el.on('scroll', scrollListener.build(callback));
    return $el;
};

module.exports = ScrollListener;
