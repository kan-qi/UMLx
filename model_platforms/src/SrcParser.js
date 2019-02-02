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
	var controlFlowGraphConstructor = require("./ControlFlowGraphConstruction.js");
	var responseIdentifier = require("./ResponseIdentification.js");
	var util = require('util');

	var responsePatternsFile = "response-patterns.txt";

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
				
				console.log("composition graph");
				console.log(codeAnalysisResults.compositionGraph);
				debug.writeJson2("composition_graph_1_19", codeAnalysisResults.compositionGraph);
				
				var responseFilePath = workDir +"/"+responsePatternsFile;
				if( !fs.existsSync(responseFilePath) ) {
					responseFilePath = "./model_platforms/src/"+responsePatternsFile;
				}
				
				//need to update for the identification response methods.
				var dicResponseMethodUnits = responseIdentifier.identifyResponse(codeAnalysisResults, responseFilePath);

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
				
				debug.writeJson2("class_component_1_19", componentInfo.dicClassComponent);
				debug.writeJson3("dic_components_1_19", componentInfo.dicComponents);
				
				var componentMappingString = "";
				
				for(var i in componentInfo.dicComponents){
					var component = componentInfo.dicComponents[i];
					for(var j in component.classUnits){
					var classUnit = component.classUnits[j];
					componentMappingString += "contain "+component.name+".ss "+classUnit.name.replace(/\s/g, "")+"\n";
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

				debug.writeJson("constructed_model_by_kdm_model_7_5", Model);

				if(callbackfunc){
					callbackfunc(Model);
				}
	}

	function createDomainModel(componentInfo, ModelOutputDir, ModelAccessDir, callGraph, accessGraph, typeDependencyGraph, dicMethodParameters){

		var dicComponents = componentInfo.dicComponents;
		var dicClassComponent = componentInfo.dicClassComponent;
		
		console.log("dicClassComponent");
		console.log(dicClassComponent);

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
			
			console.log('exam component');
			console.log(component);
			
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
			// console.log(edge)
			//console.log(util.inspect(edge, false, null));
			
			var startNode = edge.start;
			var componentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
			var domainElement = domainElementsByID[componentUUID];
			
			if(!domainElement){
				continue;
			}
			
			var foundMethod = false;
			for (var j in domainElement.Operations) {
				if (domainElement.Operations[j]._id === 'a'+startNode.UUID.replace(/\-/g, "")) {
					var method = domainElement.Operations[j];
					foundMethod = true;
					break;
				}
			}
			
			if (!foundMethod) {
				var parameters = dicMethodParameters[startNode.UUID];
				if (parameters == null) {
					parameters = [];
				}
				var method = {
					Name: startNode.methodName,
					_id: 'a'+startNode.UUID.replace(/\-/g, ""),
					Parameters: parameters,
				}
				domainElement.Operations.push(method);
			}
			
			var endNode = edge.end;
			var componentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
			var domainElement = domainElementsByID[componentUUID];
			foundMethod = false;
			for (var j in domainElement.Operations) {
				if (domainElement.Operations[j]._id == 'a'+endNode.UUID.replace(/\-/g, "")) {
					var method = domainElement.Operations[j];
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
				domainElement.Operations.push(method);
			}
		}

		for (var i in accessGraph.edges) {
			var edge = accessGraph.edges[i];
			var startNode = edge.start;
			var componentUUID = 'c'+startNode.component.UUID.replace(/\-/g, "_");
			var domainElement = domainElementsByID[componentUUID];
			if(!domainElement){
				continue;
			}
			var foundMethod = false;
			for (var j in domainElement.Operations) {
				if (domainElement.Operations[j]._id == 'a'+startNode.UUID.replace(/\-/g, "")) {
					var method = domainElement.Operations[j];
					foundMethod = true;
				}
			}
			if (!foundMethod) {
				var parameters = dicMethodParameters[startNode.UUID];
				if (parameters == null) {
					parameters = [];
				}
				var method = {
					Name: startNode.name,
					_id: 'a'+startNode.UUID.replace(/\-/g, ""),
					Parameters: parameters,
				}
				domainElement.Operations.push(method);
			}
			var endNode = edge.end;
			var endComponentUUID = 'a'+dicClassComponent[endNode.UUID].replace(/\-/g, "");
			var domainElement = domainElementsByID[componentUUID];
			var foundAttr = false;
			for (var j in domainElement.Attributes) {
				if (domainElement.Attributes[j]._id == 'a'+endNode.UUID.replace(/\-/g, "")) {
					foundAttr = true;
				}
			}
			if (!foundAttr) {
				var attr = {
					Name: endNode.attributeName,
					_id: 'a'+endNode.UUID.replace(/\-/g, ""),
					Type: endNode.attributeType,
					TypeUUID: 'a'+endNode.attributeTypeUUID.replace(/\-/g, "")
				};
				domainElement.Attributes.push(attr);
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

		createDomainModelDiagram(DomainModel.Elements, DomainModel.OutputDir+"/"+"domain_model.dotty", function(){
		   console.log("class diagram is output: "+DomainModel.OutputDir+"/"+"domain_model.dotty");
	   });


		return {
			DomainModel:DomainModel,
			DomainElementsByID: domainElementsByID
		}

	}

	// draw the domain model of the model
	function createDomainModelDiagram(domainModelElements, graphFilePath, callbackfunc){

		      console.log("run the create class dia");
              console.log("class diagram model is"+domainModelElements);
              console.log("class diagram model is"+JSON.stringify(domainModelElements));
              
			var graph = 'digraph class_diagram {';
             graph += 'node [fontsize = 8 shape = "record"]';
             graph += ' edge [arrowhead = "ediamond"]'
             for(i = 0;  i < domainModelElements.length; i++){
                 var curClass = domainModelElements[i];
                 graph += curClass["_id"];
                 graph += '[ id = ' + curClass["_id"];
                 graph += ' label = "{';
                 graph += curClass["Name"];


                 var classAttributes = domainModelElements[i]["Attributes"];
                 if (classAttributes.length != 0){
                     graph += '|';
                     for(j = 0; j < classAttributes.length; j++) {
                         graph += '-   ' ;
                         graph += classAttributes[j]["Name"];
                         graph += ':'+classAttributes[j]["Type"];
                         graph += '\\l';
                     }
                 }


                 var classOperations = domainModelElements[i]["Operations"];
                 if (classOperations.length != 0){
                     graph += '|';
                     for(j = 0; j < classOperations.length;j++) {

                    	 graph += '+   ' ;
                         graph += classOperations[j]["Name"] + '(';
                         var para_len = classOperations[j]["Parameters"].length;
                         for (k = 0; k < classOperations[j]["Parameters"].length - 1; k++) {
                        	 graph += classOperations[j]["Parameters"][k]["Type"]+" "+ classOperations[j]["Parameters"][k]["Name"];
                         }
                         graph += ')';
                         graph += "\\l";
                     }
                 }

                 graph += '}"]';

                 var classAss = domainModelElements[i]["Associations"];
                 for(j = 0; j < classAss.length;j++) {
                     graph += curClass["_id"] ;
                     graph += '->';
                     graph += classAss[j]["id"] + ' ';

                 }
			 }

            graph += 'imagepath = \"./public\"}';

     		console.log("graph is:"+graph);
     		dottyUtil = require("../../utils/DottyUtil.js");
     		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
     			console.log("class Diagram is done");
     		});


             return graph;
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