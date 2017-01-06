var define = define || function(deps, init){init()},
    module = module || {},
    UserScrollVerifier = require('./verifiers/user');

function ScrollListener($el){
    this.$el = $el;
    this.onScroll = this.onScroll.bind(this);
    this.verifiers = [
        new UserScrollVerifier()
    ];
}

ScrollListener.prototype = {
    init : function(){
        var validationIdx = 0;
        while(this.verifiers[validationIdx]){
            if(this.verifiers[validationIdx].init){
                // TODO determine scope for verfier.init
                this.verifiers[validationIdx].init()
            }
            validationIdx++;
        }
    },
    onScroll: function(evt){
        if (this.checkValidity(evt)) this.$el.trigger('smart-scroll', evt);
    },
    checkValidity: function(evt){
        var result= false,
            validationIdx = 0;
        while(!result && this.verifiers[validationIdx]){
            // TODO determine scope for verfier.validate
            result = this.verifiers[validationIdx++].validate.apply(this, arguments);
        }
        return result;
    }
};

define(['jquery'],function ($) {
    return $.fn.smartScroll = function(){
        var scrollListener = new ScrollListener(this);
        this.on('scroll', scrollListener.onScroll);
    };
});
module.exports = ScrollListener;
