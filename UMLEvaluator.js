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
	var umlFileManager = require('./UMLFileManager');
	
	// current available evaluators
	var umlModelEvaluator = require('./evaluators/UMLModelElementsEvaluator/UMLModelEvaluator.js');
	var functionPointEvaluator = require('./evaluators/FunctionPointEvaluator/FunctionPointEvaluator.js');
	var transactionEvaluator = require('./evaluators/TransactionEvaluator/TransactionEvaluator.js');
	var modelVersionEvaluator = require('./evaluators/ModelVersionEvaluator/UMLModelVersionEvaluator.js');
	var useCasePointCalculator = require('./evaluators/UseCasePointCalculator.js');
	var cocomoCalculator = require('./evaluators/COCOMOCalculator.js');
	var projectTypeEvaluator = require('./evaluators/ProjectTypeEvaluator.js');
	var useCasePointWeightEvaluator = require('./evaluators/UseCasePointWeightEvaluator.js');
	
//	var evaluators = [cocomoCalculator, useCasePointCalculator, umlDiagramEvaluator,functionPointCalculator, projectEvaluator, useCasePointWeightEvaluator];
	var evaluators = [umlModelEvaluator,functionPointEvaluator, transactionEvaluator,modelVersionEvaluator, projectTypeEvaluator, cocomoCalculator,useCasePointWeightEvaluator,useCasePointCalculator];
//	function setUp(){
//		evaluators = [cocomoCalculator, useCaseCalculator, umlModelEvaluator];
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
				
				var models = repoInfo.models;
				var modelIndex = 0;
				for(var i in models){
					var model = models[i];
					var modelName = model.Name;
					var modelLoad = modelDataArray[modelName];
					if(!modelLoad){
						continue;
					}
					
//					if(!model.ModelEmpirics){
//						model.ModelEmpirics = {};
//					}
					
//					for(var j in modelDataArray[modelName]){
//						model.ModelEmpirics[j] = modelDataArray[modelName][j];
//					}
					
//					console.log(model.ModelEmpirics);
					
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
//				console.log('==========load model========');
//				console.log(model);
				var useCases = model.UseCases;
				var useCaseIndex = 0;
				 for(var j in useCases){
					 var useCaseInfo = useCases[j];
					 var useCaseName = useCaseInfo.Name;
					 var useCaseLoad = useCaseData[modelName][useCaseName];
					 if(!useCaseLoad){
						 continue;
					 }
					 
//					 if(!useCaseInfo.UseCaseEmpirics){
//						 useCaseInfo.UseCaseEmpirics = {};
//					 }
					 
//					 var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
				
//					 for(var k in useCaseLoad){
//						 useCaseEmpirics[k] = useCaseLoad[k];
//					 }
					 
					 // to distribute the use case data to the evaluators.
					 
					 for (var k in evaluators){
						 if(evaluators[k].loadUseCaseEmpirics){
							 evaluators[k].loadUseCaseEmpirics(useCaseLoad, useCaseInfo, useCaseIndex, model, modelIndex);
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
	function toUseCaseEvaluationStr(useCaseInfo, useCaseNum){
//		var useCaseEvaluationStr = "NUM,UC,CCSS,CCSS_ALY,UEUCW,UEUCW_ALY,IT,IT_ALY,UEXUCW,UEXUCW_ALY,ILF,ILF_ALY,ELF,ELF_ALY,EI,EI_ALY,EO,EO_ALY,EQ,EQ_ALY,ADD,ADD_ALY,CFP,CFP_ALY,DFP,DFP_ALY,AFP,AFP_ALY,Effort,Effort_ALY\n";
//		var useCaseEvaluationStr = "NUM,UC,CCSS_EMP,CCSS_ALY,UEUCW_EMP,UEUCW_ALY,UEXUCW_EMP,UEXUCW_ALY,EI_EMP,EI_ALY,EO_EMP,EO_ALY,EQ,EQ_ALY,FN,FN_ALY,DM, DM_ALY,INT,INT_ALY,CTRL,CTRL_ALY,EXTIVK,EXTIVK_ALY,EXTCLL,EXTCLL_ALY,TN,TN_ALY,Effort,Effort_ALY\n";
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
		
//
//		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
//		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
//		
		useCaseEvaluationStr += useCaseNum+","+ useCaseInfo.Name.replace(/,/gi, "");
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toUseCaseEvaluationRow){
				useCaseEvaluationStr += "," + evaluator.toUseCaseEvaluationRow(useCaseInfo, useCaseNum);
			}
		}
		
		useCaseEvaluationStr += "\n";
		
		return useCaseEvaluationStr;
}
	
	
	function toDomainModelEvaluationStr(domainModelInfo, domainModelNum){
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
		
//
//		var domainModelEmpirics = domainModelInfo.DomainModelEmpirics;
//		var domainModelAnalytics = domainModelInfo.DomainModelAnalytics;
//		
		domainModelEvaluationStr += domainModelNum+",domain_model";
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toDomainModelEvaluationRow){
				domainModelEvaluationStr += "," + evaluator.toDomainModelEvaluationRow(domainModelInfo, domainModelNum);
			}
		}
		
		domainModelEvaluationStr += "\n";
		
		return domainModelEvaluationStr;
	}

	/*
	 * for the plugged in evaluators, they also can expand the output
	 */
	function toModelEvaluationStr(modelInfo, modelNum){
//		var modelEmpirics = "PROJ,UC,CCSS,UEUCW,IT,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,VAF,AFPC\n";
		var modelEvaluationStr = "NUM,PROJ";
//		var useCaseEvaluationStr = "NUM,PROJ,UC,CCSS,UEUCW,IT,UEXUCW,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,AFP,Effort\n";
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toModelEvaluationHeader){
				modelEvaluationStr += ","+evaluator.toModelEvaluationHeader();
			}
		}
		
		modelEvaluationStr += "\n";
		
//		var modelAnalytics = modelInfo.ModelAnalytics;
//		var modelEmpirics = modelInfo.ModelEmpirics;
		
//		console.log(modelInfo);
		
		if(modelNum !== 1){
			modelEvaluationStr = "";
		}
		
		
		modelEvaluationStr += modelNum+","+ modelInfo.Name.replace(/,/gi, "");
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toModelEvaluationRow){
				modelEvaluationStr += "," + evaluator.toModelEvaluationRow(modelInfo, modelNum);
			}
		}
		
		modelEvaluationStr += "\n";
	
		return modelEvaluationStr;
	}
	
	function evaluateUseCase(useCaseInfo, callbackfunc){
		
		if(callbackfunc){
		// iterate the evaluators, which will do analysis on at the repo level and populate repo analytics
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.evaluateUseCase){
				evaluator.evaluateUseCase(useCaseInfo, function(){
					console.log("use case evaluation finishes");
				});
			}
		}
		
		callbackfunc(useCaseInfo);
		
		}
		else{
			return useCaseInfo;
		}
	}
	
	function evaluateDomainModel(domainModelInfo, callbackfunc){
		if(callbackfunc){
			// iterate the evaluators, which will do analysis on at the repo level and populate repo analytics
			
			for(var i in evaluators){
				var evaluator = evaluators[i];
				if(evaluator.evaluateDomainModel){
					evaluator.evaluateDomainModel(domainModelInfo, function(){
						console.log("domain model evaluation finishes");
					});
				}
			}
			
			callbackfunc(domainModelInfo);
			
			}
			else{
				return domainModelInfo;
			}
	}
	
	function evaluateModel(modelInfo, callbackfunc){

		var useCaseNum = 1;
//		var useCaseEmpiricss = [];
		var useCaseEvaluationStr = "";
		
		var domainModelNum = 1;
		var domainModelEvaluationStr = "";
		
		if(callbackfunc){
		
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			evaluateUseCase(useCase, function(){
					console.log('use case analysis is complete');
				});
//			
			useCaseEvaluationStr += toUseCaseEvaluationStr(useCase, useCaseNum);
//			useCaseEmpiricss.push(useCaseEmpirics);
			useCaseNum ++;
		}
		
		var domainModel = modelInfo.DomainModel;
		evaluateDomainModel(domainModel, function(){
					console.log('doamin model analysis is complete');
		});
		
		domainModelEvaluationStr += toDomainModelEvaluationStr(domainModel, domainModelNum);
//		useCaseEmpiricss.push(useCaseEmpirics);
//		domainModelNum ++;
		
		// iterate the evaluators, which will do analysis on at the repo level and populate repo analytics
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.evaluateModel){
				evaluator.evaluateModel(modelInfo, function(){
					console.log('model evaluation finishes');
				});
			}
		}
		
		modelInfo.UseCaseEvaluationFileName = "useCaseEvaluation.csv";
		modelInfo.DomainModelEvaluationFileName = "domainModelEvaluation.csv";
		
		var files = [{fileName : modelInfo.UseCaseEvaluationFileName , content : useCaseEvaluationStr},
			{fileName : modelInfo.DomainModelEvaluationFileName , content : domainModelEvaluationStr}];
		
		umlFileManager.writeFiles(modelInfo.OutputDir, files, function(err){
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
						evaluator.analyseModelEvaluation(modelInfo);
					}
				}
				
				 if(callbackfunc){
//						console.log(repoEvaluationsForUseCaseStr);
				    	callbackfunc(modelInfo);
					}
			}
				
		});
		
		}
		else{
			return modelInfo;
		}
		
	}
	
/*
 * callbackfunc is the function called when the analysis is finished.
 */
	function evaluateRepo(repoInfo, callbackfunc){
//		var modelEmpirics = "PROJ,UC,CCSS,UEUCW,IT,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,VAF,AFPC\n";
//		var repoEvaluationStr = "NUM,PROJ,UEUCW,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,AFP,VAF,AFPC,Effort\n";
		var modelEvaluationStr = "";
//		var repoEvaluationsForUseCase = [];
		var modelNum = 1;
//		if(index !== undefined){
//			useCaseNum = index;
//		}
		
		if(callbackfunc){
			// iterate the hierarchy of the repo
			for(var i in repoInfo.Models){
				var modelInfo = repoInfo.Models[i];
				evaluateModel(modelInfo, function(){
					console.log('model analysis is complete');
				})
				
//				var useCaseEmpirics = evaluateUseCase(useCaseInfo, modelInfo.umlModelName);
				modelEvaluationStr += toModelEvaluationStr(modelInfo, modelNum);
//				console.log(useCaseEvaluationStr);
				modelNum ++;
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
			
		var files = [{fileName : repoInfo.ModelEvaluationFileName , content : modelEvaluationStr}];
		
		umlFileManager.writeFiles(repoInfo.OutputDir, files, function(err){
			if(err) {
			 	console.log(err);
			 	if(callbackfunc){
			    	callbackfunc(false);
				} 
		    }
			else {
				
				for(var i in evaluators){
					var evaluator = evaluators[i];
					if(evaluator.analyseRepoEvaluation){
						evaluator.analyseRepoEvaluation(repoInfo);
					}
				}
				
				 if(callbackfunc){
//						console.log(repoEvaluationsForUseCaseStr);
				    	callbackfunc(repoInfo);
					}
			}
			
		});
			
		}
		else {
			return repoInfo;
		}
		
	}
	
	/*
	 * Thinking about get rid of the analytics part totally.
	 * The specfic analytics will be embedded from the evaluator plugins.
	 */
	
	
	
	module.exports = {
			loadUseCaseEmpirics: loadUseCaseEmpirics,
			loadModelEmpirics: loadModelEmpirics,
			evaluateUseCase: evaluateUseCase,
			evaluateDomainModel: evaluateDomainModel,
			evaluateModel: evaluateModel,
			evaluateRepo: evaluateRepo
	}
}());