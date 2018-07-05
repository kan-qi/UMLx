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
		return "EI,EQ,INT,DM,CTRL,EXTIVK,EXTCLL,TRAN_NA,NT,Tran_Length,Arch_Diff";
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
				+ modelInfo['TransactionAnalytics'].Tran_Length+ ","
				+ modelInfo['TransactionAnalytics'].Arch_Diff;
	}
	
	function toUseCaseEvaluationHeader() {
		return "EI,EQ,INT,DM,CTRL,EXTIVK,EXTCLL,TRAN_NA,NT,Avg_Tran_Length,Arch_Diff";
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
		+ useCaseInfo['TransactionAnalytics'].AvgTranLength+ ","
		+ useCaseInfo['TransactionAnalytics'].ArchDiff;
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
				TranLength: 0,
				AvgTranLength: 0,
				ArchDiff: 0
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
			var TranLength = 0;
			
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
					TranLength += transaction['TransactionAnalytics'].TranLength;
				}
				
//				var transaction = useCaseInfo.Transactions[i];
				
				var TL = transaction.transactionLength;
				var DETs = 0;
				var TD = 0;
				
				var componentNum = 0;
				var totalOps = 0;
				
				for(var j in transaction.Nodes){
					var node = transaction.Nodes[j];
					var component = node.Component;
					if(component){
						componentNum++;
						var matchedMethod = node.MatchedMethod;
						for(var k in component.Operations){
							var operation = component.Operations[k];
							totalOps++;
							if(operation.Name === matchedMethod){
								for(var l in operation.Parameters){
									DETs++;
								}
							}
						}
					}
				}
				
				if(componentNum == 0){
					componentNum = 3;
				}
				
				if(totalOps == 0){
						totalOps = 15;
					}
				
				TD = totalOps/componentNum;
				if(DETs == 0){
					DETs = 10;
				}
				
				var archDiff = TL*TD;
				
				var swti = 10;
				
				var swtii = 10;
				if(archDiff <= 4){
					swtii = 4;
				} else if (archDiff < 7){
					swtii = 10;
				} else {
					swtii = 15;
				}
				
				var swtiii = 10;
				
				if(archDiff <= 4){
					if(DETs <= 14){
						swtiii = 2;
					} else if (DETs < 20){
						swtiii = 4;
					} else {
						swtiii = 6;
					}
				} else if (archDiff < 7){
					if(DETs <= 14){
						swtiii = 8;
					} else if (DETs < 20){
						swtiii = 10;
					} else {
						swtiii = 14;
					}
				} else {
					if(DETs <= 14){
						swtiii = 12;
					} else if (DETs < 20){
						swtiii = 15;
					} else {
						swtiii = 18;
					}
				}
				
				

				transaction['TransactionAnalytics'].TranLength = TL;
				transaction['TransactionAnalytics'].total_degree = TD;
				transaction['TransactionAnalytics'].TL = TL;
				transaction['TransactionAnalytics'].DETs = DETs;
				transaction['TransactionAnalytics'].TD = TD;
				transaction['TransactionAnalytics'].arch_diff = archDiff;

				transaction['TransactionAnalytics'].swti = swti;
				transaction['TransactionAnalytics'].swtii = swtii;
				transaction['TransactionAnalytics'].swtiii = swtiii;
				
				useCaseInfo['TransactionAnalytics'].ArchDiff += archDiff;
			}
			
			useCaseInfo['TransactionAnalytics'] = {};
			useCaseInfo['TransactionAnalytics'].EI = EI;
			useCaseInfo['TransactionAnalytics'].EQ = EQ;
			useCaseInfo['TransactionAnalytics'].INT = INT;
			useCaseInfo['TransactionAnalytics'].DM = DM;
			useCaseInfo['TransactionAnalytics'].CTRL = CTRL;
			useCaseInfo['TransactionAnalytics'].EXTIVK = EXTIVK;
			useCaseInfo['TransactionAnalytics'].EXTCLL = EXTCLL;
			useCaseInfo['TransactionAnalytics'].TRAN_NA = TRAN_NA;
			useCaseInfo['TransactionAnalytics'].NT = NT;
			useCaseInfo['TransactionAnalytics'].TranLength = TranLength;
			useCaseInfo['TransactionAnalytics'].ArchDiff = useCaseInfo.Transactions.length == 0? 0: useCaseInfo['TransactionAnalytics'].ArchDiff/useCaseInfo.Transactions.length
			
//			useCaseInfo['TransactionAnalytics'].EI += diagram['TransactionAnalytics'].EI;
//			useCaseInfo['TransactionAnalytics'].EQ += diagram['TransactionAnalytics'].EQ;
//			useCaseInfo['TransactionAnalytics'].INT += diagram['TransactionAnalytics'].INT;
//			useCaseInfo['TransactionAnalytics'].DM += diagram['TransactionAnalytics'].DM;
//			useCaseInfo['TransactionAnalytics'].CTRL += diagram['TransactionAnalytics'].CTRL;
//			useCaseInfo['TransactionAnalytics'].EXTIVK += diagram['TransactionAnalytics'].EXTIVK;
//			useCaseInfo['TransactionAnalytics'].EXTCLL += diagram['TransactionAnalytics'].EXTCLL;
//			useCaseInfo['TransactionAnalytics'].TRAN_NA += diagram['TransactionAnalytics'].TRAN_NA;
//			useCaseInfo['TransactionAnalytics'].NT += diagram['TransactionAnalytics'].NT;
//			useCaseInfo['TransactionAnalytics'].TranLength += diagram['TransactionAnalytics'].TranLength;
			
//			console.log(useCaseInfo['TransactionAnalytics']);
//		}
		
//		useCaseInfo.getTransactions = function(){
//			var transactions = [];
//			for(var i in this.Diagrams){
//				var diagram = this.Diagrams[i];
//				for(var j in diagram.Transactions){
//					transactions.push(diagram.Transactions[j]);
//				}
//			}
//			return transactions;
//		}
		
		var useCaseTransactions = [];
//		for(var i in useCaseInfo.Diagrams){
//			var diagram = useCaseInfo.Diagrams[i];
			for(var j in useCaseInfo.Transactions){
				console.log("iterating transactions");
				console.log(useCaseInfo.Transactions[j]);
				useCaseTransactions.push(useCaseInfo.Transactions[j]);
			}
//		}
		
		useCaseInfo.Transactions = useCaseTransactions;
		
//		var useCaseTransactions = useCaseInfo.getTransactions();
		console.log("evaluate use cases: transactions");
		console.log(useCaseTransactions);
		
		console.log("stringified transactions");
		console.log( JSON.stringify(useCaseTransactions));
//		console.log('test1');
//		console.log(useCaseTransactions);
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("transactions"+useCaseInfo.Name,useCaseTransactions);
//		debug.writeJson("model1",modelInfo);
		
		useCaseInfo['TransactionAnalytics'].AvgTranLength = useCaseInfo['TransactionAnalytics'].NT == 0 ? 0 : useCaseInfo['TransactionAnalytics'].TranLength/useCaseInfo['TransactionAnalytics'].NT;
		useCaseInfo['TransactionAnalytics'].ArchDiff =  useCaseInfo['TransactionAnalytics'].AvgTransactionLength * useCaseInfo["ComponentAnalytics"].AvgDegree;
			
			if(callbackfunc){
				var useCaseTransactionDump = dumpUseCaseTransactionsInfo(useCaseInfo);

				var transactionAnalyticsStr = "id,transaction,useCase,transactional,tran_length,total_degree, TL, DETs, TD, arch_diff\n" + useCaseTransactionDump.transactionAnalyticsStr;
				 
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
				TranLength: 0,
				AVgTranLength:0,
				ArchDiff:0
		};

		var useCaseTransactions = [];
		//analyse use cases
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
			modelInfo['TransactionAnalytics'].TranLength += useCaseInfo['TransactionAnalytics'].Tran_Length;
			}
			
			console.log("transactions 2");
			console.log(useCaseInfo.Transactions);
			useCaseTransactions = useCaseTransactions.concat(useCaseInfo.Transactions);
		}
		
		
		console.log('test1');
		console.log(useCaseTransactions);
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("transactions",useCaseTransactions);
		debug.writeJson("model1",modelInfo);

		modelInfo['TransactionAnalytics'].AvgTranLength = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : modelInfo['TransactionAnalytics'].TranLength/modelInfo['TransactionAnalytics'].NT;
		modelInfo['TransactionAnalytics'].ArchDiff = modelInfo['TransactionAnalytics'].AvgTranLength*modelInfo["ComponentAnalytics"].AvgDegree;
		
		if(callbackfunc){
			 var modelTransactionInfoDump = dumpModelTransactionsInfo(modelInfo);

				var transactionAnalyticsStr = "d,transaction,useCase,transactional,tran_length,total_degree, TL, DETs, TD, arch_diff\n" + modelTransactionInfoDump.transactionAnalyticsStr;
	
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
				Tran_Length:0,
				Arch_Diff:0
		};
		
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
			repoInfo['TransactionAnalytics'].TranLength += modelInfo['TransactionAnalytics'].TranLength;
			repoInfo['TransactionAnalytics'].EXTIVK += modelInfo['TransactionAnalytics'].EXTIVK;
			repoInfo['TransactionAnalytics'].EXTCLL += modelInfo['TransactionAnalytics'].EXTCLL;
			}
		}
		
		repoInfo['TransactionAnalytics'].AvgTranLength = repoInfo['TransactionAnalytics'].NT == 0 ? 0 : repoInfo['TransactionAnalytics'].TranLength/repoInfo['TransactionAnalytics'].NT;
		repoInfo['TransactionAnalytics'].ArchDiff = repoInfo['TransactionAnalytics'].AvgTranLength*repoInfo["ComponentAnalytics"].AvgDegree;
		
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

				var transactionAnalyticsStr = "id,transaction,useCase,transactional,tran_length,total_degree, TL, DETs, TD, arch_diff\n" + repoTransactionInfoDump.transactionAnalyticsStr;
	
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
				transaction['TransactionAnalytics'].TranLength+","+
				transaction['TransactionAnalytics'].total_degree+","+
				transaction['TransactionAnalytics'].TL+","+
				transaction['TransactionAnalytics'].DETs+","+
				transaction['TransactionAnalytics'].TD+","+
				transaction['TransactionAnalytics'].arch_diff+"\n";
	
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