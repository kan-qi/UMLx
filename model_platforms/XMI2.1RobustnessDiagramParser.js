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
		
		var debug = require("../utils/DebuggerOutput.js");
//		debug.writeJson("XMIString", xmiString);
		
		
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
		console.log(XMIUMLModel);
		
//		var components = {};
		
//		var xmiElements = xmiString['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'];
		
		var XMIPackagedElements = [];
		// search for the classes
//		var XMIClasses = jsonQuery("$", {data: XMIUMLModel}).parents.value;
		
		console.log("start parsing");

//		var XMIClasses = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
//		var XMIClassesByStandardizedName = [];
//		for(var i in XMIClasses){
//			var XMIClass = XMIClasses[i];
//			console.log(XMIClass);
//			XMIClassesByStandardizedName[standardizeName(XMIClass.$.name)] = XMIClass;
//		}
//		console.log(XMIClasses);
//		debug.writeJson("XMIClasses", XMIClasses);
		
		//<packagedElement xmi:type="uml:InstanceSpecification"
		//search for the use cases
		var XMIInstanceSpecifications = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:InstanceSpecification\')]');
		console.log(XMIInstanceSpecifications);
//		debug.writeJson("XMIUseCases", XMIUseCases);
		
//		var processCombinedFragment = function(XMICombinedFragment){
//			
//		}
		XMIInstanceSpecificationsByID = [];
		XMIUMLModel.Nodes = [];
		XMIUMLModel.PrecedenceRelations = [];
		NodesByID = [];
		
		// to create the node for each instance specification.
		// to create the index for each instance specification by id.
		for(var i in XMIInstanceSpecifications){
			var XMIInstanceSpecification = XMIInstanceSpecifications[i];

			var node = {
					type: "instanceSpecification",
					name: XMIInstanceSpecification['$']['name'],
					id: XMIInstanceSpecification['$']['xmi:id'],
					attachment: XMIInstanceSpecification
			}
			
			
			NodesByID[node.id] = node;
			
			XMIUMLModel.Nodes.push(node);
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
				
				XMIUMLModel.PrecedenceRelations.push({start: startNode, end: endNode});
				
//				console.log(XMIAttribute);
//				var XMILifelines = jp.query(XMIAttribute, '$..lifeline[?(@[\'$\'][\'xmi:type\']==\'uml:Lifeline\')]');
			}
			
//			var XMIEdges = jp.query(XMIUseCase, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]')
			
			console.log(XMIUMLModel.PrecedenceRelations);
		}
		

		var XMIProperties = [];
		var XMIOperation = [];
		var XMIParamter = [];
		var XMICollaboration = [];
		var XMIAttribute = [];
		var XMILifeline = [];
		var XMIFragment = [];
		var XMICombinedFragmennt = [];
		var XMIMessage = [];
		var XMIAttribute = [];
		var XMIControlFlow = [];
		
		return [XMIUMLModel];
		
	}

	module.exports = {
			extractModelComponents : extractModelComponents
	}
}());