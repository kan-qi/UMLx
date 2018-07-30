(function(){

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var umlModelExtractor = require("../UMLModelExtractor.js");
var umlEvaluator = require("../UMLEvaluator.js");
var url = "mongodb://127.0.0.1:27017/repo_info_schema";
var umlFileManager = require("../UMLFileManager.js");
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file

var umlFileManager = require("../UMLFileManager.js");
var fs = require('fs');
var mkdirp = require('mkdirp');
//	var umlFileManager = require('./UMLFileManager');

var RScriptExec = require('../utils/RScriptUtil.js');

var umlModelInfoManager = require("../UMLModelInfoManagerMongoDB.js");

// current available evaluators
var useCaseComponentsEvaluator = require('../evaluators/UseCaseComponentsEvaluator/UseCaseComponentsEvaluator.js');
//	var functionPointEvaluator = require('./evaluators/FunctionPointEvaluator/FunctionPointEvaluator.js');
var transactionEvaluator = require('../evaluators/TransactionEvaluator/TransactionEvaluator.js');
var modelVersionEvaluator = require('../evaluators/ModelVersionEvaluator/UMLModelVersionEvaluator.js');
var cocomoCalculator = require('../evaluators/COCOMOEvaluator/COCOMOCalculator.js');
var useCasePointEvaluator = require('../evaluators/UseCasePointEvaluator/UseCasePointEvaluator.js');
var extendedUseCasePointEvaluator = require('../evaluators/UseCasePointEvaluator/ExtendedUseCasePointEvaluator.js');
var projectTypeEvaluator = require('../evaluators/ProjectTypeEvaluator.js');
var UMLSizeMetricEvaluator = require('../evaluators/UMLModelSizeMetricEvaluator/UMLModelSizeMetricEvaluator.js');

var userStoryEvaluator = require('../evaluators/UserStoryEvaluator/UserStoryEvaluator.js');

//	var evaluators = [cocomoCalculator, useCasePointCalculator, umlDiagramEvaluator,functionPointCalculator, projectEvaluator, useCasePointWeightEvaluator];
var evaluators = [
    useCaseComponentsEvaluator,
    transactionEvaluator,
    modelVersionEvaluator,
    projectTypeEvaluator,
    cocomoCalculator,
    useCasePointEvaluator,
    extendedUseCasePointEvaluator,
    UMLSizeMetricEvaluator,
    userStoryEvaluator
];


function evaluateRepo(repoInfo, callbackfunc){
//		var modelEmpirics = "PROJ,UC,CCSS,UEUCW,IT,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,VAF,AFPC\n";
//		var repoEvaluationStr = "NUM,PROJ,UEUCW,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,AFP,VAF,AFPC,Effort\n";
    var modelEvaluationStr = "";
//		var repoEvaluationsForUseCase = [];
    var modelNum = 1;


    var useCaseNum = 1;
//		var useCaseEmpiricss = [];
    var useCaseEvaluationStr = "";

    var domainModelNum = 1;
    var domainModelEvaluationStr = "";

//		if(index !== undefined){
//			useCaseNum = index;
//		}

//		console.log("hello3");
//		console.log(repoInfo);
    console.log("model analysis complete1");


//	var debug = require("./utils/DebuggerOutput.js");
//	debug.writeJson("new_new_repo_info_"+repoInfo._id, repoInfo);


    if(callbackfunc){
        // iterate the hierarchy of the repo
        for(var i in repoInfo.Models){
//				if(modelNum > 1){
//					break;
//				}
            var model = repoInfo.Models[i];
            evaluateModel(model, function(){
                console.log('model analysis is complete!!!!!!!!!!');
            })

//				var useCaseEmpirics = evaluateUseCase(useCase, model.umlModelName);
            modelEvaluationStr += toModelEvaluationStr(model, modelNum);
//				console.log(useCaseEvaluationStr);
            modelNum ++;


            for(var i in model.UseCases){
                var useCase = model.UseCases[i];
//					evaluateUseCase(useCase, model, function(){
//							console.log('use case analysis is complete');
//						});
//
                useCaseEvaluationStr += toUseCaseEvaluationStr(useCase, useCaseNum);
//					useCaseEmpiricss.push(useCaseEmpirics);
                useCaseNum ++;
            }

            var domainModel = model.DomainModel;
//				console.log("output model");
//				console.log(model);

            if(domainModel){
//				evaluateDomainModel(domainModel, function(){
//				console.log('doamin model analysis is complete');
////				useCaseEmpiricss.push(useCaseEmpirics);
//
//				});
//

                domainModelEvaluationStr += toDomainModelEvaluationStr(domainModel, domainModelNum);

                domainModelNum ++;
            }
        }
        console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
        // iterate the evaluators, which will do analysis on at the repo level and populate repo analytics
        for(var i in evaluators){
            var evaluator = evaluators[i];
            if(evaluator.evaluateRepo){
                evaluator.evaluateRepo(repoInfo, function(){
                    console.log('repo evaluation finishes');
                });
            }
        }


        repoInfo.ModelEvaluationFileName = "modelEvaluation.csv";
        repoInfo.UseCaseEvaluationFileName = "useCaseEvaluation.csv";
        repoInfo.DomainModelEvaluationFileName = "domainModelEvaluation.csv";
        repoInfo.ModelStatisticsOutputDir = repoInfo.OutputDir+"/model_evaluation_statistics";

        var files = [{fileName : repoInfo.ModelEvaluationFileName , content : modelEvaluationStr},
            {fileName : model.DomainModelEvaluationFileName , content : domainModelEvaluationStr},
            {fileName : model.ModelEvaluationFileName , content : modelEvaluationStr}];

        console.log("WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW");

        umlFileManager.writeFiles(repoInfo.OutputDir, files, function(err){
            if(err) {
                console.log(err);
                if(callbackfunc){
                    callbackfunc("false umlFileManager.writeFiles");
                }
            }
            else {

                for(var i in evaluators){
                    var evaluator = evaluators[i];
                    if(evaluator.analyseRepoEvaluation){
                        evaluator.analyseRepoEvaluation(repoInfo);
                    }
                }

                console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM");

                umlFileManager.makeDir(repoInfo.ModelStatisticsOutputDir, function(result){
                    if(result){
                        //Needs to be upgraded soon
                        console.log("apply statistical analysis on the repo output evaluation");
                        var command = './Rscript/OutputStatistics.R "'+repoInfo.OutputDir+"/"+repoInfo.ModelEvaluationFileName+'" "'+repoInfo.ModelStatisticsOutputDir+'" "."';
                        console.log(command);

                        RScriptExec.runRScript(command,function(result){
                            if (!result) {
                                if(callbackfunc){
                                    callbackfunc("false umlFileManager.makeDir");
                                }
                                return;
                            }
                            if(callbackfunc){
                                callbackfunc(repoInfo);
                            }
                        });

                    }
                    else {
                        if(callbackfunc){
                            callbackfunc("false umlFileManager.makeDir else");
                        }
                    }

                });

//				 if(callbackfunc){
////						console.log(repoEvaluationsForUseCaseStr);
//				    	callbackfunc(repoInfo);
//				}
            }

        });

    }
    else {
        return repoInfo;
    }
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


onmessage = function(event) {
    let repoInfo = event.data;
    postMessage("start beginning");
    evaluateRepo(repoInfo, function(repoInfo){
        postMessage("Finish evaluateRepo!");
        //				this repofo information only has repo structure but no actual data.
        updateRepoInfo(repoInfo, function(){
            //					umlFileManager.deleteDir(function(result){
            //					});

            //					res.render('repoDetail', {modelInfo:modelInfo, repo_id: repoId});
            postMessage("Finish all analyze!");
        });
    });

    self.close();
};

})();










