(function() {
	// Retrieve
	var mongo = require('mongodb');
	var MongoClient = mongo.MongoClient;
	var umlModelAnalyzer = require("./UMLModelAnalyzer.js");
	var url = "mongodb://127.0.0.1:27017/repo_info_schema";
	var umlFileManager = require("./UMLFileManager.js");
	var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
	var config = require('./config'); // get our config file
	
	function getModelQuery(modelId, repoId){
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
	
	function getModelQueryProjections(modelId, repoId){
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
	
	function updateModelInfo(modelInfo, repoId, callbackfunc){
		 MongoClient.connect(url, function(err, db) {
  			  if (err) throw err;
  			  var modelQueryInfo = getModelQuery(modelInfo._id, repoId);
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
// 			  var updateOperation = {
// 					"$set": {
// 						repo
// 					}
// 			  };
 			  db.collection("repo_collection").update({_id:new mongo.ObjectID(repo._id)}, repo, function(err, updateCount){
 				  if(err) throw err;
 				  db.close();
 				  if(callbackfunc !== null){
			    	 callbackfunc(repo);
		  			}
 			  	});
 			
  		 });
		
	}
	
	
	 function queryModelAnalytics(modelId, repoId, callbackfunc, update){
			/*
			 * query Analytics
			 * 
			 * 1. first search for the field of model: model_Analytics
			 * 2. calculate based on useCase Analytics, if exists
			 * 3. if useCase Analytics, doesn't exist, calculate useCase Analytics
			 * 
			 */
		 
		 	if(update !== true){
				update == false;
			}
			
			  queryModelInfo(modelId, repoId, function(modelInfo){
				    modelInfo._id = modelId;
				    var modelAnalytics = modelInfo.ModelAnalytics;
				   
				    if(modelAnalytics && !update){
				    	  console.log('model Analytics exist');
				    	  callbackfunc(modelInfo.ModelAnalytics, modelInfo);
				    }
				    else{
				    	 console.log('model Analytics doesn\'t exist');
				    	 	 umlModelAnalyzer.analyseModel(modelInfo, function(){
				    	 		 console.log('model analysis is complete');
				    	 	 });
//				    		 console.log("queryModelInfo");
				    		 updateModelInfo(modelInfo, repoId, function(modelInfo){
				    			 if(callbackfunc !== null){
				    				 callbackfunc(modelInfo.ModelAnalytics, modelInfo);
				    			 }
				    		 });
				    	
				    }
				    
				  });
		}
	
	function updateUseCaseInfo(repoId, modelId, useCaseInfo, callbackfunc){
		//update here. It is not efficient.
		queryModelInfo(modelId, repoId, function(modelInfo){
			for(var i in modelInfo.useCases){
				var useCase = modelInfo.useCases[i];
				if(useCase._id === useCaseInfo._id){
					modelInfo.useCases[i] = useCaseInfo;
					break;
				}
			}
			
			umlModelAnalyzer.analyseModel(modelInfo, function(){
				console.log("model analysis is complete");
			});
			
			updateModelInfo(modelInfo, repoId, function(modelInfo){
				callbackfunc(useCaseInfo);
			});
		});
	}
	
	function queryModelInfo(modelId, repoId, callbackfunc){
//		console.log(modelId);
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  var modelQuery = getModelQuery(modelId,repoId);
			  var projections = getModelQueryProjections(modelId, repoId);
			  
			  db.collection("repo_collection").findOne(modelQuery, projections, function(err, repo) {
			    if (err) throw err;
//			    console.log('==============selected repo============');
//			    console.log(repo);
			    db.close();
			    callbackfunc(repo["models"][0]);
			  });
			});
	}
	
	
	function queryUseCaseInfo(repoId, modelId, useCaseId, callbackfunc){
		console.log("use case id: "+useCaseId);
		console.log("model id:"+modelId);
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  db.collection("repo_collection").aggregate([
				  {
					  '$match':{
						  '_id':new mongo.ObjectID(repoId),
						  'models._id':modelId,
						  'models.UseCases._id': useCaseId
					  }
				  },
				  {
					  '$unwind':'$models'
				  },
				  {
					  '$unwind':'$models.UseCases'
				  },
				  {
					  '$match':{
						  '_id':new mongo.ObjectID(repoId),
						  'models._id':modelId,
						  'models.UseCases._id': useCaseId
					  }
				  },
				  {
					  '$project': {
						  "UseCases":"$models.UseCases"
					  }
				  }
			  ], function(err, result){
				  if (err) throw err;
				   db.close();
				   callbackfunc(result[0]['UseCases']);
			  });
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
				    callbackfunc(repo);
				  });
				});
	}
	
	function queryRepoAnalytics(repoId, callbackfunc, update){
		if(update !== true){
			update == false;
		}
		
		queryRepoInfo(repoId, function(repo){
			
			var repoAnalytics = repo.RepoAnalytics;
			if(!update){
				  console.log('Repo Analytics exist');
		    	  callbackfunc(repoAnalytics, repo);
			} else
			{
				console.log('Repo Analytics doesn\'t exist');
				umlModelAnalyzer.analyseRepo(repo, function(){
					console.log("analyse repo finished");
				});
//				repo.RepoAnalytics = repoAnalytics;
				updateRepoInfo(repo, function(repoInfo){
	    			 if(callbackfunc !== null){
	 					callbackfunc(repoInfo.RepoAnalytics, repo);
	    			 }
	    		 });
			}
		});
	}
	
	function saveModelInfo(modelInfo, repoId, callbackfunc) {
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
//			  console.log(modelInfo);
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
	}
	
	function updateRepoAnalytics(repoAnalytics, callbackfunc){
		 MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  db.collection("repo_collection").update({_id:new mongo.ObjectID(repoAnalytics._id)}, {$set:{RepoAnalytics: repoAnalytics}}, function(err, updateCount){
				  if(err) throw err;
				  db.close();
				  if(callbackfunc !== null){
			    	 callbackfunc(repoAnalytics);
		  			}
			  	});
 		 });
	}
	
	function deleteModel(repoId, modelId, callbackfunc){
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
//			  console.log(modelInfo);
			  var o_id = new mongo.ObjectID(repoId);
			  db.collection("repo_collection").update({_id:o_id}, {$pull: {'models': {'_id': modelId}}}, function(err){
			      if (err) { 
			    	  console.log(err);
			    	  callbackfunc(false);
			    	  return;
			      }
			      queryRepoInfo(repoId, function(repoInfo){
			      console.log(repoInfo);
			      umlModelAnalyzer.analyseRepo(repoInfo, function(){
						console.log("model analysis is complete");
				  });
			      updateRepoAnalytics(repoInfo.RepoAnalytics, function(){
//			    	  umlFileManager.deleteDir(function(result){
			    		  if(callbackfunc){
						      callbackfunc(modelId, repoId);
					    	 }
//			    	  });
			    	 
			      })
			      });
			    });
			});
	}
	
	function deleteUseCase(repoId, modelId, useCaseId, callbackfunc){
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
//			  console.log(modelInfo);
//			  var o_id = new mongo.ObjectID(repoId);
			  var modelQuery = getModelQuery(modelId, repoId);
			  db.collection("repo_collection").update(modelQuery, {$pull: {'models.$.useCases':{'_id':useCaseId}}}, function(err){
			      console.log("delete useCase");
				  if (err) { 
			    	  console.log(err);
			    	  callbackfunc(false);
			    	  return;
			      }
				  queryModelInfo(modelId, repoId, function(modelInfo){
				 	 umlModelAnalyzer.analyseModel(modelInfo, function(){
		    	 		 console.log('model analysis is complete');
		    	 	 });
//		    		 console.log("queryModelInfo");
		    		 updateModelInfo(modelInfo, repoId, function(modelInfo){
		    			 if(callbackfunc !== null){
		   			      	callbackfunc(useCaseId, modelId, repoId);
		    			 }
		    		 });
				  });
			    });
			});
	}
	
	function createRepo(username,pwd,callbackfunc){
		MongoClient.connect(url, function(err, db) {
			 if (err) throw err;
			  
			// check if a user exists with same email or username --> in such a case throw an error
            var queryCheckExisting = { 
                                            "username":username,
                                            "password":pwd
                                        
            }
            
            var existingUsers  = db.collection("users").findOne(queryCheckExisting,function(err,user){
                if (err) throw err;
                
                if(user){
                    // found an existing user 
                    var userId = user._id;
                    
                    var repoInfo = {};
  				    db.collection("repo_collection").insertOne(repoInfo, function(err, result) {
  				    if (err) throw err;
  				    console.log("1 record inserted");
  				   
  				    var repoId = repoInfo._id;
  				    repoInfo.models = [];
  					repoInfo.outputDir = "public/output/repo"+repoId;
  					repoInfo.accessDir = "output/repo"+repoId;
  					repoInfo.RepoAnalytics = umlModelAnalyzer.initRepoAnalytics(repoInfo);
  				    var o_id = new mongo.ObjectID(repoId);
  				    
  	   			  	db.collection("repo_collection").update({_id:o_id}, repoInfo, function(){
  	   			  		
  	   			  		var user_o_id = new mongo.ObjectID(userId)
  	   			  		user.repoId = repoId;
  	   			  		// when u create a repo assign it to the specified user
  	   			  		db.collection("users").update({_id: user_o_id}, user , function(){
  	   			  			db.close();
  	   			  			callbackfunc(repoInfo);
  	   			  		})
  					    
  	   			  	});
  	   			  	
  				  });
                
                } else{
                    console.log('Invalid Username and password combination');
                    db.close();
                }
                
            });
 
			});
	}
    
    function newUserSignUp(email,username,pwd,isEnterprise ,enterpriseUserId, callback){
        
        MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
            
            // check if a user exists with same email or username --> in such a case throw an error
            var queryCheckExisting = { 
                                        $or:[
                                            {"username":username},
                                            {"email":email}
                                        ]
                                      }
            
            var existingUsers  = db.collection("users").findOne(queryCheckExisting,function(err,data){
                if (err) throw err;
                
                if(data){
                    // found an existing user 
                    db.close();
                    var result = {
              	          success: false,
              	          message: 'Username or email already exists',
                    	};
                    callback(result);
                    return;
                    
                } else{
                	
                     var userInfo = {"username" : username , "email" :email , "password" :pwd, "isEnterprise" : isEnterprise }
                     if(enterpriseUserId!=''){
                    			 userInfo.enterpriseUserId= enterpriseUserId;
                     } 
                     
                     db.collection("users").insertOne(userInfo, function(err, result) {
                            if (err) throw err;
              				db.close();	
                            
                            // since the user successfully signed up create a repo for this user
                            	createRepo(username,pwd,function(repo){
                            		console.log('created a new repo '+repo._id);
                            		var payload = {
        		                    		userId : userInfo._id,
        		                    		userName : userInfo.username,
        		                    		userEmail : userInfo.email
        		                    };
        		                    	        
        		                    var token = jwt.sign(payload, config.secret, {
        		                    	expiresIn : 60*60*24 // expires in 24 hours
        		                    });
        		
        		                   // return the information including token as JSON
        		                    var result = {
        		                    	          success: true,
        		                    	          message: 'Successfully signed up',
        		                    	          token: token
        		                    };
        		                    callback(result);
                            	});
                             
                     });
                
                }
                
            });
             
        });
    }
	
    function validateUserLogin(username,pwd,callback){

    	MongoClient.connect(url, function(err, db) {
			  	if (err) throw err;
			  
			  	// check if a user exists with same email or username --> in such a case throw an error
            	var queryCheckExisting = { 
                                            "username":username,
                                            "password":pwd
            							 }
            
            	var existingUsers  = db.collection("users").findOne(queryCheckExisting,function(err,data){
            			
            							if (err) throw err;
            							if(data){
            								
								                    // found an existing user 
								                    db.close();
								                  
								                    // generate a token and pass it as response
								                    var payload = {
								                    		userId : data._id,
								                    		userName : data.username,
								                    		userEmail : data.email
								                    };
								                    	        
								                    var token = jwt.sign(payload, config.secret, {
								                    	expiresIn : 60*60*24 // expires in 24 hours
								                    });
								
								                   // return the information including token as JSON
								                    var result = {
								                    	          success: true,
								                    	          message: 'Successful Authentication',
								                    	          token: token
								                    };
								                    callback(result);
                
            							} else{
								                    console.log('Invalid Username and password combination');
								                    db.close();
								                    var result = {
								                    	  success: false,
								              	          message: 'Invalid Username and password combination ',
								                    }
								                    callback(result);
								                    
								        }
            	});
             
        });
    }
    

    function queryUserInfo(userId, callbackfunc){
		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  
			  if(!mongo.ObjectId.isValid(userId)){
				  	callbackfunc(null);
			  }  else {
				  var o_id = new mongo.ObjectID(userId);
				  db.collection("users").findOne({_id:o_id}, {}, function(err, user) {
					if (err) throw err;
				    db.close();
				    	callbackfunc(user);
				  });  
			  }
			  
			});
			
    }

    function pushModelInfoVersion(modelId, repoId, modelInfoVersion, callbackfunc){
    	queryModelInfo(modelId, repoId, function(modelInfo){
			//to update the current version to the newly uploaded model file, and put the older versions into the arrays of versions.
			if(!modelInfo){
				if(callbackfunc){
					callbackfunc(false);
				}
				return;
			}
			modelInfoVersion._id = modelInfo._id;
			modelInfoVersion.umlModelName = modelInfo.umlModelName;//copy the model identifier from the original model Info into the new model version, to be the new model info, which is the head of the model versions.
			modelInfoVersion.ModelEmpirics = JSON.parse(JSON.stringify(modelInfo.ModelEmpirics)); //copy the model empirics from the older model version. User can update later.
			var oldVersions = modelInfo.Versions; //include the previous versions for the model file.
			if(!oldVersions){
				oldVersions = [];
			}
			delete modelInfo.Versions;
			delete modelInfo._id;
			delete modelInfo.umlModelName;
			oldVersions.push(modelInfo);
			//remove the versions property for the old version. to avoid nesting problem.
			modelInfoVersion.Versions = oldVersions;
			console.log(modelInfoVersion);
			updateModelInfo(modelInfoVersion, repoId, function(modelInfoVersion){
				if(callbackfunc){
					callbackfunc(modelInfoVersion);
				}
			});
		});
    }
    
	function popModelInfoVersion(modelId, repoId, callbackfunc){
		queryModelInfo(modelId, repoId, function(modelInfo){
			//to update the current version to the newly uploaded model file, and put the older versions into the arrays of versions.
			if(!modelInfo && !modelInfo.Versions){
				if(callbackfunc){
					callbackfunc(false);
				}
				return;
			}
			
			var olderVersion = modelInfo.Versions.pop(); //include the previous versions for the model file.
			olderVersion.Versions = modelInfo.Versions;
			olderVersion._id = modelInfo._id;
			olderVersion.umlModelName = modelInfo.umlModelName;
			console.log(olderVersion);
//			console.log(modelInfo);
			updateModelInfo(olderVersion, repoId, function(olderVersion){
				if(callbackfunc){
					callbackfunc(olderVersion);
				}
			});
		});
	}
	
	/*
	 * if modelInfo is not null, create an model info with the id and name in modelInfo, so as to create an version of the model Info
	 */
	function initModelInfo(umlModelInfo, umlModelName, umlModelInfoBase){
		if(umlModelInfoBase){
			umlModelInfo._id = umlModelInfoBase._id;
			umlModelInfo.umlModelName = umlModelInfoBase.umlModelName;
			return umlModelInfo;
		}
		 umlModelInfo._id = umlModelInfo.fileId + Date.now();
		 if(!umlModelName || umlModelName === ''){
			 umlModelName = umlModelInfo.fileId;
		 }

		 umlModelInfo.umlModelName = umlModelName;
		 
		 return umlModelInfo;
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
		createRepo: createRepo,
		
		queryModelAnalytics: queryModelAnalytics,
		queryModelInfo: queryModelInfo,
		deleteModelInfo : function(repoId, modelInfo) {

		},
		updateUseCaseInfo: updateUseCaseInfo,
		saveModelInfo : saveModelInfo,
		queryRepoInfo : queryRepoInfo,
		queryUseCaseInfo: queryUseCaseInfo,
		queryUseCaseAnalytics: function(repoId, modelId, useCaseId, callbackfunc){
			queryUseCaseInfo(repoId, modelId, useCaseId, function(useCaseInfo){
				var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
				if(useCaseAnalytics !== undefined){
					console.log("useCase analytics defined");
					if(callbackfunc !== undefined){
						callbackfunc(useCaseAnalytics, useCaseInfo);
					}
				}
				else{
					console.log("useCase analytics undefined");
					
					useCaseAnalytics = umlModelAnalyzer.analyseUseCase(useCaseInfo, function(){
						console.log("useCase analysis is finished");
					});
					useCaseInfo.UseCaseAnalytics = useCaseAnalytics;
					updateUseCaseInfo(repoId, modelId, useCaseInfo, function(useCaseInfo){
//						console.log(useCaseAnalytics);
						if(callbackfunc !== undefined){
							callbackfunc(useCaseInfo.UseCaseAnalytics, useCaseInfo);
						}
					});
				}
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

		
		reloadRepo: function(repo, modelReloadProcessor){
			var models = repo.models;
			for (var i in models) { //for multiple files          
			    (function(model) {
			    	umlModelAnalyzer.extractModelInfo(model, modelReloadProcessor)
			    })(models[i]);
			}
		},
		updateModelInfo: updateModelInfo,
		updateRepoInfo: updateRepoInfo,
		queryRepoAnalytics: queryRepoAnalytics,
		deleteModel:deleteModel,
		deleteUseCase:deleteUseCase,
		queryDomainModelDetail:function(modelId, repoId, callbackfunc){
			 queryModelInfo(modelId, repoId, function(modelInfo){
				 	if(callbackfunc){
				    callbackfunc(modelInfo.DomainModel);
				 	}
			 });
		},
		pushModelInfoVersion:pushModelInfoVersion,
		popModelInfoVersion:popModelInfoVersion,
		initModelInfo: initModelInfo, //create model info
        newUserSignUp : newUserSignUp,
        validateUserLogin : validateUserLogin,
        queryUserInfo: queryUserInfo
        
        
	}
}())