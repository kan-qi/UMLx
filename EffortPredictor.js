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
	
	var DUCPModel = require("./effort_estimators/DUCPModel.js");
	var EUCPModel = require("./effort_estimators/EUCPModel.js");
	var EXUCPModel = require("./effort_estimators/EXUCPModel.js");
	
	var models = [EUCPModel, EXUCPModel, DUCPModel];
	
	var models = {
			EUCP: EUCPModel,
			EXUCP : EXUCPModel,
			DUCP: DUCPModel
			};
	
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
			
			predictionModel.predictEffort(modelInfo, function(modelInfo){
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
	
	}
}())