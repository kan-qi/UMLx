/**
 * This module is used to parse different elements related to Sequence Diagram in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function standardizeName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}

	function constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators){
		
		var activities = [];
		var activitiesbyID = [];
		//var precedenceRelations = [];
		//var startActivity = null;
		//var endActivity = null;

		console.log("occurence at interaction level");
//		var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\')]');
		var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:MessageOccurrenceSpecification\')]');
		console.log(XMIOccurrences);

		// for each fragment,identify the covered lifeline
		//var preActivity = null;
		
		for(var i= 0; i<XMIOccurrences.length;){
			var XMIOccurrence = XMIOccurrences[i++];
			
			if(XMIOccurrence['$']['xmi:type'] === "uml:MessageOccurrenceSpecification"){
				var XMIOccurrence1 = XMIOccurrence;
				console.log(XMIOccurrence1);

				var XMILifelineID1 = XMIOccurrence1.$.covered;
				
				var group = "System";
				
				var XMIOccurrence2 = XMIOccurrences[i++];
				var XMILifelineID2 = XMIOccurrence2.$.covered;
				
				/*if(XMILifelinesByID[XMILifelineID2].isUser){
					group = XMILifeline['$']['name'];
				}*/
				
				var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
				
				/*if(XMIMessage['$']['messageSort'] !== "synchCall"){
					continue;
				}*/
				
				var outScope = false;

				// The rules to determine if the operation is in scope or out of the scope of the system.
				for(var j in containingOperators){
					var operator = containingOperators[j];
					console.log("check operator");
					console.log(operator);
					if(operator === "ignore" || operator === "neg"){
						outScope = true;
						break;
					}
				}
				
				var nextActivity = {
						Type: "message",
						_id: XMIMessage['$']['xmi:id'],
						Stimulus: false,
						Group: group,
						OutScope: outScope
				}
				
				nextActivity.sender = XMILifelineID1;
				nextActivity.receiver = XMILifelineID2;

				activities.push(nextActivity);
				activitiesbyID[nextActivity['_id']] = nextActivity;
			}
		}
		
		//endActivity = preActivity;
		
		return {Activities: activities, ActivitiesbyID: activitiesbyID};//, PrecedenceRelations: precedenceRelations, startActivity: startActivity, endActivity: endActivity};
	}

	function constructCollaboration(Collaboration, XMICollaboration, XMIClassesByStandardizedName){
		var XMIInteractions = jp.query(XMICollaboration, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
	
		console.log(XMIInteractions);

		for(var i in XMIInteractions){
			var XMIInteraction = XMIInteractions[i];
			var XMILifelines = jp.query(XMIInteraction, '$..lifeline[?(@[\'$\'][\'xmi:type\']==\'uml:Lifeline\')]');
			console.log("life lines");
			console.log(XMILifelines);
			var XMILifelinesByID = [];

			// for each life line, identify the associated classes
			for(var j in XMILifelines){
				var XMILifeline = XMILifelines[j];
				// use name to determine isUser. Just temporary.
				if(XMILifeline['$']['name'] === "Actor"){
					console.log("is a Stimulus source");
					XMILifeline.isUser = true;
				}
				
				// use represents to determine is a lifeline is a user.
				console.log(XMILifeline);
				XMILifelinesByID[XMILifeline['$']['xmi:id']] = XMILifeline;
				var XMIClass = XMIClassesByStandardizedName[standardizeName(XMILifeline.$.name)];
				if(XMIClass){
					XMILifeline.Class = XMIClass['$']['xmi:id'];
				}
			}
			console.log(XMILifelinesByID);
			
			console.log("message")
			var XMIMessages = jp.query(XMIInteraction, '$..message[?(@[\'$\'][\'xmi:type\']==\'uml:Message\')]');
//			// for each message, identify the send fragment and receive fragment.
			var XMIMessagesByOccurrences = [];
			var XMIMessagesIdBySeq = [];
			for(var j in XMIMessages){
				var XMIMessage = XMIMessages[j];
				XMIMessagesIdBySeq.push(XMIMessage['$']['xmi:id']);
				XMIMessagesByOccurrences[XMIMessage.$.sendEvent+">"+XMIMessage.$.receiveEvent] = XMIMessage;
			}
			console.log(XMIMessagesByOccurrences);
			
			SDCFG = constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences, []);
			Collaboration.Activities = Collaboration.Activities.concat(SDCFG.Activities);
			
			var ActivitiesbyID = SDCFG.ActivitiesbyID;
			var precedenceRelations = [];

			if(XMIMessagesIdBySeq.length == Object.keys(ActivitiesbyID).length){
				for(var j=0; j< XMIMessagesIdBySeq.length;){
					var startID = XMIMessagesIdBySeq[j++];
					if(j == XMIMessages.length){ break; }
					var endID = XMIMessagesIdBySeq[j];
					precedenceRelations.push({start:ActivitiesbyID[startID], end:ActivitiesbyID[endID]})
				}
			}
			Collaboration.PrecedenceRelations = Collaboration.PrecedenceRelations.concat(precedenceRelations);
		}

		var ActivitiesToEliminate = [];
		//to  eliminate unnecessary activities
		for(var i in Collaboration.Activities){
			var activity = Collaboration.Activities[i];

			///console.log("determine fragement node");
			///console.log(Collaboration.Activities);
			///console.log(activity.Name);
			if(activity.Type === "fragment_start" || activity.Type === "fragment_end"){
//					var activityToEliminate = activity;
				ActivitiesToEliminate.push(activity);
			}
		}
		
		for(var i in ActivitiesToEliminate){
			var activityToEliminate = ActivitiesToEliminate[i];
			var outEdges = [];
			var inEdges = [];
			var leftEdges = [];
			for(var k in Collaboration.PrecedenceRelations){
				var precedenceRelation = Collaboration.PrecedenceRelations[k];
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
			
			Collaboration.Activities.splice(Collaboration.Activities.indexOf(activityToEliminate), 1);
			Collaboration.PrecedenceRelations = leftEdges;
		}
		

		///console.log("test use case");
		///console.log(Collaboration.PrecedenceRelations);
		
		//logic to decide Stimulus
		for(var i in Collaboration.Activities){
			var activity = Collaboration.Activities[i];
			//////console.log(activity);
			//if activity's sendevent's lifeline is an actor, acreate an stimulus node
			if(activity.Name == "onSearch"){
				var stimulus = {
						Type: "Stimulus",
						Name: "stl#1",
						_id: "12345678",
//						Attachment: XMIActivity,
						Stimulus: true,
						OutScope: false,
						Group: "User"
				}
				
				Collaboration.Activities.push(stimulus);
				Collaboration.PrecedenceRelations.push({start: stimulus, end: activity});
			}
		}
		
		//////console.log("finished sequence diagram processing");
		
	}


	function parseSequenceDiagram(filePath, callbackfunc){
		fs.readFile(filePath, function(err, data) {
			parser.parseString(data, function(err, xmiString) {
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("XMIString", xmiString);
		
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
		var Model = {
				Collaboration: []
		};
		
		console.log(XMIUMLModel);

		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
		var XMIClassesByStandardizedName = [];
		//var DomainElementsByID = [];
		
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];

			//var domainElement = createDomainElement(XMIClass);
			XMIClassesByStandardizedName[standardizeName(XMIClass['$']['name'])] = XMIClass;
			//DomainElementsByID[domainElement._id] = domainElement;
		}
		console.log(XMIClasses);

		var XMICollaborations = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Collaboration\')]');
		console.log(XMICollaborations);
		
		for(var i in XMICollaborations){
			var XMICollaboration = XMICollaborations[i];
			
			var Collaboration = {
					//_id: XMIUseCase['$']['xmi:id'],
					//Name: XMIUseCase['$']['name'],
					PrecedenceRelations : [],
					Activities : []
			}

			constructCollaboration(Collaboration, XMICollaboration, XMIClassesByStandardizedName);

			Model.Collaboration.push(Collaboration);
		}

		if(callbackfunc){
			callbackfunc(Model);
		}

		});
		});
	}
	
	module.exports = {
			parseSequenceDiagram : parseSequenceDiagram
	}
}());