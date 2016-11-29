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
var domain = "http://www.mm131.com";
var urls = [
    {
        name:"性感",
        url:"/xinggan/"
    },
    {
        name:"清纯",
        url:"/qingchun/"
    },
    {
        name:"校花",
        url:"/xiaohua/"
    },
    {
        name:"车模",
        url:"/chemo/"
    },
    {
        name:"旗袍",
        url:"/qipao/"
    },
    {
        name:"明星",
        url:"/mingxing/"
    }
];

http.get(url, function (res) {
    var bufferHelper = new BufferHelper();
    res.on('data', function (chunk) {
        bufferHelper.concat(chunk);
    });
    res.on('end', function () {
        var html = iconv.decode(bufferHelper.toBuffer(),'GBK');
        var $ = cheerio.load(html);
        var list = [];
        $(".list-left dd a").each(function(){
            list.push($(this).attr("href"));
        });
        fs.appendFile("./data/1.txt",list.join(","),'utf-8',(err)=>{
            if(err){
                console.log(err);
            }
        });
    });
}).on('error', function (e) {
    console.log(e);
})