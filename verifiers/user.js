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
