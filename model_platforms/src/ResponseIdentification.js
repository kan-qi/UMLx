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
	var codeAnalysisUtil = require("../../utils/CodeAnalysisUtil.js");
	var stringSimilarity = require('string-similarity');
	
	function identifyResponse(codeAnalysisResults, responsePatternsFilePath){
		var dicMethodUnits = codeAnalysisResults.dicMethodUnits;
		var methodPatterns = ['main'];
		var parameterTypePatterns = ['event', 'Event'];
		var parameterPatterns = ['event', 'Event'];

		if (responsePatternsFilePath && fs.existsSync(responsePatternsFilePath)) {
		 
		var contents = fs.readFileSync(responsePatternsFilePath, 'utf8');
		
		if(contents){
		var lines = contents.split(/\r?\n/g);
		 
	    for(var i = 0; i < lines.length; i++){
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
		
		var dicResponseMethodUnits = {};

		var methodSigns = [];
		
		for(var i in dicMethodUnits){
			var methodUnit = dicMethodUnits[i];
			var isResponse = false;

			if(methodUnit.name === "main"){
				MethodUnit.isResponse = true;
			}
	
			for(var j in methodPatterns){
				if(methodUnit.signature.name.match(methodPatterns[j])){
					methodUnit.isResponse = true;
					break;
				}	
			}
			
			if(methodUnit.isResponse){
				dicResponseMethodUnits[methodUnit.UUID] = methodUnit;
				continue;
			}
			
			for(var j in methodUnit.parameterUnits){
				var parameterUnit = methodUnit.parameterUnits[j];
				
				for(var k in parameterPatterns){
					var parameterPattern = parameterPatterns[k];
					if(parameterUnit.name.match(parameterPattern)){
						methodUnit.isResponse = true
						break;
					}
				}
				
				if(methodUnit.isResponse){
					dicResponseMethodUnits[methodUnit.UUID] = methodUnit;
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
					dicResponseMethodUnits[methodUnit.UUID] = methodUnit;
					var methodSign = codeAnalysisUtil.genMethodSignType(methodUnit);
					methodSigns.push(methodSign);
					break;
				}
			}
		}
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson2("identified_reponse_methods", methodSigns);
		
		return dicResponseMethodUnits;
	}
	
	
	function identifyResponseGator(codeAnalysisResults, gatorFilePath){
//		gatorFilePath = "D:/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/AnotherMonitor-release/gator-handlers.txt";
		
		var dicClassUnits = codeAnalysisResults.dicClassUnits;
		var dicMethodUnits = codeAnalysisResults.dicMethodUnits;

		var dicResponseMethodUnits = {};
		
		if (gatorFilePath && fs.existsSync(gatorFilePath)) {
		 
		var contents = fs.readFileSync(gatorFilePath, 'utf8');
		
		var dicMethodSign = {};

		var methodSigns = [];
		
		for(var i in dicClassUnits){
			var classUnit = dicClassUnits[i];

			//console.log(classUnit);
			
			for(var j in classUnit.methodUnits){
				
				var methodUnit = classUnit.methodUnits[j];
				
				var methodSign = classUnit.packageName+"."+classUnit.name+"."+codeAnalysisUtil.genMethodSignType(methodUnit);
			
				dicMethodSign[methodSign] = methodUnit.UUID;
				
				methodSigns.push(methodSign);
			}
		}
		
		if(contents && methodSigns.length > 0){
		var lines = contents.split(/\r?\n/g);
		
		console.log("methods");
		 
	    for(var i = 0;i < lines.length;i++){
	        //code here using lines[i] which will give you each line
	    	var line = lines[i];
	    	line = line.replace(/[<|>]/g, "");
	    	line = line.replace(/:/g, ".");
	    	var parts = line.split(" ");
	    	if(parts.length !== 3){
	    	    continue;
	    	}
	    	var gatorRespMtd = parts[0]+parts[2];
	    	var matches = stringSimilarity.findBestMatch(gatorRespMtd, methodSigns);
//			if(matches.bestMatch.rating > 0.8){
			var matchedMethodUnit = dicMethodUnits[dicMethodSign[matches.bestMatch.target]];
			dicResponseMethodUnits[matchedMethodUnit.UUID] = matchedMethodUnit;
	    	}
		}
		}

		return dicResponseMethodUnits;
	}
		
	
	module.exports = {
			identifyResponse : identifyResponse,
			identifyResponseGator: identifyResponseGator,
	}
}());
