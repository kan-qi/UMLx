/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
 * big and strong....
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');

	var xpath = require('xpath');
	var dom = require('xmldom').DOMParser;
	
	function extractUserSystermInteractionModel(filePath, ModelOutputDir, ModelAccessDir, callbackfunc) {
		console.log("hello");
		fs.readFile(filePath, "utf8", function(err, data) {
//			console.log("file content");
//			console.log(data);
			parser.parseString(data, function(err, xmiString) {
//				var debug = require("../../utils/DebuggerOutput.js");
//				debug.writeJson("KDM_Example", xmiString);
				
				console.log("determine class units");
//				var XMIControlElements = jp.query(xmiString, "$['xmi:XMI']['kdm:Segment'][0]['model'][1]");
				
				var XMIClassUnits = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
				var classUnits = [];
				var codeElementToClassUnit = {};
				for(var i in XMIClassUnits){
					var XMIClassUnit = XMIClassUnits[i];
//			 '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
					var XMICodeElements = jp.query(XMIClassUnit, "$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\' || @[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]");
					var classUnit = {
							name: XMIClassUnit['$']['name'],
							codeElements:[]
					}
					for(var j in XMICodeElements){
						var XMICodeElement = XMICodeElements[j];
						var codeElement = createCodeElement(XMICodeElement);
						classUnit.codeElements.push(codeElement);
					    //create key for the code element and associate with class unit
						codeElementToClassUnit[codeElement.key] = classUnit;
					}
					classUnits.push(classUnit);
				}
				
				console.log("class units");
				console.log(classUnits);
				
				console.log("========================================");
				
				
				console.log("determine control elements");
				var edges = [];
				
				var XMIControlElements = jp.query(xmiString, '$..actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Calls\')]');
				console.log(XMIControlElements);
				var controlElements = [];
				for(var i in XMIControlElements){
					var controlElement = {};
					var XMIControlElement = XMIControlElements[i];
					var toString = XMIControlElement['$']['to'];
//					console.log("string");
//					console.log(data);
//					var toNode = queryByXPath(data, toString);
					var toNode = jp.query(xmiString, convertToJsonPath(toString))[0];
//					var toNodes = toString.split('/');
//					controlElement.toNodes = toNodes;
					controlElement.toNode = toNode;
					var fromString = XMIControlElement['$']['from'];
//					var fromNode = queryByXPath(data, fromString);
					var fromNode = jp.query(xmiString, convertToJsonPath(fromString))[0];
//					var fromNodes = fromString.split("/");
//					controlElement.fromNodes = fromNodes;
					controlElement.fromNode = fromNode;
					controlElements.push(controlElement);
					console.log(controlElement);
					
					var toCodeElement = toNode['codeElement'];
					var fromCodeElement = fromNode['codeElement'];
					
					var end = "null";
					if(toCodeElement && codeElementToClassUnit[createCodeElement(toCodeElement[0]).key]){
						end = codeElementToClassUnit[createCodeElement(toCodeElement[0]).key].name;
						
					}
					
					var start = "null";
					if(fromCodeElement && codeElementToClassUnit[createCodeElement(fromCodeElement[0]).key]){
						start = codeElementToClassUnit[createCodeElement(fromCodeElement[0]).key].name;
					}
					
					edges.push({start: start, end: end});
				}
				
				drawReferences(edges, ModelOutputDir+"/"+"output.dotty");
				
				console.log("========================================");
				
				console.log("determine the class units within the model");
				var classUnitsWithinBoundary = [];
				var XMIModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\')]');
				for(var i in XMIModels){
					var XMIModel = XMIModels[i];
					console.log(XMIModel);
					
					if(XMIModel['$']['name'] === "externals"){
						continue;
					}
					
					var XMIClassUnits = jp.query(XMIModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
					
					for(var j in XMIClassUnits){
						var XMIClassUnit = XMIClassUnits[j];
						classUnitsWithinBoundary.push(createCodeElement(XMIClassUnit));
					}
				
				}
				
				console.log(classUnitsWithinBoundary);
				
				
				console.log("========================================");
				
				console.log("determine the entry points");
//				var XMIActionElements = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');
//				for(var i in XMIActionElements){
//					var XMIActionElement = XMIActionElements[i];
//					console.log(XMIActionElement);
//				}
//				
				identifyStimulus(xmiString);
				
				console.log("========================================");
				
				
		
				
			});
		});
	}
	
	
	function identifyComponent(xmiString){

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
	
	function identifySystemLevelComponents(){
		
	}
	
	function createCodeElement(XMICodeElement){
		var codeElement = {
				name: XMICodeElement['$']['name'],
				stereoType: XMICodeElement['$']['xsi:type'],
		        type: XMICodeElement['$']['type']
		}
		
		codeElement.key = codeElement.name+"_"+codeElement.stereoType+"_"+codeElement.type;
		
		return codeElement;
	}
	
	
	function drawReferences(edges, graphFilePath){
		let graph = 'digraph g {\
			fontsize=26\
			rankdir="LR"\
			node [fontsize=24]';
		
		edges.forEach((edge) => {
			var start = edge.start;
			var end = edge.end;
			graph += '"'+start+'"->"'+end+'";';
		});

		graph += 'imagepath = \"./\"}';
		dottyUtil = require("../../utils/DottyUtil.js");
		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
			console.log("drawing is down");
		});

		return graph;
		
	}
	
//	function queryByXPath(data, xpathQuery){
//		 console.log("query");
//		 console.log(xpathQuery);
//		 xpathQuery = "xmi:XMI//0/@model.0/@codeElement.0/@codeElement.0/@codeElement.0/@codeElement.0/@codeElement.2/@codeElement.4";
////		var xml = "<book><title>Harry Potter</title></book>"
//		var doc = new dom().parseFromString(data)
//		var nodes = xpath.select(xpathQuery, doc)
////		console.log("nodes");
////		console.log(nodes);
//		return nodes;
//		 
////		console.log(nodes[0].localName + ": " + nodes[0].firstChild.data)
////		console.log("Node: " + nodes[0].toString())
//	}
	
	function convertToJsonPath(path){
//		var toNode = queryByXPath(data, toString);
		var toNodes = path.split('/');
//		controlElement.toNodes = toNodes;
		console.log(toNodes);
		var jsonPath = "$['xmi:XMI']['kdm:Segment'][0]";
		for(var i in toNodes){
			var toNode = toNodes[i];
			if(!toNode.startsWith("@")){
				continue;
			}
			var parts = toNode.replace("@", "").split(".");
			jsonPath += "['"+parts[0]+"']["+parts[1]+"]";
		}
		
//		jsonPath = "$['xmi:XMI']['kdm:Segment'][0]['model'][1]";
		console.log("json path");
		console.log(jsonPath);
		
		return jsonPath;
	}
	
	function drawCallGraph(controlElements){
		
	}
	
	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel,
	}
}());
