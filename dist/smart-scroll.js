var __ss__ = {
    // require stub
    require: function (dep) {
        switch (dep) {
            case 'jquery':
                return window.jQuery || window.$ || null;
            case './verifiers/user':
                return __ss__.module.cache[0];
            case './verifiers/bot':
                return __ss__.module.cache[1];
                break;
        }
    },
    // module stub
    module: {
        stub: true,
        cache: {},
        size: 0,
        process: function () {
            __ss__.module.cache[__ss__.module.size++] = __ss__.module.exports;
        }
    }
};
(function (require, module, define) {
    var $ = require('jquery');

function UserScrollVerifier(){
    this.config = {
        tag: 'user',
        verificationTimeLimit: 200
    };
    this.$dom = $(window);
    this.state = {
        lastActionTimestamp : 0
    };

    return this;
}

UserScrollVerifier.prototype = {
    init: function(){
        var self = this,
            userEvents = [
                'mousedown',
                'mouseup',
                'wheel',
                'touchstart',
                'touchmove',
                'drag'
            ],
            events = userEvents.join(' ');
        this.$dom.on(events, function(){
            self.state.lastUserActionTimestamp = Date.now();
        })
    },
    validate: function(){
        return Date.now() - this.state.lastUserActionTimestamp < this.config.verificationTimeLimit ? this.config.tag : false;
    }
};

module.exports = UserScrollVerifier;

module.process();

var $ = require('jquery');

function BotScrollVerifier() {
    this.config = {
        verificationTimeLimit: 200,
        flingScrollDelay: 1000,
        tag: 'bot'
    };
    this.$dom = $(window);
    this.state = {
        lastUserActionTimestamp: 0,
        isOverriding: false,
        validationOverrideVal: false
    };

    this.updateTimeStamp = this.updateTimeStamp.bind(this);
    return this;
}

BotScrollVerifier.prototype = {
    init: function () {
        var self = this,
            userEvents = [
                'wheel',
                'touchmove',
                'drag'
            ],
            events = userEvents.join(' ');

        this.$dom.on(events, self.updateTimeStamp);
        this.$dom.on('mousedown touchstart', function () {
            // automatically ignore all input if mouse is down
            self.state.isOverriding = true;
            $('body').css({
                fontSize: '10px'
            });
        });
        this.$dom.on('mouseup', function () {
            // lift override if mouse is lifted
            self.state.isOverriding = false;
        });
        this.$dom.on('touchcancel touchend', function () {
            // use timeout to allow for slung page to settle
            setTimeout(function () {
                self.state.isOverriding = false;
            }, self.config.flingScrollDelay)
        })
    },

    updateTimeStamp: function (val) {
        this.state.lastUserActionTimestamp = Date.now() || val;
    },
    validate: function () {
        return this.state.isOverriding ? this.state.validationOverrideVal : Date.now() - this.state.lastUserActionTimestamp > this.config.verificationTimeLimit ? this.config.tag : false;
    }
};

module.exports = BotScrollVerifier;

module.process();

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

module.process();

})(__ss__.require, __ss__.module);