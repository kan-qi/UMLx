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

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	var xmiSring = "";
	
	function parseAnalysisDiagram(useCase, callGraph){
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
	
	var debug = require("../../utils/DebuggerOutput.js");
	debug.writeJson("constructed_kdm_grph", callGraph);
	debug.writeJson("constructed_use_case_kdm", UseCase);
	
	drawRobustnessDiagram(UseCase, callGraph.edges, callGraph.nodes);
}
	
	function drawRobustnessDiagram(useCase, edges, nodes){
		var path = useCase.OutputDir+"/"+"kdm_diagram.dotty"
		useCase.DiagramType = "kdm_diagram";
		drawReferences(edges, nodes, path);
		
	}
	
	module.exports = {
			parseAnalysisDiagram : parseAnalysisDiagram
	}
	
}());
