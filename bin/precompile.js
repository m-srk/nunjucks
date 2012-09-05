#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var util = require('util');
var compiler = require('../src/compiler');

var folder = process.argv[2];
var templates = [];

function addTemplates(dir) {
    var files = fs.readdirSync(dir);

    for(var i=0; i<files.length; i++) {
        var filepath = path.join(folder, files[i]);
        var stat = fs.statSync(filepath);

        if(stat && stat.isDirectory()) {
            addTemplates(filepath);
        }
        else if(path.extname(filepath) == '.html') {
            templates.push(filepath);
        }
    }
}

addTemplates(folder);

util.puts('(function() {');
util.puts('var templates = {};');

for(var i=0; i<templates.length; i++) {
    var src = compiler.compile(fs.readFileSync(templates[i], 'utf-8'));
    var name = templates[i].replace(path.join(folder, '/'), '');
    
    util.puts('templates["' + name + '"] = (function() {');
    util.puts(src);
    util.puts('})();');
}

util.puts('nunjucks.env = new nunjucks.Environment([]);');
util.puts('nunjucks.env.registerPrecompiled(templates);');
util.puts('})()');