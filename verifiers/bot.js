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
        isOverriding: false,
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
            self.setActive();
        });
        this.$window.on('touchcancel touchend', function () {
            // use timeout to allow for slung page to settle
            setTimeout(function () {
                self.setActive();
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
        switch(this.state.status){
            case 'override':
                return this.state.validationOverrideVal;
            case 'init':
                this.setValidating();
                this.state.prev = false;
                setTimeout(function(){
                    self.setActive();
                }, this.config.verificationTimeLimit/2);  // just using half as a relatively safe arbitrary delay
            case 'active':
                this.state.prev = Date.now() - this.state.lastUserActionTimestamp > this.config.verificationTimeLimit ? this.config.tag : false;
            case 'validating':
                clearTimeout(this.state.timeoutId);
                this.state.timeoutId = setTimeout(function(){
                    self.setInit();
                }, this.verificationTimeLimit);
                return this.state.prev;
            default:
                throw new Error('bot verifier has an invalid state');
        }
    }
};

module.exports = BotScrollVerifier;
