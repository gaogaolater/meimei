var qiniu = require("qiniu");

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = 'tBkCKiaAkv-8EJhCEPXN1KjVeyaKbhptqSdcWpu0';
qiniu.conf.SECRET_KEY = 'bTGnMl0EhKaiLptWdsfVSWuneqZU0CDSzA7nh2J9';

//要上传的空间
bucket = 'gaogao-bucket';

//上传到七牛后保存的文件名
key = 'mm.jpg';

//构建上传策略函数
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  return putPolicy.token();
}

//生成上传 Token
token = uptoken(bucket, key);

//要上传文件的本地路径
filePath = './data/性感/绝色美女徐茜儿隐隐约约的美/1.jpg'

//构造上传函数
function uploadFile(uptoken, key, localFile) {
  var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        console.log(ret.hash, ret.key, ret.persistentId);       
      } else {
        // 上传失败， 处理返回代码
        console.log(err);
      }
  });
}

//调用uploadFile上传
uploadFile(token, key, filePath);