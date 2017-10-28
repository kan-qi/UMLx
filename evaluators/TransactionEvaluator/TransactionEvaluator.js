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
	

	function loadUseCaseEmpirics(useCaseInfo, useCaseIndex, modelInfo, modelIndex) {
//		if(!useCaseInfo['TransactionEmpirics']){
//			useCaseInfo['TransactionEmpirics'] = initTransactionEmpirics();
//		}
		
		useCaseInfo['TransactionEmpirics'] = {
				EI : 0,
				EQ : 0,
				DM : 0,
				INT : 0,
				CTRL : 0,
				EXTIVK : 0,
				EXTCLL : 0,
				NT : 0
				};
		
		useCaseInfo['TransactionEmpirics'].EI = Number(useCaseInfo['TransactionEmpirics'].EI);
		useCaseInfo['TransactionEmpirics'].EQ = Number(useCaseInfo['TransactionEmpirics'].EQ);
		useCaseInfo['TransactionEmpirics'].DM = Number(useCaseInfo['TransactionEmpirics'].DM);
		useCaseInfo['TransactionEmpirics'].INT = Number(useCaseInfo['TransactionEmpirics'].INT);
		useCaseInfo['TransactionEmpirics'].CTRL = Number(useCaseInfo['TransactionEmpirics'].CTRL);
		useCaseInfo['TransactionEmpirics'].EXTIVK = Number(useCaseInfo['TransactionEmpirics'].EXTIVK);
		useCaseInfo['TransactionEmpirics'].EXTCLL = Number(useCaseInfo['TransactionEmpirics'].EXTCLL);
		useCaseInfo['TransactionEmpirics'].NT = Number(useCaseInfo['TransactionEmpirics'].NT);

		if (!modelInfo['TransactionEmpirics'] || useCaseIndex == 0) {
			modelInfo['TransactionEmpirics'] = {
					EI : 0,
					EQ : 0,
					DM : 0,
					INT : 0,
					CTRL : 0,
					EXTIVK : 0,
					EXTCLL : 0,
					NT : 0
					};
		}
		
		
		
//		var modelInfo['TransactionEmpirics'] = modelInfo['TransactionEmpirics'];

//		modelInfo['TransactionEmpirics'].CCSS += useCaseInfo['TransactionEmpirics'].CCSS;
		// modelInfo['TransactionEmpirics'].IT += useCaseInfo['TransactionEmpirics'].IT;
		modelInfo['TransactionEmpirics'].EI += useCaseInfo['TransactionEmpirics'].EI;
		modelInfo['TransactionEmpirics'].EQ += useCaseInfo['TransactionEmpirics'].EQ;
		modelInfo['TransactionEmpirics'].DM += useCaseInfo['TransactionEmpirics'].DM;
		modelInfo['TransactionEmpirics'].INT += useCaseInfo['TransactionEmpirics'].INT;
		modelInfo['TransactionEmpirics'].CTRL += useCaseInfo['TransactionEmpirics'].CTRL;
		modelInfo['TransactionEmpirics'].EXTIVK += useCaseInfo['TransactionEmpirics'].EXTIVK;
		modelInfo['TransactionEmpirics'].EXTCLL += useCaseInfo['TransactionEmpirics'].EXTCLL;
		modelInfo['TransactionEmpirics'].NT += useCaseInfo['TransactionEmpirics'].NT;

//		console.log(modelInfo['TransactionEmpirics']);
	}
	
	function toModelEvaluationHeader(){
		return "EI,EQ,INT,DM,CTRL,EXTIVK,EXTCLL,TRAN_NA,NT,Tran_Length,Arch_Diff";
//		return "EI,EI_EMP,EQ,EQ_EMP,INT,INT_EMP,DM,DM_EMP,CTRL,CTRL_EMP,EXTIVK,EXTIVK_EMP,EXTCLL,EXTCLL_EMP,TRAN_NA,NT,NT_EMP,Tran_Length,Arch_Diff";
	}

	function toModelEvaluationRow(modelInfo, index) {
//		var modelInfo['TransactionAnalytics'] = modelInfo.ModelAnalytics;
		
//		if(!modelInfo['TransactionEmpirics']){
//			modelInfo['TransactionEmpirics'] = initModelEmpirics();
//		}
		
//		var modelInfo['TransactionEmpirics'] = modelInfo['TransactionEmpirics'];

		return modelInfo['TransactionAnalytics'].EI + ","
//				+ modelInfo['TransactionEmpirics'].EI + ","
				+ modelInfo['TransactionAnalytics'].EQ + ","
//				+ modelInfo['TransactionEmpirics'].EQ + ","
				+ modelInfo['TransactionAnalytics'].INT + ","
//				+ modelInfo['TransactionEmpirics'].INT + ","
				+ modelInfo['TransactionAnalytics'].DM + ","
//				+ modelInfo['TransactionEmpirics'].DM + ","
				+ modelInfo['TransactionAnalytics'].CTRL + ","
//				+ modelInfo['TransactionEmpirics'].CTRL + ","
				+ modelInfo['TransactionAnalytics'].EXTIVK + ","
//				+ modelInfo['TransactionEmpirics'].EXTIVK + ","
				+ modelInfo['TransactionAnalytics'].EXTCLL + ","
//				+ modelInfo['TransactionEmpirics'].EXTCLL + ","
				+ modelInfo['TransactionAnalytics'].TRAN_NA + ","
				+ modelInfo['TransactionAnalytics'].NT+ ","
//				+ modelInfo['TransactionEmpirics'].NT_EMP + ","
				+ modelInfo['TransactionAnalytics'].Tran_Length+ ","
				+ modelInfo['TransactionAnalytics'].Arch_Diff;
				;
	}
	
	function toUseCaseEvaluationHeader() {
//		return "EI,EI_EMP,EQ,EQ_EMP,INT,INT_EMP,DM,DM_EMP,CTRL,CTRL_EMP,EXTIVK,EXTIVK_EMP,EXTCLL,EXTCLL_EMP,TRAN_NA,NT,NT_EMP,Tran_Length,Arch_Diff";
		return "EI,EQ,INT,DM,CTRL,EXTIVK,EXTCLL,TRAN_NA,NT,Avg_Tran_Length,Arch_Diff";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {
//		var useCaseInfo['TransactionAnalytics'] = useCaseInfo.UseCaseAnalytics;
//		
//		console.log("test for use case empirics");
//		console.log(useCaseInfo);
//		if(!useCaseInfo['TransactionEmpirics']){
//			useCaseInfo['TransactionEmpirics'] = initTransactionEmpirics();
//		}
		
//		var useCaseInfo['TransactionEmpirics'] = useCaseInfo['TransactionEmpirics'];

		return useCaseInfo['TransactionAnalytics'].EI + ","
//		+ useCaseInfo['TransactionEmpirics'].EI + ","
		+ useCaseInfo['TransactionAnalytics'].EQ + ","
//		+ useCaseInfo['TransactionEmpirics'].EQ + ","
		+ useCaseInfo['TransactionAnalytics'].INT + ","
//		+ useCaseInfo['TransactionEmpirics'].INT + ","
		+ useCaseInfo['TransactionAnalytics'].DM + ","
//		+ useCaseInfo['TransactionEmpirics'].DM + ","
		+ useCaseInfo['TransactionAnalytics'].CTRL + ","
//		+ useCaseInfo['TransactionEmpirics'].CTRL + ","
		+ useCaseInfo['TransactionAnalytics'].EXTIVK + ","
//		+ useCaseInfo['TransactionEmpirics'].EXTIVK + ","
		+ useCaseInfo['TransactionAnalytics'].EXTCLL + ","
//		+ useCaseInfo['TransactionEmpirics'].EXTCLL + ","
		+ useCaseInfo['TransactionAnalytics'].TRAN_NA + ","
		+ useCaseInfo['TransactionAnalytics'].NT+ ","
//		+ useCaseInfo['TransactionEmpirics'].NT_EMP + ","
		+ useCaseInfo['TransactionAnalytics'].AvgTranLength+ ","
		+ useCaseInfo['TransactionAnalytics'].ArchDiff;
		;
	}

	
	function evaluateUseCase(useCaseInfo, callbackfunc){
//		var useCaseInfo['TransactionAnalytics'] = initUseCaseAnalytics(useCaseInfo);
		useCaseInfo['TransactionAnalytics'] = {
				EI : 0,
				EQ : 0,
				INT: 0,
				DM: 0,
				CTRL: 0,
				EXTIVK : 0,
				EXTCLL: 0,
				TRAN_NA: 0,
				NT: 0,
				TranLength: 0,
				AvgTranLength: 0,
				ArchDiff: 0
		}
		
		
		
		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			
//			if (!diagram.DiagramAnalytics) {
//				diagram.DiagramAnalytics = {};
//			}
			var EI = 0;
			var EQ = 0;
			var INT = 0;
			var DM = 0;
			var CTRL = 0;
			var EXTIVK = 0;
			var EXTCLL = 0;
			var TRAN_NA = 0;
			var NT = 0;
			var TranLength = 0;

//			diagram.DiagramAnalytics.Paths = [];
//			diagram.DiagramAnalytics.PathAnalyticsFileName = 'pathsAnalytics.csv';
//			useCaseInfo['TransactionAnalytics'].Diagrams.push(diagram);
		
			for ( var j in diagram.Paths) {
				
				var path = diagram.Paths[j];
				// console.log('--------Process Path-------');
				
				transactionProcessor.processPath(path, diagram);

				var transactionalOperations = path['TransactionAnalytics'].Transactional;
				if(transactionalOperations.indexOf("EI") > -1){
					EI++;
				}
				if(transactionalOperations.indexOf("EQ") > -1){
					EQ++;
				}
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
					TranLength += path['TransactionAnalytics'].TranLength;
				}
				
			}
			
			diagram['TransactionAnalytics'] = {};
			diagram['TransactionAnalytics'].EI = EI;
			diagram['TransactionAnalytics'].EQ = EQ;
			diagram['TransactionAnalytics'].INT = INT;
			diagram['TransactionAnalytics'].DM = DM;
			diagram['TransactionAnalytics'].CTRL = CTRL;
			diagram['TransactionAnalytics'].EXTIVK = EXTIVK;
			diagram['TransactionAnalytics'].EXTCLL = EXTCLL;
			diagram['TransactionAnalytics'].TRAN_NA = TRAN_NA;
			diagram['TransactionAnalytics'].NT = NT;
			diagram['TransactionAnalytics'].TranLength = TranLength;
			

			useCaseInfo['TransactionAnalytics'].EI += diagram['TransactionAnalytics'].EI;
			useCaseInfo['TransactionAnalytics'].EQ += diagram['TransactionAnalytics'].EQ;
			useCaseInfo['TransactionAnalytics'].INT += diagram['TransactionAnalytics'].INT;
			useCaseInfo['TransactionAnalytics'].DM += diagram['TransactionAnalytics'].DM;
			useCaseInfo['TransactionAnalytics'].CTRL += diagram['TransactionAnalytics'].CTRL;
			useCaseInfo['TransactionAnalytics'].EXTIVK += diagram['TransactionAnalytics'].EXTIVK;
			useCaseInfo['TransactionAnalytics'].EXTCLL += diagram['TransactionAnalytics'].EXTCLL;
			useCaseInfo['TransactionAnalytics'].TRAN_NA += diagram['TransactionAnalytics'].TRAN_NA;
			useCaseInfo['TransactionAnalytics'].NT += diagram['TransactionAnalytics'].NT;
			useCaseInfo['TransactionAnalytics'].TranLength += diagram['TransactionAnalytics'].TranLength;
			
//			console.log(useCaseInfo['TransactionAnalytics']);
		}
		
		useCaseInfo['TransactionAnalytics'].AvgTranLength = useCaseInfo['TransactionAnalytics'].NT == 0 ? 0 : useCaseInfo['TransactionAnalytics'].TranLength/useCaseInfo['TransactionAnalytics'].NT;
		useCaseInfo['TransactionAnalytics'].ArchDiff =  useCaseInfo['TransactionAnalytics'].AvgPathLength * useCaseInfo["ElementAnalytics"].AvgDegree;
			
			if(callbackfunc){
				 dumpUseCaseTransactionsInfo(useCaseInfo, function(err){
					 		if(err){
					 			console.log(err);
					 			return;
					 		}
					 		
							console.log("evaluate transactions for the use cases");
							
							var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+useCaseInfo.OutputDir+"/"+useCaseInfo['TransactionAnalytics'].TransactionalAnalyticsFileName+'" "'+useCaseInfo.OutputDir+'" "."';
//							console.log(command);
							var child = exec(command, function(error, stdout, stderr) {

								if (error !== null) {
									console.log('exec error: ' + error);
//									console.log('exec error: useCase id=' + useCaseInfo['TransactionAnalytics']._id)
									if(callbackfunc){
										callbackfunc(false);
									}
								} 

								if(callbackfunc){
									callbackfunc(useCaseInfo['TransactionAnalytics']);
								}
							});
				 });
			}
	}
	
	function evaluateModel(modelInfo, callbackfunc){
		//calculate the normalized use case point effort.
		modelInfo['TransactionAnalytics'] = {
				EI : 0,
				EQ : 0,
				INT:0,
				DM:0,
				CTRL:0,
				EXTIVK:0,
				EXTCLL:0,
				TRAN_NA:0,
				NT:0,
				TranLength: 0,
				AVgTranLength:0,
				ArchDiff:0
		};
		
		
//		var modelInfo['TransactionEmpirics'] = modelInfo['TransactionEmpirics'];
		
//		var modelInfo['TransactionAnalytics'] = initModelAnalytics(modelInfo);
//		modelInfo.ModelAnalytics = modelInfo['TransactionAnalytics'];

		//analyse use cases
		for(var i in modelInfo.UseCases){
			var useCaseInfo = modelInfo.UseCases[i];
//			var useCaseInfo['TransactionAnalytics'] = useCase.UseCaseAnalytics;
			modelInfo['TransactionAnalytics'].EI += useCaseInfo['TransactionAnalytics'].EI;
			modelInfo['TransactionAnalytics'].EQ += useCaseInfo['TransactionAnalytics'].EQ;
			modelInfo['TransactionAnalytics'].INT += useCaseInfo['TransactionAnalytics'].INT;
			modelInfo['TransactionAnalytics'].DM += useCaseInfo['TransactionAnalytics'].DM;
			modelInfo['TransactionAnalytics'].CTRL += useCaseInfo['TransactionAnalytics'].CTRL;
			modelInfo['TransactionAnalytics'].EXTIVK += useCaseInfo['TransactionAnalytics'].EXTIVK;
			modelInfo['TransactionAnalytics'].EXTCLL += useCaseInfo['TransactionAnalytics'].EXTCLL;
			modelInfo['TransactionAnalytics'].TRAN_NA += useCaseInfo['TransactionAnalytics'].TRAN_NA;
			modelInfo['TransactionAnalytics'].NT += useCaseInfo['TransactionAnalytics'].NT;
			modelInfo['TransactionAnalytics'].TranLength += useCaseInfo['TransactionAnalytics'].Tran_Length;
		}

		modelInfo['TransactionAnalytics'].AvgTranLength = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : modelInfo['TransactionAnalytics'].TranLength/modelInfo['TransactionAnalytics'].NT;
		modelInfo['TransactionAnalytics'].ArchDiff = modelInfo['TransactionAnalytics'].AvgTranLength*modelInfo["ElementAnalytics"].AvgDegree;
		
		if(callbackfunc){
			 dumpModelTransactionsInfo(modelInfo, function(err){
				 if(err){
					 console.log(err);
					 return;
				 }
				 
					console.log("evaluate transactions for the model");
					
					var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo['TransactionAnalytics'].TransactionAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "."';
//					console.log(command);
					var child = exec(command, function(error, stdout, stderr) {

						if (error) {
							console.log('exec error: ' + error);
//							console.log('exec error: useCase id=' + useCaseInfo['TransactionAnalytics']._id)
							if(callbackfunc){
								callbackfunc(false);
							}
						} 

						if(callbackfunc){
							callbackfunc(modelInfo['TransactionAnalytics']);
						}
					});
			 });
		}
	
	}
	
	function evaluateRepo(repoInfo, callbackfunc){
		repoInfo['TransactionAnalytics'] = {
				EI:0,
				EQ:0,
				INT:0,
				DM:0,
				CTRL:0,
				EXTIVK:0,
				EXTCLL:0,
				TRAN_NA:0,
				NT:0,
				Tran_Length:0,
				Arch_Diff:0
		};
		
//		
//		repoInfo['TransactionAnalytics'].INT = 0;
//		repoInfo['TransactionAnalytics'].DM = 0;
//		repoInfo['TransactionAnalytics'].CTRL = 0;
//		repoInfo['TransactionAnalytics'].EXTIVK = 0;
//		repoInfo['TransactionAnalytics'].EXTCLL = 0;
//		repoInfo['TransactionAnalytics'].TRAN_NA = 0;
//		repoInfo['TransactionAnalytics'].NT = 0;
		
		for(var i in repoInfo.models){
			var modelInfo = repoInfo.models[i];

//			modelInfo.ModelAnalytics = analyseModel(modelInfo, function(){
//					console.log("model analysis complete");
//				});

//			var modelInfo['TransactionAnalytics'] = modelInfo.ModelAnalytics;
			

//			repoInfo['TransactionAnalytics'].TotalPathLength += modelInfo['TransactionAnalytics'].TotalPathLength;
//			repoInfo['TransactionAnalytics'].PathNum += modelInfo['TransactionAnalytics'].PathNum;
			

			repoInfo['TransactionAnalytics'].EI += modelInfo['TransactionAnalytics'].EI;
			repoInfo['TransactionAnalytics'].EQ += modelInfo['TransactionAnalytics'].EQ;
			repoInfo['TransactionAnalytics'].INT += modelInfo['TransactionAnalytics'].INT;
			repoInfo['TransactionAnalytics'].DM += modelInfo['TransactionAnalytics'].DM;
			repoInfo['TransactionAnalytics'].CTRL += modelInfo['TransactionAnalytics'].CTRL;
			repoInfo['TransactionAnalytics'].TRAN_NA += modelInfo['TransactionAnalytics'].TRAN_NA;
			repoInfo['TransactionAnalytics'].NT += modelInfo['TransactionAnalytics'].NT;
			repoInfo['TransactionAnalytics'].TranLength += modelInfo['TransactionAnalytics'].TranLength;
			repoInfo['TransactionAnalytics'].EXTIVK += modelInfo['TransactionAnalytics'].EXTIVK;
			repoInfo['TransactionAnalytics'].EXTCLL += modelInfo['TransactionAnalytics'].EXTCLL;
//			repoInfo['TransactionAnalytics'].NWT += modelInfo['TransactionAnalytics'].NWT;
//			repoInfo['TransactionAnalytics'].NWT_DE += modelInfo['TransactionAnalytics'].NWT_DE;
//			repoInfo['TransactionAnalytics'].CCSS += modelInfo['TransactionAnalytics'].CCSS;
		}
		
		repoInfo['TransactionAnalytics'].AvgTranLength = repoInfo['TransactionAnalytics'].NT == 0 ? 0 : repoInfo['TransactionAnalytics'].TranLength/repoInfo['TransactionAnalytics'].NT;
		repoInfo['TransactionAnalytics'].ArchDiff = repoInfo['TransactionAnalytics'].AvgTranLength*repoInfo["ElementAnalytics"].AvgDegree;
		
		 repoInfo['TransactionAnalytics'].repoModelEvaluationResultsPath = repoInfo.OutputDir+"/Model_Evaluation_Results";
		 
			mkdirp(repoInfo['TransactionAnalytics'].repoModelEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
						 var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/UseCasePointWeightsCalibration.R "'+repoInfo.OutputDir+"/"+repoInfo['TransactionAnalytics'].RepoEvaluationForModelsFileName+'" "'+repoInfo['TransactionAnalytics'].repoModelEvaluationResultsPath+'"';	
						 console.log(command);
							var child = exec(command, function(error, stdout, stderr) {

								if (error !== null) {
//									console.log('exec error: ' + error);
									console.log('exec error: repo id=' + repoInfo['TransactionAnalytics']._id);
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
						
						var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+repoInfo.OutputDir+"/"+repoInfo['TransactionAnalytics'].TransactionAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "."';
//						console.log(command);
						var child = exec(command, function(error, stdout, stderr) {

							if (error !== null) {
								console.log('exec error: ' + error);
//								console.log('exec error: useCase id=' + useCaseInfo['TransactionAnalytics']._id)
								if(callbackfunc){
									callbackfunc(false);
								}
							} 

							if(callbackfunc){
								callbackfunc(repoInfo['TransactionAnalytics']);
							}
						});
				 });
			}
	}
	
	
	function dumpUseCaseTransactionsInfo(useCaseInfo, callbackfunc, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
//		var useCaseInfo['TransactionAnalytics'] = useCaseInfo.UseCaseAnalytics;
		
		var transactionAnalyticsStr = transactionNum == 0 ? "id,path,diagram,useCase,transactional,tran_length,arch_diff\n" : "";
		
		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			
			for(var j in diagram.Paths){
				var path = diagram.Paths[j];
				
				for(var k in path['TransactionAnalytics'].Transactional){
					
				var transactionalOperation = path['TransactionAnalytics'].Transactional[k];
				
				transactionNum++;
				
				transactionAnalyticsStr += transactionNum+","+
				path.PathStr.replace(/,/gi, "")+","+ 
				diagram.Name+","+ 
				useCaseInfo.Name+","+
				transactionalOperation+","+ 
				path['TransactionAnalytics'].TranLength+","+
				path['TransactionAnalytics'].TotalDegree+"\n";
				
				}
				
			}
		}
		
		if(callbackfunc){
		useCaseInfo['TransactionAnalytics'].TransactionalAnalyticsFileName = "transactionalAnalytics.csv";
		var files = [{fileName : useCaseInfo['TransactionAnalytics'].TransactionalAnalyticsFileName , content : transactionAnalyticsStr}];
		umlFileManager.writeFiles(useCaseInfo.OutputDir, files, callbackfunc);
		}
		
		return {
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum
		}
		
	}
	
	
	function dumpModelTransactionsInfo(modelInfo, callbackfunc, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
//		var modelInfo['TransactionAnalytics'] = modelInfo.ModelAnalytics;
		
		var transactionAnalyticsStr = "";
		
//		var transactionAnalyticsStr = transactionNum == 0 ? "id,path,diagram,useCase,transactional,path_length\n" : "";
		
		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];
			var transactionDump = dumpUseCaseTransactionsInfo(useCaseInfo, null, transactionNum);
			transactionAnalyticsStr += transactionDump.transactionAnalyticsStr;
			transactionNum = transactionDump.transactionNum;
		}
		
		if(callbackfunc){
		modelInfo['TransactionAnalytics'].TransactionAnalyticsFileName = "transactionAnalytics.csv";
		var files = [{fileName : modelInfo['TransactionAnalytics'].TransactionAnalyticsFileName , content : transactionAnalyticsStr}];
		umlFileManager.writeFiles(modelInfo.OutputDir, files, callbackfunc);
		}
		
		return {
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum
		}
		
	}
	
	
	function dumpRepoTransactionsInfo(repoInfo, callbackfunc, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
//		var repoInfo['TransactionAnalytics'] = repoInfo.RepoAnalytics;
		
//		var transactionAnalyticsStr = transactionNum == 0 ? "id,path,diagram,useCase,transactional,path_length\n" : "";
		
		var transactionAnalyticsStr = "";
		
		for ( var i in repoInfo.Models) {
			var model = repoInfo.Models[i];
			var transactionDump = dumpModelTransactionsInfo(model, null, transactionNum);
			transactionAnalyticsStr += transactionDump.transactionAnalyticsStr;
			transactionNum = transactionDump.transactionNum;
		}
		
		if(callbackfunc){
		repoInfo['TransactionAnalytics'].TransactionAnalyticsFileName = "transactionAnalytics.csv";
		var files = [{fileName : repoInfo['TransactionAnalytics'].TransactionAnalyticsFileName , content : transactionAnalyticsStr}];
		umlFileManager.writeFiles(repoInfo.OutputDir, files, callbackfunc);
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