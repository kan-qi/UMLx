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

    var GitHubApi = require('github')       
            
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
	
function deleteRepo(repoId, callbackfunc) {  
  var modelQuery = {rep_id: mongo.ObjectID(repoId)};        
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
            
            domainObject.model_id = new mongo.ObjectId(modelInfo._id);
            
            
            
            //console.log(modelInfo._id);
            modelInfo._id = new mongo.ObjectId(modelInfo._id);
            
            //adding rep_id as an element in modelInfo
            modelInfo.rep_id = repoId;
            
            
            db.collection("modelInfo").update({"_id": mongo.ObjectId(modelInfo._id)}, modelInfo, function(err, res) {
                if (err) throw err;
                console.log("updating modelInfo");
                         
            });
            
            //updating domainModelInfo to add model_id element
            db.collection("domainModelInfo").update({"model_id": mongo.ObjectId(modelInfo._id)}, domainObject, function(err, res) {
                if (err) throw err;
                console.log("updating domainModelInfo");
                         
            });
            
            //updating useCaseInfo to add model_id element
            /*db.collection("useCaseInfo").update({"model_id": mongo.ObjectId(modelInfo._id)}, {$set : {useCaseArray}}, {multi:true}, function(err, res) {
                if (err) throw err;
                    console.log("updating useCaseInfo");
                    
              });*/
            for(var i in useCaseArray){
                console.log(useCaseArray[i]._id);
                useCaseArray[i].model_id = new mongo.ObjectID(modelInfo._id);
                useCaseArray[i]._id = new mongo.ObjectID(useCaseArray[i]._id);
                
                db.collection("useCaseInfo").update({"_id": useCaseArray[i]._id}, useCaseArray[i] , function(err, res) {
                if (err) throw err;
                    console.log("updating useCaseInfo");
                    
              });
            }
            
             db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
        });         
    }

    function updateRepoInfo(repo, callbackfunc){
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
      	            
       	           db.collection('modelInfo').update( { "formInfo.uuid-page1" : characteristicsInfo.requestUUID },
       	        		{$set: {  
   	        	    "formInfo.distributed-system": characteristicsInfo.distributedSystem,
        	   	    "formInfo.response-time": characteristicsInfo.responseTime,
   	        	    "formInfo.end-user-efficiency": characteristicsInfo.endUserEfficiency,
   	        	   	"formInfo.alert alert-infoternal-processing": characteristicsInfo.complexInternalProcessing,
       	        	"formInfo.code-must-be-resuable": characteristicsInfo.codeReusable,
       	        	"formInfo.easy-to-install": characteristicsInfo.easyInstall,
       	        	"formInfo.easy-to-use": characteristicsInfo.easyUse,
       	        	"formInfo.portable": characteristicsInfo.portable,
       	        	"formInfo.easy-to-change": characteristicsInfo.easyToChange,
       	        	"formInfo.concurrent": characteristicsInfo.concurrent,
       	        	"formInfo.includes-special-security-objectives": characteristicsInfo.specialSecurityObjectives,
       	        	"formInfo.provides-direct-access-for-third-parties": characteristicsInfo.directAccessForThirdParties,
       	        	"formInfo.special-user-training-facilities-are-required": characteristicsInfo.userTrainingFacilitiesRequired,
       	        	"formInfo.familiar-with-the-project-model-that-is-used": characteristicsInfo.familiarWithProjectModel,
       	        	"formInfo.application-experience": characteristicsInfo.applicationExperience,
       	        	"formInfo.object-oriented-experience": characteristicsInfo.objectOrientedExperience,
       	        	"formInfo.lead-analyst-capability": characteristicsInfo.leadAnalystCapability,
       	        	"formInfo.motivation": characteristicsInfo.motivation,
       	        	"formInfo.stable-requirements": characteristicsInfo.stableRequirements,
       	        	"formInfo.part-time-staff": characteristicsInfo.partTimeStaff,
       	        	"formInfo.difficult-programming-language": characteristicsInfo.difficultProgrammingLanguage,       	        	
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
    
    function saveEstimation (estimationInfo,callbackfunc) {
   	 MongoClient.connect(url, function(err, db)
   	            {
   	                if (err) throw err;
   	    //		
   	                db.collection("estimates").insertOne(estimationInfo, function(err, res) 
   	                		{
   			                  if (err) throw err;
   			                      console.log("estimates record inserted");
   			
   			                      db.close();
   			                      if(callbackfunc !== null)
   			                      {
   			                              callbackfunc(res);
   			                      }
     
   	                		});
   	            });
   }
    
    
    function queryModelInfo(modelId, repoId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            //var modelQuery = getModelQuery(modelId,repoId);
            //var projections = getModelQueryProjections(modelId, repoId);
            db.collection("modelInfo").aggregate([
               {
                   "$match":{
                       "_id":new mongo.ObjectID(modelId)
                   }
               },
               {
                   "$lookup": {
                       "from": "domainModelInfo",
                       "localField": "_id",
                       "foreignField": "model_id",
                       "as": "domainModel"
                   }
               },
               {
                   "$lookup": {
                       "from": "useCaseInfo",
                       "localField": "_id",
                       "foreignField": "model_id",
                       "as": "useCases"
                   }
               }
            ], function(err, result) {
               if (err) throw err;
               console.log("*******Shown result for ModelInfo*******");
               db.close();
               callbackfunc(result[0]);
            });
        });
    }

	/*queryRepoInfo("5a8e109c13a5974144158d99", function(result)
    {
         console.log(result);
    })*/
	
	
    function queryRepoInfo(repoId, callbackfunc)
    {
        MongoClient.connect(url, function(err, db)
        {
			
            if (err) throw err;
           
            var repoid=new mongo.ObjectID(repoId);

			
           
            db.collection("repos").aggregate([
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
               if (err) throw err;
               console.log("*******Shown result for queryRepoInfo*******");
			   console.log(result[0]);
               console.log("*******Shown result for ModelInfo*******");               
               db.close();
               callbackfunc(result[0]);
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
			
			//var query = { rep_id: repoid};
			
			db.collection("modelInfo").aggregate([
			{
				"$match":
				{
				   "repo_id":new mongo.ObjectID(repoid)
				}
			},
			{
			   $skip: stepParameter*pageParameter
			}, // pagination skip
			{
				$limit: stepParameter
			}
			],function(err, result) 
            {
               if (err) throw err;
               console.log("*******Shown result for queryRepoInfoByPage*******");
               db.close();
			   
               callbackfunc(result);
            });
			
		});
	}
	
	/*repoDetail("5a8e109c13a5974144158d99",function(result)
    {
        console.log(result);
    })*/
	function repoDetail(repoId,callbackfunc)
	{
		MongoClient.connect(url, function(err, db) 
		{
			if (err) throw err;
			
			var repoid=new mongo.ObjectID(repoId);
					
			db.collection("modelInfo").find(
			{
				rep_id:repoid
			},
			{
				TransactionAnalytics:1,_id:0
			}).toArray(
			function(err, result) 
			{
			   if (err) throw err;
			   else
			   {
				    var dt = new Date();
					var today=dt.getFullYear() + '/' + (((dt.getMonth() + 1) < 10) ? '0' : '') + (dt.getMonth() + 1) + '/' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();
				   
				   
				   
				   db.collection('noOfTransactions').findOne({'timestamp':today})
					.then(function(doc) 
					{
						if(doc)
						{
							console.log("Record exists");
							callbackfunc(doc);
							db.close();							
						}
							
							//throw new Error('No record found.');
						//console.log(doc);//else case
						
						else
						{
							console.log("Record does not exist");
							for(i=0;i<result.length;i++)
						   {
							   
							   var sum_nt=0;
							   for(i=0;i<result.length;i++)
							   {
									sum_nt+=result[i]['TransactionAnalytics']['NT'];
							   }
								//console.log("sum_nt"+sum_nt);
						  
							  var dt = new Date();
							  var today=dt.getFullYear() + '/' + (((dt.getMonth() + 1) < 10) ? '0' : '') + (dt.getMonth() + 1) + '/' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();
							  
							  
							  //record={repo_id:repoid,NT:sum_nt,timestamp:today.getDate()}
							  
							  record={repo_id:repoid,NT:sum_nt,timestamp:today}
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
                console.log("test the use case query");
                console.log(result);
                callbackfunc(result[0]['UseCases']);
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
    var modelInfo = {
        _id: new mongo.ObjectID("5a8fab8f91d51f915e5c29af"),
        domainModel: {_id:new mongo.ObjectID("5a8fac0691d51f915e5c2a39")},
        useCases:[
            {_id:new mongo.ObjectID("5a939b35f919171c7cb07097"),Name:"usecase3"},
            {_id:new mongo.ObjectID("5a939b35f919171c7cb07098"),Name:"usecase4"}
            ] 
    }

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
                var fs = require("fs");
                fs.writeFile('./temp/modelInfo1.json', JSON.stringify(modelInfo, null, 2) , 'utf-8');
                //console.log("repoId: "+repoId);
                var o_id = new mongo.ObjectID(repoId);
              
           
                var modelId=modelInfo._id;

				//console.log("modelInfo"+modelInfo.UseCases)
                
                var useCases = modelInfo.UseCases;
                var domainModelInfo = modelInfo.DomainModel;
                
                for(var i in modelInfo.UseCases)
                {
                    var useCase = modelInfo.UseCases[i];
                    useCase.model_id=modelId;
                }

                delete modelInfo.UseCases;
               
                delete modelInfo.DomainModel;
                
    
                modelInfo.repo_id=o_id

                
				if(domainModelInfo!=null)
					domainModelInfo.model_id=modelId;


                db.collection("modelInfo").insertOne(modelInfo, function(err, res) 
                {
                        if (err) throw err;
                        //console.log("modelInfo 1 record inserted");
                        
                        db.collection("useCaseInfo").insertMany(useCases, function(err, res)
                        {
                            if (err) throw err;
                                //console.log("useCaseInfo 1 record inserted");
                                
                        });
                        db.collection("domainModelInfo").insertOne(domainModelInfo, function(err, res) 
                        {
                            if (err) throw err;
                                //console.log("domainModelInfo 1 record inserted");
                                
                        });
                        
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
			umlFileInfo.Outputdir = umlModelInfo.OutputDir;
			umlFileInfo.AccessDir = umlModelInfo.AccessDir;
			return umlFileInfo;
		}

		return false;
	}
	
	function saveEffortEstimationQueryResult(modelInfo, repoId, callback){
		//need to finish.
		if(callback){
			callback(modelInfo);
		}
	}

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
		queryUseCaseInfo: queryUseCaseInfo,
		repoDetail:repoDetail,
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
					umlModelExtractor.extractModelInfo(modelInfo, function(modelInfo){
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
//umlModelExtractor.extractModelInfo(newModel, modelReloadProcessor);
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
        queryUsers: queryUsers,
        saveGitInfo:saveGitInfo,
        getGitData : getGitData,
        deactivateUser:deactivateUser,
        saveEffortEstimationQueryResult:saveEffortEstimationQueryResult
    }
	
}());
