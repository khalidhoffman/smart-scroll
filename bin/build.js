const fs = require('fs'),
    path = require('path');

function build(){
    var outputPath = path.resolve(__dirname, '../smart-scroll.js'),
        sourceFiles = [],
        webLoaderSrc = fs.readFileSync(path.resolve(__dirname, '../lib/web-loader.js')),
        postSrc = 'module.process();',
        depedencies = [
            'verifiers/user.js',
            'index.js'
        ];

    depedencies.forEach(function(dependencyPath){
        sourceFiles.push(fs.readFileSync(path.resolve(__dirname, '../', dependencyPath), 'utf8'));
    });

    var build = sourceFiles.map(function(src, idx){
        switch(idx){
            case 0:
                return webLoaderSrc + '\n' + src + postSrc;
                break;
            default:
                return src + postSrc;
                break;
        }
    }).join('\n');

    fs.writeFileSync(outputPath, build);
}

build();