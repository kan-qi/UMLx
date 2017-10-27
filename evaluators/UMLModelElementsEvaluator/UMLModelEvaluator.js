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
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var umlFileManager = require('../../UMLFileManager');
	var umlModelProcessor = require('./UMLModelProcessor.js');

	// function loadFromModelEmpirics(modelEmpirics, modelInfo, modelIndex){

	// modelEmpirics.CCSS = 0;
	// // modelEmpirics.IT = 0;
	// modelEmpirics.ILF = 0;
	// modelEmpirics.ELF = 0;
	// modelEmpirics.EI = 0;
	// modelEmpirics.EO = 0;
	// modelEmpirics.EQ = 0;
	// modelEmpirics.DM = 0;
	// modelEmpirics.INT = 0;
	// modelEmpirics.CTRL = 0;
	// modelEmpirics.EXTIVK = 0;
	// modelEmpirics.EXTCLL = 0;
	// modelEmpirics.NT = 0;
	// }
	

	function initModelEmpirics(modelEmpirics) {
		modelEmpirics.CCSS = 0;
		// modelEmpirics.IT = 0;
		modelEmpirics.ILF = 0;
		modelEmpirics.ELF = 0;
		modelEmpirics.EI = 0;
		modelEmpirics.EO = 0;
		modelEmpirics.EQ = 0;
		modelEmpirics.DM = 0;
		modelEmpirics.INT = 0;
		modelEmpirics.CTRL = 0;
		modelEmpirics.EXTIVK = 0;
		modelEmpirics.EXTCLL = 0;
		modelEmpirics.NT = 0;
	}

	function loadFromUseCaseEmpirics(useCaseEmpirics, useCaseInfo,
			useCaseIndex, modelInfo, modelIndex) {

		useCaseEmpirics.CCSS = Number(useCaseEmpirics.CCSS);
		// useCaseEmpirics.IT = Number(useCaseEmpirics.IT);
		useCaseEmpirics.ILF = Number(useCaseEmpirics.ILF);
		useCaseEmpirics.ELF = Number(useCaseEmpirics.ELF);
		useCaseEmpirics.EI = Number(useCaseEmpirics.EI);
		useCaseEmpirics.EO = Number(useCaseEmpirics.EO);
		useCaseEmpirics.EQ = Number(useCaseEmpirics.EQ);
		useCaseEmpirics.DM = Number(useCaseEmpirics.DM);
		useCaseEmpirics.INT = Number(useCaseEmpirics.INT);
		useCaseEmpirics.CTRL = Number(useCaseEmpirics.CTRL);
		useCaseEmpirics.EXTIVK = Number(useCaseEmpirics.EXTIVK);
		useCaseEmpirics.EXTCLL = Number(useCaseEmpirics.EXTCLL);
		useCaseEmpirics.NT = Number(useCaseEmpirics.NT);

		if (!modelInfo.ModelEmpirics) {
			modelInfo.ModelEmpirics = {};
			initModelEmpirics(modelInfo.ModelEmpirics);
		} else if (useCaseIndex == 0) {
			initModelEmpirics(modelInfo.ModelEmpirics);
		}

		var modelEmpirics = modelInfo.ModelEmpirics;

		modelEmpirics.CCSS += useCaseEmpirics.CCSS;
		// modelEmpirics.IT += useCaseEmpirics.IT;
		modelEmpirics.ILF += useCaseEmpirics.ILF;
		modelEmpirics.ELF += useCaseEmpirics.ELF;
		modelEmpirics.EI += useCaseEmpirics.EI;
		modelEmpirics.EO += useCaseEmpirics.EO;
		modelEmpirics.EQ += useCaseEmpirics.EQ;
		modelEmpirics.DM += useCaseEmpirics.DM;
		modelEmpirics.INT += useCaseEmpirics.INT;
		modelEmpirics.CTRL += useCaseEmpirics.CTRL;
		modelEmpirics.EXTIVK += useCaseEmpirics.EXTIVK;
		modelEmpirics.EXTCLL += useCaseEmpirics.EXTCLL;
		modelEmpirics.NT += useCaseEmpirics.NT;

		console.log(modelEmpirics);
	}

	function toModelEvaluationHeader() {
		return "Path_Num,UseCase_Num,Diagram_Num,Total_Degree,Element_Num,Total_Links,Actor_Num,Boundary_Num,ControlNum,Entity_Num";
	}

	function toModelEvaluationRow(modelInfo, index) {
		var modelAnalytics = modelInfo.ModelAnalytics;
//		var modelEmpirics = modelInfo.ModelEmpirics;

		return modelAnalytics.PathNum + ","
				+ modelAnalytics.UseCaseNum + ","
				+ modelAnalytics.DiagramNum + ","
				+ modelAnalytics.TotalDegree + ","
				+ modelAnalytics.ElementNum + ","
				+ modelAnalytics.TotalLinks + ","
				+ modelAnalytics.ActorNum + ","
				+ modelAnalytics.BoundaryNum + ","
				+ modelAnalytics.ControlNum + ","
				+ modelAnalytics.EneityNum;
	}

	function toUseCaseEvaluationHeader() {
		return "Path_Num,UseCase_Num,Diagram_Num,Total_Degree,Element_Num,Total_Links,Avg_Degree,Avg_Path_Length,Actor_Num,Boundary_Num,Control_Num,Entity_Num";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {
//		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;

		return useCaseAnalytics.PathNum + ","
		+ useCaseAnalytics.UseCaseNum + ","
		+ useCaseAnalytics.DiagramNum + ","
		+ useCaseAnalytics.TotalDegree + ","
		+ useCaseAnalytics.ElementNum + ","
		+ useCaseAnalytics.TotalLinks + ","
		+ useCaseAnalytics.AvgDegree + ","
		+ useCaseAnalytics.AvgPathLength + ","
		+ useCaseAnalytics.ActorNum + ","
		+ useCaseAnalytics.BoundaryNum + ","
		+ useCaseAnalytics.ControlNum + ","
		+ useCaseAnalytics.EntityNum;
		
	}
	
	function toDomainModelEvaluationHeader() {
		return "attribute_num, operation_num, class_num, diagram_num";
	}

	function toDomainModelEvaluationRow(domainModelInfo, index) {
//		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
		var domainModelAnalytics = domainModelInfo.DomainModelAnalytics;

		return domainModelAnalytics.AttributeNum + ","
		+ domainModelAnalytics.OperationNum + ","
		+ domainModelAnalytics.EntityNum + ","
		+ domainModelAnalytics.DiagramNum;
	}

	
	// callbackfunc is called when the elements are dumped into the files?
	function evaluateUseCase(useCaseInfo, callbackfunc) {
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
//		console.log(useCaseInfo);
		useCaseAnalytics.TotalDegree = 0;
		useCaseAnalytics.ElementNum = 0;
		useCaseAnalytics.AvgDegree = 0;
		useCaseAnalytics.TotalLinks = 0;
		useCaseAnalytics.ActorNum = 0;
		useCaseAnalytics.BoundaryNum = 0;
		useCaseAnalytics.ControlNum = 0;
		useCaseAnalytics.EntityNum = 0;
		useCaseAnalytics.TotalPathLength = 0;
		useCaseAnalytics.PathNum = 0;
		useCaseAnalytics.DiagramNum = 0;

		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			if(!diagram.DiagramAnalytics){
				diagram.DiagramAnalytics = {};
			}
			var diagramAnalytics = diagram.DiagramAnalytics;
			
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

				for ( var j in diagram.Elements) {
					var Element = diagram.Elements[j]; // tag: elements
						elementNum++;
						totalDegree += Element.InboundNumber;
						var type = Element.Type;
						if (type === "actor") {
							actorNum++;
						} else if (type === "boundary") {
							boundaryNum++;
						} else if (type === "control") {
							controlNum++;
						} else if (type === "entity") {
							entityNum++;
						}
						totalLinks += Element.InboundNumber;
//					}
				}

				for ( var j in diagram.Paths) {
					var Path = diagram.Paths[j];
					totalPathLength += Path.Elements.length;
					pathNum++;
				}

				diagramAnalytics.TotalDegree = totalDegree;
				diagramAnalytics.TotalLinks = totalLinks;
				diagramAnalytics.ActorNum = actorNum;
				diagramAnalytics.BoundaryNum = boundaryNum;
				diagramAnalytics.ControlNum = controlNum;
				diagramAnalytics.EntityNum = entityNum;
				diagramAnalytics.ElementNum = elementNum;
				diagramAnalytics.AvgDegree = diagramAnalytics.ElementNum == 0 ? 0: diagramAnalytics.TotalDegree / diagramAnalytics.ElementNum;
				diagramAnalytics.PathNum = pathNum;
				diagramAnalytics.AvgPathLength = diagramAnalytics.PathNum == 0 ? 0 : diagramAnalytics.TotalPathLength / diagramAnalytics.PathNum;
				diagramAnalytics.TotalPathLength = totalPathLength;

				useCaseAnalytics.TotalDegree += diagramAnalytics.TotalDegree;
				useCaseAnalytics.ElementNum += diagramAnalytics.ElementNum;
				useCaseAnalytics.AvgDegree += diagramAnalytics.AvgDegree;
				useCaseAnalytics.TotalLinks += diagramAnalytics.TotalLinks;
				useCaseAnalytics.ActorNum += diagramAnalytics.ActorNum;
				useCaseAnalytics.BoundaryNum += diagramAnalytics.BoundaryNum;
				useCaseAnalytics.ControlNum += diagramAnalytics.ControlNum;
				useCaseAnalytics.EntityNum += diagramAnalytics.EntityNum;
				useCaseAnalytics.TotalPathLength += diagramAnalytics.TotalPathLength;
				useCaseAnalytics.PathNum += diagramAnalytics.PathNum;
				useCaseAnalytics.DiagramNum++;
		}

		useCaseAnalytics.AvgDegree = useCaseAnalytics.ElementNum == 0 ? 0 : useCaseAnalytics.TotalDegree / useCaseAnalytics.ElementNum;
		useCaseAnalytics.AvgPathLength = useCaseAnalytics.PathNum == 0 ? 0 : useCaseAnalytics.TotalPathLength / useCaseAnalytics.PathNum;
		
		if (callbackfunc) {

		useCaseAnalytics.PathAnalyticsFileName = "pathAnalytics.csv";
		useCaseAnalytics.ElementAnalyticsFileName = "elementAnalytics.csv";
		useCaseAnalytics.DiagramAnalyticsFileName = "diagramAnalytics.csv";
		dumpUseCaseElementsInfo(useCaseInfo, function(err){
			
				if(err){
					console.log(err);
					return;
				}
			
				console.log("evaluate uml elements for use cases");
				
				var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/UMLModelElementsEvaluator/UseCaseElementsAnalyticsScript.R "'+useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.ElementAnalyticsFileName+'" "'+useCaseAnalytics.OutputDir+"/"+useCaseAnalytics.PathAnalyticsFileName+'" "'+useCaseAnalytics.OutputDir+'" "."';
//				console.log(command);
				var child = exec(command, function(error, stdout, stderr) {

					if (error !== null) {
						console.log('exec error: ' + error);
//						console.log('exec error: useCase id=' + useCaseAnalytics._id)
						if(callbackfunc !== undefined){
							callbackfunc(false);
						}
					} 

					if(callbackfunc !== undefined){
						callbackfunc(useCaseAnalytics);
					}
				});
		});
		}
		
		return useCaseAnalytics;
	}

	function evaluateDomainModel(domainModelInfo, callbackfunc) {
//		if (!callbackfunc) {
//			return domainModelInfo.DomainModelAnalytics;
//		}
//		var domainModelAnalytics = initDomainModelAnalytics(domainModelInfo);
		var  domainModelAnalytics = domainModelInfo.DomainModelAnalytics;
		
		domainModelAnalytics.AttributeNum = 0;
		domainModelAnalytics.OperationNum = 0;
		domainModelAnalytics.EntityNum = 0;
		// domainModelAnalytics.ILF += diagramAnalytics.ILF;
		// domainModelAnalytics.EIF += diagramAnalytics.EIF;

		domainModelAnalytics.DiagramNum = 0;
		
		// console.log('-----------domain model------------');
		// console.log(domainModelInfo);
		for ( var i in domainModelInfo.Diagrams) {
			
			var diagram = domainModelInfo.Diagrams[i];
			if(!diagram.DiagramAnalytics){
				diagram.DiagramAnalytics = {};
			}
			diagramAnalytics = diagram.DiagramAnalytics;
			
//			var diagramAnalytics = initDiagramAnalytics(diagram);
//			diagram.DiagramAnalytics = diagramAnalytics;
			diagramAnalytics.AttributeAnalyticsFileName = "attributeAnalytics.csv";
			diagramAnalytics.OperationAnalyticsFileName = "oprationAnalytics.csv";
//			domainModelAnalytics.Diagrams.push(diagram);

			var attributeNum = 0;
			var operationNum = 0;
			var entityNum = 0;

			for ( var j in diagram.Elements) {
				var element = diagram.Elements[j];
//				if (domainModelProcessor.processElement(element)) {
					entityNum++;
//					var classElement = {
//						Attributes : [],
//						Operations : [],
//						Name : element.Name,
//						Type : 'class'
//					}
//					diagramAnalytics.Elements.push(classElement);
					for ( var k in element.Attributes) {
						var attribute = element.Attributes[k];
//						if (domainModelProcessor.processAttribute(attribute)) {
							attributeNum++;
//							classElement.Attributes.push(attribute);
//						}
					}

					for ( var k in element.Operations) {
						var operation = element.Operations[k];
//						if (domainModelProcessor.processOperation(operation)) {
							operationNum++;
//							classElement.Operations.push(operation);
//						}
					}
//				}
//				domainModelAnalytics.EntityNum++;
			}

			diagramAnalytics.AttributeNum = attributeNum;
			diagramAnalytics.OperationNum = operationNum;
			diagramAnalytics.EntityNum = entityNum;

			domainModelAnalytics.AttributeNum += diagramAnalytics.AttributeNum;
			domainModelAnalytics.OperationNum += diagramAnalytics.OperationNum;
			domainModelAnalytics.EntityNum += diagramAnalytics.EntityNum;
			// domainModelAnalytics.ILF += diagramAnalytics.ILF;
			// domainModelAnalytics.EIF += diagramAnalytics.EIF;

			domainModelAnalytics.DiagramNum++;
		}

		if (callbackfunc) {
			

			domainModelAnalytics.EntityAnalyticsFileName = 'elementAnalytics.csv';
			domainModelAnalytics.AttributeAnalyticsFileName = 'attributeAnalytics.csv';
			domainModelAnalytics.OperationAnalyticsFileName = 'operationAnalytics.csv';
			
			dumpDomainModelElementsInfo(domainModelInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			console.log("evaluate uml elements for domain model");
			
			var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/UMLModelElementsEvaluator/DomainModelElementsAnalyticsScript.R "'+domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.EntityAnalyticsFileName+'" "'+domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.AttributeAnalyticsFileName+'" "'+domainModelAnalytics.OutputDir+"/"+domainModelAnalytics.OperationAnalyticsFileName+'" "'+domainModelAnalytics.OutputDir+'" "."';
//			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {

				if (error !== null) {
//					console.log('exec error: ' + error);
					console.log('exec error: model id=' + domainModelAnalytics._id)
					if(callbackfunc !== undefined){
						callbackfunc(false);
					}
				}
				if(callbackfunc !== undefined){
					callbackfunc(domainModelAnalytics);
				}
			});
		});
		}

		return domainModelAnalytics;
	}

	function evaluateModel(modelInfo, callbackfunc) {
		var modelAnalytics = modelInfo.ModelAnalytics;
		// analyse use cases
		

		modelAnalytics.DiagramNum = 0;
		
		modelAnalytics.AttributeNum = 0;
		modelAnalytics.OperationNum = 0;
		modelAnalytics.EntityNum = 0;

		modelAnalytics.ElementNum = 0;
		modelAnalytics.TotalPathLength = 0;
		modelAnalytics.PathNum = 0;
		modelAnalytics.UseCaseNum = 0;
		modelAnalytics.DiagramNum = 0;

		modelAnalytics.TotalLinks = 0;
		modelAnalytics.ActorNum = 0;
		modelAnalytics.BoundaryNum = 0;
		modelAnalytics.ControlNum = 0;
		modelAnalytics.EntityNum = 0;

		modelAnalytics.TotalDegree = 0;
		
		for ( var i in modelInfo.UseCases) {
			var useCase = modelInfo.UseCases[i];
			var useCaseAnalytics = useCase.UseCaseAnalytics;
			
			modelAnalytics.TotalPathLength += useCaseAnalytics.TotalPathLength;
			modelAnalytics.PathNum += useCaseAnalytics.PathNum;
			modelAnalytics.UseCaseNum++;
			modelAnalytics.DiagramNum += useCaseAnalytics.DiagramNum;

			modelAnalytics.TotalLinks += useCaseAnalytics.TotalLinks;
			modelAnalytics.ActorNum += useCaseAnalytics.ActorNum;
			modelAnalytics.BoundaryNum += useCaseAnalytics.BoundaryNum;
			modelAnalytics.ControlNum += useCaseAnalytics.ControlNum;
			modelAnalytics.EntityNum += useCaseAnalytics.EntityNum;

			modelAnalytics.TotalDegree += useCaseAnalytics.TotalDegree;
			modelAnalytics.ElementNum += useCaseAnalytics.ElementNum;
		}

		modelAnalytics.AvgPathLength = modelAnalytics.PathNum == 0 ? 0 : modelAnalytics.TotalPathLength / modelAnalytics.PathNum;
		modelAnalytics.AvgDegree = modelAnalytics.ElementNum == 0 ? 0 : modelAnalytics.TotalDegree / modelAnalytics.ElementNum;

		// analyse domain model
		var domainModel = modelInfo.DomainModel;
		var domainModelAnalytics = domainModel.DomainModelAnalytics;
		// modelAnalytics.ILF = domainModelAnalytics.ILF;
		// modelAnalytics.EIF = domainModelAnalytics.EIF;
		modelAnalytics.AttributeNum = domainModelAnalytics.AttributeNum;
		modelAnalytics.OperationNum = domainModelAnalytics.OperationNum;
		modelAnalytics.DiagramNum += domainModelAnalytics.DiagramNum;
		modelAnalytics.EntityNum = domainModelAnalytics.EntityNum;
		
		if (callbackfunc) {
			

			modelAnalytics.EntityAnalyticsFileName = "entityEvaluation.csv";
			modelAnalytics.AttributeAnalyticsFileName = "attributeAnalytics.csv";
			modelAnalytics.OperationAnalyticsFileName = "operationAnalytics.csv";
			modelAnalytics.ElementAnalyticsFileName = "elementAnalytics.csv";
			modelAnalytics.PathAnalyticsFileName = "pathAnalytics.csv";
		
			dumpModelElementsInfo(modelInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			
			//Needs to be upgraded soon
			console.log("evaluate uml elements at model level");
			
			var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/UMLModelElementsEvaluator/ModelElementsAnalyticsScript.R "'+modelAnalytics.OutputDir+"/"+modelAnalytics.EntityAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.AttributeAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.OperationAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.ElementAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.PathAnalyticsFileName+'" "'+modelAnalytics.OutputDir+'" "."';
			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {

				if (error !== null) {
//					console.log('exec error: ' + error);
					console.log('exec error: model id=' + modelAnalytics._id)
					if(callbackfunc !== undefined){
						callbackfunc(false);
					}
				}
				if(callbackfunc !== undefined){
					callbackfunc(modelAnalytics);
				}
			});
		});
		}
		
		return modelAnalytics;
	}

	function evaluateRepo(repo, callbackfunc) {
		var repoAnalytics = repo.RepoAnalytics;
		
		repoAnalytics.PathNum = 0;
		repoAnalytics.TotalPathLength = 0;
		repoAnalytics.PathNum = 0;
		repoAnalytics.CCSS = 0;
		repoAnalytics.TotalLinks = 0;
		repoAnalytics.ActorNum = 0;
		repoAnalytics.BoundaryNum = 0;
		repoAnalytics.ControlNum = 0;
		repoAnalytics.EntityNum = 0;
		repoAnalytics.TotalDegree = 0;
		repoAnalytics.ElementNum = 0;
		
		
		for ( var i in repo.models) {
			var modelInfo = repo.models[i];
			var modelAnalytics = modelInfo.ModelAnalytics;
			repoAnalytics.TotalPathLength += modelAnalytics.TotalPathLength;
			repoAnalytics.PathNum += modelAnalytics.PathNum;

			repoAnalytics.TotalPathLength += modelAnalytics.TotalPathLength;
			repoAnalytics.PathNum += modelAnalytics.PathNum;
			repoAnalytics.CCSS += modelAnalytics.CCSS;
			repoAnalytics.TotalLinks += modelAnalytics.TotalLinks;
			repoAnalytics.ActorNum += modelAnalytics.ActorNum;
			repoAnalytics.BoundaryNum += modelAnalytics.BoundaryNum;
			repoAnalytics.ControlNum += modelAnalytics.ControlNum;
			repoAnalytics.EntityNum += modelAnalytics.EntityNum;

			repoAnalytics.TotalDegree += modelAnalytics.TotalDegree;
			repoAnalytics.ElementNum += modelAnalytics.ElementNum;
		}

		repoAnalytics.AvgPathLength = repoAnalytics.PathNum == 0 ? 0 : repoAnalytics.TotalPathLength / repoAnalytics.PathNum;
		repoAnalytics.AvgDegree = repoAnalytics.ElementNum == 0 ? 0 : repoAnalytics.TotalDegree / repoAnalytics.ElementNum;

		repoAnalytics.repoModelEvaluationResultsPath = repoAnalytics.OutputDir + "/Model_Evaluation_Results";

		if (callbackfunc) {
			

			repoAnalytics.EntityAnalyticsFileName = "entityEvaluation.csv";
			repoAnalytics.AttributeAnalyticsFileName = "attributeAnalytics.csv";
			repoAnalytics.OperationAnalyticsFileName = "operationAnalytics.csv";
			repoAnalytics.ElementAnalyticsFileName = "elementAnalytics.csv";
			repoAnalytics.PathAnalyticsFileName = "pathAnalytics.csv";
			
			dumpRepoElementsInfo(repo, function(err){
			if(err){
				callbackfunc(err);
			}
			//Needs to be upgraded soon
			console.log("evaluate uml elements at repo level");
			var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/UMLModelElementsEvaluator/ModelElementsAnalyticsScript.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.EntityAnalyticsFileName+'" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.AttributeAnalyticsFileName+'" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.OperationAnalyticsFileName+'" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.ElementAnalyticsFileName+'" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.PathAnalyticsFileName+'" "'+repoAnalytics.OutputDir+'" "."';
			
//			console.log('generate model Analytics');
			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {

				if (error !== null) {
//					console.log('exec error: ' + error);
					console.log('exec error: repo id=' + repoAnalytics._id)
					if(callbackfunc !== undefined){
						callbackfunc(false);
					}
				} 
				if(callbackfunc !== undefined){
					callbackfunc(repoAnalytics);
				}
			});
		});
		}
		
		return repoAnalytics;
	}

	function dumpUseCaseElementsInfo(useCaseInfo, callbackfunc, elementNum, pathNum, expandedPathNum, diagramNum) {
		// console.log("dump useCase analytics");
		
		elementNum = !elementNum ? 0 : elementNum;
		pathNum = !pathNum ? 0 : pathNum;
//		expandedPathNum = !expandedPathNum ? 0 : expandedPathNum;
		diagramNum = !diagramNum ? 0 : diagramNum;

		var elementAnalyticsStr = elementNum == 0 ? "id,element,diagram,useCase,type,outboundDegree,inboundDegree\n" : "";
		var pathAnalyticsStr = pathNum == 0 ? "id,path, diagram,useCase,path_length, boundry_num, control_num, entity_num, actor_num\n" : "";
//		var expandedPathAnalyticsStr = expandedPathNum == 0 ? "id,path,diagram,useCase,transactional,path_length\n" : "";
		var diagramAnalyticsStr = diagramNum == 0 ? "id,diagram, useCase,path_num,element_num,boundry_num,control_num,entity_num,actor_num,total_degree,avg_degree,avg_path_length,total_links\n" : "";
		
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
						+ path.Elements.length + ","
						+ path.boundaryNum + ","
						+ path.controlNum + ","
						+ path.entityNum + ","
						+ path.actorNum+"\n";
			}
			

			useCaseAnalytics = useCaseInfo.UseCaseAnalytics;

			for ( var j in diagram.Elements) {
				var element = diagram.Elements[j];
				elementNum++;
				elementAnalyticsStr += elementNum + ","
						+ element.Name.replace(/,/gi, "") + ","
						+ diagram.Name + ","
						+ useCaseInfo.Name + "," +
						+ element.Type.replace(/,/gi, "") + ","
						+ element.OutboundNumber + ","
						+ element.InboundNumber+"\n";
			}

			
			
			var diagramAnalytics = diagram.DiagramAnalytics;
			diagramAnalyticsStr += diagramNum + ","
					+ diagram.Name+ ","
					+ useCaseInfo.Name+ "," 
					+ diagramAnalytics.PathNum + ","
					+ diagramAnalytics.ElementNum + ","
					+ diagramAnalytics.BoundaryNum + ","
					+ diagramAnalytics.ControlNum + ","
					+ diagramAnalytics.EntityNum + "," 
					+ diagramAnalytics.ActorNum + ","
					 + diagramAnalytics.TotalDegree + ","
					 + diagramAnalytics.AvgDegree + ","
					 + diagramAnalytics.AvgPathLength + ","
					 + diagramAnalytics.TotalLinks + "\n"
			
			diagramNum++;
		}
		
		if(callbackfunc){
			
		var files = [{fileName : useCaseAnalytics.DiagramAnalyticsFileName , content : diagramAnalyticsStr},
			{fileName : useCaseAnalytics.ElementAnalyticsFileName, content : elementAnalyticsStr},
			{fileName : useCaseAnalytics.PathAnalyticsFileName, content : pathAnalyticsStr}];
		
		umlFileManager.writeFiles(useCaseAnalytics.OutputDir, files, callbackfunc);
		}
		
		return {
			elementAnalyticsStr: elementAnalyticsStr,
			elementNum: elementNum,
			pathAnalyticsStr: pathAnalyticsStr,
			pathNum: pathNum,
			diagramAnalyticsStr: diagramAnalyticsStr,
			diagramNum: diagramNum
		}
		
	}

	function dumpDomainModelElementsInfo(domainModelInfo, callbackfunc, elementNum, attributeNum, operationNum) {
		
		elementNum = !elementNum ? 0 : elementNum;
		attributeNum = !attributeNum ? 0 : attributeNum;
		operationNum = !operationNum ? 0 : operationNum;
		
//		console.log("domain model");
//		console.log(domainModelInfo);

		var domainModelAnalytics = domainModelInfo.DomainModelAnalytics;

		var entityAnalyticsStr = "id,element,attributeNum,operationNum,diagram\n";
		var attributeAnalyticsStr = "id,attribute,type,element,diagram\n";
		var operationAnalyticsStr = "id,operation,element,diagram\n";
		

		var entityNum = 0;
		var attributeNum = 0;
		var operationNum = 0;

		for ( var i in domainModelAnalytics.Diagrams) {
			
			var diagram = domainModelAnalytics.Diagrams[i];
			
			for ( var j in diagramAnalytics.Elements) {
				
				var element = diagram.Elements[j];
				
					entityNum++;
					entityAnalyticsStr += entityNum + ","
						+ element.Name + ","
						+ element.Attributes.length + ","
						+ element.Operations.length + ","
						+ diagram.Name + "\n";
					
				for ( var k in element.Attributes) {
					attributeNum++;
					var attribute = element.Attributes[k];
					attributeAnalyticsStr += attributeNum + ","
							+ attribute.Name + ","
							+ attribute.Type + ","
							+ element.Name + ","
							+ diagram.Name + "\n";
				}

				for ( var k in element.Operations) {
					operationNum++;
					var operation = element.Operations[k];
					operationAnalyticsStr += operationNum + ","
							+ operation.Name + ","
							+ element.Name + ","
							+ diagram.Name + "\n";
				}
				
			}
		}

		// console.log(domainModelAnalytics);

		if(callbackfunc){
		
		var files = [{fileName : domainModelAnalytics.EntityAnalyticsFileName , content : entityAnalyticsStr },
			{fileName : domainModelAnalytics.AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : domainModelAnalytics.OperationAnalyticsFileName, content : operationAnalyticsStr}];
		
		umlFileManager.writeFiles(domainModelAnalytics.OutputDir, files, callbackfunc);
		
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

	function dumpModelElementsInfo(model, callbackfunc, elementNum, pathNum, entityNum, attributeNum, operationNum) {
		

		elementNum = !elementNum ? 0 : elementNum;
		pathNum = !pathNum ? 0 : pathNum;
		entityNum = !entityNum ? 0 : entityNum;
		attributeNum = !attributeNum ? 0 : attributeNum;
		operationNum = !operationNum ? 0 : operationNum;

		
		var modelAnalytics = model.ModelAnalytics;
		// console.log(modelAnalytics);

		var elementAnalyticsStr = "";
		var pathAnalyticsStr = "";
		var entityAnalyticsStr = "";
		var attributeAnalyticsStr = "";
		var operationAnalyticsStr = "";
		
//		var elementAnalyticsStr = "id,element,type,outbound_degree,inbound_degree,diagram,useCase\n";
//		var pathAnalyticsStr = "id,path,diagram,useCase, path_length, boundary_num, control_num, entity_num, actor_num, utw, \n";
		
		for ( var i in model.UseCases) {
			var useCase = model.UseCases[i];
			var useCaseDump = dumpUseCaseElementsInfo(useCase, null, elementNum, pathNum);
			pathNum = useCaseDump.pathNum;
			pathAnalyticsStr += useCaseDump.pathAnalyticsStr;
			elementNum = useCaseDump.elementNum;
			elementAnalyticsStr += useCaseDump.elementAnalyticsStr;
		}
		
		
//		var entityAnalyticsStr = "id,element,attributeNum,operationNum,diagram\n";
//		var attributeAnalyticsStr = "id,attribute,type,element,diagram\n";
//		var operationAnalyticsStr = "id,operation,element,diagram\n";
		
//		console.log("''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''")
//		console.log(model);
		
	    domainModelDump = dumpDomainModelElementsInfo(model.DomainModel);
	    
	    entityNum = domainModelDump.entityNum;
	    entityAnalyticsStr += domainModelDump.entityAnalyticsStr;
	    attributeNum = domainModelDump.attributeNum;
	    attributeAnalyticsStr += domainModelDump.attributeAnalyticsStr;
	    operationNum = domainModelDump.operationNum;
	    operationAnalyticsStr += domainModelDump.operationAnalyticsStr;


		
		// console.log(domainModelAnalytics);

		if(callbackfunc){
		
		var files = [{fileName : modelAnalytics.PathAnalyticsFileName , content : pathAnalyticsStr },
			{fileName : modelAnalytics.ElementAnalyticsFileName, content : elementAnalyticsStr},
			{fileName : modelAnalytics.OperationAnalyticsFileName, content : operationAnalyticsStr},
			{fileName : modelAnalytics.AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : modelAnalytics.EntityAnalyticsFileName, content : entityAnalyticsStr}
		];
		
		umlFileManager.writeFiles(modelAnalytics.OutputDir, files, callbackfunc);
		
		}
		
		return {
			entityAnalyticsStr: entityAnalyticsStr,
			entityNum: entityNum,
			attributeAnalyticsStr: attributeAnalyticsStr,
			attributeNum: attributeNum,
			operationAnalyticsStr: operationAnalyticsStr,
			operationNum: operationNum,
			elementAnalyticsStr: elementAnalyticsStr,
			elementNum: elementNum,
			pathAnalyticsStr: pathAnalyticsStr,
			pathNum: pathNum,
		}

		
	}

	function dumpRepoElementsInfo(repo, callbackfunc) {
		
		var elementNum = 0;
		var pathNum = 0;
		var entityNum = 0;
		var attributeNum = 0;
		var operationNum = 0;
		
		var repoAnalytics = repo.RepoAnalytics;
		// console.log(repoAnalytics.OutputDir);

		var pathAnalyticsStr = "";
		var elementAnalyticsStr = "";
		var entityAnalyticsStr = "";
		var attributeAnalyticsStr = "";
		var operationAnalyticsStr = "";
		
//		var pathAnalyticsStr = "id,path,functional,transactional,path_length,avg_degree,arch_diff,diagram,use_case,model\n";
//		var elementAnalyticsStr = "id,element,type,outboundDegree,inboundDegree,diagram,useCase,model\n";
//		var entityAnalyticsStr = "id,element,attributeNum,operationNum,diagram\n";
//		var attributeAnalyticsStr = "id,attribute,type,element,diagram\n";
//		var operationAnalyticsStr = "id,operation,element,diagram\n";

		for ( var i in repo.models) {
			
			var model = repo.models[i];
			var modelDump = dumpModelElementsInfo(model, null, elementNum, pathNum, entityNum, attributeNum, operationNum);
			
			pathNum = modelDump.pathNum;
			pathAnalyticsStr += modelDump.pathAnalyticsStr;
			elementNum = modelDump.elementNum;
			elementAnalyticsStr += modelDump.elementAnalyticsStr;
			entityNum = domainModelDump.entityNum;
			entityAnalyticsStr += modelDump.entityAnalyticsStr;
			attributeNum = modelDump.attributeNum;
			attributeAnalyticsStr += modelDump.attributeAnalyticsStr;
			operationNum = modelDump.operationNum;
			operationAnalyticsStr += modelDump.operationAnalyticsStr;
		}
		

		if(callbackfunc){

			var files = [{fileName : repoAnalytics.PathAnalyticsFileName , content : pathAnalyticsStr},
				{fileName : repoAnalytics.ElementAnalyticsFileName, content : elementAnalyticsStr},
				{fileName : repoAnalytics.OperationAnalyticsFileName, content : operationAnalyticsStr},
				{fileName : repoAnalytics.AttributeAnalyticsFileName, content : attributeAnalyticsStr},
				{fileName : repoAnalytics.EntityAnalyticsFileName, content : entityAnalyticsStr}
			];
			
		umlFileManager.writeFiles(repoAnalytics.OutputDir, files, callbackfunc);

		}
	   
	}
	
	function evaluateModelAnalytics(modelAnalytics, callbackfunc){
		console.log("evaluate uml elements at repo level");
		var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/UMLModelElementsEvaluator/UseCaseAnalyticsScript.R "'+modelAnalytics.OutputDir+"/"+modelAnalytics.UseCaseEvaluationFileName+'" "'+modelAnalytics.OutputDir+'" "."';
		
//		console.log('generate model Analytics');
		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error !== null) {
//				console.log('exec error: ' + error);
				console.log('exec error: repo id=' + modelAnalytics._id)
				if(callbackfunc !== undefined){
					callbackfunc(false);
				}
			} 
			if(callbackfunc !== undefined){
				callbackfunc(modelAnalytics);
			}
		});
	}
	
	function evaluateRepoAnalytics(repoAnalyticsFilePath, callbackfunc){
		
	}

	module.exports = {
		toModelEvaluationHeader : toModelEvaluationHeader,
		toModelEvaluationRow : toModelEvaluationRow,
		toUseCaseEvaluationHeader : toUseCaseEvaluationHeader,
		toUseCaseEvaluationRow : toUseCaseEvaluationRow,
		toDomainModelEvaluationHeader: toDomainModelEvaluationHeader,
		toDomainModelEvaluationRow: toDomainModelEvaluationRow,
		// loadFromModelEmpirics: loadFromModelEmpirics,
		loadFromUseCaseEmpirics : loadFromUseCaseEmpirics,
		evaluateRepo : evaluateRepo,
		evaluateUseCase : evaluateUseCase,
		evaluateModel : evaluateModel,
		evaluateModelAnalytics: evaluateModelAnalytics,
		evaluateRepoAnalytics: evaluateRepoAnalytics
	}

}())