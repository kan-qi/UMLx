/**
 * http://usejsdoc.org/
 * 
 * This is evaluator module works as a filter mostly to output the necessary
 * information from model analysis to model evaluation.
 * 
 * 
 * 
 */

(function() {

	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var RScriptExec = require('../../utils/RScriptUtil.js');
	var umlFileManager = require('../../UMLFileManager');
	var umlModelProcessor = require('./UMLModelProcessor.js');

	function toModelEvaluationHeader() {
		return "Path_Num,UseCase_Num,Diagram_Num,Total_Degree,Node_Num,Total_Links,Actor_Num,Boundary_Num,ControlNum,Entity_Num";
	}

	function toModelEvaluationRow(modelInfo, index) {
//		var modelInfo["ElementAnalytics"] = modelInfo.ModelAnalytics;
//		var modelEmpirics = modelInfo.ModelEmpirics;

		return modelInfo["ElementAnalytics"].PathNum + ","
				+ modelInfo["ElementAnalytics"].UseCaseNum + ","
				+ modelInfo["ElementAnalytics"].DiagramNum + ","
				+ modelInfo["ElementAnalytics"].TotalDegree + ","
				+ modelInfo["ElementAnalytics"].NodeNum + ","
				+ modelInfo["ElementAnalytics"].TotalLinks + ","
				+ modelInfo["ElementAnalytics"].ActorNum + ","
				+ modelInfo["ElementAnalytics"].BoundaryNum + ","
				+ modelInfo["ElementAnalytics"].ControlNum + ","
				+ modelInfo["ElementAnalytics"].EneityNum;
	}

	function toUseCaseEvaluationHeader() {
		return "Path_Num,UseCase_Num,Diagram_Num,Total_Degree,Node_Num,Total_Links,Avg_Degree,Avg_Path_Length,Actor_Num,Boundary_Num,Control_Num,Entity_Num";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {
//		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
//		var useCaseInfo["ElementAnalytics"] = useCaseInfo.UseCaseAnalytics;

		return useCaseInfo["ElementAnalytics"].PathNum + ","
		+ useCaseInfo["ElementAnalytics"].UseCaseNum + ","
		+ useCaseInfo["ElementAnalytics"].DiagramNum + ","
		+ useCaseInfo["ElementAnalytics"].TotalDegree + ","
		+ useCaseInfo["ElementAnalytics"].NodeNum + ","
		+ useCaseInfo["ElementAnalytics"].TotalLinks + ","
		+ useCaseInfo["ElementAnalytics"].AvgDegree + ","
		+ useCaseInfo["ElementAnalytics"].AvgPathLength + ","
		+ useCaseInfo["ElementAnalytics"].ActorNum + ","
		+ useCaseInfo["ElementAnalytics"].BoundaryNum + ","
		+ useCaseInfo["ElementAnalytics"].ControlNum + ","
		+ useCaseInfo["ElementAnalytics"].EntityNum;
		
	}
	
	function toDomainModelEvaluationHeader() {
		return "attribute_num, operation_num, class_num, diagram_num";
	}

	function toDomainModelEvaluationRow(domainModelInfo, index) {
//		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
//		var domainModelInfo["ElementAnalytics"] = domainModelInfo.DomainModelAnalytics;
//		console.log(domainModelInfo);
		return domainModelInfo["ElementAnalytics"].AttributeNum + ","
		+ domainModelInfo["ElementAnalytics"].OperationNum + ","
		+ domainModelInfo["ElementAnalytics"].EntityNum + ","
		+ domainModelInfo["ElementAnalytics"].DiagramNum;
	}

	
	// callbackfunc is called when the nodes are dumped into the files?
	function evaluateUseCase(useCaseInfo, callbackfunc) {
		useCaseInfo["ElementAnalytics"] = {
		TotalDegree:0,
		NodeNum:0,
		AvgDegree:0,
		TotalLinks:0,
		ActorNum:0,
		BoundaryNum:0,
		ControlNum:0,
		EntityNum:0,
		TotalPathLength:0,
		PathNum:0,
		DiagramNum:0,
		};
		
		useCaseInfo.UseCaseAnalytics = useCaseInfo["ElementAnalytics"];
//		console.log(useCaseInfo);

		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			if(!diagram.DiagramAnalytics){
				diagram.DiagramAnalytics = {};
			}
			
				// element analytics
				var totalDegree = 0;
				var elementNum = 0;
				var totalLinks = 0;
				var actorNum = 0;
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				var totalPathLength = 0;
				var pathNum = 0;

				for ( var j in diagram.Nodes) {
					var Node = diagram.Nodes[j]; // tag: nodes
					var components = diagram.allocate(Node);
					for(var k in components){
						var component = components[k];
						elementNum++;
						totalDegree += component.InboundNumber;
						var type = component.Type;
						if (type === "actor") {
							actorNum++;
						} else if (type === "boundary") {
							boundaryNum++;
						} else if (type === "control") {
							controlNum++;
						} else if (type === "entity") {
							entityNum++;
						}
//						totalLinks += Node.InboundNumber;
						
					}
						
//					}
				}
				
				totalLinks += diagram.Edges.length;

				for ( var j in diagram.Paths) {
					var Path = diagram.Paths[j];
					totalPathLength += Path.length;
					pathNum++;
				}

				diagram["ElementAnalytics"] = {};
				diagram["ElementAnalytics"].TotalDegree = totalDegree;
				diagram["ElementAnalytics"].TotalLinks = totalLinks;
				diagram["ElementAnalytics"].ActorNum = actorNum;
				diagram["ElementAnalytics"].BoundaryNum = boundaryNum;
				diagram["ElementAnalytics"].ControlNum = controlNum;
				diagram["ElementAnalytics"].EntityNum = entityNum;
				diagram["ElementAnalytics"].NodeNum = elementNum;
				diagram["ElementAnalytics"].AvgDegree = diagram["ElementAnalytics"].NodeNum == 0 ? 0: diagram["ElementAnalytics"].TotalDegree / diagram["ElementAnalytics"].NodeNum;
				diagram["ElementAnalytics"].PathNum = pathNum;
				diagram["ElementAnalytics"].AvgPathLength = diagram["ElementAnalytics"].PathNum == 0 ? 0 : diagram["ElementAnalytics"].TotalPathLength / diagram["ElementAnalytics"].PathNum;
				diagram["ElementAnalytics"].TotalPathLength = totalPathLength;

				useCaseInfo["ElementAnalytics"].TotalDegree += diagram["ElementAnalytics"].TotalDegree;
				useCaseInfo["ElementAnalytics"].NodeNum += diagram["ElementAnalytics"].NodeNum;
				useCaseInfo["ElementAnalytics"].AvgDegree += diagram["ElementAnalytics"].AvgDegree;
				useCaseInfo["ElementAnalytics"].TotalLinks += diagram["ElementAnalytics"].TotalLinks;
				useCaseInfo["ElementAnalytics"].ActorNum += diagram["ElementAnalytics"].ActorNum;
				useCaseInfo["ElementAnalytics"].BoundaryNum += diagram["ElementAnalytics"].BoundaryNum;
				useCaseInfo["ElementAnalytics"].ControlNum += diagram["ElementAnalytics"].ControlNum;
				useCaseInfo["ElementAnalytics"].EntityNum += diagram["ElementAnalytics"].EntityNum;
				useCaseInfo["ElementAnalytics"].TotalPathLength += diagram["ElementAnalytics"].TotalPathLength;
				useCaseInfo["ElementAnalytics"].PathNum += diagram["ElementAnalytics"].PathNum;
				useCaseInfo["ElementAnalytics"].DiagramNum++;
		}

		useCaseInfo["ElementAnalytics"].AvgDegree = useCaseInfo["ElementAnalytics"].NodeNum == 0 ? 0 : useCaseInfo["ElementAnalytics"].TotalDegree / useCaseInfo["ElementAnalytics"].NodeNum;
		useCaseInfo["ElementAnalytics"].AvgPathLength = useCaseInfo["ElementAnalytics"].PathNum == 0 ? 0 : useCaseInfo["ElementAnalytics"].TotalPathLength / useCaseInfo["ElementAnalytics"].PathNum;
		
		if (callbackfunc) {

		useCaseInfo["ElementAnalytics"].PathAnalyticsFileName = "pathAnalytics.csv";
		useCaseInfo["ElementAnalytics"].ElementAnalyticsFileName = "nodeAnalytics.csv";
		useCaseInfo["ElementAnalytics"].DiagramAnalyticsFileName = "diagramAnalytics.csv";
		dumpUseCaseNodesInfo(useCaseInfo, function(err){
			
				if(err){
					console.log(err);
					return;
				}
			
				console.log("evaluate uml nodes for use cases");
				
				var command = './evaluators/UMLModelElementsEvaluator/UseCaseNodesAnalyticsScript.R "'+useCaseInfo.OutputDir+"/"+useCaseInfo["ElementAnalytics"].ElementAnalyticsFileName+'" "'+useCaseInfo.OutputDir+"/"+useCaseInfo["ElementAnalytics"].PathAnalyticsFileName+'" "'+useCaseInfo.OutputDir+'" "."';
				
				RScriptExec.runRScript(command,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					if(callbackfunc){
						callbackfunc(useCaseInfo["ElementAnalytics"]);
					}
				});
		});
		}
		
		return useCaseInfo["ElementAnalytics"];
	}

	function evaluateDomainModel(domainModelInfo, callbackfunc) {
		
		domainModelInfo["ElementAnalytics"] = {
				AttributeNum :0,
				OperationNum :0,
				EntityNum :0,
				// ILF += diagram["ElementAnalytics"].ILF;
				// EIF += diagram["ElementAnalytics"].EIF;
				DiagramNum :0,
				EntityAnalyticsFileName : 'entityAnalytics.csv',
				AttributeAnalyticsFileName :  'attributeAnalytics.csv',
				OperationAnalyticsFileName : 'operationAnalytics.csv'
		}

// console.log('-----------domain model------------');
		for ( var i in domainModelInfo.Diagrams) {
			
			var diagram = domainModelInfo.Diagrams[i];

			var attributeNum = 0;
			var operationNum = 0;
			var entityNum = 0;

			for ( var j in diagram.Elements) {
				var element = diagram.Elements[j];
					entityNum++;
					for ( var k in element.Attributes) {
						var attribute = element.Attributes[k];
							attributeNum++;
					}

					for ( var k in element.Operations) {
						var operation = element.Operations[k];
							operationNum++;
					}
			}

			diagram["ElementAnalytics"] = {};
			diagram["ElementAnalytics"].AttributeNum = attributeNum;
			diagram["ElementAnalytics"].OperationNum = operationNum;
			diagram["ElementAnalytics"].EntityNum = entityNum;

			domainModelInfo["ElementAnalytics"].AttributeNum += diagram["ElementAnalytics"].AttributeNum;
			domainModelInfo["ElementAnalytics"].OperationNum += diagram["ElementAnalytics"].OperationNum;
			domainModelInfo["ElementAnalytics"].EntityNum += diagram["ElementAnalytics"].EntityNum;

			domainModelInfo["ElementAnalytics"].DiagramNum++;
		}

		if (callbackfunc) {
			
			dumpDomainModelNodesInfo(domainModelInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			console.log("evaluate uml nodes for domain model");
			
			var command = './evaluators/UMLModelElementsEvaluator/DomainModelNodesAnalyticsScript.R "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].OperationAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "."';

			RScriptExec.runRScript(command,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				if(callbackfunc){
					callbackfunc(domainModelInfo["ElementAnalytics"]);
				}
			});
		});
		}

		return domainModelInfo["ElementAnalytics"];
	}

	function evaluateModel(modelInfo, callbackfunc) {
		
		modelInfo["ElementAnalytics"] = {
				DiagramNum : 0,
				AttributeNum : 0,
				OperationNum : 0,
				EntityNum : 0,
				NodeNum : 0,
				TotalPathLength : 0,
				PathNum : 0,
				UseCaseNum : 0,
				DiagramNum : 0,
				TotalLinks : 0,
				ActorNum : 0,
				BoundaryNum : 0,
				ControlNum : 0,
				EntityNum : 0,
				TotalDegree : 0,
				EntityAnalyticsFileName : "entityAnalytics.csv",
				AttributeAnalyticsFileName : "attributeAnalytics.csv",
				OperationAnalyticsFileName : "operationAnalytics.csv",
				ElementAnalyticsFileName : "nodeAnalytics.csv",
				PathAnalyticsFileName : "pathAnalytics.csv"
		}
		
		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];

			if(useCaseInfo["ElementAnalytics"]){
			modelInfo["ElementAnalytics"].TotalPathLength += useCaseInfo["ElementAnalytics"].TotalPathLength;
			modelInfo["ElementAnalytics"].PathNum += useCaseInfo["ElementAnalytics"].PathNum;
			modelInfo["ElementAnalytics"].UseCaseNum++;
			modelInfo["ElementAnalytics"].DiagramNum += useCaseInfo["ElementAnalytics"].DiagramNum;

			modelInfo["ElementAnalytics"].TotalLinks += useCaseInfo["ElementAnalytics"].TotalLinks;
			modelInfo["ElementAnalytics"].ActorNum += useCaseInfo["ElementAnalytics"].ActorNum;
			modelInfo["ElementAnalytics"].BoundaryNum += useCaseInfo["ElementAnalytics"].BoundaryNum;
			modelInfo["ElementAnalytics"].ControlNum += useCaseInfo["ElementAnalytics"].ControlNum;
			modelInfo["ElementAnalytics"].EntityNum += useCaseInfo["ElementAnalytics"].EntityNum;

			modelInfo["ElementAnalytics"].TotalDegree += useCaseInfo["ElementAnalytics"].TotalDegree;
			modelInfo["ElementAnalytics"].NodeNum += useCaseInfo["ElementAnalytics"].NodeNum;
			}
		}

		modelInfo["ElementAnalytics"].AvgPathLength = modelInfo["ElementAnalytics"].PathNum == 0 ? 0 : modelInfo["ElementAnalytics"].TotalPathLength / modelInfo["ElementAnalytics"].PathNum;
		modelInfo["ElementAnalytics"].AvgDegree = modelInfo["ElementAnalytics"].NodeNum == 0 ? 0 : modelInfo["ElementAnalytics"].TotalDegree / modelInfo["ElementAnalytics"].NodeNum;

		// analyse domain model
		var domainModelInfo = modelInfo.DomainModel;
		

		if(domainModelInfo["ElementAnalytics"]){
		modelInfo["ElementAnalytics"].AttributeNum = domainModelInfo["ElementAnalytics"].AttributeNum;
		modelInfo["ElementAnalytics"].OperationNum = domainModelInfo["ElementAnalytics"].OperationNum;
		modelInfo["ElementAnalytics"].DiagramNum += domainModelInfo["ElementAnalytics"].DiagramNum;
		modelInfo["ElementAnalytics"].EntityNum = domainModelInfo["ElementAnalytics"].EntityNum;
		}
		
		if (callbackfunc) {

			dumpModelNodesInfo(modelInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			
			//Needs to be upgraded soon
			console.log("evaluate uml nodes at model level");
			
			var command = './evaluators/UMLModelElementsEvaluator/ModelNodesAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].OperationAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].ElementAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].PathAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "."';

			RScriptExec.runRScript(command,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				if(callbackfunc){
					callbackfunc(modelInfo["ElementAnalytics"]);
				}
			});
		});
		}
		
		return modelInfo["ElementAnalytics"];
	}

	function evaluateRepo(repoInfo, callbackfunc) {
		repoInfo["ElementAnalytics"] = {
		PathNum:0,
		TotalPathLength:0,
		PathNum:0,
		CCSS:0,
		TotalLinks:0,
		ActorNum:0,
		BoundaryNum:0,
		ControlNum:0,
		EntityNum:0,
		TotalDegree:0,
		NodeNum:0,
		EntityAnalyticsFileName : "entityAnalytics.csv",
		AttributeAnalyticsFileName : "attributeAnalytics.csv",
		OperationAnalyticsFileName : "operationAnalytics.csv",
		ElementAnalyticsFileName : "nodeAnalytics.csv",
		PathAnalyticsFileName : "pathAnalytics.csv"
		}
//		repoInfo.RepoAnalytics = repoInfo["ElementAnalytics"];
		
		
		for ( var i in repoInfo.Models) {
			var modelInfo = repoInfo.Models[i];
			
			if(modelInfo["ElementAnalytics"]){
			repoInfo["ElementAnalytics"].TotalPathLength += modelInfo["ElementAnalytics"].TotalPathLength;
			repoInfo["ElementAnalytics"].PathNum += modelInfo["ElementAnalytics"].PathNum;

			repoInfo["ElementAnalytics"].TotalPathLength += modelInfo["ElementAnalytics"].TotalPathLength;
			repoInfo["ElementAnalytics"].PathNum += modelInfo["ElementAnalytics"].PathNum;
			repoInfo["ElementAnalytics"].CCSS += modelInfo["ElementAnalytics"].CCSS;
			repoInfo["ElementAnalytics"].TotalLinks += modelInfo["ElementAnalytics"].TotalLinks;
			repoInfo["ElementAnalytics"].ActorNum += modelInfo["ElementAnalytics"].ActorNum;
			repoInfo["ElementAnalytics"].BoundaryNum += modelInfo["ElementAnalytics"].BoundaryNum;
			repoInfo["ElementAnalytics"].ControlNum += modelInfo["ElementAnalytics"].ControlNum;
			repoInfo["ElementAnalytics"].EntityNum += modelInfo["ElementAnalytics"].EntityNum;

			repoInfo["ElementAnalytics"].TotalDegree += modelInfo["ElementAnalytics"].TotalDegree;
			repoInfo["ElementAnalytics"].NodeNum += modelInfo["ElementAnalytics"].NodeNum;
			}
		}

		repoInfo["ElementAnalytics"].AvgPathLength = repoInfo["ElementAnalytics"].PathNum == 0 ? 0 : repoInfo["ElementAnalytics"].TotalPathLength / repoInfo["ElementAnalytics"].PathNum;
		repoInfo["ElementAnalytics"].AvgDegree = repoInfo["ElementAnalytics"].NodeNum == 0 ? 0 : repoInfo["ElementAnalytics"].TotalDegree / repoInfo["ElementAnalytics"].NodeNum;

		repoInfo["ElementAnalytics"].repoModelEvaluationResultsPath = repoInfo.OutputDir + "/Model_Evaluation_Results";

		if (callbackfunc) {

			dumpRepoNodesInfo(repoInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			//Needs to be upgraded soon
			console.log("evaluate uml nodes at repo level");
			var command = './evaluators/UMLModelElementsEvaluator/ModelNodesAnalyticsScript.R "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].OperationAnalyticsFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].ElementAnalyticsFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].PathAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "."';
			
			RScriptExec.runRScript(command,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				if(callbackfunc){
					callbackfunc(repoInfo["ElementAnalytics"]);
				}
			});
			
		});
		}
		
		return repoInfo["ElementAnalytics"];
	}

	function dumpUseCaseNodesInfo(useCaseInfo, callbackfunc, elementNum, pathNum, expandedPathNum, diagramNum) {
		// console.log("dump useCase analytics");
		
		elementNum = !elementNum ? 0 : elementNum;
		pathNum = !pathNum ? 0 : pathNum;
//		expandedPathNum = !expandedPathNum ? 0 : expandedPathNum;
		diagramNum = !diagramNum ? 0 : diagramNum;

		var nodeAnalyticsStr = elementNum == 0 ? "id,node,diagram,useCase,type,outboundDegree,inboundDegree\n" : "";
		var pathAnalyticsStr = pathNum == 0 ? "id,path, diagram,useCase,path_length, boundry_num, control_num, entity_num, actor_num\n" : "";
//		var expandedPathAnalyticsStr = expandedPathNum == 0 ? "id,path,diagram,useCase,transactional,path_length\n" : "";
		var diagramAnalyticsStr = diagramNum == 0 ? "id,diagram, useCase,path_num,node_num,boundry_num,control_num,entity_num,actor_num,total_degree,avg_degree,avg_path_length,total_links\n" : "";
		
		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			
			for ( var j in diagram.Paths) {
				var path = diagram.Paths[j];
				umlModelProcessor.processPath(path, diagram, useCaseInfo);
				pathNum++;
				pathAnalyticsStr += pathNum + ","
						+ path.PathStr.replace(/,/gi, "") + ","
						+ diagram.Name + ","
						+ useCaseInfo.Name + ","
						+ path.length + ","
						+ path.boundaryNum + ","
						+ path.controlNum + ","
						+ path.entityNum + ","
						+ path.actorNum+"\n";
			}
			

			useCaseInfo["ElementAnalytics"] = useCaseInfo.UseCaseAnalytics;

			for ( var j in diagram.Nodes) {
				var node = diagram.Nodes[j];
				var nodeName = node.Name ? node.Name.replace(/,/gi, "") : "undefined";
				var nodeType = "";
				var components = diagram.allocate(node);
				for(var k in components){
					nodeType += components[k]+";"
				}
				elementNum++;
				nodeAnalyticsStr += elementNum + ","
						+ nodeName + ","
						+ diagram.Name + ","
						+ useCaseInfo.Name + "," +
						+ nodeType.replace(/,/gi, "") + ","
						+ node.OutboundNumber + ","
						+ node.InboundNumber+"\n";
			}

			
			
//			var diagram["ElementAnalytics"] = diagram.DiagramAnalytics;
			diagramAnalyticsStr += diagramNum + ","
					+ diagram.Name+ ","
					+ useCaseInfo.Name+ "," 
					+ diagram["ElementAnalytics"].PathNum + ","
					+ diagram["ElementAnalytics"].NodeNum + ","
					+ diagram["ElementAnalytics"].BoundaryNum + ","
					+ diagram["ElementAnalytics"].ControlNum + ","
					+ diagram["ElementAnalytics"].EntityNum + "," 
					+ diagram["ElementAnalytics"].ActorNum + ","
					+ diagram["ElementAnalytics"].TotalDegree + ","
					+ diagram["ElementAnalytics"].AvgDegree + ","
					+ diagram["ElementAnalytics"].AvgPathLength + ","
					+ diagram["ElementAnalytics"].TotalLinks + "\n"
			
			diagramNum++;
		}
		
		if(callbackfunc){
			
		var files = [{fileName : useCaseInfo["ElementAnalytics"].DiagramAnalyticsFileName , content : diagramAnalyticsStr},
			{fileName : useCaseInfo["ElementAnalytics"].ElementAnalyticsFileName, content : nodeAnalyticsStr},
			{fileName : useCaseInfo["ElementAnalytics"].PathAnalyticsFileName, content : pathAnalyticsStr}];
		
		umlFileManager.writeFiles(useCaseInfo.OutputDir, files, callbackfunc);
		}
		
		return {
			nodeAnalyticsStr: nodeAnalyticsStr,
			elementNum: elementNum,
			pathAnalyticsStr: pathAnalyticsStr,
			pathNum: pathNum,
			diagramAnalyticsStr: diagramAnalyticsStr,
			diagramNum: diagramNum
		}
		
	}

	function dumpDomainModelNodesInfo(domainModelInfo, callbackfunc, entityNum, attributeNum, operationNum) {
		
		entityNum = !entityNum ? 0 : entityNum;
		attributeNum = !attributeNum ? 0 : attributeNum;
		operationNum = !operationNum ? 0 : operationNum;
		
//		console.log("domain model");
//		console.log(domainModelInfo);

		var entityAnalyticsStr = entityNum == 0 ? "id,node,attributeNum,operationNum,diagram\n" : "";
		var attributeAnalyticsStr = attributeNum == 0 ? "id,attribute,type,node,diagram\n" : "";
		var operationAnalyticsStr = operationNum == 0 ? "id,operation,node,diagram\n" : "";

		for ( var i in domainModelInfo.Diagrams) {
			
			var diagram = domainModelInfo.Diagrams[i];
			
			for ( var j in diagram.Nodes) {
				
				var node = diagram.Nodes[j];
				
					entityNum++;
					entityAnalyticsStr += entityNum + ","
						+ node.Name + ","
						+ node.Attributes.length + ","
						+ node.Operations.length + ","
						+ diagram.Name + "\n";
					
				for ( var k in node.Attributes) {
					attributeNum++;
					var attribute = node.Attributes[k];
					attributeAnalyticsStr += attributeNum + ","
							+ attribute.Name + ","
							+ attribute.Type + ","
							+ node.Name + ","
							+ diagram.Name + "\n";
				}

				for ( var k in node.Operations) {
					operationNum++;
					var operation = node.Operations[k];
					operationAnalyticsStr += operationNum + ","
							+ operation.Name + ","
							+ node.Name + ","
							+ diagram.Name + "\n";
				}
				
			}
		}

		// console.log(domainModelInfo["ElementAnalytics"]);

		if(callbackfunc){
		
		var files = [{fileName : domainModelInfo["ElementAnalytics"].EntityAnalyticsFileName , content : entityAnalyticsStr },
			{fileName : domainModelInfo["ElementAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : domainModelInfo["ElementAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr}];
		
		umlFileManager.writeFiles(domainModelInfo.OutputDir, files, callbackfunc);
		
		}
		
		return {
			entityAnalyticsStr: entityAnalyticsStr,
			entityNum: entityNum,
			attributeAnalyticsStr: attributeAnalyticsStr,
			attributeNum: attributeNum,
			operationAnalyticsStr: operationAnalyticsStr,
			operationNum: operationNum
		}
	}

	function dumpModelNodesInfo(modelInfo, callbackfunc, elementNum, pathNum, entityNum, attributeNum, operationNum) {
		

		elementNum = !elementNum ? 0 : elementNum;
		pathNum = !pathNum ? 0 : pathNum;
		entityNum = !entityNum ? 0 : entityNum;
		attributeNum = !attributeNum ? 0 : attributeNum;
		operationNum = !operationNum ? 0 : operationNum;

		
//		var modelInfo["ElementAnalytics"] = modelInfo.ModelAnalytics;
		// console.log(modelInfo["ElementAnalytics"]);

		var nodeAnalyticsStr = "";
		var pathAnalyticsStr = "";
		var entityAnalyticsStr = "";
		var attributeAnalyticsStr = "";
		var operationAnalyticsStr = "";
		
//		var nodeAnalyticsStr = "id,node,type,outbound_degree,inbound_degree,diagram,useCase\n";
//		var pathAnalyticsStr = "id,path,diagram,useCase, path_length, boundary_num, control_num, entity_num, actor_num, utw, \n";
		
		for ( var i in modelInfo.UseCases) {
			var useCase = modelInfo.UseCases[i];
			var useCaseDump = dumpUseCaseNodesInfo(useCase, null, elementNum, pathNum);
			pathNum = useCaseDump.pathNum;
			pathAnalyticsStr += useCaseDump.pathAnalyticsStr;
			elementNum = useCaseDump.elementNum;
			nodeAnalyticsStr += useCaseDump.nodeAnalyticsStr;
		}
		
		
//		var entityAnalyticsStr = "id,node,attributeNum,operationNum,diagram\n";
//		var attributeAnalyticsStr = "id,attribute,type,node,diagram\n";
//		var operationAnalyticsStr = "id,operation,node,diagram\n";
		
//		console.log("''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''")
//		console.log(model);
		
	    domainModelDump = dumpDomainModelNodesInfo(modelInfo.DomainModel);
	    
	    entityNum = domainModelDump.entityNum;
	    entityAnalyticsStr += domainModelDump.entityAnalyticsStr;
	    attributeNum = domainModelDump.attributeNum;
	    attributeAnalyticsStr += domainModelDump.attributeAnalyticsStr;
	    operationNum = domainModelDump.operationNum;
	    operationAnalyticsStr += domainModelDump.operationAnalyticsStr;

		// console.log(domainModelInfo["ElementAnalytics"]);

		if(callbackfunc){
		
		var files = [{fileName : modelInfo["ElementAnalytics"].PathAnalyticsFileName , content : pathAnalyticsStr },
			{fileName : modelInfo["ElementAnalytics"].ElementAnalyticsFileName, content : nodeAnalyticsStr},
			{fileName : modelInfo["ElementAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr},
			{fileName : modelInfo["ElementAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : modelInfo["ElementAnalytics"].EntityAnalyticsFileName, content : entityAnalyticsStr}
		];
		
		umlFileManager.writeFiles(modelInfo.OutputDir, files, callbackfunc);
		
		}
		
		return {
			entityAnalyticsStr: entityAnalyticsStr,
			entityNum: entityNum,
			attributeAnalyticsStr: attributeAnalyticsStr,
			attributeNum: attributeNum,
			operationAnalyticsStr: operationAnalyticsStr,
			operationNum: operationNum,
			nodeAnalyticsStr: nodeAnalyticsStr,
			elementNum: elementNum,
			pathAnalyticsStr: pathAnalyticsStr,
			pathNum: pathNum,
		}

		
	}

	function dumpRepoNodesInfo(repoInfo, callbackfunc) {
		
		var elementNum = 0;
		var pathNum = 0;
		var entityNum = 0;
		var attributeNum = 0;
		var operationNum = 0;
		
//		var repoInfo["ElementAnalytics"] = repoInfo.RepoAnalytics;
		// console.log(repoInfo.OutputDir);

		var pathAnalyticsStr = "";
		var nodeAnalyticsStr = "";
		var entityAnalyticsStr = "";
		var attributeAnalyticsStr = "";
		var operationAnalyticsStr = "";
		
//		var pathAnalyticsStr = "id,path,functional,transactional,path_length,avg_degree,arch_diff,diagram,use_case,model\n";
//		var nodeAnalyticsStr = "id,node,type,outboundDegree,inboundDegree,diagram,useCase,model\n";
//		var entityAnalyticsStr = "id,node,attributeNum,operationNum,diagram\n";
//		var attributeAnalyticsStr = "id,attribute,type,node,diagram\n";
//		var operationAnalyticsStr = "id,operation,node,diagram\n";

		for ( var i in repoInfo.Models) {
			
			var modelInfo = repoInfo.Models[i];
			var modelDump = dumpModelNodesInfo(modelInfo, null, elementNum, pathNum, entityNum, attributeNum, operationNum);
			
			pathNum = modelDump.pathNum;
			pathAnalyticsStr += modelDump.pathAnalyticsStr;
			elementNum = modelDump.elementNum;
			nodeAnalyticsStr += modelDump.nodeAnalyticsStr;
			entityNum = domainModelDump.entityNum;
			entityAnalyticsStr += modelDump.entityAnalyticsStr;
			attributeNum = modelDump.attributeNum;
			attributeAnalyticsStr += modelDump.attributeAnalyticsStr;
			operationNum = modelDump.operationNum;
			operationAnalyticsStr += modelDump.operationAnalyticsStr;
		}
		

		if(callbackfunc){

			var files = [{fileName : repoInfo["ElementAnalytics"].PathAnalyticsFileName , content : pathAnalyticsStr},
				{fileName : repoInfo["ElementAnalytics"].ElementAnalyticsFileName, content : nodeAnalyticsStr},
				{fileName : repoInfo["ElementAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr},
				{fileName : repoInfo["ElementAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
				{fileName : repoInfo["ElementAnalytics"].EntityAnalyticsFileName, content : entityAnalyticsStr}
			];
			
		umlFileManager.writeFiles(repoInfo.OutputDir, files, callbackfunc);

		}
	   
	}
	
	function analyseModelEvaluation(modelInfo, callbackfunc){
		console.log("evaluate uml nodes at repo level");
		var command = './evaluators/UMLModelElementsEvaluator/UseCaseAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo.UseCaseEvaluationFileName+'" "'+modelInfo.OutputDir+'" "."';

		RScriptExec.runRScript(command,function(result){
			if (!result) {
				if(callbackfunc){
					callbackfunc(false);
				}
				return;
			}
			if(callbackfunc){
				callbackfunc(modelInfo);
			}
		});
	}
	

	module.exports = {
		toModelEvaluationHeader : toModelEvaluationHeader,
		toModelEvaluationRow : toModelEvaluationRow,
		toUseCaseEvaluationHeader : toUseCaseEvaluationHeader,
		toUseCaseEvaluationRow : toUseCaseEvaluationRow,
		toDomainModelEvaluationHeader: toDomainModelEvaluationHeader,
		toDomainModelEvaluationRow: toDomainModelEvaluationRow,
		// loadFromModelEmpirics: loadFromModelEmpirics,
//		loadFromUseCaseEmpirics : loadFromUseCaseEmpirics,
		evaluateRepo : evaluateRepo,
		evaluateUseCase : evaluateUseCase,
		evaluateModel : evaluateModel,
		evaluateDomainModel : evaluateDomainModel,
		analyseModelEvaluation: analyseModelEvaluation
	}

}())