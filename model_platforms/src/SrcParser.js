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
	var useCaseIdentifier = require("./UseCaseIdentification.js");
	var responseIdentifier = require("./ResponseIdentification.js");
	var util = require('util');
	var androidLogUtil = require("../../utils/AndroidLogUtil.js");
	var codeAnalysisUtil = require("../../utils/CodeAnalysisUtil.js");

	var dependencyGraphDrawer = require("./DependencyGraphDrawer.js");

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
				 
				var clusterConfig = null;
				 
				if(modelInfo.clusterConfig === "S1W3L1"){
					clusterConfig = S1W3L1;
				}
				else if(modelInfo.clusterConfig === "S2W3L3"){
					clusterConfig = S2W3L3;
				}
				else {
					clusterConfig = S1W1L1;
				}
				
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
					clusterConfig,
					Model.OutputDir
				);
				}
			
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

//				var controlFlowGraph = controlFlowGraphConstructor.establishControlFlow(componentInfo.dicComponents, componentInfo.dicClassComponent, codeAnalysisResults.dicMethodClass, dicResponseMethodUnits, codeAnalysisResults.dicMethodUnits, codeAnalysisResults.callGraph, ModelOutputDir);
				
//				debug.writeJson2("control_flow_graph", controlFlowGraph);

				domainModelInfo = createDomainModel(componentInfo, Model.OutputDir, Model.OutputDir, codeAnalysisResults.callGraph, codeAnalysisResults.accessGraph, codeAnalysisResults.typeDependencyGraph, codeAnalysisResults.extendsGraph, codeAnalysisResults.compositionGraph, codeAnalysisResults.dicMethodUnits);
				
				Model.DomainModel = domainModelInfo.DomainModel;
				
				debug.writeJson2("constructed_domain_model", Model.DomainModel);
				
				var log = modelInfo.logFile ? modelInfo.logFile : modelInfo.logFolder;
				log = modelInfo.filteredLogFolder ? modelInfo.filteredLogFolder : log;
				log = modelInfo.filteredLogFile ? modelInfo.filteredLogFile : log;
				if(log && modelInfo.useCaseRec){
					useCaseIdentifier.identifyUseCasesfromAndroidLog(componentInfo.dicComponents, domainModelInfo.dicComponentDomainElement, dicResponseMethodUnits, Model.OutputDir, Model.OutputDir, modelInfo.path+"/"+log,  modelInfo.path+"/"+modelInfo.useCaseRec, function(useCases){
						if(!useCases){
							console.log("no use cases identified");
							return;
						}
							
						Model.UseCases = useCases;
						
						modelDrawer.drawClassDiagram(codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/classDiagram.dotty");
						
						modelDrawer.drawCompositeClassDiagram(codeAnalysisResults.dicCompositeClassUnits, codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/compositeClassDiagram.dotty");
						
						modelDrawer.drawComponentDiagram(componentInfo.dicComponents, codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/componentDiagram.dotty");
						
						debug.writeJson("constructed_model", Model);

						if(callbackfunc){
							callbackfunc(Model);
						}
						
					});
				}
				else{
					Model.UseCases = useCaseIdentifier.identifyUseCasesfromCFG(componentInfo.dicComponents, componentInfo.dicClassComponent, codeAnalysisResults.dicMethodClass, dicResponseMethodUnits, codeAnalysisResults.dicMethodUnits, codeAnalysisResults.dicClassUnits, codeAnalysisResults.cfg, Model.OutputDir, Model.OutputDir, domainModelInfo.DomainElementsByID);

//					Model.UseCases = useCaseIdentifier.identifyUseCasesfromCFG(componentInfo.dicComponents, componentInfo.dicClassComponent, codeAnalysisResults.dicMethodClass, dicResponseMethodUnits, codeAnalysisResults.dicMethodUnits, codeAnalysisResults.dicClassUnits, modelInfo.path+"/"+modelInfo.icfg, Model.OutputDir, Model.OutputDir, domainModelInfo.DomainElementsByID);

					modelDrawer.drawClassDiagram(codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/classDiagram.dotty");
					
					modelDrawer.drawCompositeClassDiagram(codeAnalysisResults.dicCompositeClassUnits, codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/compositeClassDiagram.dotty");
					
					modelDrawer.drawComponentDiagram(componentInfo.dicComponents, codeAnalysisResults.dicClassUnits, Model.DomainModel.OutputDir+"/componentDiagram.dotty");
					
					debug.writeJson("constructed_model", Model);

					if(callbackfunc){
						callbackfunc(Model);
					}
					
				}


		    dependencyGraphDrawer.drawClassDependencyGraph(codeAnalysisResults, Model.OutputDir);

            dependencyGraphDrawer.drawClassDependencyGraphGroupedByCompositeClass(codeAnalysisResults, componentInfo, Model.OutputDir);

            dependencyGraphDrawer.drawClassDependencyGraphGroupedByComponent(codeAnalysisResults, componentInfo, Model.OutputDir);

            dependencyGraphDrawer.drawCompositeClassDependencyGraph(codeAnalysisResults, Model.OutputDir);

				
	}

	function createDomainModel(componentInfo, ModelOutputDir, ModelAccessDir, callGraph, accessGraph, typeDependencyGraph, extendsGraph, compositionGraph, dicMethodUnits){
        /*
        *   The elements of the domain model:
        *
        */

		var dicComponents = componentInfo.dicComponents;
		var dicClassComponent = componentInfo.dicClassComponent;

		var DomainModel = {
			Elements: [],
			Usages: [],
			Associations: [],
			Generalizations: [],
			OutputDir : ModelOutputDir+"/domainModel",
			AccessDir : ModelAccessDir+"/domainModel",
			DiagramType : "class_diagram"
		}

		var domainElementsByID = [];
		var domainElements = [];
		var dicComponentDomainElement = {};

		for(var i in dicComponents){
			console.log("create domain model element")
			var component = dicComponents[i];
			
			var domainElement = {
				Name: component.name,
				_id: 'c'+component.UUID.replace(/\-/g, "_"),
				Attributes: [],
				Operations: []
			};


			for(var i in component.classUnits){
			    var classUnit = component.classUnits[i];
			    for(var j in classUnit.methodUnits){
                       var methodUnit = classUnit.methodUnits[j];
                       var parameters = methodUnit.signature.parameterUnits;
                       				if (parameters == null) {
                       					parameters = [];
                       		    	}
                       				var operation = {
                       					Name: methodUnit.signature.name,
                       					_id: 'a'+methodUnit.UUID.replace(/\-/g, ""),
                       					Parameters: parameters.map((param)=>{return {Type: param.type}}),
                       					ReturnVal: {}
                       				}

                       				domainElement.Operations.push(operation);
			    }

			    for(var j in classUnit.attrUnits){
			           var attrUnit = classUnit.attrUnits[j];

			           var attr = {
                       					Name: attrUnit.name,
                       					_id: 'a'+attrUnit.UUID.replace(/\-/g, ""),
                       					Type: attrUnit.attrType,
                       					TypeUUID: 'a'+attrUnit.UUID.replace(/\-/g, ""),
                       				};
                       if(attrUnit.isStatic){
                        attr.isStatic = true;
                       }

                       domainElement.Attributes.push(attr);

			    }
			}
			
			domainElements.push(domainElement);
			domainElementsByID[domainElement._id] = domainElement;
			dicComponentDomainElement[component.UUID] = domainElement;
		}

//		var operationsBySign = {};
//
		for (var i in callGraph.edges) {
			var edge = callGraph.edges[i];

			var startNode = edge.start;
			var callComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
			var callDomainElement = domainElementsByID[callComponentUUID];

			var endNode = edge.end;
			var calleeComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
			var calleeDomainElement = domainElementsByID[calleeComponentUUID];

			if(!callDomainElement || !calleeDomainElement || callDomainElement == calleeDomainElement){
				continue;
			}

			var usage = {
                  _id: startNode.component.UUID + "_" + endNode.component.UUID,
                  type: "usage",
                  Supplier: endNode.component.UUID,
                  Client: callComponentUUID
            };

            DomainModel.Usages.push(usage);

            var methodUnit = dicMethodUnits[endNode.UUID];
			foundMethod = false;
			for (var j in calleeDomainElement.Operations) {
				if (calleeDomainElement.Operations[j]._id == 'a'+endNode.UUID.replace(/\-/g, "") || calleeDomainElement.Operations[j].Name === endNode.methodName) {
					calleeDomainElement.Operations[j].visibility = "public";
				}
			}

//			if (!foundMethod) {
//				var parameters = methodUnit.parameterUnits;
//				if (parameters == null) {
//					parameters = [];
//				}
//				var operation = {
//					Name: endNode.methodName,
//					_id: 'a'+endNode.UUID.replace(/\-/g, ""),
//					Parameters: parameters.map((param)=>{return {Type: param.type}}),
//					ReturnVal: {}
//				}
//
//				calleeDomainElement.Operations.push(operation);
//
//				operationsBySign[codeAnalysisUtil.genMethodSign(methodUnit)] = 1;
//			}
		}

//		var attrsBySign = {};
		
		for (var i in accessGraph.edges) {
			var edge = accessGraph.edges[i];

			var startNode = edge.start;
			var accessComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
			var accessDomainElement = domainElementsByID[accessComponentUUID];

			var endNode = edge.end;
            var accesseeComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
            var accesseeDomainElement = domainElementsByID[accesseeComponentUUID];


			if(!accessDomainElement || !accesseeDomainElement || accessDomainElement == accesseeDomainElement){
				continue;
			}

			var usage = {
                 _id: startNode.component.UUID + "_" + endNode.component.UUID,
                 type: "usage",
                 Supplier: endNode.component.UUID,
                 Client: callComponentUUID
              };

             DomainModel.Usages.push(usage);

//			var foundAttr = false;
			for (var j in accesseeDomainElement.Attributes) {
				if (accesseeDomainElement.Attributes[j]._id == 'a'+endNode.UUID.replace(/\-/g, "") ) {
					accesseeDomainElement.Attributes[j].visibility = "public";
				}
			}
			
//			if (!foundAttr) {
//				var attr = {
//					Name: endNode.attrName,
//					_id: 'a'+endNode.UUID.replace(/\-/g, ""),
//					Type: endNode.attrType,
//					TypeUUID: 'a'+endNode.UUID.replace(/\-/g, "")
//				};
//				accesseeDomainElement.Attributes.push(attr);
//				attrsBySign[codeAnalysisUtil.genAttrSign(attr)] = 1;
//			}
		}

        for(var i in extendsGraph.edges){
            var edge = extendsGraph.edges[i];

            			var startNode = edge.start;
            			var extendComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
            			var extendDomainElement = domainElementsByID[extendComponentUUID];

            			var endNode = edge.end;
                        var extendedComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
                        var extendedDomainElement = domainElementsByID[extendedComponentUUID];


            			if(!extendDomainElement || !extendedDomainElement || extendDomainElement == extendedDomainElement){
            				continue;
            			}

            			var generalization = {
                             _id: startNode.component.UUID + "_" + endNode.component.UUID,
                             type: "generalization",
                             Supplier: extendComponentUUID,
                             Client: extendedComponentUUID
                          };

                         DomainModel.Generalizations.push(generalization);
        }

        for(var i in compositionGraph.edges){
           var edge = compositionGraph.edges[i];
           console.log(edge)
           var startNode = edge.start;
            var composeComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
            var composeDomainElement = domainElementsByID[composeComponentUUID];

                        			var endNode = edge.end;
                                    var composedComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
                                    var composedDomainElement = domainElementsByID[composedComponentUUID];


                        			if(!composeDomainElement || !composedDomainElement || composeDomainElement == composedDomainElement){
                        				continue;
                        			}

                        			var composition = {
                                         _id: startNode.component.UUID + "_" + endNode.component.UUID,
                                         type: "composition",
                                         Supplier: composeComponentUUID,
                                         Client: composedComponentUUID
                                      };

                                     DomainModel.Associations.push(composition);
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