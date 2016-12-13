var http = require("http");
var fs = require("fs");
var cheerio = require("cheerio");
var request = require("request");
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
/*
1、分类连接
2、根据分页抓取每个页面美女的链接
3、单个美女页面抓取每个美女图片链接并下载  
4、存储每个美女的分类、名称、图片
*/
var storePath = "./data/";
var domain = "http://www.mm131.com";
var urls = [
    {
        name: "性感",
        url: "/xinggan/"
    },
    {
        name: "清纯",
        url: "/qingchun/"
    },
    {
        name: "校花",
        url: "/xiaohua/"
    },
    {
        name: "车模",
        url: "/chemo/"
    },
    {
        name: "旗袍",
        url: "/qipao/"
    },
    {
        name: "明星",
        url: "/mingxing/"
    }
];

for (var i = 0; i < urls.length; i++) {
    //注意变量作用域
    var listLink = domain + urls[i].url;
    var urlType = urls[i].name;
    //获取第一页数据
    getList(listLink, urlType, 1);
}

var listTask = [];
function getList(listLink, urlType, index) {
    (function (listLink, urlType, index) {
        http.get(listLink, function (res) {
            var bufferHelper = new BufferHelper();
            res.on('data', function (chunk) {
                bufferHelper.concat(chunk);
            });
            res.on('end', function () {
                var html = iconv.decode(bufferHelper.toBuffer(), 'GBK');
                var $ = cheerio.load(html);
                if (index != 1) {
                    $(".list-left").find("a[target='_blank']").each(function () {
                        var picName = $(this).find("img").attr("alt");
                        var href = $(this).attr("href");
                        getDetailPage(href, picName, urlType);
                        counter++;
                    });
                }
                if (index == 1) {
                    var firstLink = $(".page-en").first().attr("href");
                    var lastLink = $(".page-en").last().attr("href");
                    //结果 ["list_6_21.html", "list_6", "21"]
                    var matchResult = firstLink.match(/(.+)_(\d+).html/);
                    var linktpl = matchResult[1];
                    var minNum = parseInt(matchResult[2]);
                    var maxNum = parseInt(lastLink.match(/_(\d+).html/)[1]);
                    for (var i = minNum; i <= maxNum; i++) {
                        //getList(linktpl + "_" + i + ".html", urlType, 2);
                        var json = {
                            link: listLink + linktpl + "_" + i + ".html",
                            urlType: urlType
                        };
                        listTask.push(json);
                    }
                    console.log("长度：" + listTask.length);
                }
            });
        }).on('error', function (e) {
            console.log(e);
        })
    })(listLink, urlType, index);
}

//美女详情页面
//http://www.mm131.com/xinggan/2748.html
function getDetailPage(href, name, type) {
    var typePath = storePath + type;
    var picPath = storePath + type + "/" + name + "/";
    if (!fs.existsSync(typePath)) {
        fs.mkdirSync(typePath);
    }
    if (!fs.existsSync(picPath)) {
        fs.mkdirSync(picPath);
    }
    var index = 0;
    http.get(href, function (res) {
        var bufferHelper = new BufferHelper();
        res.on('data', function (chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function () {
            var html = iconv.decode(bufferHelper.toBuffer(), 'GBK');
            var $ = cheerio.load(html);
            //最大图片数
            var maxCount = $(".content-page span").eq(0).text().match(/\d+/)[0];
            //图片链接
            var src = $(".content-pic img").attr("src");
            var picIndex = src.match(/pic\/(\d+)\//)[1];
            var data = type + "," + name + "," + picIndex + "," + maxCount + "\r\n";
            fs.appendFileSync('./data/src.txt', data, 'utf8');
            counter--;
        });
    }).on('error', function (e) {
        console.log(e);
    })
}

var counter = 0;

setInterval(function () {
    if (counter <= 0) {
        if (listTask.length > 0) {
            var listJson = listTask.shift();
            getList(listJson.link, listJson.urlType);
        }else{
            console.log("无数据");
        }
    }
}, 1000);

setInterval(function(){
    console.log(listTask.length + "-" + counter);
},500);