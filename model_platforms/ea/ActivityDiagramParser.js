/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
//	var xml2js = require('xml2js');
//	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function parseActivityDiagram(UseCase, XMIUseCase, DomainElementsBySN){

		// we are categorizing the messages for the in-scope and out-scope messages.

		var Activities = [];
		var PrecedenceRelations = [];
		
		//search for activities that are used to describe use cases
		console.log("XMIActivities");
//		console.log(XMIUseCase);
		
		var XMIActivities = jp.query(XMIUseCase, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
		XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..node[?(@[\'$\'][\'xmi:id\'])]'));
		XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..containedNode[?(@[\'$\'][\'xmi:type\'])]'));
		XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]'));
		
		console.log(XMIActivities);
		
//		Activities = [];
		var ActivitiesByID = [];
		
		ActivitiesToEliminate = [];
//		console.log("xmi interactions");
		console.log(XMIActivities);
		for(var j in XMIActivities){
			var XMIActivity = XMIActivities[j];
//			if(XMIActivity.Name === "EA_Activity1")	{
//				//Ea specific structure.
//				console.log("continue");
//			}
//			else{
				var activity = {
						Type: XMIActivity['$']['xmi:type'],
						Name: XMIActivity['$']['name'],
						_id: XMIActivity['$']['xmi:id'],
//						Attachment: XMIActivity,
						Stimulus: false,
						OutScope: false,
				};
				
				Activities.push(activity);
				ActivitiesByID[XMIActivity['$']['xmi:id']] = activity;
				if(XMIActivity['$']['xmi:type'] === "uml:DecisionNode"){
					ActivitiesToEliminate.push(activity);
				}
//			}
		}
		
		var XMIEdges = jp.query(XMIUseCase, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]');
		XMIEdges = XMIEdges.concat(jp.query(XMIUseCase, '$..containedEdge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]'));
		
		
//		console.log("xmi interactions");
		console.log(XMIEdges);
		for(var j in XMIEdges){
			var XMIEdge = XMIEdges[j];
			var sourceActivity = ActivitiesByID[XMIEdge['$']['source']];
			var targetActivity = ActivitiesByID[XMIEdge['$']['target']];
			if(sourceActivity && targetActivity){
			PrecedenceRelations.push({start: sourceActivity, end: targetActivity});
			}
		}

		console.log("checking edges1");
		console.log(PrecedenceRelations);
		
		
		for(var j in ActivitiesToEliminate){
			var activityToEliminate = ActivitiesToEliminate[j];
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
		
//		console.log(PrecedenceRelations);
		
		
//		console.log("group...");

		var XMIGroups = jp.query(XMIUseCase, '$..group[?(@[\'$\'][\'xmi:type\']==\'uml:ActivityPartition\')]');
		for(var j in XMIGroups){
			var XMIGroup = XMIGroups[j];
			console.log("group")
			console.log(XMIGroup['$']['name'])
			console.log(XMIGroup);
			var XMIActivities = jp.query(XMIGroup, '$..node[?(@[\'$\'][\'xmi:idref\'])]');
//			XMIActivities = XMIActivities.concat(jp.query(XMIGroup, '$..containedNode[?(@[\'$\'][\'xmi:type\'])]'));
			for(var k in XMIActivities){
				var XMIActivity = XMIActivities[k];
				console.log(XMIActivity['$']['xmi:idref']);
//				console.log(ActivitiesByID);
				var activity = ActivitiesByID[XMIActivity['$']['xmi:idref']];
				
//				var activity = null;
//				if(XMIActivity['$']['xmi:idref']){
//					activity = ActivitiesByID[XMIActivity['$']['xmi:idref']];
//				}
//				else{
//					console.log("containing activity");
//					activity = ActivitiesByID[XMIActivity['$']['xmi:id']];
//					console.log(activity);
//				}
				
				if(activity){
				activity.Group = XMIGroup['$']['name'];
//				if(activity.group === "User"){
//					activity.Stimulus=true;
//				}
				console.log("grouped activities");
				console.log(activity);
				}
			}
		}
		

		console.log("checking edges");
		console.log(PrecedenceRelations);
		
		//logic to decide Stimulus
		for(var j in PrecedenceRelations){
			var edge = PrecedenceRelations[j];
			 //create a new edge by triangle rules.
			if(edge.start.Group !== "System" && edge.end.Group === "System"){
				console.log("Stimulus...");
				console.log(edge.start);
				edge.start.Stimulus = true;
			}
		}
		
		console.log("final relations");
		console.log(PrecedenceRelations);
		
		var ActivitiesToEliminate = [];
		//to  eliminate unnecessary activities
		for(var i in Activities){
			var activity = Activities[i];

			console.log("determine fragement node");
			console.log(Activities);
			console.log(activity.Name);
			if(activity.Type === "uml:DecisionNode" || activity.Type === "uml:ActivityFinalNode" || activity.Type === "uml:InitialNode" || activity.Type === "uml:FlowFinalNode"){
//					var activityToEliminate = activity;
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
		

		console.log("test use case");
		console.log(PrecedenceRelations);

		UseCase.Activities = UseCase.Activities.concat(Activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(PrecedenceRelations);

		if(Activities.length >0){
		createActivityDiagram(UseCase, UseCase.OutputDir+"/"+"activity_diagram.dotty", function(){
			 console.log("class diagram is output: "+ UseCase.OutputDir+"/"+"activity_diagram.svg");
		});
		}
		
		
		//to eliminate the activities that are not included in the user-system interaction model, for example, decision node.

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

		// var fs = require('fs');
		// fs.writeFile(filePath, graphOutput, function(err) {
		// 	if(err) {
		// 		console.log(err);
		// 		return;
		// 	}
		// 	console.log("ACTIVITY DIAGRAM SAVED!");
		// });
		
	}


	module.exports = {
			parseActivityDiagram : parseActivityDiagram
	}
}());