(function() {
    // Retrieve
    var mongo = require('mongodb');
    var MongoClient = mongo.MongoClient;
    var umlModelExtractor = require("./UMLModelExtractor.js");
    var umlEvaluator = require("./UMLEvaluator.js");
	var url = "mongodb://127.0.0.1:27017/repo_info_schema";
    var umlFileManager = require("./UMLFileManager.js");
    var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
    var config = require('./config'); // get our config file
    const uuidv4 = require('uuid/v4');

    var GitHubApi = require('@octokit/rest')       
            
        var github = new GitHubApi({        
        }); 
    
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

    //  var asyncToSync = getCommitsForRepo(name,owner);        
            
        function getCommitsForRepo(name,owner) {        
            var sync = true;        
            var result = null;      
            github.repos.getCommits({       
                  owner: owner,     
                  repo: name,       
            }, function (err, res2) {       
                if(err)     
                    result =0;      
                else{       
                    result = res2.data.length;      
                }       
                sync = false;       
            });     
            while(sync) {require('deasync').sleep(100);}        
            return result;      
        }       
                
                
        function saveGitInfo(email, userId, callbackfunc){      
                    
            github.search.users({       
                  q: email+' in:email'      
                }, function (err, res) {        
                  if (err) throw err        
                        
                  if(res && res.data.items.length > 0){     
                      var userName = res.data.items[0].login;       
                            
                      github.repos.getForUser({     
                          username: userName        
                        }, function (err, res1) {       
                          if (err) throw err        
                                
                          var repoData =[];     
                          if(res1 && res1.data.length > 0){     
                                    
                              var repos = res1.data;        
                              repoData= repos.map(function(repo, index){        
                                 return {name : repo.name, owner : repo.owner.login, html_url : repo.html_url}      
                              });       
                                    
                          }     
                                
                          if(repoData.length > 0){      
                              for(var index in repoData){       
                                  repoData[index].commits =  getCommitsForRepo(repoData[index].name,repoData[index].owner);     
                              }     
                          }     
                                
                            var userRepoInfo = {};      
                            MongoClient.connect(url, function(err, db) {        
                                if (err) throw err;     
                                db.collection("gitdata").insertOne(userRepoInfo, function(err, result) {        
                                   if (err) throw err;      
                                        
                                    var userRepoInfoId = userRepoInfo._id;      
                                    userRepoInfo.userId = userId;       
                                    userRepoInfo.gitUserName  = userName;       
                                    userRepoInfo.repoData = repoData;       
                
                                    var o_id = new mongo.ObjectID(userRepoInfoId);      
                
                                    db.collection("gitdata").update({_id:o_id}, userRepoInfo, function(err,updateCnt){      
                                                
                                        if (err) throw err;     
                                        db.close();     
                                        callbackfunc(true, 'Git Info Saved');       
                
                                    });     
                
                                });     
                        });     
                        });     
                  } else {      
                            
                      callbackfunc(false, 'Could not find user');       
                  }     
                        
            });     
                    
                    
        }
        
        
function queryTempRepoInfo(callbackfunc){
	
	var tempRepoIDStorePath = "./tempRepoIDStore";
	
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;    
	var createTempRepo = function(callbackfunc){
		var repoInfo = {};
	    db.collection("repos").insertOne(repoInfo, function(err, result) {
	    if (err) throw err;
	    console.log("1 record inserted");
//init reqo information

	    var repoId = repoInfo._id;

	    repoInfo  = initRepoEntity(repoId);

	    var o_id = new mongo.ObjectID(repoId);

         db.collection("repos").update({_id:o_id}, repoInfo, function(){
        	 
        	 
        	 umlFileManager.writeFile(tempRepoIDStorePath, repoInfo._id, function(path){
        		 	if(callbackfunc){
        		 		callbackfunc(repoInfo._id);
        		 	}
        	 })

         });

     });
	}
	
	umlFileManager.readFile(tempRepoIDStorePath, function(tempRepoID){
		if(!tempRepoID){
			createTempRepo(function(tempRepoID){
				queryRepoInfo(tempRepoID, function(repoInfo){
					if(callbackfunc){
						callbackfunc(repoInfo);
					}
				});
			})
		}
		else{
			queryRepoInfo(tempRepoID, function(repoInfo){
			if(callbackfunc){
				callbackfunc(repoInfo);
			}
		});
		}
	
	});
	});
}
	
function deleteRepo(repoId, callbackfunc) {  
  var modelQuery = {repo_id: mongo.ObjectID(repoId)};        
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;     
    db.collection("modelInfo").findOne(modelQuery,function(err,repo){
      if (err) throw err;   
      if(repo){
        var modelId = repo._id ;           
        db.collection('domainModelInfo').remove({model_id: mongo.ObjectID(modelId)}, function(err) {
          if (err) {
            console.log(err);
            if(callbackfunc){
              callbackfunc(false);
            }
            return;
          }

          db.collection('useCaseInfo').remove({model_id: mongo.ObjectID(modelId)}, function(err) {
            if (err) {
              console.log(err);
              if(callbackfunc){
                callbackfunc(false);
              }
              return;
            }                                           

            db.collection('modelInfo').remove({_id: mongo.ObjectID(modelId)}, function(err) {
              if (err) {
                console.log(err);
                if(callbackfunc){
                  callbackfunc(false);
                }
                return;
              }
              db.collection('repos').remove({_id: mongo.ObjectID(repoId)}, function(err) {
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
          });
      });
     }   
   });
  });   
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
            
            var domainObject = modelInfo.DomainModel;
            var useCaseArray = modelInfo.UseCases;
            
            //removing domainModel and UseCase object from the model object 
            delete modelInfo.DomainModel;
            delete modelInfo.UseCases;
            
            
            //console.log(modelInfo._id);
//            modelInfo._id = new mongo.ObjectId(modelInfo._id);
            
            //adding repo_id as an element in modelInfo
            modelInfo.repo_id = new mongo.ObjectId(repoId);
            
            
//            db.collection("modelInfo").update({"_id": mongo.ObjectId(modelInfo._id)}, modelInfo, function(err, res) {

            db.collection("modelInfo").update({"_id": modelInfo._id}, modelInfo, function(err, res) {
                if (err) throw err;
                console.log("updating modelInfo");
                         
            });
            
          if(domainObject){

//          domainObject.model_id = new mongo.ObjectId(modelInfo._id);
          domainObject.model_id = modelInfo._id;
//          domainObject._id = "domainModel["+modelInfo
          
            //updating domainModelInfo to add model_id element
//            db.collection("domainModelInfo").update({"model_id": mongo.ObjectId(modelInfo._id)}, domainObject, function(err, res) {
            db.collection("domainModelInfo").update({"model_id": modelInfo._id}, domainObject, function(err, res) {
                 
            if (err) throw err;
                console.log("updating domainModelInfo");
                         
            });
            
            }
            
            //updating useCaseInfo to add model_id element
            /*db.collection("useCaseInfo").update({"model_id": mongo.ObjectId(modelInfo._id)}, {$set : {useCaseArray}}, {multi:true}, function(err, res) {
                if (err) throw err;
                    console.log("updating useCaseInfo");
                    
              });*/
            console.log(modelInfo._id);
             for(var i in useCaseArray){
                useCaseArray[i].model_id = modelInfo._id;
                console.log("USe Case: "+i+" ID: "+ useCaseArray[i]._id);
                //deleteUseCase(repoId, modelInfo._id, useCaseArray[i]._id);
                db.collection("useCaseInfo").remove({_id: useCaseArray[i]._id}, function(err, res) 
                {
                    //if (err) throw err;
                        console.log("Use Case deleted");
                    });
                
                //console.log("Use Case Info: "+ useCaseArray[i].Name);
                
                db.collection("useCaseInfo").insertOne(useCaseArray[i], function(err, res) 
                {
                    if (err) throw err;
                    //console.log("Use Case deleted");
                        console.log("use case Inserted");
                });
                        
                //console.log("Ending loop: "+ i);
                /*db.collection("useCaseInfo").update({"_id": useCaseArray[i]._id}, useCaseArray[i] , function(err, res) {
                if (err) throw err;
                    console.log("updating useCaseInfo");
              });*/
            }
            
//            db.collection('useCaseInfo').remove({model_id: modelInfo._id}, function(err) {
//                if (err) {
//                  console.log(err);
//                  if(callbackfunc){
//                    callbackfunc(false);
//                  }
//                  return;
//                }
//                
//                db.collection("useCaseInfo").insertMany(useCaseArray, function(err, res)
//                        {
//                            if (err) throw err;
//                                console.log("useCaseInfo 1 record inserted");
//                                
//                        });
//                
//                
//            });
            
             db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
        });         
    }

    function updateRepoInfo(repo, callbackfunc){
        console.log(repo);
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            var modelArray = repo.Models;
            repo._id = mongo.ObjectId(repo._id);
            
            delete repo.Models;
            //delete repo.DomainModel;
            //delete repo.UseCases;
            
            db.collection("repos").update({_id: repo._id}, repo, function(err, updateCount){
                if(err) throw err;
                db.close();
                if(callbackfunc){
                    callbackfunc("updating repoInfo");
                }
            });
          
            for(var i in modelArray){
                updateModelInfo(modelArray[i],repo._id , function(){
                    console.log("Update Model Info Finished");
                });
            }

        });
    }
    
    
    function updateRepoInfoOnly(repo, callbackfunc){
    	
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

            if(!modelInfo){
                console.log("No corresponding modelInfo can be found!!!");
                if(callbackfunc){
                    callbackfunc(false);
                }
                return;
            }

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
	
    //testing queryModelInfo
    // queryModelInfo("5a8fab8f91d51f915e5c29ae", "5a8e109c13a5974144158d99", function(result){
    //  console.log(result);
    // });

    function saveModelInfoCharacteristics (characteristicsInfo,callbackfunc){
    	MongoClient.connect(url, function(err, db)
   	            {
    		
    		MongoClient.connect(url, function(err, db)
    				   	            {
    			   if (err) throw err;
      	            
    			   db.collection('modelInfo').update( { "_id" : characteristicsInfo.modelID },
       	        		{$set: {  
       	        			"projectInfo.distributedSystem" : characteristicsInfo['distributed_system'],
       	        			"projectInfo.responseTime" : characteristicsInfo['response_time'],
       	        			"projectInfo.endUserEfficiency" : characteristicsInfo['end_user_efficiency'],
       	        			"projectInfo.complexInternalProcessing" : characteristicsInfo['complex_internal_processing'],
       	        			"projectInfo.codeReusable" : characteristicsInfo['code_must_be_reusable'],
       	        			"projectInfo.easyInstall" : characteristicsInfo['easy_to_install'],
       	        			"projectInfo.easyUse" : characteristicsInfo['easy_to_use'],
       	        			"projectInfo.portable" : characteristicsInfo['portable'],
       	        			"projectInfo.easyToChange" : characteristicsInfo['easy_to_change'],
       	        			"projectInfo.concurrent" : characteristicsInfo['concurrent'],
       	        			"projectInfo.specialSecurityObjectives" : characteristicsInfo['includes_special_security_objectives'],
       	        			"projectInfo.directAccessForThirdParties" : characteristicsInfo['provides_direct_access_for_third_parties'],
       	        			"projectInfo.userTrainingFacilitiesRequired" : characteristicsInfo['special_user_training_facilities_are_required'],
       	        			"projectInfo.familiarWithProjectModel" : characteristicsInfo['familiar_with_the_project_model_that_is_used'],
       	        			"projectInfo.applicationExperience" : characteristicsInfo['application_experience'],
       	        			"projectInfo.objectOrientedExperience" : characteristicsInfo['object_oriented_experience'],
       	        			"projectInfo.leadAnalystCapability" : characteristicsInfo['lead_analyst_capability'],
       	        			"projectInfo.motivation" : characteristicsInfo['motivation'],
       	        			"projectInfo.stableRequirements" : characteristicsInfo['stable_requirements'],
       	        			"projectInfo.partTimeStaff" : characteristicsInfo['part_time_staff'],
       	        			"projectInfo.difficultProgrammingLanguage" : characteristicsInfo['difficult_programming_language']     	        	
       	        	   		  }},
       	        		   { upsert: true }, function(err, res){
       	        			if (err) {
       	    	                console.log(err);   	                   	                
       	    	              }
       	        				db.close();
    	                      if(callbackfunc !== null)
    	                      {
    	                              callbackfunc(res);
    	                      }
       	        			
       	        		   } );

    				   	         });
   	         });
    }
    
    function saveEstimation (estimationInfo, callbackfunc) {
   	 MongoClient.connect(url, function(err, db)
   	            {
   	                if (err) throw err;
   	                db.collection("estimates").insertOne(estimationInfo, function(err, res) 
   	                		{
   			                  if (err) throw err;
   			                      console.log("estimates record inserted");
   			
   			                      db.close();
   			                      if(callbackfunc !== null)
   			                      {
   			                              callbackfunc(estimationInfo);
   			                      }
     
   	                		});
   	            });
   }
    
    
    function queryModelInfo(modelId, repoId, callbackfunc){
        MongoClient.connect(url, function (err, db) {

            if (err) throw err;
            //var modelQuery = getModelQuery(modelId,repoId);
            //var projections = getModelQueryProjections(modelId, repoId);
            db.collection("modelInfo").aggregate([
                  {
                      "$match":
                      {
                          "_id": modelId
                      }
                  },

                 {
                     "$lookup": {
                         "from": "domainModelInfo",
                         "localField": "_id",
                         "foreignField": "model_id",
                         "as": "DomainModels"
                     }
                 },
                 {
                     "$lookup": {
                         "from": "useCaseInfo",
                         "localField": "_id",
                         "foreignField": "model_id",
                         "as": "UseCases"
                     }
                 },
                  {
                      "$unwind": "$UseCases"
                  },
                  //{ "$out": "newInfor" }
              ]).toArray(function (err, result) {
                  if (err) throw err;
                  db.close();

                console.log("---------------modelInfoStart----------------");
                  //restore the ids

                //TODO: what should be returned if the result is undefined

                var modelInfo = result[0];

                if (result) {
                    var arr = [];
                    result.forEach(function (element) {
                        arr.push(element.UseCases);
                    });

                    modelInfo.UseCases = arr;
                    for (var i in modelInfo.UseCases) {
                        var useCase = modelInfo.UseCases[i];
                        if (useCase) {
                            useCase._id = useCase._id.replace(/\[.*\]/g, "");
                        }
                    }

                    if (modelInfo.DomainModels) {
                        var domainModel = modelInfo.DomainModels[0];
                        delete modelInfo.DomainModels;
                        delete domainModel._id;
                        modelInfo.DomainModel = domainModel;
                    }
                    console.log("---------------modelInfo----------------");
                    //console.log(modelInfo);
                }

                callbackfunc(modelInfo);

              });              
        });
    }
    
	/*queryRepoInfo("5a8e109c13a5974144158d99", function(result)
    {
         console.log(result);
    })*/
	
   
    function queryRepoFromUser(userId, callbackfunc){
        MongoClient.connect(url, function(err, db){
            if(err) throw err;
            
            var userID = mongo.ObjectID(userId);
            
            db.collection("users").aggregate([
                {
                    "$lookup":
                    {
                        "from": "repos",
                        "localField": "repoId",
                        "foreignField": "_id",
                        "as": "Repos"
                    }
                }
            ], function(err, result)
            {
               if(err) throw err;
                console.log("Result RepoID: "+ result[0].Repos[0]._id);
                db.close();
                callbackfunc(result[0]);
            });
        });
    }
	
	
    function queryRepoInfo(repoId, callbackfunc)
    {
        MongoClient.connect(url, function(err, db)
        {
			
            if (err) throw err;
           
//            var repoid=new mongo.ObjectID(repoId);

			
           
            db.collection("repos").aggregate([{
				"$match":
				{
				   "_id":new mongo.ObjectID(repoId)
				}
			},
               { 	
                    "$lookup":
                    {
                        "from": "modelInfo",
                        "localField": "_id",
                        "foreignField": "repo_id",
                        "as": "Models"
                    }
                }
            ], function(err, result) 
            {
                db.close();

            	if (err){
            	   console.log(err)
            	   if(callbackfunc){
            		   callbackfunc(false);
            	   }
            	   return;
               }
//               console.log("*******Shown result for queryRepoInfo*******");
//			   console.log(result[0]);
//               console.log("*******Shown result for ModelInfo*******");               

               // result[0].UnusedModels = [];

               callbackfunc(result[0]);
            });
		});
	}
    
    /*
     * cannot use aggregation since the issue with 16mb limit
     */
    
//    function queryFullRepoInfo(repoId, callbackfunc)
//    {
//        MongoClient.connect(url, function(err, db)
//        {
//
//            if (err) throw err;
//            var repo_id = new mongo.ObjectID(repoId);
//
//       	 db.collection("repos").findOne({_id: repo_id}, function(err, repoInfo) {
// 			 console.log(repoInfo);
// 			if (err) throw err;
//
// 			if(!repoInfo){
// 				callbackfunc(false);
// 				return;
// 			}
//
//
//            db.collection("modelInfo").aggregate([
//            	{
//    				"$match":
//    				{
//    				   "repo_id":repo_id
//    				}
//    			},
//
//               {
//                   "$lookup": {
//                       "from": "domainModelInfo",
//                       "localField": "_id",
//                       "foreignField": "model_id",
//                       "as": "DomainModels"
//                   }
//               },
//               {
//                   "$lookup": {
//                       "from": "useCaseInfo",
//                       "localField": "_id",
//                       "foreignField": "model_id",
//                       "as": "UseCases"
//                   }
//               },
//               {
//                   "$unwind": '$UseCases'
//               }
//
//            ]).toArray(function(err, result) {
//                 if (err) throw err;
//                 console.log("*******Shown result for ModelInfo*******");
//                 db.close();
// //
//                 repoInfo.Models = [];
// //               restore the ids
//
//                 var modelInfo = result[0];
//                 var arr = [];
//                 result.forEach(function (element) {
//                     arr.push(element.UseCases);
//                 });
//
//                 modelInfo.UseCases = arr;
//                 for (var i in modelInfo.UseCases) {
//                     var useCase = modelInfo.UseCases[i];
//                     if (useCase) {
//                         useCase._id = useCase._id.replace(/\[.*\]/g, "");
//                     }
//                 }
//
//                for(var i in result){
//                    var modelInfo = result[i];
//                    for(var i in modelInfo.UseCases){
//                        var useCase = modelInfo.UseCases[i];
//                        if(useCase){
//                            useCase._id = useCase._id.replace(/\[.*\]/g, "");
//                        }
//                    }
//
//                    console.log("queried model info");
//                    console.log(modelInfo);
//
// //               var domainModel = modelInfo.DomainModels[0];
//                    if(modelInfo.DomainModels && modelInfo.DomainModels[0]){
//                        domainModel = modelInfo.DomainModels[0];
//                        delete domainModel._id;
//                        delete modelInfo.DomainModels;
//                        modelInfo.DomainModel = domainModel;
//                    }
//
//                    repoInfo.Models.push(modelInfo);
//                }
//
//                callbackfunc(repoInfo);
//            });
//       	 });
// 		});
// 	}


    function queryFullRepoInfo(repoId, callbackfunc)
    {
        MongoClient.connect(url, function(err, db)
        {

            if (err) throw err;
            var repo_id = new mongo.ObjectID(repoId);

            queryRepoInfo(repoId, function(repoInfo) {
                console.log(repoInfo);
                if (err) throw err;

                if(!repoInfo){
                    callbackfunc(false);
                    return;
                }

                //use promise to construct the repo objects
                function loadModel(model_id, repoInfo){
                    return new Promise((resolve, reject) => {

                        db.collection("modelInfo").aggregate([
                            {
                                "$match":
                                    {
                                        "_id": model_id
                                    }
                            },

                            {
                                "$lookup": {
                                    "from": "domainModelInfo",
                                    "localField": "_id",
                                    "foreignField": "model_id",
                                    "as": "DomainModels"
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "useCaseInfo",
                                    "localField": "_id",
                                    "foreignField": "model_id",
                                    "as": "UseCases"
                                }
                            },
                            {
                                "$unwind": "$UseCases"
                            },
                            //{ "$out": "newInfor" }
                        ]).toArray(function (err, result) {
                            if (err) throw err;
                            db.close();

                            //restore the ids
                            var modelInfo = result[0];
                            var arr = [];
                            result.forEach(function (element) {
                                arr.push(element.UseCases);
                            });

                            modelInfo.UseCases = arr;
                            for (var i in modelInfo.UseCases) {
                                var useCase = modelInfo.UseCases[i];
                                if (useCase) {
                                    useCase._id = useCase._id.replace(/\[.*\]/g, "");
                                }
                            }

                            if (modelInfo.DomainModels) {
                                var domainModel = modelInfo.DomainModels[0];
                                if(domainModel){
                                delete modelInfo.DomainModels;
                                delete domainModel._id;
                                modelInfo.DomainModel = domainModel;
                                }
                            }

                            repoInfo.UnfoldedModels.push(modelInfo);

                            resolve();
                            //console.log(modelInfo);

                        });

                    });
                }

                repoInfo.UnfoldedModels = [];

                return Promise.all(repoInfo.Models.map(model=>{
                    return loadModel(model._id,repoInfo);
                })).then(
                    function(){
                        return new Promise((resolve, reject) => {
                            setTimeout(function(){

                                repoInfo.Models = repoInfo.UnfoldedModels;
                                delete repoInfo.UnfoldedModels;

                                if(callbackfunc){

                                    callbackfunc(repoInfo);
                                }

                                resolve();

                            }, 0);
                        });
                    }

                ).catch(function(err){
                    console.log(err);
                    if(callbackfunc){
                        callbackfunc(false);
                    }
                });

            });
        });
    }


	//testing queryRepoInfoByPage 
    /*queryRepoInfoByPage("5a8e109c13a5974144158d99", 1,1,function(result)
    {
        console.log(result);
    })*/
	function queryRepoInfoByPage(repoId, stepParameter, pageParameter,callbackfunc)
    {
        //console.log("res"+stepParameter*pageParameter)
        MongoClient.connect(url, function(err, db) 
		{
			if (err) throw err;
			
			var repoid=new mongo.ObjectID(repoId);
			
			console.log(repoId);

			 db.collection("repos").findOne({_id: repoid}, function(err, repoInfo) {
				 console.log(repoInfo);
				if (err) throw err;
				
				if(!repoInfo){
					callbackfunc(false);
					return;
				}
                 var dt = new Date();
                 var today=dt.getFullYear() + '/' + (((dt.getMonth() + 1) < 10) ? '0' : '') +
                     (dt.getMonth() + 1) + '/' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();

                         db.collection("modelInfo").aggregate([
                             {
                                 "$match":
                                     {
                                         "repo_id":new mongo.ObjectID(repoid)
                                     }
                             },
                             {
                                 $skip: pageParameter
                             }, // pagination skip
                             {
                                 $limit: stepParameter
                             }
                         ],function(err, result)
                         {
                             if (err) throw err;
                             //console.log("*******Shown result for queryRepoInfoByPage*******");
                             db.close();
                             repoInfo.Models = result;
                             console.log(repoInfo);
                             callbackfunc(repoInfo);
                         });
				});
			    	
		  });
			
	}

	function queryAllModelBrief(repoId, callbackfunc){
	    MongoClient.connect(url, function(err, db){

	        db.collection("modelInfo").find({repo_id: new mongo.ObjectID(repoId)}).toArray(function(err, models){
	            if (err) throw err;
                var resultForRepoInfo = {NT: 0, UseCaseNum: 0, EntityNum: 0};

	            for(element of models) {
                    resultForRepoInfo.NT += element['TransactionAnalytics']['NT'];
                    resultForRepoInfo.UseCaseNum += element['ComponentAnalytics']['UseCaseNum'];
                    resultForRepoInfo.EntityNum += element['ComponentAnalytics']['EntityNum'];
                }
                callbackfunc(resultForRepoInfo);
	            db.close();
            });
        });
    }
	
	function queryAllModelNames(repoId, callbackfunc){
	    MongoClient.connect(url, function(err, db){

	        db.collection("modelInfo").find({repo_id: new mongo.ObjectID(repoId)}).toArray(function(err, models){
	            if (err) throw err;
                var resultForRepoInfo = {NT: 0, UseCaseNum: 0, EntityNum: 0};
                var names = [];

	            for(model of models) {
                    names.push(model.Name);
                }
                callbackfunc(names);
	            db.close();
            });
        });
    }

	
	function queryModelNumByRepoID(repoId, callbackfunc){
		MongoClient.connect(url, function(err, db) 
				{
					if (err) throw err;
		 db.collection("modelInfo").find({repo_id: new mongo.ObjectID(repoId)}).toArray(function(err, repos) {
             if (err) throw err;
             db.close();

             callbackfunc(repos.length);

         });
				});
		
	}
	
	/*requestRepoBrief("5a8e109c13a5974144158d99",function(result)
    {
        console.log(result);
    })*/
	function requestRepoBrief(repoId,callbackfunc)
	{
		MongoClient.connect(url, function(err, db) 
		{
			if (err) throw err;
			
			var repoid=new mongo.ObjectID(repoId);
					
			db.collection("modelInfo").find(
			{
				repo_id:repoid
			},
			{
				TransactionAnalytics:1,ComponentAnalytics:1,_id:0
			}).toArray(
			function(err, result)
			{
			    console.log('=================result=========');
			    console.log(result);
                console.log('=================result=========');
			   if (err)
				   {
				   throw err;
				   return;
				   }
			   
			   if(result.length === 0){
				   callbackfunc({
					   NT: 0,
					   UseCaseNum: 0,
					   EntityNum: 0,
					   timestamp: "0000/00/00",
                       projectNum: 0
				   });
			   }
			   else
			   {
				    var dt = new Date();
					var today=dt.getFullYear() + '/' + (((dt.getMonth() + 1) < 10) ? '0' : '') + (dt.getMonth() + 1) + '/' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();
				   
				   
				   
				   db.collection('noOfTransactions').findOne({'timestamp':today})
					.then(function(doc) 
					{
						if(doc)
						{
						    db.collection('noOfTransactions').find(
                                {
                                    repo_id:repoid
                                },
                                {
                                    NT:1,UseCaseNum:1,EntityNum:1,timestamp:1,projectNum:1,_id:0
                                }
                            ).toArray(function (err, result) {
                                if (err) throw err;
                                var response = {NT:[], UseCaseNum:[], EntityNum:[], timestamp:[],projectNum:[]};

                                result.forEach(function (element) {
                                    response.NT.push(element.NT);
                                    response.UseCaseNum.push(element.UseCaseNum);
                                    response.EntityNum.push(element.EntityNum);
                                    response.timestamp.push(element.timestamp);
                                    if (!element.projectNum) {
                                        response.projectNum.push(0);
                                    }
                                    else {
                                        response.projectNum.push(element.projectNum);
                                    }
                                });

                                console.log("Record exists");
                                console.log(response);
                                console.log('=============');
                                callbackfunc(response);
                                db.close();
                            })
						}
							
					    //throw new Error('No record found.');
						//console.log(doc);//else case
						
						else
						{
							console.log("Record does not exist");
							for(i=0;i<result.length;i++)
						   {
							   
							   var sum_nt=0;
							   var sum_useCase=0;
							   var sum_entityNum=0;
							   for(i=0;i<result.length;i++)
							   {
									sum_nt+=result[i]['TransactionAnalytics']['NT'];
									sum_useCase+=result[i]['ComponentAnalytics']['UseCaseNum'];
									sum_entityNum+=result[i]['ComponentAnalytics']['EntityNum'];
							   }
								//console.log("sum_nt"+sum_nt);
						  
							  var dt = new Date();
							  var today=dt.getFullYear() + '/' + (((dt.getMonth() + 1) < 10) ? '0' : '') + (dt.getMonth() + 1) + '/' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();
							  
							  
							  //record={repo_id:repoid,NT:sum_nt,timestamp:today.getDate()}
							  
							  record={repo_id:repoid,NT:sum_nt,UseCaseNum:sum_useCase,EntityNum:sum_entityNum,
                                  timestamp:today,projectNum:result.length};
							  db.collection("noOfTransactions").insertOne(record, function(err, res) 
							  {
									if (err) throw err;
									//console.log("*******Shown result for ModelInfo*******");
									db.close();
									callbackfunc(record);
									console.log("1 document inserted");
									
							  });
						   //callbackfunc(result);
						   
							}	
						}
						
					});
				}
			});
		});
	}
	
	
    function getGitData(userId, callbackfunc){      
                    
                    
             MongoClient.connect(url, function(err, db) {       
                 if (err) throw err;        
                        
                 var userQuery = {userId: userId };     
                 db.collection("gitdata").findOne(userQuery,function(err,gitData){      
                  if (err) throw err;       
                        
                  if(gitData){      
                      callbackfunc(gitData.repoData,true,'found the git Data');     
                  } else {      
                      callbackfunc(null ,false,'cannot find the git Data');     
                  }     
                        
                 });        
             });        
                    
        }
    
    function queryUseCaseInfo(repoId, modelId, useCaseId, callbackfunc){
    	console.log(useCaseId);
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                useCaseId = useCaseId+"["+modelId+"]";
                console.log(useCaseId);

//    			useCaseId = "EAID_B5CA8145_00A3_4541_8183_087F17CB8A75";
//    			useCaseId = "EAID_1AF6160E_2CA8_4c81_AC39_80214CC3DFFF[7c18071493716169cab08bcb5d96e1401524045385596]";
//    				  var o_id = new mongo.ObjectID(useCaseId);
    				  db.collection("useCaseInfo").findOne({_id:useCaseId}, function(err, useCase) {
    					  console.log("use case Info");
    					 console.log(useCase);
    					if (err) throw err;
    				    db.close();
    				    	if(callbackfunc){
    				    		if(useCase){
    				    		useCase._id = useCase._id.replace(/\[.*\]/g, "");
    				    		}
    				    		callbackfunc(useCase);
    				  }
    			  });

            });

    }


//    function queryUseCaseInfo(repoId, modelId, useCaseId, callbackfunc){
//        console.log("use case id: "+useCaseId);
//        console.log("model id:"+modelId);
//        MongoClient.connect(url, function(err, db) {
//            if (err) throw err;
//            db.collection("repos").aggregate([
//                {
//                    '$match':{
//                        '_id':new mongo.ObjectID(repoId),
//                        'Models._id':modelId,
//                        'Models.UseCases._id': useCaseId
//                    }
//                },
//                {
//                    '$unwind':'$Models'
//                },
//                {
//                    '$unwind':'$Models.UseCases'
//                },
//                {
//                    '$match':{
//                        '_id':new mongo.ObjectID(repoId),
//                        'Models._id':modelId,
//                        'Models.UseCases._id': useCaseId
//                    }
//                },
//                {
//                    '$project': {
//                        "UseCases":"$Models.UseCases"
//                    }
//                }
//            ], function(err, result){
//                if (err) throw err;
//                db.close();
//                console.log("test the use case query");
//                console.log(result);
//                callbackfunc(result[0]['UseCases']);
//            });
//        });
//    }


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
//    var modelInfo = {
//        _id: new mongo.ObjectID("5a8fab8f91d51f915e5c29af"),
//        domainModel: {_id:new mongo.ObjectID("5a8fac0691d51f915e5c2a39")},
//        useCases:[
//            {_id:new mongo.ObjectID("5a939b35f919171c7cb07097"),Name:"usecase3"},
//            {_id:new mongo.ObjectID("5a939b35f919171c7cb07098"),Name:"usecase4"}
//            ] 
//    }

    /*saveModelInfo(modelInfo, "5a8e109c13a5974144158d99", function(result)
    {
         console.log(result);
    })*/

    function saveModelInfo(modelInfo, repoId, callbackfunc)
    {
            MongoClient.connect(url, function(err, db)
            {
                if (err) throw err;
    //			console.log(modelInfo);
//                var fs = require("fs");
//                fs.writeFile('./temp/modelInfo1.json', JSON.stringify(modelInfo, null, 2) , 'utf-8');
                //console.log("repoId: "+repoId);
                var o_id = new mongo.ObjectID(repoId);
              
           
                var modelId=modelInfo._id;

				//console.log("modelInfo"+modelInfo.UseCases)
                
                var useCases = modelInfo.UseCases;
                var domainModelInfo = modelInfo.DomainModel;
                
                for(var i in useCases)
                {
                    var useCase = useCases[i];
                    useCase.model_id=modelId;
                    useCase._id = useCase._id+"["+modelId+"]";
                }

                delete modelInfo.UseCases;
               
                delete modelInfo.DomainModel;
                
    
                modelInfo.repo_id=o_id

                
				if(domainModelInfo!=null){
					domainModelInfo.model_id=modelId;
                	domainModelInfo._id="domainModel_["+modelId+"]";
				}

                db.collection("modelInfo").save(modelInfo, function(err, res) 
                {
                        if (err) throw err;
                        //console.log("modelInfo 1 record inserted");
                        
//                        if(useCases.length > 0){
                        
                        for(var i in useCases){
                        db.collection("useCaseInfo").save(useCases[i], function(err, res)
                        {
                            if (err) throw err;
                                //console.log("useCaseInfo 1 record inserted");
                                
                        });
                        }
//                        }
                        
                        if(domainModelInfo){
                        db.collection("domainModelInfo").save(domainModelInfo, function(err, res) 
                        {
                            if (err) throw err;
                                //console.log("domainModelInfo 1 record inserted");
                                
                        });
                        }
                        
                        db.close();
						console.log("saveModelInfo");
                        callbackfunc(modelInfo);
						
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
            db.collection('domainModelInfo').remove({model_id: modelId}, function(err) {
                   if (err) {
                    console.log(err);
                    if(callbackfunc){
                        callbackfunc(false);
                    }
                    return;
                }

            db.collection('useCaseInfo').remove({model_id: modelId}, function(err) {
                   if (err) {
                    console.log(err);
                    if(callbackfunc){
                        callbackfunc(false);
                    }
                    return;
                }                                           

          db.collection('modelInfo').remove({_id: modelId}, function(err) {
                  if (err) {
                    console.log(err);
                    if(callbackfunc){
                        callbackfunc(false);
                    }
                    return;
                }

                  
          });

          if(callbackfunc){
                    callbackfunc(modelId, repoId);
        }

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
			  db.collection("repos").update(modelQuery, {$pull: {'Models.$.useCases':{'_id':useCaseId}}}, function(err){
			      console.log("delete useCase");
				  if (err) {
			    	  console.log(err);
			    	  callbackfunc(false);
			    	  return;
			      }
				  queryModelInfo(modelId, repoId, function(modelInfo){
                      if(!modelInfo){
                          console.log("No corresponding modelInfo can be found!!!");
                          if(callbackfunc){
                              callbackfunc(false);
                          }
                          return;
                      }
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
    
    function initRepoEntity(repoId){
    	  var repoInfo = {};
    	  repoInfo._id = repoId;
    	  repoInfo.Models = [];
		  repoInfo.OutputDir = "public/output/repo"+repoId;
		  repoInfo.AccessDir = "output/repo"+repoId;
		  return repoInfo;
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

  				    repoInfo  = initRepoEntity(repoId);

  				    var o_id = new mongo.ObjectID(repoId);

                        db.collection("repos").update({_id:o_id}, repoInfo, function(){

                          

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
    
    function queryUsers(callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            db.collection("users").find().toArray(function(err, users) {
               if(err) throw err;
               
               if(callbackfunc){
            	   callbackfunc(users);
               }

                db.close();
              });

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
                console.log("No corresponding modelInfo can be found!!!");
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

            //TODO:  what should we do?? generate a new uuid on server or discard data or insert blank?
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
    function getSurveyData(callback, o_id){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var schemaName = "surveyData";
            if(o_id){
                o_id = new mongo.ObjectID(o_id);
                db.collection(schemaName).find({_id:o_id}).toArray(function (err, records) {
                    if (err) throw err;
                    db.close();
                    if (callback) {
                        callback(records);
                    }
                    console.log(records)
                });
            }else {
                db.collection(schemaName).find().toArray(function (err, records) {
                    if (err) throw err;
                    db.close();
                    if (callback) {
                        callback(records);
                    }
                    console.log(records)
                });
            }

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
			umlFileInfo.OutputDir = umlModelInfo.OutputDir;
			umlFileInfo.AccessDir = umlModelInfo.AccessDir;
			return umlFileInfo;
		}

		return false;
	}
	
//	function saveEffortEstimationQueryResult(estimationResults, modelInfo, repoId, callback){
//		//need to finish.
//		if(callback){
//			callback(modelInfo);
//		}
//	}

	module.exports = {
		setupRepoStorage : function(callbackfunc) {
			// Connect to the db
			MongoClient.connect(url, function(err, db) {
				if (err) throw err;
			  db.createCollection('repos', function(err, collection) {
				  db.createCollection('users', function(err, collection) {
					  db.createCollection('surveys', function(err, collection) {
						  db.createCollection('noOfTransactions',function(err,collection){
								console.log("Table created!");
								db.close();
								callbackfunc();
			  });});
			  });});

				});
			},
			//createRepo: createRepo,
			
			//queryModelAnalytics: queryModelAnalytics,
			queryModelInfo: queryModelInfo,
			deleteModelInfo : function(repoId, modelInfo) {

		},
		updateUseCaseInfo: updateUseCaseInfo,
		saveModelInfo : saveModelInfo,
		queryRepoInfo : queryRepoInfo,
		queryRepoInfoByPage:queryRepoInfoByPage,
		queryUseCaseInfo: queryUseCaseInfo,
		saveEstimation: saveEstimation,
		saveModelInfoCharacteristics : saveModelInfoCharacteristics,
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
		reloadRepo: function(repo, callbackfunc){
			//create a replica of the existing repo.
			
			var newRepo  = initRepoEntity(repo._id);

//			var debug = require("./utils/DebuggerOutput.js");
//			debug.writeJson("new_repo_info_"+newRepo._id, newRepo);

			function reloadModel(model, newRepo){
				//update model analytics.
				console.log("reload model");
//				console.log(modelInfo);
				return new Promise((resolve, reject) => {
					console.log("promise");
					var newModel = duplicateModelInfo(model);
			    	newRepo.Models.push(newModel);
					umlModelExtractor.extractModelInfo(newModel, function(newModel){
//						console.log("extract model");
//						var debug = require("./utils/DebuggerOutput.js");
//						debug.writeJson("new_model_info_"+modelInfo._id, modelInfo);
						if(!newModel){
							reject("error");
						}
//					umlEvaluator.evaluateModel(newModel, function(newModel){
						console.log("model analysis complete");
//						console.log(newModel);
//						umlModelInfoManager.updateModelInfo(newModel, repoId, function(newModel){
								if(!newModel){
								reject("error");
								}
								else{
								resolve();
								}
//						});
//					});
					});
				  });
			}
			

			var umlEvaluator = require("./UMLEvaluator.js");
		return Promise.all(repo.Models.map(model=>{
	    	return reloadModel(model,newRepo);
		})).then(
				function(){
				return new Promise((resolve, reject) => {
					setTimeout(function(){
					console.log(umlEvaluator);	
					umlEvaluator.evaluateRepo(newRepo, function(newRepo){
						
					if(callbackfunc){
						callbackfunc(newRepo);
					}
					
					resolve();
				});
				}, 0);
				});
			}
		
		).catch(function(err){
				console.log(err);
				if(callbackfunc){
					callbackfunc(false);
				}
			});
		},
		updateModelInfo: updateModelInfo,
		updateRepoInfo: updateRepoInfo,
		//queryRepoAnalytics: queryRepoAnalytics,
		deleteModel:deleteModel,
		deleteUseCase:deleteUseCase,
		queryDomainModelDetail:function(modelId, repoId, callbackfunc){
			 queryModelInfo(modelId, repoId, function(modelInfo){
				 	if(callbackfunc){
				    callbackfunc(modelInfo['DomainModel']);
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
        queryRepoFromUser:queryRepoFromUser, 	
        saveSurveyAnalyticsData: saveSurveyAnalyticsData,
        createModelInfoVersion: createModelInfoVersion,
        getSurveyData: getSurveyData,
        deleteUser: deleteUser,
        queryUsers: queryUsers,
        saveGitInfo:saveGitInfo,
        getGitData : getGitData,
        deactivateUser:deactivateUser,
//        saveEffortEstimationQueryResult:saveEffortEstimationQueryResult,
        queryModelNumByRepoID: queryModelNumByRepoID,
        queryFullRepoInfo: queryFullRepoInfo,
        requestRepoBrief: requestRepoBrief,
        queryAllModelBrief: queryAllModelBrief,
        queryAllModelNames: queryAllModelNames,
        queryTempRepoInfo: queryTempRepoInfo
    }
	
}());