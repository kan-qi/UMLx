//import { MongoClient } from './node_models/mongodb';
(function() {

    var MongoClient = require('mongodb').MongoClient;
 var url_local = "mongodb://localhost:27017/runoob";
var ObjectID = require('mongodb').ObjectID;
var idAndnames=1;
var Promise = require('rsvp').Promise;
function getExtension(filename) {
    var ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
}

function saveEstimationModel() {
    //const fs = require('fs');
    var jsonDataList = []; // array to store each json file's data
    var dir = path.join(_dirname,
        '/data/GitAndroidAnalysis/accuracy_analysis2/models');
    console.log(dir)
    fs.readdirsync(dir).forEach(file => {
        console.log(file)
        var ext = getExtension(file);
        console.log(file)
        console.log(ext)
        if ((ext == 'json') && (file != 'package.json')) {
            jsonDataList.push(JSON.parse(fs.readFileSync(dir + '/' + file)));
        }
    });


    // make client connect to mongo service 
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbase = db.db("testdb");
        dbase.createCollection("estimations", function(err, res) {
            console.log("collection created!");
        });

        //save data into mongodb
        for (var i in jsonDataList) {
            db.collection('estimations').save(jsonDatalist[i], function(err, records) {
                if (err) throw err;
                console.log("record added");
                console.log(jsonDataList[i]['model_name'])
            });
            count_exist = 1;
        }
    });
}


function queryEstimationModelNames(objID) {
    return new Promise(function(resolve,reject){
    MongoClient.connect(url_local, function(err, db)
     {
        if(err)
            reject(err)
        else
            resolve(db)
})
}).then(function(db){
        return new Promise(function(resolve, reject) {

        var cv="cvResults.accuracy_metrics."+objID;
        var be="bsEstimations."+objID;
        var gfm="cvResults.goodness_fit_metrics."+objID;
       
        var q={$or:[{model_name:{$regex: objID}},
                    {dataset_name:{$regex: objID}},
                    {model_path:{$regex: objID}},
                    {Date_created:{$regex: objID}},
                    {[cv]:{$exists:true}},
                    {[be]:{$exists:true}},
                    {[gfm]:{$exists:true}}
                                              ]
                                          }
        // console.log(q)
        //db.collection("estimations").createIndex({:"text"})
        db.collection("estimations").find(q).toArray(function(err, result) 
            {
                if (err) throw err;
                //console.log("success!")
                //console.log(objID)
                //callbackfunc(result); //{"model_name":}
                db.close();
                //console.log(result)   
                resolve(result);         
            }); 
          //  console.log(searchedData)
        })
    })
}


function searchEstimationModelDetail(objID) {
    return new Promise(function(resolve,reject){
    MongoClient.connect(url_local, function(err, db)
     {
        if(err)
            reject(err)
        else
            resolve(db)
})
}).then(function(db){
        return new Promise(function(resolve, reject) {
        db.collection("estimations").find({"_id":ObjectID(objID)}).toArray(function(err, result) 
            {
                if (err) throw err;

                db.close();
               // console.log("search!")   
                resolve(result);         
            }); 
        })
    })
}

//earchEstimationModelDetail("5f877701dfa83d9a24e89d3b").then(function(result){
 //  console.log(result)
//})
//queryEstimationModelNames("cosmic_mmre")
//queryEstimationModelNames("R2")
//}());


module.exports={
    searchEstimationModelDetail:searchEstimationModelDetail,
    queryEstimationModelNames:queryEstimationModelNames,
    idAndnames,

}
//export function init() {
  //  console.log('check');
}());//*/