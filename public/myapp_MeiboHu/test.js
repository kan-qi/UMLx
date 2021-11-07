const fs = require('fs');
const path = require('path');
var assert = require('assert');

var jsonDataList = []; // array to store each json file's data

function saveEstimationModel() {
    var _dirname = '/Users/wendyhu/Downloads/Effort\ Estimation/Project/UMLx';
    var dir = path.join(_dirname,
        '/data/GitAndroidAnalysis/accuracy_analysis2/models');
    console.log(dir)

    
    fs.readdirSync(dir).forEach(file => {
        // console.log(file)
        // var ext = getExtension(file);
        // console.log(file)
        // console.log(ext)
        // if ((ext == 'json') && (file != 'package.json')) {
            jsonDataList.push(JSON.parse(fs.readFileSync(dir + '/' + file)));
        // }
    });

    var MongoClient = require('mongodb').MongoClient;
    var url_local = "mongodb://localhost:27017/";

    // make client connect to mongo service
    MongoClient.connect(url_local, function(err, db) {
        if (err) throw err;
        var dbase = db.db("testdb");
        dbase.createCollection("estimations", function(err, res) {
            console.log("collection created!");
        });

        //save data into mongodb
        for (var i in jsonDataList) {
            // console.log(jsonDataList[i]['model_name']);
            // dbase.collection('estimations').insert(jsonDataList[i]), function(err, res){
            //   assert.eqaul(null, err);
            //   console.log(jsonDataList[i]);
            //   console.log("record added");
            //   // db.close();
            // }
            // var bodyJson = JSON.parse(jsonDataList[i]);
            dbase.collection('estimations').insertOne(jsonDataList[i], function(err, records) {
                if (err) throw err;
                console.log("record added");
                console.log(records.ops[0])
            });

            // count_exist = 1;
        }
        // console.log(dbase.collection);
    });
}

// function getExtension(filename) {
//     var ext = path.extname(filename || '').split('.');
//     return ext[ext.length - 1];
// }

//print all models in a list
function queryAllModelNames() {
    var MongoClient = require('mongodb').MongoClient;
    var url_local = "mongodb://localhost:27017/";
    
    MongoClient.connect(url_local, function(err, db){
        var dbase = db.db("testdb");
        dbase.collection("estimations").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });
    });
}

//delete the collection
function dropCollection(){
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("testdb");
          dbo.collection("estimations").drop(function(err, delOK) {
            if (err) throw err;
            if (delOK) console.log("Collection deleted");
            db.close();
          });
    });
}


//query and print model by key word
function queryModelName(name){
    var url = "mongodb://localhost:27017/";
    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("testdb");
      var query = { model_name: name};
      dbo.collection("estimations").find(query).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });
}


//sort it by insertion time ascending
function sortById(){
    var url = "mongodb://localhost:27017/";
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("testdb");
      var mysort = { _id : 1 };
      dbo.collection("estimations").find().sort(mysort).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });    
}

//sort it by Date_create ascending
function sortByDate(){
    var url = "mongodb://localhost:27017/";
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("testdb");
      var mysort = { Date_created : 1 };
      dbo.collection("estimations").find().sort(mysort).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });    
}



// Data.find({}).project({ _id : 1, serialno : 1 }).toArray()

// saveEstimationModel();
// queryEstimationModelNames();
// query('ucp');
// dropCollection();

sortById();
// export function init() {
//     console.log('check');
// }





















