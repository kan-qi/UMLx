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
	 * The actual parsing method, which take xmi file as the input and construct a named array 
	 * with element uui (in xmi file) as the key and the component which represent xmi element as the value.
	 * 
	 * So the basic properties for a component contains are as follows:
	 * 
	 * var component = {
				//keep the ID of the xmi model, for re-analyse
				_id : xmiElement['$']['xmi:idref'],
				Category : 'Element',
				StereoType : xmiElement['$']['xmi:type'],
				Name : xmiElement['$']['name']
			};
	 *
	 *
	 *For different stereotypes, for example 'uml:Object", 'uml:Actor', they have their specific properties.
	 */
	
	function extractModelComponents(xmiString) {
//		var xmiExtension = xmiString['xmi:XMI']['xmi:Extension'][0];
		
		
		function standardizeName(name){
			return name.replace(/\s/g, '').toUpperCase();
		}
		
		function processCombinedFragment(XMICombinedFragment, XMIUseCase){
			
			console.log("process combined fragment");
			console.log(XMICombinedFragment['$']['xmi:id']);
			
			var XMILifelinesByID = XMIUseCase.XMILifelinesByID;
			var XMIMessagesByOccurances = XMIUseCase.XMIMessagesByOccurrences;
			
			var XMIFragmentOperator = XMICombinedFragment.$.interactionOperator;
			
			var startNode = {
					type: "fragment_start",
					name: XMIFragmentOperator+"_start",
					id: XMICombinedFragment['$']['xmi:id']+"_start",
					attachment: XMICombinedFragment
			};

			var endNode = {
					type: "fragment_end",
					name: XMIFragmentOperator+"_end",
					id: XMICombinedFragment['$']['xmi:id']+"_end",
					attachment: XMICombinedFragment
			};
			

			XMIUseCase.Nodes.push(startNode);
			XMIUseCase.Nodes.push(endNode);
			
			var XMIOperands = jp.query(XMICombinedFragment, '$.operand[?(@[\'$\'][\'xmi:type\']==\'uml:InteractionOperand\')]');
			
			for(var i in XMIOperands){
				var XMIOperand = XMIOperands[i];
				var XMIMessages = [];
//				console.log("occurence")
				var XMIOccurrences = jp.query(XMIOperand, '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
//				var XMIOccurrencesByID = [];
				// for each fragment,identify the covered lifeline
				// iterate through occurences pair by pair.
				console.log("in iteration");
				console.log(XMIOccurrences);
				var preNode = startNode;
//				var nextNode = null;
				for(var j= 0; j<XMIOccurrences.length;){
					var XMIOccurrence = XMIOccurrences[j++];
//					XMIUseCase.Nodes.push(XMIOccurence);
					
					if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
					var XMIOccurrence1 = XMIOccurrence;
					var XMILifeline = XMILifelinesByID[XMIOccurrence1.$.covered];
					XMIOccurrence1.Lifeline = XMILifeline;
//					XMIOccurrencesByID[XMIOccurrence1['$']['xmi:id']] = XMIOccurrence1;
					
					var XMIOccurrence2 = XMIOccurrences[j++];
					var XMILifeline = XMILifelinesByID[XMIOccurrence2.$.covered];
					XMIOccurrence2.Lifeline = XMILifeline;
//					XMIUseCase.Nodes.push(XMIOccurence2);
					
					var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
					XMIMessages.push(XMIMessage);
					
					console.log(XMIMessage);
					
					var nextNode = {
							type: "message",
							name: XMIMessage['$']['name'],
							id: XMIMessage['$']['xmi:id'],
							attachment: XMIMessage
					};
					

					XMIUseCase.Nodes.push(nextNode);
					XMIUseCase.PrecedenceRelations.push({start: preNode, end: nextNode});
					
					preNode = nextNode;
					}
					else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
						console.log(XMIOccurrence);
						processCombinedFragment(XMIOccurrence, XMIUseCase);
						XMIUseCase.PrecedenceRelations.push({start: preNode, end: XMIOccurrence.startNode});
						preNode = XMIOccurrence.endNode;
					}
				}
				
				console.log("pre node....");
				console.log(preNode);
				// the last node should be connected to the end of the fragment
				XMIUseCase.PrecedenceRelations.push({start: preNode, end: endNode});
				
//				console.log(XMIOccurrencesByID);
				
				XMIOperand.XMIMessages = XMIMessages;
				
//				var XMICombinedFragments = jp.query(XMIOperand, '$..fragment[?(@[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
//				for(var k in XMICombinedFragments){
//					var innerXMICombinedFragment = XMICombinedFragments[k];
//					processCombinedFragment(innerXMICombinedFragment, XMIUseCase);
//					
//				}
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
				XMICombinedFragment.startNode = startNode;
				XMICombinedFragment.endNode = endNode;
//				console.log(XMICombinedFragments);
			}
			else if(XMIFragmentOperator === "loop"){
				XMIUseCase.PrecedenceRelations.push({start: endNode, end: startNode});
				XMICombinedFragment.startNode = startNode;
				XMICombinedFragment.endNode = startNode;
			}
			else if(XMIFragmentOperator === "break"){
				XMICombinedFragment.startNode = startNode;
				// represent that outside edges will both be connected to the start nodes.
				XMICombinedFragment.endNode = startNode;
			}
			else if(XMIFragmentOperator === "opt"){
				XMIUseCase.PrecedenceRelations.push({start: startNode, end: endNode});
				XMICombinedFragment.startNode = startNode;
				XMICombinedFragment.endNode = endNode;
			}
			
		}
		
		var debug = require("../utils/DebuggerOutput.js");
//		debug.writeJson("XMIString", xmiString);
		
		
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
		console.log(XMIUMLModel);
		
//		var components = {};
		
//		var xmiElements = xmiString['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'];
		
		var XMIPackagedElements = [];
		// search for the classes
//		var XMIClasses = jsonQuery("$", {data: XMIUMLModel}).parents.value;

		var XMIClasses = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
		var XMIClassesByStandardizedName = [];
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];
			console.log(XMIClass);
			XMIClassesByStandardizedName[standardizeName(XMIClass.$.name)] = XMIClass;
		}
		console.log(XMIClasses);
//		debug.writeJson("XMIClasses", XMIClasses);
		
		
		//search for the use cases
		var XMIUseCases = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:UseCase\')]');
		console.log(XMIUseCases);
//		debug.writeJson("XMIUseCases", XMIUseCases);
		
//		var processCombinedFragment = function(XMICombinedFragment){
//			
//		}
		
		for(var i in XMIUseCases){
			var XMIUseCase = XMIUseCases[i];
//			console.log(XMIUseCase);
			var XMIInteractions = jp.query(XMIUseCase, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
			XMIUseCase.PrecedenceRelations = [];
			XMIUseCase.Nodes = [];
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
					var XMIClass = XMIClassesByStandardizedName[standardizeName(XMILifeline.$.name)];
					XMILifeline.Class = XMIClass;
					XMILifelinesByID[XMILifeline['$']['xmi:id']] = XMILifeline;
				}
				console.log(XMILifelinesByID);
				XMIUseCase.XMILifelinesByID = XMILifelinesByID;
				
				console.log("message")
				var XMIMessages = jp.query(XMIInteraction, '$..message[?(@[\'$\'][\'xmi:type\']==\'uml:Message\')]');
//				// for each message, identify the send fragment and receive fragment.
				var XMIMessagesByOccurrences = [];
				for(var k in XMIMessages){
					var XMIMessage = XMIMessages[k];
//					console.log("send event");
//					console.log(XMIMessage.$.sendEvent);
//					XMIMessage.sendEvent = XMIOccurrencesByID[XMIMessage.$.sendEvent];
//					XMIMessage.receiveEvent = XMIOccurrencesByID[XMIMessage.$.receiveEvent];
					XMIMessagesByOccurrences[XMIMessage.$.sendEvent+">"+XMIMessage.$.receiveEvent] = XMIMessage;
				}
				console.log(XMIMessages);
				XMIUseCase.XMIMessagesByOccurrences = XMIMessagesByOccurrences;
				
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
						attachment: null
				};
				XMIUseCase.Nodes.push(preNode);
				
				for(var k= 0; k<XMIOccurrences.length;){
					var XMIOccurrence = XMIOccurrences[k++];
					
					if(XMIOccurrence['$']['xmi:type'] === "uml:OccurrenceSpecification"){
						var XMIOccurrence1 = XMIOccurrence;
						console.log(XMIOccurrence1);
						var XMILifeline = XMILifelinesByID[XMIOccurrence1.$.covered];
						XMIOccurrence1.Lifeline = XMILifeline;
						
//						XMIOccurrencesByID[XMIOccurrence1['$']['xmi:id']] = XMIOccurrence1;
						
						var XMIOccurrence2 = XMIOccurrences[k++];
						var XMILifeline = XMILifelinesByID[XMIOccurrence2.$.covered];
						XMIOccurrence2.Lifeline = XMILifeline;
						
						var XMIMessage = XMIMessagesByOccurrences[XMIOccurrence1['$']["xmi:id"]+">"+XMIOccurrence2['$']["xmi:id"]];
//						XMIMessages.push(XMIMessage);
						var nextNode = {
								type: "message",
								name: XMIMessage['$']['name'],
								id: XMIMessage['$']['xmi:id'],
								attachment: XMIMessage
						}

						XMIUseCase.Nodes.push(nextNode);
						
						XMIUseCase.PrecedenceRelations.push({start: preNode, end: nextNode});
						preNode = nextNode;
						
					}
					else if(XMIOccurrence['$']['xmi:type'] === "uml:CombinedFragment"){
						console.log("hello");
						processCombinedFragment(XMIOccurrence, XMIUseCase);
						XMIUseCase.PrecedenceRelations.push({start: preNode, end: XMIOccurrence.startNode});
						preNode = XMIOccurrence.endNode;
					}
				}
//				console.log(XMIOccurrencesByID);
				
				
//				console.log("combined fragment")
//				var XMICombinedFragments = jp.query(XMIInteraction, '$..fragment[?(@[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
//				for(var k in XMICombinedFragments){
//					var XMICombinedFragment = XMICombinedFragments[k];
//					processCombinedFragment(XMICombinedFragment, XMIUseCase);
//				}
//				console.log(XMICombinedFragments);
			}
		}
		

		var XMIProperties = [];
		var XMIOperation = [];
		var XMIParamter = [];
		var XMICollaboration = [];
		var XMIInteraction = [];
		var XMILifeline = [];
		var XMIFragment = [];
		var XMICombinedFragmennt = [];
		var XMIMessage = [];
		var XMIActivity = [];
		var XMIControlFlow = [];
		
		return XMIUseCases;
		
	}

	module.exports = {
			extractModelComponents : extractModelComponents
	}
}());