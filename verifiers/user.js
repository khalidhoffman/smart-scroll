function UserScrollVerifier(){
    this.config = {
        verificationTimelimit: 200
    };
    this.$dom = $(document);
    this.state = {
        lastActionTimestamp : 0
    }
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
                'pointermove',
                'drag'
            ],
            events = userEvents.join(' ');
        this.$dom.on(events, function(){
            self.state.lastActionTimestamp = Date.now();
        })
    },
    validate: function(){
        return (this.state.lastActionTimestamp - Date.now() < this.config.verificationTimelimit)
    }
};

module.exports = UserScrollVerifier;
