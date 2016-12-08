$(function () {
    $("nav a").click(function () {
        $("nav a").removeClass("active");
        $(this).addClass("active");
    });

    $("#imglist").on("click", "img", function () {
        $("#waterfall").hide();
        $("#imgdetail").show();
        var maxNum = parseInt($(this).next().text());
        var src = $(this).attr("src");
        var wraper = $(".swiper-wrapper").html("");
        for (var i = 1; i < maxNum; i++) {
            wraper.append("<div class='swiper-slide'><img src='" + (src.replace("1.", i + ".")) + "'/></div>");
        }
        mySwiper = new Swiper('.swiper-container', {
            loop: true,
            spaceBetween: 10,
            pagination: '.swiper-pagination',
            paginationType: 'fraction',
            paginationFractionRender: function (swiper, currentClassName, totalClassName) {
                return '<span class="' + currentClassName + '"></span>' +
                    '/' +
                    '<span class="' + totalClassName + '"></span>';
            }
        });
    });

    $("#back").click(function () {
        $("#imgdetail").hide();
        $("#waterfall").show();
        mySwiper.destroy();
    });
    loadImg();
    if (document.body.scrollTop + document.documentElement.clientHeight >= document.body.scrollHeight) {
        loadImg();
    }
});

var pagesize = 20;
var pagenum = 1;
function loadImg() {
    $.get("/getlist?pagenum=" + pagenum + "&pagesize=" + pagesize, function (obj) {
        pagenum++;
        addImgList("imglist", obj.data);
    });
}

var leftImgTop = 0;
var rightImgTop = 0;
var header = "data/性感/何彦霓海边极品身材比基尼秀/"
function addImgList(containerId, imgList) {
    var container = $("#" + containerId);
    var clientWidth = container.width();
    var itemWidth = parseInt(clientWidth / 2 - 2);
    for (var i = 0; i < imgList.length; i++) {
        (function (i) {
            //num name tag
            var item = imgList[i];
            var img = new Image();
            img.src = "/data/" + item.tag + "/" + item.name + "/1.jpg";
            img.alt = item.name;
            img.onload = function () {
                var $li = $(document.createElement("li"));
                //$li.append(this);
                $li.append("<img alt='" + item.name.substring(0, 4) + "' src=''/>");
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
