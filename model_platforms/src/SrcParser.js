/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 *
 * This script relies on KDM and Java model
 *
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
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
	var stimulusIdentifier = require("./StimulusIdentification.js");
	const uuidv4 = require('uuid/v4');

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;

	var xmiSring = "";

	function extractUserSystermInteractionModel(xmiString, ModelOutputDir, ModelAccessDir, callbackfunc) {
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
				var result = codeAnalysis.analyseCode(xmiString, Model.OutputDir);
				debug.writeJson("constructed_model_by_kdm_result_7_5", result);
				
				console.log("testing result");
				console.log(result);

				var components = componentIdentifier.identifyComponents(result.callGraph, result.accessGraph, result.typeDependencyGraph, result.classUnits);
				debug.writeJson("constructed_model_by_kdm_components_7_5", components);

				Model.DomainModel = createDomainModel(components, ModelOutputDir, ModelAccessDir).DomainModel;

				var controlFlowGraph = controlFlowGraphConstructor.establishControlFlow(components, xmiString, ModelOutputDir);
				
				debug.writeJson("constructed_model_by_kdm_control_flow_graph_7_5", controlFlowGraph);

				stimulusIdentifier.identifyStimuli(controlFlowGraph);
				
				Model.UseCases = createUseCasesbyCFG(controlFlowGraph, ModelOutputDir, ModelAccessDir);
//
//				for(var i in controlFlowGraph.Edges){
//					var edge = controlFlowGraph.Edges[i];
//					var activity = {
//							Type : "action",
//							_id : edge._id,
//							Name : edge.Name,
//							Stimulus : false,
//							Scope : false,
//						};
//
//					UseCase.Activities.push(activity);
//				}
//
				
				debug.writeJson("constructed_model_by_kdm_model_7_5", Model);

				if(callbackfunc){
					callbackfunc(Model);
				}

	}

//	// those elements store all the same type of elements in the sub classes.
//	var ClassUnit = {
//			name: XMIClassUnit['$']['name'],
//			isAbstract: XMIClassUnit['$']['isAbstract'],
//			Source: null,
//			MethodUnits : [],
//			StorableUnits: [],
////			Calls : [],
////			ClassUnits: [],
//			InterfaceUnits : [],
//			Imports : [],
//			ClassUnits: [],
////			BlockUnits : [],
////			Addresses: [],
////			Reads:[],
////			Calls:[],
////			Creates:[],
////			ActionElements:[],
////			isResponse: false,
//			attachment: XMIClassUnit
//	}

	function createDomainModel(Components, ModelOutputDir, ModelAccessDir){

		var DomainModel = {
			Elements: [],
			Usages: [],
			Realization:[],
			Assoc: [],
			OutputDir : ModelOutputDir+"/domainModel",
			AccessDir : ModelAccessDir+"/domainModel",
			DiagramType : "class_diagram",
		}

		function createDomainElement(component){
			var attributes = new Array();
			var operations = new Array();

			for(var i in component.classUnits){
			var classUnit = component.classUnits[i];
			
			for(var j in classUnit.StorableUnits){
				var storableUnit = classUnit.StorableUnits[j];

				var attribute = {
						Name: storableUnit.name,
						Type: storableUnit.kind,
						_id: storableUnit.UUID.replace(/\-/g, "")
				}
				attributes.push(attribute);
			}


			for(var j in classUnit.MethodUnits){
				var methodUnit = classUnit.MethodUnits[j];

				console.log(methodUnit.Signature);

				var parameters = [];
				var methodName = "undefined";


				console.log("signatures");
				console.log(methodUnit.Signature);

				if(methodUnit.Signature){
				for(var j in methodUnit.Signature.parameterUnits){
					var parameterUnit = methodUnit.Signature.parameterUnits[j];
					var parameter = {
							Name: parameterUnit.name,
							Type: parameterUnit.kind
					}
					parameters.push(parameter);
				}

				methodName = methodUnit.Signature.name;
				}

				var operation = {
						Name: methodName,
						Parameters: parameters,
						_id: methodUnit.UUID.replace(/\-/g, "")
				}
				operations.push(operation);
			}
			}

//			var id = classUnit.UUID.replace(/\-/g, "");
//			console.log("id");
//			console.log(id);

			return {
					_id: classUnit.UUID.replace(/\-/g, ""),
					Name: classUnit.name,
					Operations: operations,
					Attributes: attributes,
	                InheritanceStats: {},
	                Associations: []
//					Attachment: XMIClass
				}
		}

		var domainElementsByID = [];
		
		// the current methods of creating domain elements are abrupt, which is by consolidating all the sub class units
		
		for(var i in Components){
			var component = Components[i];
			console.log('exam component');
			console.log(component);
			var domainElement = createDomainElement(component);
			DomainModel.Elements.push(domainElement);
			domainElementsByID[domainElement._id] = domainElement;
		}


		DomainModel.DiagramType = "class_diagram";
	   createClassDiagramFunc(DomainModel.Elements, DomainModel.OutputDir+"/"+"class_diagram.dotty", function(){
		   console.log("class diagram is output: "+DomainModel.OutputDir+"/"+"class_diagram.dotty");
	   });


		return {
			DomainModel:DomainModel,
			domainElementsByID: domainElementsByID
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

	function createUseCasesbyCFG(controlFlowGraph, ModelOutputDir, ModelAccessDir){

		var UseCases = [];

		var useCaseID = uuidv4(); 
		var UseCase = {
				_id : useCaseID,
				Name : "source_code_transaction_collection",
				Activities : controlFlowGraph.nodes,
				PrecedenceRelations : controlFlowGraph.edges,
				OutputDir : ModelOutputDir + "/"
						+ useCaseID,
				AccessDir : ModelAccessDir + "/"
						+ useCaseID,
				}

		UseCases.push(UseCase);

		return UseCases;

	}



	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel,
	}
}());
