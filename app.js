var express = require("express");
var app = express();
var fs = require("fs");

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

var imgCacheLink = [];
function getPageDataOrigin(pagenum, pagesize){

}

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
	if(type=="local"){
		data = getPageData(pagenum, pagesize);
	}else{
		data = getPageDataOrigin(pagenum, pagesize);
	}
	res.send({ ok: 1, data: data, err_msg: '' });
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("start at " + host + " port:" + port);
});