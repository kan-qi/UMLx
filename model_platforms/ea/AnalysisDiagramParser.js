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
		var extensionAnalysisElements = jp.query(XMIExtension, '$..element[?(@[\'$\'][\'xmi:type\']==\'uml:Object\' || @[\'$\'][\'xmi:type\']==\'uml:Abject\')]');
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
	
	function parseAnalysisDiagram(UseCase, XMIUseCase, DomainElementsBySN, XMIExtension, XMIUMLModel){
		console.log("parse analysis diagram");
		// search for the instance specifications that are used to represent the robustness diagrams.
		
		// two steps to establish the association between the elements and the use cases.
		// 1. use the use case UUID to identify the extension element Use Case.
		// 2. use the UUID to reference related elements in the extension and identify the elements from the packaged elements array.

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
					
					var isStimulus = false;
					var group = "System";
					if(XMIInstanceSpecification['$']['xmi:type'] === "uml:Actor"){
						isStimulus = true;
						group = "User";
					}
					
					var activity = {
							Type: "instanceSpecificationCall",
							Name: XMIInstanceSpecification['$']['name']+":"+ConnectedXMIInstanceSpecification['$']['name'],
							_id: XMIInstanceSpecification['$']['xmi:id']+":"+ConnectedXMIInstanceSpecification['$']['name'],
//							Attachment: XMIInstanceSpecification,
							Stimulus: isStimulus,
							Group: group,
							OutScope: false,
							Component: DomainElementsBySN[standardizeName(ConnectedXMIInstanceSpecification['$']['name'])]
					}
					
					UseCase.Activities.push(activity);
//				}
			}
			
			for(var i in UseCase.Activities){
				var activity = UseCase.Activities[i];
				for(var j in UseCase.Activities){
					var activityToIt = UseCase.Activities[j];
					if(activity._id.split(':')[1] === activityToIt._id.split(':')[0]){
						UseCase.PrecedenceRelations.push({start: activity, end: activityToIt});
					}
				}
			}
			
			console.log(UseCase.PrecedenceRelations);
		}
	}
	

	function standardizeName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}
	
	module.exports = {
			parseAnalysisDiagram: parseAnalysisDiagram
	}
}());