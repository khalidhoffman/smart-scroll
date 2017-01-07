var BotScrollVerifier = require('./verifiers/bot'),
    UserScrollVerifier = require('./verifiers/user'),
    $ = require('jquery');

function ScrollListener($el, verfiers) {
    this.$el = $el;
    this.onScroll = this.onScroll.bind(this);
    this.verifiers = verfiers || [];
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
            this.$el.trigger('smart-scroll:'+result, evt);
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

$.fn.userScroll = function () {
    var scrollListener = new ScrollListener(this, [
        new UserScrollVerifier()
    ]);
    this.on('scroll', scrollListener.onScroll);
    return this;
};

$.fn.botScroll = function () {
    var scrollListener = new ScrollListener(this, [
        new BotScrollVerifier()
    ]);
    this.on('scroll', scrollListener.onScroll);
    return this;
};
module.exports = ScrollListener;
