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
	
	function contains(arr, obj) {  
	    var i = arr.length;  
	    while (i--) {  
	        if (arr[i] === obj) {  
	            return true;  
	        }  
	    }  
	    return false;  
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
					Type: type,
					isStatic: XMIAttribute['$']['isStatic']
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
					Visibility: XMIOperation['$']['visibility'],
					Parameters: parameters
			}
			operations.push(operation);
		}
               
                var inheritanceStats = {
                        'depth': 0,
                        'numInheritedFrom': 0,
                        'numDerivedClass': 0,
                        'coupling': 0,
                        'children': new Set([]),
                        'topLevelClasses': 0,
                        'numOfChildren': 0,
                }

                function traverseClass(XMIClass, level) {
                        var children = jp.query(XMIClass, '$.nestedClassifier[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
                        // console.log('Exploring children, level: ');
                        // console.log(level);
                        inheritanceStats['depth'] = Math.max(inheritanceStats['depth'], level);
                        if (children.length != 0) { 
                                console.log('------------ Children Present ------------')
                                inheritanceStats['numInheritedFrom']++;
                                for (j in children) {
                                    var child = children[j];
                                    inheritanceStats['children'].add(child['$']['name']);
                                    inheritanceStats['numOfChildren']++;
                                    traverseClass(child, level + 1);
                                }
                        }
                }

                inheritanceStats['topLevelClasses']++;
                traverseClass(XMIClass, 0);
                // console.log(inheritanceStats);

		// console.log(classDiagram);
//		component.Operations = operations;
//		component.Attributes = attributes;
//		component.Type = 'class';
		
		return {
				_id: XMIClass['$']['xmi:id'],
				Name: XMIClass['$']['name'],
				Operations: operations,
				Attributes: attributes,
                InheritanceStats: inheritanceStats,
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
				Actors:[],
				Roles:[],
				UseCases: [],
				DomainModel: {
					Elements: [],
					Usages: [],
					Realization:[],
					Assoc: []
				}
				
		};
		
		//create a catelog for the actors.
		var XMIActors = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		var ActorsByID = {};
		var actors =[];
		var roles = [];
		for(var i in XMIActors){
			var XMIActor = XMIActors[i];
			actors.push(XMIActor['$']);
			if(!contains(roles, XMIActor['$']['name'])){
				roles.push(XMIActor['$']['name']);
			}
			ActorsByID[XMIActor['$']['xmi:id']] = {
					Name: XMIActor['$']['name'],
					_id: XMIActor['$']['xmi:id']
			}		
		}
		
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
			DomainElementsByID[domainElement._id] = domainElement;
//			model.DomainModel.push(domainElement);
		}
		console.log(XMIClasses);
//		debug.writeJson("XMIClasses", XMIClasses);
		
		
		//search for the use cases
		var XMIUseCases = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:UseCase\')]');
		console.log(XMIUseCases);
//		debug.writeJson("XMIUseCases", XMIUseCases);
		var useCaseNum = 0;
		for(var i in XMIUseCases){
			var XMIUseCase = XMIUseCases[i];
			useCaseNum++;
			var UseCase = {
					_id: XMIUseCase['$']['xmi:id'],
					Name: XMIUseCase['$']['name'],
					PrecedenceRelations : [],
					Activities : [],
//					Attachment: XMIUseCase
			}
			Model.UseCases.Actors = actors;
			Model.UseCases.Roles= roles;
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
				_id: "1",
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
					_id: XMIInstanceSpecification['$']['xmi:id'],
//					Attachment: XMIInstanceSpecification,
					Stimulus: isStimulus,
					Group: group,
					OutScope: false
			}
			
			ActivitiesByID[activity._id] = activity;
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
		
		
		for(var i in DomainElementsByID){
			Model.DomainModel.Elements.push(DomainElementsByID[i]);
		}
		
		
		var XMIUsages = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Usage\')]');
		var DomainUsagesByID = [];
		for(var i in XMIUsages){
			var XMIUsage = XMIUsages[i];
			//      console.log(XMIUsage);
			var domainUsage = {
				_id: XMIUsage['$']['xmi:id'],
				Supplier: XMIUsage['$']['supplier'],
				Client: XMIUsage['$']['client']
			}
			DomainUsagesByID[domainUsage._id] = domainUsage;
		}

		for(var i in DomainUsagesByID){
			Model.DomainModel.Usages.push(DomainUsagesByID[i]);
		}

		var XMIReals = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Realization\')]');
		var DomainRealizationByID = [];
		for(var i in XMIReals){
			var XMIReal = XMIReals[i];
			//      console.log(XMIReal);
			var domainRealization = {
				_id: XMIReal['$']['xmi:id']
			}
			DomainRealizationByID[domainRealization._id] = domainRealization;
		}

		for(var i in DomainRealizationByID){
			Model.DomainModel.Realization.push(DomainRealizationByID[i]);
		}

		var XMIAssocs = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Association\')]');
		var DomainAssociationByID = [];
		for(var i in XMIAssocs){
			var XMIAssoc = XMIAssocs[i];
			//      console.log(XMIAssoc);
			var domainAssociation = {
				_id: XMIAssoc['$']['xmi:id']
			}
			DomainAssociationByID[domainAssociation._id] = domainAssociation;
		}

		for(var i in DomainAssociationByID){
			Model.DomainModel.Assoc.push(DomainAssociationByID[i]);
		}

//		return Model;
		
		if(callbackfunc){
			callbackfunc(Model);
		}
		
			});
		});
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
	
	function constructSDCFG(XMIInteraction, XMILifelinesByID, XMIMessagesByOccurrences, containingOperators){
		
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
				var XMILifeline1 = XMILifelinesByID[XMIOccurrence1.$.covered];
//				XMILifeline1 = XMILifeline;
				
//				XMIOccurrencesByID[XMIOccurrence1['$']['xmi:id']] = XMIOccurrence1;
				
//				var isStimulus = false;
				var group = "System";
				if(XMILifeline1.isUser){
//					isStimulus = true;
					group = "User";
				}
				
				var XMIOccurrence2 = XMIOccurrences[i++];
				var XMILifeline2 = XMILifelinesByID[XMIOccurrence2.$.covered];
//				XMILifeline2 = XMILifeline;
				
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
				
				var nextActivity = {
						Type: "message",
						Name: XMIMessage['$']['name'],
						_id: XMIMessage['$']['xmi:id'],
						Stimulus: false,
						Group: group,
						OutScope: outScope,
//						Attachment: XMIMessage
				}
				
				nextActivity.sender = XMILifeline1;
				nextActivity.receiver = XMILifeline2;

//				UseCase.Activities.push(nextActivity);
				activities.push(nextActivity);
				
				if(preActivity){
				if(nextActivity.sender.isUser && preActivity.receiver != nextActivity.sender){

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

	
	function parseSequenceDiagram(UseCase, XMIUseCase, XMIClassesByStandardizedName, DomainElementsByID){
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
//				ActivitiesToEliminate.push(activity);
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
		for(var i in UseCase.PrecedenceRelations){
			var edge = UseCase.PrecedenceRelations[i];
			console.log(edge);
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
						_id: XMIActivity['$']['xmi:id'],
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
