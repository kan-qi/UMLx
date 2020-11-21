

function TrackUserInfo(req) {

    const requestIp = req.ip;
    const route = req.route;
    if (req.userInfo == undefined) {
        console.log("user undefined");
        return;
    }
    let _username = "";
    let _email = "";
    if (req.userInfo == undefined){
    _username = req.body.userName;   //for testing
    _email = req.body.email;
    }
    else{
        _username = req.userInfo.userName;
        _email = req.userInfo.email;
    }
    let _method = route.stack[0].method;
    let _path = route.path;




    let MongoClient = require('mongodb').MongoClient;
    let url = "mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb";
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbase = db.db("testingDB");



        let obj = {ip:requestIp,username:_username,email:_email,method:_method,path:_path,time:Date.now()};
        dbase.collection("testing").insert(obj,function (err,res){
                if (err) throw err;
                console.log(obj);
                console.log("inserted")
        });
        db.close();

    });
}

exports.tracker = TrackUserInfo;