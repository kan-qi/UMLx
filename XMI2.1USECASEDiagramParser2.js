/**
 * This module is used to parse different XMI modelf files.
 */
(function() {
//	var fs = require('fs');
//	var xml2js = require('xml2js');
//	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query')
	var jp = require('jsonpath')

	
	function extractUseCaseModel(xmiString) {
		
		var debug = require("../utils/DebuggerOutput.js");
		
		
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
		console.log(XMIUMLModel);
		
		console.log("start parsing");		
		
		//search for the use cases
		var XMIUseCases = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:UseCase\')]');
		var XMIActors = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		console.log(XMIUseCases);
		var NumberOfCase = 0;
		var NumberOfActor = 0;
		var NumberOfRole = 0;
		var XMLRoles = [];
		var AverageNumberActor = 0;
		var AverageNumberRole = 0;
		for(var i in XMIUseCases){
			var XMIUseCase = XMIUseCases[i];
			NumberOfCase++;
//			
		}
		for(var i in XMLActors){
			NumberOfActor++;
			if(!XMLRoles.contains(XMLActors[i]['$']['name'])){
				XMLRoles.concat(XMLActors[i]['$']['name']);
				NumberOfRole++;
			}
		}
		
	   if(NumberOfCase != 0) {
         AverageNumberActor = NumberOfActor / NumberOfCase;
         AverageNumberRole = NumberOfRole / NumberOfCase;
	   }
		return XMIUseCases;
		
	}
	function contains(arr, obj) {  
	    var i = arr.length;  
	    while (i--) {  
	        if (arr[i] === obj) {  
	            return true;  
	        }  
	    }  
	    return false;  
	}  

	module.exports = {
			extractUseCaseModel : extractUseCaseModel
	}
}());