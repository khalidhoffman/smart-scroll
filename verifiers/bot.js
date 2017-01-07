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
