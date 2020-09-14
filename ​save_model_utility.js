​function getExtension(filename) {
    var ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
}
​


function save_model_utility(){
const fs = require('fs');
var path = require('path');
​
var jsonDatalist = [];  //array to store each json file's data
var dir = __dirname;
fs.readdirSync(dir).forEach(file => {
    var ext = getExtension(file); 
    if ((ext == 'json') && (file != 'package.json') ) {  //scan json file under folder
        jsonDatalist.push(JSON.parse(fs.readFileSync(file)));
    }
});
​
​
var MongoClient = require('mongodb').MongoClient;
​
var url = "mongodb://localhost:27017/";
// make client connect to mongo service
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Switched to " + db.databaseName + " database");
​
    var dbase = db.db("model-1"); //here
​
    // create modelinfo collection
    dbase.createCollection("estimation_models", function (err, res) {
        if (err) throw err;
        console.log("Collection created!");
        //db.close();   //close method has also been moved to client obj
    });
    
    for (var i in jsonDatalist) { //save data into mongodb from array
        dbase.collection('estimation_models').save(jsonDatalist[i], function (err, records) {
            if (err) throw err;
            console.log("record added");
        });
    }
});
  }
