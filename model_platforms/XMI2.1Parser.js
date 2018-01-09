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
					nodes : [],
					attachment: XMIUseCase
	 * 
	 * }
	 * 
	 * node = {
						type: "message",
						name: XMIMessage['$']['name'],
						id: XMIMessage['$']['xmi:id'],
						attachment: XMIMessage
	 * }
	 * 
	 * precedenceRelations = {
	 * 		start: preNode,
	 * 		end: nextNode
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
		
		var startNode = {
				type: "fragment_start",
				name: XMIFragmentOperator+"_start",
				id: XMICombinedFragment['$']['xmi:id']+"_start",
				attachment: XMICombinedFragment,
				stimulus: false,
				inScope: true
		};

		var endNode = {
				type: "fragment_end",
				name: XMIFragmentOperator+"_end",
				id: XMICombinedFragment['$']['xmi:id']+"_end",
				attachment: XMICombinedFragment,
				stimulus: false,
				inScope: true
		};
		

		UseCase.nodes.push(startNode);
		UseCase.nodes.push(endNode);
		
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
			var preNode = startNode;
//			var nextNode = null;
			for(var j= 0; j<XMIOccurrences.length;){
				var XMIOccurrence = XMIOccurrences[j++];
//				UseCase.nodes.push(XMIOccurrence);
				
				if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
				var XMIOccurrence1 = XMIOccurrence;
				var XMILifeline1 = XMILifelinesByID[XMIOccurrence1.$.covered];
				
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
				
				var nextNode = {
						type: "message",
						name: XMIMessage['$']['name'],
						id: XMIMessage['$']['xmi:id'],
						attachment: XMIMessage,
						stimulus: false,
						inScope: inScope
				};
				
				if(XMILifeline1.Class){
					nextNode.sender = DomainElementsByID[XMILifeline1.Class['$']["xmi:id"]];
				}
				
				if(XMILifeline2.Class){
					nextNode.receiver = DomainElementsByID[XMILifeline2.Class['$']["xmi:id"]];
				}
				
				UseCase.nodes.push(nextNode);
				UseCase.precedenceRelations.push({start: preNode, end: nextNode});
				
				preNode = nextNode;
				}
				else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
					console.log(XMIOccurrence);
					var innerCombinedFragment = {
							containingOperators: containingOperators,
							attachment: XMIOccurrence
					};
					processCombinedFragment(innerCombinedFragment, UseCase, XMILifelinesByID, XMIMessagesByOccurrences, DomainElementsByID);
					UseCase.precedenceRelations.push({start: preNode, end: innerCombinedFragment.startNode});
					preNode = innerCombinedFragment.endNode;
				}
			}
			
			console.log("pre node....");
			console.log(preNode);
			// the last node should be connected to the end of the fragment
			UseCase.precedenceRelations.push({start: preNode, end: endNode});
			
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
			
			CombinedFragment.startNode = startNode;
			CombinedFragment.endNode = endNode;
//			console.log(XMICombinedFragments);
		}
		else if(XMIFragmentOperator === "loop"){
			UseCase.precedenceRelations.push({start: endNode, end: startNode});
			CombinedFragment.startNode = startNode;
			CombinedFragment.endNode = startNode;
		}
		else if(XMIFragmentOperator === "break"){
			CombinedFragment.startNode = startNode;
			// represent that outside edges will both be connected to the start nodes.
			CombinedFragment.endNode = startNode;
		}
		else if(XMIFragmentOperator === "opt"){
			UseCase.precedenceRelations.push({start: startNode, end: endNode});
			CombinedFragment.startNode = startNode;
			CombinedFragment.endNode = endNode;
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
					nodes : [],
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
				var preNode = {
						type: "interaction_start",
						name: "start",
						id: XMIInteraction['$']['xmi:id'],
						attachment: null,
						stimulus: true,
						inScope: true,
				};
				
				UseCase.nodes.push(preNode);
				
				for(var k= 0; k<XMIOccurrences.length;){
					var XMIOccurrence = XMIOccurrences[k++];
					
					if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
						var XMIOccurrence1 = XMIOccurrence;
						console.log(XMIOccurrence1);
						var XMILifeline1 = XMILifelinesByID[XMIOccurrence1.$.covered];
//						XMILifeline1 = XMILifeline;
						
						
//						XMIOccurrencesByID[XMIOccurrence1['$']['xmi:id']] = XMIOccurrence1;
						
						var XMIOccurrence2 = XMIOccurrences[k++];
						var XMILifeline2 = XMILifelinesByID[XMIOccurrence2.$.covered];
//						XMILifeline2 = XMILifeline;
						
						var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
//						XMIMessages.push(XMIMessage);
						var nextNode = {
								type: "message",
								name: XMIMessage['$']['name'],
								id: XMIMessage['$']['xmi:id'],
								stimulus: false,
								inScope: true,
								attachment: XMIMessage
						}
						
						if(XMILifeline1.Class){
							nextNode.sender = DomainElementsByID[XMILifeline1.Class];
						}
						
						if(XMILifeline2.Class){
							nextNode.receiver = DomainElementsByID[XMILifeline12.Class];
						}

						UseCase.nodes.push(nextNode);
						
						UseCase.precedenceRelations.push({start: preNode, end: nextNode});
						preNode = nextNode;
						
					}
					else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
//						console.log("hello");
						var innerCombinedFragment = {
								attachment: XMIOccurrence,
								containingOperators: []
						};
						processCombinedFragment(innerCombinedFragment, UseCase, XMILifelinesByID, XMIMessagesByOccurrences, DomainElementsByID);
						UseCase.precedenceRelations.push({start: preNode, end: innerCombinedFragment.startNode});
						preNode = innerCombinedFragment.endNode;
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
			XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..node[?(@[\'$\'][\'xmi:type\'])]'));
			XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..containedNode[?(@[\'$\'][\'xmi:type\'])]'));
			XMIActivities = XMIActivities.concat(jp.query(XMIUseCase, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]'));
			
			console.log(XMIActivities);
			
//			UseCase.nodes = [];
			var NodesByID = [];
			
			
//			console.log("xmi interactions");
			console.log(XMIActivities);
			for(var j in XMIActivities){
				var XMIActivity = XMIActivities[j];
				if(XMIActivity.name === "EA_Activity1")	{
					//Ea specific structure.
					console.log("continue");
				}
				else{
					var node = {
							type: "activity",
							name: XMIActivity['$']['name'],
							id: XMIActivity['$']['xmi:id'],
							attachment: XMIActivity,
							stimulus: false,
							inScope: true,
					};
					
					UseCase.nodes.push(node);
					NodesByID[XMIActivity['$']['xmi:id']] = node;
				}
			}
			
			var XMIEdges = jp.query(XMIUseCase, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]');
			XMIEdges = XMIEdges.concat(jp.query(XMIUseCase, '$..containedEdge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]'));

//			console.log("xmi interactions");
			console.log(XMIEdges);
			for(var j in XMIEdges){
				var XMIEdge = XMIEdges[j];
				var sourceNode = NodesByID[XMIEdge['$']['source']];
				var targetNode = NodesByID[XMIEdge['$']['target']];
				if(sourceNode && targetNode){
				UseCase.precedenceRelations.push({start: sourceNode, end: targetNode});
				}
			}
			
			console.log(UseCase.precedenceRelations);
//			console.log("group...");

			var XMIGroups = jp.query(XMIUseCase, '$..group[?(@[\'$\'][\'xmi:type\']==\'uml:ActivityPartition\')]');
			for(var j in XMIGroups){
				var XMIGroup = XMIGroups[j];
				console.log("group")
				console.log(XMIGroup);
				var XMINodes = jp.query(XMIGroup, '$..node[?(@[\'$\'][\'xmi:idref\'])]');
				for(var k in XMINodes){
					var XMINode = XMINodes[k];
					console.log(XMINode['$']['xmi:idref']);
//					console.log(NodesByID);
					var node = NodesByID[XMINode['$']['xmi:idref']];
					if(node){
					node.group = XMIGroup['$']['name'];
					console.log("grouped nodes");
					console.log(node);
					}
				}
			}
			
			Model.UseCases.push(UseCase);
		}
		
		console.log("checking problem");
		// search for the instance specifications that are used to represent the robustness diagrams.
		var XMIInstanceSpecifications = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:InstanceSpecification\')]');
		console.log("checking problem");
		console.log(XMIInstanceSpecifications);
		XMIInstanceSpecificationsByID = [];
		
		UseCase = {
				id: "1",
				name: "Use Case for Robustness diagram",
				nodes : [],
				precedenceRelations : []
		}
		
		for(var i in XMIInstanceSpecifications){
			var XMIInstanceSpecification = XMIInstanceSpecifications[i];
			
			var node = {
					type: "instanceSpecification",
					name: XMIInstanceSpecification['$']['name'],
					id: XMIInstanceSpecification['$']['xmi:id'],
					attachment: XMIInstanceSpecification,
					stimulus: false,
					inScope: true
			}
			
			NodesByID[node.id] = node;
			UseCase.nodes.push(node);
		}
		
		for(var i in XMIInstanceSpecifications){
			var XMIInstanceSpecification = XMIInstanceSpecifications[i];
//			console.log(XMIUseCase);
			console.log("XMIInstanceSpecifications");
			var ConnectedXMIInstanceSpecifications = jp.query(XMIInstanceSpecification, '$..type[?(@[\'$\'][\'xmi:idref\'])]');
//			XMIAttributesByID = [];
			
			console.log(ConnectedXMIInstanceSpecifications);
			
			var startNode = NodesByID[XMIInstanceSpecification['$']['xmi:id']];
			
			for(var j in ConnectedXMIInstanceSpecifications){
				var ConnectedNodeId = ConnectedXMIInstanceSpecifications[j]['$']['xmi:idref'];
//				XMIAttributesByID[XMIAttribute['$']['xmi:id']] = XMIAttribute;
				var endNode = NodesByID[ConnectedNodeId];
				UseCase.precedenceRelations.push({start: startNode, end: endNode});
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