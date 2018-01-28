/**
 * This module is for the parser for parse analysis diagram. Auxilliary information needs to be parsed from the extension portion of the xmi file for specific UML modeling tool.
 */
(function() {
	var fs = require('fs');
//	var xml2js = require('xml2js');
//	var parser = new xml2js.Parser();
//	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function parseAnalysisDiagram(UseCase, XMIUseCase, XMIClassesByStandardizedName, DomainElementsByID, XMIExtension){
		console.log("checking problem");
		// search for the instance specifications that are used to represent the robustness diagrams.
		
		// two steps to establish the association between the elements and the use cases.
		// 1. use the use case UUID to identify the extension element Use Case.
		// 2. use the UUID to reference related elements in the extension and identify the elements from the packaged elements array.

		var ActivitiesByID = [];
		var XMIInstanceSpecifications =[];
		var extensionElements = jp.query(XMIExtension, '$.element[?(@[\'model\'][\'$\'][\'package\']==\''+UseCase._id+'\')]');
		for(var i in extensionElements){
			var extensionElement = extensionElements[i];

			var XMIInstanceSpecification = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:id\']==\''+extensionElement['$']['idref']+'\')]')[0];
//			XMIInstanceSpecifications = XMIInstanceSpecifications.concat(jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]'));
			console.log("checking derived instance specification");
			console.log(XMIInstanceSpecification);
			
			XMIInstanceSpecifications.push(XMIInstanceSpecification);
//			var XMIInstanceSpecificationsByID = [];
			
			if(XMIInstanceSpecification){
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
//						Attachment: XMIInstanceSpecification,
						Stimulus: isStimulus,
						Group: group,
						OutScope: false
				}
				
				ActivitiesByID[activity._id] = activity;
				UseCase.Activities.push(activity);
			}
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
	}
	
	module.exports = {
			parseAnalysisDiagram: parseAnalysisDiagram
	}
}());