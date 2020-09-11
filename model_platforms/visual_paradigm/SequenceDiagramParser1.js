/**
 * This module is used to parse different elements related to Sequence Diagram in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	i
	var domainModelSearchUtil = require("../../utils/DomainModelSearchUtil.js");
	
	function standardizeName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}

	function constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences,XMIMessagesOne, containingOperators, XMIMessagesIdBySeq){
		
		var activities = [];
		var activitiesbyID = [];
		var precedenceRelations = [];
		var startActivity = null;
		var endActivity = null;

		console.log("occurence at interaction level");
		var XMIOccurrences = jp.query(XMIInteraction, '$[\'fragment\'||\'packagedElement\'][?(@[\'$\'][\'xmi:type\']==\'uml:MessageOccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
//		XMICombinedFragments.concat(jp.query(XMIInteraction, '$.packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]'));
		
		// for each fragment,identify the covered lifeline
		var preActivity = null;
		
		for(var i= 0; i<XMIOccurrences.length;){
			var XMIOccurrence = XMIOccurrences[i++];
			
			if(XMIOccurrence['$']['xmi:type'] === "uml:MessageOccurrenceSpecification"){
				var XMIOccurrence1 = XMIOccurrence;
//				console.log(XMIOccurrence1);

				var XMILifelineID1 = XMIOccurrence1.$.covered;
				var XMILifeline1 = XMILifelinesByID[XMILifelineID1];
				
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
					
					if(XMILifeline2.isActor){
						group = XMILifelinesByID[XMILifelineID2]['$']['name'];
					}
				
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
							_id: XMIMessage['$']['xmi:id'],
							Name: XMIMessage['$']['name'],
							Group: "System",
							OutScope: outScope,
							Component: component
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
					
					activitiesbyID[nextActivity['_id']] = nextActivity;
					
					if(!startActivity){
						startActivity = preActivity;
					}
				}
	    else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
	    	var innerCombinedFragment = processCombinedFragment(XMIOccurrence, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators, DomainElementsBySN, CustomProfiles);
			
//		var XMICombinedFragments = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
//		XMICombinedFragments = XMICombinedFragments.concat(jp.query(XMIInteraction, '$.packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]'));
//		for(var i= 0; i<XMICombinedFragments.length;i++){
//			var XMICombinedFragment = XMICombinedFragments[i];
			
//		}	
//		for(var j=0; j< XMIMessagesIdBySeq.length;){
//			var startID = XMIMessagesIdBySeq[j++];
//			if(j == XMIMessagesIdBySeq.length){ break; }
//			var endID = XMIMessagesIdBySeq[j];
//			if(activitiesbyID[startID]["Type"]== "fragment_start" || activitiesbyID[startID]["Type"] == "fragment_end"){
//				if(activitiesbyID[endID]["Type"]== "fragment_start" || activitiesbyID[endID]["Type"] == "fragment_end"){
//					if(activitiesbyID[startID]["belonged"]==activitiesbyID[endID]["belonged"]){
//						continue;
//					}
//				}
//			}
//			precedenceRelations.push({start:activitiesbyID[startID], end:activitiesbyID[endID]})
//		}
	    	
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
		
		return {Activities: activities, ActivitiesbyID: activitiesbyID, PrecedenceRelations:precedenceRelations};//, PrecedenceRelations: precedenceRelations, startActivity: startActivity, endActivity: endActivity};
	}
			
			
function processCombinedFragment(XMICombinedFragment, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators, DomainElementsBySN, CustomProfiles){
	var activities = [];
	var precedenceRelations = [];
	var startActivity = null;
	var endActivity = null;
	
	var XMIFragmentOperator = XMICombinedFragment.$.interactionOperator;
	var cfStart = {
			Type: "fragment_start",
			Name: XMIFragmentOperator+"_start",
			_id: XMICombinedFragment['$']['xmi:id']+"_start",
			belonged: XMICombinedFragment['$']['xmi:id'],
			Group: "System",
			OutScope: false
	};

	var cfEnd = {
			Type: "fragment_end",
			Name: XMIFragmentOperator+"_end",
			_id: XMICombinedFragment['$']['xmi:id']+"_end",
			belonged: XMICombinedFragment['$']['xmi:id'],
			Group: "System",
			OutScope: false
	};
	containingOperators = containingOperators.concat(XMIFragmentOperator);
	var XMIOperands = jp.query(XMICombinedFragment, '$.operand[?(@[\'$\'][\'xmi:type\']==\'uml:InteractionOperand\')]');
	for(var i in XMIOperands){
		var XMIOperand = XMIOperands[i];

		for(var k in XMIOperand['xmi:Extension']){
			var XMIMessages = XMIOperand['xmi:Extension'][k]['message'];
		}
		var MessagebySeq = [];
		for(var k in XMIMessages){
			MessagebySeq.push(XMIMessages[k]['$']['xmi:value']);
		}
		XMIMessagesIdBySeq.splice(XMIMessagesIdBySeq.indexOf(MessagebySeq[0]), 0, cfStart['_id'], cfEnd['_id']);
		for(var k=0; k<MessagebySeq.length; k++){
			XMIMessagesIdBySeq.splice(XMIMessagesIdBySeq.indexOf(MessagebySeq[k]),1);
		}
		
		//console.log("occurence")
		//var XMIOccurrences = jp.query(XMIOperand, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
		var SDCFG = constructSDCFG(XMIOperand,XMILifelinesByID, XMIMessagesByOccurrences, XMIMessagesOne, containingOperators,MessagebySeq);
		
		if(SDCFG.Activities.length > 0){
			activities = activities.concat(SDCFG.Activities);
			activitiesbyID = Object.assign({},activitiesbyID, SDCFG.ActivitiesbyID);
			precedenceRelations.push({start: cfStart, end: SDCFG.ActivitiesbyID[MessagebySeq[0]]});
			precedenceRelations = precedenceRelations.concat(SDCFG.PrecedenceRelations);
			precedenceRelations.push({start: SDCFG.ActivitiesbyID[MessagebySeq[MessagebySeq.length-1]], end: cfEnd});
		}
	}
//		console.log("process fragments");
//		console.log(SDCFG);
		if(activities.length > 0){
			activities.push(cfStart);
			activities.push(cfEnd);
			activitiesbyID[cfStart['_id']] = cfStart;
			activitiesbyID[cfEnd['_id']] = cfEnd;
			
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
				XMIMessagesIdBySeq.splice(XMIMessagesIdBySeq.indexOf(cfEnd['_id']), 1, cfStart['_id']);
				precedenceRelations.push({start: cfStart, end: cfStart});
				startActivity = cfStart;
				endActivity = cfStart;
			}
			else if(XMIFragmentOperator === "break"){
				XMIMessagesIdBySeq.splice(XMIMessagesIdBySeq.indexOf(cfEnd['_id']), 1, cfStart['_id']);
				startActivity = cfStart;
				// represent that outside edges will both be connected to the start activities.
				endActivity = cfStart;
			}
			else if(XMIFragmentOperator === "opt"){
				precedenceRelations.push({start: cfStart, end: cfEnd});
				startActivity = cfStart;
				endActivity = cfEnd;
			}
		}
		
		return {Activities: activities, PrecedenceRelations: precedenceRelations, startActivity: startActivity, endActivity: endActivity};
}

var ActorsByID = {};
var OwnedAttributesByID = {};

//	function parseSequenceDiagram(Interaction, XMIInteraction, XMIClassesByStandardizedName, callback){
	function parseSequenceDiagram(XMIUMLModel, XMIClassesByStandardizedName, ActorsByID){
		//var XMIInteractions = jp.query(XMICollaboration, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
	
		//console.log(XMIInteractions);
		ActorsByID = ActorsByID;
		
		var XMIInteractions = jp.query(XMIUMLModel, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
		
		for(var i in XMIInteractions){
			var XMIInteraction = XMIInteractions[i];
			
			var Interaction = {
					_id: XMIInteraction['$']['xmi:id'],
					Name: XMIInteraction['$']['name'],
					PrecedenceRelations : [],
					Activities : [],
					OutputDir : Model.OutputDir+"/"+XMIInteraction['$']['xmi:id'],
					AccessDir : Model.AccessDir+"/"+XMIInteraction['$']['xmi:id'],
			}

		//for(var i in XMIInteractions){
		//var XMIInteraction = XMIInteractions[i];
		var XMILifelines = jp.query(XMIInteraction, '$..lifeline[?(@[\'$\'][\'xmi:type\']==\'uml:Lifeline\')]');
		if(XMILifelines.length==0){ 
			continue;
		}
		else{
//			console.log("life lines");
//			console.log(XMILifelines);
			var XMILifelinesByID = [];

			// for each life line, identif	y the associated classes
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
//			
			console.log(XMIMessages);
	// for each message, identify the send fragment and receive fragment.
			var XMIMessagesByOccurrences = [];
			var XMIMessagesIdBySeq = [];
			var XMIMessagesOne = [];
			for(var j in XMIMessages){
				var XMIMessage = XMIMessages[j];
				XMIMessagesIdBySeq.push(XMIMessage['$']['xmi:id']);
				if(!("sendEvent" in XMIMessage['$']) || !("receiveEvent" in XMIMessage['$']) ){
					XMIMessagesByOccurrences[XMIMessage.$.sendEvent+">"+XMIMessage.$.receiveEvent] = XMIMessage;
					XMIMessagesOne.push(XMIMessage['$']['xmi:id']);
				} else {
					XMIMessagesByOccurrences[XMIMessage.$.sendEvent+">"+XMIMessage.$.receiveEvent] = XMIMessage;
				}
			}
//			console.log(XMIMessagesByOccurrences);
			
			SDCFG = constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences, XMIMessagesOne, [], XMIMessagesIdBySeq);
			Interaction.Activities = Interaction.Activities.concat(SDCFG.Activities);
			Interaction.PrecedenceRelations = Interaction.PrecedenceRelations.concat(SDCFG.PrecedenceRelations);
			
/*			var ActivitiesbyID = SDCFG.ActivitiesbyID;
			var precedenceRelations = [];

			if(XMIMessagesIdBySeq.length == Object.keys(ActivitiesbyID).length){
				for(var j=0; j< XMIMessagesIdBySeq.length;){
					var startID = XMIMessagesIdBySeq[j++];
					if(j == XMIMessages.length){ break; }
					var endID = XMIMessagesIdBySeq[j];
					precedenceRelations.push({start:ActivitiesbyID[startID], end:ActivitiesbyID[endID]})
				}
			}
			Interaction.PrecedenceRelations = Interaction.PrecedenceRelations.concat(precedenceRelations);
			//}
*/
			var ActivitiesToEliminate = [];
			//to  eliminate unnecessary activities
			for(var i in Interaction.Activities){
				var activity = Interaction.Activities[i];

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
				for(var k in Interaction.PrecedenceRelations){
					var precedenceRelation = Interaction.PrecedenceRelations[k];
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
				
				Interaction.Activities.splice(Interaction.Activities.indexOf(activityToEliminate), 1);
				Interaction.PrecedenceRelations = leftEdges;
			}
			

			///console.log("test use case");
			///console.log(Collaboration.PrecedenceRelations);
			
			//logic to decide Stimulus
			for(var i in Interaction.Activities){
				var activity = Interaction.Activities[i];
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
					
					Interaction.Activities.push(stimulus);
					Interaction.PrecedenceRelations.push({start: stimulus, end: activity});
				}
			}
		}
		

		Model.UseCases.push(Interaction);

		}
		
	}
	
	module.exports = {
			parseSequenceDiagram : parseSequenceDiagram
	}
}());