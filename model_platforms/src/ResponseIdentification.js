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
	var codeAnalysis = require("./CodeAnalysis.js");

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	function identifyResponse(codeAnalysisResults, responsePatternsFilePath){
		var dicMethodUnits = codeAnalysisResults.dicMethodUnits;
		var methodPatterns = ['main'];
		var parameterTypePatterns = ['event', 'Event'];
		var parameterPatterns = ['event'];
		
		var scannedMethods = [];
		
		if (responsePatternsFilePath && fs.existsSync(responsePatternsFilePath)) {
		 
		var contents = fs.readFileSync(responsePatternsFilePath, 'utf8');
		
//		console.log(contents);
		
		if(contents){
		var lines = contents.split(/\r?\n/g);
		 
	    for(var i = 0;i < lines.length;i++){
	        //code here using lines[i] which will give you each line
	    	var line = lines[i];
	    	
	    	var segs = line.split(/ /g);
	    	
	    	if(segs.length == 2){
	    		var type = segs[0];
	    		if(type === "method"){
	    			methodPatterns.push(segs[1]);
	    		}
	    		else if(type === "param"){
	    			parameterPatterns.push(segs[1]);
	    		}
	    		else if(type === "param-type"){
	    			parameterTypePatterns.push(segs[1]);
	    		}
	    	}
	    }
		}
		   // Do something
		}
		
		console.log("method patterns");
		console.log(methodPatterns);
		console.log("parameter type patterns");
		console.log(parameterTypePatterns);
		console.log("parameter patterns");
		console.log(parameterPatterns);
		
		for(var i in dicMethodUnits){
			var methodUnit = dicMethodUnits[i];
//			
//
//			if(methodUnit.name === "main"){
//				MethodUnit.isResponse = true;
//			}
//			
			for(var j in methodPatterns){
				if(methodUnit.Signature.name.match(methodPatterns[j])){
					methodUnit.isResponse = true;
					break;
				}	
			}
			
			if(methodUnit.isResponse){
				continue;
			}
			
			for(var j in methodUnit.parameterUnits){
				var parameterUnit = methodUnit.parameterUnits[j];
//				if(parameterUnit.type.indexOf("event") !=-1 || parameterUnit.type.indexOf("Event") !=-1) {
//						MethodUnit.isResponse = true;
//						console.log("found response method");
//				}
				
				for(var k in parameterPatterns){
					var parameterPattern = parameterPatterns[k];
					if(parameterUnit.name.match(parameterPattern)){
						methodUnit.isResponse = true
						break;
					}
				}
				
				if(methodUnit.isResponse){
					break;
				}
				
				for(var k in parameterTypePatterns){
					var parameterTypePattern = parameterTypePatterns[k];
					if(parameterUnit.type.name.match(parameterTypePattern)){
						methodUnit.isResponse = true
						break;
					}
				}
				

				if(methodUnit.isResponse){
					break;
				}
			}
		}
		
		
		for(var i in dicMethodUnits){
			var methodUnit = dicMethodUnits[i];
			scannedMethods.push({method: methodUnit.Signature.name, isResponse: methodUnit.isResponse});
			
		}
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("identifiedMethods", scannedMethods);
	}
		
	
	module.exports = {
			identifyResponse : identifyResponse,
	}
}());
