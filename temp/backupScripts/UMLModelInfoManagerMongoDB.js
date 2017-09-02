(function() {
	// Retrieve
	var mongo = require('mongodb');
	var MongoClient = mongo.MongoClient;
	var umlModelAnalyzer = require("./umlModelAnalyzer.js");
	var url = "mongodb://127.0.0.1:27017/repo_info_schema";
	
	function getModelQuery(repoId, modelId){
		var o_id = new mongo.ObjectID(repoId);
		  var modelQuery = {
				  _id:o_id,
				  models:{
					$elemMatch:{_id:modelId}
				  }
		  };
//		  modelQueryInfo["models."+modelId] = {
//				  '$exists': true
//		  };
		  
		  return modelQuery;
	}
	
	function getModelQueryProjections(repoId, modelId){
		var o_id = new mongo.ObjectID(repoId);
		  var modelQueryProjection = {
				  _id:1,
				  models:{
					$elemMatch:{_id:modelId}
				  }
		  };
//		  modelQueryInfo["models."+modelId] = {
//				  '$exists': true
//		  };
		  
		  return modelQueryProjection;
	}
	
	function updateModelInfo(repoId, modelInfo, callbackfunc){
		 MongoClient.connect(url, function(err, db) {
  			  if (err) throw err;
  			  var modelQueryInfo = getModelQuery(repoId, modelInfo._id);
  			  var updateOperation = {
  					"$set": {
  						"models.$":modelInfo
  					}
  			  };
  			  db.collection("repo_collection").update(modelQueryInfo, updateOperation, function(err, updateCount){
  				  if(err) throw err;
  				  db.close();
  				  if(callbackfunc !== null){
			    	 callbackfunc(modelInfo);
		  			}
  			  	});
  			
   		 });
	}
	
	function updateRepoInfo(repo, callbackfunc){
		 MongoClient.connect(url, function(err, db) {
 			  if (err) throw err;
 			  var updateOperation = {
 					"$set": {
 						"$":repo
 					}
 			  };
 			  db.collection("repo_collection").update({_id:new mongo.ObjectID(repo._id)}, updateOperation, function(err, updateCount){
 				  if(err) throw err;
 				  db.close();
 				  if(callbackfunc !== null){
			    	 callbackfunc(modelInfo);
		  			}
 			  	});
 			
  		 });
	}
	
	function queryModelInfo(repoId, modelId, callbackfunc){
//		console.log(modelId);
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  var modelQuery = getModelQuery(repoId, modelId);
			  var projections = getModelQueryProjections(repoId, modelId);
			  
			  db.collection("repo_collection").findOne(modelQuery, projections, function(err, repo) {
			    if (err) throw err;
//			    console.log('==============selected repo============');
//			    console.log(repo);
			    db.close();
			    callbackfunc(repo["models"][0]);
			  });
			});
	}
	
	
	function queryDiagramInfo(repoId, modelId, diagramId, callbackfunc){
		console.log("robustness id: "+diagramId);
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
//			  var diagramQuery = {
//					  _id:new mongo.ObjectID(repoId),
//			  		  models:{
//			  			  $elemMatch:{
//			  				  robustnessDiagrams:{
//			  					  $elemMatch:{
//			  						  _id:diagramId
//			  						  }
//			  				  }
//			  			  }
//			  		  }
//			  };
			  
//			  var diagramQuery = {
//					  '_id':new mongo.ObjectID(repoId),
//			  		  'models.robustnessDiagrams._id':diagramId
//			  };
			  
//			  var projections = {
//					  _id:1,
//			  		  "models.robustnessDiagrams.$":1
//			  }
			  
//			  var projections = {
//			  		  'models.robustnessDiagrams._id.$':1
//			  }
			  
			  db.collection("repo_collection").aggregate([
				  {
					  '$match':{
						  '_id':new mongo.ObjectID(repoId),
						  'models._id':modelId,
						  'models.robustnessDiagrams._id': diagramId
					  }
				  },
				  {
					  '$unwind':'$models'
				  },
				  {
					  '$unwind':'$models.robustnessDiagrams'
				  },
				  {
					  '$match':{
						  '_id':new mongo.ObjectID(repoId),
						  'models._id':modelId,
						  'models.robustnessDiagrams._id': diagramId
					  }
				  },
				  {
					  '$project': {
						  "robustnessDiagrams":"$models.robustnessDiagrams"
					  }
				  }
			  ], function(err, result){
				  if (err) throw err;
				   db.close();
//				  console.log(result[0]['robustnessDiagrams']);
				   callbackfunc(result[0]['robustnessDiagrams']);
			  });
			  
//			  console.log(diagramQueryInfo);
//			  db.collection("repo_collection").findOne(diagramQuery, projections, function(err, repo) {
//			    if (err) throw err;
//			    db.close();
//			    console.log(repo["models"]);
//			    callbackfunc(repo["models"][0]['robustnessDiagrams'][0]);
//			  });
			});
	}
	
	function queryRepoInfo(repoId, callbackfunc){
			MongoClient.connect(url, function(err, db) {
				  if (err) throw err;
				  var o_id = new mongo.ObjectID(repoId);
//				  db.collection("repo_collection").find({}, {umlModelType:1}).toArray(function(err, result) {
			      db.collection("repo_collection").findOne({_id:o_id}, {}, function(err, repo) {
					if (err) throw err;
//				    console.log(repo);
				    db.close();
				    //temporary code
//				     for(var i in result){
//				    	 var model = result[i];
//				    	 repo['models'][model._id] = model; 
//				     }
				    //
				    callbackfunc(repo);
				  });
				});
	}
	
	
	module.exports = {
		setupRepoStorage : function(callbackfunc) {
			// Connect to the db
			MongoClient.connect(url, function(err, db) {
				if (err) throw err;
			  db.createCollection('repo_collection', function(err, collection) {
				    console.log("Table created!");
				    db.close();
				    callbackfunc();
			  });

			});
		},
		createRepo: function(callbackfunc){
			MongoClient.connect(url, function(err, db) {
				  if (err) throw err;
				  var repoInfo = {};
				  db.collection("repo_collection").insertOne(repoInfo, function(err, result) {
				    if (err) throw err;
				    console.log("1 record inserted");
//				    console.log(repoInfo);
				    var repoId = repoInfo._id;
				    repoInfo.models = [];
					repoInfo.outputDir = "public/output/repo"+repoId;
					repoInfo.accessDir = "output/repo"+repoId;
				    
				    var o_id = new mongo.ObjectID(repoId);
	   			  	db.collection("repo_collection").update({_id:o_id}, repoInfo, function(){
					    db.close();
					    callbackfunc(repoInfo);
	   			  	});
	   			  	
				  });
				});
		},
		queryModelAnalytics: function(repoId, modelId, callbackfunc){
			/*
			 * query Analytics
			 * 
			 * 1. first search for the field of model: model_Analytics
			 * 2. calculate based on diagram Analytics, if exists
			 * 3. if diagram Analytics, doesn't exist, calculate diagram Analytics
			 * 
			 */
			
			  queryModelInfo(repoId, modelId, function(modelInfo){
				    modelInfo._id = modelId;
				    var modelAnalytics = modelInfo.ModelAnalytics;
				   
//				    if(modelAnalytics !== undefined){
//				    	  console.log('model Analytics exist');
//				    	  db.close();
//				    	  callbackfunc(modelAnalytics);
//				    }
//				    else{
//				    	 console.log('model Analytics doesn\'t exist');
				    	 var modelAnalytics = umlModelAnalyzer.getModelAnalytics(modelInfo);
				    		 modelInfo.ModelAnalytics = modelAnalytics;
//				    		 console.log("queryModelInfo");
				    		 updateModelInfo(repoId, modelInfo, function(modelInfo){
				    			 if(callbackfunc !== null){
				    				 callbackfunc(modelInfo.ModelAnalytics);
				    			 }
				    		 });
				    	
//				    }
				    
				  });
		},
		queryModelInfo: queryModelInfo,
		deleteModelInfo : function(repoId, modelInfo) {

		},
		saveModelInfo : function(repoId, modelInfo, callbackfunc) {
			MongoClient.connect(url, function(err, db) {
				  if (err) throw err;
//				  console.log(modelInfo);
				  var o_id = new mongo.ObjectID(repoId);
				  db.collection("repo_collection").update({_id:o_id}, {$push: {models: modelInfo}}, function(err, res) {
				    if (err) throw err;
				    console.log("1 record inserted");
				    db.close();
				    if(callbackfunc !== null){
				    callbackfunc(modelInfo);
				    }
				  });
				});
		},
		queryRepoInfo : queryRepoInfo,
		queryDiagramInfo: queryDiagramInfo,
		queryDiagramAnalytics: function(diagramId, callbackfunc){
			queryDiagramInfo(diagramId, function(diagramInfo){
				
			});
		},
		clearDB: function(callbackfunc){
			MongoClient.connect(url, function(err, db) {
				  if (err) throw err;
				  db.collection("repo_collection").drop(function(err, delOK) {
				    if (err) throw err;
				    if (delOK) console.log("Table deleted");
				    db.close();
				    callbackfunc();
				  });
				});
		},
		queryRepoAnalytics: function(repoId, callbackfunc){
			queryRepoInfo(repoId, function(repo){
				var repoAnalytics =  umlModelAnalyzer.getRepoAnalytics(repo);
				if(repo.updated !== undefined && repo.updated === true){
					callbackfunc(repoAnalytics);
				}
			});
		}
	}
}())