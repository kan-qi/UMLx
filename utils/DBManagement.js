(function(){

	   var mongo = require('mongodb');
	    var MongoClient = mongo.MongoClient;
		var url = "mongodb://127.0.0.1:27017/repo_info_schema";
	    var newDBManager = require('../UMLModelInfoManagerMongoDB.js');
	
	function updateToNewSchema(repoId){
//		updateModelInfoId();
		
		 MongoClient.connect(url, function(err, db)
			        {
						
			            if (err) throw err;
			            
			            var repoid=new mongo.ObjectID(repoId);
						
						console.log(repoId);
						
//						newDBManager.queryFullRepoInfo(repoId, function(repoInfo){
//
//							var debug = require("../utils/DebuggerOutput.js");
//							debug.writeJson("migration_repo_info_"+repoInfo._id, repoInfo);
//						});

						 db.collection("repos").findOne({_id: repoid}, function(err, repoInfo) {
							 console.log(repoInfo);
							if (err) throw err;
						
						
//						newDBManager.updateRepoInfo(repoInfo, function(){
//							console.log('finished migration');
//						})
						
						updateRepoInsertModels(repoInfo);
						
						
			       	});
		});
	}
	
	
	function updateRepoInsertModels(repo, callbackfunc){
//		        MongoClient.connect(url, function(err, db) {
//		            if (err) throw err;
		            
		            var modelArray = repo.Models;
//		            repo._id = mongo.ObjectId(repo._id);
		            
		            delete repo.Models;
		            //delete repo.DomainModel;
		            //delete repo.UseCases;
		            
//		            db.collection("repos").update({_id: repo._id}, repo, function(err, updateCount){
//		                if(err) throw err;
//		                db.close();
//		                if(callbackfunc){
//		                    callbackfunc("updating repoInfo");
//		                }
//		            });
		          
		            for(var i in modelArray){
		                newDBManager.saveModelInfo(modelArray[i], repo._id, function(){
		                	console.log("model saved");
		                });
		            }

//		        });
	}
	
	module.exports = {
			updateToNewSchema : updateToNewSchema,
	}
	
	
})();
