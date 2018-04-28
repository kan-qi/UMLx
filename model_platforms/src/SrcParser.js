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
	var callGraphConstructor = require("./CallGraphConstructor.js");

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	var xmiSring = "";
	
	function extractUserSystermInteractionModel(xmiString, ModelOutputDir, ModelAccessDir, callbackfunc) {
//		fs.readFile(filePath, "utf8", function(err, data) {
//			console.log("file content");
//			console.log(data);
//			parser.parseString(data, function(err, result) {
				
				var Model = {
						Actors:[],
						Roles:[],
						UseCases: [],
						OutputDir: ModelOutputDir,
						AccessDir: ModelAccessDir,
						DomainModel: {
							Elements: [],
							Usages: [],
							Realization:[],
							Assoc: [],
							OutputDir : ModelOutputDir+"/domainModel",
							AccessDir : ModelAccessDir+"/domainModel",
							DiagramType : "class_diagram",
		                    InheritanceStats: null
						}
				};
				
//				xmiString = result;
				callGraph = callGraphConstructor.constructCallGraph(xmiString, Model.OutputDir);
				console.log("callGraphs");
				console.log(callGraph);
				
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
				
				var UseCase = {
						_id: "src",
						Name: "src",
						PrecedenceRelations : [],
						Activities : [],
						OutputDir : ModelOutputDir+"/src",
						AccessDir : ModelAccessDir+"/src",
						DiagramType : "none"
//						Attachment: XMIUseCase
				}
				
				
//				var path = useCase.OutputDir+"/"+"kdm_diagram.dotty"
//				useCase.DiagramType = "kdm_diagram";
//				drawReferences(edges, nodes, path);
//				
			var ActivitiesByName = {};
			var PrecedenceRelationsByName = {};
//			var StimulusByName = {};
			
			
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
//							Attachment: XMIActivity,
							Stimulus: true,
							OutScope: false,
							Group:  "User"
					}
					
					UseCase.Activities.push(stimulus);
					ActivitiesByName["stl#"+activity.Name] = stimulus;
					UseCase.PrecedenceRelations.push({start: stimulus, end: activity});
				}
			}
			
			var debug = require("../../utils/DebuggerOutput.js");
			debug.writeJson("constructed_kdm_grph", callGraph);
			debug.writeJson("constructed_use_case_kdm", UseCase);
			
//			drawUISIMDiagram(UseCase, callGraph.edges, callGraph.nodes);
				
			
				Model.UseCases.push(UseCase);
				
//				return Model;
				
//				
				if(callbackfunc){
					callbackfunc(Model);
				}
				
//			});
//		});
	}
	
//	function drawRobustnessDiagram(useCase, edges, nodes){
//		var path = useCase.OutputDir+"/"+"kdm_diagram.dotty"
//		useCase.DiagramType = "kdm_diagram";
//		drawReferences(edges, nodes, path);
//		
//	}
	
	
	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel,
	}
}());
