if (!require){
    require = function(dep){
        switch(dep){
            case 'jquery':
                return window.jQuery || window.$ || null;
        }
    },
    module = {
        stub: true,
        cache: {},
        size : 0,
        process: function(){
            module.cache[module.size++] = module.exports;
        }
    };
}
