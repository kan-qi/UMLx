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
						Type: "activity",
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
		

		UseCase.Activities = UseCase.Activities.concat(Activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(PrecedenceRelations);
		
		//to eliminate the activities that are not included in the user-system interaction model, for example, decision node.

		//create dotty graph of activity diagram
		var activitiesID = []; //array of IDs
		var activityEdges = {}; //maps activity ID to number of outgoing edges
		var graphOutput = "digraph ActivityDiagram { rankdir=TD\n";

		for(var node in Activities) {
			activitiesID.push(Activities[node]._id);
		}

		for(var edge in PrecedenceRelations) {
			if(activitiesID.indexOf(PrecedenceRelations[edge].start._id) != -1 && activitiesID.indexOf(PrecedenceRelations[edge].end._id) != -1) {
				graphOutput += (PrecedenceRelations[edge].start._id + " -> " + PrecedenceRelations[edge].end._id) + ";\n";
			}
			if(PrecedenceRelations[edge].start._id in activityEdges) {
				activityEdges[PrecedenceRelations[edge].start._id] += 1;
			}
			else {
				activityEdges[PrecedenceRelations[edge].start._id] = 1;
			}
		}

		for(var node in Activities) {
			//starting node
			if(Activities[node].Name == "ActivityInitial") {
				graphOutput += (Activities[node]._id + "[shape=circle, style=filled, label=\"\"];\n");
				continue;
			}
			//ending node
			else if(Activities[node].Name == "ActivityFinal") {
				graphOutput += (Activities[node]._id + "[shape=doublecircle, style=filled, label=\"\"];\n");
				continue;
			}
			if(activityEdges[Activities[node]._id] >= 2) {
				graphOutput += (Activities[node]._id + "[shape=diamond, label=\"" + Activities[node].Name + "\"];\n");
			}
			else {
				graphOutput += (Activities[node]._id + "[shape=box, style=rounded, label=\"" + Activities[node].Name + "\"];\n");
			}
		}

		graphOutput += "}";

		var fs = require('fs');
		fs.writeFile("ActivityDiagram.dotty", graphOutput, function(err) {
			if(err) {
				console.log(err);
				return;
			}
		});

	}


	module.exports = {
			parseActivityDiagram : parseActivityDiagram
	}
}());