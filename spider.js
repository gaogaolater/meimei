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
    getList(listLink, urlType, 1);
}

var listTask = [];
function getList(listLink, urlType, index) {
    (function(listLink, urlType, index) {
        http.get(listLink, function(res) {
            var bufferHelper = new BufferHelper();
            res.on('data', function(chunk) {
                bufferHelper.concat(chunk);
            });
            res.on('end', function() {
                var html = iconv.decode(bufferHelper.toBuffer(), 'GBK');
                var $ = cheerio.load(html);
                if (index != 1) {
                    $(".list-left").find("a[target='_blank']").each(function() {
                        var picName = $(this).find("img").attr("alt");
                        var href = $(this).attr("href");
                        getDetailPage(href, picName, urlType);
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
                        //fs.appendFileSync('./data/src.txt',JSON.stringify(json)+"\r\n", 'utf8');
                    }
                }
            });
        }).on('error', function(e) {
            console.log(e);
        })
    })(listLink, urlType, index);
}

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
    http.get(href, function(res) {
        var bufferHelper = new BufferHelper();
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function() {
            var html = iconv.decode(bufferHelper.toBuffer(), 'GBK');
            var $ = cheerio.load(html);
            var maxIndex = $(".content-page span").eq(0).text().match(/\d+/)[0];
            var src = $(".content-pic img").attr("src");
            var header = src.substring(0, src.lastIndexOf("/"));
            var suffix = src.substring(src.lastIndexOf("."));
            for (var i = 0; i <= maxIndex; i++) {
                var imgUrl = header + "/" + i + suffix;
                var savePath = picPath + i + suffix;
                saveImages(imgUrl, savePath);
            }
        });
    }).on('error', function(e) {
        console.log(e);
    })
}

var taskList = [];
function saveImages(imgUrl, savePath) {
    taskList.push({ imgUrl: imgUrl, savePath: savePath });
}


function saveImg(imgUrl, savePath) {
    if (!fs.existsSync(savePath)) {
        http.get(imgUrl, function(res) {
            var imgData = "";
            res.setEncoding("binary");
            res.on("data", function(chunk) {
                imgData += chunk;
            });
            res.on("end", function() {
                fs.writeFile(savePath, imgData, "binary", function(err) {
                    if (err) {
                        console.log("down fail");
                    }
                });
                console.log("save:" + savePath + " size:" + taskList.length);
                currentTaskCount--;
            });
        }).on('error', function(e) {
            console.log(e);
            currentTaskCount--;
        });
    } else {
        currentTaskCount--;
    }
}

var maxTaskCount = 100;
var currentTaskCount = 0;
var maxTryTimes = 30;
var timer = setInterval(function() {
    if (currentTaskCount < maxTaskCount) {
        if (taskList.length > 0) {
            currentTaskCount++;
            var task = taskList.shift();
            saveImg(task.imgUrl, task.savePath);
        }
    }
    if (taskList.length == 0) {
        if (listTask.length > 0) {
            var listJson = listTask.shift();
            getList(listJson.link, listJson.urlType);
        } else {
            maxTryTimes--;
        }
    } else {
        maxTryTimes = 30;
    }
    if (maxTryTimes == 0) {
        clearInterval(timer);
        console.log("done");
    }
}, 300);

