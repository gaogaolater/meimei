var fs = require("fs");

fs.readFile('./data/src.txt','utf8',  (err, data) => {
    if (err) throw err;
    var arr = data.split("\r\n");
    arr.forEach(v=>{
        console.log(arr);
    });
});
