/**
 * This module is used to parse different elements related to Class Diagram in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function standardizeName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}


	function parseClassDiagram(XMIUMLModel, Model, callbackfunc){
//		fs.readFile(filePath, function(err, data) {
//			parser.parseString(data, function(err, xmiString) {
		
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("XMIString", xmiString);
//		console.log(xmiString);
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
//        var Model = {
//				Elements: [],
//				Edges:[]
//		};
		
		
		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');	
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];
			
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
			
            var XMIClassesByStandard = {
				_id: XMIClass['$']['xmi:id'],
				Name: XMIClass['$']['name'],
				Operations: operations,
				Attributes: attributes
			};
				Model.DomainModel.Elements.push(XMIClassesByStandard);
		}
	
      
       var XMIActivities = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
	   console.log(XMIActivities);
	   var XMIEdges = [];
	   for(var i in XMIActivities){
			 var XMIActivity = XMIActivities[i];		
			 XMIEdges = XMIEdges.concat(jp.query(XMIActivity, '$..["edge"][?(@["$"])]').map((obj) => {obj.type="uml:ControlFlow"; return obj;}));	
			 XMIEdges = XMIEdges.concat(jp.query(XMIActivity, '$..["edge"][?(@["$"])]').map((obj) => {obj.type="uml:ObjectFlow"; return obj;}));		
		}
		     console.log(XMIEdges.length);
	
	   for(var i in XMIEdges){
			var XMIEdge = XMIEdges[i];   
			var Edge = {
				_id: XMIEdge['$']['xmi:id'],
				Type:XMIEdge['$']['xmi:type'],
				Source:XMIEdge['$']['source'],
				Target:XMIEdge['$']['target']
			}
			Model.DomainModel.Associations.push(Edge);
		}
		
		console.log("finished class diagram processing");
		if(callbackfunc){
			callbackfunc(Model);
		}
//		});
//		});
	}
	
	module.exports = {
			parseClassDiagram : parseClassDiagram
	}
}());
