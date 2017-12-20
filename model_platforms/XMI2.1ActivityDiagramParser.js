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
			var XMIActivities = jp.query(XMIUseCase, '$.ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\') || $.node[?(@[\'$\'][\'xmi:type\']==\'uml:*\')]');
			XMIUseCase.Nodes = [];
			NodesByID = [];
			
			
//			console.log("xmi interactions");
			console.log(XMIActivities);
			for(var j in XMIActivities){
				var XMIActivity = XMIActivities[j];
//				console.log(XMIActivity);
//				var XMILifelines = jp.query(XMIActivity, '$..lifeline[?(@[\'$\'][\'xmi:type\']==\'uml:Lifeline\')]');
				if(XMIActivity.name === "EA_Activity1")	{
					//Ea specific structure.
					console.log("continue");
				}
				else{
					var node = {
							type: "activity",
							name: XMIActivity['$']['name'],
							id: XMIActivity['$']['xmi:id'],
							attachment: XMIActivity
					}
					
					XMIUseCase.Nodes.push(node);
					NodesByID[XMIActivity['$']['xmi:id']] = node;
				}
			}
			
			var XMIEdges = jp.query(XMIUseCase, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]');
			XMIUseCase.PrecedenceRelations = [];
			
			
//			console.log("xmi interactions");
			console.log(XMIEdges);
			for(var j in XMIEdges){
				var XMIEdge = XMIEdges[j];
//				console.log(XMIEdge);
//				var XMILifelines = jp.query(XMIEdge, '$..lifeline[?(@[\'$\'][\'xmi:type\']==\'uml:Lifeline\')]');
				
				var sourceNode = NodesByID[XMIEdge['$']['source']];
				var targetNode = NodesByID[XMIEdge['$']['target']];
				XMIUseCase.PrecedenceRelations.push({start: sourceNode, targetNode});
			}
		}
		

		var XMIProperties = [];
		var XMIOperation = [];
		var XMIParamter = [];
		var XMICollaboration = [];
		var XMIActivity = [];
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