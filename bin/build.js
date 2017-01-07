const fs = require('fs'),
    path = require('path');

function build() {
    var outputPath = path.resolve(__dirname, '../dist/smart-scroll.js'),

        webLoader = fs.readFileSync(path.resolve(__dirname, './lib/web-loader.js'), 'utf8'),
        depedencies = [
            'verifiers/user.js',
            'verifiers/bot.js',
            'index.js'
        ];

    var src = depedencies
        .map(function (dependencyPath) {
            return fs.readFileSync(path.resolve(__dirname, '../', dependencyPath), 'utf8')  + "\nmodule.process();\n"
        })
        .join('\n');

    var build = webLoader.replace('/*SRC_STUB*/', src);

    fs.writeFileSync(outputPath, build);
}

build();