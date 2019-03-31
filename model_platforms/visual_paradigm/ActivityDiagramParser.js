/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function parseActivityDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, XMIUMLModel){
		
		if(!XMIUseCase['$']['diagramType'] || XMIUseCase['$']['diagramType'] !== 'ActivityDiagram'){
			return;
		}
		
		var XMIActivities = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
		
		var XMINodesByID = [];
		var XMIEdgesByID = [];
		var XMIGroupsByID = [];

		for ( var i in XMIActivities) {
			
			XMIActivity = XMIActivities[i];
		
			var XMINodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\'])]');
			for(var j in XMINodes){
				var XMINode = XMINodes[j];
				XMINodesByID[XMINode['$']['xmi:id']] = XMINode;
			}
			
			var XMIEdges = jp.query(XMIActivity, '$..edge[?(@[\'$\'][\'xmi:type\'])]');
			for(var j in XMIEdges){
				var XMIEdge = XMIEdges[j];
				XMIEdgesByID[XMIEdge['$']['xmi:id']] = XMIEdge;
			}
			
			var XMIGroups = jp.query(XMIActivity, '$..group[?(@[\'$\'][\'xmi:type\'])]');
			for(var j in XMIGroups){
				var XMIGroup = XMIGroups[j];
				XMIGroupsByID[XMIGroup['$']['xmi:id']] = XMIGroup;
			}
		}
		
		var XMINodesReferenced = [];
		var XMIEdgesReferenced = [];
		var XMIGroupsReferenced = [];

		XMIActivityDiagram = XMIUseCase;
		
		var XMIActivityDiagramElements = jp.query(XMIActivityDiagram, '$..[\'uml:DiagramElement\'][?(@[\'$\'][\'subject\'])]');
		for ( var j in XMIActivityDiagramElements) {
			var XMIActivityDiagramElement = XMIActivityDiagramElements[j];
			if(XMINodesByID[XMIActivityDiagramElement['$']['subject']]){
				XMINodesReferenced.push(XMINodesByID[XMIActivityDiagramElement['$']['subject']]);
			}
			
			if(XMIEdgesByID[XMIActivityDiagramElement['$']['subject']]){
				XMIEdgesReferenced.push(XMIEdgesByID[XMIActivityDiagramElement['$']['subject']]);
			}
			
			if(XMIGroupsByID[XMIActivityDiagramElement['$']['subject']]){
				XMIGroupsReferenced.push(XMIGroupsByID[XMIActivityDiagramElement['$']['subject']]);
			}
		}

		var Activities = [];
		var PrecedenceRelations = [];
		
		var ActivitiesByID = [];
		
		for(var j in XMINodesReferenced){
			var XMIActivity = XMINodesReferenced[j];
				var activity = {
						Type: XMIActivity['$']['xmi:type'],
						Name: XMIActivity['$']['name'],
						_id: XMIActivity['$']['xmi:id'],
						Stimulus: false,
						OutScope: false,
				};
				
				Activities.push(activity);
				ActivitiesByID[XMIActivity['$']['xmi:id']] = activity;
		}

//		console.log(XMIEdges);
		for(var j in XMIEdgesReferenced){
			var XMIEdge = XMIEdgesReferenced[j];
			var sourceActivity = ActivitiesByID[XMIEdge['$']['source']];
			var targetActivity = ActivitiesByID[XMIEdge['$']['target']];
			if(sourceActivity && targetActivity){
			PrecedenceRelations.push({start: sourceActivity, end: targetActivity});
			}
		}

		for(var j in XMIGroupsReferenced){
			var XMIGroup = XMIGroupsReferenced[j];

			var nodeIDs = XMIGroup['$']['node'].split(' ');
			
			for(var k in nodeIDs){

				var activity = ActivitiesByID[nodeIDs[k]];
				
				if(activity){
				activity.Group = XMIGroup['$']['name'];
				}
			}
		}
		
		for(var j in PrecedenceRelations){
			var edge = PrecedenceRelations[j];
			 //create a new edge by triangle rules.
			if(edge.start.Group !== "System" && edge.end.Group === "System"){
				edge.start.Stimulus = true;
			}
		}

		var ActivitiesToEliminate = [];
		//to  eliminate unnecessary activities
		for(var i in Activities){
			var activity = Activities[i];
			
			if(activity.Type === "uml:DecisionNode" || activity.Type === "uml:ActivityFinalNode" || activity.Type === "uml:InitialNode" || activity.Type === "uml:FlowFinalNode"){
				ActivitiesToEliminate.push(activity);
			}
		}
		
		for(var i in ActivitiesToEliminate){
			var activityToEliminate = ActivitiesToEliminate[i];
			var outEdges = [];
			var inEdges = [];
			var leftEdges = [];
			for(var k in PrecedenceRelations){
				var precedenceRelation = PrecedenceRelations[k];
				if(precedenceRelation.end == activityToEliminate){
					inEdges.push(precedenceRelation);
				} else if(precedenceRelation.start == activityToEliminate){
					outEdges.push(precedenceRelation);
				} else {
					leftEdges.push(precedenceRelation);
				}
			}
			
			for(var k in inEdges){
				var  inEdge = inEdges[k];
				for(var l in outEdges){
					var outEdge = outEdges[l];
					 //create a new edge by triangle rules.
					leftEdges.push({start: inEdge.start, end: outEdge.end});
				}
			}
			
			Activities.splice(Activities.indexOf(activityToEliminate), 1);
			PrecedenceRelations = leftEdges;
		}

		UseCase.Activities = UseCase.Activities.concat(Activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(PrecedenceRelations);

		if(Activities.length >0){
		createActivityDiagram(UseCase, UseCase.OutputDir+"/"+"activity_diagram.dotty", function(){
			 console.log("class diagram is output: "+ UseCase.OutputDir+"/"+"activity_diagram.svg");
		});
		}
		
	}

	function createActivityDiagram(UseCase, filePath, callbackfunc) {
		//create dotty graph of activity diagram
		UseCase.DiagramType = "activity_diagram";
		var Activities = UseCase.Activities;
		var PrecedenceRelations = UseCase.PrecedenceRelations;
		var activitiesID = []; //array of IDs
		var activityEdges = {}; //maps activity ID to list of outgoing edges
		var nodesWithEdges = []; //array of nodes with edges
		var forkNodes = []; //nodes that are forked from and should be on the same level
		var numDecision = 0; //number of decision nodes created
		var decNodes = {}; //maps activity ID to decision name
		var doneDecNodes = []; //decision nodes that are done being drawn
		var doneForkNodes = []; //fork nodes that are done being drawn
		var graphOutput = "digraph ActivityDiagram { rankdir=TD;\nsplines=ortho;\nnode [fontsize=11];\nedge [arrowhead=open];\n";

		//get all nodes
		for(var node in Activities) {
			activitiesID.push(Activities[node]._id);
		}

		//get all directed edges
		for(var edge in PrecedenceRelations) {
			activityEdges[PrecedenceRelations[edge].start._id] = activityEdges[PrecedenceRelations[edge].start._id] || [];
			activityEdges[PrecedenceRelations[edge].start._id].push(PrecedenceRelations[edge].end._id);
			if(nodesWithEdges.indexOf(PrecedenceRelations[edge].start._id) == -1) {
				nodesWithEdges.push(PrecedenceRelations[edge].start._id);
			}
			if(nodesWithEdges.indexOf(PrecedenceRelations[edge].end._id) == -1) {
				nodesWithEdges.push(PrecedenceRelations[edge].end._id);
			}
		}

		for(var node in Activities) {
			//starting node
			if(Activities[node].Type == "uml:InitialNode") {
				graphOutput += (Activities[node]._id + "[id=" + Activities[node]._id + ", shape=circle, color=black, style=filled, label=\"\"];\n");
				continue;
			}
			//ending node
			else if(Activities[node].Type == "uml:ActivityFinalNode") {
				graphOutput += (Activities[node]._id + "[id=" + Activities[node]._id + ", shape=doublecircle, color=black, style=filled, label=\"\"];\n");
				continue;
			}
			//fork node
			else if(Activities[node].Type == "uml:ForkNode") {
				graphOutput += (Activities[node]._id + "[id=" + Activities[node]._id + ", shape=rect, width=1, height=0.2, color=black, style=filled, fixedsize=true, label=\"\"];\n");
				forkNodes.push(Activities[node]._id);
			}
			//node with no edges
			else if(!(Activities[node]._id in activityEdges)) {
				if(nodesWithEdges.indexOf(Activities[node]._id) != -1) {
					graphOutput += (Activities[node]._id + "[id=" + Activities[node]._id + ", shape=box, style=rounded, width=3, height=1, label=\"" + (Activities[node].Name || Activities[node]._id).replace(/\"/g,'\\"') + "\"];\n");
				}
				continue;
			}
			//decision node
			else if(activityEdges[Activities[node]._id].length >= 2) {
				var decisionName = "decision" + numDecision;
				graphOutput += (Activities[node]._id + "[id=" + Activities[node]._id + ", shape=box, style=rounded, width=3, height=1, fixedsize=true, label=\"" + Activities[node].Name.replace(/\"/g,'\\"') + "\"];\n");
 				graphOutput += decisionName + "[id=" + Activities[node]._id + ", shape=diamond, width=0.5, height=0.5, fixedsize=true, label=\"\"];\n";
				decNodes[Activities[node]._id] = decisionName;
				numDecision++;
			}
			//action node
			else {
				graphOutput += (Activities[node]._id + "[id=" + Activities[node]._id + ", shape=box, style=rounded, width=3, height=1, label=\"" + Activities[node].Name + "\"];\n");
			}
		}

		for(var edge in PrecedenceRelations) {
			//create a decision edge
			if(activitiesID.indexOf(PrecedenceRelations[edge].start._id) != -1 && activitiesID.indexOf(PrecedenceRelations[edge].end._id) != -1) {
				if(PrecedenceRelations[edge].start._id in decNodes) {
					if(doneDecNodes.indexOf(PrecedenceRelations[edge].start._id) == -1) {
						graphOutput += PrecedenceRelations[edge].start._id + " -> " + decNodes[PrecedenceRelations[edge].start._id] + ";\n";
						doneDecNodes.push(PrecedenceRelations[edge].start._id);
					}
					graphOutput += decNodes[PrecedenceRelations[edge].start._id] + " -> " + PrecedenceRelations[edge].end._id + ";\n";
				}
				else {
					graphOutput += (PrecedenceRelations[edge].start._id + " -> " + PrecedenceRelations[edge].end._id) + ";\n";
				}

				//create a fork edge
				if(forkNodes.indexOf(PrecedenceRelations[edge].start._id) != -1) {
					if(doneForkNodes.indexOf(PrecedenceRelations[edge].start._id) == -1) {
						doneForkNodes.push(PrecedenceRelations[edge].start._id);
						graphOutput += "{rank = same; ";
						for(var i in activityEdges[PrecedenceRelations[edge].start._id]) {
							graphOutput += activityEdges[PrecedenceRelations[edge].start._id][i] + "; "
						}
						graphOutput += "}\n";
					}
				}
			}
		}

		graphOutput += "}";

		dottyUtil = require("../../utils/DottyUtil.js");
		dottyUtil.drawDottyGraph(graphOutput, filePath, function(){
			console.log("ACTIVITY DIAGRAM SAVED!");
		});

	}


	module.exports = {
			parseActivityDiagram : parseActivityDiagram
	}
}());