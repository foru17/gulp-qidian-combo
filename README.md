
=========

基于[gulp-combo](https://github.com/PaulGuo/gulp-combo)定制的gulp-qidian-combo


```
  gulp.src('_previews/**/*.html')
     .pipe(gulpSlash())
        .pipe(combo(baseUri, {
            splitter: ',',
            async: false,
            ignorePathVar: '<%= staticConf.staticPath %>',
            assignPathTag: PROJECT_CONFIG.gtimgName, //这里需要配置combo后的相关文件路径
            serverLogicToggle: _useLogic,
            serverLogicCondition: 'envType == "pro" || envType == "oa"',
            updateTime:dateFormat((new Date()).getTime(), 'yyyymmddHHMM');//更新时间戳,这里可自己配置
        }, {
            max_age: 31536000
        }))
        .pipe(gulp.dest('_previews'));
```

* `ignorePathVar`可自定义设置模板中需要忽略的变量。
* `serverLogicToggle`根据环境是否开启服务器环境条件
* `serverLogicCondition`这里可以自定义开启combo的前置前置条件
* `updateTime`若有这个参数,则会在combo后的url增加`?v={时间戳}`标记更新时间

最终表现形式为

```
<% if (envType == "pro" || envType == "oa") { %>
<link rel="stylesheet" data-ignore="true" href="//<%= staticConf.staticDomain %>/c/=/qd/css/reset.0.25.css,/qd/css/global.0.10.css,/qd/css/font.0.27.css,/qd/css/module.0.55.css,/qd/css/channel.0.92.css,/qd/css/layout.0.26.css,/qd/css/qd_popup.0.26.css,/qd/css/footer.0.26.css,/qd/css/lbfUI/css/Autocomplete.0.26.css" />
<% } else {%>
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/reset.0.25.css" />
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/global.0.10.css" />
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/font.0.27.css" />
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/module.0.55.css" />
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/channel.0.92.css" />
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/layout.0.26.css" />
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/qd_popup.0.26.css" />
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/footer.0.26.css" />
<link rel="stylesheet"  href="<%= staticConf.staticPath %>/css/lbfUI/css/Autocomplete.0.26.css" />

 <% } %>
```


gulp-combo
=========

A gulp plugin [gulp-combo](https://github.com/PaulGuo/gulp-combo) will combo all scripts and links in a html page.

You can optionally pass a first argument along with the baseUri to override the default baseUri statements. The default baseUri looks like this:

```
baseUri = 'http://mc.meituan.net/combo/?f=';
```

You can also optionally pass a second argument along with the options to override the default options statements. The default options looks like this:

```
{
	splitter: ';',
	async: false
}
```

### HTML

    <!DOCTYPE HTML>
    <html style="font-size:312.5%">
    <head>
        <meta charset="UTF-8">
        <title>Gulp-combo</title>
        <link href="http://mc.meituan.net/touch/css/eve.0c7f2f70.css" rel="stylesheet"/>
        <link href="http://mc.meituan.net/touch/css/test.css" rel="stylesheet"/>
    </head>
    <body>
    <script type="text/javascript" src="http://mc.meituan.net/zepto/zepto-1.0.1.min.js"></script>
    <script type="text/javascript" src="http://mc.meituan.net/hotel/act/freshmen/js/mjs.js"></script>
    <script type="text/javascript">
        init();
    </script>

    </body>
    </html>

### Usage

    var gulp = require('gulp'),
        combo = require('gulp-combo');

    gulp.task('combo', function(){
      var baseUri = 'http://mc.meituan.net/combo?f=';

      gulp.src('index.html')
        .pipe(combo(baseUri, null))
        .pipe(gulp.dest('build'));
    });

### Output

    <!DOCTYPE HTML>
    <html style="font-size:312.5%">
    <head>
        <meta charset="UTF-8">
        <title>Gulp-combo</title>
        <link rel="stylesheet" href="http://mc.meituan.net/combo?f=touch/css/eve.0c7f2f70.css;touch/css/test.css" />
    </head>
    <body>
    <script type="text/javascript" src="http://mc.meituan.net/combo?f=zepto/zepto-1.0.1.min.js;hotel/act/freshmen/js/mjs.js"></script>
    <script type="text/javascript">
        init();
    </script>

    </body>
    </html>

License
----

MIT

