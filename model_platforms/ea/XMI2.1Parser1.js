/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
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
					Name: XMIUseCase['$']['name'],
					precedenceRelations : [],
					Activities : [],
					Attachment: XMIUseCase
	 * 
	 * }
	 * 
	 * activity = {
						Type: "message",
						Name: XMIMessage['$']['name'],
						id: XMIMessage['$']['xmi:id'],
						Attachment: XMIMessage
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
	
	function processCombinedFragment(CombinedFragment, XMICombinedFragment, UseCase, XMIUseCase, XMILifelinesByID, XMIMessagesByOccurrences){
		
//		var XMIUseCase = UseCase.Attachment;
//		var XMICombinedFragment = CombinedFragment.Attachment;
		
		console.log("process combined fragment");
		console.log(XMICombinedFragment['$']['xmi:id']);
		
		var XMIFragmentOperator = XMICombinedFragment.$.interactionOperator;
		
		var startActivity = {
				Type: "fragment_start",
				Name: XMIFragmentOperator+"_start",
				id: XMICombinedFragment['$']['xmi:id']+"_start",
//				Attachment: XMICombinedFragment,
				Group: "System",
				Stimulus: false,
				OutScope: false
		};

		var endActivity = {
				Type: "fragment_end",
				Name: XMIFragmentOperator+"_end",
				id: XMICombinedFragment['$']['xmi:id']+"_end",
//				Attachment: XMICombinedFragment,
				Group: "System",
				Stimulus: false,
				OutScope: false
		};
		
		UseCase.Activities.push(startActivity);
		UseCase.Activities.push(endActivity);
		
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
//				UseCase.Activities.push(XMIOccurrence);
				
				if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
				var XMIOccurrence1 = XMIOccurrence;
				var XMILifeline1 = XMILifelinesByID[XMIOccurrence1.$.covered];
				
//				var isStimulus = false;
				var group = "System";
				if(XMILifeline1.isUser){
//					isStimulus = true;
					group = "User";
				}
				
				var XMIOccurrence2 = XMIOccurrences[j++];
				var XMILifeline2 = XMILifelinesByID[XMIOccurrence2.$.covered];
				
				var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
				XMIMessages.push(XMIMessage);
				
				console.log(XMIMessage);
				
				var OutScope = false;
				// The rules to determine if the operation is in scope or out of the scope of the system.
				for(var k in containingOperators){
					var operator = containingOperators[k];
					console.log("check operator");
					console.log(operator);
					if(operator === "ignore" || operator === "neg"){
						OutScope = true;
						break;
					}
				}
				
				var nextActivity = {
						Type: "message",
						Name: XMIMessage['$']['name'],
						id: XMIMessage['$']['xmi:id'],
//						Attachment: XMIMessage,
						Group: group,
						Stimulus: false,
						OutScope: OutScope
				};
				
//				if(XMILifeline1.Class){
//					nextActivity.sender = DomainElementsByID[XMILifeline1.Class];
					nextActivity.sender = XMILifeline1;
//				}
				
//				if(XMILifeline2.Class){
//					nextActivity.receiver = DomainElementsByID[XMILifeline12.Class];
					nextActivity.receiver = XMILifeline2;
//				}
				
//				if(XMILifeline1.Class){
//					nextActivity.sender = DomainElementsByID[XMILifeline1.Class['$']["xmi:id"]];
//				}
//				
//				if(XMILifeline2.Class){
//					nextActivity.receiver = DomainElementsByID[XMILifeline2.Class['$']["xmi:id"]];
//				}
				
				UseCase.Activities.push(nextActivity);
				
				if(preActivity){
				if(nextActivity.sender.isUser && preActivity.receiver != nextActivity.sender){
//					var preMessage = preActivity.Attachment;
				}
				else{

					UseCase.PrecedenceRelations.push({start: preActivity, end: nextActivity});
				}
				}
//				UseCase.PrecedenceRelations.push({start: preActivity, end: nextActivity});
				
				preActivity = nextActivity;
				}
				else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
					console.log(XMIOccurrence);
					var innerCombinedFragment = {
							containingOperators: containingOperators,
//							Attachment: XMIOccurrence
					};
					processCombinedFragment(innerCombinedFragment, XMIOccurence, UseCase, XMIUseCase, XMILifelinesByID, XMIMessagesByOccurrences);
					
					if(preActivity){
					UseCase.PrecedenceRelations.push({start: preActivity, end: innerCombinedFragment.startActivity});
					}
					
					preActivity = innerCombinedFragment.endActivity;
				}
			}
			
			console.log("pre activity....");
			console.log(preActivity);
			// the last activity should be connected to the end of the fragment
			UseCase.PrecedenceRelations.push({start: preActivity, end: endActivity});
			
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
			UseCase.PrecedenceRelations.push({start: endActivity, end: startActivity});
			CombinedFragment.startActivity = startActivity;
			CombinedFragment.endActivity = startActivity;
		}
		else if(XMIFragmentOperator === "break"){
			CombinedFragment.startActivity = startActivity;
			// represent that outside edges will both be connected to the start activities.
			CombinedFragment.endActivity = startActivity;
		}
		else if(XMIFragmentOperator === "opt"){
			UseCase.PrecedenceRelations.push({start: startActivity, end: endActivity});
			CombinedFragment.startActivity = startActivity;
			CombinedFragment.endActivity = endActivity;
		}
	}
	
	function createDomainElement(XMIClass){
		var XMIAttributes = jp.query(XMIClass, '$.ownedAttribute[?(@[\'$\'][\'xmi:type\']==\'uml:Property\')]');
		var attributes = new Array();
		
		for(var i in XMIAttributes){
			var XMIAttribute = XMIAttributes[i];
			var types = jp.query(XMIAttribute, '$.type[?(@[\'$\'][\'xmi:idref\'])]');
			var type = "EAJava_void";
			if(types && types.length > 0){
				type = types[0]['$']['xmi:idref'];
			}
			
			console.log(XMIAttribute);
			var attribute = {
					Name: XMIAttribute['$']['name'],
					Type: type
			}
			attributes.push(attribute);
		}

		var XMIOperations = jp.query(XMIClass, '$.ownedOperation[?(@[\'$\'][\'xmi:id\'])]');
		var operations = new Array();
		
		for(var i in XMIOperations){
			var XMIOperation = XMIOperations[i];
			var XMIParameters = jp.query(XMIOperation, '$.ownedParameter[?(@[\'$\'][\'xmi:id\'])]');
			var parameters = [];
			for(var j in XMIParameters){
				var XMIParameter = XMIParameters[j];
				var parameter = {
						Name: XMIParameter['$']['name'],
						Type: XMIParameter['$']['type']
				}
				parameters.push(parameter);
			}
			
			var operation = {
					Name: XMIOperation['$']['name'],
					parameters: parameters
			}
			operations.push(operation);
		}
		//				
		// console.log(classDiagram);
//		component.Operations = operations;
//		component.Attributes = attributes;
//		component.Type = 'class';
		
		return {
				id: XMIClass['$']['xmi:id'],
				Name: XMIClass['$']['name'],
				Operations: operations,
				Attributes: attributes,
//				Attachment: XMIClass
			}
	}
	
	function extractUserSystermInteractionModel(filePath, callbackfunc) {
		
		fs.readFile(filePath, function(err, data) {
			parser.parseString(data, function(err, xmiString) {
		
		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("XMIString", xmiString);
		
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
		var Model = {
				UseCases: [],
				DomainModel: {
					Elements: []
				}
		};
		
		console.log(XMIUMLModel);

		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
		var XMIClassesByStandardizedName = [];
		var DomainElementsByID = [];
		
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];
			console.log(XMIClass);
//			var domainElement = {
//				id: XMIClass['$']['xmi:id'],
//				Name: XMIClass['$']['name'],
//				Attachment: XMIClass
//			}
			var domainElement = createDomainElement(XMIClass);
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
					Name: XMIUseCase['$']['name'],
					PrecedenceRelations : [],
					Activities : [],
//					Attachment: XMIUseCase
			}
			
			parseSequenceDiagram(UseCase, XMIUseCase, XMIClassesByStandardizedName, DomainElementsByID);
			parseActivityDiagram(UseCase, XMIUseCase, XMIClassesByStandardizedName, DomainElementsByID);
			
			Model.UseCases.push(UseCase);
		}
		
		console.log("checking problem");
		// search for the instance specifications that are used to represent the robustness diagrams.
		var XMIInstanceSpecifications = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:InstanceSpecification\')]');
		XMIInstanceSpecifications = XMIInstanceSpecifications.concat(jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]'));
		console.log("checking problem");
		console.log(XMIInstanceSpecifications);
//		var XMIInstanceSpecificationsByID = [];

		var ActivitiesByID = [];
		
		UseCase = {
				id: "1",
				Name: "Use Case for Robustness diagram",
				Activities : [],
				PrecedenceRelations : []
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
					Type: "instanceSpecification",
					Name: XMIInstanceSpecification['$']['name'],
					id: XMIInstanceSpecification['$']['xmi:id'],
//					Attachment: XMIInstanceSpecification,
					Stimulus: isStimulus,
					Group: group,
					OutScope: false
			}
			
			ActivitiesByID[activity.id] = activity;
			UseCase.Activities.push(activity);
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
				UseCase.PrecedenceRelations.push({start: startActivity, end: endActivity});
				}
			}
			
			console.log(UseCase.PrecedenceRelations);
		}
		
		Model.UseCases.push(UseCase);
		
		for(var i in DomainElementsByID){
			Model.DomainModel.Elements.push(DomainElementsByID[i]);
		}
		
//		return Model;
		
		if(callbackfunc){
			callbackfunc(Model);
		}
		
			});
		});
	}

	
	function parseSequenceDiagram(UseCase, XMIUseCase, XMIClassesByStandardizedName, DomainElementsByID){
//		console.log(XMIUseCase);
		// search for the interactions that are used to describe the use cases
		var XMIInteractions = jp.query(XMIUseCase, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
		
//		console.log("xmi interactions");
		console.log(XMIInteractions);
		for(var j in XMIInteractions){
			var XMIInteraction = XMIInteractions[j];
//			console.log(XMIInteraction);
			var XMILifelines = jp.query(XMIInteraction, '$..lifeline[?(@[\'$\'][\'xmi:type\']==\'uml:Lifeline\')]');
			console.log("life lines");
			console.log(XMILifelines);
			var XMILifelinesByID = [];
			// for each life line, identify the associated classes
			for(var k in XMILifelines){
				var XMILifeline = XMILifelines[k];
				// ...
				if(XMILifeline['$']['name'] === "User"){
					console.log("is a Stimulus source");
					XMILifeline.isUser = true;
				}
				console.log(XMILifeline);
				XMILifelinesByID[XMILifeline['$']['xmi:id']] = XMILifeline;
				var XMIClass = XMIClassesByStandardizedName[standardizeName(XMILifeline.$.name)];
				if(XMIClass){
				XMILifeline.Class = XMIClass['$']['xmi:id'];
				}
			}
			console.log(XMILifelinesByID);
//			XMIUseCase.XMILifelinesByID = XMILifelinesByID;
			
			console.log("message")
			var XMIMessages = jp.query(XMIInteraction, '$..message[?(@[\'$\'][\'xmi:type\']==\'uml:Message\')]');
//			// for each message, identify the send fragment and receive fragment.
			var XMIMessagesByOccurrences = [];
			for(var k in XMIMessages){
				var XMIMessage = XMIMessages[k];
				XMIMessagesByOccurrences[XMIMessage.$.sendEvent+">"+XMIMessage.$.receiveEvent] = XMIMessage;
			}
			console.log(XMIMessagesByOccurrences);
//			XMIUseCase.XMIMessagesByOccurrences = XMIMessagesByOccurrences;
			
			console.log("occurence at interaction level");
//			console.log("occurrence");
//			var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\')]');
			var XMIOccurrences = jp.query(XMIInteraction, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
			console.log(XMIOccurrences);
//			var XMIOccurrencesByID = [];
			// for each fragment,identify the covered lifeline
			
			var preActivity = null;
//			var preActivity = {
//					Type: "interaction_start",
//					name: "start",
//					id: XMIInteraction['$']['xmi:id'],
//					Attachment: null,
//					Stimulus: false,
//					Group: "User",
//					OutScope: false,
//			};
			
//			UseCase.Activities.push(preActivity);
			
			for(var k= 0; k<XMIOccurrences.length;){
				var XMIOccurrence = XMIOccurrences[k++];
				
				if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
					var XMIOccurrence1 = XMIOccurrence;
					console.log(XMIOccurrence1);
					var XMILifeline1 = XMILifelinesByID[XMIOccurrence1.$.covered];
//					XMILifeline1 = XMILifeline;
					
//					XMIOccurrencesByID[XMIOccurrence1['$']['xmi:id']] = XMIOccurrence1;
					
//					var isStimulus = false;
					var group = "System";
					if(XMILifeline1.isUser){
//						isStimulus = true;
						group = "User";
					}
					
					var XMIOccurrence2 = XMIOccurrences[k++];
					var XMILifeline2 = XMILifelinesByID[XMIOccurrence2.$.covered];
//					XMILifeline2 = XMILifeline;
					
					var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
//					XMIMessages.push(XMIMessage);
					var nextActivity = {
							Type: "message",
							Name: XMIMessage['$']['name'],
							id: XMIMessage['$']['xmi:id'],
							Stimulus: false,
							Group: group,
							OutScope: false,
//							Attachment: XMIMessage
					}
					
//					if(XMILifeline1.Class){
//						nextActivity.sender = DomainElementsByID[XMILifeline1.Class];
						nextActivity.sender = XMILifeline1;
//					}
					
//					if(XMILifeline2.Class){
//						nextActivity.receiver = DomainElementsByID[XMILifeline12.Class];
						nextActivity.receiver = XMILifeline2;
//					}

					UseCase.Activities.push(nextActivity);
					
					// The temporary rules to eliminate the unnecessary rules.
					if(preActivity){
					if(nextActivity.sender.isUser && preActivity.receiver != nextActivity.sender){
//						var preMessage = preActivity.Attachment;
					}
					else{

						UseCase.PrecedenceRelations.push({start: preActivity, end: nextActivity});
					}
					}
					
					preActivity = nextActivity;
					
				}
				else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
//					console.log("hello");
					var innerCombinedFragment = {
//							Attachment: XMIOccurrence,
							containingOperators: []
					};
					processCombinedFragment(innerCombinedFragment, XMIOccurrence, UseCase, XMIUseCase, XMILifelinesByID, XMIMessagesByOccurrences);
					if(preActivity){
					UseCase.PrecedenceRelations.push({start: preActivity, end: innerCombinedFragment.startActivity});
					}
					preActivity = innerCombinedFragment.endActivity;
				}
			}
//			console.log(XMIOccurrencesByID);
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
		
		//logic to decide Stimulus
		for(var i in UseCase.PrecedenceRelations){
			var edge = UseCase.PrecedenceRelations[i];
			 //create a new edge by triangle rules.
			if(edge.start.Group !== "System" && edge.end.Group === "System"){
				console.log("Stimulus...");
				console.log(edge.start);
				edge.start.Stimulus = true;
			}
		}
		
		console.log("finished sequence diagram processing");
		
	}
	
	function parseActivityDiagram(UseCase, XMIUseCase, XMIClassesByStandardizedName, DomainElementsByID){

		// we are categorizing the messages for the in-scope and out-scope messages.
		
		//search for activities that are used to describe use cases
		console.log("XMIActivities");
//		console.log(XMIUseCase);
		
		var XMIActivities = jp.query(XMIUseCase, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
		XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..node[?(@[\'$\'][\'xmi:id\'])]'));
		XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..containedNode[?(@[\'$\'][\'xmi:type\'])]'));
		XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]'));
		
		console.log(XMIActivities);
		
//		UseCase.Activities = [];
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
						id: XMIActivity['$']['xmi:id'],
//						Attachment: XMIActivity,
						Stimulus: false,
						OutScope: false,
				};
				
				UseCase.Activities.push(activity);
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
			UseCase.PrecedenceRelations.push({start: sourceActivity, end: targetActivity});
			}
		}
		
		for(var j in ActivitiesToEliminate){
			var activityToEliminate = ActivitiesToEliminate[j];
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
		
		console.log(UseCase.PrecedenceRelations);
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
		
		//logic to decide Stimulus
		for(var j in UseCase.PrecedenceRelations){
			var edge = UseCase.PrecedenceRelations[j];
			 //create a new edge by triangle rules.
			if(edge.start.Group !== "System" && edge.end.Group === "System"){
				console.log("Stimulus...");
				console.log(edge.start);
				edge.start.Stimulus = true;
			}
		}
		
		console.log("final relations");
		console.log(UseCase.PrecedenceRelations);
		
		//to eliminate the activities that are not included in the user-system interaction model, for example, decision node.

	}

	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel
	}
}());