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
				
				
				console.log("determine class elements");
				//identify classes.
				var codeElementToClassUnit = {};
				var classUnits = identifyClasses(xmiString);
				for(var i in classUnits){
					var classUnit = classUnits[i];
					for(var j in classUnit.codeElements){
						var codeElement = classUnit.codeElements[j];
//						var key = codeElement.name+"_"+codeElement.stereoType+"_"+codeElement.type;
						codeElementToClassUnit[codeElement.key] = classUnit;
					}
				}
				
				//identify system classes.
				
				console.log("========================================");
				
				console.log("determine control elements");
				
				var actionElements = identifyActionElements(xmiString);
				var methodUnits = identifyMethodUnits(xmiString);
				
				var edges = [];
				
				var controlElements = identifyCalls(xmiString, actionElements, methodUnits);
				
				console.log(controlElements);
				for(var i in controlElements){
				var controlElement = controlElements[i];
				var toCodeElement = controlElement.to;
				var fromCodeElement = controlElement.from;
				
//				var end = "null";
//				if(toCodeElement && codeElementToClassUnit[toCodeElement.key]){
//					end = codeElementToClassUnit[toCodeElement.key].name;
//					
//				}
				
//				var start = "null";
//				if(fromCodeElement && codeElementToClassUnit[fromCodeElement.key]){
//					start = codeElementToClassUnit[fromCodeElement.key].name;
//				}
				
				var end = toCodeElement.name;
				var start = fromCodeElement.name;
				
				edges.push({start: start, end: end});
				}
				
				console.log("edges");
				console.log(edges);
				

				drawReferences(edges, "./model_platforms/src/output.dotty");
				
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

				identifyStimulus(xmiString);
				
				console.log("========================================");
				
				
				console.log("identify the structured class units");
				var XMIModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\')]');
				var classUnits = [];
				for(var i in XMIModels){
					var XMIModel = XMIModels[i];
					console.log("inspect models....");
					//search the top level classes under the packages.
					var XMIPackages = jp.query(XMIModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Package\')]');
					for(var j in XMIPackages){
						console.log("inspect packages....");
						var XMIPackage = XMIPackages[j];
						var XMIClasses = jp.query(XMIPackage, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
							for(var k in XMIClasses){
								console.log("inspect Classes....");
								var XMIClass = XMIClasses[k];
								classUnits.push(identifyClassUnit(XMIClass));
							}
					}
				}
				
				fs.writeFile("./model_platforms/src/structured_class_units.json", JSON.stringify(classUnits), function(err){
					if(err) {
					 	console.log(err);
					 	if(callbackfunc){
					    	callbackfunc(false);
						} 
				    }
					else{
						if(callbackfunc){
					    	callbackfunc(true);
						} 
					}
					
				});
				
			});
		});
	}
	
	
	
	function identifyActionElement(XMIActionElement){
		var ActionElement = {
						name:XMIActionElement['$']['name'],
						kind:XMIActionElement['$']['kind'],
						MethodUnits : [],
						StorableUnits: [],
						Calls : [],
						ClassUnits: [],
						InterfaceUnits : [],
						Imports : [],
						BlockUnits : [],
						Addresses: [],
						Reads:[],
						Calls:[],
						Creates:[],
						ActionElements:[]
		}
		
		var XMIAddresses = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Addresses\')]');
		for(var i in XMIAddresses){
			var XMIAddress = XMIAddresses[i];
			ActionElement.Addresses.push({
				to: XMIAddress['$']['to'],
				from:XMIAddress['$']['from']
			})
		}
		var XMIReads = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Reads\')]');
		for(var i in XMIReads){
			var XMIRead = XMIReads[i];
			ActionElement.Reads.push({
				to: XMIRead['$']['to'],
				from:XMIRead['$']['from']
			})
		}
		
		var XMICalls = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Calls\')]');
		for(var i in XMICalls){
			var XMICall = XMICalls[i];
			ActionElement.Calls.push({
				to: XMICall['$']['to'],
				from:XMICall['$']['from']
			})
		}
		
		var XMICreates = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Creates\')]');
		for(var i in XMICreates){
			var XMICreate = XMICreates[i];
			ActionElement.Creates.push({
				to: XMICreate['$']['to'],
				from:XMICreate['$']['from']
			})
		}
		
		var XMIActionElements = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');
		
		for(var i in XMIActionElements){
			var XMIActionElement = XMIActionElements[i];
			var includedActionElement = identifyActionElement(XMIActionElement);
			ActionElement.MethodUnits = ActionElement.MethodUnits.concat(includedActionElement.MethodUnits);
			ActionElement.StorableUnits = ActionElement.StorableUnits.concat(includedActionElement.StorableUnits);
			ActionElement.Calls = ActionElement.Calls.concat(includedActionElement.Calls);
			ActionElement.ClassUnits=ActionElement.ClassUnits.concat(includedActionElement.ClassUnits);
			ActionElement.InterfaceUnits=ActionElement.InterfaceUnits.concat(includedActionElement.InterfaceUnits);
			ActionElement.Imports=ActionElement.Imports.concat(includedActionElement.Imports);
			ActionElement.BlockUnits=ActionElement.BlockUnits.concat(includedActionElement.BlockUnits);
			ActionElement.Addresses=ActionElement.Addresses.concat(includedActionElement.Addresses);
			ActionElement.Reads=ActionElement.Reads.concat(includedActionElement.Reads);
			ActionElement.Calls=ActionElement.Calls.concat(includedActionElement.Calls);
			ActionElement.Creates=ActionElement.Creates.concat(includedActionElement.Creates);
			ActionElement.ActionElements=ActionElement.ActionElements.concat(includedActionElement.ActionElements);
		}
		
		var XMIClassUnits = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ClassUnit\')]');
		for(var i in XMIClassUnits){
			var XMIClassUnit = XMIClassUnits[i];
			var includedClassUnit = identifyActionElement(XMIClassUnit);
			ActionElement.MethodUnits = ActionElement.MethodUnits.concat(includedClassUnit.MethodUnits);
			ActionElement.StorableUnits = ActionElement.StorableUnits.concat(includedClassUnit.StorableUnits);
			ActionElement.Calls = ActionElement.Calls.concat(includedClassUnit.Calls);
			ActionElement.ClassUnits=ActionElement.ClassUnits.concat(includedClassUnit.ClassUnits);
			ActionElement.InterfaceUnits=ActionElement.InterfaceUnits.concat(includedClassUnit.InterfaceUnits);
			ActionElement.Imports=ActionElement.Imports.concat(includedClassUnit.Imports);
			ActionElement.BlockUnits=ActionElement.BlockUnits.concat(includedClassUnit.BlockUnits);
			ActionElement.Addresses=ActionElement.Addresses.concat(includedClassUnit.Addresses);
			ActionElement.Reads=ActionElement.Reads.concat(includedClassUnit.Reads);
			ActionElement.Calls=ActionElement.Calls.concat(includedClassUnit.Calls);
			ActionElement.Creates=ActionElement.Creates.concat(includedClassUnit.Creates);
			ActionElement.ActionElements=ActionElement.ActionElements.concat(includedClassUnit.ActionElements);
		}
		
		return ActionElement;
	}
	
	/*
	 * There are three layers:
	 * codeElement-code:ClassUnit
	 * 		-source
	 * 			- region
	 * 		-codeRelation-code:Imports
	 *		-codeElement-code:StorableUnit
	 *      -codeElement-code:MethodUnit
	 *        -source
	 *        -codeElement-code:signature
	 *        	-parameterUnit
	 *        -codeElement-action:BlockUnit
	 *          -codeElement-action:ActionElement
	 *            -codeElement-action:ActionElement
	 *            -actionRelation-action:Address
	 *            -actionRelation-action:Reads
	 *            -actionRelation-action:Calls
	 *            -actionRelation-action:Creates
	 *            -codeElement-code:ClassUnit
	 *      -codeElement-code:InterfaceUnit
	 *           -codeRelation-code:Imports
	 *           -codeRelation-code:MethodUnit
	 *      -codeElement-code:ClassUnit
	 *           
	 * The function is recursively designed to take care of the structure.
	 *           
	 */
	function identifyClassUnit(XMIClassUnit){
		
		// those elements store all the same type of elements in the sub classes.
		var ClassUnit = {
				name: XMIClassUnit['$']['name'],
				isAbstract: XMIClassUnit['$']['isAbstract'],
				Source: null,
				MethodUnits : [],
				StorableUnits: [],
				Calls : [],
				ClassUnits: [],
				InterfaceUnits : [],
				Imports : [],
				BlockUnits : [],
				Addresses: [],
				Reads:[],
				Calls:[],
				Creates:[],
				ActionElements:[]
		}
		
		var XMISource = jp.query(XMIClassUnit, '$.source[?(@[\'$\'][\'xsi:language\'])]')[0];
		
		if(XMISource){
		var XMIRegion = jp.query(XMISource, '$.region[?(@[\'$\'][\'xsi:language\'])]')[0];
		ClassUnit.Source = {
				Region: {
					language: XMIRegion['$']['language']
				}
		}
		}
		var XMIImports = jp.query(XMIClassUnit, '$.codeRelation[?(@[\'$\'][\'xsi:type\']==\'code:Imports\')]');
		
		for(var i in XMIImports){
			var XMIImport = XMIImports[i];
			ClassUnit.Imports.push({
				from:XMIImport['$']['from'],
				to:XMIImport['$']['to']
			})
		}
		
		var XMIStorableUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
		
		for(var i in XMIStorableUnits){
			var XMIStorableUnit = XMIStorableUnits[i];
			ClassUnit.StorableUnits.push({
				name: XMIStorableUnit['$']['name'],
				kind: XMIStorableUnit['$']['kind']
			})
		}
		
		
		var XMIMethodUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
		
		for(var i in XMIMethodUnits){
			var XMIMethodUnit = XMIMethodUnits[i];
			
			var MethodUnit = {
					Signature: null,
					Parameters: [],
					BlockUnit: null,
			}

			var XMISignature = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Signature\')]')[0];
			if(XMISignature){
			var XMIParameters = jp.query(XMISignature, '$.parameterUnit[?(@[\'$\'][\'xsi:type\'])]');
			
			MethodUnit.Signature = {
					name: XMISignature['$']['name'],
					parameterUnits: []
			};
			
			for(var j in XMIParameters){
				MethodUnit.Signature.parameterUnits.push({
					name: XMIParameters[j]["$"]["name"],
					kind: XMIParameters[j]['$']['kind']
				});
			}
			}
			
			//identify action elements from blockUnit
			var XMIBlockUnit = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:BlockUnit\')]')[0];
			if(XMIBlockUnit){
			MethodUnit.BlockUnit = {
					actionElements: []
			}
			var XMIActionElements = jp.query(XMIBlockUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');
			for(var j in XMIActionElements){
				var XMIActionElement = XMIActionElements[j];
				actionElement = identifyActionElement(XMIActionElement);
				
				MethodUnit.BlockUnit.actionElements.push(actionElement);
				
//				ClassUnit.MethodUnits.concat(actionElement.MethodUnits);
//				ClassUnit.StorableUnits.concat(actionElement.StorableUnits);
//				ClassUnit.Calls.concat(actionElement.Calls);
//				ClassUnit.ClassUnits.concat(actionElement.ClassUnits);
//				ClassUnit.InterfaceUnits.concat(actionElement.InterfaceUnits);
//				ClassUnit.Imports.concat(actionElement.Imports);
//				ClassUnit.BlockUnits.concat(actionElement.BlockUnits);
//				ClassUnit.Addresses.concat(actionElement.Addresses);
//				ClassUnit.Reads.concat(actionElement.Reads);
//				ClassUnit.Calls.concat(actionElement.Calls);
//				ClassUnit.Creates.concat(actionElement.Creates);
//				ClassUnit.ActionElements.concat(actionElement.ActionElements);
//				ClassUnit.ActionElements.push(actionElement);
				
				ClassUnit.MethodUnits = ClassUnit.MethodUnits.concat(actionElement.MethodUnits);
				ClassUnit.StorableUnits = ClassUnit.StorableUnits.concat(actionElement.StorableUnits);
				ClassUnit.Calls = ClassUnit.Calls.concat(actionElement.Calls);
				ClassUnit.ClassUnits=ClassUnit.ClassUnits.concat(actionElement.ClassUnits);
				ClassUnit.InterfaceUnits=ClassUnit.InterfaceUnits.concat(actionElement.InterfaceUnits);
				ClassUnit.Imports=ClassUnit.Imports.concat(actionElement.Imports);
				ClassUnit.BlockUnits=ClassUnit.BlockUnits.concat(actionElement.BlockUnits);
				ClassUnit.Addresses=ClassUnit.Addresses.concat(actionElement.Addresses);
				ClassUnit.Reads=ClassUnit.Reads.concat(actionElement.Reads);
				ClassUnit.Calls=ClassUnit.Calls.concat(actionElement.Calls);
				ClassUnit.Creates=ClassUnit.Creates.concat(actionElement.Creates);
				ClassUnit.ActionElements=ClassUnit.ActionElements.concat(actionElement.ActionElements);
			}
			}
			
			ClassUnit.MethodUnits.push(MethodUnit);
		}
		
		
		var XMIInterfaceUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:InterfaceUnit\')]');
		for(var i in XMIInterfaceUnits){
			var XMIInterfaceUnit = XMIInterfaceUnits[i];
			ClassUnit.InterfaceUnits.push({
				name:XMIInterfaceUnit['$']['name']
			});
		}
		
		
		var XMIClassUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
		
		for(var i in XMIClassUnits){
			var XMIClassUnit = XMIClassUnits[i];
			
			var IncludedClassUnit = identifyClassUnit(XMIClassUnit);
			
//			ClassUnit.MethodUnits.concat(includedClassUnit.MethodUnits);
//			ClassUnit.StorableUnits.concat(includedClassUnit.StorableUnits);
//			ClassUnit.Calls.concat(includedClassUnit.Calls);
//			ClassUnit.ClassUnits.concat(includedClassUnit.ClassUnits);
//			ClassUnit.InterfaceUnits.concat(includedClassUnit.InterfaceUnits);
//			ClassUnit.Imports.concat(includedClassUnit.Imports);
//			ClassUnit.BlockUnits.concat(includedClassUnit.BlockUnits);
//			ClassUnit.Addresses.concat(includedClassUnit.Addresses);
//			ClassUnit.Reads.concat(includedClassUnit.Reads);
//			ClassUnit.Calls.concat(includedClassUnit.Calls);
//			ClassUnit.Creates.concat(includedClassUnit.Creates);
//			ClassUnit.ActionElements.push(includedClassUnit.ActionElements);
			
			ClassUnit.MethodUnits = ClassUnit.MethodUnits.concat(includedClassUnit.MethodUnits);
			ClassUnit.StorableUnits = ClassUnit.StorableUnits.concat(includedClassUnit.StorableUnits);
			ClassUnit.Calls = ClassUnit.Calls.concat(includedClassUnit.Calls);
			ClassUnit.ClassUnits=ClassUnit.ClassUnits.concat(includedClassUnit.ClassUnits);
			ClassUnit.InterfaceUnits=ClassUnit.InterfaceUnits.concat(includedClassUnit.InterfaceUnits);
			ClassUnit.Imports=ClassUnit.Imports.concat(includedClassUnit.Imports);
			ClassUnit.BlockUnits=ClassUnit.BlockUnits.concat(includedClassUnit.BlockUnits);
			ClassUnit.Addresses=ClassUnit.Addresses.concat(includedClassUnit.Addresses);
			ClassUnit.Reads=ClassUnit.Reads.concat(includedClassUnit.Reads);
			ClassUnit.Calls=ClassUnit.Calls.concat(includedClassUnit.Calls);
			ClassUnit.Creates=ClassUnit.Creates.concat(includedClassUnit.Creates);
			ClassUnit.ActionElements=ClassUnit.ActionElements.concat(includedClassUnit.ActionElements);
			
			ClassUnit.ClassUnit.push(includedClassUnit);
		}
		
		return ClassUnit;
		
	}
	
	function identifyBlockUnitsForControlFlows(xmiString){
		var XMIClassUnits = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
		var classUnitsByRegion = {};
		var classUnitsByMethod = {};
		var methodUnitsByActionElements = identifyMethodUnitsByActionElement();
		for(var i in XMIClassUnits){
			var XMIClassUnit = XMIClassUnits[i];
			var classUnit = {
					name: XMIClassUnit['$']['name'],
					region: "external"
			}
			var XMIRegion = jp.query(XMIClassUnit, '$..region[?(@[\'$\'][\'file\'])]')[0];
			if(XMIRegion){
				classUnit.region = XMIRegion['$']['file'];
			}
			
			var XMIMethods = jp.query(XMIClassUnit, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
			for(var i in XMIMethods){
				var XMIMethod = XMIMethods[i];
			}
			
			classUnitsByRegion[classUnit.region] = classRegion;
		}
		
		
		var edges = [];
		var XMIBlockUnits = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'action:BlockUnit\')]');
		var blockUnits = [];
		var blockUnitsByActionElement = {};
		var blockUnitsByRegion = {};
		for(var i in XMIBlockUnits){
			var XMIBlockUnit = XMIBlockUnits[i];
			console.log(XMIBlockUnit);
			var blockUnit = {
					region: "",
					actionElements: []
			};
			var XMIRegion = jp.query(XMIBlockUnit, '$..region[?(@[\'$\'][\'xsi:file\'])]')[0];
			if(XMIRegion){
				blockUnit.region = XMIRegion['$']['file'];
			}
			
			var XMIActionElements = jp.query(XMIBlockUnit, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]')[0];
			for(var j in XMIActionElements){
				var XMIActionElement = XMIActionElements[j];
				var actionElement = createActionElement(XMIActionElement)
				blockUnit.actionElements.push(actionElement);
				
				//create edge
				var fromClass = classUnitsByRegion[blockUnit.region];
				var toClass = classUnitsByMethod[methodUnitsByActionElement(actionElement.name).key];
				
				edges.push({start: fromClass.name, end: toClass.name});
				
			}
			
			blockUnitsByActionElements[actionElement.key] = actionElement;
			blockUnitsByRegion[blockUnit.region] = blockUnit;
		}
		
		drawReferences(edges, "./model_platforms/src/output_dependency.dotty");
		
		return actionElementsByName;
	}
	
	
	function identifyActionElements(xmiString){
		var XMIActionElements = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');
		var actionElementsByName = {};
		for(var i in XMIActionElements){
			var XMIActionElement = XMIActionElements[i];
			console.log(XMIActionElement);
			var actionElement = createActionElement(XMIActionElement);
			actionElementsByName[actionElement.key] = actionElement;
		}
		
		return actionElementsByName;
	}
	
	function identifyMethodUnits(xmiString){
		var XMIMethodUnits = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
		var methodUnitsByName = {};
		for(var i in XMIMethodUnits){
			var XMIMethodUnit = XMIMethodUnits[i];
			console.log(XMIMethodUnit);
			var actionElement = createMethodUnit(XMIMethodUnit);
			methodUnitsByName[actionElement.key] = actionElement;
		}
		
		return methodUnitsByName;
	}
	
	function createMethodUnit(XMIMethodUnit){
		return {
				name: XMIMethodUnit['$']['name'],
				kind: XMIMethodUnit['$']['kind'],
				key: XMIMethodUnit['$']['name']+"_"+ XMIMethodUnit['$']['kind']
		};
	}
	
	function createActionElement(XMIActionElement){
		return {
				name: XMIActionElement['$']['name'],
				kind: XMIActionElement['$']['kind'],
				key: XMIActionElement['$']['name']+"_"+ XMIActionElement['$']['kind']
		}
		
	}
	
	function identifyCalls(xmiString, actionElements, methodUnits){
		var XMIControlElements = jp.query(xmiString, '$..actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Calls\')]');
//		console.log(XMIControlElements);
		var controlElements = [];
		for(var i in XMIControlElements){
			var controlElement = {};
			var XMIControlElement = XMIControlElements[i];
			var toString = XMIControlElement['$']['to'];
//			console.log("string");
//			console.log(data);
//			var toNode = queryByXPath(data, toString);
			var toNode = jp.query(xmiString, convertToJsonPath(toString))[0];
//			var toNodes = toString.split('/');
//			controlElement.toNodes = toNodes;
			controlElement.to = createMethodUnit(toNode);
			var fromString = XMIControlElement['$']['from'];
//			var fromNode = queryByXPath(data, fromString);
			var fromNode = jp.query(xmiString, convertToJsonPath(fromString))[0];
//			var fromNodes = fromString.split("/");
//			controlElement.fromNodes = fromNodes;
			controlElement.from = createActionElement(fromNode);
			controlElements.push(controlElement);
			console.log(controlElement);
			
//			var toCodeElement = toNode['codeElement'];
//			var fromCodeElement = fromNode['codeElement'];
//			
//			var end = "null";
//			if(toCodeElement && codeElementToClassUnit[createCodeElement(toCodeElement[0]).key]){
//				end = codeElementToClassUnit[createCodeElement(toCodeElement[0]).key].name;
//				
//			}
//			
//			var start = "null";
//			if(fromCodeElement && codeElementToClassUnit[createCodeElement(fromCodeElement[0]).key]){
//				start = codeElementToClassUnit[createCodeElement(fromCodeElement[0]).key].name;
//			}
			
//			edges.push({start: start, end: end});
		}
		
//		drawReferences(edges, ModelOutputDir+"/"+"output.dotty");
		
		console.log("calls");
		console.log(controlElements);
		return controlElements;
	}
	
	
	// system components only include the ones that are the system level. Extra rules or manual effort is required.
	function identifyComponentsFromExternalResources(filePath, callbackfunc){
		fs.readFile(filePath, "utf8", function(err, data){
			if(err) {
			 	console.log(err);
			 	if(callbackfunc){
			    	callbackfunc(false);
				} 
		    }
			
			var taggedClassUnits = JSON.parse(data);
			for (var i in taggedClassUnits.systemClassUnits){
				var systemClassUnit = taggedClassUnits.systemClassUnits[i];
				if(systemClassUnit.isSystemComponent){
					taggedClassUnits.sysemComponentClassUnits.push(systemClassUnit);
				}
			}
			
			if(callbackfunc){
				callbackfunc(taggedClassUnits);
			}
			
		});
	}
	
	// system classes include all the class elements which are developed in the project. The classes don't include the classes from the third party applications.
	function identifyExternalClass(xmiString){
		//the system classes are determined by excluding the classes that are within the external packages.
		console.log("determine external class units");
		
//		var externalClassUnits = [];
		var externalClassUnitsByName = {};
//		for(var i in externalClassUnits){
//			var externalClassUnit = externalClassUnits[i];
//			externalClassUnitsByName[externalClassUnit.name] = externaClassUnit; 
//		}
		var XMIExternalModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\' && @[\'$\'][\'name\']==\'externals\')]');
	
		for(var i in XMIExternalModels){
			var XMIExternalModel = XMIExternalModels[i];
			var XMIExternalClasses = jp.query(XMIExternalModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\' || @[\'$\'][\'xsi:type\']==\'code:InterfaceUnit\' || @[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
			console.log("ok");
			console.log(XMIExternalClasses);
//			var XMIExternalClasses = [];
			for(var j in XMIExternalClasses){
			var XMIExternalClassUnit = XMIExternalClasses[j];
			var classUnit = {
					name: XMIExternalClassUnit['$']['name'],
					type: XMIExternalClassUnit['$']['xsi:type'],
			}
			
			externalClassUnitsByName[classUnit.name] = classUnit;
		}
		}
		
		console.log("================================");
		return externalClassUnitsByName;
	}
	
	// classes include all the classes, including the third party classes.
	function identifyClasses(xmiString, callbackfunc){
		
		console.log("determine class units");
//		var XMIControlElements = jp.query(xmiString, "$['xmi:XMI']['kdm:Segment'][0]['model'][1]");
		
		var XMIClassUnits = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
		var externalClass
		var classUnits = [];
		var externalClassUnitsByName = identifyExternalClass(xmiString);
		console.log("external class names");
		console.log(externalClassUnitsByName);
		var externalClassUnits = [];
		var systemClassUnits = [];
		var systemComponetClassUnits = [];
		for(var i in XMIClassUnits){
			var XMIClassUnit = XMIClassUnits[i];
//	 '$.fragment[?(@[\'$\'][\'xmi:type\']==\'uml:OccurrenceSpecification\' || @[\'$\'][\'xmi:type\']==\'uml:CombinedFragment\')]');
			var XMICodeElements = jp.query(XMIClassUnit, "$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\' || @[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]");
			var classUnit = {
					name: XMIClassUnit['$']['name'],
					codeElements:[],
					isSystemComponent:false
			}
			
			for(var j in XMICodeElements){
				var XMICodeElement = XMICodeElements[j];
				var codeElement = createCodeElement(XMICodeElement);
				classUnit.codeElements.push(codeElement);
			    //create key for the code element and associate with class unit
//				codeElementToClassUnit[codeElement.key] = classUnit;
			}
			
			classUnits.push(classUnit);
			
			if(externalClassUnitsByName[classUnit.name]){
				externalClassUnits.push(classUnit);
			}
			else{
				systemClassUnits.push(classUnit);
			}
		}
		
		console.log("class units");
		console.log(classUnits);
		
		classUnitsByCategories = {
				classUnits: classUnits,
				systemClassUnits: systemClassUnits,
//				systemComponentClassUnits: systemComponentClassUnits,
				systemComponentClassUnits: systemClassUnits, //just for experimental purpose.
				externalClassUnits: externalClassUnits
			};
		
		fs.writeFile("./model_platforms/src/class_units.json", JSON.stringify(classUnitsByCategories), function(err){
			if(err) {
			 	console.log(err);
			 	if(callbackfunc){
			    	callbackfunc(false);
				} 
		    }
			else{
				if(callbackfunc){
			    	callbackfunc(true);
				} 
			}
			
		});
		
		return classUnitsByCategories;
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
	
	function createCodeElement(XMICodeElement){
		var codeElement = {
				name: XMICodeElement['$']['name'],
				stereoType: XMICodeElement['$']['xsi:type'],
		        type: XMICodeElement['$']['type']
		}
//		
		codeElement.key = codeElement.name+"_"+codeElement.stereoType+"_"+codeElement.type;
//		
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
			console.log("drawing is done");
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
