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
//	var componentIdentifierACDC = require("./ComponentIdentificationACDC.js");
	var controlFlowGraphConstructor = require("./ControlFlowGraphConstruction.js");
	var useCaseIdentifier = require("./UseCaseIdentification.js");
	var responseIdentifier = require("./ResponseIdentification.js");
	var util = require('util');
	var androidLogUtil = require("../../utils/AndroidLogUtil.js");

	var responsePatternsFile = "response-patterns.txt";
	
	var modelDrawer = require("../../model_drawers/UserSystemInteractionModelDrawer.js");

	function extractUserSystermInteractionModel(xmiString, workDir, ModelOutputDir, ModelAccessDir, callbackfunc, modelInfo) {
			
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
				
				var codeAnalysisResults = codeAnalysis.analyseCode(xmiString, Model.OutputDir);
				
				var responseFilePath = workDir +"/"+responsePatternsFile;
				if( !fs.existsSync(responseFilePath) ) {
					responseFilePath = "./model_platforms/src/"+responsePatternsFile;
				}
				
				//need to update for the identification response methods.
				var dicResponseMethodUnits = null;
				
				if(modelInfo.stimulusFile){
					dicResponseMethodUnits = responseIdentifier.identifyResponseGator(codeAnalysisResults, modelInfo.path+"/"+modelInfo.stimulusFile);
				}
				else{
					dicResponseMethodUnits = responseIdentifier.identifyResponse(codeAnalysisResults, responseFilePath);
				}

				var debug = require("../../utils/DebuggerOutput.js");

				debug.writeJson2("identified_response_method_units", dicResponseMethodUnits);
				
				debug.writeJson2("referenced_composite_class_units", codeAnalysisResults.referencedCompositeClassUnits);

				var componentInfo = null;
				
				 // clustering configs for agglomerative clustering
				 // Unbiased Ellenberg Relative Complete Cohesion:  75%-80%
				 var S2W3L3 = {
						 s: 2,
						 w: 3,
						 l: 3,
						 cut: 0.8,
						 tag:"S2W3L3"
				 }
		
				 // S1W1L1 Euclidean Binary Single Coupling: 50%
				 var S1W1L1 = {
						 s: 1,
						 w: 1,
						 l: 1,
						 cut: 0.5,
						 tag:"S1W1L1"
				 }
		
				 // S1W3L1 Euclidean Relative Single ?
				 var S1W3L1 = {
						 s: 1,
						 w: 3,
						 l: 1,
						 cut: 0.7,
						 tag:"S1W3L1"
				 }
				
				modelInfo.clusterFile = null;
				if(modelInfo.clusterFile){
				componentInfo = componentIdentifier.identifyComponentsACDC(
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
						Model.OutputDir,
						modelInfo.path+"/"+modelInfo.clusterFile
						);
				}
				else{
				componentInfo = componentIdentifier.identifyComponents(
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
//					S2W3L3,
//					S1W3L1,
					S1W1L1,
					Model.OutputDir
				);
				}
				
//				debug.writeJson2("dic_class_component_1_19", componentInfo.dicClassComponent);
				debug.writeJson3("identified_components", componentInfo.dicComponents);
			
				var componentMappingString = "";
				
				//write the components in rsf format
				var ind = 0;
				for(var i in componentInfo.dicComponents){
					var component = componentInfo.dicComponents[i];
					for(var j in component.classUnits){
					ind += 1;
					var classUnit = component.classUnits[j];
					componentMappingString += "contain "+component.name+ind+".ss "+classUnit.name.replace(/\s/g, "")+"\n";
					}
				}
				
				debug.writeTxt("clustered_classes", componentMappingString);

				var controlFlowGraph = controlFlowGraphConstructor.establishControlFlow(componentInfo.dicComponents, componentInfo.dicClassComponent, codeAnalysisResults.dicMethodClass, dicResponseMethodUnits, codeAnalysisResults.dicMethodUnits, codeAnalysisResults.callGraph, ModelOutputDir);
				
				debug.writeJson2("control_flow_graph", controlFlowGraph);
				
				domainModelInfo = createDomainModel(componentInfo, Model.OutputDir, Model.OutputDir, codeAnalysisResults.callGraph, codeAnalysisResults.accessGraph, codeAnalysisResults.typeDependencyGraph, codeAnalysisResults.dicMethodParameters);
				
				Model.DomainModel = domainModelInfo.DomainModel;
				
				debug.writeJson2("constructed_domain_model", Model.DomainModel);
				
				var log = modelInfo.logFile ? modelInfo.logFile : modelInfo.logFolder;
				if(log && modelInfo.useCaseRec){
					useCaseIdentifier.identifyUseCasesfromAndroidLog(componentInfo.dicComponents, domainModelInfo.dicComponentDomainElement, dicResponseMethodUnits, Model.OutputDir, Model.OutputDir, modelInfo.path+"/"+log,  modelInfo.path+"/"+modelInfo.useCaseRec, function(useCases){
						Model.UseCases = useCases;
						
						modelDrawer.drawClassDiagram(codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/classDiagram.dotty");
						
						modelDrawer.drawCompositeClassDiagram(codeAnalysisResults.dicCompositeClassUnits, Model.DomainModel.OutputDir+"/compositeClassDiagram.dotty");
						
						modelDrawer.drawComponentDiagram(componentInfo.dicComponents, Model.DomainModel.OutputDir+"/componentDiagram.dotty");
						
						debug.writeJson("constructed_model", Model);

						if(callbackfunc){
							callbackfunc(Model);
						}
						
					});
				}
				else{
					Model.UseCases = useCaseIdentifier.identifyUseCasesfromCFG(controlFlowGraph, Model.OutputDir, Model.OutputDir, domainModelInfo.DomainElementsByID);
					
					modelDrawer.drawClassDiagram(codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/classDiagram.dotty");
					
					modelDrawer.drawCompositeClassDiagram(codeAnalysisResults.dicCompositeClassUnits, Model.DomainModel.OutputDir+"/compositeClassDiagram.dotty");
					
					modelDrawer.drawComponentDiagram(componentInfo.dicComponents, Model.DomainModel.OutputDir+"/componentDiagram.dotty");
					
					debug.writeJson("constructed_model", Model);

					if(callbackfunc){
						callbackfunc(Model);
					}
					
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
		var dicComponentDomainElement = {};

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
			dicComponentDomainElement[component.UUID] = domainElement;
		}

		for (var i in callGraph.edges) {
			var edge = callGraph.edges[i];
			
			var startNode = edge.start;
			console.log("domain model element")
			console.log(startNode);
			var callComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
			var callDomainElement = domainElementsByID[callComponentUUID];
			
			if(!callDomainElement){
				continue;
			}
			
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
			
			var endNode = edge.end;
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
			var startNode = edge.start;
			var componentUUID = 'c'+dicClassComponent[startNode.UUID].replace(/\-/g, "_");
			var domainElement = domainElementsByID[componentUUID];
			var foundMethod = false;
			for (var j in domainElement.Operations) {
				if (domainElement.Operations[j]._id == 'a'+startNode.method.UUID.replace(/\-/g, "")) {
					var method = domainElement.Operations[j];
					foundMethod = true;
				}
			}
			if (!foundMethod) {
				var parameters = dicMethodParameters[startNode.method.UUID];
				if (parameters == null) {
					parameters = [];
				}
				var method = {
					Name: startNode.method.name,
					_id: 'a'+startNode.method.UUID.replace(/\-/g, ""),
					Parameters: parameters,
				}
				domainElement.Operations.push(method);
			}
			domainElementsByID[componentUUID] = domainElement;
		}
		}
		
		DomainModel.Elements = domainElements;
		
		DomainModel.DiagramType = "domain_model";

		return {
			DomainModel:DomainModel,
			DomainElementsByID: domainElementsByID,
			dicComponentDomainElement: dicComponentDomainElement
		}

	}

	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel,
	}
}());