/**
 * http://usejsdoc.org/
 * 
 * Integrate use case point evaluator to calculate eucp, exucp, ducp
 * 
 * Includes the methods  to calculate EUCP, EXUCP, DUCP, 
 */


(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var umlFileManager = require('../../UMLFileManager');
	var transactionProcessor = require('./TransactionProcessor.js');
	
	

	function initModelEmpirics() {
		return {
		EI : 0,
		EQ : 0,
		DM : 0,
		INT : 0,
		CTRL : 0,
		EXTIVK : 0,
		EXTCLL : 0,
		NT : 0
		}
	}
	
	function initUseCaseEmpirics(){
		return {
			EI : 0,
			EQ : 0,
			DM : 0,
			INT : 0,
			CTRL : 0,
			EXTIVK : 0,
			EXTCLL : 0,
			NT : 0
			}
	}

	function loadUseCaseEmpirics(useCaseInfo, useCaseIndex, modelInfo, modelIndex) {
		if(!useCaseInfo.UseCaseEmpirics){
			useCaseInfo.UseCaseEmpirics = initUseCaseEmpirics();
		}
		
		useCaseEmpirics.EI = Number(useCaseEmpirics.EI);
		useCaseEmpirics.EQ = Number(useCaseEmpirics.EQ);
		useCaseEmpirics.DM = Number(useCaseEmpirics.DM);
		useCaseEmpirics.INT = Number(useCaseEmpirics.INT);
		useCaseEmpirics.CTRL = Number(useCaseEmpirics.CTRL);
		useCaseEmpirics.EXTIVK = Number(useCaseEmpirics.EXTIVK);
		useCaseEmpirics.EXTCLL = Number(useCaseEmpirics.EXTCLL);
		useCaseEmpirics.NT = Number(useCaseEmpirics.NT);

		if (!modelInfo.ModelEmpirics || useCaseIndex == 0) {
			modelInfo.ModelEmpirics = initModelEmpirics();
		}
		
		var modelEmpirics = modelInfo.ModelEmpirics;

//		modelEmpirics.CCSS += useCaseEmpirics.CCSS;
		// modelEmpirics.IT += useCaseEmpirics.IT;
		modelEmpirics.EI += useCaseEmpirics.EI;
		modelEmpirics.EQ += useCaseEmpirics.EQ;
		modelEmpirics.DM += useCaseEmpirics.DM;
		modelEmpirics.INT += useCaseEmpirics.INT;
		modelEmpirics.CTRL += useCaseEmpirics.CTRL;
		modelEmpirics.EXTIVK += useCaseEmpirics.EXTIVK;
		modelEmpirics.EXTCLL += useCaseEmpirics.EXTCLL;
		modelEmpirics.NT += useCaseEmpirics.NT;

//		console.log(modelEmpirics);
	}
	
	function toModelEvaluationHeader(){
		return "EI,EI_EMP,EQ,EQ_EMP,INT,INT_EMP,DM,DM_EMP,CTRL,CTRL_EMP,EXTIVK,EXTIVK_EMP,EXTCLL,EXTCLL_EMP,TRAN_NA,NT,NT_EMP,Tran_Length,Arch_Diff";
	}

	function toModelEvaluationRow(modelInfo, index) {
		var modelAnalytics = modelInfo.ModelAnalytics;
		
		if(!modelInfo.ModelEmpirics){
			modelInfo.ModelEmpirics = initModelEmpirics();
		}
		
		var modelEmpirics = modelInfo.ModelEmpirics;

		return modelAnalytics.EI + ","
				+ modelEmpirics.EI + ","
				+ modelAnalytics.EQ + ","
				+ modelEmpirics.EQ + ","
				+ modelAnalytics.INT + ","
				+ modelEmpirics.INT + ","
				+ modelAnalytics.DM + ","
				+ modelEmpirics.DM + ","
				+ modelAnalytics.CTRL + ","
				+ modelEmpirics.CTRL + ","
				+ modelAnalytics.EXTIVK + ","
				+ modelEmpirics.EXTIVK + ","
				+ modelAnalytics.EXTCLL + ","
				+ modelEmpirics.EXTCLL + ","
				+ modelAnalytics.TRAN_NA + ","
				+ modelAnalytics.NT+ ","
				+ modelEmpirics.NT_EMP + ","
				+ modelAnalytics.Tran_Length+ ","
				+ modelAnalytics.Arch_Diff;
				;
	}
	
	function toUseCaseEvaluationHeader() {
		return "EI,EI_EMP,EQ,EQ_EMP,INT,INT_EMP,DM,DM_EMP,CTRL,CTRL_EMP,EXTIVK,EXTIVK_EMP,EXTCLL,EXTCLL_EMP,TRAN_NA,NT,NT_EMP,Tran_Length,Arch_Diff";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
		
		console.log("test for use case empirics");
		console.log(useCaseInfo);
		if(!useCaseInfo.UseCaseEmpirics){
			useCaseInfo.UseCaseEmpirics = initUseCaseEmpirics();
		}
		
		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;

		return useCaseAnalytics.EI + ","
		+ useCaseEmpirics.EI + ","
		+ useCaseAnalytics.EQ + ","
		+ useCaseEmpirics.EQ + ","
		+ useCaseAnalytics.INT + ","
		+ useCaseEmpirics.INT + ","
		+ useCaseAnalytics.DM + ","
		+ useCaseEmpirics.DM + ","
		+ useCaseAnalytics.CTRL + ","
		+ useCaseEmpirics.CTRL + ","
		+ useCaseAnalytics.EXTIVK + ","
		+ useCaseEmpirics.EXTIVK + ","
		+ useCaseAnalytics.EXTCLL + ","
		+ useCaseEmpirics.EXTCLL + ","
		+ useCaseAnalytics.TRAN_NA + ","
		+ useCaseAnalytics.NT+ ","
		+ useCaseEmpirics.NT_EMP + ","
		+ useCaseAnalytics.Tran_Length+ ","
		+ useCaseAnalytics.Arch_Diff;
		;
	}

	
	function evaluateUseCase(useCaseInfo, callbackfunc){
//		var useCaseAnalytics = initUseCaseAnalytics(useCaseInfo);
		useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
		
		useCaseAnalytics.INT = 0;
		useCaseAnalytics.DM = 0;
		useCaseAnalytics.CTRL = 0;
		useCaseAnalytics.EXTIVK  = 0;
		useCaseAnalytics.EXTCLL = 0;
		useCaseAnalytics.TRAN_NA = 0;
		useCaseAnalytics.NT = 0;
		useCaseAnalytics.Tran_Length = 0;
		useCaseAnalytics.Arch_Diff = 0;
		
		
		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			
			if (!diagram.DiagramAnalytics) {
				diagram.DiagramAnalytics = {};
			}
			
			diagramAnalytics = diagram.DiagramAnalytics;

			var INT = 0;
			var DM = 0;
			var CTRL = 0;
			var EXTIVK = 0;
			var EXTCLL = 0;
			var TRAN_NA = 0;
			var NT = 0;

//			diagram.DiagramAnalytics.Paths = [];
//			diagram.DiagramAnalytics.PathAnalyticsFileName = 'pathsAnalytics.csv';
//			useCaseAnalytics.Diagrams.push(diagram);
		
			for ( var j in diagram.Paths) {
				var path = diagram.Paths[j];
				// console.log('--------Process Path-------');
				
				transactionProcessor.processPath(path, diagram);

				var transactionalOperations = path.Transactional;
				
				if(transactionalOperations.indexOf("DM") > -1){
					DM++;
				}
				if(transactionalOperations.indexOf("INT") > -1){
					INT++;
				}
				if(transactionalOperations.indexOf("CTRL") > -1){
					CTRL++;
				}
				if(transactionalOperations.indexOf("EXTIVK") > -1){
					EXTIVK++;
				}
				if(transactionalOperations.indexOf("EXTCLL") > -1){
					EXTCLL++;
				}
				if(transactionalOperations.indexOf("TRAN_NA") > -1){
					TRAN_NA++;
				}
				else {
					NT ++;
				}
			}
			
			diagramAnalytics.INT = INT;
			diagramAnalytics.DM = DM;
			diagramAnalytics.CTRL = CTRL;
			diagramAnalytics.EXTIVK = EXTIVK;
			diagramAnalytics.EXTCLL = EXTCLL;
			diagramAnalytics.TRAN_NA = TRAN_NA;
			diagramAnalytics.NT = NT;
		}
		
			
			useCaseAnalytics.INT += diagramAnalytics.INT;
			useCaseAnalytics.DM += diagramAnalytics.DM;
			useCaseAnalytics.CTRL += diagramAnalytics.CTRL;
			useCaseAnalytics.EXTIVK += diagramAnalytics.EXTIVK;
			useCaseAnalytics.EXTCLL += diagramAnalytics.EXTCLL;
			useCaseAnalytics.TRAN_NA += diagramAnalytics.TRAN_NA;
			useCaseAnalytics.NT += diagramAnalytics.NT;
			useCaseAnalytics.ArchDiff = useCaseAnalytics.AvgDegree * useCaseAnalytics.AvgPathLength;
			
			if(callbackfunc){
				 dumpUseCaseTransactionsInfo(useCaseInfo, function(err){
					 		if(err){
					 			console.log(err);
					 			return;
					 		}
					 		
							console.log("evaluate transactions for the use cases");
							
							var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.TransactionalAnalyticsFileName+'" "'+useCaseAnalytics.OutputDir+'" "."';
//							console.log(command);
							var child = exec(command, function(error, stdout, stderr) {

								if (error !== null) {
									console.log('exec error: ' + error);
//									console.log('exec error: useCase id=' + useCaseAnalytics._id)
									if(callbackfunc){
										callbackfunc(false);
									}
								} 

								if(callbackfunc){
									callbackfunc(useCaseAnalytics);
								}
							});
				 });
			}
	}
	
	function evaluateModel(modelInfo, callbackfunc){
		//calculate the normalized use case point effort.
		var modelAnalytics = modelInfo.ModelAnalytics;
		
		modelAnalytics.INT = 0;
		modelAnalytics.DM = 0;
		modelAnalytics.CTRL = 0;
		modelAnalytics.EXTIVK = 0;
		modelAnalytics.EXTCLL = 0;
		modelAnalytics.TRAN_NA = 0;
		modelAnalytics.NT = 0;
		modelAnalytics.Tran_Length = 0;
		modelAnalytics.Arch_Diff = 0;
		
//		var modelEmpirics = modelInfo.ModelEmpirics;
		
//		var modelAnalytics = initModelAnalytics(modelInfo);
//		modelInfo.ModelAnalytics = modelAnalytics;

		//analyse use cases
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			var useCaseAnalytics = useCase.UseCaseAnalytics;
			
			modelAnalytics.INT += useCaseAnalytics.INT;
			modelAnalytics.DM += useCaseAnalytics.DM;
			modelAnalytics.CTRL += useCaseAnalytics.CTRL;
			modelAnalytics.EXTIVK += useCaseAnalytics.EXTIVK;
			modelAnalytics.EXTCLL += useCaseAnalytics.EXTCLL;
			modelAnalytics.TRAN_NA += useCaseAnalytics.TRAN_NA;
			modelAnalytics.NT += useCaseAnalytics.NT;
			modelAnalytics.Tran_Length = useCaseAnalytics.Tran_Length;
			modelAnalytics.Arch_Diff = useCaseAnalytics.Arch_Diff;
			
		}
		
		if(callbackfunc){
			 dumpModelTransactionsInfo(modelInfo, function(err){
				 if(err){
					 console.log(err);
					 return;
				 }
				 
					console.log("evaluate transactions for the model");
					
					var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+modelAnalytics.OutputDir+"/"+modelAnalytics.TransactionAnalyticsFileName+'" "'+modelAnalytics.OutputDir+'" "."';
//					console.log(command);
					var child = exec(command, function(error, stdout, stderr) {

						if (error) {
							console.log('exec error: ' + error);
//							console.log('exec error: useCase id=' + useCaseAnalytics._id)
							if(callbackfunc){
								callbackfunc(false);
							}
						} 

						if(callbackfunc){
							callbackfunc(modelAnalytics);
						}
					});
			 });
		}
	
	}
	
	function evaluateRepo(repoInfo, callbackfunc){
		var repoAnalytics = repoInfo.RepoAnalytics;
		
		repoAnalytics.INT = 0;
		repoAnalytics.DM = 0;
		repoAnalytics.CTRL = 0;
		repoAnalytics.EXTIVK = 0;
		repoAnalytics.EXTCLL = 0;
		repoAnalytics.TRAN_NA = 0;
		repoAnalytics.NT = 0;
		
		for(var i in repoInfo.models){
			var modelInfo = repoInfo.models[i];

//			modelInfo.ModelAnalytics = analyseModel(modelInfo, function(){
//					console.log("model analysis complete");
//				});

			var modelAnalytics = modelInfo.ModelAnalytics;
			

//			repoAnalytics.TotalPathLength += modelAnalytics.TotalPathLength;
//			repoAnalytics.PathNum += modelAnalytics.PathNum;
			

			repoAnalytics.EXTIVK += modelAnalytics.EXTIVK;
			repoAnalytics.EXTCLL += modelAnalytics.EXTCLL;
			repoAnalytics.INT += modelAnalytics.INT;
			repoAnalytics.DM += modelAnalytics.DM;
			repoAnalytics.CTRL += modelAnalytics.CTRL;
			repoAnalytics.TRAN_NA += modelAnalytics.TRAN_NA;
			repoAnalytics.NT += modelAnalytics.NT;
//			repoAnalytics.NWT += modelAnalytics.NWT;
//			repoAnalytics.NWT_DE += modelAnalytics.NWT_DE;
//			repoAnalytics.CCSS += modelAnalytics.CCSS;
		}
		
		 repoAnalytics.repoModelEvaluationResultsPath = repoAnalytics.OutputDir+"/Model_Evaluation_Results";
		 
			mkdirp(repoAnalytics.repoModelEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
						 var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/UseCasePointWeightsCalibration.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForModelsFileName+'" "'+repoAnalytics.repoModelEvaluationResultsPath+'"';	
						 console.log(command);
							var child = exec(command, function(error, stdout, stderr) {

								if (error !== null) {
//									console.log('exec error: ' + error);
									console.log('exec error: repo id=' + repoAnalytics._id);
								} 
								console.log("Repo Evaluation were saved!");
							});
			});
			
			if(callbackfunc){
				 dumpRepoTransactionsInfo(repoInfo, function(err){
					 if(err){
						 console.log(err);
						 return;
					 }
					 
					 console.log("evaluate transactions for the repo");
						
						var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.TransactionAnalyticsFileName+'" "'+repoAnalytics.OutputDir+'" "."';
//						console.log(command);
						var child = exec(command, function(error, stdout, stderr) {

							if (error !== null) {
								console.log('exec error: ' + error);
//								console.log('exec error: useCase id=' + useCaseAnalytics._id)
								if(callbackfunc){
									callbackfunc(false);
								}
							} 

							if(callbackfunc){
								callbackfunc(repoAnalytics);
							}
						});
				 });
			}
	}
	
	
	function dumpUseCaseTransactionsInfo(useCaseInfo, callbackfunc, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
		
		var transactionAnalyticsStr = transactionNum == 0 ? "id,path,diagram,useCase,transactional,tran_length,archi_diff\n" : "";
		
		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			
			for(var j in diagram.Paths){
				for(var k in diagram.Paths[j].Transactional){
				var transactionalOperation = diagram.Paths[j].Transactional[k];
				transactionNum++;
				transactionAnalyticsStr += transactionNum+","+
				diagram.Paths[j].PathStr.replace(/,/gi, "")+","+ 
				diagram.Name+","+ 
				useCaseInfo.Name+","+
				transactionalOperation+","+ 
				diagram.Paths[j].Elements.length+","+
				"0"+"\n";
				}
			}
		}
		
		if(callbackfunc){
		useCaseAnalytics.TransactionalAnalyticsFileName = "transactionalAnalytics.csv";
		var files = [{fileName : useCaseAnalytics.TransactionalAnalyticsFileName , content : transactionAnalyticsStr}];
		umlFileManager.writeFiles(useCaseAnalytics.OutputDir, files, callbackfunc);
		}
		
		return {
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum
		}
		
	}
	
	
	function dumpModelTransactionsInfo(modelInfo, callbackfunc, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
		var modelAnalytics = modelInfo.ModelAnalytics;
		
		var transactionAnalyticsStr = "";
		
//		var transactionAnalyticsStr = transactionNum == 0 ? "id,path,diagram,useCase,transactional,path_length\n" : "";
		
		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];
			var transactionDump = dumpUseCaseTransactionsInfo(useCaseInfo, null, transactionNum);
			transactionAnalyticsStr += transactionDump.transactionAnalyticsStr;
			transactionNum = transactionDump.transactionNum;
		}
		
		if(callbackfunc){
		modelAnalytics.TransactionAnalyticsFileName = "transactionAnalytics.csv";
		var files = [{fileName : modelAnalytics.TransactionAnalyticsFileName , content : transactionAnalyticsStr}];
		umlFileManager.writeFiles(modelAnalytics.OutputDir, files, callbackfunc);
		}
		
		return {
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum
		}
		
	}
	
	
	function dumpRepoTransactionsInfo(repoInfo, callbackfunc, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
		var repoAnalytics = repoInfo.RepoAnalytics;
		
//		var transactionAnalyticsStr = transactionNum == 0 ? "id,path,diagram,useCase,transactional,path_length\n" : "";
		
		var transactionAnalyticsStr = "";
		
		for ( var i in repoInfo.Models) {
			var model = repoInfo.Models[i];
			var transactionDump = dumpModelTransactionsInfo(model, null, transactionNum);
			transactionAnalyticsStr += transactionDump.transactionAnalyticsStr;
			transactionNum = transactionDump.transactionNum;
		}
		
		if(callbackfunc){
		repoAnalytics.TransactionAnalyticsFileName = "transactionAnalytics.csv";
		var files = [{fileName : repoAnalytics.TransactionAnalyticsFileName , content : transactionAnalyticsStr}];
		umlFileManager.writeFiles(repoAnalytics.OutputDir, files, callbackfunc);
		}
		
		return {
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum
		}
		
	}
	

	module.exports = {
		toModelEvaluationHeader: toModelEvaluationHeader,
		toModelEvaluationRow: toModelEvaluationRow,
		toUseCaseEvaluationHeader: toUseCaseEvaluationHeader,
		toUseCaseEvaluationRow: toUseCaseEvaluationRow,
		evaluateModel: evaluateModel,
		evaluateRepo: evaluateRepo,
		evaluateUseCase: evaluateUseCase,
		loadUseCaseEmpirics: loadUseCaseEmpirics
	}
	
	
}())