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
<<<<<<< HEAD
	const uuidv4 = require('uuid/v4');
=======

>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9

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
<<<<<<< HEAD
						DomainModel: {},
=======
						DomainModel: [],
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9
						OutputDir: ModelOutputDir,
						AccessDir: ModelAccessDir
				};

<<<<<<< HEAD
=======

>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9
				var debug = require("../../utils/DebuggerOutput.js");

//				xmiString = result;
				var result = codeAnalysis.analyseCode(xmiString, Model.OutputDir);
				debug.writeJson("constructed_model_by_kdm_result_7_5", result);
<<<<<<< HEAD
				
				console.log("testing result");
				console.log(result);

				var components = componentIdentifier.identifyComponents(result.callGraph, result.accessGraph, result.typeDependencyGraph, result.classUnits);
				debug.writeJson("constructed_model_by_kdm_components_7_5", components);

				Model.DomainModel = createDomainModel(components, ModelOutputDir, ModelAccessDir).DomainModel;

				var controlFlowGraph = controlFlowGraphConstructor.establishControlFlow(components, xmiString, ModelOutputDir);
				
				debug.writeJson("constructed_model_by_kdm_control_flow_graph_7_5", controlFlowGraph);

				stimulusIdentifier.identifyStimuli(controlFlowGraph);
				
				Model.UseCases = createUseCasesbyCFG(controlFlowGraph, ModelOutputDir, ModelAccessDir);
=======

//				return {
//					callGraph: callGraph,
//					typeDependenceGraph: typeDependenceTraph,
//					accessGraph: accessGraph,
////					controlFlowGraph: controlFlowGraph,
//					topClassUnits: classUnits
//				};

				var components = componentIdentifier.identifyComponents(result.callGraph, result.accessGraph, result.typeDependenceGraph, result.classUnits);
				debug.writeJson("constructed_model_by_kdm_components_7_5", components);

//				Model.DomainModel = createDomainModel(components, ModelOutput, ModelAccessDir).DomainModel;

//				var controlFlowGraph = controlFlowGraphConstructor.establishControlFlow(components, ModelOutputDir);

//				stimulusIdentifier.identifyStimuli(controlFlowGraph);

//				var UseCase = {
//						_id : XMIActivityDiagram['$']['xmi:id'],
//						Name : XMIActivityDiagram['$']['name'],
//						Activities : Activities,
//						PrecedenceRelations : PrecedenceRelations,
//						OutputDir : Model.OutputDir + "/"
//								+ XMIActivityDiagram['$']['xmi:id'],
//						AccessDir : Model.AccessDir + "/"
//								+ XMIActivityDiagram['$']['xmi:id'],
//						}
//
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9
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
<<<<<<< HEAD
				
				debug.writeJson("constructed_model_by_kdm_model_7_5", Model);
=======
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9

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

<<<<<<< HEAD
	function createDomainModel(Components, ModelOutputDir, ModelAccessDir){
=======
	function createDomainModel(classUnits, ModelOutputDir, ModelAccessDir){
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9

		var DomainModel = {
			Elements: [],
			Usages: [],
			Realization:[],
			Assoc: [],
			OutputDir : ModelOutputDir+"/domainModel",
			AccessDir : ModelAccessDir+"/domainModel",
			DiagramType : "class_diagram",
		}

<<<<<<< HEAD
		function createDomainElement(component){
			var attributes = new Array();
			var operations = new Array();

			for(var i in component.classUnits){
			var classUnit = component.classUnits[i];
			
			for(var j in classUnit.StorableUnits){
				var storableUnit = classUnit.StorableUnits[j];
=======
		function createDomainElement(classUnit){
			var attributes = new Array();

			for(var i in classUnit.StorableUnits){
				var storableUnit = classUnit.StorableUnits[i];
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9

				var attribute = {
						Name: storableUnit.name,
						Type: storableUnit.kind,
						_id: storableUnit.UUID.replace(/\-/g, "")
				}
				attributes.push(attribute);
			}


<<<<<<< HEAD
			for(var j in classUnit.MethodUnits){
				var methodUnit = classUnit.MethodUnits[j];
=======
			for(var i in classUnit.MethodUnits){
				var methodUnit = classUnit.MethodUnits[i];
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9

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
<<<<<<< HEAD
			}
=======
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9

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
<<<<<<< HEAD
		
		// the current methods of creating domain elements are abrupt, which is by consolidating all the sub class units
		
		for(var i in Components){
			var component = Components[i];
			console.log('exam component');
			console.log(component);
			var domainElement = createDomainElement(component);
=======

		for(var i in classUnits){
			var classUnit = classUnits[i];
			console.log('exam class');
			console.log(classUnit);
			var domainElement = createDomainElement(classUnit);
>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9
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

<<<<<<< HEAD
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

=======
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
//				Attachment: XMIUseCase
		}


		var nodes = cfgGraph.nodes;
		var edges = cfgGraph.edges;

		var activities = [];
		var activitiesByID = {}

		for(var i in nodes){
			var node = nodes[i];
			var classUnit = node.classUnit;

			var domainElement = null;
			if(classUnit){
				domainElement = domainElementsByID[classUnit.UUID.replace(/\-/g, "")];
			}

			var activity = {
					Name: node['name'],
					_id: node['UUID'].replace(/\-/g, ""),
					Type: "activity",
					isResponse: node.isResponse,
					Stimulus: false,
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
			console.log("print edge");
			console.log(edge);
			var startNode = edge.start;
			var endNode = edge.end;

			precedenceRelations.push(
					{
						start: activitiesByID[startNode.UUID.replace(/\-/g, "")],
						end: activitiesByID[endNode.UUID.replace(/\-/g, "")]
					}
			);
		}

		UseCase.Activities = UseCase.Activities.concat(activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);

>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9
		UseCases.push(UseCase);

		return UseCases;

	}
<<<<<<< HEAD


=======


	function createUseCasesByCallGraph(callGraph){

		var UseCase = {
				_id: "src",
				Name: "src",
				PrecedenceRelations : [],
				Activities : [],
				OutputDir : ModelOutputDir+"/src",
				AccessDir : ModelAccessDir+"/src",
				DiagramType : "none"
//				Attachment: XMIUseCase
		}


		function findNextActivities(currentActivity, activities){
			var nextActivities = [];
			for(var i in activities){
				var activity = activities[i];
				if(currentActivity.end == activity.start){
					nextActivities.push(activity);
				}
			}
			return nextActivities;
		}

	var debug = require("../../utils/DebuggerOutput.js");
	debug.writeJson("constructed_kdm_grph", callGraph);
	debug.writeJson("constructed_use_case_kdm", UseCase);

//	drawUISIMDiagram(UseCase, callGraph.edges, callGraph.nodes);

//		var path = useCase.OutputDir+"/"+"kdm_diagram.dotty"
//		useCase.DiagramType = "kdm_diagram";
//		drawReferences(edges, nodes, path);
//
	var ActivitiesByName = {};
	var PrecedenceRelationsByName = {};
//	var StimulusByName = {};


	for(var i in callGraph.edges){
		var edge = callGraph.edges[i];
		var nextEdges = findNextActivities(edge, callGraph.edges);

		console.log("nextEdges");
		console.log(nextEdges);

		activity = ActivitiesByName[edge.start.name+":"+edge.end.name];
		if(!activity){
		var activity = {
				Name: edge.start.name+":"+edge.end.name,
				_id: edge.start.name+":"+edge.end.name,
				Type: "controlflow",
				isResponse: edge.start.isResponse,
				Stimulus: false,
				OutScope: false,
				Group: "System"
		}

		UseCase.Activities.push(activity);
		ActivitiesByName[edge.start.name+":"+edge.end.name] = activity;
		}

		for(var j in nextEdges){
			var nextEdge = nextEdges[j];

			var nextActivity = ActivitiesByName[nextEdge.start.name+":"+nextEdge.end.name];

			if(!nextActivity){
			nextActivity = {
					Name: nextEdge.start.name+":"+nextEdge.end.name,
					_id: nextEdge.start.name+":"+nextEdge.end.name,
					Type: "controlflow",
					isResponse: nextEdge.start.isResponse,
					Stimulus: false,
					OutScope: false,
					Group: "System"
			}

			UseCase.Activities.push(nextActivity);
			ActivitiesByName[nextEdge.start.name+":"+nextEdge.end.name] = nextActivity;
			}

			var precedenceRelation = PrecedenceRelationsByName[activity.Name+":"+nextActivity.Name];
			if(!precedenceRelation){
				precedenceRelation = {
						start: activity,
						end: nextActivity
					};
				UseCase.PrecedenceRelations.push(precedenceRelation);
				PrecedenceRelationsByName[activity.Name+":"+nextActivity.Name] = precedenceRelation;
			}
		}
	}

	for(var i in UseCase.Activities){
		var activity = UseCase.Activities[i];
		if(activity.isResponse && !ActivitiesByName["stl#"+activity.Name]){
			//create a stimulus nodes for the activity.
			var stimulus = {
					Type: "Stimulus",
					Name: "stl#"+activity.Name,
					_id: activity._id+"_STL",
//					Attachment: XMIActivity,
					Stimulus: true,
					OutScope: false,
					Group:  "User"
			}

			UseCase.Activities.push(stimulus);
			ActivitiesByName["stl#"+activity.Name] = stimulus;
			UseCase.PrecedenceRelations.push({start: stimulus, end: activity});
		}
	}
	}




//	function drawRobustnessDiagram(useCase, edges, nodes){
//		var path = useCase.OutputDir+"/"+"kdm_diagram.dotty"
//		useCase.DiagramType = "kdm_diagram";
//		drawReferences(edges, nodes, path);
//
//	}

>>>>>>> 7356a5df6fa1a169dc83a800f9bd1a0d937a95e9

	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel,
	}
}());
