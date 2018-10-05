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
 * those elements store all the same type of elements in the sub classes.
	var ClassUnit = {
			name: XMIClassUnit['$']['name'],
			isAbstract: XMIClassUnit['$']['isAbstract'],
			Source: null,
			MethodUnits : [],
			StorableUnits: [],
//			Calls : [],
//			ClassUnits: [],
			InterfaceUnits : [],
			Imports : [],
			ClassUnits: [],
//			BlockUnits : [],
//			Addresses: [],
//			Reads:[],
//			Calls:[],
//			Creates:[],
//			ActionElements:[],
//			isResponse: false,
			attachment: XMIClassUnit
	}
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var codeAnalysis = require("./CodeAnalysis.js");
	var componentIdentifier = require("./ComponentIdentification.js");
	var controlFlowGraphConstructor = require("./ControlFlowGraphConstruction.js");
	var responseIdentifier = require("./ResponseIdentification.js");
	var util = require('util');

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	var responsePatternsFile = "response-patterns.txt";

	function extractUserSystermInteractionModel(xmiString, workDir, ModelOutputDir, ModelAccessDir, callbackfunc) {
//		fs.readFile(filePath, "utf8", function(err, data) {
			console.log("file content");
//			console.log(data);
//			parser.parseString(data, function(err, result) {

				var Model = {
						Actors:[],
						Roles:[],
						UseCases: [],
						DomainModel: {},
						OutputDir: ModelOutputDir,
						AccessDir: ModelAccessDir
				};

				var debug = require("../../utils/DebuggerOutput.js");

//				xmiString = result;
				var codeAnalysisResults = codeAnalysis.analyseCode(xmiString, Model.OutputDir);
//				debug.writeJson("constructed_model_by_kdm_result_7_5", codeAnalysisResults);
				
				var dicResponseMethodUnits = responseIdentifier.identifyResponse(codeAnalysisResults, workDir +"/"+responsePatternsFile);

				var componentInfo = componentIdentifier.identifyComponents(codeAnalysisResults.callGraph, codeAnalysisResults.accessGraph, codeAnalysisResults.typeDependencyGraph, codeAnalysisResults.referencedClassUnitsComposite, codeAnalysisResults.dicClassUnits, codeAnalysisResults.dicCompositeSubclasses, Model.OutputDir);

				debug.writeJson("constructed_model_by_kdm_components_7_5", componentInfo.dicComponents);

				var controlFlowGraph = controlFlowGraphConstructor.establishControlFlow(componentInfo.dicComponents, componentInfo.dicClassComponent, codeAnalysisResults.dicMethodClass, dicResponseMethodUnits, xmiString, ModelOutputDir);

				domainModelInfo = createDomainModel(componentInfo, Model.OutputDir, Model.OutputDir, codeAnalysisResults.callGraph, codeAnalysisResults.accessGraph, codeAnalysisResults.typeDependencyGraph, codeAnalysisResults.dicMethodParameters);

				console.log("domain model Info");
				console.log(domainModelInfo);

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
				_id: 'c'+component.uuid.replace(/\-/g, "_"),
				Attributes: [],
				Operations: [],
				InheritanceStats: {},
				Associations: [],
				// Attachment: XMIClass
			};
			domainElements.push(domainElement);
			// var domainElement = createDomainElement(component);
			// DomainModel.Elements.push(domainElement);
			domainElementsByID[domainElement._id] = domainElement;
		}

		for (var i in callGraph.edges) {
			var edge = callGraph.edges[i];
			// console.log(edge)
			console.log(util.inspect(edge, false, null));
			var startNode = edge.start;
			var componentUUID = 'c'+dicClassComponent[startNode.component.classUnit].replace(/\-/g, "_");
			var domainElement = domainElementsByID[componentUUID];
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
					Name: startNode.methodName,
					_id: 'a'+startNode.UUID.replace(/\-/g, ""),
					Parameters: parameters,
				}
				domainElement.Operations.push(method);
			}
			var endNode = edge.end;
			var componentUUID = 'c'+dicClassComponent[endNode.component.classUnit].replace(/\-/g, "_");
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
			var componentUUID = 'c'+dicClassComponent[startNode.component.classUnit].replace(/\-/g, "_");
			var domainElement = domainElementsByID[componentUUID];
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
					Name: startNode.methodName,
					_id: 'a'+startNode.UUID.replace(/\-/g, ""),
					Parameters: parameters,
				}
				domainElement.Operations.push(method);
			}
			var endNode = edge.end;
			var endComponentUUID = 'a'+dicClassComponent[endNode.component.classUnit].replace(/\-/g, "");
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

		for (var i in typeDependencyGraph.edgesAttr) {
			var edge = typeDependencyGraph.edgesAttr[i];
			var startNode = edge.start;
			var componentUUID = 'c'+dicClassComponent[startNode.component.classUnit].replace(/\-/g, "_");
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

		// console.log("domainElements");
		// console.log(domainElements);
		// console.log("domainElementsByID");
		// console.log(domainElementsByID);

		// console.log("check edgesPara");
		// console.log(typeDependencyGraph.edgesPara);

		for (var i in typeDependencyGraph.edgesPara) {
			var edge = typeDependencyGraph.edgesPara[i];
			// console.log("check edge");
			// console.log(util.inspect(edge, false, null));
			var startNode = edge.start;
			var componentUUID = 'c'+dicClassComponent[startNode.component.classUnit].replace(/\-/g, "_");
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

		// for (var i in typeDependencyGraph.edgesPara) {
		// 	var edge = typeDependencyGraph.edgesPara[i];
		// 	// console.log("check edge");
		// 	// console.log(util.inspect(edge, false, null));
		// 	var startNode = edge.start;
		// 	var componentUUID = 'c'+dicClassComponent[startNode.component.classUnit].replace(/\-/g, "_");
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


		// for(var i in classUnits){
		// 	var classUnit = classUnits[i];
		// 	console.log('exam class');
		// 	console.log(classUnit);
		// 	var domainElement = createDomainElement(classUnit);
		// 	DomainModel.Elements.push(domainElement);
		// 	domainElementsByID[domainElement._id] = domainElement;
		// }


		DomainModel.DiagramType = "class_diagram";

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("constructed_domain_model_kdm", DomainModel);

		createClassDiagramFunc(DomainModel.Elements, DomainModel.OutputDir+"/"+"class_diagram.dotty", function(){
		   console.log("class diagram is output: "+DomainModel.OutputDir+"/"+"class_diagram.dotty");
	   });


		return {
			DomainModel:DomainModel,
			DomainElementsByID: domainElementsByID
		}

	}

	// draw the class diagram of the model
	function createClassDiagramFunc(classElements, graphFilePath, callbackfunc){

		      console.log("run the create class dia");
              console.log("class diagram model is"+classElements);
              console.log("class diagram model is"+JSON.stringify(classElements));
		//           var json_obj = {
//           	   "allClass" :[
//				   {"className": "bookTicketMangement",
//			        "attributes": [
//					   	{"attributeName": "ticketName",
//				         "attributeType": "String"
//						},
//						 {"attributeName": "ticketId",
//						 "attributeType": "int"
//                         }
//                      ],
//					"operations": [
//						 {"operationName":"bookTicketsManagement(int)",
//						  "operationReturn":"void"
//						 }
//					   ],
//					"kids": ["BookTickets","bookTicketInterface"]
//				   },
//
//				   {"className": "BookTickets",
//					"attributes": [
//						{"attributeName": "BookTicketName",
//						 "attributeType": "int"
//                           }
//                       ],
//					 "operations": [],
//					 "kids": []
//                   },
//
//                   {"className": "bookTicketInterface",
//                    "attributes": [
//                       {"attributeName": "BookTicketInput",
//                        "attributeType": "int"
//					   }
//					 ],
//                     "operations": [],
//                      "kids": []
//                   }
//			   ]
//		   }

			var graph = 'digraph class_diagram {';
             graph += 'node [fontsize = 8 shape = "record"]';
             graph += ' edge [arrowhead = "ediamond"]'
             for(i = 0;  i < classElements.length; i++){
                 var curClass = classElements[i];
                 graph += curClass["_id"];
                 graph += '[ id = ' + curClass["_id"];
                 graph += ' label = "{';
                 graph += curClass["Name"];


                 var classAttributes = classElements[i]["Attributes"];
                 if (classAttributes.length != 0){
                     graph += '|';
                     for(j = 0; j < classAttributes.length; j++) {
                         graph += '-   ' ;
                         graph += classAttributes[j]["Name"];
                         graph += ':'+classAttributes[j]["Type"];
                         graph += '\\l';
                     }
                 }

                 // graph += '|';

                 var classOperations = classElements[i]["Operations"];
                 if (classOperations.length != 0){
                     graph += '|';
                     for(j = 0; j < classOperations.length;j++) {

                    	 graph += '+   ' ;
                         graph += classOperations[j]["Name"] + '(';
												 // console.log(util.inspect(dicMethodParameters, false, null));
												 // console.log(util.inspect(classOperations, false, null));
												 // console.log(util.inspect(classOperations[j], false, null));
                         var para_len = classOperations[j]["Parameters"].length;
                         for (k = 0; k < classOperations[j]["Parameters"].length - 1; k++) {
                        	 graph += classOperations[j]["Parameters"][k]["Type"]+" "+ classOperations[j]["Parameters"][k]["Name"];
                         }
                         graph += ')';
//                         graph += ':'+classOperations[j]["Parameters"][para_len - 1]["Type"];
                         graph += "\\l";
                     }
                 }



                 graph += '}"]';

                 var classAss = classElements[i]["Associations"];
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
				domainElement = domainElementsByID["c"+node.component.uuid.replace(/\-/g, "_")];
			}

			var activity = {
					Name: node['name'],
					_id: "a"+node['uuid'].replace(/\-/g, "_"),
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

			var startId = "a"+edge.start.uuid.replace(/\-/g, "_");
			var endId = "a"+edge.end.uuid.replace(/\-/g, "_");

			var start = activitiesByID[startId];
			var end = activitiesByID[endId];
//
//			var start = edge.start;
//			var end = edge.end;
//
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
