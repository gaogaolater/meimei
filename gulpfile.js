var gulp = require('gulp'), // 基础库
    jshint = require('gulp-jshint'), // js检查
    uglify = require('gulp-uglify'), // js压缩
    notify = require('gulp-notify'), // 提示信息
    rename = require('gulp-rename'), // 文件更名
    exec = require('child_process').exec,
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    plumber = require('gulp-plumber'),
    clean = require('gulp-clean'),
    //imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'); // 合并文件

var isDebug = true;

//路径加./ 导致不会监听文件的增加
var config = {
    less:{
        src: "less/*.less",
        dest:"css/",
    }
}

gulp.task('default', function() {
    gulp.run('less');
    gulp.watch(config.less.src,["less"]);
});


gulp.task('less', function() {
    var des = config.less.dest;
    var stream = gulp.src(config.less.src)
        .pipe(plumber())
        .pipe(less())
        .pipe(concat('common.css'))
    if(!isDebug){
        stream = stream.pipe(minifycss());
    }
    stream = stream.pipe(gulp.dest(des));
    stream.pipe(notify({
        message : 'less task ok'
    }));
    return stream;
});
