(function() {
	// Retrieve
	
	/*
	 *  This script is responsible for loading the data and evaluating the performance of the algorithms of subjects for certain evaluated values.
	 *  This module majorly uses the data from modelEmpirics, modelAnalytics, useCaseEmpirics, and UseCaseEmpirics to performan the evaluations.
	 *  
	 *  
	 *  
	 *  This module encapsulate the model evaluators, for example, useCaseCalculator, cocomoCalcultor, etc.
	 *  
	 *  first, it register the evaluators in the evaluators array.
	 *  second, it iterate the evaluators for loading the model evaluation data.
	 *  
	 * 
	 */
	
	var umlFileManager = require("./UMLFileManager.js");
	var fs = require('fs');
	var mkdirp = require('mkdirp');

	var RScriptExec = require('./utils/RScriptUtil.js');

	var umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
	
	// current available evaluators
	var usimElementEvaluator = require('./evaluators/USIMElementEvaluator/USIMElementEvaluator.js');
	var useCaseComponentsEvaluator = require('./evaluators/UseCaseComponentsEvaluator/UseCaseComponentsEvaluator.js');
	var transactionEvaluator = require('./evaluators/TransactionEvaluator/TransactionEvaluator.js');
	var functionPointEvaluator = require('./evaluators/FunctionPointEvaluator/FunctionPointEvaluator.js');
	var modelVersionEvaluator = require('./evaluators/ModelVersionEvaluator/UMLModelVersionEvaluator.js');
	var cocomoCalculator = require('./evaluators/COCOMOEvaluator/COCOMOCalculator.js');
	var useCasePointEvaluator = require('./evaluators/UseCasePointEvaluator/UseCasePointEvaluator.js');
	var extendedUseCasePointEvaluator = require('./evaluators/UseCasePointEvaluator/ExtendedUseCasePointEvaluator.js');
	var projectTypeEvaluator = require('./evaluators/ProjectTypeEvaluator.js');
	var UMLSizeMetricEvaluator = require('./evaluators/UMLModelSizeMetricEvaluator/UMLModelSizeMetricEvaluator.js');

	var userStoryEvaluator = require('./evaluators/StoryPointEvaluator/UserStoryEvaluator.js');
	
	var evaluators = [
			usimElementEvaluator,
			useCaseComponentsEvaluator,
			transactionEvaluator,
			functionPointEvaluator,
			modelVersionEvaluator,
			projectTypeEvaluator,
			cocomoCalculator,
			useCasePointEvaluator,
			extendedUseCasePointEvaluator,
			UMLSizeMetricEvaluator,
			userStoryEvaluator
			];
	
//	function setUp(){
//		evaluators = [cocomoCalculator, useCaseCalculator, useCaseComponentsEvaluator];
//		for(var i in evaluators){
//			evaluators[i].steUp();
//		}
//	}
	
	function loadModelEmpirics(repoInfo, callbackfunction, modelFile){
			var ModelDataFilePath = modelFile ? modelFile :repoInfo.outputDir+"/ModelDataLoad.csv";
			console.log('loadModelEmpirics:', ModelDataFilePath);
			umlFileManager.loadCSVFile(ModelDataFilePath, true, function(data){
				var modelDataArray = {};
				for(var i in data){
					var dataElement = data[i];
					var modelData = modelDataArray[dataElement['PROJ']];
					if(modelData === undefined){
						modelData = {};
						modelDataArray[dataElement['PROJ']] = modelData;
					}
					
					for(var j in dataElement){
						modelData[j] = dataElement[j];
					}
				}
				
				var models = repoInfo.Models;
				var modelIndex = 0;
				for(var i in models){
					var model = models[i];
					var modelName = model.Name;
					var modelLoad = modelDataArray[modelName];
					if(!modelLoad){
						continue;
					}
					
					if(!model.ModelEmpirics){
						model.ModelEmpirics = {};
					}
					
					for(var j in modelDataArray[modelName]){
						model.ModelEmpirics[j] = modelDataArray[modelName][j];
					}
					
					console.log(model.ModelEmpirics);
					
					for (var j in evaluators){
						var evaluator = evaluators[j];
						if(evaluator.loadModelEmpirics){
							evaluator.loadModelEmpirics(modelLoad, model, modelIndex);
						}
					}
					
					modelIndex++;
				}
				
				if(callbackfunction){
					callbackfunction(repoInfo);
				}
			});
	}
	
	function loadUseCaseEmpirics(repoInfo, callbackfunc, dataFilePath){
			// dataFilePath is optional argument if don't get this we take csv file from repo itself.
			var csvDataFilePath = dataFilePath ? dataFilePath : repoInfo.outputDir+"/useCaseDataLoad.csv";
			console.log('usecaseFilePath:', csvDataFilePath);
			umlFileManager.loadCSVFile(csvDataFilePath, true, function(data){
			var useCaseData = {};
			for(var i in data){
				var dataElement = data[i];
				var useCaseArray = useCaseData[dataElement['PROJ']];
				if(useCaseArray === undefined){
					useCaseArray = {};
					useCaseData[dataElement['PROJ']] = useCaseArray;
				}
				
				var useCaseLabel = dataElement['UC'];
				useCaseArray[useCaseLabel] = {};
				for(var j in dataElement){
					useCaseArray[useCaseLabel][j] = dataElement[j];
				}
			}
			var models = repoInfo.models;
			var modelIndex = 0;
			for(var i in models){
				var model = models[i];

				var modelName = model.Name;
				 if(!useCaseData[modelName]){
					 continue;
				 }
				var useCases = model.UseCases;
				var useCaseIndex = 0;
				 for(var j in useCases){
					 var useCase = useCases[j];
					 var useCaseName = useCase.Name;
					 var useCaseLoad = useCaseData[modelName][useCaseName];
					 if(!useCaseLoad){
						 continue;
					 }
					 
					 // to distribute the use case data to the evaluators.
					 
					 for (var k in evaluators){
						 if(evaluators[k].loadUseCaseEmpirics){
							 evaluators[k].loadUseCaseEmpirics(useCaseLoad, useCase, useCaseIndex, model, modelIndex);
						 }
					 }
					 
					 useCaseIndex++;
				 }
			  modelIndex++;
			}
			
			if(callbackfunc){
				callbackfunc(repoInfo);
			}
			});
	}
	
	// to converge use case empirics and use case analytics, dump it and evaluate it.
	function toUseCaseEvaluationStr(useCase, useCaseNum){
		var useCaseEvaluationStr = "NUM,UC";
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toUseCaseEvaluationHeader){
				useCaseEvaluationStr += "," + evaluator.toUseCaseEvaluationHeader();
			}
		}
		
		useCaseEvaluationStr += "\n";
		
		if(useCaseNum !== 1){
			useCaseEvaluationStr = "";
		}
		
		useCaseEvaluationStr += useCaseNum+","+ useCase.Name.replace(/,/gi, "");
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toUseCaseEvaluationRow){
				useCaseEvaluationStr += "," + evaluator.toUseCaseEvaluationRow(useCase, useCaseNum);
			}
		}
		
		useCaseEvaluationStr += "\n";
		
		return useCaseEvaluationStr;
}
	
	
	function toDomainModelEvaluationStr(domainModel, domainModelNum){
		var domainModelEvaluationStr = "NUM,DM";
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toDomainModelEvaluationHeader){
				domainModelEvaluationStr += "," + evaluator.toDomainModelEvaluationHeader();
			}
		}
		
		domainModelEvaluationStr += "\n";
		
		if(domainModelNum !== 1){
			domainModelEvaluationStr = "";
		}
		
		domainModelEvaluationStr += domainModelNum+",domain_model";
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toDomainModelEvaluationRow){
				domainModelEvaluationStr += "," + evaluator.toDomainModelEvaluationRow(domainModel, domainModelNum);
			}
		}
		
		domainModelEvaluationStr += "\n";
		
		return domainModelEvaluationStr;
	}

	/*
	 * for the plugged in evaluators, they also can expand the output
	 */
	function toModelEvaluationStr(model, modelNum){
		var modelEvaluationStr = "NUM,PROJ";
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toModelEvaluationHeader){
				modelEvaluationStr += ","+evaluator.toModelEvaluationHeader();
			}
		}
		
		modelEvaluationStr += "\n";
		
		if(modelNum !== 1){
			modelEvaluationStr = "";
		}
		
		modelEvaluationStr += modelNum+","+ model.Name.replace(/,/gi, "");
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toModelEvaluationRow){
				modelEvaluationStr += "," + evaluator.toModelEvaluationRow(model, modelNum);
			}
		}
		
		modelEvaluationStr += "\n";
	
		return modelEvaluationStr;
	}
	
	function evaluateUseCase(useCase, model, callbackfunc){
		
		if(callbackfunc){
		// iterate the evaluators, which will do analysis on at the repo level and populate repo analytics

			if(!useCase){
				callbackfunc(false);
				return;
			}
			
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.evaluateUseCase){
				evaluator.evaluateUseCase(useCase, model, function(){
					console.log("use case evaluation finishes");
				});
			}
		}
		
		callbackfunc(useCase);
		
		}
		else{
			return useCase;
		}
	}
	
	function evaluateDomainModel(domainModel, callbackfunc){
		if(callbackfunc){
			// iterate the evaluators, which will do analysis on at the repo level and populate repo analytics
			
			if(!domainModel){
				callbackfunc(false);
				return;
			}
			
			for(var i in evaluators){
				var evaluator = evaluators[i];
				if(evaluator.evaluateDomainModel){
					evaluator.evaluateDomainModel(domainModel, function(){
						console.log("domain model evaluation finishes");
					});
				}
			}
			
			callbackfunc(domainModel);
			
			}
			else{
				return domainModel;
			}
	}
	
	function evaluateModel(model, callbackfunc){
		
		var useCaseNum = 1;
		var useCaseEvaluationStr = "";
		
		var domainModelNum = 1;
		var domainModelEvaluationStr = "";
		
		var modelNum = 1;
		var modelEvaluationStr = "";
		
		if(callbackfunc){
			
			if(!model){
				callbackfunc(false);
				return;
			}
		
		for(var i in model.UseCases){
			var useCase = model.UseCases[i];
			evaluateUseCase(useCase, model, function(){
					console.log('use case analysis is complete');
				});
//			
			useCaseEvaluationStr += toUseCaseEvaluationStr(useCase, useCaseNum);
			useCaseNum ++;
		}
		
		var domainModel = model.DomainModel;
		
		if(domainModel){
		evaluateDomainModel(domainModel, function(){
		console.log('doamin model analysis is complete');
		});
		

		domainModelEvaluationStr += toDomainModelEvaluationStr(domainModel, domainModelNum);
		domainModelNum ++;
		
		}
		
		// iterate the evaluators, which will do analysis on at the repo level and populate repo analytics
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.evaluateModel){
				evaluator.evaluateModel(model, function(){
					console.log('model evaluation finishes');
				});
			}
		}
		
		modelEvaluationStr += toModelEvaluationStr(model, modelNum);

		model.ModelEvaluationFileName = "modelEvaluation.csv";
		model.UseCaseEvaluationFileName = "useCaseEvaluation.csv";
		model.DomainModelEvaluationFileName = "domainModelEvaluation.csv";
		model.UseCaseStatisticsOutputDir = model.OutputDir+"/use_case_evaluation_statistics";
		model.DomainModelStatisticsOutputDir = model.OutputDir+"/domain_model_evaluation_statistics";
		
		var files = [{fileName : model.UseCaseEvaluationFileName , content : useCaseEvaluationStr},
			{fileName : model.DomainModelEvaluationFileName , content : domainModelEvaluationStr},
			{fileName : model.ModelEvaluationFileName , content : modelEvaluationStr}];
		
		umlFileManager.writeFiles(model.OutputDir, files, function(err){
			if(err) {
			 	console.log(err);
			 	if(callbackfunc){
			    	callbackfunc(false);
				} 
		    }
			else {
				
				for(var i in evaluators){
					var evaluator = evaluators[i];
					if(evaluator.analyseModelEvaluation){
						evaluator.analyseModelEvaluation(model);
					}
				}
				
				umlFileManager.makeDirs([model.UseCaseStatisticsOutputDir, model.DomainModelStatisticsOutputDir], function(result){
					console.log("test for model mkdir");
					if(result){
						//Needs to be upgraded soon
						console.log("apply statistical analysis on the output evaluation");
						var command = './Rscript/OutputStatistics.R "'+model.OutputDir+"/"+model.UseCaseEvaluationFileName+'" "'+model.UseCaseStatisticsOutputDir+'" "."';
						console.log(command);
						RScriptExec.runRScript(command,function(result2){
							
							if (!result2) {
								console.log("=========output statistics error==========");
							}
							
							var command = './Rscript/OutputStatistics.R "'+model.OutputDir+"/"+model.DomainModelEvaluationFileName+'" "'+model.DomainModelStatisticsOutputDir+'" "."';
							console.log(command);

							RScriptExec.runRScript(command,function(result3){
								if (!result3) {
									if(callbackfunc){
										console.log("=========output statistics error==========");
									}
								}
								if(callbackfunc){
									callbackfunc(model);
								}
								
							var debug = require("./utils/DebuggerOutput.js");
							debug.writeJson("new_model_8_21"+model._id, model);
							
							});
						});
					}
					else {
						if(callbackfunc){
							console.log("=========output statistics save error==========");
							callbackfunc(model);
						}
					}
					
				});
			}
				
		});
		
		}
		else{
			return model;
		}
		
	}

/*
 * callbackfunc is the function called when the analysis is finished.
 */
	function evaluateRepo(repoInfo, callbackfunc){
		var modelEvaluationStr = "";
		var modelNum = 1;
		

		var useCaseNum = 1;
		var useCaseEvaluationStr = "";
		
		var domainModelNum = 1;
		var domainModelEvaluationStr = "";
		
		console.log("model analysis complete1");
	
		if(callbackfunc){
			// iterate the hierarchy of the repo
			for(var i in repoInfo.Models){
				var model = repoInfo.Models[i];
				evaluateModel(model, function(){
					console.log('model analysis is complete!!!!!!!!!!');
				})
				
				modelEvaluationStr += toModelEvaluationStr(model, modelNum);
				modelNum ++;
				
				for(var i in model.UseCases){
					var useCase = model.UseCases[i];
					useCaseEvaluationStr += toUseCaseEvaluationStr(useCase, useCaseNum);
					useCaseNum ++;
				}
				
				var domainModel = model.DomainModel;

				if(domainModel){

				domainModelEvaluationStr += toDomainModelEvaluationStr(domainModel, domainModelNum);

				domainModelNum ++;
				}
			}
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
				
			}
			
		});
			
		}
		else {
			return repoInfo;
		}
	}
	
	
	
	module.exports = {
			loadUseCaseEmpirics: loadUseCaseEmpirics,
			loadModelEmpirics: loadModelEmpirics,
			evaluateUseCase: evaluateUseCase,
			evaluateDomainModel: evaluateDomainModel,
			evaluateModel: evaluateModel,
			evaluateRepo: evaluateRepo
	}
}());