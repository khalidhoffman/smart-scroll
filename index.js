var BotScrollVerifier = require('./verifiers/bot'),
    UserScrollVerifier = require('./verifiers/user'),
    $ = require('jquery');

function ScrollListener($el, verifiers) {
    this.$el = $el;
    this.onScroll = this.onScroll.bind(this);
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
    onScroll: function (evt) {
        var result = this.checkValidity(evt);
        if (result) {
            this.$el.trigger('smart-scroll:' + result, evt);
            this.$el.trigger('smart-scroll', evt);
        }
    },
    checkValidity: function (evt) {
        var result = false,
            validationIdx = 0;
        while (!result && this.verifiers[validationIdx]) {
            result = this.verifiers[validationIdx++].validate(evt);
        }
        return result;
    }
};

$.fn.userScroll = function (callback) {
    var $el = this,
        scrollListener = new ScrollListener($el, [
            new UserScrollVerifier()
        ]);
    $el.on('scroll', scrollListener.onScroll);
    if (callback) $el.on('smart-scroll:user', callback);
    return $el;
};

$.fn.botScroll = function (callback) {
    var $el = this,
        scrollListener = new ScrollListener($el, [
            new BotScrollVerifier()
        ]);
    $el.on('scroll', scrollListener.onScroll);
    if (callback) $el.on('smart-scroll:bot', callback);
    return $el;
};

module.exports = ScrollListener;
