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
    
//  var DUCPModel = require("./effort_estimators/DUCPModel.js");
//  var EUCPModel = require("./effort_estimators/EUCPModel.js");
//  var EXUCPModel = require("./effort_estimators/EXUCPModel.js");
    
//  var EUCPModel = require("./effort_estimators/UCPModels.js").init("eucp_lm");
//  var EXUCPModel = require("./effort_estimators/UCPModels.js").init("exucp_lm");
//  var DUCPModel = require("./effort_estimators/UCPModels.js").init("ducp_lm");
    
//  var models = [EUCPModel, EXUCPModel, DUCPModel];
    
//  var models = {
//      eucp_lm: EUCPModel,
//      exucp_lm : EXUCPModel,
//      ducp_lm: DUCPModel
//  };
    
//  console.log(models);
//  process.exit();
    
    module.exports = {
        // this function will predict project effort in different forms, for example, by mvc components and use cases.
        predictEffortByModel: function(modelInfo, estimationModel, callbackfunc){
            console.log("project effort estimation");
            console.log(estimationModel);
            //var predictionModel = models[estimationModel];
            //* now instead of using individual nodejs files (under ./effort_estimators) for prediction functions, we now directly implement the prediction functions in the evaluators.

//            console.log("started prediction 1");
//            process.exit();

            if(!estimationModel){
                if(callbackfunc){
                        callbackfunc(false);
                }
                return;
            }

                        var evaluators = umlModelEvaluator.evaluators;

                                    var predictionModel = null;

                                    for(var i in evaluators){
                                        var evaluator = evaluators[i];
                                        if(evaluator.getPredictionModels){
                                        var predictionModels = evaluator.getPredictionModels();
                                        if(predictionModels && predictionModels[estimationModel]){
                                            predictionModel = predictionModels[estimationModel];
                                            break;
                                        }
                                        }
                                    }

             if(!predictionModel){
                            if(callbackfunc){
                                    callbackfunc(false);
                            }
                            return;
                        }

            predictionModel.predictEffort(modelInfo, estimationModel, function(estimationResults){
//              console.log("finished prediction 1");
//              process.exit();
                console.log("estimation results: " + JSON.stringify(estimationResults));
                // decompose effort for activities in Android apk
                if (modelInfo.apkFile) {

                    if (estimationResults["UseCases"].length === 0) {
                        if(callbackfunc){
                            callbackfunc(false);
                        }
                        return;
                    }
                    const original_case = estimationResults["UseCases"][0];
                    const total_effort = original_case["Effort"];
                    const activityNames = modelInfo.apkAttrs.ActivityNames;
                    const num_activities = activityNames.length;
                    let use_cases = [];
                    for (let i = 0; i < num_activities; i++) {
                        let new_case = JSON.parse(JSON.stringify(original_case));
                        new_case["Name"] = activityNames[i];
                        new_case["Effort"] = total_effort / num_activities;
                        use_cases.push(new_case);
                    }
                    estimationResults["UseCases"] = use_cases;
                }
                
                if(!modelInfo){
                    if(callbackfunc){
                        callbackfunc(false);
                    }
                    return;
                }
//              modelInfo[estimationModel]
                if(callbackfunc){
                    callbackfunc(estimationResults);
                }
            })
        },
        predictEffort: function(modelInfo, callbackfunc){
            
              //use promise to construct the repo objects
            function predictEffortM(model, key){
                return new Promise((resolve, reject) => {

                        model.predictEffort(modelInfo, key, function(modelInfo){
                            console.log("finished prediction");
                            resolve();
                        })
                        //console.log(modelInfo);
                });
            }

            var models = {}
            var evaluators = umlModelEvaluator.evaluators;

                        var predictionModel = null;

                        for(var i in evaluators){
                            var evaluator = evaluators[i];
                            if(evaluator.getPredictionModels){
                            predictionModels = evaluator.getPredictionModels();
                            for(var j in predictionModels){
                                models[j] = predictionModels[j]
                            }
                            }
                        }

            
//            console.log("keys");
//            console.log(models);
            return Promise.all(Object.keys(models).map(key=>{
                return predictEffortM(models[key], key);
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
        queryExistingModels: function(modelSearchStr){

        },
        predictEffortRepo: function(repoInfo, callbackfunc){
              //use promise to construct the repo objects
            
            function predictEffortM(modelInfo, estimationModel, key){
                return new Promise((resolve, reject) => {

                        estimationModel.predictEffort(modelInfo, key, function(modelInfo){
                            console.log("finished prediction");
                            resolve();
                        });
                        //console.log(modelInfo);
                });
            }
            
//            console.log("keys");
//            console.log(models);

            var models = {}
            var evaluators = umlModelEvaluator.evaluators;

                        var predictionModel = null;

                        for(var i in evaluators){
                            var evaluator = evaluators[i];
                            if(evaluator.getPredictionModels){
                            predictionModels = evaluator.getPredictionModels();
                            for(var j in predictionModels){
                                models[j] = predictionModels[j]
                            }
                            }
                        }
            
            var promiseTasks = [];
            for(var i in repoInfo.Models){
                var modelInfo = repoInfo.Models[i];
                Object.keys(models).map(key=>{
                    promiseTasks.push(predictEffortM(modelInfo, models[key], key));
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