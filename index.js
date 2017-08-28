/**
 * Created by jg on 17/06/07.
 */

var cacheObj = {
      "OriginalData": {
        "H5CacheList": []
      }
};
//var h5Cache = fis.project.getProjectPath();
//var h5CacheJson = h5Cache + '/view/ksyun_web_cache.json';
var rStyleScript = /(?:\s*(<link([^>]*?)(stylesheet){1}([^>]*?)(?:\/)?>))/ig;
var linkScript = /(?:(\s*<script([^>]*)>([\s\S]*?)<\/script>))/ig;
var scriptSrc = /(?:\ssrc\s*=\s*)('([^<>']+)'|"([^<>\"]+)")/i;
var styleUrl = /(?:\shref\s*=\s*)('([^'<>]+)'|"([^"<>]+)"|[^\s\/>]+)/i;


function cachePackager(ret, pack, settings, opt) {
    // 读取ret下的源文件
    // var files = ret.src;
    // console.log(files['/pages/newbattle/index.html']);
    // 读取pack映射关系树
    // console.log(settings);
    // console.log(opt);
    // 读取打包后的文件
    // console.log(ret.pkg['/pages/newbattle/index.html']);
    // console.log(ret.pkg['/pages/newbattle/index.html'].getContent());
    var catchMaps = {};
    var fileCache = ret.src[settings['jsonFile']];
    var themeCache = ret.src[settings['themeFile']];

    themeConfig = JSON.parse(themeCache.getContent()) 

    console.log(themeConfig);

    // 编译总文件
    var files = ret.pkg;
    Object.keys(files).forEach(function(subpath) {
        //console.log(subpath);
        var file = files[subpath];
        //console.log(file.isHtmlLike);
        //console.log(file.useMap);
        compile(file);
    });

    Object.keys(themeConfig).forEach(function(busid) {
        var newJsonFileName = fileCache.realpathNoExt + "_" + busid + '.json';
        // console.log(newJsonFileName);
        var newJsonFile = fis.file.wrap(newJsonFileName);


        var newCacheMaps = [];
        var themeId =  themeConfig[busid]['theme'];
        Object.keys(catchMaps).forEach(function(url) {
            var urlMaps = catchMaps[url];
            var urlSel = url.split('\/');
            var defaultUrl = [urlSel[0], 'default', urlSel[1]].join("\/");
            var themeUrl = [urlSel[0], 'theme_' + themeId , urlSel[1]].join("\/");
            if(urlMaps[themeUrl]) {
               newCacheMaps.push(urlMaps[themeUrl]);     
            }
            else {
               newCacheMaps.push(urlMaps[defaultUrl]);
            }
        });

        newJsonFile.setContent(JSON.stringify(newCacheMaps, null, 2));

        
        //fis.compile.process(newJsonFile);
        
        // 添加对本theme的依赖 否侧watch下不更新此theme
        //newJsonFile.cache.addDeps(themeCache.realpath);

        // newJsonFile.links.forEach(function(derived) {
        //     fileCache.addLink(derived);
        // });

        // fileCache.derived.push(newJsonFile);

        // fis.release();

        ret.pkg[newJsonFile.subpath] = newJsonFile;

    });

    
    cacheObj.Type = settings.Type || 4;
    
    cacheObj.Version = parseInt(new Date()*1 / 1000) ; //settings.Version;
    
    cacheObj.SdkVersion = settings.SdkVersion;

    cacheObj.OriginalData.H5CacheList = catchMaps;

    

    //console.log(fileCache.getContent());

    fileCache.setContent(JSON.stringify(cacheObj, null, 2));
    
    //console.log(fileCache.getContent());


    // writeFile(h5CacheJson, JSON.stringify(cacheObj, null, 2));

    function compile(file) {
        // 暂时处理html文件
        if (file.release === false || !file.isHtmlLike) {
            return;
        }

        // if(file.filename === "follow") {
        //     console.log(file);
        //     console.log(file.getHash());
        // };
        var rUrl = file.subpathNoExt.slice(1).split('/');

        // 老模式模板
        if (rUrl.length === 3 && rUrl[1] === 'home') {
            var oldRUrl = rUrl[2].split('_');
            rUrl[2] = oldRUrl[0];
            rUrl[3] = 'default';
            rUrl[4] = oldRUrl[1];
        }

        var cacheActions = settings.cacheActions;

        if(rUrl[2] && rUrl[4] && cacheActions.indexOf(rUrl[4]) > -1) {
                var cacheList = {
                    md5: '',
                    url: '',
                    js_list: [],
                    css_list: []
                };
                var themeUrl;
                var queryUrl;
                // 修改script文件的引用
                var content = file.getContent();
                
                themeUrl = [rUrl[2], rUrl[3], rUrl[4]].join('\/');
                queryUrl = [rUrl[2],rUrl[4]].join('\/');

                cacheList["md5"] =  md5(content, 32); // file.getHash() 可能出错;
                cacheList["url"] = "\/" + queryUrl;

                var linkArray = content.match(rStyleScript);

                var scriptArray = content.match(linkScript);

                //css过滤
                if(linkArray){
                    linkArray.forEach(function(v){
                        var href = v.match(styleUrl);
                        if(href){
                            href = RegExp.$1.replace(/\'|\"/ig,'').trim();
                            cacheList["css_list"].push(href);
                        }
                    })
                }

                //js过滤
                if(scriptArray){
                    scriptArray.forEach(function(v){
                        var src = v.match(scriptSrc);
                        if(src){
                            src = RegExp.$1.replace(/\'|\"/ig,'').trim();
                            cacheList["js_list"].push(src);
                        }
                    })
                }
                catchMaps[queryUrl] = catchMaps[queryUrl] || {};

                catchMaps[queryUrl][themeUrl] = cacheList;
        }
    };

    function writeFile(path, data){
        fis.util.write(path, data, 'utf-8', false);
    }

    function md5(data, len){
        return fis.util.md5(data, len);
    }
}
module.exports = cachePackager;