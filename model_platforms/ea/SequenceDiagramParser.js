/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	var domainModelSearchUtil = require("../../utils/DomainModelSearchUtil.js");
	
function processCombinedFragment(XMICombinedFragment, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators, DomainElementsBySN, CustomProfiles){
		
	
		var activities = [];
		var precedenceRelations = [];
		var startActivity = null;
		var endActivity = null;
		
		// console.log("process combined fragment");
		// console.log(XMICombinedFragment['$']['xmi:id']);
		
		var XMIFragmentOperator = XMICombinedFragment.$.interactionOperator;
		
		var cfStart = {
				Type: "fragment_start",
				Name: XMIFragmentOperator+"_start",
				_id: XMICombinedFragment['$']['xmi:id']+"_start",
				Group: "System",
				OutScope: false
		};

		var cfEnd = {
				Type: "fragment_end",
				Name: XMIFragmentOperator+"_end",
				_id: XMICombinedFragment['$']['xmi:id']+"_end",
				Group: "System",
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
			var SDCFG = constructSDCFG(XMIOperand,XMILifelinesByID, XMIMessagesByOccurrences, containingOperators, DomainElementsBySN, CustomProfiles);
			
//			console.log("process fragments");
//			console.log(SDCFG);
			
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
			precedenceRelations.push({start: endActivity, end: startActivity});
			startActivity = cfStart;
			endActivity = cfStart;
		}
		else if(XMIFragmentOperator === "break"){
			startActivity = cfStart;
			// represent that outside edges will both be connected to the start activities.
			endActivity = cfStart;
		}
		else if(XMIFragmentOperator === "opt"){
			precedenceRelations.push({start: startActivity, end: endActivity});
			startActivity = cfStart;
			endActivity = cfEnd;
		}
		}
		
		return {Activities: activities, PrecedenceRelations: precedenceRelations, startActivity: startActivity, endActivity: endActivity};
	}
	
	function constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators, DomainElementsBySN, CustomProfiles){
		
		var activities = [];
		var precedenceRelations = [];
		var startActivity = null;
		var endActivity = null;

		console.log("occurence at interaction level");
		var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
		
		var preActivity = null;
		
		for(var i= 0; i<XMIOccurrences.length;){
			var XMIOccurrence = XMIOccurrences[i++];
			
			if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
				var XMIOccurrence1 = XMIOccurrence;
				// console.log(XMIOccurrence1);
				var XMILifelineID1 = XMIOccurrence1.$.covered;
				var XMILifeline1 = XMILifelinesByID[XMILifelineID1];
//				XMILifeline1 = XMILifeline;
				
				//create domain model elements
				if(XMILifeline1 && !domainModelSearchUtil.matchDomainElement(XMILifeline1['$']['name'], DomainElementsBySN)){
					DomainElementsBySN[domainModelSearchUtil.standardizeName(XMILifeline1['$']['name'])] = {
						Name: XMILifeline1['$']['name'],
						_id: XMILifeline1['$']['xmi:id'],
						Operations: [],
						Attributes: []
					}
				}
				
				var XMIOccurrence2 = XMIOccurrences[i++];
				var XMILifelineID2 = XMIOccurrence2.$.covered;
				var XMILifeline2 = XMILifelinesByID[XMILifelineID2];
				
				if(XMILifeline2 && !domainModelSearchUtil.matchDomainElement(XMILifeline2['$']['name'], DomainElementsBySN)){
					DomainElementsBySN[domainModelSearchUtil.standardizeName(XMILifeline2['$']['name'])] = {
						Name: XMILifeline2['$']['name'],
						_id: XMILifeline2['$']['xmi:id'],
						Operations: [],
						Attributes: []
					}
				}
				
				// if(XMILifeline2.isActor){
				// 	group = XMILifelinesByID[XMILifelineID2]['$']['name'];
				// }
				
				var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
				
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
				
				
				var component = domainModelSearchUtil.matchDomainElement(XMILifelinesByID[XMILifelineID2]['$']['name'], DomainElementsBySN);
				
				if(!component){
					component = {
							_id: XMILifelinesByID[XMILifelineID2]['$']['xmi:id'],
							Name: XMILifelinesByID[XMILifelineID2]['$']['name'],
							Operations: [],
							Attributes: []
					}
					DomainElementsBySN[domainModelSearchUtil.standardizeName(XMILifelinesByID[XMILifelineID2]['$']['name'])] = component;
				}
				
				component.Type = CustomProfiles[XMILifelineID2];
				
				var nextActivity = {
						Type: "message",
						Name: XMIMessage['$']['name'],
						_id: XMIMessage['$']['xmi:id'],
						Group: "System",
						OutScope: outScope,
						Component: component,
				}
				
				nextActivity.sender = XMILifelineID1;
				nextActivity.receiver = XMILifelineID2;
				
				if(XMILifelinesByID[nextActivity.sender].isActor){
					nextActivity.isResponse = true;
					nextActivity.stimulusGroup = XMILifelinesByID[nextActivity.sender]['$']['name'];
				}
				
				if(XMILifelinesByID[nextActivity.receiver].isActor){
					nextActivity.Group = XMILifelinesByID[nextActivity.receiver]['$']['name'];
					nextActivity.Component.Type = "actor";
				}

				activities.push(nextActivity);
				
				if(preActivity){
				if(XMILifelinesByID[nextActivity.sender].isActor && preActivity.receiver != nextActivity.sender){

				}
				else{
					precedenceRelations.push({start: preActivity, end: nextActivity});
				}
				}
				
				preActivity = nextActivity;
				
				if(!startActivity){
					startActivity = preActivity;
				}
				
			}
			else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
				
				var innerCombinedFragment = processCombinedFragment(XMIOccurrence, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators, DomainElementsBySN, CustomProfiles);
				
				// console.log("process combined fragment");
				// console.log(innerCombinedFragment);
				
				//deal with some corner cases, if there are some empty fragments.
				
				if(innerCombinedFragment.Activities.length > 0){
				if(preActivity){
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

	var ActorsByID = {};
	var OwnedAttributesByID = {};
	
	function parseSequenceDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, ActorsByID){
//		console.log(XMIUseCase);
		// search for the interactions that are used to describe the use cases
		ActorsByID = ActorsByID;
		
		//to establish the attributes catalog
		var XMIOwnedAttributes = jp.query(XMIUseCase, '$..ownedAttribute[?(@[\'$\'][\'xmi:type\']==\'uml:Property\')]');
		for(var i in XMIOwnedAttributes){
			var XMIOwnedAttribute = XMIOwnedAttributes[i];
			var XMIOwnedAttributeType = jp.query(XMIOwnedAttribute, '$.type[?(@[\'$\'][\'xmi:idref\'])]')[0];
			var typeID = null;
			if(XMIOwnedAttributeType){
				typeID = XMIOwnedAttributeType['$']["xmi:idref"];
			}
			OwnedAttributesByID[XMIOwnedAttribute['$']["xmi:id"]] = {
					id : XMIOwnedAttribute['$']["xmi:id"],
					Type: typeID
			}
		}
		
		
		var Activities = [];
		var PrecedenceRelations = [];
		
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
//				if(XMILifeline['$']['name'] === "User"){
//					console.log("is a Stimulus source");
//					XMILifeline.isActor = true;
//				}
				
				if(OwnedAttributesByID[XMILifeline['$']['represents']].Type && ActorsByID[OwnedAttributesByID[XMILifeline['$']['represents']].Type]){
//					console.log("is a Stimulus source");
					XMILifeline.isActor = true;
				}
				
				// use represents to determine is a lifeline is a user.
//				var lifelineRepresentType = jp.query(XMIInteraction, '$.packagedElement[?(@[\'$\'][\'xmi:id\']==\''++'\')]');
				console.log(XMILifeline);
				XMILifelinesByID[XMILifeline['$']['xmi:id']] = XMILifeline;
//				var XMIClass = XMIClassesByStandardizedName[domainModelSearchUtil.standardizeName(XMILifeline.$.name)];
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
			
			SDCFG = constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences, [], DomainElementsBySN, CustomProfiles);
			Activities = Activities.concat(SDCFG.Activities);
			PrecedenceRelations = PrecedenceRelations.concat(SDCFG.PrecedenceRelations);
		}
		
		var ActivitiesToEliminate = [];
		//to  eliminate unnecessary activities
		for(var i in Activities){
			var activity = Activities[i];

			console.log("determine fragement node");
			console.log(Activities);
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
		
		//logic to decide Stimulus
		for(var i in Activities){
			var activity = Activities[i];
//			console.log(activity);
			 //create a new edge by triangle rules.
//			if(edge.start.Group !== "System" && edge.end.Group === "System"){
//				console.log("Stimulus...");
//				console.log(edge.start);
//				edge.start.Stimulus = true;
//			}
			
			//if activity's sendevent's lifeline is an actor, acreate an stimulus node

			if(activity.isResponse){
				//create a stimulus nodes for the activity.
				var stimulus = {
						Type: "Stimulus",
						Name: "stl#"+activity.Name,
						_id: activity._id+"_STL",
						Stimulus: true,
						OutScope: false,
						Group:  activity.stimulusGroup
				}
				
				Activities.push(stimulus);
				PrecedenceRelations.push({start: stimulus, end: activity});
			}
		}
		
		if(Activities.length > 0){
		drawSequenceDiagram(UseCase, UseCase.OutputDir+"/"+"sequence_diagram.dotty", function(){
			 console.log("class diagram is output: "+ UseCase.OutputDir+"/"+"sequence_diagram.svg");
		});
		}
		
		UseCase.Activities = UseCase.Activities.concat(Activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(PrecedenceRelations);
		
		
		console.log("finished sequence diagram processing");
		
	}
	
	/*
	 * 
	 * The structure of the plantUML tools
	 * 
	 * @startuml
skinparam sequenceArrowThickness 2
skinparam roundcorner 20
skinparam maxmessagesize 60
skinparam sequenceParticipant underline

actor User
participant "First Class" as A
participant "Second Class" as B
participant "Last Class" as C

User -> A: DoWork
activate A

A -> B: Create Request
activate B

B -> C: DoWork
activate C
C --> B: WorkDone
destroy C

B --> A: Request Created
deactivate B

A --> User: Done
deactivate A

@enduml
	 * 
	 * 
	 */
	
	function drawSequenceDiagram(UseCase, DomainModel, graphFilePath, callbackfunc) {
		UseCase.DiagramType = "sequence_diagram";
		
		var plantUMLString = "@startuml \
							skinparam sequenceArrowThickness 2 \
							skinparam roundcorner 20 \
							skinparam maxmessagesize 60 \
							skinparam sequenceParticipant underline"
		
		//logic to create actors
		var actorActivityDic = {};
		for(var i in UseCase.Activities){
			var activity = UseCase.Activities[i];
			if(activity.Stimulus){
				var actorActivities = actorActivityDic[activity.Group];
				if(!actorActivities){
					actorActivityDic[activity.Group] = actorActivities;
					actorActivities = actorActivityDic[activity.Group];
				}
				actorActivities.push(activity);
			}
		}
		
		for(var i in actorActivityDic){
			plantUMLString += "actor "+i;
			
		}

		var componentDic = {};
		for(var i in DomainModel.Elements){
			var element = DomainModel.Elements[i];
			var index = (i + 9).toString(36).toUpperCase();
			plantUMLString += "participant \""+element.Name+"\" as "+index;
			componentDic[elementName] = index;
		}
		
		for(var i in UseCase.PrecedenceRelations){
			var precedenceRelation = UseCase.PrecedenceRelations[i];
			var start = precedenceRelation.start;
			var end = precedenceRelation.end;
			
			if(start.Type === "Stimulus"){
				plantUMLString += start.Group;
			}
			else{
				plantUMLString += componentDic[start.Component.Name]; 
			}
			
			plantUMLString += " -> ";
			
			if(end.Type === "Stimulus"){
				plantUMLString += end.Group;
			}
			else{
				plantUMLString += componentDic[end.Component.Name]; 
			}
			
			plantUMLString += ": "
			
		}
		
		
		
		
	}
	
	module.exports = {
			parseSequenceDiagram : parseSequenceDiagram
	}
}());