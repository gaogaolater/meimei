var express = require("express");
var app = express();
var fs = require("fs");

app.use("/data",express.static('data'));
app.use("/image",express.static('image'));
app.use("/js",express.static('js'));
app.use("/css",express.static('css'));
app.use("/swiper",express.static('swiper'));
app.use(express.static('html'));

app.get("/getlist",function(req,res,next){
	var dir = 'data/旗袍/';
	var files = fs.readdirSync(dir);
	var arr = [];
	for(var i=0;i<files.length;i++){
		var imgArr = {des:files[i],arr:[],num:0};
		var imgs = fs.readdirSync(dir+files[i]+"/");
		imgArr.arr = imgs;
		imgArr.num = imgs.length;
		if(imgs.length>=1){
			imgArr.src = dir+files[i]+"/"+imgs[1];
		}
		arr.push(imgArr);
	}
	res.send({ok:0,data:arr,err_msg:''});
});

app.get("/getdetail",function(req,res,next){
    res.send({ok:1,data:1});
})

var server = app.listen(3000,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("start at "+host+" port:"+port);
});