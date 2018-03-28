/**
 * This module is for the parser for parse analysis diagram. Auxilliary information needs to be parsed from the extension portion of the xmi file for specific UML modeling tool.
 */
(function() {
	var fs = require('fs');
//	var xml2js = require('xml2js');
//	var parser = new xml2js.Parser();
//	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function queryUseCaseElementsInExtension(XMIExtension, UseCaseID){
		var extensionAnalysisElements = jp.query(XMIExtension, '$..element[?(@[\'$\'][\'xmi:type\']==\'uml:Object\' || @[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		console.log("extension elements");
		console.log(extensionAnalysisElements);
		console.log(UseCaseID);
		var useCaseElementsInExtension = [];
		for(var i in extensionAnalysisElements){
			var analysisElement = extensionAnalysisElements[i];
			if(analysisElement['model'] && analysisElement['model'][0]['$']['owner'] == UseCaseID){
				console.log("found use case element");
				useCaseElementsInExtension.push(analysisElement);
			}
		}
		
		return useCaseElementsInExtension;
	}
	
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
		
		//the nested chacking has not succeeded
//		console.log('$..element[?(@.model[?(@.$.owner ==\''+UseCase._id+'\')])]');
//		var extensionElements = jp.query(XMIExtension, '$..element[?(@.model[?(@.$.owner ==\''+UseCase._id+'\')])]');

//		var extensionElements = jp.query(XMIExtension, '$..element[?(@[\'model\'][\'$\'][\'owner\']==\''+UseCase._id+'\')]');
		
		var extensionElements = queryUseCaseElementsInExtension(XMIExtension, UseCase._id);
		
		console.log("check extension elements");
		console.log(extensionElements);
//		console.log(XMIExtension[0]['elements']);
		for(var i in extensionElements){
			var extensionElement = extensionElements[i];
			var XMIInstanceSpecification = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:id\']==\''+extensionElement['$']['xmi:idref']+'\')]')[0];
//			XMIInstanceSpecifications = XMIInstanceSpecifications.concat(jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]'));
			console.log("checking derived instance specification");
			console.log(XMIInstanceSpecification);
			XMIInstanceSpecificationsByID[XMIInstanceSpecification['$']['xmi:id']] = XMIInstanceSpecification;
		}
		
		console.log("check instance specifications");
		console.log(XMIInstanceSpecificationsByID);
		
		for(var i in XMIInstanceSpecificationsByID){
			var XMIInstanceSpecification = XMIInstanceSpecificationsByID[i];
//			console.log(XMIUseCase);
			console.log("XMIInstanceSpecifications");
			var ConnectedXMIInstanceSpecifications = jp.query(XMIInstanceSpecification, '$..type[?(@[\'$\'][\'xmi:idref\'])]');
//			XMIAttributesByID = [];
			
			console.log(ConnectedXMIInstanceSpecifications);
//			var startComponent = ActivitiesByID[XMIInstanceSpecification['$']['xmi:id']];
			
			for(var j in ConnectedXMIInstanceSpecifications){
				var ConnectedXMIInstanceSpecificationID = ConnectedXMIInstanceSpecifications[j]['$']['xmi:idref'];
				var ConnectedXMIInstanceSpecification = XMIInstanceSpecificationsByID[ConnectedXMIInstanceSpecificationID];
					
					var component = DomainElementsBySN[standardizeName(ConnectedXMIInstanceSpecification['$']['name'])]
					if(!component){
						component = {};
					}
					
					component.Type = CustomProfiles[ConnectedXMIInstanceSpecificationID];
					
					var activity = {
							Type: "instanceSpecificationCall",
							Name: XMIInstanceSpecification['$']['name']+":"+ConnectedXMIInstanceSpecification['$']['name'],
							_id: XMIInstanceSpecification['$']['xmi:id']+"___"+ConnectedXMIInstanceSpecification['$']['xmi:id'],
//							Attachment: XMIInstanceSpecification,
							Group: "System",
							OutScope: false,
							Component: component
					}
					
					//decide the reponse node and group.
					if(XMIInstanceSpecification['$']['xmi:type'] === "uml:Actor"){
						activity.isResponse = true;
						activity.stimulusGroup = XMIInstanceSpecification['$']['name'];
					}
					
					if(ConnectedXMIInstanceSpecification['$']['xmi:type'] === "uml:Actor"){
						activity.Group = XMIInstanceSpecification['$']['name'];
						activity.Component.Type = "actor";
					}
					
					
					Activities.push(activity);
//				}
			}
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
		
		UseCase.Activities = UseCase.Activities.concat(Activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(PrecedenceRelations);
		
		console.log("checking analysis activities");
		console.log(Activities);
		console.log(PrecedenceRelations);
	}
	
		const drawer = require('../../model_drawers/UserSystemInteractionModelDrawer.js')
		
		//Aishwarya
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

		function drawActorNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="img/actor1.png"/></TD></TR>\
		 <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
		}
		//Aishwarya


			const UseCaseRobust = {
			Activities: [
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
			PrecedenceRelations: [
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
		};

		function drawRobustnessDiagram(UseCase, graphFilePath, callbackfunc) {
			let activities = UseCase.Activities;
			let precedenceRelations = UseCase.PrecedenceRelations;
			let graph = 'digraph g {\
				fontsize=26\
				rankdir="LR"\
				node [shape=plaintext fontsize=24]';
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
			
			activities.forEach((_activity) => {
				var node;
				switch(_activity.type)
				{
					case "Actor":
						node = drawActorNode(_activity.id, _activity.name);
						break;
					case "Boundary":
						node = drawBoundaryNode(_activity.id, _activity.name);
						break;
					case "Control":
						node = drawControlNode(_activity.id, _activity.name);
						break;
					case "Entity":
						node = drawEntityNode(_activity.id, _activity.name);
						break;
					default:
						node = drawNode(_activity.id, _activity.name);
						break;
				}
				
				graph += dottyDraw.draw(node);
			});
	
			precedenceRelations.forEach((_precedenceRelation) => {
				var start = _precedenceRelation.start;
				var end = _precedenceRelation.end;
				graph += dottyDraw.draw('"'+start+'"->"'+end+'";');
			});
	
			graph += 'imagepath = \"./\"}';
			dottyUtil = require("../../utils/DottyUtil.js");
			dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
				console.log("drawing is down");
			});
	
			return graph;
		
	

		//const drawer = require('../../model_drawers/UserSystemInteractionModelDrawer.js')
		drawRobustnessDiagram(UseCaseRobust, 'Robuststuff.dotty', () => {
			console.log('Aishwarya drew the diagram.');
		});
	}
 
	function standardizeName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}
	
	module.exports = {
			parseAnalysisDiagram: parseAnalysisDiagram
	}
}());
