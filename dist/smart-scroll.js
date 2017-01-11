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
                'keydown',
                'keyup',
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
        flingScrollDelay: 3000,
        tag: 'bot'
    };
    this.$window = $(window);
    this.state = {
        status: 'init',
        timeoutId : -1,
        lastUserActionTimestamp: 0,
        validationOverrideVal: false
    };

    this.updateTimeStamp = this.updateTimeStamp.bind(this);
    return this;
}

BotScrollVerifier.prototype = {
    init: function () {
        var self = this,
            userEventList = [
                'wheel',
                'touchmove',
                'keydown',
                'keyup',
                'drag'
            ],
            userEvents = userEventList.join(' ');

        this.$window.on(userEvents, self.updateTimeStamp);

        this.$window.on('mousedown touchstart', function () {
            // automatically invalidate all input if mouse is down
            self.setOverriding();
        });
        this.$window.on('mouseup', function () {
            // continue listening once this mouse is lifted
            // might have issues if user scrolls with 2 buttons pressed and lifts only 1
            if (self.state.status == 'overriding') {
                self.setActive();
            }
        });
        this.$window.on('touchcancel touchend', function () {
            // use timeout to allow for slung page to settle
            setTimeout(function () {
                if (self.state.status == 'overriding'){
                    self.setActive();
                }
            }, self.config.flingScrollDelay)
        })
    },

    setInit: function(){
        this.state.status = 'init';
    },

    setOverriding: function(){
        this.state.status = 'overriding';
    },

    setActive: function(){
        this.state.status = 'active';
    },

    setValidating: function(){
        this.state.status = 'validating';
    },

    updateTimeStamp: function (val) {
        this.state.lastUserActionTimestamp = Date.now() || val;
    },
    validate: function () {
        var self = this;

        // debounce calls for reset
        clearTimeout(this.state.timeoutId);
        this.state.timeoutId = setTimeout(function(){
            if (self.state.status != 'overriding'){
                self.setInit();
            }
        }, this.verificationTimeLimit);

        switch(this.state.status){
            case 'overriding':
                return this.state.validationOverrideVal;
            case 'init':
                this.state.prev = false;
                this.setValidating();
                setTimeout(function(){
                    self.setActive();
                }, this.config.verificationTimeLimit/2);
            case 'validating':
                return this.state.prev;
            case 'active':
                this.state.prev = Date.now() - this.state.lastUserActionTimestamp > this.config.verificationTimeLimit ? this.config.tag : false;
                return this.state.prev;
            default:
                throw new Error('bot verifier has an invalid state: ' + self.state.status);
        }
    }
};

module.exports = BotScrollVerifier;

module.process();

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

module.process();

})(__ss__.require, __ss__.module);
