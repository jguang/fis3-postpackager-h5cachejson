/**
 * Created by baidu on 16/8/9.
 */

var cacheObj = {
      "OriginalData": {
        "H5CacheList": []
      }
};
var h5Cache = fis.project.getProjectPath();
var h5CacheJson = h5Cache + '/view/ksyun_web_cache.json';
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
    var catchMaps = [];
    var files = ret.pkg;
    Object.keys(files).forEach(function(subpath) {
        //console.log(subpath);
        var file = files[subpath];
        //console.log(file.isHtmlLike);
        //console.log(file.useMap);
        compile(file);
    });
    
    cacheObj.Type = settings.Type || 4;
    
    cacheObj.Version = parseInt(new Date()*1 / 1000) ; //settings.Version;
    
    cacheObj.SdkVersion = settings.SdkVersion;

    cacheObj.OriginalData.H5CacheList = catchMaps;

    writeFile(h5CacheJson, JSON.stringify(cacheObj, null, 2));

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

        var cacheActions = settings.cacheActions;

        if(rUrl[2] && rUrl[4] && cacheActions.indexOf(rUrl[4]) > -1) {
                var cacheList = {
                    md5: '',
                    url: '',
                    js_list: [],
                    css_list: []
                };
                var js_list;
                var css_list;
                cacheList["md5"] = file.getHash(),
                cacheList["url"] = '\/' + (rUrl[2].indexOf('_') > -1 ? rUrl[2].replace('\_', '\/') : rUrl[2] + '\/' +rUrl[4])
        
                // 修改script文件的引用
                var content = file.getContent();

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

                catchMaps.push(cacheList);     
        }
    };

    function writeFile(path, data){
        fis.util.write(path, data, 'utf-8', false);
    }
}
module.exports = cachePackager;