/**
 * Author: Luolei
 *
 * 自动将HTML中的文件转成combo路径

    <link rel="stylesheet" href="<%= staticConf.staticPath %>/css/reset.0.1.css">
    <link rel="stylesheet" href="<%= staticConf.staticPath %>/css/global.0.1.css">
    <link rel="stylesheet" href="<%= staticConf.staticPath %>/css/font.0.1.css">

 * 执行 gulp combo 后转换成
 *

 <link rel="stylesheet" data-ignore="true" href="//<%= staticConf.staticDomain %>/c/=/qd/css/reset.0.1.css,/qd/css/global.0.1.css,/qd/css/font.0.1.css?v=201605101449" />

 *
 * 若需要忽略某js和css,只需要在html标签中增加 data-ignore="true" 即可
 *
 */

/* jshint node: true */
'use strict';

var through = require('through2'),
    cheerio = require("cheerio");


module.exports = function(baseUri, options) {
    baseUri = baseUri || 'http://qidian.gtimg.com/c/=';
    options = options || {};

    console.log(options);

    // console.log(chalk.green('===Qidian.com=== '));
    return through.obj(function(file, enc, cb) {
        var chunk = String(file.contents);
        var src = {
            scripts: [],
            links: []
        };

        var genComboScriptUriTag = function() {
            // 定制
            var uri,
                nocomboUri='',
                _PathJs = [],
                _rawPathJs = [];
            if (!!options.ignorePathVar) {
                // 去掉模板中的服务区环境路径变量
                var _links = src.scripts,
                    _ignorePathVar = options.ignorePathVar || '',
                    _assignPathTag = '/' + options.assignPathTag || '';

                for (var i = 0; i < _links.length; i++) {
                    _rawPathJs.push(_assignPathTag + _links[i].replace(_ignorePathVar, ''));
                    _PathJs.push(_links);
                    nocomboUri += '<script type="text/javascript" src="//' + _links[i] + '"></script>' + '\n';
                }
                console.log(_PathJs);
            }
            uri = baseUri + _rawPathJs.join(options.splitter || ';') + '?v=' + options.updateTime;
            // 定制
            var scriptTag = '<script type="text/javascript" src="//' + uri + '"></script>';
            var async = options.async || false;

            if (chunk.match('<!--combo async:false-->')) {
                async = false;
            }

            if (chunk.match('<!--combo async:true-->')) {
                async = true;
            }

            if (async === true) {
                scriptTag = '<script type="text/javascript" data-ignore="true" src="//' + uri + '" async="async"></script>';
            }

            if (options.serverLogicToggle == true) {

                var scriptTag = '';
                scriptTag += '<% if (' + options.serverLogicCondition + ') { %>';
                scriptTag += '\n';
                scriptTag += '<script type="text/javascript" src="//' + uri + '"></script>';
                scriptTag += '\n';
                scriptTag += '<% } else {%>'
                scriptTag += '\n';
                scriptTag += nocomboUri;
                scriptTag += '\n';
                scriptTag += ' <% } %>';
                // scriptTag = nocomboUri;
            }


            return scriptTag;
        };

        var genComboLinkUriTag = function() {
            var uri,
                nocomboUri = '',
                _PathCss = [],
                _rawPathCss = [];
            if (!!options.ignorePathVar) {
                // 去掉模板中的服务区环境路径变量

                var _links = src.links,
                    _ignorePathVar = options.ignorePathVar || '',
                    _assignPathTag = '/' + options.assignPathTag || '';

                for (var i = 0; i < _links.length; i++) {
                    _PathCss.push(src.links)
                    _rawPathCss.push(_assignPathTag + _links[i].replace(_ignorePathVar, ''));

                    nocomboUri += '<link rel="stylesheet"  href="' + _links[i] + '" />' + '\n';
                }

                // console.log(_PathCss);
            }
            uri = baseUri + _rawPathCss.join(options.splitter || ';') + '?v=' + options.updateTime;
            console.log(uri);
            if (options.serverLogicToggle == true) {
                var linkTag = '';
                linkTag += '<% if (' + options.serverLogicCondition + ') { %>';
                linkTag += '\n';
                linkTag += '<link rel="stylesheet" data-ignore="true" href="//' + uri + '" />';
                linkTag += '\n';
                linkTag += '<% } else {%>'
                linkTag += '\n';
                linkTag += nocomboUri;
                linkTag += '\n';
                linkTag += ' <% } %>';
            } else {
                var linkTag = '<link rel="stylesheet" data-ignore="true" href="//' + uri + '" />';
            }

            // linkTag

            var comboToggle;




            // console.log(linkTag);
            return linkTag;
        };

        var group = (chunk.replace(/[\r\n]/g, '').match(/<\!\-\-\[if[^\]]+\]>.*?<\!\[endif\]\-\->/igm) || []).join('');

        var scriptProcessor = function($, $1) {
            // 增加忽略属性避免条件注释或者模板条件判断中的资源被合并
            if ($.match('data-ignore="true"')) {
                return $;
            }

            // 忽略CSS条件注释中的COMBO
            if (group && group.indexOf($) !== -1) {
                return $;
            }

            if ($.match(/http:\/\//igm)) {
                if ($1.match(/^http:\/\/mc.meituan.net\//igm)) {
                    src.scripts.push($1.replace('http://mc.meituan.net/', ''));
                } else {
                    return $;
                }
            } else {
                src.scripts.push($1.replace(/(.+\/)?[^\/]+\/\.\.\//igm, '$1'));
            }

            if (src.scripts.length === 1) {
                return '<%%%SCRIPT_HOLDER%%%>';
            }

            return '';
        };

        var linkProcessor = function($, $1) {
            // 增加忽略属性避免条件注释或者模板条件判断中的资源被合并
            if ($.match('data-ignore="true"')) {
                return $;
            }

            if ($.match(/http:\/\//igm)) {
                if ($1.match(/^http:\/\/mc.meituan.net\//igm)) {
                    src.links.push($1.replace('http://mc.meituan.net/', ''));
                } else {
                    return $;
                }
            } else {
                src.links.push($1.replace(/(.+\/)?[^\/]+\/\.\.\//igm, '$1'));
            }

            if (src.links.length === 1) {
                return '<%%%STYLES_HOLDER%%%>';
            }

            return '';
        };
        // console.log(linkProcessor);
        // console.log(scriptProcessor);
        chunk = chunk.replace(/<script[^>]+?src="([^"]+)"[^>]*><\/script>/igm, scriptProcessor);
        chunk = chunk.replace(/<link[^>]+?href="([^"]+?)"[^>]+?rel="stylesheet"[^>]*>/igm, linkProcessor);
        chunk = chunk.replace(/<link[^>]+?rel="stylesheet"[^>]+?href="([^"]+?)"[^>]*>/igm, linkProcessor);

        chunk = chunk.replace('<%%%SCRIPT_HOLDER%%%>', genComboScriptUriTag());
        chunk = chunk.replace('<%%%STYLES_HOLDER%%%>', genComboLinkUriTag());
        file.contents = new Buffer(chunk);
        cb(null, file);
    });
};
