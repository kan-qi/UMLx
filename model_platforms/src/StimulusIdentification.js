/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
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
	var codeAnalysis = require("./codeAnalysis.js");

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	var xmiSring = "";
	
	function identifyStimuli(components, classes, relations, callbackfunc) {

//		var XMISignature = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Signature\')]')[0];
//		if(XMISignature){
//		var XMIParameters = jp.query(XMISignature, '$.parameterUnit[?(@[\'$\'][\'type\'])]');
//		
////		MethodUnit.UUID = XMISignature['$']['name'];
//		MethodUnit.Signature = {
//				name: XMISignature['$']['name'],
//				parameterUnits: []
//		};
//		
//		console.log("iterate signature");
//		
//		for(var j in XMIParameters){
//			console.log("iterate parameters");
//			MethodUnit.Signature.parameterUnits.push({
//				name: XMIParameters[j]["$"]["name"],
//				kind: XMIParameters[j]['$']['kind']
//			});
////			MethodUnit.key += "_"+ XMIParameters[j]["$"]["name"]+"_"+XMIParameters[j]["$"]["kind"];
//			
//			var XMIParameterType = jp.query(xmiString, convertToJsonPath(XMIParameters[j]["$"]['type']));
//			console.log("parameter type");
//			console.log(XMIParameterType);
//			if(XMIParameterType){
//				if(XMIParameterType[0]['$']['name'].indexOf("event") !=-1 || XMIParameterType[0]['$']['name'].indexOf("Event") !=-1) {
//					MethodUnit.isResponse = true;
//					console.log("found response method");
//				}
//			}
//			
//			
//		}
//		
//
//		if(XMISignature["$"]["name"] === "main"){
//			MethodUnit.isResponse = true;
//		}
//		
//		}
//		
	}
	
	
function identifyStimulus(xmiString){
		
		var XMIMethods = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
		var stimuli = [];
		for(var i in XMIMethods){
			var XMIMethod = XMIMethods[i];
			var XMIParameters = jp.query(XMIMethod, '$..parameterUnit[?(@[\'$\'][\'type\'])]');
			
			for(var j in XMIParameters){
				var XMIParameter = XMIParameters[j];
				var XMIParameterType = jp.query(xmiString, convertToJsonPath(XMIParameter["$"]['type']));
				console.log("parameter type");
				console.log(XMIParameterType);
				if(XMIParameterType){
					if(XMIParameterType[0]['$']['name'].indexOf("event") !=-1 || XMIParameterType[0]['$']['name'].indexOf("Event") !=-1) {
						var stimulus = {
								name: XMIMethod['$']['name']
						}
						
						stimuli.push(stimulus);
						continue;
					}
				}
			}
			
			
		}
		
		
		
		console.log("stimuli");
		console.log(stimuli);
		
		return stimuli;
	}


function isResponseClass(ClassUnit){
	for(var i in ClassUnit.MethodUnits){
		if(ClassUnit.MethodUnits[i].isResponse){
			return true;
		}
	}
	return false;
}

	
	
	module.exports = {
			identifyStimuli : identifyStimuli,
	}
}());
