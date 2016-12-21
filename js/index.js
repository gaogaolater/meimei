$(function () {

    window.onhashchange = function () {
        var hash = location.hash;
        if (hash == "") {
            //back
            $("#imgdetail").hide();
            $("#waterfall").show();
            document.body.scrollTop = scrollTop;
            mySwiper.destroy();
        } else if (hash == "detail") {

        }
    }

    $("nav a").click(function () {
        $("nav a").removeClass("active");
        $(this).addClass("active");
    });

    $("#origin_url").click(function(){
        window.open($(".swiper-slide-active img").attr("src"));
    });

    scrollTop = 0;
    $("#imglist").on("click", "img", function () {
        scrollTop = document.body.scrollTop;
        $("#waterfall").hide();
        $("#imgdetail").show();
        var maxNum = parseInt($(this).next().text());
        var src = $(this).attr("src");
        var name = $(this).attr("alt");
        $("#pic_name").text(name);
        log(src);
        var wraper = $(".swiper-wrapper").html("");
        for (var i = 1; i < maxNum; i++) {
            wraper.append("<div class='swiper-slide'><img class='swiper-lazy' data-src='" + (src.replace("1.jpg", i + ".jpg")) + "'/></div>");
        }
        mySwiper = new Swiper('.swiper-container', {
            loop: true,
            spaceBetween: 10,
            pagination: '.swiper-pagination',
            paginationType: 'fraction',
            preloadImages: false,
            lazyLoading: true,
            paginationFractionRender: function (swiper, currentClassName, totalClassName) {
                return '<span class="' + currentClassName + '"></span>' +
                    '/' +
                    '<span class="' + totalClassName + '"></span>';
            }
        });
        location.href = "#detail";
    });

    $("#back").click(function () {
        console.log("back");
        history.go(-1);
    });

    loadImg();
    window.onscroll = function () {
        if (document.body.scrollTop + document.documentElement.clientHeight+100 >= document.body.scrollHeight) {
            loadImg();
        }
    }
});
var locker = false;
var pagesize = 10;
var pagenum = 1;
function loadImg() {
    $(".loading").show();
    if(locker == false){
        locker = true;
        $.get("/getlist?type=" + type + "&pagenum=" + pagenum + "&pagesize=" + pagesize, function (obj) {
            console.log(obj);
            pagenum++;
            addImgList("imglist", obj.data);
            locker = false;
        });
    }
}

var leftImgTop = 0;
var rightImgTop = 0;
var type = "origin";
function addImgList(containerId, imgList) {
    var container = $("#" + containerId);
    var clientWidth = container.width();
    var itemWidth = parseInt(clientWidth / 2 - 2);
    for (var i = 0; i < imgList.length; i++) {
        (function (i) {
            //num name tag
            var item = imgList[i];
            var img = new Image();
            if (type == "local") {
                img.src = "/data/" + item.tag + "/" + item.name + "/1.jpg";
            } else {
                img.src = "http://image1.xiaohaibaomu.com/"+item.index+"/1.jpg";
            }
            img.alt = item.name;
            img.onload = function () {
                $(".loading").hide();
                var $li = $(document.createElement("li"));
                $li.append(this);
                //$li.append("<img alt='" + item.name.substring(0, 4) + "' src=''/>");
                var $span = $(document.createElement("span"));
                $span.text(item.num);
                $li.append($span);
                var height = parseInt((itemWidth / this.width) * this.height);
                if (leftImgTop <= rightImgTop) {
                    $li.css({ top: leftImgTop, left: 0, width: itemWidth, height: height });
                    leftImgTop += height + 5;
                } else {
                    $li.css({ top: rightImgTop, right: 0, width: itemWidth, height: height });
                    rightImgTop += height + 5;
                }
                container.append($li);
            }
        })(i);
    }
}

function log(msg) {
    _hmt.push(["_trackEvent", msg, msg]);
}