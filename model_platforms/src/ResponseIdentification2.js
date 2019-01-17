/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * This module implements the xml file generated from gator which identify instances of listeners.
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var codeAnalysis = require("./CodeAnalysis.js");

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	function identifyResponse(codeAnalysisResults, UIHierFilePath){
		
		var dicMethodUnits = codeAnalysisResults.dicMethodUnits;
		
		var scannedMethods = [];
		
		if (responsePatternsFilePath && fs.existsSync(responsePatternsFilePath)) {
		 
		var UIHierStr = fs.readFileSync(UIHierFilePath, 'utf8');
		
		var handlers = jp.query(UIHierStr, '$..EventAndHandler[?(@[\'$\'][\'realHandler\'])]');
		

		var dicResponseMethodUnits = {};
		
//		console.log(contents);
		
		for(var i in handlers){
			var handler = handlers[i];
			var invokerLocation = handler['$']['realHandler'].replace(/\&lt;/g, "").replace(/\$gt;/g, "");
			var classMethod = invokerLocation.split(": ");
			var className = classMethod[0];
			var methodName = classMethod[1];
			
			dicMethodUnits[methodName].isResponse = true;
			
			dicResponseMethodUnits[methodUnit.UUID] = dicMethodUnits[methodName];
		}
		
		
//		for(var i in dicMethodUnits){
//			var methodUnit = dicMethodUnits[i];
////			
////
////			if(methodUnit.name === "main"){
////				MethodUnit.isResponse = true;
////			}
////			
////			for(var j in methodPatterns){
////				if(methodUnit.Signature.name.match(methodPatterns[j])){
////					methodUnit.isResponse = true;
////					break;
////				}	
////			}
//			
//			if(methodUnit.isResponse){
//				dicResponseMethodUnits[methodUnit.UUID] = methodUnit;
//				continue;
//			}
//			
//			for(var j in methodUnit.parameterUnits){
//				var parameterUnit = methodUnit.parameterUnits[j];
////				if(parameterUnit.type.indexOf("event") !=-1 || parameterUnit.type.indexOf("Event") !=-1) {
////						MethodUnit.isResponse = true;
////						console.log("found response method");
////				}
//				
//				for(var k in parameterPatterns){
//					var parameterPattern = parameterPatterns[k];
//					if(parameterUnit.name.match(parameterPattern)){
//						methodUnit.isResponse = true
//						break;
//					}
//				}
//				
//				if(methodUnit.isResponse){
//					dicResponseMethodUnits[methodUnit.UUID] = methodUnit;
//					break;
//				}
//				
//				for(var k in parameterTypePatterns){
//					var parameterTypePattern = parameterTypePatterns[k];
//					if(parameterUnit.type.name.match(parameterTypePattern)){
//						methodUnit.isResponse = true
//						break;
//					}
//				}
//				
//
//				if(methodUnit.isResponse){
//					dicResponseMethodUnits[methodUnit.UUID] = methodUnit;
//					break;
//				}
//			}
//		}
		
		
//		for(var i in dicMethodUnits){
//			var methodUnit = dicMethodUnits[i];
//			scannedMethods.push({method: methodUnit.Signature.name, isResponse: methodUnit.isResponse});
//			
//		}
		
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("identifiedMethods", scannedMethods);
		
		return dicResponseMethodUnits;
	}
		
	
	module.exports = {
			identifyResponse : identifyResponse,
	}
}());
