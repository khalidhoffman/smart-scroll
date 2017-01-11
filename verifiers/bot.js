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
