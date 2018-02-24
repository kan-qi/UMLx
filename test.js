var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/rop";
var ObjectId = require('mongodb').ObjectId;
var mongo = require('mongodb');

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
//    var modelQuery = {_id: "b3c9bb716f05adf49d9fba5f87d0e3bc1518738028341"};
    	var o_id = new mongo.ObjectID("5a8fab8f91d51f915e5c29ae");
//    db.collection("modelInfo").findOne(modelQuery, function(err, repo) {
//        if (err) throw err;

    	db.collection("modelInfo").aggregate([
            {
                "$match": {
                    "_id": o_id
                }
            },
            { 
                "$lookup": {
                    "from": "domainModelInfo",
                    "localField": "domainModelUUID",
                    "foreignField": "_id",
                    "as": "domainModel"
                }
            },
            { 
                "$unwind": "$useCaseUUIDs" 
            },
            { 
                "$lookup": {
                    "from": "useCaseInfo",
                    "localField": "useCaseUUIDs",
                    "foreignField": "_id",
                    "as": "useCases"
                }
            },
            { 
                "$unwind": "$useCases" 
            },
            { 
                "$group": {
                    "_id": o_id,
                    "modelInfo": {"$push": "$$ROOT"},
//                    "useCases": { "$push": "$useCases" },
                    "domainModel": { "$push": "$domainModel" }
                }
            }
        ], 
        function(err, result){
            if (err) throw err;
            db.close();
            console.log("test the use case query");
            console.log(result[0].useCases);
//            callbackfunc(result[0]['UseCases']);
        });
        
//        cursor.toArray(function(err, result) {
//            if (err) throw err;
//            console.log(result);
//        });
        
        // db.close();
        // callbackfunc();
//    });
});