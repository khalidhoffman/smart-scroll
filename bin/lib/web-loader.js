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
    /*SRC_STUB*/
})(__ss__.require, __ss__.module);
