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
	
	function updateModelInfo(modelInfo, repoId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            var domainObject = modelInfo.DomainModel;
            var useCaseArray = modelInfo.UseCases;
            
            //removing domainModel and UseCase object from the model object 
            delete modelInfo.DomainModel;
            delete modelInfo.UseCases;
            
            modelInfo.repo_id = new mongo.ObjectId(repoId);
            
            db.collection("modelInfo").update({"_id": modelInfo._id}, modelInfo, function(err, res) {
                if (err) throw err;
                console.log("updating modelInfo");
                         
            });
            
          if(domainObject){

          domainObject.model_id = modelInfo._id;
          
            db.collection("domainModelInfo").update({"model_id": modelInfo._id}, domainObject, function(err, res) {
                 
            if (err) throw err;
                console.log("updating domainModelInfo");
                         
            });
            
            }

          	console.log(modelInfo._id);
             for(var i in useCaseArray){
                useCaseArray[i].model_id = modelInfo._id;
                console.log("USe Case: "+i+" ID: "+ useCaseArray[i]._id);
                db.collection("useCaseInfo").remove({_id: useCaseArray[i]._id}, function(err, res) 
                {
                    //if (err) throw err;
                        console.log("Use Case deleted");
                    });
                db.collection("useCaseInfo").insertOne(useCaseArray[i], function(err, res) 
                {
                    if (err) throw err;
                    //console.log("Use Case deleted");
                        console.log("use case Inserted");
                });
                        
            }
            
             db.close();
                if(callbackfunc !== null){
                    callbackfunc(modelInfo);
                }
        });         
    }

    function updateRepoInfo(repo, callbackfunc){
        console.log(repo);
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            var modelArray = repo.Models;
            repo._id = mongo.ObjectId(repo._id);
            
            delete repo.Models;
            
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

    function saveModelInfoCharacteristics (characteristicsInfo,callbackfunc){
    	MongoClient.connect(url, function(err, db)
   	            {
    		
    		MongoClient.connect(url, function(err, db)
    				   	            {
    			   if (err) throw err;
    			   db.collection('modelInfo').updateOne( { "_id" : characteristicsInfo.modelID },
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
       	        			"projectInfo.difficultProgrammingLanguage" : characteristicsInfo['difficult_programming_language'],
                            "formInfo.distributed-system" : characteristicsInfo['distributed_system'],
                            "formInfo.response-time" : characteristicsInfo['response_time'],
                            "formInfo.end-user-efficiency" : characteristicsInfo['end_user_efficiency'],
                            "formInfo.complex-internal-processing" : characteristicsInfo['complex_internal_processing'],
                            "formInfo.code-must-be-reusable" : characteristicsInfo['code_must_be_reusable'],
                            "formInfo.easy-to-install" : characteristicsInfo['easy_to_install'],
                            "formInfo.easy-to-use" : characteristicsInfo['easy_to_use'],
                            "formInfo.portable" : characteristicsInfo['portable'],
                            "formInfo.easy-to-change" : characteristicsInfo['easy_to_change'],
                            "formInfo.concurrent" : characteristicsInfo['concurrent'],
                            "formInfo.includes-special-security-objectives" : characteristicsInfo['includes_special_security_objectives'],
                            "formInfo.provides-direct-access-for-third-parties" : characteristicsInfo['provides_direct_access_for_third_parties'],
                            "formInfo.special-user-training-facilities-are-required" : characteristicsInfo['special_user_training_facilities_are_required'],
                            "formInfo.familiar-with-the-project-model-that-is-used" : characteristicsInfo['familiar_with_the_form_model_that_is_used'],
                            "formInfo.application-experience" : characteristicsInfo['application_experience'],
                            "formInfo.object-oriented-experience" : characteristicsInfo['object_oriented_experience'],
                            "formInfo.lead-analyst-capability" : characteristicsInfo['lead_analyst_capability'],
                            "formInfo.motivation" : characteristicsInfo['motivation'],
                            "formInfo.stable-requirements" : characteristicsInfo['stable_requirements'],
                            "formInfo.part-time-staff" : characteristicsInfo['part_time_staff'],
                            "formInfo.difficult-programming-language" : characteristicsInfo['difficult_programming_language']
                            }},
       	        		   { upsert: true }, function(err, res){
       	        			if (err) {
       	        			    console.log("update info error");
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
                        if(domainModel){
                        delete domainModel._id;
                        modelInfo.DomainModel = domainModel;
                        }
                        else{
                        modelInfo.DomainModel = {};
                        }
                    }
                    console.log("---------------modelInfo----------------");
                    //console.log(modelInfo);
                }

                callbackfunc(modelInfo);

              });              
        });
    }
   
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
        console.log("inside queryRepoInfo");
        MongoClient.connect(url, function(err, db)
        {
			
            if (err) throw err;
            console.log("queryRepoInfo: start collect");
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
            	    console.log("spot error in queryRepoInfo");
            	   console.log(err);
            	   if(callbackfunc){
            		   callbackfunc(false);
            	   }
            	   return;
               }

               callbackfunc(result[0]);
            });
		});
	}

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
                                delete modelInfo.DomainModels;
                                if(domainModel){
                                delete domainModel._id;
                                modelInfo.DomainModel = domainModel;
                                }
                                else{
                                modelInfo.DomainModel = {};
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

	function queryRepoInfoByPage(repoId, stepParameter, pageParameter,callbackfunc)
    {
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
                var newKeys = ["SLOC", "schedule","personnel", "EUCP", "EXUCP", "DUCP", "effort", "estimatedEffort"];
                for (let i = 0, len = newKeys.length; i < len; ++i) {
                    resultForRepoInfo[newKeys[i]] = 0;
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
                       projectNum: 0,
                       SLOC: 0,
                       schedule: 0,
                       personnel: 0,
                       EUCP: 0,
                       EXUCP: 0,
                       DUCP: 0,
                       effort: 0,
                       estimatedEffort: 0,
				   });
			   }
			   else
			   {
                    var newKeys = ["SLOC", "schedule","personnel", "EUCP", "EXUCP", "DUCP", "effort", "estimatedEffort"];

                    console.log(result);
				    var dt = new Date();
					var today=dt.getFullYear() + '/' + (((dt.getMonth() + 1) < 10) ? '0' : '') + (dt.getMonth() + 1) + '/' + ((dt.getDate() < 10) ? '0' : '') + dt.getDate();
                   
				   db.collection('noOfTransactions').findOne({'repo_id':repoid,'timestamp':today})
					.then(function(doc)
					{
                        console.log(repoid);
                        console.log(doc);
						if(doc)
						{
						    db.collection('noOfTransactions').find(
                                {
                                    repo_id:repoid
                                },
                                {
                                    NT:1,UseCaseNum:1,EntityNum:1,timestamp:1,projectNum:1,_id:1
                                }
                            ).toArray(function (err, result) {
                                console.log(result);
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
                                    for (var i = 0, len = newKeys.length; i < len; ++i) {
                                        if (!response[newKeys[i]]) {
                                            response[newKeys[i]] = [];
                                        }
                                        if (!element[newKeys[i]]) {
                                            var whereStr = {'_id': mongo.ObjectID(`${element._id}`)};
                                            var updateStr = {"$set":{[`${newKeys[i]}`]:0}};
                                            //console.log(updateStr);

                                            db.collection('noOfTransactions').updateOne(whereStr, updateStr, function(err, res) {
                                                if (err) throw err;
                                            });
                                            response[newKeys[i]].push(0);
                                        }
                                        else{
                                            response[newKeys[i]].push(element[newKeys[i]]);
                                        }
                                    }
                                });
                                console.log("Record exists");
                                console.log(response);
                                console.log('=============');
                                callbackfunc(response);
                                db.close();
                            })
						}
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
							  
							  record={repo_id:repoid,NT:sum_nt,UseCaseNum:sum_useCase,EntityNum:sum_entityNum, timestamp:today,projectNum:result.length,      SLOC: 0,
                                schedule: 0,
                                personnel: 0,
                                EUCP: 0,
                                EXUCP: 0,
                                DUCP: 0,
                                effort: 0,
                                estimatedEffort: 0};
							  db.collection("noOfTransactions").insertOne(record, function(err, res)
							  {
									if (err) throw err;
									//console.log("*******Shown result for ModelInfo*******");
									db.close();
									callbackfunc(record);
									console.log("1 document inserted");								
							  });
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

    function saveModelInfo(modelInfo, repoId, callbackfunc)
    {
            MongoClient.connect(url, function(err, db)
            {
                if (err) throw err;
                var o_id = new mongo.ObjectID(repoId);
              
                var modelId=modelInfo._id;

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
                        for(var i in useCases){
                        db.collection("useCaseInfo").save(useCases[i], function(err, res)
                        {
                            if (err) throw err;
                                
                        });
                        }
//                        }
                        
                        if(domainModelInfo){
                        db.collection("domainModelInfo").save(domainModelInfo, function(err, res) 
                        {
                            if (err) throw err;
                            db.close();
                            console.log("saveModelInfo");
                            callbackfunc(modelInfo);
                        });
                        }
                        

						
                });
                
            });
    }

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

                        db.collection("repos").update({_id:o_id}, repoInfo, function(err, result){
                            if (err) throw err;
                            db.close();
                            callbackfunc(repoInfo);
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
                    }
                    db.collection("users").insertOne(userInfo, function(err, result) {
                        if (err) throw err;
                        
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

                            // var userInfoWithRepoID = {
                            //     ...userInfo,
                            //     repoId: repo._id,
                            // };
                            var userInfoWithRepoID = userInfo;
                            userInfoWithRepoID.repoId = repo._id;

                            db.collection("users").update({_id:userInfo._id}, userInfoWithRepoID, function(err, res){
                                if (err) throw err;
                                db.close();
                                callback(result);
                            });

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

			function reloadModel(model, newRepo){
				//update model analytics.
				console.log("reload model");
				return new Promise((resolve, reject) => {
					console.log("promise");
					var newModel = duplicateModelInfo(model);
			    	newRepo.Models.push(newModel);
					umlModelExtractor.extractModelInfo(newModel, function(newModel){
						if(!newModel){
							reject("error");
						}
						console.log("model analysis complete");
							if(!newModel){
								reject("error");
								}
								else{
								resolve();
								}
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