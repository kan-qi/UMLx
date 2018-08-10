/**
 * This module is for the parser for parse analysis diagram. Auxilliary information needs to be parsed from the extension portion of the xmi file for specific UML modeling tool.
 */
(function() {
	var fs = require('fs');
//	var xml2js = require('xml2js');
//	var parser = new xml2js.Parser();
//	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
//	var domainElementSearchUtil = require("../../utils/DomainElementSearchUtil.js");
	
	function queryExtensionElements(XMIExtension){
		var extensionAnalysisElements = jp.query(XMIExtension, '$..element[?(@[\'$\'][\'xmi:type\']==\'uml:Object\' || @[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		console.log("extension elements");
		console.log(extensionAnalysisElements);
		var extensionAnalysisElementsByID = {};
		for(var i in extensionAnalysisElements){
			var extensionAnalysisElement = extensionAnalysisElements[i];
			extensionAnalysisElementsByID[extensionAnalysisElement['$']['xmi:idref']] = extensionAnalysisElement;
		}
		return extensionAnalysisElementsByID;
	}
	
	function queryUseCaseInExtension(extensionAnalysisElementsByID, UseCaseID){
		console.log(UseCaseID);
		var useCaseElementsInExtensionByID = {};
		var useCaseAssociationsInExtensionByID = {};
		
		for(var i in extensionAnalysisElementsByID){
			var analysisElement = extensionAnalysisElementsByID[i];
			if(analysisElement['model'] && analysisElement['model'][0]['$']['owner'] == UseCaseID){
				console.log("found use case element");
//				useCaseElementsInExtension.push(analysisElement);
				
				var XMIInformationFlows = jp.query(analysisElement, '$..InformationFlow[?(@[\'$\'][\'xmi:id\'])]');
//				for(var j in XMIInformationFlows){
//					var XMIInformationFlow = XMIInformationFlows[j];
//					var startElement = extensionAnalysisElementsByID[XMIInformationFlow['$']['start']];
//					var endElement = extensionAnalysisElementsByID[XMIInformationFlow['$']['end']]
//					useCaseAssociationsInExtensionByID[XMIInformationFlow['$']['xmi:id']] = {
//							start: startElement,
//							end: endElement
//					}
//					
//					useCaseElementsInExtensionByID[XMIInformationFlow['$']['start']] = startElement;
//					useCaseElementsInExtensionByID[XMIInformationFlow['$']['end']] = endElement;
//					
//				}
				var XMIAssociations = jp.query(analysisElement, '$..Association[?(@[\'$\'][\'xmi:id\'])]');
				XMIAssociations = XMIAssociations.concat(XMIInformationFlows);
				for(var j in XMIAssociations){
					var XMIAssociation = XMIAssociations[j];
					
					var startElement = extensionAnalysisElementsByID[XMIAssociation['$']['start']];
					var endElement = extensionAnalysisElementsByID[XMIAssociation['$']['end']]
					useCaseAssociationsInExtensionByID[XMIAssociation['$']['xmi:id']] = {
							start: startElement,
							end: endElement
					}
					
					useCaseElementsInExtensionByID[XMIAssociation['$']['start']] = startElement;
					useCaseElementsInExtensionByID[XMIAssociation['$']['end']] = endElement;
				}
			}
		}
		
		var useCaseInExtension = {
			useCaseElementsByID: useCaseElementsInExtensionByID,
			useCaseAssociationsByID: useCaseAssociationsInExtensionByID
		}
		

//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("use_case_extension_elements"+UseCaseID, useCaseInExtension);
		
		return useCaseInExtension;
	}
	
//	function matchComponent(activityName, DomainElementsBySN){
//		//flatout the domainModel
//		
//		var domainElementStrings = [];
//		var domainElementsByString = {};
//		for(var i in DomainElementsBySN){
//			var domainElement = DomainElementsBySN[i];
//			var stringRepresentation = i;
//			for(var j in domainElement.Operations){
//				var operation = domainElement.Operations[j];
//				stringRepresentation += operation.Name;
//			}
//			domainElementStrings.push(stringRepresentation);
//			domainElementsByString[stringRepresentation] = domainElement;
//		}
//		
//		console.log(activityName);
//		console.log(DomainElementsBySN);
//		console.log(domainElementStrings);
//		
//		var matchedDomainElement = {};
//		if(domainElementStrings.length>0){
//		var matches = stringSimilarity.findBestMatch(activityName, domainElementStrings);
//		matchedDomainElement = domainElementsByString[matches.bestMatch.target];
//		}
//		
//		console.log(matchedDomainElement);
//		
//		var operations = [];
//		for(var i in matchedDomainElement.Operations){
//			var operation = matchedDomainElement.Operations[i];
//			operations.push(operation.Name);
//		}
//		
//		console.log(operations);
//		
//		var matchedOperation = ""
//		if(operations.length > 0){
//		var operationMatches = stringSimilarity.findBestMatch(activityName, operations);
//		matchedOperation = operationMatches.bestMatch.target;
//		}
//		
//		return {
//			component: matchedDomainElement,
//			method: matchedOperation
//		}
//
//	}
	
	function parseAnalysisDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, XMIExtension, XMIUMLModel){
		console.log("parse analysis diagram");
		// search for the instance specifications that are used to represent the robustness diagrams.
		
		// two steps to establish the association between the elements and the use cases.
		// 1. use the use case UUID to identify the extension element Use Case.
		// 2. use the UUID to reference related elements in the extension and identify the elements from the packaged elements array.
		
		var Activities = [];
		var PrecedenceRelations = [];
		
		var ActivitiesByID = [];
		var XMIInstanceSpecificationsByID = {};

		var Objects = [];
		var Dependencies = [];
		
		//the nested chacking has not succeeded
//		console.log('$..element[?(@.model[?(@.$.owner ==\''+UseCase._id+'\')])]');
//		var extensionElements = jp.query(XMIExtension, '$..element[?(@.model[?(@.$.owner ==\''+UseCase._id+'\')])]');

//		var extensionElements = jp.query(XMIExtension, '$..element[?(@[\'model\'][\'$\'][\'owner\']==\''+UseCase._id+'\')]');
		
		var extensionElementsByID = queryExtensionElements(XMIExtension);
		var extensionUseCase = queryUseCaseInExtension(extensionElementsByID, UseCase._id);
		
		console.log("check extension elements");
		console.log("expanding the elements to the ones that are not in the package");
		console.log(extensionUseCase);
//		console.log(XMIExtension[0]['elements']);
		for(var i in extensionUseCase.useCaseElementsByID){
			var extensionElementByUseCase = extensionUseCase.useCaseElementsByID[i];
			
			if(!extensionElementByUseCase){
				continue;
			}
			
			var XMIInstanceSpecification = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:id\']==\''+extensionElementByUseCase['$']['xmi:idref']+'\')]')[0];
//			XMIInstanceSpecifications = XMIInstanceSpecifications.concat(jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]'));
			console.log("checking derived instance specification");
			console.log(XMIInstanceSpecification);
			XMIInstanceSpecificationsByID[XMIInstanceSpecification['$']['xmi:id']] = XMIInstanceSpecification;
			
//			var XMISpecificationType = jp.query(XMIInstanceSpecification, '$..type[?(@[\'$\'][\'xmi:idref\'])]');
			
			
			var type = "Object";
			if(CustomProfiles[XMIInstanceSpecification['$']['xmi:id']]){
				type = CustomProfiles[XMIInstanceSpecification['$']['xmi:id']];
			}
			

			if(XMIInstanceSpecification['$']['xmi:type'] === "uml:Actor"){
				type = "Actor";
			}
			
			var Object = {
					id: XMIInstanceSpecification['$']['xmi:id'],
					name: XMIInstanceSpecification['$']['name'],
					type: type
			}
			
			Objects.push(Object);
			
			// each object is actually a domain element
			DomainElementsBySN[standardizeName(Object.name)] = {
					_id: Object.id,
					Name: Object.name,
					Type: Object.type,
					Operations: [],
					Attributes: []
			};
		}
		
		console.log("check instance specifications");
		console.log(XMIInstanceSpecificationsByID);
		

//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("use_case_objects_"+UseCase._id, Objects);
		
		console.log("construct the graph based on the associations");
		for(var i in extensionUseCase.useCaseAssociationsByID){
			var extensionAssociationByUseCase = extensionUseCase.useCaseAssociationsByID[i];
			
			if(!extensionAssociationByUseCase || !extensionAssociationByUseCase.start || !extensionAssociationByUseCase.end){
				continue;
			}
			
//			var XMIInstanceSpecification = XMIInstanceSpecificationsByID[i];
//			console.log(XMIUseCase);
//			console.log("XMIInstanceSpecifications");
//			var ConnectedXMIInstanceSpecifications = jp.query(XMIInstanceSpecification, '$..type[?(@[\'$\'][\'xmi:idref\'])]');
//			XMIAttributesByID = [];
			
//			console.log(ConnectedXMIInstanceSpecifications);
//			var startComponent = ActivitiesByID[XMIInstanceSpecification['$']['xmi:id']];
			
//			for(var j in ConnectedXMIInstanceSpecifications){
//				var ConnectedXMIInstanceSpecificationID = ConnectedXMIInstanceSpecifications[j]['$']['xmi:idref'];
				var XMIInstanceSpecification = XMIInstanceSpecificationsByID[extensionAssociationByUseCase.start['$']['xmi:idref']];
				var ConnectedXMIInstanceSpecification = XMIInstanceSpecificationsByID[extensionAssociationByUseCase.end['$']['xmi:idref']];
					
//					var component = DomainElementsBySN[standardizeName(ConnectedXMIInstanceSpecification['$']['name'])]
					
					//matching with components
					
//					var matchedResult = domainElementSearchUtil.matchComponent(standardizeName(ConnectedXMIInstanceSpecification['$']['name']), DomainElementsBySN);
//				
//					if(!matchedResult.component){
//						matchedResult.component = {};
//					}
				
					//components are identified from domain elements
					var component = DomainElementsBySN[standardizeName(ConnectedXMIInstanceSpecification['$']['name'])];
					
//					var component = matchedResult.component;
					if(!component){
						component = {
							_id: ConnectedXMIInstanceSpecification['$']['xmi:id'],
							Name: ConnectedXMIInstanceSpecification['$']['name'],
							Operations: [],
							Attributes: []
						};
					}
				
					
					component.Type = CustomProfiles[ConnectedXMIInstanceSpecification['$']['xmi:id']];
					
					var activity = {
							Type: "instanceSpecificationCall",
							Name: XMIInstanceSpecification['$']['name']+":"+ConnectedXMIInstanceSpecification['$']['name'],
							_id: XMIInstanceSpecification['$']['xmi:id']+"___"+ConnectedXMIInstanceSpecification['$']['xmi:id'],
//							Attachment: XMIInstanceSpecification,
							Group: "System",
							OutScope: false,
							Component:  component,
//							MatchedMethod: matchedResult.method
					}
					
					//decide the reponse node and group.
					if(XMIInstanceSpecification['$']['xmi:type'] === "uml:Actor"){
						activity.isResponse = true;
						activity.stimulusGroup = XMIInstanceSpecification['$']['name'];
					}
					
					if(ConnectedXMIInstanceSpecification['$']['xmi:type'] === "uml:Actor"){
						activity.Group = XMIInstanceSpecification['$']['name'];
						if(activity.Component){
						activity.Component.Type = "actor";
						}
					}
					
					Activities.push(activity);
					Dependencies.push({
						start:XMIInstanceSpecification['$']['xmi:id'],
						end: ConnectedXMIInstanceSpecification['$']['xmi:id']
					});
//				}
//			}
			console.log("checking robustness details");
			console.log(Objects);
			//throw "objects checing da ting";
			console.log(Dependencies);
			
		}
		
		var Stimuli = [];
		for(var i in Activities){
			var activity = Activities[i];
			for(var j in Activities){
				var activityToIt = Activities[j];
				if(activity._id.split('___')[1] === activityToIt._id.split('___')[0]){
					PrecedenceRelations.push({start: activity, end: activityToIt});
				}
			}
			
			if(activity.isResponse){
				//create a stimulus nodes for the activity.
				var stimulus = {
						Type: "Stimulus",
						Name: "stl#"+activity.Name,
						_id: activity._id+"_STL",
//						Attachment: XMIActivity,
						Stimulus: true,
						OutScope: false,
						Group:  activity.stimulusGroup
				}
				
				Stimuli.push(stimulus);
				PrecedenceRelations.push({start: stimulus, end: activity});
			}
		}
		
		Activities = Activities.concat(Stimuli);
		

		console.log(PrecedenceRelations);
		
//		UseCase.Components = null;
		

//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("use_cas_parsed_"+UseCase._id, UseCase);
		
		
//		console.log("checking analysis activities");
//		console.log(Activities);
//		console.log(PrecedenceRelations);
	

//		const drawer = require('../../model_drawers/UserSystemInteractionModelDrawer.js')
		
		//Aishwarya

		if(Activities.length > 0){
	
//		const drawer = require('../../model_drawers/UserSystemInteractionModelDrawer.js')
		drawRobustnessDiagram({Objects:Objects, Dependencies: Dependencies}, UseCase, UseCase.OutputDir+"/robustness_diagram.dotty", () => {
			console.log('Aishwarya drew the diagram.');
		});
		}

		UseCase.Activities = UseCase.Activities.concat(Activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(PrecedenceRelations);
/* 		 drawRobustnessDiagram({
			Objects:Objects,
			Dependencies: Dependencies
		}, UseCase, UseCase.OutputDir+"/uml_diagram.svg", () => {
			console.log("outputting analysis diagram is finished.");
		});  */
	}
	

	function drawBoundaryNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
		<TR><TD><IMG SRC="img/boundary3.png"/></TD></TR>\
	 <TR><TD>'+label+'</TD></TR>\
	</TABLE>>];';
	}

	function drawControlNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
		<TR><TD><IMG SRC="img/control1.png"/></TD></TR>\
	 <TR><TD>'+label+'</TD></TR>\
	</TABLE>>];';
	}

	function drawEntityNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
		<TR><TD><IMG SRC="img/entity1.png"/></TD></TR>\
	 <TR><TD>'+label+'</TD></TR>\
	</TABLE>>];';
	}

		function drawNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" WIDTH="20">\
		<TR><TD><IMG SRC="img/activity_icon.png"/></TD></TR>\
	 <TR><TD><B>'+label+'</B></TD></TR>\
	</TABLE>>];';
}

	function drawActorNode(id, label){
	return id+'[label=<\
		<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
		<TR><TD><IMG SRC="img/actor1.png"/></TD></TR>\
	 <TR><TD>'+label+'</TD></TR>\
	</TABLE>>];';
	}
	//Aishwarya

/*
		const UseCaseRobust = {
		Objects: [
			{
				id: 1,
				name: 'Actor1',
				type: 'Actor'
			},
			{
				id: 2,
				name: 'Buy tickets interface',
				type: 'Boundary'
			},
			{
				id: 3,
				name: 'Payments success message',
				type: 'Boundary'
			},
			{
				id: 4,
				name: 'Pay the bill',
				type: 'Control'
			},
			{
				id: 5,
				name: 'Save bill records',
				type: 'Entity'
			}
		],
		Dependencies: [
			{
				start: 1,
				end: 2
			},
			{
				start: 1,
				end: 3
			},
			{
				start: 2,
				end: 4
			},
			{
				start: 4,
				end: 3
			},
			{
				start: 4,
				end: 5
			}
		]
	};*/

	//update the variables to the correct names.
		function drawRobustnessDiagram(Components, UseCase, graphFilePath, callbackfunc) {
  		UseCase.DiagramType = "robustness_diagram";
		let objects = Components.Objects;
		let dependencies = Components.Dependencies;
		let graph = 'digraph g {\
			fontsize=26\
			rankdir="LR"\
			node [shape=plaintext fontsize=24]\
		';
		let drawnObjects = [];
		function DottyDraw() {
			this.drawnObjects = [];
			this.draw = function(dottyObject) {
				if(drawnObjects[dottyObject]){
					return "";
				}
				else{
					drawnObjects[dottyObject] = 1;
					return dottyObject;
				}
			}
		}
		var dottyDraw = new DottyDraw();
		
		objects.forEach((_object) => {
			var node;
			switch(_object.type)
			{
				case "Actor":
					node = drawActorNode(_object.id, _object.name);
					break;
				case "boundary":
					node = drawBoundaryNode(_object.id, _object.name);
					break;
				case "control":
					node = drawControlNode(_object.id, _object.name);
					break;
				case "Object":
					node = drawEntityNode(_object.id, _object.name);
					break;
				default:
					node = drawNode(_object.id, _object.name);
					break;
			}
			
			graph += dottyDraw.draw(node);
		});

		dependencies.forEach((_dependency) => {
			var start = _dependency.start;
			var end = _dependency.end;
			graph += dottyDraw.draw('"'+start+'"->"'+end+'";');
		});

		//graph += 'imagepath = \"./\"}';
		var graphImagePathVariableToWriteAfterTheOtherThingIsWritten = 'imagepath = \"./\"}';
		dottyUtil = require("../../utils/DottyUtil.js");
		//dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
		//	console.log("drawing is down");
		//});
		fs.writeFile(
			graphFilePath,
			graph,
			() => fs.appendFile(
					graphFilePath,
					graphImagePathVariableToWriteAfterTheOtherThingIsWritten,
					() => {
						//the following line is actually useless
						graph += graphImagePathVariableToWriteAfterTheOtherThingIsWritten;
						dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
							console.log("Augmented graph and generated svg`");
						});
					})
		);
		return graph;
	}
 
	function standardizeName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}
	
	module.exports = {
			parseAnalysisDiagram: parseAnalysisDiagram
	}
}());
