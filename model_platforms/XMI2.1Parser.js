/**
 * This module is used to parse different XMI modelf files.
 */
(function() {
//	var fs = require('fs');
//	var xml2js = require('xml2js');
//	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query')
	var jp = require('jsonpath')
	/*
	 * The actual parsing method, which take xmi file as the input and construct a user-system interaction model with an array of use cases and a domain model.
	 * 
	 * The model has the following structure:
	 * 
	 * model = {
	 * 	domainModel:[]
	 *  useCases: []
	 * }
	 * 
	 * useCase = {
					id: XMIUseCase['$']['xmi:id'],
					name: XMIUseCase['$']['name'],
					precedenceRelations : [],
					activities : [],
					attachment: XMIUseCase
	 * 
	 * }
	 * 
	 * activity = {
						type: "message",
						name: XMIMessage['$']['name'],
						id: XMIMessage['$']['xmi:id'],
						attachment: XMIMessage
	 * }
	 * 
	 * precedenceRelations = {
	 * 		start: preActivity,
	 * 		end: nextActivity
	 * 
	 * }
	 *
	 *
	 *For different stereotypes, for example 'uml:Object", 'uml:Actor', they have their specific properties.
	 *
	 *There are a few more tags for the activities...
	 *user activities....and system activities...
	 */
	
	function standardizeName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}
	
	function processCombinedFragment(CombinedFragment, UseCase, XMILifelinesByID, XMIMessagesByOccurrences, DomainElementsByID){
		
		var XMIUseCase = UseCase.attachment;
		var XMICombinedFragment = CombinedFragment.attachment;
		
		console.log("process combined fragment");
		console.log(XMICombinedFragment['$']['xmi:id']);
		
		var XMIFragmentOperator = XMICombinedFragment.$.interactionOperator;
		
		var startActivity = {
				type: "fragment_start",
				name: XMIFragmentOperator+"_start",
				id: XMICombinedFragment['$']['xmi:id']+"_start",
				attachment: XMICombinedFragment,
				group: "System",
				stimulus: false,
				inScope: true
		};

		var endActivity = {
				type: "fragment_end",
				name: XMIFragmentOperator+"_end",
				id: XMICombinedFragment['$']['xmi:id']+"_end",
				attachment: XMICombinedFragment,
				group: "System",
				stimulus: false,
				inScope: true
		};
		
		UseCase.activities.push(startActivity);
		UseCase.activities.push(endActivity);
		
		var containingOperators = [XMIFragmentOperator];
		containingOperators = containingOperators.concat(CombinedFragment.containingOperators);
		
		var XMIOperands = jp.query(XMICombinedFragment, '$.operand[?(@[\'$\'][\'xmi:type\']==\'uml:InteractionOperand\')]');
		
		for(var i in XMIOperands){
			var XMIOperand = XMIOperands[i];
			var XMIMessages = [];
//			console.log("occurence")
			var XMIOccurrences = jp.query(XMIOperand, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
//			
			console.log("in iteration");
			console.log(XMIOccurrences);
			var preActivity = startActivity;
//			var nextActivity = null;
			for(var j= 0; j<XMIOccurrences.length;){
				var XMIOccurrence = XMIOccurrences[j++];
//				UseCase.activities.push(XMIOccurrence);
				
				if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
				var XMIOccurrence1 = XMIOccurrence;
				var XMILifeline1 = XMILifelinesByID[XMIOccurrence1.$.covered];
				
				var isStimulus = false;
				var group = "System";
				if(XMILifeline1.StimulusSource){
					isStimulus = true;
					group = "User";
				}
				
				var XMIOccurrence2 = XMIOccurrences[j++];
				var XMILifeline2 = XMILifelinesByID[XMIOccurrence2.$.covered];
				
				var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
				XMIMessages.push(XMIMessage);
				
				console.log(XMIMessage);
				
				var inScope = true;
				// The rules to determine if the operation is in scope or out of the scope of the system.
				for(var k in containingOperators){
					var operator = containingOperators[k];
					console.log("check operator");
					console.log(operator);
					if(operator === "ignore" || operator === "neg"){
						inScope = false;
						break;
					}
				}
				
				var nextActivity = {
						type: "message",
						name: XMIMessage['$']['name'],
						id: XMIMessage['$']['xmi:id'],
						attachment: XMIMessage,
						group: group,
						stimulus: isStimulus,
						inScope: inScope
				};
				
				if(XMILifeline1.Class){
					nextActivity.sender = DomainElementsByID[XMILifeline1.Class['$']["xmi:id"]];
				}
				
				if(XMILifeline2.Class){
					nextActivity.receiver = DomainElementsByID[XMILifeline2.Class['$']["xmi:id"]];
				}
				
				UseCase.activities.push(nextActivity);
				UseCase.precedenceRelations.push({start: preActivity, end: nextActivity});
				
				preActivity = nextActivity;
				}
				else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
					console.log(XMIOccurrence);
					var innerCombinedFragment = {
							containingOperators: containingOperators,
							attachment: XMIOccurrence
					};
					processCombinedFragment(innerCombinedFragment, UseCase, XMILifelinesByID, XMIMessagesByOccurrences, DomainElementsByID);
					UseCase.precedenceRelations.push({start: preActivity, end: innerCombinedFragment.startActivity});
					preActivity = innerCombinedFragment.endActivity;
				}
			}
			
			console.log("pre activity....");
			console.log(preActivity);
			// the last activity should be connected to the end of the fragment
			UseCase.precedenceRelations.push({start: preActivity, end: endActivity});
			
			XMIOperand.XMIMessages = XMIMessages;
		}
		
		if(XMIFragmentOperator === "alt"
			|| XMIFragmentOperator === "par" 
			|| XMIFragmentOperator === "critical"
			|| XMIFragmentOperator === "neg"
			|| XMIFragmentOperator === "assert"
			|| XMIFragmentOperator === "strict"
			|| XMIFragmentOperator === "seq"
			|| XMIFragmentOperator === "ignore"
			|| XMIFragmentOperator === "consider"){
			
			CombinedFragment.startActivity = startActivity;
			CombinedFragment.endActivity = endActivity;
//			console.log(XMICombinedFragments);
		}
		else if(XMIFragmentOperator === "loop"){
			UseCase.precedenceRelations.push({start: endActivity, end: startActivity});
			CombinedFragment.startActivity = startActivity;
			CombinedFragment.endActivity = startActivity;
		}
		else if(XMIFragmentOperator === "break"){
			CombinedFragment.startActivity = startActivity;
			// represent that outside edges will both be connected to the start activities.
			CombinedFragment.endActivity = startActivity;
		}
		else if(XMIFragmentOperator === "opt"){
			UseCase.precedenceRelations.push({start: startActivity, end: endActivity});
			CombinedFragment.startActivity = startActivity;
			CombinedFragment.endActivity = endActivity;
		}
	}
	
	function extractModelComponents(xmiString) {
		
		var debug = require("../utils/DebuggerOutput.js");
//		debug.writeJson("XMIString", xmiString);
		
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
		var Model = {
				UseCases: [],
				DomainModel: []
		};
		
		console.log(XMIUMLModel);

		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
		var XMIClassesByStandardizedName = [];
		var DomainElementsByID = [];
		
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];
			console.log(XMIClass);
			var domainElement = {
				id: XMIClass['$']['xmi:id'],
				name: XMIClass['$']['name'],
				attachment: XMIClass
			}
			XMIClassesByStandardizedName[standardizeName(XMIClass['$']['name'])] = XMIClass;
			DomainElementsByID[domainElement.id] = domainElement;
//			model.DomainModel.push(domainElement);
		}
		console.log(XMIClasses);
//		debug.writeJson("XMIClasses", XMIClasses);
		
		
		//search for the use cases
		var XMIUseCases = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:UseCase\')]');
		console.log(XMIUseCases);
//		debug.writeJson("XMIUseCases", XMIUseCases);
		
		for(var i in XMIUseCases){
			var XMIUseCase = XMIUseCases[i];
			
			var UseCase = {
					id: XMIUseCase['$']['xmi:id'],
					name: XMIUseCase['$']['name'],
					precedenceRelations : [],
					activities : [],
					attachment: XMIUseCase
			}
			
//			console.log(XMIUseCase);
			// search for the interactions that are used to describe the use cases
			var XMIInteractions = jp.query(XMIUseCase, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
			
//			console.log("xmi interactions");
			console.log(XMIInteractions);
			for(var j in XMIInteractions){
				var XMIInteraction = XMIInteractions[j];
//				console.log(XMIInteraction);
				var XMILifelines = jp.query(XMIInteraction, '$..lifeline[?(@[\'$\'][\'xmi:type\']==\'uml:Lifeline\')]');
				console.log("life lines");
				console.log(XMILifelines);
				var XMILifelinesByID = [];
				// for each life line, identify the associated classes
				for(var k in XMILifelines){
					var XMILifeline = XMILifelines[k];

					// the stimulus are decided by the events that are connected to the actors...
					if(XMILifeline['$']['name'] === "User"){
						console.log("is a stimulus source");
						XMILifeline.StimulusSource = true;
					}
					console.log(XMILifeline);
					XMILifelinesByID[XMILifeline['$']['xmi:id']] = XMILifeline;
					var XMIClass = XMIClassesByStandardizedName[standardizeName(XMILifeline.$.name)];
					if(XMIClass){
					XMILifeline.Class = XMIClass['$']['xmi:id'];
					}
				}
				console.log(XMILifelinesByID);
//				XMIUseCase.XMILifelinesByID = XMILifelinesByID;
				
				console.log("message")
				var XMIMessages = jp.query(XMIInteraction, '$..message[?(@[\'$\'][\'xmi:type\']==\'uml:Message\')]');
//				// for each message, identify the send fragment and receive fragment.
				var XMIMessagesByOccurrences = [];
				for(var k in XMIMessages){
					var XMIMessage = XMIMessages[k];
					XMIMessagesByOccurrences[XMIMessage.$.sendEvent+">"+XMIMessage.$.receiveEvent] = XMIMessage;
				}
				console.log(XMIMessagesByOccurrences);
//				XMIUseCase.XMIMessagesByOccurrences = XMIMessagesByOccurrences;
				
				console.log("occurence at interaction level");
//				console.log("occurrence");
//				var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\')]');
				var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
				console.log(XMIOccurrences);
//				var XMIOccurrencesByID = [];
				// for each fragment,identify the covered lifeline
				var preActivity = {
						type: "interaction_start",
						name: "start",
						id: XMIInteraction['$']['xmi:id'],
						attachment: null,
						stimulus: true,
						group: "User",
						inScope: true,
				};
				
				UseCase.activities.push(preActivity);
				
				for(var k= 0; k<XMIOccurrences.length;){
					var XMIOccurrence = XMIOccurrences[k++];
					
					if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
						var XMIOccurrence1 = XMIOccurrence;
						console.log(XMIOccurrence1);
						var XMILifeline1 = XMILifelinesByID[XMIOccurrence1.$.covered];
//						XMILifeline1 = XMILifeline;
						
//						XMIOccurrencesByID[XMIOccurrence1['$']['xmi:id']] = XMIOccurrence1;
						
						var isStimulus = false;
						var group = "System";
						if(XMILifeline1.StimulusSource){
							isStimulus = true;
							group = "User";
						}
						
						var XMIOccurrence2 = XMIOccurrences[k++];
						var XMILifeline2 = XMILifelinesByID[XMIOccurrence2.$.covered];
//						XMILifeline2 = XMILifeline;
						
						var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
//						XMIMessages.push(XMIMessage);
						var nextActivity = {
								type: "message",
								name: XMIMessage['$']['name'],
								id: XMIMessage['$']['xmi:id'],
								stimulus: isStimulus,
								group: group,
								inScope: true,
								attachment: XMIMessage
						}
						
						if(XMILifeline1.Class){
							nextActivity.sender = DomainElementsByID[XMILifeline1.Class];
						}
						
						if(XMILifeline2.Class){
							nextActivity.receiver = DomainElementsByID[XMILifeline12.Class];
						}

						UseCase.activities.push(nextActivity);
						
						UseCase.precedenceRelations.push({start: preActivity, end: nextActivity});
						preActivity = nextActivity;
						
					}
					else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
//						console.log("hello");
						var innerCombinedFragment = {
								attachment: XMIOccurrence,
								containingOperators: []
						};
						processCombinedFragment(innerCombinedFragment, UseCase, XMILifelinesByID, XMIMessagesByOccurrences, DomainElementsByID);
						UseCase.precedenceRelations.push({start: preActivity, end: innerCombinedFragment.startActivity});
						preActivity = innerCombinedFragment.endActivity;
					}
				}
//				console.log(XMIOccurrencesByID);
			}
			
			console.log("finished sequence diagram processing");
			
			// we are categorizing the messages for the in-scope and out-scope messages.
			
			//search for activities that are used to describe use cases
			console.log("XMIActivities");
//			console.log(XMIUseCase);
			
			var XMIActivities = jp.query(XMIUseCase, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
			XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..node[?(@[\'$\'][\'xmi:id\'])]'));
			XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..containedNode[?(@[\'$\'][\'xmi:type\'])]'));
			XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]'));
			
			console.log(XMIActivities);
			
//			UseCase.activities = [];
			var ActivitiesByID = [];
			
			ActivitiesToEliminate = [];
//			console.log("xmi interactions");
			console.log(XMIActivities);
			for(var j in XMIActivities){
				var XMIActivity = XMIActivities[j];
//				if(XMIActivity.name === "EA_Activity1")	{
//					//Ea specific structure.
//					console.log("continue");
//				}
//				else{
					var activity = {
							type: "activity",
							name: XMIActivity['$']['name'],
							id: XMIActivity['$']['xmi:id'],
							attachment: XMIActivity,
							stimulus: false,
							inScope: true,
					};
					
					UseCase.activities.push(activity);
					ActivitiesByID[XMIActivity['$']['xmi:id']] = activity;
					if(XMIActivity['$']['xmi:type'] === "uml:DecisionNode"){
						ActivitiesToEliminate.push(activity);
					}
//				}
			}
			
			var XMIEdges = jp.query(XMIUseCase, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]');
			XMIEdges = XMIEdges.concat(jp.query(XMIUseCase, '$..containedEdge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]'));
			
			
//			console.log("xmi interactions");
			console.log(XMIEdges);
			for(var j in XMIEdges){
				var XMIEdge = XMIEdges[j];
				var sourceActivity = ActivitiesByID[XMIEdge['$']['source']];
				var targetActivity = ActivitiesByID[XMIEdge['$']['target']];
				if(sourceActivity && targetActivity){
				UseCase.precedenceRelations.push({start: sourceActivity, end: targetActivity});
				}
			}
			
			for(var j in ActivitiesToEliminate){
				var activityToEliminate = ActivitiesToEliminate[j];
				var outEdges = [];
				var inEdges = [];
				var leftEdges = [];
				for(var k in UseCase.precedenceRelations){
					var precedenceRelation = UseCase.precedenceRelations[k];
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
				
				UseCase.activities.splice(UseCase.activities.indexOf(activityToEliminate), 1);
				UseCase.precedenceRelations = leftEdges;
			}
			
			console.log(UseCase.precedenceRelations);
//			console.log("group...");

			var XMIGroups = jp.query(XMIUseCase, '$..group[?(@[\'$\'][\'xmi:type\']==\'uml:ActivityPartition\')]');
			for(var j in XMIGroups){
				var XMIGroup = XMIGroups[j];
				console.log("group")
				console.log(XMIGroup);
				var XMIActivities = jp.query(XMIGroup, '$..node[?(@[\'$\'][\'xmi:idref\'])]');
//				XMIActivities = XMIActivities.concat(jp.query(XMIGroup, '$..containedNode[?(@[\'$\'][\'xmi:type\'])]'));
				for(var k in XMIActivities){
					var XMIActivity = XMIActivities[k];
					console.log(XMIActivity['$']['xmi:idref']);
//					console.log(ActivitiesByID);
					var activity = ActivitiesByID[XMIActivity['$']['xmi:idref']];
					
//					var activity = null;
//					if(XMIActivity['$']['xmi:idref']){
//						activity = ActivitiesByID[XMIActivity['$']['xmi:idref']];
//					}
//					else{
//						console.log("containing activity");
//						activity = ActivitiesByID[XMIActivity['$']['xmi:id']];
//						console.log(activity);
//					}
					
					if(activity){
					activity.group = XMIGroup['$']['name'];
//					if(activity.group === "User"){
//						activity.stimulus=true;
//					}
					console.log("grouped activities");
					console.log(activity);
					}
				}
			}
			
			//logic to decide stimulus
			for(var j in UseCase.precedenceRelations){
				var edge = UseCase.precedenceRelations[j];
				 //create a new edge by triangle rules.
				if(edge.start.group !== "System" && edge.end.group === "System"){
					console.log("stimulus...");
					console.log(edge.start);
					edge.start.stimulus = true;
				}
			}
			
			console.log("final relations");
			console.log(UseCase.precedenceRelations);
			
			//to eliminate the activities that are not included in the user-system interaction model, for example, decision node.
			
			Model.UseCases.push(UseCase);
		}
		
		console.log("checking problem");
		// search for the instance specifications that are used to represent the robustness diagrams.
		var XMIInstanceSpecifications = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:InstanceSpecification\')]');
		XMIInstanceSpecifications = XMIInstanceSpecifications.concat(jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]'));
		console.log("checking problem");
		console.log(XMIInstanceSpecifications);
		XMIInstanceSpecificationsByID = [];
		
		UseCase = {
				id: "1",
				name: "Use Case for Robustness diagram",
				activities : [],
				precedenceRelations : []
		}
		
		for(var i in XMIInstanceSpecifications){
			var XMIInstanceSpecification = XMIInstanceSpecifications[i];
		
			var isStimulus = false;
			var group = "System";
			if(XMIInstanceSpecification['$']['xmi:type'] === "uml:Actor"){
				isStimulus = true;
				group = "User";
			}
			
			var activity = {
					type: "instanceSpecification",
					name: XMIInstanceSpecification['$']['name'],
					id: XMIInstanceSpecification['$']['xmi:id'],
					attachment: XMIInstanceSpecification,
					stimulus: isStimulus,
					group: group,
					inScope: true
			}
			
			ActivitiesByID[activity.id] = activity;
			UseCase.activities.push(activity);
		}
		
		for(var i in XMIInstanceSpecifications){
			var XMIInstanceSpecification = XMIInstanceSpecifications[i];
//			console.log(XMIUseCase);
			console.log("XMIInstanceSpecifications");
			var ConnectedXMIInstanceSpecifications = jp.query(XMIInstanceSpecification, '$..type[?(@[\'$\'][\'xmi:idref\'])]');
//			XMIAttributesByID = [];
			
			console.log(ConnectedXMIInstanceSpecifications);
			
			var startActivity = ActivitiesByID[XMIInstanceSpecification['$']['xmi:id']];
			
			for(var j in ConnectedXMIInstanceSpecifications){
				var ConnectedNodeId = ConnectedXMIInstanceSpecifications[j]['$']['xmi:idref'];
//				XMIAttributesByID[XMIAttribute['$']['xmi:id']] = XMIAttribute;
				var endActivity = ActivitiesByID[ConnectedNodeId];
				if(endActivity){
				UseCase.precedenceRelations.push({start: startActivity, end: endActivity});
				}
			}
			
			console.log(UseCase.precedenceRelations);
		}
		
		Model.UseCases.push(UseCase);
		
		for(var i in DomainElementsByID){
			Model.DomainModel.push(DomainElementsByID[i]);
		}
		
		return Model;
	}

	module.exports = {
			extractModelComponents : extractModelComponents
	}
}());