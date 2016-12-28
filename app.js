var express = require("express");
var app = express();
var fs = require("fs");
var http = require('http'); 
var request = require("request");
var cheerio = require("cheerio");

app.use("/data", express.static('data'));
app.use("/image", express.static('image'));
app.use("/js", express.static('js'));
app.use("/css", express.static('css'));
app.use("/swiper", express.static('swiper'));
app.use(express.static('html'));

/**
 * 缓存数据结构
 {
	num:0,
	name:'',
	tag:''
 }
 */
var imgCache = [];

function getPageData(pagenum, pagesize) {
	//做缓存
	if (imgCache.length == 0) {
		var dir = 'data/';
		var tags = fs.readdirSync(dir);
		//循环tag
		for (var i = 0; i < tags.length; i++) {
			var tag = tags[i];
			var tagItemPath = dir + tag;
			if (!fs.statSync(tagItemPath).isDirectory()) {
				continue;
			}
			var names = fs.readdirSync(tagItemPath);
			for (var j = 0; j < names.length; j++) {
				var name = names[j];
				var imgPath = tagItemPath + "/" + name;
				if (!fs.statSync(imgPath).isDirectory()) {
					continue;
				}
				var nums = fs.readdirSync(imgPath);
				if (nums.length > 0) {
					imgCache.push({
						num: nums.length,
						name: name,
						tag: tag
					});
				}
			}
		}
	} else {
		//取缓存
		var start = (pagenum - 1) * pagesize;
		var end = pagenum * pagesize - 1;
		var total = imgCache.length;
		if (start > total) return null;
		if (end > total - 1) end = total - 1;
		return imgCache.slice(start, end);
	}
	return null;
}

/**
 * 缓存数据结构
 {
	num:0,
	name:'',
	tag:'',
	index:''
 }
 */
var imgCacheLink = [];
function getPageDataOrigin(pagenum, pagesize) {
	if (imgCacheLink.length > 0) {
		//取缓存
		var start = (pagenum - 1) * pagesize;
		var end = pagenum * pagesize - 1;
		var total = imgCacheLink.length;
		if (start > total) return null;
		if (end > total - 1) end = total - 1;
		return imgCacheLink.slice(start, end);
	} else {
		var data = fs.readFileSync('./data/src.txt', 'utf8');
		var arr = data.split("\r\n");
		arr.forEach(v => {
			var line = v.split(",");
			if (line.length == 4) {
				imgCacheLink.push({
					num: line[3],
					name: line[1],
					tag: line[0],
					index: line[2]
				});
			}
		});
	}
}
//初始化缓存
getPageData();
getPageDataOrigin();

app.get("/proxy",function(req, res, next){
	var url = decodeURIComponent(req.query.url);
	request(url).pipe(res);
});

app.get("/get_video_url",function(req, res, next){
	var url = decodeURIComponent(req.query.url);
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var url = body.match(/http(.*)\.mp4"/);
			fs.writeFileSync("d:/1.html",body,"utf-8");
			console.log(url);
			res.send({url:""});
		}
	});
});

app.get("/getlist", function (req, res, next) {
	var pagesize = req.query.pagesize;
	var pagenum = req.query.pagenum;
	var type = req.query.type;
	if (isNaN(pagesize) || isNaN(pagenum)) {
		res.send({ ok: 0, data: null, err_msg: 'no pagesize or pagenum' });
		return;
	}
	if (pagesize > 100 || pagesize < 1) {
		res.send({ ok: 0, data: null, err_msg: 'pagesize err' });
		return;
	}
	if (pagenum < 1) {
		res.send({ ok: 0, data: null, err_msg: 'pagenum err' });
		return;
	}
	var data = null;
	if (type == "local") {
		data = getPageData(pagenum, pagesize);
	} else {
		data = getPageDataOrigin(pagenum, pagesize);
	}
	res.send({ ok: 1, data: data, err_msg: '' });
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("start at " + host + " port:" + port);
});