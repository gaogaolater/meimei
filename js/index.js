$(function () {
    $("nav a").click(function () {
        $("nav a").removeClass("active");
        $(this).addClass("active");
    });

    var data = [
        {
            src: '1.jpg',
            des: '美女',
            num: 6
        },
        {
            src: '2.jpg',
            des: '美女',
            num: 5
        },
        {
            src: '3.jpg',
            des: '美女',
            num: 1
        },
        {
            src: '4.jpg',
            des: '美女',
            num: 4
        },
        {
            src: '5.jpg',
            des: '美女',
            num: 6
        },
    ];
    addImgList("imglist", data);
});

var leftImgTop = 0;
var rightImgTop = 0;
var header = "data/性感/何彦霓海边极品身材比基尼秀/"
function addImgList(containerId, imgList) {
    var container = $("#" + containerId);
    var clientWidth = container.width();
    var itemWidth = clientWidth / 2 - 2;
    for (var i = 0; i < imgList.length; i++) {
        var item = imgList[i];
        var img = new Image();
        img.src = header + item.src;
        img.onload = function () {
            var li = document.createElement("li");
            li.appendChild(this);
            $(li).css({position:'absolute'});
            var height = parseInt((itemWidth / this.width) * this.height);
            if (leftImgTop <= rightImgTop) {
                $(li).css({ top: leftImgTop, left: 0, width: itemWidth });
                leftImgTop += height+5;
            } else {
                $(li).css({ top: rightImgTop, right: 0, width: itemWidth });
                rightImgTop += height+5;
            }
            container.append(li);
        }
    }
}
