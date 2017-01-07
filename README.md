# smart-scroll
Detects user vs programmatic scrolling

## How to install
1. run `npm i smart-scroll`
2. add `require('smart-scroll')` to your src

or

1. import dist file via html `<script src="${'path to project'}/dist/smart-scroll.js"/>`
    - requires jQuery be loaded prior


## How to use
```
$(window).botScroll().on('smart-scroll:bot', function(){
    // bot scroll events only
});

$(window).userScroll().on('smart-scroll:user', function(){
    // user scroll events only
});
```


