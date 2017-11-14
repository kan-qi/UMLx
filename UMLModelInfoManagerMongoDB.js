
(function() {
    // Retrieve
    var mongo = require('mongodb');
    var MongoClient = mongo.MongoClient;
    var umlModelAnalyzer = require("./UMLModelAnalyzer.js");
    var umlEvaluator = require("./UMLEvaluator.js");
	var url = "mongodb://127.0.0.1:27017/repo_info_schema";
    var umlFileManager = require("./UMLFileManager.js");
    var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
    var config = require('./config'); // get our config file
    const uuidv4 = require('uuid/v4');

	function getModelQuery(modelId, repoId){
		var o_id = new mongo.ObjectID(repoId);
		var modelQuery = {
				_id:o_id,
				Models:{
					$elemMatch:{_id:modelId}
				}
		};
//		modelQueryInfo["Models."+modelId] = {
//		'$exists': true
//		};

        return modelQuery;
    }
	
	function deleteUser(userId, callbackfunc){
		
		  MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  
			  var o_id = new mongo.ObjectID(userId);
			  var userQuery = {_id: o_id };
			  
			  db.collection("users").findOne(userQuery,function(err,user){
				  if (err) throw err;
				  
				  if(user){
					  var repo_id = user.repoId ; 
					  var repoQuery = {_id : repo_id}
					  
					  var repo_dir = "public/output/repo"+repo_id.toString();
					  umlFileManager.deleteUMLRepo(repo_dir);
					  
					   db.collection("repos").deleteOne(repoQuery, function(err, repo) {
						    if (err) throw err;
						    console.log("repo deleted");
						    						    
						    db.collection("users").deleteOne(userQuery, function(err,user){
						    	if (err) throw err;
							    console.log("user deleted");
							    db.close();
							    callbackfunc(true);
						    });
						    
					  });
					  
				  } else {
					  
					  console.log('user not found');
					  db.close();
					  callbackfunc(false);
					  
				  }
			  });
			  
		  });
		 
}
	
	
	function deactivateUser(loggedInUserId, userId, callbackfunc){
		
		  MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  
			  var o_id = new mongo.ObjectID(userId);
			  var userQuery = {_id: o_id };
			  
			  var updateOperation = {
		                "$set": {
		                    "isActive":false
		                }
		      };
			  
			  db.collection("users").findOne(userQuery,function(err,user){
				  if (err) throw err;
				  
				  if(user){
					  
					 var enterpriseUserIdString = user.enterpriseUserId? user.enterpriseUserId.toString(): '';
					  
					  		if(user._id.toString() == loggedInUserId.toString() || enterpriseUserIdString == loggedInUserId.toString()){
						    db.collection("users").update(userQuery, updateOperation, function(err,updateCount){
						    	if (err) throw err;
							    console.log("user deactivated");
							    db.close();
							    callbackfunc(true, 'User Deactivated');
						    });
					  		} else {
					  			
					  			console.log('not authorised');
								  db.close();
								  callbackfunc(false, 'Not authorized to deactivate this user');
					  			
					  		}
						    
				  } else {
					  
					  console.log('user not found');
					  db.close();
					  callbackfunc(false, 'User Not Found');
					  
				  }
			  });
			  
		  });
		 
}
	
	

	function getModelQueryProjections(modelId, repoId){
		var o_id = new mongo.ObjectID(repoId);
		var modelQueryProjection = {
				_id:1,
				Models:{
					$elemMatch:{_id:modelId}
				}
		};
//		modelQueryInfo["Models."+modelId] = {
//		'$exists': true
//		};

        return modelQueryProjection;
    }

    function updateModelInfo(modelInfo, repoId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var modelQueryInfo = getModelQuery(modelInfo._id, repoId);
            var updateOperation = {
                "$set": {
                    "Models.$":modelInfo
                }
            };
            db.collection("repos").update(modelQueryInfo, updateOperation, function(err, updateCount){
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
//			var updateOperation = {
//			"$set": {
//			repo
//			}
//			};
            db.collection("repos").update({_id:new mongo.ObjectID(repo._id)}, repo, function(err, updateCount){
                if(err) throw err;
                db.close();
                if(callbackfunc){
                    callbackfunc(repo);
                }
            });

        });

    }


	// function queryModelAnalytics(modelId, repoId, callbackfunc, update){
			//			/*
			// * query Analytics
			// *
			// * 1. first search for the field of model: model_Analytics
			// * 2. calculate based on useCase Analytics, if exists
			// * 3. if useCase Analytics, doesn't exist, calculate useCase Analytics
			// *
			// */
//
		 	//if(update !== true){
				//update == false;
			//}
//
			//  queryModelInfo(modelId, repoId, function(modelInfo){
				//    modelInfo._id = modelId;
				//    var modelAnalytics = modelInfo.ModelAnalytics;
//
				//    if(modelAnalytics && !update){
				    	//  console.log('model Analytics exist');
				    	//  callbackfunc(modelInfo.ModelAnalytics, modelInfo);
				//    }
				//    else{
				    	// console.log('model Analytics doesn\'t exist');
				    	 	 //				    	 	 umlEvaluator.evaluateModel(modelInfo, function(){
				    	 		// console.log('model analysis is complete');
				    	 	// });
////				    		 console.log("queryModelInfo");
				    		// updateModelInfo(modelInfo, repoId, function(modelInfo){
				    			// if(callbackfunc !== null){
				    				// callbackfunc(modelInfo.ModelAnalytics, modelInfo);
				    			// }
				    		// });
//
				//    }
//
				//  });
		//}

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

			umlEvaluator.evaluateModel(modelInfo, function(){
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

            db.collection("repos").findOne(modelQuery, projections, function(err, repo) {
                if (err) throw err;
//				console.log('==============selected repo============');
//				console.log(repo);
                db.close();
                callbackfunc(repo["Models"][0]);
            });
        });
    }


    function queryUseCaseInfo(repoId, modelId, useCaseId, callbackfunc){
        console.log("use case id: "+useCaseId);
        console.log("model id:"+modelId);
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            db.collection("repos").aggregate([
                {
                    '$match':{
                        '_id':new mongo.ObjectID(repoId),
                        'Models._id':modelId,
                        'Models.UseCases._id': useCaseId
                    }
                },
                {
                    '$unwind':'$Models'
                },
                {
                    '$unwind':'$Models.UseCases'
                },
                {
                    '$match':{
                        '_id':new mongo.ObjectID(repoId),
                        'Models._id':modelId,
                        'Models.UseCases._id': useCaseId
                    }
                },
                {
                    '$project': {
                        "UseCases":"$Models.UseCases"
                    }
                }
            ], function(err, result){
                if (err) throw err;
                db.close();
                callbackfunc(result[0]['UseCases']);
            });
        });
    }

    function queryRepoInfo(repoId, callbackfunc, update){
		if(update !== true){
		update == false;
		}
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var o_id = new mongo.ObjectID(repoId);
//			db.collection("repos").find({}, {umlModelType:1}).toArray(function(err, result) {
            db.collection("repos").findOne({_id:o_id}, {}, function(err, repo) {
                if (err) throw err;
//				console.log(repo);
				db.close();
				if(!update){callbackfunc(repo);} else{
//					console.log('Repo Analytics doesn\'t exist');
					umlEvaluator.evaluateRepo(repo, function(){
						console.log("evaluate repo finished");
					});
//					repo.RepoAnalytics = repoAnalytics;
					updateRepoInfo(repo, function(repoInfo){
						if(callbackfunc !== null){
							callbackfunc(repo);
						}
					});
				}
			});
		});
	}

    function queryRepoInfoForAdmin(repoIds, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var obj_ids = repoIds.map(function(repoid) { return new mongo.ObjectID(repoid); });

            db.collection("repos").find({_id: {$in : obj_ids}}, {Models :1 ,_id :0}).toArray(function(err, repos) {
                if (err) throw err;
                db.close();
                var modelArray = repos.map(function(repo){
                    return repo.Models;
                });

                callbackfunc(modelArray);

            });
        });
    }

	//function queryRepoAnalytics(repoId, callbackfunc, update){
		//if(update !== true){
			//update == false;
		//}
//
		//queryRepoInfo(repoId, function(repo){
//
			//var repoAnalytics = repo.RepoAnalytics;
			//if(!update){
				//console.log('Repo Analytics exist');
				//callbackfunc(repoAnalytics, repo);
			//} else
			//{
				//console.log('Repo Analytics doesn\'t exist');
				//				umlEvaluator.evaluateRepo(repo, function(){
					//console.log("evaluate repo finished");
				//});
////				repo.RepoAnalytics = repoAnalytics;
				//updateRepoInfo(repo, function(repoInfo){
					//if(callbackfunc !== null){
						//callbackfunc(repoInfo.RepoAnalytics, repo);
					//}
				//});
			//}
		//});
	//}

    /*
    shekhars: on model update, we see this error intermittently, not fixed yet,


    D:\git\UMLx\node_modules\mongodb\lib\utils.js:123
    process.nextTick(function() { throw err; });
                                  ^
    MongoError: Resulting document after update is larger than 16777216
        at Function.MongoError.create (D:\git\UMLx\node_modules\mongodb-core\lib\error.js:31:11)
        at toError (D:\git\UMLx\node_modules\mongodb\lib\utils.js:139:22)
        at D:\git\UMLx\node_modules\mongodb\lib\collection.js:1059:67
        at D:\git\UMLx\node_modules\mongodb-core\lib\connection\pool.js:469:18
        at _combinedTickCallback (internal/process/next_tick.js:67:7)
        at process._tickCallback (internal/process/next_tick.js:98:9)

    */

    function saveModelInfo(modelInfo, repoId, callbackfunc) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
//			console.log(modelInfo);
            var fs = require("fs");
            fs.writeFile('./temp/modelInfo1.json', JSON.stringify(modelInfo, null, 2) , 'utf-8');
            console.log(repoId);
            var o_id = new mongo.ObjectID(repoId);
            db.collection("repos").update({_id:o_id}, {$push: {Models: modelInfo}}, function(err, res) {
                if (err) throw err;
                console.log("1 record inserted");
                db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
            });
        });
    }

	//function updateRepoAnalytics(repoAnalytics, callbackfunc){
		//MongoClient.connect(url, function(err, db) {
			//if (err) throw err;
			//db.collection("repos").update({_id:new mongo.ObjectID(repoAnalytics._id)}, {$set:{RepoAnalytics: repoAnalytics}}, function(err, updateCount){
				//if(err) throw err;
				//db.close();
				//if(callbackfunc !== null){
					//callbackfunc(repoAnalytics);
				//}
			//});
		//});
	//}

    function deleteModel(repoId, modelId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
//			  console.log(modelInfo);
            var o_id = new mongo.ObjectID(repoId);
            db.collection("repos").update({_id:o_id}, {$pull: {'Models': {'_id': modelId}}}, function(err){
                if (err) {
                    console.log(err);
                    if(callbackfunc){
                        callbackfunc(false);
                    }
                    return;
                }

                if(callbackfunc){
                    callbackfunc(modelId, repoId);
                }

            });
        });
    }

    function deleteUseCase(repoId, modelId, useCaseId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
//			  console.log(modelInfo);
//			  var o_id = new mongo.ObjectID(repoId);
			  var modelQuery = getModelQuery(modelId, repoId);
			  db.collection("repos").update(modelQuery, {$pull: {'Models.$.useCases':{'_id':useCaseId}}}, function(err){
			      console.log("delete useCase");
				  if (err) {
			    	  console.log(err);
			    	  callbackfunc(false);
			    	  return;
			      }
				  queryModelInfo(modelId, repoId, function(modelInfo){
				 	 umlEvaluator.evaluateModel(modelInfo, function(){
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
  				    db.collection("repos").insertOne(repoInfo, function(err, result) {
  				    if (err) throw err;
  				    console.log("1 record inserted");
//init reqo information
  				    var repoId = repoInfo._id;
  				    repoInfo.Models = [];
  					repoInfo.OutputDir = "public/output/repo"+repoId;
  					repoInfo.AccessDir = "output/repo"+repoId;

  				    var o_id = new mongo.ObjectID(repoId);

                        db.collection("repos").update({_id:o_id}, repoInfo, function(){

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

    function newUserSignUp(email,username,pwd,isEnterprise ,enterpriseUserId,callback){

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

                    var userInfo = {"username" : username , "email" :email , "password" :pwd, "isEnterprise" : isEnterprise , "isActive" : true}
                    if(enterpriseUserId!=''){
                        userInfo.enterpriseUserId=  new mongo.ObjectID(enterpriseUserId);
                    }db.collection("users").insertOne(userInfo, function(err, result) {
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
                            callback(result);});
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
                	
                	if(data.isActive){
	            		console.log(data);
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
                	} else {
                		
                		 console.log('Your profile is no longer active. Please register again.');
                         db.close();
                         var result = {
                             success: false,
                             message: 'Your profile is no longer active. Please register again. ',
                         }
                         callback(result);
                		
                	}

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

    function saveSurveyData(surveyData){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var databaseCollectionName = "surveyData";
            db.collection(databaseCollectionName).insertOne(surveyData, function(err, result) {
                if (err) throw err;
                console.log("1 record inserted");
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
				  db.collection("users").findOne({_id:o_id, isActive : true}, {}, function(err, user) {
					if (err) throw err;
				    db.close();
				    	if(callbackfunc){callbackfunc(user);
				  }
			  });
			  }

        });

    }

    function queryRepoIdsForAdmin(userId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var o_id = new mongo.ObjectID(userId);
            db.collection("users").find(
                { enterpriseUserId:o_id , isActive: true}, { repoId: 1 , _id :0}).toArray( function (err,repoIds){
                if (err) throw err;
                db.close();
                var repoIdArray = repoIds.map(function(repo){
                    return repo.repoId;
                });

                callbackfunc(repoIdArray);
            });
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
			//			No need to make the populate the information. Alredy did it.
//modelInfoVersion._id = modelInfo._id;
			//modelInfoVersion.Name = modelInfo.Name;//copy the model identifier from the original model Info into the new model version, to be the new model info, which is the head of the model versions.
			//modelInfoVersion.ModelEmpirics = JSON.parse(JSON.stringify(modelInfo.ModelEmpirics)); //copy the model empirics from the older model version. User can update later.
			var oldVersions = modelInfo.Versions; //include the previous versions for the model file.
			if(!oldVersions){
				oldVersions = [];
			}
			delete modelInfo.Versions;
			delete modelInfo._id;
			delete modelInfo.Name;
			oldVersions.push(modelInfo);
			//remove the versions property for the old version. to avoid nesting problem.
			modelInfoVersion.Versions = oldVersions;
			//console.log(modelInfoVersion);
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
			olderVersion.Name = modelInfo.Name;
			//console.log(olderVersion);
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
	function initModelInfo(umlModelInfo, umlModelName, repoInfo){

		umlModelInfo._id = umlModelInfo.fileId + Date.now();
		if(!umlModelName || umlModelName === ''){
			umlModelName = umlModelInfo.fileId;
		}

        umlModelInfo.Name = umlModelName;
		umlModelInfo.OutputDir = repoInfo.OutputDir+"/"+umlModelInfo.fileId;
		umlModelInfo.AccessDir = repoInfo.AccessDir+"/" + umlModelInfo.fileId;

        return umlModelInfo;
    }

	function createModelInfoVersion(umlFileInfo, umlModelInfoBase){
		if(umlModelInfoBase){
			//reuse the umlFileInfo object.
			var umlModelInfoVersion = umlFileInfo;
			umlModelInfoVersion._id = umlModelInfoBase._id;
			umlModelInfoVersion.Name = umlModelInfoBase.Name;
			umlModelInfoVersion.OutputDir = umlModelInfoBase.OutputDir;
			umlModelInfoVersion.AccessDir = umlModelInfoBase.AccessDir;

			return umlModelInfoVersion;
		}

		return false;
	}

    // collect survey data analytic per page
    function saveSurveyAnalyticsData(uuid, clientIpAddress, pageNumber) {
	    if(uuid==""){
	        //fall back in case uuid is not generated on client end
            console.log("uuid was blank, adding uuid on server side");

            // TODO:  what should we do?? generate a new uuid on server or discard data or insert blank?
	        uuid = uuidv4();
        }
        data = {
            ip: clientIpAddress,
            pageNumber: pageNumber,
            uuid: uuid,
            timeStamp: new Date()
        }
        MongoClient.connect(url, function (err, db) {
            if(err==null){
                insertSurveyDoc(db, data, function () {
                    db.close();
                });
            }else{
                console.log("fail");
            }
        });
    }



    var insertSurveyDoc = function(db, data, callback) {
        db.collection('client_analytics').insertOne(data, function(err, result){
            if(err==null){
                console.log("insertion complete "  + JSON.stringify(data));
            }else{
                console.log("error in inserting" + JSON.stringify(data));
            }
        })
    };


	//TODO add parameters for specific records
    function getSurveyData(callback){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var schemaName = "surveyData";
            db.collection(schemaName).find().toArray(function(err, records) {
                if (err) throw err;
                db.close();
                if(callback){
                    callback(records);
                }
                console.log(records)
            });

        });
    };

    // function getAllData(schemaName, callback){
    //     MongoClient.connect(url, function(err, db) {
    //         if (err) throw err;
    //         db.collection(schemaName).find().toArray(function(err, records) {
    //             if (err) throw err;
    //             db.close();
    //             if(callback){
    //                 callback(records);
    //             }
    //         });
    //     });
    // }

    // function getAllData(schemaName, callback) {
    //     var doc = null;
    //     MongoClient.connect(url)
    //         .then(function(err, db){
    //             if(err) throw err;
    //             db.collection(schemaName).find()
    //         })
    //         .then(function(cursor){
    //             console.log(cursor)
    //         })
    // }

    // function collectInfo(err, data){
    //     return data;
    // }
    //

	function duplicateModelInfo(umlModelInfo){
		if(umlModelInfo){
			var umlFileInfo = umlFileManager.duplicateUMLFileInfo(umlModelInfo);
			umlFileInfo._id = umlModelInfo._id;
			umlFileInfo.Name = umlModelInfo.Name;
			umlFileInfo.Outputdir = umlModelInfo.OutputDir;
			umlFileInfo.AccessDir = umlModelInfo.AccessDir;
			return umlFileInfo;
		}

		return false;
	}

	module.exports = {
		setupRepoStorage : function(callbackfunc) {
			// Connect to the db
			MongoClient.connect(url, function(err, db) {
				if (err) throw err;
			  db.createCollection('repos', function(err, collection) {
				  db.createCollection('users', function(err, collection) {
					  db.createCollection('surveys', function(err, collection) {
				    console.log("Table created!");
				    db.close();
				    callbackfunc();
			  });});
			  });

				});
			},
			createRepo: createRepo,

			//queryModelAnalytics: queryModelAnalytics,
			queryModelInfo: queryModelInfo,
			deleteModelInfo : function(repoId, modelInfo) {

		},
		updateUseCaseInfo: updateUseCaseInfo,
		saveModelInfo : saveModelInfo,
		queryRepoInfo : queryRepoInfo,
		queryUseCaseInfo: queryUseCaseInfo,
		//queryUseCaseAnalytics: function(repoId, modelId, useCaseId, callbackfunc){
			//queryUseCaseInfo(repoId, modelId, useCaseId, function(useCaseInfo){
				//var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
				//if(useCaseAnalytics !== undefined){
					//console.log("useCase analytics defined");
					//if(callbackfunc !== undefined){
						//callbackfunc(useCaseAnalytics, useCaseInfo);
					//}
				//}
				//else{
					//console.log("useCase analytics undefined");
//
					//useCaseAnalytics = umlEvaluator.evaluateUseCase(useCaseInfo, function(){
						//console.log("useCase analysis is finished");
					//});
					//useCaseInfo.UseCaseAnalytics = useCaseAnalytics;
					//updateUseCaseInfo(repoId, modelId, useCaseInfo, function(useCaseInfo){
////						console.log(useCaseAnalytics);
						//if(callbackfunc !== undefined){
							//callbackfunc(useCaseInfo.UseCaseAnalytics, useCaseInfo);
						//}
					//});
				//}
			//});
		//},
		clearDB: function(callbackfunc){
			MongoClient.connect(url, function(err, db) {
				  if (err) throw err;
				  db.dropDatabase(function(err, result) {
				    if (err) throw err;
				    if (result) console.log("Datbase is deleted");
				    db.close();
				if(db){    callbackfunc();
				  }
				});
			});
},
		// this method will reanalyse the models in the repo entirely. Can be used when there is a change in the schema of repo_info_schema.
		reloadRepo: function(repo, callback){
			//create a replica of the existing repo.
			var newRepo = {
					_id:repo._id,
					Models: [],
					OutputDir: repo.OutputDir,
					AccessDir: repo.AccessDir
			};

			function reloadModel(modelInfo){
				//update model analytics.
//				console.log(modelInfo);
				return new Promise((resolve, reject) => {
					umlModelAnalyzer.extractModelInfo(modelInfo, function(modelInfo){
					umlEvaluator.evaluateModel(modelInfo, function(modelInfo){
						console.log("model analysis complete");
//						console.log(modelInfo);
//						umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){
								if(err){
									reject(err);
									return;
								}
								resolve();
//						});
					});
					});
				  });
			}

		let chain = Promise.resolve();

			for (var i in repo.Models) { //for multiple files
			    (function(model) {
			    	//create duplicate of the existing model.
			    	var newModel = duplicateModelInfo(model);
			    	newRepo.Models.push(newModel);
//umlModelAnalyzer.extractModelInfo(newModel, modelReloadProcessor);
			    chain = chain.then(reloadModel(newModel));
			    })(repo.Models[i]);
			}

		chain.then(function(){
				umlEvaluator.evaluateRepo(repo, function(repo){
					console.log("model analysis complete");
//					console.log(modelInfo);
//					umlModelInfoManager.updateModelInfo(modelInfo, repoId, function(modelInfo){

					if(callbackfunc){
						callbackfunc(repo);
					}
//						});
				});

			}).catch(function(err){
				console.log(err);
				if(callbackfunc){
					callbackfunc(false);
				}
			});
		},updateModelInfo: updateModelInfo,
		updateRepoInfo: updateRepoInfo,
		//queryRepoAnalytics: queryRepoAnalytics,
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
		initModelInfo: initModelInfo, //create model infocreateModelInfoVersion: createModelInfoVersion,
        newUserSignUp : newUserSignUp,
        validateUserLogin : validateUserLogin,
        queryUserInfo: queryUserInfo,
        queryRepoIdsForAdmin:queryRepoIdsForAdmin,
        queryRepoInfoForAdmin:queryRepoInfoForAdmin,
        saveSurveyData: saveSurveyData,
        saveSurveyAnalyticsData: saveSurveyAnalyticsData,
        getSurveyData: getSurveyData,
        deleteUser: deleteUser,
        deactivateUser:deactivateUser

    }

}())