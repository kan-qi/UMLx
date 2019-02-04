(function() {
	// Retrieve
	
	/*
	 *  This script will call the classes within repoAnalyzer.
	 * 
	 */
	
	var classPath = "C:/Users/Kan Qi/Google Drive/ResearchSpace/Research Projects/Repo Analyser/bin/"
	var projectDir = "C:/Users/Kan Qi/Google Drive/ResearchSpace/Research Projects/UMLx";
	var umlModelEvaluator = require("./UMLEvaluator.js");
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var RScriptExec = require('./utils/RScriptUtil.js');
	
//	var DUCPModel = require("./effort_estimators/DUCPModel.js");
//	var EUCPModel = require("./effort_estimators/EUCPModel.js");
//	var EXUCPModel = require("./effort_estimators/EXUCPModel.js");
	
	var EUCPModel = require("./effort_estimators/UCPModels.js").init("eucp_lm");
	var EXUCPModel = require("./effort_estimators/UCPModels.js").init("exucp_lm");
	var DUCPModel = require("./effort_estimators/UCPModels.js").init("ducp_lm");
	
//	var models = [EUCPModel, EXUCPModel, DUCPModel];
	
	var models = {
			eucp_lm: EUCPModel,
			exucp_lm : EXUCPModel,
			ducp_lm: DUCPModel
			};
	
//	console.log(models);
//	process.exit();
	
	module.exports = {
		// this function will predict project effort in different forms, for example, by mvc components and use cases.
		predictEffortByModel: function(modelInfo, estimationModel, callbackfunc){
			console.log("project effort estimation");
			console.log(estimationModel);
			var predictionModel = models[estimationModel];
			if(!predictionModel){
				if(callbackfunc){
					callbackfunc(false);
				}
				return;
			}
			
			predictionModel.predictEffort(modelInfo, estimationModel, function(modelInfo){
    			console.log("finished prediction 1");
    			
    			if(!modelInfo){
    				if(callbackfunc){
    					callbackfunc(false);
    				}
    				return;
    			}
    			
    			if(callbackfunc){
    				callbackfunc(modelInfo[estimationModel]);
    			}
    		})
		},
		predictEffort: function(modelInfo, callbackfunc){
			
			  //use promise to construct the repo objects
            function predictEffortWithModel(model, key){
                return new Promise((resolve, reject) => {

                		model.predictEffort(modelInfo, key, function(modelInfo){
                			console.log("finished prediction");
                            resolve();
                		})
                        //console.log(modelInfo);
                });
            }
            
            console.log("keys");
            console.log(models);
		    return Promise.all(Object.keys(models).map(key=>{
                return predictEffortWithModel(models[key], key);
            })).then(
                function(){
                    return new Promise((resolve, reject) => {
                        setTimeout(function(){

                        	if(callbackfunc){
                                callbackfunc(modelInfo);
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
		},
		
		predictEffortRepo: function(repoInfo, callbackfunc){
			  //use promise to construct the repo objects
			
            function predictEffortWithModel(modelInfo, estimationModel, key){
                return new Promise((resolve, reject) => {

                		estimationModel.predictEffort(modelInfo, key, function(modelInfo){
                			console.log("finished prediction");
                            resolve();
                		});
                        //console.log(modelInfo);
                });
            }
            
            console.log("keys");
            console.log(models);
            
            var promiseTasks = [];
            for(var i in repoInfo.Models){
				var modelInfo = repoInfo.Models[i];
				Object.keys(models).map(key=>{
	                promiseTasks.push(predictEffortWithModel(modelInfo, models[key], key));
	            })
			}
            
		    return Promise.all(promiseTasks).then(
                function(){
                    return new Promise((resolve, reject) => {
                        setTimeout(function(){

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
		}
	
	}
}())