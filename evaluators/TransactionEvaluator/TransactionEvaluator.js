/**
 * http://usejsdoc.org/
 * 
 * Has three major functions:
 * 
 * 1. identify paths for use cases.
 * 2. identify pattern for the paths and determine as transactions.
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
				;
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

			
			for ( var j in useCaseInfo.Paths) {
				
				var path = useCaseInfo.Paths[j];
				 console.log('--------Process Path-------');
				 console.log(path);
				 
				 console.log(modelInfo);
				
				transactionProcessor.processPath(path, useCaseInfo, modelInfo);
				
//				console.log(path);
//				console.log(diagram.Paths);

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
		
//		useCaseInfo.getPaths = function(){
//			var paths = [];
//			for(var i in this.Diagrams){
//				var diagram = this.Diagrams[i];
//				for(var j in diagram.Paths){
//					paths.push(diagram.Paths[j]);
//				}
//			}
//			return paths;
//		}
		
		var useCasePaths = [];
//		for(var i in useCaseInfo.Diagrams){
//			var diagram = useCaseInfo.Diagrams[i];
			for(var j in useCaseInfo.Paths){
				console.log("iterating paths");
				console.log(useCaseInfo.Paths[j]);
				useCasePaths.push(useCaseInfo.Paths[j]);
			}
//		}
		
		useCaseInfo.Paths = useCasePaths;
		
//		var useCasePaths = useCaseInfo.getPaths();
		console.log("evaluate use cases: paths");
		console.log(useCasePaths);
		
		console.log("stringified paths");
		console.log( JSON.stringify(useCasePaths));
//		console.log('test1');
//		console.log(useCasePaths);
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("paths"+useCaseInfo.Name,useCasePaths);
//		debug.writeJson("model1",modelInfo);
		
		useCaseInfo['TransactionAnalytics'].AvgTranLength = useCaseInfo['TransactionAnalytics'].NT == 0 ? 0 : useCaseInfo['TransactionAnalytics'].TranLength/useCaseInfo['TransactionAnalytics'].NT;
		useCaseInfo['TransactionAnalytics'].ArchDiff =  useCaseInfo['TransactionAnalytics'].AvgPathLength * useCaseInfo["ElementAnalytics"].AvgDegree;
			
			if(callbackfunc){
				var useCaseTransactionDump = dumpUseCaseTransactionsInfo(useCaseInfo);

				var transactionAnalyticsStr = "id,path,useCase,transactional,tran_length,arch_diff\n" + useCaseTransactionDump.transactionAnalyticsStr;
				 
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

		var useCasePaths = [];
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
			
			console.log("paths 2");
			console.log(useCaseInfo.Paths);
			useCasePaths = useCasePaths.concat(useCaseInfo.Paths);
		}
		
		
		console.log('test1');
		console.log(useCasePaths);
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("paths",useCasePaths);
		debug.writeJson("model1",modelInfo);

		modelInfo['TransactionAnalytics'].AvgTranLength = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : modelInfo['TransactionAnalytics'].TranLength/modelInfo['TransactionAnalytics'].NT;
		modelInfo['TransactionAnalytics'].ArchDiff = modelInfo['TransactionAnalytics'].AvgTranLength*modelInfo["ElementAnalytics"].AvgDegree;
		
		if(callbackfunc){
			 var modelTransactionInfoDump = dumpModelTransactionsInfo(modelInfo);

				var transactionAnalyticsStr = "id,path,useCase,transactional,tran_length,arch_diff\n" + modelTransactionInfoDump.transactionAnalyticsStr;
	
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
		repoInfo['TransactionAnalytics'].ArchDiff = repoInfo['TransactionAnalytics'].AvgTranLength*repoInfo["ElementAnalytics"].AvgDegree;
		
		 repoInfo['TransactionAnalytics'].repoModelEvaluationResultsPath = repoInfo.OutputDir+"/Model_Evaluation_Results";
		 
//			mkdirp(repoInfo['TransactionAnalytics'].repoModelEvaluationResultsPath, function(err) { 
//				if(err) {
//					console.log(err);
//			        return;
//			    }
//						 var command = './Rscript/UseCasePointWeightsCalibration.R "'+repoInfo.OutputDir+"/"+repoInfo['TransactionAnalytics'].RepoEvaluationForModelsFileName+'" "'+repoInfo['TransactionAnalytics'].repoModelEvaluationResultsPath+'"';	
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

				var transactionAnalyticsStr = "id,path,useCase,transactional,tran_length,arch_diff\n" + repoTransactionInfoDump.transactionAnalyticsStr;
	
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
			
			for(var i in useCaseInfo.Paths){
				var path = useCaseInfo.Paths[i];
				
				for(var j in path['TransactionAnalytics'].Transactional){
					
				var transactionalOperation = path['TransactionAnalytics'].Transactional[j];
				
				transactionNum++;
				
				transactionAnalyticsStr += transactionNum+","+
				path.PathStr.replace(/,/gi, "")+","+ 
//				diagram.Name+","+ 
				useCaseInfo.Name+","+
				transactionalOperation+","+ 
				path['TransactionAnalytics'].TranLength+","+
				path['TransactionAnalytics'].TotalDegree+"\n";
				
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
		
//		var transactionAnalyticsStr = header ? "id,path,diagram,useCase,transactional,tran_length,arch_diff\n" : "";
		
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
	
	
	
//	function isCycled(path){
//		var lastNode = path[path.length-1];
//			for(var i=0; i < path.length-1; i++){
//				if(path[i] == lastNode){
//					return true;
//				}
//			}
//		return false;
//	}
//
//	function traverseBehavioralDiagram(diagram){
//		console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
//		var entries=diagram.Entries;// tag: elements
//		
//		var toExpandCollection = new Array();
//		
//		for (var i=0; i < entries.length; i++){
//			var entry = entries[i];
//			//define the node structure to keep the infor while traversing the graph
//			var node = {
//				//id: startElement, //ElementGUID
//				Node: entry,
//				PathToNode: [entry]
//			};
//			toExpandCollection.push(node);
//		}
//		
//		var Paths = new Array();
//		var toExpand;
//		while((toExpand = toExpandCollection.pop()) != null){
//			var node = toExpand.Node;
//			var pathToNode = toExpand.PathToNode;
////			var toExpandID = toExpand.id;
////			var expanded = false;
//			// test completeness of the expanded path first to decide if continue to expand
////			var childNodes = diagram.expand(node);
//			// if null is returned, then node is an end node.
//			
////			diagram.expand = function(node){
//			// add condition on actor to prevent stop searching for message [actor, view].
////			if(modelComponents[node.TargetID] && modelComponents[node.TargetID].Type === "boundary"){
////				return;
////			}
////			if(node.outboundNum == 0){
////				return;
////			}
////			else {
//
//				var childNodes = [];
//				for(var i in diagram.Edges){
//					var edge = diagram.Edges[i];
//					if(edge.start == node){
//						childNodes.push(edge.end);
//					}
//				}
//
////				return children;
////			}
//			
////		}
//			
//			if(!childNodes){
//				Paths.push({Nodes: pathToNode});
//			}
//			else{
//
//				for(var i in childNodes){
//					var childNode = childNodes[i];
//					var toExpandNode = {
//							Node: childNode,
//							PathToNode: pathToNode.concat(childNode)
//						}
//
//					if(!isCycled(toExpandNode.PathToNode)){
//					toExpandCollection.push(toExpandNode);
//					}
//					else{
//					 Paths.push({Nodes: toExpandNode.PathToNode});
//					}
//				}		
//			}
//			
//			
//		}
//		
//		return Paths;
//	}
	

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