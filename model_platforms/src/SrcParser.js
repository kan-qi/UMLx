/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 *
 * This script relies on KDM and Java model
 *
 * The goal is the establish the control flow between the modules:
 * Identify the boundary (via KDM).
 * Identify the system components.
 * Establish the control flow between the components
 * Identify the stimuli.
 *
 * Three levels of class clustering:
 * 
 * The set of classes.
 * The set of composite classes.
 * The set of components.
 * The set of domain elements.
 * 
 * Establish the control graph and the call graph.
 *
 */

(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var codeAnalysisXMI = require("./CodeAnalysisXMI.js");
	var codeAnalysisSoot = require("./CodeAnalysisSoot.js");
	var componentIdentifier = require("./ComponentIdentification.js");
	var componentIdentifierACDC = require("./ComponentIdentificationACDC.js");
	var controlFlowGraphConstructor = require("./ControlFlowGraphConstruction.js");
	var responseIdentifier = require("./ResponseIdentification.js");
	var util = require('util');
	var androidLogUtil = require("../../utils/AndroidLogUtil.js");

	var responsePatternsFile = "response-patterns.txt";
	
	var modelDrawer = require("../../model_drawers/UserSystemInteractionModelDrawer.js");

	function extractUserSystermInteractionModel(xmiString, workDir, ModelOutputDir, ModelAccessDir, callbackfunc) {
			
			var codeAnalysis = codeAnalysisXMI;
			if(this.isJSONBased){
				codeAnalysis = codeAnalysisSoot;
			}

				var Model = {
						Actors:[],
						Roles:[],
						UseCases: [],
						DomainModel: {},
						OutputDir: ModelOutputDir,
						AccessDir: ModelAccessDir
				};

				var debug = require("../../utils/DebuggerOutput.js");

				var codeAnalysisResults = codeAnalysis.analyseCode(xmiString, Model.OutputDir);
				
//				console.log("composition graph");
//				console.log(codeAnalysisResults.compositionGraph);
//				debug.writeJson2("composition_graph_1_19", codeAnalysisResults.compositionGraph);
				
				var responseFilePath = workDir +"/"+responsePatternsFile;
				if( !fs.existsSync(responseFilePath) ) {
					responseFilePath = "./model_platforms/src/"+responsePatternsFile;
				}
				
				//need to update for the identification response methods.
				var dicResponseMethodUnits = responseIdentifier.identifyResponse(codeAnalysisResults, responseFilePath);

//				var dicResponseMethodUnits = responseIdentifier.identifyResponseGator(codeAnalysisResults, responseFilePath);

				debug.writeJson2("identified_response", dicResponseMethodUnits);
				
				debug.writeJson2("referenced_composite", codeAnalysisResults.referencedCompositeClassUnits);
				
				debug.writeJson2("method_class", codeAnalysisResults.dicMethodClass);
				
				var componentInfo = componentIdentifier.identifyComponents(
					codeAnalysisResults.callGraph, 
					codeAnalysisResults.accessGraph, 
					codeAnalysisResults.typeDependencyGraph, 
					codeAnalysisResults.extendsGraph,
					codeAnalysisResults.compositionGraph,
					codeAnalysisResults.referencedCompositeClassUnits, 
					codeAnalysisResults.referencedClassUnits, 
					codeAnalysisResults.dicCompositeSubclasses,
					codeAnalysisResults.dicCompositeClassUnits,
					codeAnalysisResults.dicClassUnits,
					codeAnalysisResults.dicClassComposite,
					Model.OutputDir
				);
				
//				var componentInfo = componentIdentifierACDC.identifyComponents(
//						codeAnalysisResults.callGraph, 
//						codeAnalysisResults.accessGraph, 
//						codeAnalysisResults.typeDependencyGraph, 
//						codeAnalysisResults.extendsGraph,
//						codeAnalysisResults.compositionGraph,
//						codeAnalysisResults.referencedCompositeClassUnits, 
//						codeAnalysisResults.referencedClassUnits, 
//						codeAnalysisResults.dicCompositeSubclasses,
//						codeAnalysisResults.dicCompositeClassUnits,
//						codeAnalysisResults.dicClassUnits,
//						codeAnalysisResults.dicClassComposite,
//						Model.OutputDir
//				);
				
				debug.writeJson2("class_component_1_19", componentInfo.dicClassComponent);
				debug.writeJson3("dic_components_1_19", componentInfo.dicComponents);
			
				var componentMappingString = "";
				
				var ind = 0;
				for(var i in componentInfo.dicComponents){
					var component = componentInfo.dicComponents[i];
					for(var j in component.classUnits){
					ind += 1;
					var classUnit = component.classUnits[j];
					componentMappingString += "contain "+component.name+ind+".ss "+classUnit.name.replace(/\s/g, "")+"\n";
					}
				}
				
				debug.writeTxt("clustered_classes_7_5", componentMappingString);

				var controlFlowGraph = controlFlowGraphConstructor.establishControlFlow(componentInfo.dicComponents, componentInfo.dicClassComponent, codeAnalysisResults.dicMethodClass, dicResponseMethodUnits, codeAnalysisResults.dicMethodUnits, codeAnalysisResults.callGraph, ModelOutputDir);
				
				debug.writeJson2("control_flow_graph_7_5", controlFlowGraph);
				 	
				debug.writeJson2("call_graph_1_19", codeAnalysisResults.callGraph);

				debug.writeJson2("type_dependency_graph_1_19", codeAnalysisResults.typeDependencyGraph);
				
				console.log("method_parameters_19");
				console.log(codeAnalysisResults.dicMethodParameters);
				debug.writeJson2("method_parameters_19", codeAnalysisResults.dicMethodParameters);
				
				domainModelInfo = createDomainModel(componentInfo, Model.OutputDir, Model.OutputDir, codeAnalysisResults.callGraph, codeAnalysisResults.accessGraph, codeAnalysisResults.typeDependencyGraph, codeAnalysisResults.dicMethodParameters);
				
				Model.DomainModel = domainModelInfo.DomainModel;
				
				debug.writeJson("constructed_model_by_kdm_domainmodel_7_5", Model.DomainModel);
				

				Model.UseCases = createUseCasesbyCFG(controlFlowGraph, Model.OutputDir, Model.OutputDir, domainModelInfo.DomainElementsByID);

//				Model.UseCases = createUseCasesbyAndroidLog(componentInfo.dicComponents, Model.OutputDir, Model.OutputDir);
				

				modelDrawer.drawClassDiagram(codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/classDiagram.dotty");
				
				modelDrawer.drawCompositeClassDiagram(codeAnalysisResults.dicCompositeClassUnit, Model.DomainModel.OutputDir+"/compositeClassDiagram.dotty");
				
				modelDrawer.drawComponentDiagram(componentInfo.dicComponents, Model.DomainModel.OutputDir+"/componentDiagram.dotty");
				
				debug.writeJson("constructed_model_by_kdm_model_7_5", Model);

				if(callbackfunc){
					callbackfunc(Model);
				}
	}

	function createDomainModel(componentInfo, ModelOutputDir, ModelAccessDir, callGraph, accessGraph, typeDependencyGraph, dicMethodParameters){

		var dicComponents = componentInfo.dicComponents;
		var dicClassComponent = componentInfo.dicClassComponent;

		var DomainModel = {
			Elements: [],
			Usages: [],
			Realization:[],
			Assoc: [],
			OutputDir : ModelOutputDir+"/domainModel",
			AccessDir : ModelAccessDir+"/domainModel",
			DiagramType : "class_diagram",
		}

		var domainElementsByID = [];
		var domainElements = [];

		for(var i in dicComponents){
			var component = dicComponents[i];
			
			var domainElement = {
				Name: component.name,
				_id: 'c'+component.UUID.replace(/\-/g, "_"),
				Attributes: [],
				Operations: [],
				InheritanceStats: {},
				Associations: [],
			};
			
			domainElements.push(domainElement);
			domainElementsByID[domainElement._id] = domainElement;
		}

		for (var i in callGraph.edges) {
			var edge = callGraph.edges[i];
			
			var startNode = edge.start;
			var callComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
			var callDomainElement = domainElementsByID[callComponentUUID];
			
//			console.log("found domain element");
//			console.log(domainElement);
			
			if(!callDomainElement){
				continue;
			}
			
//			var foundMethod = false;
//			for (var j in domainElement.Operations) {
//				if (domainElement.Operations[j]._id === 'a'+startNode.UUID.replace(/\-/g, "") ||
//						domainElement.Operations[j].Name === startNode.methodName) {
//					var method = domainElement.Operations[j];
//					foundMethod = true;
//					break;
//				}
//			}
//			
//			if (!foundMethod) {
//				var parameters = dicMethodParameters[startNode.UUID];
//				if (parameters == null) {
//					parameters = [];
//				}
//				var method = {
//					Name: startNode.methodName,
//					_id: 'a'+startNode.UUID.replace(/\-/g, ""),
//					Parameters: parameters,
//				}
//				
//				domainElement.Operations.push(method);
//			}
			
			var endNode = edge.end;
			var calleeComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
			var calleeDomainElement = domainElementsByID[calleeComponentUUID];
			
			if(callDomainElement == calleeDomainElement){
				continue;
			}
			
			foundMethod = false;
			for (var j in calleeDomainElement.Operations) {
				if (calleeDomainElement.Operations[j]._id == 'a'+endNode.UUID.replace(/\-/g, "") ||
						calleeDomainElement.Operations[j].Name === endNode.methodName) {
					var method = calleeDomainElement.Operations[j];
					foundMethod = true;
				}
			}
			if (!foundMethod) {
				var parameters = dicMethodParameters[endNode.UUID];
				if (parameters == null) {
					parameters = [];
				}
				var method = {
					Name: endNode.methodName,
					_id: 'a'+endNode.UUID.replace(/\-/g, ""),
					Parameters: parameters,
				}
				
				calleeDomainElement.Operations.push(method);
			}
		}

		for (var i in accessGraph.edges) {
			var edge = accessGraph.edges[i];
			var startNode = edge.start;
			var accessComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
			var accessDomainElement = domainElementsByID[accessComponentUUID];
			if(!accessDomainElement){
				continue;
			}
			
//			var foundMethod = false;
//			for (var j in domainElement.Operations) {
//				if (domainElement.Operations[j]._id == 'a'+startNode.UUID.replace(/\-/g, "")) {
//					var method = domainElement.Operations[j];
//					foundMethod = true;
//				}
//			}
//			if (!foundMethod) {
//				var parameters = dicMethodParameters[startNode.UUID];
//				if (parameters == null) {
//					parameters = [];
//				}
//				var method = {
//					Name: startNode.name,
//					_id: 'a'+startNode.UUID.replace(/\-/g, ""),
//					Parameters: parameters,
//				}
//				domainElement.Operations.push(method);
//			}
			
			var endNode = edge.end;
//			var endComponentUUID = 'a'+dicClassComponent[endNode.UUID].replace(/\-/g, "");
			var accesseeComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
			var accesseeDomainElement = domainElementsByID[accesseeComponentUUID];
			
			if(accessDomainElement == accesseeDomainElement){
				continue;
			}
			
			var foundAttr = false;
			for (var j in accesseeDomainElement.Attributes) {
				if (accesseeDomainElement.Attributes[j]._id == 'a'+endNode.UUID.replace(/\-/g, "")) {
					foundAttr = true;
				}
			}
			
			if (!foundAttr) {
				var attr = {
					Name: endNode.attrName,
					_id: 'a'+endNode.UUID.replace(/\-/g, ""),
					Type: endNode.attrType,
					TypeUUID: 'a'+endNode.UUID.replace(/\-/g, "")
				};
				accesseeDomainElement.Attributes.push(attr);
			}
		}

		if(typeDependencyGraph){
		for (var i in typeDependencyGraph.edgesAttr) {
			var edge = typeDependencyGraph.edgesAttr[i];
			var startNode = edge.start;
			if(!dicClassComponent[startNode.UUID]){
				continue;
			}
			var componentUUID = 'c'+dicClassComponent[startNode.UUID].replace(/\-/g, "_");
			var domainElement = domainElementsByID[componentUUID];
			var foundAttr = false;
			for (var j in domainElement.Attributes) {
				if (domainElement.Attributes[j]._id == 'a'+startNode.UUID.replace(/\-/g, "")) {
					foundAttr = true;
				}
			}
			if (!foundAttr) {
				var attr = {
					Name: startNode.attributeName,
					_id: 'a'+startNode.UUID.replace(/\-/g, ""),
					Type: edge.end.name,
					TypeUUID: 'a'+edge.end.UUID.replace(/\-/g, "")
				};
				domainElement.Attributes.push(attr);
			}
		}
		}
		
		if(typeDependencyGraph){
		for (var i in typeDependencyGraph.edgesPara) {
			var edge = typeDependencyGraph.edgesPara[i];
			// console.log("check edge");
			// console.log(util.inspect(edge, false, null));
			var startNode = edge.start;
			console.log(startNode);
			var componentUUID = 'c'+dicClassComponent[startNode.UUID].replace(/\-/g, "_");
			var domainElement = domainElementsByID[componentUUID];
			var foundMethod = false;
			// var foundParameter = false;
			for (var j in domainElement.Operations) {
				if (domainElement.Operations[j]._id == 'a'+startNode.method.UUID.replace(/\-/g, "")) {
					var method = domainElement.Operations[j];
					foundMethod = true;
				}
			}
			if (!foundMethod) {
				// console.log("not foundMethod");
				var parameters = dicMethodParameters[startNode.method.UUID];
				if (parameters == null) {
					parameters = [];
				}
				var method = {
					Name: startNode.method.name,
					_id: 'a'+startNode.method.UUID.replace(/\-/g, ""),
					Parameters: parameters,
					// Parameters: [{
					// 	Name: startNode.method.parameter.name,
					// 	// _id: startNode.method.parameter.UUID.replace(/\-/g, ""),
					// 	Type: edge.end.name,
					// 	TypeUUID: 'a'+edge.end.UUID.replace(/\-/g, "")
					// }]
				}
				// console.log("method");
				// console.log(util.inspect(method, false, null));
				domainElement.Operations.push(method);
				// console.log("domainElement");
				// console.log(util.inspect(domainElement, false, null));
			}
			domainElementsByID[componentUUID] = domainElement;
			// console.log("check domainElement");
			// console.log(util.inspect(domainElement, false, null));
		}
		}
		// for (var i in typeDependencyGraph.edgesPara) {
		// 	var edge = typeDependencyGraph.edgesPara[i];
		// 	// console.log("check edge");
		// 	// console.log(util.inspect(edge, false, null));
		// 	var startNode = edge.start;
		// 	var componentUUID = 'c'+dicClassComponent[startNode.UUID].replace(/\-/g, "_");
		// 	var domainElement = domainElementsByID[componentUUID];
		// 	var foundMethod = false;
		// 	var foundParameter = false;
		// 	for (var j in domainElement.Operations) {
		// 		if (domainElement.Operations[j]._id == 'a'+startNode.method.UUID.replace(/\-/g, "")) {
		// 			var method = domainElement.Operations[j];
		// 			foundMethod = true;
		// 			for (var k in method.Parameters) {
		// 				if (method.Parameters[k].Type == startNode.method.parameter.name) {
		// 					foundParameter = true;
		// 				}
		// 			}
		// 			if (!foundParameter) {
		// 				var parameter = {
		// 					Name: startNode.method.parameter.name,
		// 					// _id: startNode.method.parameter.UUID.replace(/\-/g, ""),
		// 					Type: edge.end.name,
		// 					TypeUUID: 'a'+edge.end.UUID.replace(/\-/g, "")
		// 				};
		// 				method.Parameters.push(parameter);
		// 			}
		// 		}
		// 	}
		// 	if (!foundMethod) {
		// 		// console.log("not foundMethod");
		// 		var method = {
		// 			Name: startNode.method.name,
		// 			_id: 'a'+startNode.method.UUID.replace(/\-/g, ""),
		// 			Parameters: [{
		// 				Name: startNode.method.parameter.name,
		// 				// _id: startNode.method.parameter.UUID.replace(/\-/g, ""),
		// 				Type: edge.end.name,
		// 				TypeUUID: 'a'+edge.end.UUID.replace(/\-/g, "")
		// 			}]
		// 		}
		// 		// console.log("method");
		// 		// console.log(util.inspect(method, false, null));
		// 		domainElement.Operations.push(method);
		// 		// console.log("domainElement");
		// 		// console.log(util.inspect(domainElement, false, null));
		// 	}
		// 	domainElementsByID[componentUUID] = domainElement;
		// 	// console.log("check domainElement");
		// 	// console.log(util.inspect(domainElement, false, null));
		// }

//		console.log("domainElements");
//		console.log(util.inspect(domainElements, false, null));
//		console.log("domainElementsByID");
//		console.log(util.inspect(domainElementsByID, false, null));

		DomainModel.Elements = domainElements;
		
		DomainModel.DiagramType = "domain_model";

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("constructed_domain_model_kdm", DomainModel);

//		createDomainModelDiagram(DomainModel.Elements, DomainModel.OutputDir+"/"+"domain_model.dotty", function(){
//		   console.log("class diagram is output: "+DomainModel.OutputDir+"/"+"domain_model.dotty");
//	   });


		return {
			DomainModel:DomainModel,
			DomainElementsByID: domainElementsByID
		}

	}
	
	
	function createUseCasesbyAndroidLog(dicComponent, ModelOutputDir, ModelAccessDir){
		
		var androidLogPath = "./data/GitAndroidAnalysis/android-demo-log.txt"	;
		
		var UseCases = [];

		var UseCase = {
				_id: "src",
				Name: "src",
				PrecedenceRelations : [],
				Activities : [],
				OutputDir : ModelOutputDir+"/src",
				AccessDir : ModelAccessDir+"/src",
				DiagramType : "none"
		}

		var activities = [];
		var activitiesByID = {}
		var precedenceRelations = [];

		
		var transactions = androidLogUtil.identifyTransactions(androidLogPath, dicComponent);
		
		console.log("dicComponent");
		console.log(dicComponent);
		console.log(transactions);
//		process.exit(0);

		for(var i in transactions){
			var transaction = transactions[i];
		var prevNode = null;
		for(var j in transaction.Nodes){
			var node = transaction.Nodes[j];

			activities.push(node);
			activitiesByID[node._id] = node;
			if(prevNode){
				precedenceRelations.push({start: prevNode, end: node});
			}
			prevNode = node;
		}
		}

		UseCase.Activities = UseCase.Activities.concat(activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);

		UseCases.push(UseCase);

		return UseCases;

	}

	function createUseCasesbyCFG(cfgGraph, ModelOutputDir, ModelAccessDir, domainElementsByID){

		var UseCases = [];

		var UseCase = {
				_id: "src",
				Name: "src",
				PrecedenceRelations : [],
				Activities : [],
				OutputDir : ModelOutputDir+"/src",
				AccessDir : ModelAccessDir+"/src",
				DiagramType : "none"
		}

		var nodes = cfgGraph.nodes;
		var edges = cfgGraph.edges;

		var activities = [];
		var activitiesByID = {}

		for(var i in nodes){
			var node = nodes[i];

			var domainElement = null;

			if(node.component){
				domainElement = domainElementsByID["c"+node.component.UUID.replace(/\-/g, "_")];
			}

			var activity = {
					Name: node['name'],
					_id: "a"+node['UUID'].replace(/\-/g, "_"),
					Type: "activity",
					isResponse: node.isResponse,
					Stimulus: node.type === "stimulus" ? true: false,
					OutScope: false,
					Group: "System",
					Component: domainElement
			}


			activities.push(activity);
			activitiesByID[activity._id] = activity;
		}


		var precedenceRelations = [];

		for(var i in edges){
			var edge = edges[i];

			console.log("edge");
			console.log(edge);

			var startId = "a"+edge.start.UUID.replace(/\-/g, "_");
			var endId = "a"+edge.end.UUID.replace(/\-/g, "_");

			var start = activitiesByID[startId];
			var end = activitiesByID[endId];
			
			if(!start || !end){
				continue;
			}

			console.log("push edge");
			precedenceRelations.push({start: start, end: end});
		}

		UseCase.Activities = UseCase.Activities.concat(activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);

		UseCases.push(UseCase);

		return UseCases;

	}


	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel,
	}
}());