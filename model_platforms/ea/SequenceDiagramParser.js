/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
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
	
	
function processCombinedFragment(XMICombinedFragment, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators){
		
//		var XMIUseCase = UseCase.Attachment;
//		var XMICombinedFragment = CombinedFragment.Attachment;
	
		var activities = [];
		var precedenceRelations = [];
		var startActivity = null;
		var endActivity = null;
		
		console.log("process combined fragment");
		console.log(XMICombinedFragment['$']['xmi:id']);
		
		var XMIFragmentOperator = XMICombinedFragment.$.interactionOperator;
		
		var cfStart = {
				Type: "fragment_start",
				Name: XMIFragmentOperator+"_start",
				_id: XMICombinedFragment['$']['xmi:id']+"_start",
//				Attachment: XMICombinedFragment,
				Group: "System",
				Stimulus: false,
				OutScope: false
		};

		var cfEnd = {
				Type: "fragment_end",
				Name: XMIFragmentOperator+"_end",
				_id: XMICombinedFragment['$']['xmi:id']+"_end",
//				Attachment: XMICombinedFragment,
				Group: "System",
				Stimulus: false,
				OutScope: false
		};
		

		var containingOperators = [XMIFragmentOperator];
		containingOperators = containingOperators.concat(containingOperators);
		
		var XMIOperands = jp.query(XMICombinedFragment, '$.operand[?(@[\'$\'][\'xmi:type\']==\'uml:InteractionOperand\')]');
		
		for(var i in XMIOperands){
			var XMIOperand = XMIOperands[i];
			var XMIMessages = [];
//			console.log("occurence")
			var XMIOccurrences = jp.query(XMIOperand, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
			var SDCFG = constructSDCFG(XMIOperand,XMILifelinesByID, XMIMessagesByOccurrences, containingOperators);
			
			console.log("process fragments");
			console.log(SDCFG);
			
			//deal with the corner cases, if there are some empty fragements.
			if(SDCFG.Activities.length > 0){
			activities = activities.concat(SDCFG.Activities);
			precedenceRelations.push({start: cfStart, end: SDCFG.startActivity});
			precedenceRelations = precedenceRelations.concat(SDCFG.PrecedenceRelations);
			precedenceRelations.push({start: SDCFG.endActivity, end: cfEnd});
			}
		}
		
		//deal with the corner cases, if there are some empty fragements.
		if(activities.length > 0){
		activities.push(cfStart);
		activities.push(cfEnd);
		
		if(XMIFragmentOperator === "alt"
			|| XMIFragmentOperator === "par" 
			|| XMIFragmentOperator === "critical"
			|| XMIFragmentOperator === "neg"
			|| XMIFragmentOperator === "assert"
			|| XMIFragmentOperator === "strict"
			|| XMIFragmentOperator === "seq"
			|| XMIFragmentOperator === "ignore"
			|| XMIFragmentOperator === "consider"){
			
			startActivity = cfStart;
			endActivity = cfEnd;
//			console.log(XMICombinedFragments);
		}
		else if(XMIFragmentOperator === "loop"){
			UseCase.PrecedenceRelations.push({start: endActivity, end: startActivity});
			startActivity = cfStart;
			endActivity = cfStart;
		}
		else if(XMIFragmentOperator === "break"){
			startActivity = cfStart;
			// represent that outside edges will both be connected to the start activities.
			endActivity = cfStart;
		}
		else if(XMIFragmentOperator === "opt"){
			UseCase.PrecedenceRelations.push({start: startActivity, end: endActivity});
			startActivity = cfStart;
			endActivity = cfEnd;
		}
		}
		
		return {Activities: activities, PrecedenceRelations: precedenceRelations, startActivity: startActivity, endActivity: endActivity};
	}
	
	function constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators, DomainElementsBySN){
		
		var activities = [];
		var precedenceRelations = [];
		var startActivity = null;
		var endActivity = null;

		console.log("occurence at interaction level");
//		console.log("occurrence");
//		var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\')]');
		var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
		console.log(XMIOccurrences);
//		var XMIOccurrencesByID = [];
		// for each fragment,identify the covered lifeline
		
		var preActivity = null;
		
		for(var i= 0; i<XMIOccurrences.length;){
			var XMIOccurrence = XMIOccurrences[i++];
			
			if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
				var XMIOccurrence1 = XMIOccurrence;
				console.log(XMIOccurrence1);
//				var XMILifeline1 = XMILifelinesByID[XMIOccurrence1.$.covered];
				var XMILifelineID1 = XMIOccurrence1.$.covered;
//				XMILifeline1 = XMILifeline;
				
//				XMIOccurrencesByID[XMIOccurrence1['$']['xmi:id']] = XMIOccurrence1;
				
//				var isStimulus = false;
				var group = "System";
//				if(XMILifeline1.isUser){
////					isStimulus = true;
//					group = "User";
//				}
				
				var XMIOccurrence2 = XMIOccurrences[i++];
//				var XMILifeline2 = XMILifelinesByID[XMIOccurrence2.$.covered];
				var XMILifelineID2 = XMIOccurrence2.$.covered;
//				XMILifeline2 = XMILifeline;
				
				if(XMILifelinesByID[XMILifelineID2].isUser){
					group = XMILifelinesByID[XMILifelineID2]['$']['name'];
				}
				
				var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
//				XMIMessages.push(XMIMessage);
				
				if(XMIMessage['$']['messageSort'] !== "synchCall"){
					continue;
				}
				
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
				
//				
//				var DomainElement = DomainElementsBySN[standardizeName(XMILifelinesByID[XMILifelineID2]['$']['name'])];
//				if(DomainElement){
//				XMILifeline.Class = XMIClass['$']['xmi:id'];
//				}
				
				var nextActivity = {
						Type: "message",
						Name: XMIMessage['$']['name'],
						_id: XMIMessage['$']['xmi:id'],
						Stimulus: false,
						Group: group,
						OutScope: outScope,
						Component: DomainElementsBySN[standardizeName(XMILifelinesByID[XMILifelineID2]['$']['name'])]
//						Attachment: XMIMessage
				}
				
//				nextActivity.sender = XMILifeline1;
//				nextActivity.receiver = XMILifeline2;
				
				nextActivity.sender = XMILifelineID1;
				nextActivity.receiver = XMILifelineID2;

//				UseCase.Activities.push(nextActivity);
				activities.push(nextActivity);
				
				if(preActivity){
				if(XMILifelinesByID[nextActivity.sender].isUser && preActivity.receiver != nextActivity.sender){

				}
				else{
//					UseCase.PrecedenceRelations.push({start: preActivity, end: nextActivity});
					precedenceRelations.push({start: preActivity, end: nextActivity});
				}
				}
				
				preActivity = nextActivity;
				
				if(!startActivity){
					startActivity = preActivity;
				}
				
			}
			else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
				
				var innerCombinedFragment = processCombinedFragment(XMIOccurrence, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators);
				
				console.log("process combined fragment");
				console.log(innerCombinedFragment);
				
				//deal with some corner cases, if there are some empty fragments.
				
				if(innerCombinedFragment.Activities.length > 0){
				if(preActivity){
//				UseCase.PrecedenceRelations.push({start: preActivity, end: innerCombinedFragment.startActivity});
				precedenceRelations.push({start: preActivity, end: innerCombinedFragment.startActivity});
				}
				
				activities = activities.concat(innerCombinedFragment.Activities);
				precedenceRelations = precedenceRelations.concat(innerCombinedFragment.PrecedenceRelations);
				preActivity = innerCombinedFragment.endActivity;
				
				if(!startActivity){
					startActivity = innerCombinedFragment.startActivity;
				}
				}
			}
		}
		
		endActivity = preActivity;
		
		return {Activities: activities, PrecedenceRelations: precedenceRelations, startActivity: startActivity, endActivity: endActivity};
	}

	
	function parseSequenceDiagram(UseCase, XMIUseCase, DomainElementsBySN){
//		console.log(XMIUseCase);
		// search for the interactions that are used to describe the use cases
		var XMIInteractions = jp.query(XMIUseCase, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
		
//		console.log("xmi interactions");
		console.log(XMIInteractions);
		for(var i in XMIInteractions){
			var XMIInteraction = XMIInteractions[i];
//			console.log(XMIInteraction);
			var XMILifelines = jp.query(XMIInteraction, '$..lifeline[?(@[\'$\'][\'xmi:type\']==\'uml:Lifeline\')]');
			console.log("life lines");
			console.log(XMILifelines);
			var XMILifelinesByID = [];
			// for each life line, identify the associated classes
			for(var j in XMILifelines){
				var XMILifeline = XMILifelines[j];
				// use name to determine isUser. Just temporary.
				if(XMILifeline['$']['name'] === "User"){
					console.log("is a Stimulus source");
					XMILifeline.isUser = true;
				}
				
				// use represents to determine is a lifeline is a user.
//				var lifelineRepresentType = jp.query(XMIInteraction, '$.packagedElement[?(@[\'$\'][\'xmi:id\']==\''++'\')]');
				console.log(XMILifeline);
				XMILifelinesByID[XMILifeline['$']['xmi:id']] = XMILifeline;
//				var XMIClass = XMIClassesByStandardizedName[standardizeName(XMILifeline.$.name)];
			}
			console.log(XMILifelinesByID);
//			XMIUseCase.XMILifelinesByID = XMILifelinesByID;
			
			console.log("message")
			var XMIMessages = jp.query(XMIInteraction, '$..message[?(@[\'$\'][\'xmi:type\']==\'uml:Message\')]');
//			// for each message, identify the send fragment and receive fragment.
			var XMIMessagesByOccurrences = [];
			for(var j in XMIMessages){
				var XMIMessage = XMIMessages[j];
				XMIMessagesByOccurrences[XMIMessage.$.sendEvent+">"+XMIMessage.$.receiveEvent] = XMIMessage;
			}
			console.log(XMIMessagesByOccurrences);
//			XMIUseCase.XMIMessagesByOccurrences = XMIMessagesByOccurrences;
			
			SDCFG = constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences, []);
			UseCase.Activities = UseCase.Activities.concat(SDCFG.Activities);
			UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(SDCFG.PrecedenceRelations);
		}
		
		var ActivitiesToEliminate = [];
		//to  eliminate unnecessary activities
		for(var i in UseCase.Activities){
			var activity = UseCase.Activities[i];

			console.log("determine fragement node");
			console.log(UseCase.Activities);
			console.log(activity.Name);
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
			for(var k in UseCase.PrecedenceRelations){
				var precedenceRelation = UseCase.PrecedenceRelations[k];
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
			
			UseCase.Activities.splice(UseCase.Activities.indexOf(activityToEliminate), 1);
			UseCase.PrecedenceRelations = leftEdges;
		}
		

		console.log("test use case");
		console.log(UseCase.PrecedenceRelations);
		
		//logic to decide Stimulus
		for(var i in UseCase.Activities){
			var activity = UseCase.Activities[i];
			console.log(activity);
			 //create a new edge by triangle rules.
//			if(edge.start.Group !== "System" && edge.end.Group === "System"){
//				console.log("Stimulus...");
//				console.log(edge.start);
//				edge.start.Stimulus = true;
//			}
			
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
				
				UseCase.Activities.push(stimulus);
				UseCase.PrecedenceRelations.push({start: stimulus, end: activity});
			}
		}
		
		console.log("finished sequence diagram processing");
		
	}
	
	module.exports = {
			parseSequenceDiagram : parseSequenceDiagram
	}
}());