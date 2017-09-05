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
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	
	// current available evaluators
	var useCasePointCalculator = require('./evaluators/UseCasePointCalculator.js');
	var cocomoCalculator = require('./evaluators/COCOMOCalculator.js');
	var umlDiagramEvaluator = require('./evaluators/UMLDiagramEvaluator.js');
	var functionPointCalculator = require('./evaluators/FunctionPointEvaluator.js');
	var evaluators = [cocomoCalculator, useCasePointCalculator, umlDiagramEvaluator,functionPointCalculator];
//	function setUp(){
//		evaluators = [cocomoCalculator, useCaseCalculator, umlModelEvaluator];
//		for(var i in evaluators){
//			evaluators[i].steUp();
//		}
//	}
	
	function loadModelEmpiricsForRepo(repoInfo, callbackfunction){
			var ModelDataFilePath = repoInfo.outputDir+"/ModelDataLoad.csv";
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
					var modelName = model.umlModelName;
					if(!modelDataArray[modelName]){
						continue;
					}
					
					if(!model.ModelEmpirics){
						model.ModelEmpirics = {};
					}
					
					for(var j in modelDataArray[modelName]){
						model.ModelEmpirics[j] = modelDataArray[modelName][j];
					}
					
//					console.log(model.ModelEmpirics);
					
					for (var m in evaluators){
						var evaluator = evaluators[m];
						if(evaluator.loadFromModelEmpirics){
							evaluator.loadFromModelEmpirics(model.ModelEmpirics, model, modelIndex);
						}
					}
					modelIndex++;
				}
				
				if(callbackfunction){
					callbackfunction(repoInfo);
				}
			});
	}
	
	function loadUseCaseEmpiricsForRepo(repoInfo, callbackfunc){
			var csvDataFilePath = repoInfo.outputDir+"/useCaseDataLoad.csv";
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

				var modelName = model.umlModelName;
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
					 
					 if(!useCaseInfo.UseCaseEmpirics){
						 useCaseInfo.UseCaseEmpirics = {};
					 }
					 
					 var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
				
					 for(var k in useCaseLoad){
						 useCaseEmpirics[k] = useCaseLoad[k];
					 }
					 
					 // to distribute the use case data to the evaluators.
					 
					 for (var k in evaluators){
						 if(evaluators[k].loadFromUseCaseEmpirics){
							 evaluators[k].loadFromUseCaseEmpirics(useCaseEmpirics, useCaseInfo, useCaseIndex, model, modelIndex);
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
	
	//This well be called when there is a change in the analytical data
	function redoUseCaseEvaluation(useCaseInfo){
		if(!useCaseInfo.UseCaseEmpirics){
			useCaseInfo.UseCaseEmpirics = {};
		}
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.evaluateUseCase){
				evaluator.evaluateUseCase(useCaseInfo);
			}
		}
		
	}
	
	// to converge use case empirics and use case analytics, dump it and evaluate it.
	function toUseCaseEvaluationStr(useCaseInfo, useCaseNum, header){
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
		
		if(!header){
			useCaseEvaluationStr = "";
		}
		
		var index = 0;
		if(useCaseNum){
			index = useCaseNum;
		}
		
//
//		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
//		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
//		
		useCaseEvaluationStr += index+","+ useCaseInfo.UseCaseAnalytics.Name.replace(/,/gi, "");
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toUseCaseEvaluationRow){
				useCaseEvaluationStr += "," + evaluator.toUseCaseEvaluationRow(useCaseInfo, index);
			}
		}
		
		useCaseEvaluationStr += "\n";
		
		return useCaseEvaluationStr;
}
	
	
	function redoModelEvaluation(modelInfo){
		if(!modelInfo.ModelEmpirics){
			modelInfo.ModelEmpirics = {};
		}
		
		for(i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.evaluateModel)
			{
			evaluator.evaluateModel(modelInfo);
			}
		}
		
	}
	

	/*
	 * for the plugged in evaluators, they also can expand the output
	 */
	function toModelEvaluationStr(modelInfo, modelNum, header){
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
		
		if(!header){
			modelEvaluationStr = "";
		}
		
		var index = 0;
		
		if(modelNum){
			index = modelNum;
		}
		
		modelEvaluationStr += index+","+ modelInfo.ModelAnalytics.Name.replace(/,/gi, "");
		
		for(var i in evaluators){
			var evaluator = evaluators[i];
			if(evaluator.toModelEvaluationRow){
				modelEvaluationStr += "," + evaluator.toModelEvaluationRow(modelInfo, index);
			}
		}
		
		modelEvaluationStr += "\n";
	
		return modelEvaluationStr;
	}
	
	function evaluateModelForUseCases(modelInfo, callbackfunc, refresh){
		var modelAnalytics = modelInfo.ModelAnalytics;

		var useCaseNum = 1;
//		var useCaseEmpiricss = [];
		var useCaseEvaluationStr = "";
		for(var i in modelInfo.UseCases){
			
			if(refresh){
				redoUseCaseEvaluation(modelInfo.UseCases[i]);
			}
			
			//too many such sentences to check if usecaseEmpirics and modelEmpirics exist.
			if(!modelInfo.UseCases[i].UseCaseEmpirics){
				modelInfo.UseCases[i].UseCaseEmpirics = {};
			}
//			
			var useCaseEvaluationHeader = false;
			if(useCaseNum === 1){
				useCaseEvaluationHeader = true;
			}
			else{
				useCaseEvaluationHeader = false;
			}
			useCaseEvaluationStr += toUseCaseEvaluationStr(modelInfo.UseCases[i], useCaseNum, useCaseEvaluationHeader);
//			useCaseEmpiricss.push(useCaseEmpirics);
			useCaseNum ++;
		
		}
		
		
		
		
		mkdirp(modelAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
		    	callbackfunc(false);
				}
		        return;
		    }
			
		    
		    fs.writeFile(modelAnalytics.OutputDir+"/"+modelAnalytics.ModelEmpiricsForUseCasesFileName, useCaseEvaluationStr, function(err){
				 if(err) {
					 	console.log(err);
					 	if(callbackfunc !== undefined){
					    	callbackfunc(false);
							}
				        return; 
				    }
				 
					for(i in evaluators){
						var evaluator = evaluators[i];
						if(evaluator.evaluateModelForUseCases)
						{
						evaluator.evaluateModelForUseCases(modelAnalytics);
						}
					}
					 	
					    console.log("Repo Evaluation were saved!");
//					    generateModelStatisticalCharts(modelAnalytics, callbackfunc);
					    if(callbackfunc !== undefined){
//							console.log(useCaseEvaluationStr);
					    	callbackfunc(useCaseEvaluationStr, modelInfo);
						}
					  
			});
		

		});
		

//		var useCaseEmpiricsResult = {index: useCaseNum, useCaseEvaluationStr: useCaseEvaluationStr, useCaseEmpiricss:useCaseEmpiricss};
		return useCaseEvaluationStr;
	}
	
	
	function evaluateRepoForModels(repo, callbackfunc, refresh){
//		var modelEmpirics = "PROJ,UC,CCSS,UEUCW,IT,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,VAF,AFPC\n";
		var repoAnalytics = repo.RepoAnalytics;
//		var repoEvaluationStr = "NUM,PROJ,UEUCW,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,AFP,VAF,AFPC,Effort\n";
		var modelEvaluationStr = "";
//		var modelEmpiricss = [];
		var modelNum = 1;
//		if(index !== undefined){
//			modelNum = index;
//		}
		
		for(var i in repo.models){
//			console.log("dump diagram Analytics");
			var modelInfo = repo.models[i];
			
			if(refresh){
				redoModelEvaluation(modelInfo);
			}
			
			if(!modelInfo.ModelEmpirics){
				modelInfo.ModelEmpirics = {};
			}
			
//			console.log("model evaluations");
//			console.log(modelEmpiricss);
			var modelEvaluationHeader = false;
//			for(var j in modelEmpiricss){
				if(modelNum === 1){
					modelEvaluationHeader = true;
				} else{
					modelEvaluationHeader = false;
				}
//			var modelEmpirics = modelEmpiricss[j];
			modelEvaluationStr += toModelEvaluationStr(modelInfo,modelNum,modelEvaluationHeader);
//			modelEmpiricss.push(modelEmpirics);
			modelNum++;
			header = false;
//			}
		}
		
		mkdirp(repoAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
		    	callbackfunc(false);
				}
		        return;
		    }
		  
		    fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForModelsFileName, modelEvaluationStr, function(err){
				 if(err) {
					 	console.log(err);
					 	if(callbackfunc !== undefined){
					    	callbackfunc(false);
							}
				        return; 
				    }
				 

					for(i in evaluators){
						var evaluator = evaluators[i];
						if(evaluator.evaluateRepoForModels)
						{
						evaluator.evaluateRepoForModels(repoAnalytics);
						}
					}
					

//				    generateModelStatisticalCharts(modelAnalytics, callbackfunc);
				    if(callbackfunc){
//						console.log(modelEvaluationStr);
				    	callbackfunc(modelEvaluationStr, repoAnalytics);
					}
				
					
			});
		

		});
		

//		var modelEmpiricsResult = {index: modelNum, modelEvaluationStr: modelEvaluationStr, modelEmpiricss:modelEmpiricss};
//		return modelEmpiricsResult;
		return modelEvaluationStr
	}
	
	function evaluateRepoForUseCases(repo, callbackfunc, refresh){
//		var modelEmpirics = "PROJ,UC,CCSS,UEUCW,IT,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,ILF,ELF,EI,EO,EQ,ADD,CFP,DFP,VAF,AFPC\n";
		var repoAnalytics = repo.RepoAnalytics;
//		var repoEvaluationStr = "NUM,PROJ,UEUCW,UEXUCW,UAW,TCF,EF,EUCP,EXUCP,AFP,VAF,AFPC,Effort\n";
		var useCaseEvaluationStr = "";
//		var repoEvaluationsForUseCase = [];
		var useCaseNum = 1;
//		if(index !== undefined){
//			useCaseNum = index;
//		}
//		
		
		for(var i in repo.models){
//			console.log("dump diagram Analytics");
			var modelInfo = repo.models[i];
			for(var j in modelInfo.UseCases){
			var useCaseInfo = modelInfo.UseCases[j];
			
			if(refresh){
				redoUseCaseEvaluation(modelInfo.UseCases[i]);
			}
			
			if(!modelInfo.UseCases[j].UseCaseEmpirics){
				modelInfo.UseCases[j].UseCaseEmpirics = {};
			}
			
			var useCaseEvaluationHeader = false;
			if(useCaseNum === 1){
				useCaseEvaluationHeader = true;
			}
			else{
				useCaseEvaluationHeader = false;
			}
//			var useCaseEmpirics = evaluateUseCase(useCaseInfo, modelInfo.umlModelName);
			useCaseEvaluationStr += toUseCaseEvaluationStr(useCaseInfo, useCaseNum, useCaseEvaluationHeader);
//			repoEvaluationsForUseCase.push(useCaseEmpirics);
//			console.log(useCaseEvaluationStr);
			header = false;
			useCaseNum ++;
			}
		}
		
		
		mkdirp(repoAnalytics.OutputDir, function(err) { 
			if(err) {
				console.log(err);
				if(callbackfunc !== undefined){
		    	callbackfunc(false);
				}
		        return;
		    }
		  
		    fs.writeFile(repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForUseCasesFileName, useCaseEvaluationStr, function(err){
				 if(err) {
					 	console.log(err);
					 	if(callbackfunc !== undefined){
					    	callbackfunc(false);
							}
				        return; 
				    }

					for(i in evaluators){
						var evaluator = evaluators[i];
						if(evaluator.evaluateRepoForUseCases)
						{
						evaluator.evaluateRepoForUseCases(repoAnalytics);
						}
					}
					    console.log("Repo Evaluation were saved!");
//					    generateModelStatisticalCharts(modelAnalytics, callbackfunc);
					    if(callbackfunc){
//							console.log(repoEvaluationsForUseCaseStr);
					    	callbackfunc(useCaseEvaluationStr, repoAnalytics);
						}
					  
			});
		

		});
		
//		{index: useCaseNum, useCaseEvaluationStr: useCaseEvaluationStr, repoEvaluationsForUseCase:repoEvaluationsForUseCase};
		return useCaseEvaluationStr;
	}
	
	
	module.exports = {
			loadUseCaseEmpiricsForRepo: loadUseCaseEmpiricsForRepo,
			loadModelEmpiricsForRepo: loadModelEmpiricsForRepo,
			evaluateModelForUseCases: evaluateModelForUseCases,
			evaluateRepoForUseCases: evaluateRepoForUseCases,
			evaluateRepoForModels: evaluateRepoForModels,
			redoUseCaseEvaluation: redoUseCaseEvaluation,
			redoModelEvaluation: redoModelEvaluation
	}
}());