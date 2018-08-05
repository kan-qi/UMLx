/**
 * http://usejsdoc.org/
 * 
 * Has three major functions:
 * 
 * 1. identify transactions for use cases.
 * 2. identify pattern for the transactions and determine as transactions.
 * 3. associate with components.
 */


(function() {
	
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var RScriptExec = require('../../utils/RScriptUtil.js');
	var umlFileManager = require('../../UMLFileManager');
	var transactionProcessor = require('./TransactionProcessor.js');
	

	function loadUseCaseEmpirics(useCaseInfo, useCaseIndex, modelInfo, modelIndex) {
		
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
		
		modelInfo['TransactionEmpirics'].EI += useCaseInfo['TransactionEmpirics'].EI;
		modelInfo['TransactionEmpirics'].EQ += useCaseInfo['TransactionEmpirics'].EQ;
		modelInfo['TransactionEmpirics'].DM += useCaseInfo['TransactionEmpirics'].DM;
		modelInfo['TransactionEmpirics'].INT += useCaseInfo['TransactionEmpirics'].INT;
		modelInfo['TransactionEmpirics'].CTRL += useCaseInfo['TransactionEmpirics'].CTRL;
		modelInfo['TransactionEmpirics'].EXTIVK += useCaseInfo['TransactionEmpirics'].EXTIVK;
		modelInfo['TransactionEmpirics'].EXTCLL += useCaseInfo['TransactionEmpirics'].EXTCLL;
		modelInfo['TransactionEmpirics'].NT += useCaseInfo['TransactionEmpirics'].NT;
	}
	
	function toModelEvaluationHeader(){
		return "EI,EQ,INT,DM,CTRL,EXTIVK,EXTCLL,TRAN_NA,NT,Avg_TL,Avg_TD,Arch_Diff";
	}

	function toModelEvaluationRow(modelInfo, index) {

		return modelInfo['TransactionAnalytics'].EI + ","
				+ modelInfo['TransactionAnalytics'].EQ + ","
				+ modelInfo['TransactionAnalytics'].INT + ","
				+ modelInfo['TransactionAnalytics'].DM + ","
				+ modelInfo['TransactionAnalytics'].CTRL + ","
				+ modelInfo['TransactionAnalytics'].EXTIVK + ","
				+ modelInfo['TransactionAnalytics'].EXTCLL + ","
				+ modelInfo['TransactionAnalytics'].TRAN_NA + ","
				+ modelInfo['TransactionAnalytics'].NT+ ","
				+ modelInfo['TransactionAnalytics'].Avg_TL+ ","
				+ modelInfo['TransactionAnalytics'].Avg_TD+ ","
				+ modelInfo['TransactionAnalytics'].Arch_Diff;
	}
	
	function toUseCaseEvaluationHeader() {
		return "EI,EQ,INT,DM,CTRL,EXTIVK,EXTCLL,TRAN_NA,NT,Avg_TL,Avg_TD, Avg_TC, Arch_Diff";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {
		
		return useCaseInfo['TransactionAnalytics'].EI + ","
		+ useCaseInfo['TransactionAnalytics'].EQ + ","
		+ useCaseInfo['TransactionAnalytics'].INT + ","
		+ useCaseInfo['TransactionAnalytics'].DM + ","
		+ useCaseInfo['TransactionAnalytics'].CTRL + ","
		+ useCaseInfo['TransactionAnalytics'].EXTIVK + ","
		+ useCaseInfo['TransactionAnalytics'].EXTCLL + ","
		+ useCaseInfo['TransactionAnalytics'].TRAN_NA + ","
		+ useCaseInfo['TransactionAnalytics'].NT+ ","
		+ useCaseInfo['TransactionAnalytics'].Avg_TL+ ","
		+ useCaseInfo['TransactionAnalytics'].Avg_TD+ ","
		+ useCaseInfo['TransactionAnalytics'].Avg_TC+ ","
		+ useCaseInfo['TransactionAnalytics'].Avg_DETs+ ","
		+ useCaseInfo['TransactionAnalytics'].Arch_Diff;
	}

	
	function evaluateUseCase(useCaseInfo, modelInfo, callbackfunc){
		
		//the things that need to be evaluated for use cases.
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
//				TranLength: 0,
				Avg_TL: 0,
				Avg_TD: 0,
				Avg_TC: 0,
				Avg_DETs: 0,
				Arch_Diff: 0
		}
		
//		for ( var i in useCaseInfo.Diagrams) {
//			var diagram = useCaseInfo.Diagrams[i];
			
//			transactionProcessor.processUseCase(useCaseInfo);
			
			var EI = 0;
			var EQ = 0;
			var INT = 0;
			var DM = 0;
			var CTRL = 0;
			var EXTIVK = 0;
			var EXTCLL = 0;
			var TRAN_NA = 0;
			var NT = 0;
			
			var total_TL = 0;
			var total_TD = 0;
			var total_TC = 0;
			var total_DETs = 0;
			
			for ( var j in useCaseInfo.Transactions) {
				
				var transaction = useCaseInfo.Transactions[j];
				 console.log('--------Process Transaction-------');
				 console.log(transaction);
				 
				 console.log(modelInfo);
				
				transactionProcessor.processTransaction(transaction, useCaseInfo, modelInfo);
				
//				console.log(transaction);
//				console.log(diagram.Transactions);

				var transactionalOperations = transaction['TransactionAnalytics'].Transactional;
				
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
//					TranLength += transaction['TransactionAnalytics'].TranLength;
				}
				
				total_TD += transaction['TransactionAnalytics'].TD*transaction['TransactionAnalytics'].TC;
				total_TL += transaction['TransactionAnalytics'].TL;
				total_TC += transaction['TransactionAnalytics'].TC;
				total_DETs += transaction['TransactionAnalytics'].DETs;
				
//				useCaseInfo['TransactionAnalytics'].Arch_Diff += archDiff;
			}
			
//			useCaseInfo['TransactionAnalytics'] = {};
			useCaseInfo['TransactionAnalytics'].EI = EI;
			useCaseInfo['TransactionAnalytics'].EQ = EQ;
			useCaseInfo['TransactionAnalytics'].INT = INT;
			useCaseInfo['TransactionAnalytics'].DM = DM;
			useCaseInfo['TransactionAnalytics'].CTRL = CTRL;
			useCaseInfo['TransactionAnalytics'].EXTIVK = EXTIVK;
			useCaseInfo['TransactionAnalytics'].EXTCLL = EXTCLL;
			useCaseInfo['TransactionAnalytics'].TRAN_NA = TRAN_NA;
			useCaseInfo['TransactionAnalytics'].NT = NT;
			
//			useCaseInfo['TransactionAnalytics'].TranLength = TranLength;
			useCaseInfo['TransactionAnalytics'].Avg_TD = total_TC == 0? 0: total_TD/total_TC;
			useCaseInfo['TransactionAnalytics'].Avg_TL = useCaseInfo['TransactionAnalytics'].NT == 0 ? 0 : total_TL/useCaseInfo['TransactionAnalytics'].NT;
			useCaseInfo['TransactionAnalytics'].Avg_TC = useCaseInfo['TransactionAnalytics'].NT == 0 ? 0 : total_TC/useCaseInfo['TransactionAnalytics'].NT;
			useCaseInfo['TransactionAnalytics'].Avg_DETs = useCaseInfo['TransactionAnalytics'].NT == 0 ? 0 : total_DETs/useCaseInfo['TransactionAnalytics'].NT;
			useCaseInfo['TransactionAnalytics'].Arch_Diff =  useCaseInfo['TransactionAnalytics'].Avg_TD * useCaseInfo["TransactionAnalytics"].Avg_TL;
			
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("transactions"+useCaseInfo.Name,useCaseInfo.Transactions);
//		debug.writeJson("model1",modelInfo);
		
			
			if(callbackfunc){
				var useCaseTransactionDump = dumpUseCaseTransactionsInfo(useCaseInfo);

				var transactionAnalyticsStr = "id,transaction,useCase,transactional,TL, DETs, TD, TC, Arch_Diff\n" + useCaseTransactionDump.transactionAnalyticsStr;
				 
						useCaseInfo['TransactionAnalytics'].TransactionalAnalyticsFileName = "transactionAnalytics.csv";
						var files = [{fileName : useCaseInfo['TransactionAnalytics'].TransactionalAnalyticsFileName , content : transactionAnalyticsStr}];
						umlFileManager.writeFiles(useCaseInfo.OutputDir, files, function(err){
					 		if(err){
					 			console.log(err);
					 			return;
					 		}
					 		
							console.log("evaluate transactions for the use cases");
							
							var command = './evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+useCaseInfo.OutputDir+"/"+useCaseInfo['TransactionAnalytics'].TransactionalAnalyticsFileName+'" "'+useCaseInfo.OutputDir+'" "."';
							
							RScriptExec.runRScript(command,function(result){
								if (!result) {
									if(callbackfunc){
										callbackfunc(false);
									}
									return;
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
//				TranLength: 0,
				Avg_TD: 0,
				Avg_TL:0,
				Avg_TC: 0,
				Avg_DETs: 0,
				Arch_Diff:0
		};

		
		var tranLength = 0;
		var tranDegree = 0;
		var tranComponents = 0;
		var tranDETs = 0;
		
		for(var i in modelInfo.UseCases){
			var useCaseInfo = modelInfo.UseCases[i]

			if(useCaseInfo['TransactionAnalytics']){
			modelInfo['TransactionAnalytics'].EI += useCaseInfo['TransactionAnalytics'].EI;
			modelInfo['TransactionAnalytics'].EQ += useCaseInfo['TransactionAnalytics'].EQ;
			modelInfo['TransactionAnalytics'].INT += useCaseInfo['TransactionAnalytics'].INT;
			modelInfo['TransactionAnalytics'].DM += useCaseInfo['TransactionAnalytics'].DM;
			modelInfo['TransactionAnalytics'].CTRL += useCaseInfo['TransactionAnalytics'].CTRL;
			modelInfo['TransactionAnalytics'].EXTIVK += useCaseInfo['TransactionAnalytics'].EXTIVK;
			modelInfo['TransactionAnalytics'].EXTCLL += useCaseInfo['TransactionAnalytics'].EXTCLL;
			modelInfo['TransactionAnalytics'].TRAN_NA += useCaseInfo['TransactionAnalytics'].TRAN_NA;
			modelInfo['TransactionAnalytics'].NT += useCaseInfo['TransactionAnalytics'].NT;
//			modelInfo['TransactionAnalytics'].TranLength += useCaseInfo['TransactionAnalytics'].Tran_Length;
			
			tranLength += useCaseInfo['TransactionAnalytics'].NT*useCaseInfo['TransactionAnalytics'].Avg_TL;
			tranDegree += useCaseInfo['TransactionAnalytics'].NT*useCaseInfo['TransactionAnalytics'].Avg_TD;

			tranComponents += useCaseInfo['TransactionAnalytics'].NT*useCaseInfo['TransactionAnalytics'].Avg_TC;

			tranDETs += useCaseInfo['TransactionAnalytics'].NT*useCaseInfo['TransactionAnalytics'].Avg_DETs;
			}
			
		}

		modelInfo['TransactionAnalytics'].Avg_TL = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : tranLength/modelInfo['TransactionAnalytics'].NT;
		modelInfo['TransactionAnalytics'].Avg_TD = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : tranDegree/modelInfo['TransactionAnalytics'].NT;
		modelInfo['TransactionAnalytics'].Avg_TC = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : tranComponents/modelInfo['TransactionAnalytics'].NT;
		modelInfo['TransactionAnalytics'].Avg_DETs = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : tranDETs/modelInfo['TransactionAnalytics'].NT;
		modelInfo['TransactionAnalytics'].Arch_Diff = modelInfo['TransactionAnalytics'].Avg_TL*modelInfo["TransactionAnalytics"].Avg_TD;
		
		if(callbackfunc){
			 var modelTransactionInfoDump = dumpModelTransactionsInfo(modelInfo);

				var transactionAnalyticsStr = "id,transaction,useCase,transactional, TL, DETs, TD, TC, Arch_Diff\n" + modelTransactionInfoDump.transactionAnalyticsStr;
	
				modelInfo['TransactionAnalytics'].TransactionAnalyticsFileName = "transactionAnalytics.csv";
				var files = [{fileName : modelInfo['TransactionAnalytics'].TransactionAnalyticsFileName , content : transactionAnalyticsStr}];
				umlFileManager.writeFiles(modelInfo.OutputDir, files, function(err){
				 if(err){
					 console.log(err);
					 return;
				 }
				 
					console.log("evaluate transactions for the model");
					
					var command = './evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo['TransactionAnalytics'].TransactionAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "."';
					
					RScriptExec.runRScript(command,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
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
//				Tran_Length:0,
				Avg_TL: 0,
				Avg_TD: 0,
				Avg_TC: 0,
				AVg_DETs: 0,
				Arch_Diff:0
		};
		
		var tranLength = 0;
		var tranDegree = 0;
		var tranComponents = 0;
		var tranDETs = 0;
	
		for(var i in repoInfo.models){
			var modelInfo = repoInfo.models[i];

			if(modelInfo['TransactionAnalytics']){
			repoInfo['TransactionAnalytics'].EI += modelInfo['TransactionAnalytics'].EI;
			repoInfo['TransactionAnalytics'].EQ += modelInfo['TransactionAnalytics'].EQ;
			repoInfo['TransactionAnalytics'].INT += modelInfo['TransactionAnalytics'].INT;
			repoInfo['TransactionAnalytics'].DM += modelInfo['TransactionAnalytics'].DM;
			repoInfo['TransactionAnalytics'].CTRL += modelInfo['TransactionAnalytics'].CTRL;
			repoInfo['TransactionAnalytics'].TRAN_NA += modelInfo['TransactionAnalytics'].TRAN_NA;
			repoInfo['TransactionAnalytics'].NT += modelInfo['TransactionAnalytics'].NT;
//			repoInfo['TransactionAnalytics'].TranLength += modelInfo['TransactionAnalytics'].TranLength;
			repoInfo['TransactionAnalytics'].EXTIVK += modelInfo['TransactionAnalytics'].EXTIVK;
			repoInfo['TransactionAnalytics'].EXTCLL += modelInfo['TransactionAnalytics'].EXTCLL;
			
			tranLength = useCaseInfo['TransactionAnalytics'].NT*useCaseInfo['TransactionAnalytics'].Avg_TL;
			tranDegree = useCaseInfo['TransactionAnalytics'].NT*useCaseInfo['TransactionAnalytics'].Avg_TD;
			tranComponents = useCaseInfo['TransactionAnalytics'].NT*useCaseInfo['TransactionAnalytics'].Avg_TC;
			tranDETs = useCaseInfo['TransactionAnalytics'].NT*useCaseInfo['TransactionAnalytics'].Avg_DETs;
			}
		}
		

	repoInfo['TransactionAnalytics'].Avg_TL = repoInfo['TransactionAnalytics'].NT == 0 ? 0 : tranLength/repoInfo['TransactionAnalytics'].NT;
	repoInfo['TransactionAnalytics'].Avg_TD = repoInfo['TransactionAnalytics'].NT == 0 ? 0 : tranDegree/repoInfo['TransactionAnalytics'].NT;
	repoInfo['TransactionAnalytics'].Avg_TC = repoInfo['TransactionAnalytics'].NT == 0 ? 0 : tranComponents/repoInfo['TransactionAnalytics'].NT;
	repoInfo['TransactionAnalytics'].Avg_DETs = repoInfo['TransactionAnalytics'].NT == 0 ? 0 : tranDETs/repoInfo['TransactionAnalytics'].NT;
	repoInfo['TransactionAnalytics'].Arch_Diff = repoInfo['TransactionAnalytics'].Avg_TL*repoInfo["TransactionAnalytics"].Avg_TD;
		
		 repoInfo['TransactionAnalytics'].repoModelEvaluationResultsTransaction = repoInfo.OutputDir+"/Model_Evaluation_Results";
		 
//			mkdirp(repoInfo['TransactionAnalytics'].repoModelEvaluationResultsTransaction, function(err) { 
//				if(err) {
//					console.log(err);
//			        return;
//			    }
//						 var command = './Rscript/UseCasePointWeightsCalibration.R "'+repoInfo.OutputDir+"/"+repoInfo['TransactionAnalytics'].RepoEvaluationForModelsFileName+'" "'+repoInfo['TransactionAnalytics'].repoModelEvaluationResultsTransaction+'"';	
//							
//							RScriptExec.runRScript(command,function(result){
//								if (!result) {
//									console.log('exec error: repo id=' + repoInfo._id);
//								}
//								console.log("Repo Evaluation were saved!");
//							});
//			});
			
			if(callbackfunc){
				var repoTransactionInfoDump = dumpRepoTransactionsInfo(repoInfo);

				var transactionAnalyticsStr = "id,transaction,useCase,transactional, TL, DETs, TD, TC, Arch_Diff\n" + repoTransactionInfoDump.transactionAnalyticsStr;
	
					repoInfo['TransactionAnalytics'].TransactionAnalyticsFileName = "transactionAnalytics.csv";
					var files = [{fileName : repoInfo['TransactionAnalytics'].TransactionAnalyticsFileName , content : transactionAnalyticsStr}];
					umlFileManager.writeFiles(repoInfo.OutputDir, files, function(err){
					 if(err){
						 console.log(err);
						 return;
					 }
					 
					 console.log("evaluate transactions for the repo");
						
						var command = './evaluators/TransactionEvaluator/TransactionAnalyticsScript.R "'+repoInfo.OutputDir+"/"+repoInfo['TransactionAnalytics'].TransactionAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "."';
						
						RScriptExec.runRScript(command,function(result){
							if (!result) {
								if(callbackfunc){
									callbackfunc(false);
								}
								return;
							}
							if(callbackfunc){
								callbackfunc(repoInfo['TransactionAnalytics']);
							}
						});
				 });
					
			}
	}
	
	
	function dumpUseCaseTransactionsInfo(useCaseInfo, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
		var transactionAnalyticsStr = "";
		
//		for ( var i in useCaseInfo.Diagrams) {
//			var diagram = useCaseInfo.Diagrams[i];
			
			for(var i in useCaseInfo.Transactions){
				var transaction = useCaseInfo.Transactions[i];
				
				for(var j in transaction['TransactionAnalytics'].Transactional){
					
				var transactionalOperation = transaction['TransactionAnalytics'].Transactional[j];
				
				transactionNum++;
				
				transactionAnalyticsStr += transactionNum+","+
				transaction.TransactionStr.replace(/,/gi, "")+","+ 
//				diagram.Name+","+ 
				useCaseInfo.Name+","+
				transactionalOperation+","+ 
//				transaction['TransactionAnalytics'].TranLength+","+
//				transaction['TransactionAnalytics'].total_degree+","+
				transaction['TransactionAnalytics'].TL+","+
				transaction['TransactionAnalytics'].DETs+","+
				transaction['TransactionAnalytics'].TD+","+
				transaction['TransactionAnalytics'].TC+","+
				transaction['TransactionAnalytics'].Arch_Diff+"\n";
	
				}
				
			}
//		}
	
		return {
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum
		}
		
	}
	
	
	function dumpModelTransactionsInfo(modelInfo, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
//		var transactionAnalyticsStr = header ? "id,transaction,diagram,useCase,transactional,tran_length,arch_diff\n" : "";
		
		var transactionAnalyticsStr = "";
		
		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];
			var transactionDump = dumpUseCaseTransactionsInfo(useCaseInfo, null, transactionNum);
			transactionAnalyticsStr += transactionDump.transactionAnalyticsStr;
			transactionNum = transactionDump.transactionNum;
		}
		
		return {
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum
		}
		
	}
	
	
	function dumpRepoTransactionsInfo(repoInfo, transactionNum) {
		// console.log("dump useCase analytics");
		
		transactionNum = !transactionNum ? 0 : transactionNum;
		
		var transactionAnalyticsStr = "";
		
		for ( var i in repoInfo.Models) {
			var model = repoInfo.Models[i];
			var transactionDump = dumpModelTransactionsInfo(model, null, transactionNum);
			transactionAnalyticsStr += transactionDump.transactionAnalyticsStr;
			transactionNum = transactionDump.transactionNum;
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