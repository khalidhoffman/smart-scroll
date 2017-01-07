var $ = require('jquery');

function BotScrollVerifier() {
    this.config = {
        verificationTimeLimit: 200,
        flingScrollDelay: 3000,
        tag: 'bot'
    };
    this.$window = $(window);
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
            userEventList = [
                'wheel',
                'touchmove',
                'keydown',
                'keyup',
                'drag'
            ],
            userEvents = userEventList.join(' ');

        this.$window.on(userEvents, self.updateTimeStamp);

        // automatically invalidate all input if mouse is down
        this.$window.on('mousedown touchstart', function () {
            self.state.isOverriding = true;
        });
        this.$window.on('mouseup', function () {
            // lift override if mouse is lifted
            self.state.isOverriding = false;
        });
        this.$window.on('touchcancel touchend', function () {
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
