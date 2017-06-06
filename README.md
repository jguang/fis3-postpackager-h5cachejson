# h5缓存自动生成配置文件

````

fis.match('::package', {
    postpackager: [fis.plugin('loader', {
            resourceType: 'mod',
            allInOne: true,
            // obtainScript: false
            useInlineMap: true // 资源映射表内嵌,
        })
        , fis.plugin('h5cachejson', {
            "Type": 4,
            "Version": 7,
            "SdkVersion": "v2.2.8",
            "cacheActions": ['follow', 'tofollow', 'charms', 'gives'],
        })
    ]
});



````