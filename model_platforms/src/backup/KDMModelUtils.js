/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules:
 * Identify the boundary (via KDM).
 * Identify the system components.
 * Establish the control flow between the components
 * Identify the stimuli.
 * 
 */
(function() {
	
	var jp = require('jsonpath');
	
	// setup a few caches for the entities, in case of multiple times of load.
	
	function convertToJsonPath(path){
//		var toNode = queryByXPath(data, toString);
		if(!path){
			return "undefined";
		}
		console.log("path to convert:");
		console.log(path);
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
	
	// system classes include all the class elements which are developed in the project. The classes don't include the classes from the third party applications.
	function identifyExternalClass(xmiString) {
		//the system classes are determined by excluding the classes that are within the external packages.
		console.log("determine external class units");

		//		var externalClassUnits = [];
		var externalClassUnitsByName = {};
		//		for(var i in externalClassUnits){
		//			var externalClassUnit = externalClassUnits[i];
		//			externalClassUnitsByName[externalClassUnit.name] = externaClassUnit;
		//		}
		var XMIExternalModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\' && @[\'$\'][\'name\']==\'externals\')]');

		for (var i in XMIExternalModels) {
			var XMIExternalModel = XMIExternalModels[i];
			var XMIExternalClasses = jp.query(XMIExternalModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\' || @[\'$\'][\'xsi:type\']==\'code:InterfaceUnit\' || @[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
			console.log("ok");
			console.log(XMIExternalClasses);
			//			var XMIExternalClasses = [];
			for (var j in XMIExternalClasses) {
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
	
	function identifyAggregateClassUnits(xmiString){

//		var topClassUnits = [];
		
		var XMIPackagedClassUnits = identifyPackagedClassUnits(xmiString);
		
//		var XMIModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\')]');

		//scan the xmi files, and establish the necessary dictionaries.
		for (var k in XMIPackagedClasseUnits) {
					console.log("inspect Classes....");
					var XMIClass = XMIPackagedClasseUnits[k];

					var subClassUnits = [];
					var subMethodUnits = [];
					var subInterfaces = [];
					//var subActionElements = [];

					var identifiedClassUnit = identifyClassUnit(XMIClass, xmiString, subClassUnits, subInterfaces, subMethodUnits);
					identifiedClassUnit.isWithinBoundary = XMIClass.isWithinBoundary;

					subClassUnits.push(identifiedClassUnit);

					// define the composite classes
					//						var subClassUnits = findSubClasses(identifiedClassUnit);
					//						subClassUnits.push(identifiedClassUnit);
					//						classUnits.push(identifiedClassUnit);
					//						dicClassUnits[identifiedClassUnit.UUID] = identifiedClassUnit;

					//						for(var l in identifiedClassUnit.MethodUnits){
					//							dicMethodUnits[identifiedClassUnit.MethodUnits[l].UUID] = identifiedClassUnit.MethodUnits[l];
					//							dicMethodClass[identifiedClassUnit.MethodUnits[l].UUID] = identifiedClassUnit.UUID;
					//						}
					//						classUnits = classUnits.concat(identifiedClassUnit.ClassUnits);
					for (l in subClassUnits) {
						subClassUnits[l].isWithinBoundary = XMIClass.isWithinBoundary;
						//							classUnits.push(subClassUnits[l]);
						dicClassUnits[subClassUnits[l].UUID] = subClassUnits[l];

						for (var m in subClassUnits[l].MethodUnits) {
							//								dicMethodUnits[subClassUnits[l].MethodUnits[m].UUID] = subClassUnits[l].MethodUnits[m];
							dicMethodClass[subClassUnits[l].MethodUnits[m].UUID] = subClassUnits[l].UUID;
						}
					}
					// compositeClassUnit = aggregateClassUnit(identifiedClassUnit);
					//
					// console.log("subClassUnits");
					// console.log(subClassUnits);

					compositeClassUnit = aggregateClassUnit(subClassUnits, isWithinBoundary, dicClassComposite, dicCompositeSubclasses);
					dicCompositeClasses[compositeClassUnit.UUID] = compositeClassUnit;

					topClassUnits.push(identifiedClassUnit);

					function findActionElementsFromActionElement(actionElement) {
						var actionElements = [];
						for (var i in actionElement.ActionElements) {
							var containedActionElement = actionElement.ActionElements[i];
							actionElements.push(containedActionElement);
							actionElements = actionElements.concat(findActionElementsFromActionElement(containedActionElement));
						}

						return actionElements;
					}

					//define the dictionary for methods and classes.
					for (var l in subMethodUnits) {
						var subMethodUnit = subMethodUnits[l];
						//							dicMethodClass[subMethodUnit.UUID] = identifiedClassUnit.UUID;
						dicMethodUnits[subMethodUnit.UUID] = subMethodUnit;
						for (var m in subMethodUnit.BlockUnit.ActionElements) {
							var actionElement = subMethodUnit.BlockUnit.ActionElements[m];
							var containedActionElements = findActionElementsFromActionElement(actionElement);
							containedActionElements.push(actionElement);
							for (var m in containedActionElements) {
								dicActionElementMethod[containedActionElements[m].UUID] = subMethodUnit.UUID;
							}
						}
					}

					//						for(var l in subActionElements){
					//							dicActionElementMethod[subActionElements[l].UUID] = identifiedClassUnit.UUID;
					//						}
		}
		
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("identified_class_units", dicClassUnits);

		//		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("identified_method_units", dicMethodUnits);

		//		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("identified_method_class", dicMethodClass);

		//		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("identified_action_element_method", dicActionElementMethod);

		debug.writeJson("identified_class_composite", dicClassComposite);

		debug.writeJson("identified_composite_classes", dicCompositeClasses);
	}

	function aggregateClassUnit(subClassUnits, isWithinBoundary, dicClassComposite, dicCompositeSubclasses) {


		var compositeClassUnit = {
			// name: XMIClassUnit['$']['name'],
			MethodUnits: [],
			StorableUnits: [],
			//				Calls : [],
			//				ClassUnits: [],
			ClassUnits: subClassUnits,
			//				BlockUnits : [],
			//				Addresses: [],
			//				Reads:[],
			//				Calls:[],
			//				Creates:[],
			//				ActionElements:[],
			//				isResponse: false,
			// UUID: XMIClassUnit['$']['UUID'],
			UUID: uuidV1(),
			isComposite: (subClassUnits.length != 1),
			isWithinBoundary: isWithinBoundary
			// attachment: XMIClassUnit
		}
		compositeClassUnit.name = compositeClassUnit.UUID;

		var childrenClasses = [];

		for (var i in subClassUnits) {
			var subClassUnit = subClassUnits[i];
			// console.log("found!!!");
			// console.log(subClassUnit.MethodUnits);
			// console.log(subClassUnit.StorableUnits);
			compositeClassUnit.MethodUnits = compositeClassUnit.MethodUnits.concat(subClassUnit.MethodUnits);
			compositeClassUnit.StorableUnits = compositeClassUnit.StorableUnits.concat(subClassUnit.StorableUnits);
			dicClassComposite[subClassUnit.UUID] = compositeClassUnit.UUID;
			childrenClasses.push(subClassUnit.UUID);
			// console.log(compositeClassUnit);
		}

		dicCompositeSubclasses[compositeClassUnit.UUID] = childrenClasses;

		return compositeClassUnit;
	}

	
	function identifyActionElement(XMIActionElement, xmiString, subClasses, subInterfaces, subMethods, subActionElements){
		var ActionElement = {
						name:XMIActionElement['$']['name'],
						UUID:XMIActionElement['$']['UUID'],
						kind:XMIActionElement['$']['kind'],
						type:XMIActionElement['$']['xsi:type'],
//						key: XMIActionElement['$']['name']+"_"+XMIActionElement['$']['kind']+XMIActionElement['$']['xsi:type'],
//						MethodUnits : [],
						StorableUnits: [],
						ClassUnits: [],
//						InterfaceUnits : [],
//						Imports : [],
//						BlockUnits : [],
						Addresses: [],
						Reads:[],
						Calls:[],
						Creates:[],
						ActionElements:[],
						attachment:XMIActionElement
		}

		var XMIStorableUnits = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
		for(var i in XMIStorableUnits){
			var XMIStorableUnit = XMIStorableUnits[i];
			ActionElement.StorableUnits.push({
				name: XMIStorableUnit['$']['name'],
				type: XMIStorableUnit['$']['type'],
				kind: XMIStorableUnit['$']['kind'],
				UUID: XMIStorableUnit['$']['UUID']
			})
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
			
			var XMITargetFrom = jp.query(xmiString, convertToJsonPath(XMIRead['$']['from']));
			var XMITargetTo = jp.query(xmiString, convertToJsonPath( XMIRead['$']['to']));

//			if (!targetFrom || !targetTo || targetFrom.length < 1 || targetTo.length < 1) {
//				continue;
//			}
			
			var targetTo = null;

			if (XMITargetTo && XMITargetTo.length > 0 && XMITargetTo[0]['$']['xsi:type']) {
			targetTo = {
				UUID: XMITargetTo[0]['$']['UUID'],
				methodAccessType : XMITargetTo[0]['$']['type'],
				xsiType: XMITargetTo[0]['$']['xsi:type']
			}
			}
			
			var targetFrom = null;

			if (XMITargetFrom && XMITargetFrom.length > 0 && XMITargetFrom[0]['$']['xsi:type']) {
			targetFrom = {
				UUID: XMITargetFrom[0]['$']['UUID'],
				methodAccessType : XMITargetFrom[0]['$']['type'],
				xsiType: XMITargetFrom[0]['$']['xsi:type']
			}
			}
			
			ActionElement.Reads.push({
				to: targetTo,
				from: targetFrom
			})
		}

		var XMICalls = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Calls\')]');
		for(var i in XMICalls){
			var XMICall = XMICalls[i];
			ActionElement.Calls.push({
				to: convertToJsonPath(XMICall['$']['to']),
				from:convertToJsonPath(XMICall['$']['from'])
			})
		}

		var XMICreates = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Creates\')]');
		for(var i in XMICreates){
			var XMICreate = XMICreates[i];
			ActionElement.Creates.push({
				to: convertToJsonPath(XMICreate['$']['to']),
				from:convertToJsonPath(XMICreate['$']['from'])
			})
		}

		var includedXMIActionElements = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');

		for(var i in includedXMIActionElements){
			var includedXMIActionElement = includedXMIActionElements[i];
			var includedActionElement = identifyActionElement(includedXMIActionElement, xmiString, subClasses, subInterfaces, subMethods, subActionElements);
			ActionElement.ActionElements.push(includedActionElement);

//			ActionElement.MethodUnits = ActionElement.MethodUnits.concat(includedActionElement.MethodUnits);
//			ActionElement.StorableUnits = ActionElement.StorableUnits.concat(includedActionElement.StorableUnits);
//			ActionElement.Calls = ActionElement.Calls.concat(includedActionElement.Calls);
//			ActionElement.ClassUnits=ActionElement.ClassUnits.concat(includedActionElement.ClassUnits);
//			ActionElement.InterfaceUnits=ActionElement.InterfaceUnits.concat(includedActionElement.InterfaceUnits);
//			ActionElement.Imports=ActionElement.Imports.concat(includedActionElement.Imports);
//			ActionElement.BlockUnits=ActionElement.BlockUnits.concat(includedActionElement.BlockUnits);
//			ActionElement.Addresses=ActionElement.Addresses.concat(includedActionElement.Addresses);
//			ActionElement.Reads=ActionElement.Reads.concat(includedActionElement.Reads);
//			ActionElement.Calls=ActionElement.Calls.concat(includedActionElement.Calls);
//			ActionElement.Creates=ActionElement.Creates.concat(includedActionElement.Creates);
//			ActionElement.ActionElements=ActionElement.ActionElements.concat(includedActionElement.ActionElements);
			
			if(subActionElements){
				subActionElements.push(includedActionElement);
			}
		}

		var XMIClassUnits = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
		console.log("---inner classes------");
//		console.log(XMIClassUnits);
		for(var i in XMIClassUnits){
			console.log("---------------inner classes--------------");
			var XMIClassUnit = XMIClassUnits[i];
			var includedClassUnit = identifyClassUnit(XMIClassUnit, xmiString, subClasses, subInterfaces, subMethods, subActionElements);

			if(!includedClassUnit.name){
				includedClassUnit.name = XMIActionElement.name+"_inner_"+i;
			}


			ActionElement.ClassUnits.push(includedClassUnit);

//			ActionElement.MethodUnits = ActionElement.MethodUnits.concat(includedClassUnit.MethodUnits);
//			ActionElement.StorableUnits = ActionElement.StorableUnits.concat(includedClassUnit.StorableUnits);
//			ActionElement.Calls = ActionElement.Calls.concat(includedClassUnit.Calls);
//			ActionElement.ClassUnits=ActionElement.ClassUnits.concat(includedClassUnit.ClassUnits);
//			ActionElement.InterfaceUnits=ActionElement.InterfaceUnits.concat(includedClassUnit.InterfaceUnits);
//			ActionElement.Imports=ActionElement.Imports.concat(includedClassUnit.Imports);
//			ActionElement.BlockUnits=ActionElement.BlockUnits.concat(includedClassUnit.BlockUnits);
//			ActionElement.Addresses=ActionElement.Addresses.concat(includedClassUnit.Addresses);
//			ActionElement.Reads=ActionElement.Reads.concat(includedClassUnit.Reads);
//			ActionElement.Calls=ActionElement.Calls.concat(includedClassUnit.Calls);
//			ActionElement.Creates=ActionElement.Creates.concat(includedClassUnit.Creates);
//			ActionElement.ActionElements=ActionElement.ActionElements.concat(includedClassUnit.ActionElements);
			
			if(subClasses){
				subClasses.push(includedClassUnit);
			}
		}

		console.log("identified action element");
		console.log(ActionElement);

		return ActionElement;
	}
	
	function identifyMethodUnit(XMIMethodUnit, xmiString, subClasses, subInterfaces, subMethods, subActionElements){
		
		var MethodUnit = {
//				key: '',
				UUID: XMIMethodUnit['$']['UUID'],
				Signature: null,
//				Parameters: [],
//				MethodUnits : [],
//				StorableUnits: [],
//				Calls : [],
//				ClassUnits: [],
//				InterfaceUnits : [],
//				Imports : [],
//				BlockUnits : [],
				BlockUnit : {
					ActionElements: []
				},
//				Addresses: [],
//				Reads:[],
//				Creates:[],
//				ActionElements:[],
//				isResponse: false,
				attachment: XMIMethodUnit
		}



		var XMISignature = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Signature\')]')[0];
		if(XMISignature){
		var XMIParameters = jp.query(XMISignature, '$.parameterUnit[?(@[\'$\'][\'type\'])]');

//		MethodUnit.UUID = XMISignature['$']['name'];
		MethodUnit.Signature = {
				name: XMISignature['$']['name'],
				parameterUnits: []
		};

		console.log("iterate signature");

		for(var j in XMIParameters){
			
			var parameterType = {
					name: "unknown",
			}
			
			var XMIParameterType = jp.query(xmiString, convertToJsonPath(XMIParameters[j]['$']['type']))[0];
			if(XMIParameterType){
				parameterType.name = XMIParameterType['$']['name'];
				parameterType.UUID = XMIParameterType['$']['UUID'];
			}
			
			console.log("iterate parameters");
			MethodUnit.Signature.parameterUnits.push({
				name: XMIParameters[j]["$"]["name"],
				kind: XMIParameters[j]['$']['kind'],
				type: parameterType
			});
//			MethodUnit.key += "_"+ XMIParameters[j]["$"]["name"]+"_"+XMIParameters[j]["$"]["kind"];
		}
		}

		//identify action elements from blockUnit
		var XMIBlockUnit = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:BlockUnit\')]')[0];
		if(XMIBlockUnit){
		var XMIActionElements = jp.query(XMIBlockUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');
		for(var j in XMIActionElements){
			var XMIActionElement = XMIActionElements[j];
			actionElement = identifyActionElement(XMIActionElement, xmiString, subClasses, subInterfaces, subMethods, subActionElements);
			MethodUnit.BlockUnit.ActionElements.push(actionElement);


//			MethodUnit.MethodUnits=MethodUnit.MethodUnits.concat(actionElement.MethodUnits);
//			MethodUnit.StorableUnits=MethodUnit.StorableUnits.concat(actionElement.StorableUnits);
//			MethodUnit.Calls = MethodUnit.Calls.concat(actionElement.Calls);
//			MethodUnit.ClassUnits=MethodUnit.ClassUnits.concat(actionElement.ClassUnits);
//			MethodUnit.InterfaceUnits=MethodUnit.InterfaceUnits.concat(actionElement.InterfaceUnits);
//			MethodUnit.Imports=MethodUnit.Imports.concat(actionElement.Imports);
//			MethodUnit.BlockUnits.push(MethodUnit.BlockUnit);
//			MethodUnit.BlockUnits=MethodUnit.BlockUnits.concat(actionElement.BlockUnits);
//			MethodUnit.Addresses=MethodUnit.Addresses.concat(actionElement.Addresses);
//			MethodUnit.Reads=MethodUnit.Reads.concat(actionElement.Reads);
//			MethodUnit.Calls=MethodUnit.Calls.concat(actionElement.Calls);
//			MethodUnit.Creates=MethodUnit.Creates.concat(actionElement.Creates);
//			MethodUnit.ActionElements.push(actionElement);
//			MethodUnit.ActionElements=MethodUnit.ActionElements.concat(actionElement.ActionElements);

//			for(var k in actionElement.MethodUnits){
//				var foundMethodUnit = actionElement.MethodUnits[k];
//				if(foundMethodUnit.isResponse){
//					MethodUnit.isResponse = true;
//					break;
//				}
//			}
			
			if(subActionElements){
				subActionElements.push(actionElement);
			}
		}
		}
		
		//testing for what are the response methods.
		var debug = require("../../utils/DebuggerOutput.js");
		if(MethodUnit.isResponse){
		debug.appendFile("identified_response_method_units", MethodUnit.Signature.name);
		}

		return MethodUnit;
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
	 *            -actionRelation-action:Writes
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
	 * In adding to the class units, additional information about the hierarchy that are needed for the following analysis is also preserved for better performance.
	 * 
	 * 1. the sub classes information.
	 * 2. the sub method information.
	 * 3. the sub action information.
	 *
	 */
	function identifyClassUnit(XMIClassUnit, xmiString, subClasses, subInterfaces, subMethods, subActionElements){

		console.log("identify:"+XMIClassUnit['$']['name']);

		// those elements store all the same type of elements in the sub classes.
		var ClassUnit = {
				name: XMIClassUnit['$']['name'],
				isAbstract: XMIClassUnit['$']['isAbstract'],
				Source: null,
				MethodUnits : [],
				StorableUnits: [],
//				Calls : [],
//				ClassUnits: [],
				InterfaceUnits : [],
				Imports : [],
				ClassUnits: [],
//				BlockUnits : [],
//				Addresses: [],
//				Reads:[],
//				Calls:[],
//				Creates:[],
//				ActionElements:[],
//				isResponse: false,
				UUID: XMIClassUnit['$']['UUID'],
				attachment: XMIClassUnit
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
				kind: XMIStorableUnit['$']['kind'],
				type: XMIStorableUnit['$']['type'],
				UUID: XMIStorableUnit['$']['UUID']
			})
		}


		var XMIMethodUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');

		for(var i in XMIMethodUnits){
			var XMIMethodUnit = XMIMethodUnits[i];
			var methodUnit = identifyMethodUnit(XMIMethodUnit, xmiString, subClasses, subInterfaces, subMethods, subActionElements);
			ClassUnit.MethodUnits.push(methodUnit);

//			ClassUnit.MethodUnits = ClassUnit.MethodUnits.concat(methodUnit.MethodUnits);
//			ClassUnit.StorableUnits = ClassUnit.StorableUnits.concat(methodUnit.StorableUnits);
//			ClassUnit.Calls = ClassUnit.Calls.concat(methodUnit.Calls);
//			ClassUnit.ClassUnits=ClassUnit.ClassUnits.concat(methodUnit.ClassUnits);
//			ClassUnit.InterfaceUnits=ClassUnit.InterfaceUnits.concat(methodUnit.InterfaceUnits);
//			ClassUnit.Imports=ClassUnit.Imports.concat(methodUnit.Imports);
//			ClassUnit.BlockUnits=ClassUnit.BlockUnits.concat(methodUnit.BlockUnits);
//			ClassUnit.Addresses=ClassUnit.Addresses.concat(methodUnit.Addresses);
//			ClassUnit.Reads=ClassUnit.Reads.concat(methodUnit.Reads);
//			ClassUnit.Calls=ClassUnit.Calls.concat(methodUnit.Calls);
//			ClassUnit.Creates=ClassUnit.Creates.concat(methodUnit.Creates);
//			ClassUnit.ActionElements=ClassUnit.ActionElements.concat(methodUnit.ActionElements);

//
//			for(var j in methodUnit.MethodUnits){
//				if(methodUnit.MethodUnits[j].isResponse){
//					ClassUnit.isResponse = true;
//					break;
//				}
//			}
//
//			if(methodUnit.isResponse){
//				ClassUnit.isResponse = true;
//			}
			
			if(subMethods){
				subMethods.push(methodUnit);
			}
		}


		var XMIInterfaceUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:InterfaceUnit\')]');
		for(var i in XMIInterfaceUnits){
			var XMIInterfaceUnit = XMIInterfaceUnits[i];
			ClassUnit.InterfaceUnits.push({
				name:XMIInterfaceUnit['$']['name']
			});
		}


		var includedXMIClassUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');

		for(var i in includedXMIClassUnits){
			var includedXMIClassUnit = includedXMIClassUnits[i];

			var IncludedClassUnit = identifyClassUnit(includedXMIClassUnit, xmiString, subClasses, subMethods, subActionElements);
			if(!IncludedClassUnit.name){
				IncludedClassUnit.name = XMIClassUnit.name+"_inner_"+i;
			}

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

//			ClassUnit.MethodUnits = ClassUnit.MethodUnits.concat(includedClassUnit.MethodUnits);
//			ClassUnit.StorableUnits = ClassUnit.StorableUnits.concat(includedClassUnit.StorableUnits);
//			ClassUnit.Calls = ClassUnit.Calls.concat(includedClassUnit.Calls);
//			ClassUnit.ClassUnits=ClassUnit.ClassUnits.concat(includedClassUnit.ClassUnits);
//			ClassUnit.InterfaceUnits=ClassUnit.InterfaceUnits.concat(includedClassUnit.InterfaceUnits);
//			ClassUnit.Imports=ClassUnit.Imports.concat(includedClassUnit.Imports);
//			ClassUnit.BlockUnits=ClassUnit.BlockUnits.concat(includedClassUnit.BlockUnits);
//			ClassUnit.Addresses=ClassUnit.Addresses.concat(includedClassUnit.Addresses);
//			ClassUnit.Reads=ClassUnit.Reads.concat(includedClassUnit.Reads);
//			ClassUnit.Calls=ClassUnit.Calls.concat(includedClassUnit.Calls);
//			ClassUnit.Creates=ClassUnit.Creates.concat(includedClassUnit.Creates);
//			ClassUnit.ActionElements=ClassUnit.ActionElements.concat(includedClassUnit.ActionElements);

			ClassUnit.ClassUnits.push(IncludedClassUnit);

//				if(includedClassUnit.isResponse){
//					ClassUnit.isResponse = true;
//				}
			
			if(subClasses){
				subClasses.push(IncludedClassUnit);
			}
		}

		return ClassUnit;

	}
	

	function identifyActionElements(xmiString){
		var XMIActionElements = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');
		var actionElementsByName = {};
		for(var i in XMIActionElements){
			var XMIActionElement = XMIActionElements[i];
			console.log(XMIActionElement);
			var actionElement = createActionElement(XMIActionElement);
			actionElementsByName[actionElement.UUID] = actionElement;
		}

		return actionElementsByName;
	}
	
	function identifyMethodUnits(xmiString){
		var XMIMethodUnits = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
		var methodUnitsByUUID = {};
		for(var i in XMIMethodUnits){
			var XMIMethodUnit = XMIMethodUnits[i];
			console.log(XMIMethodUnit);
			var methodUnit = identifyMethodUnit(XMIMethodUnit);
			methodUnitsByUUID[methodUnit.UUID] = methodUNit;
		}

		return methodUnitsByUUID;
	}

	function identifyCalls(xmiString){

		var calls = [];

		var XMICalls = jp.query(xmiString, '$..actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Calls\')]');
		for(var i in XMICalls){
			var XMICall = XMICalls[i];
			calls.push({
				to: convertToJsonPath(XMICall['$']['to']),
				from: convertToJsonPath(XMICall['$']['from'])
			});
		}

		return calls;
	}
	
	// returns an array of extend relations in xmiString
	// like { to, from }
	function identifyExtends(xmiString) {
		var extendInstances = [];
		var XMIExtends = jp.query(xmiString, '$..codeRelation[?(@[\'$\'][\'xsi:type\']==\'code:Extends\')]');
		for (var i in XMIExtends) {
			var XMIExtend = XMIExtends[i];
			extendInstances.push({
				to: jp.query(xmiString, convertToJsonPath(XMIExtend['$']['to']))[0],
				from: jp.query(xmiString, convertToJsonPath(XMIExtend['$']['from']))[0]
			});
		}

		return extendInstances;
	}
	
//	function identifyComposition(xmiString) {
//		var compositionInstances = [];
//		var XMICompositions = jp.query(xmiString, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
//		for (var i in XMICompositions) {
//			var XMIComposition = XMICompositions[i];
//			compositionInstances.push({
//				name: XMIComposition['$']['name'],
//				type: convertToJsonPath(XMIComposition['$']['type']) // this is a path to the class
//			});
//		}
//
//		return compositionInstances;
//	}

	function identifyStorableUnits(xmiClass) {
		var storableUnits = [];
		var XMIStorableUnits = jp.query(xmiClass, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
		for (var i in XMIStorableUnits) {
			var XMIStorableUnit = XMIStorableUnits[i];
			storableUnits.push({
				name: XMIStorableUnit['$']['name'],
				type:  convertToJsonPath(XMIStorableUnit['$']['type']) // this is a path to the class
			});
		}

		return storableUnits;
	}
	
	function identifyContainingMethodUnitByAction(){
		
	}
	
	function identifyContainingClassUnitByMethod(){
		
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
	
	function createCodeElement(XMICodeElement){
		var codeElement = {
				name: XMICodeElement['$']['name'],
				stereoType: XMICodeElement['$']['xsi:type'],
		        type: XMICodeElement['$']['type'],
		        uuid: XMICodeElement['$']['UUID'],
		}
//
//		codeElement.key = codeElement.name+"_"+codeElement.stereoType+"_"+codeElement.type;
//
		return codeElement;
	}




	function identifyExternalClass(xmiString){
//
//		var classUnitsWithinBoundary = [];
//		var classUnits
//		var XMIModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\')]');
//		for(var i in XMIModels){
//			var XMIModel = XMIModels[i];
//			console.log(XMIModel);
//
//			if(XMIModel['$']['name'] === "externals"){
//				continue;
//			}
//
//			var XMIClassUnits = jp.query(XMIModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
//
//			for(var j in XMIClassUnits){
//				var XMIClassUnit = XMIClassUnits[j];
//				classUnitsWithinBoundary.push(createCodeElement(XMIClassUnit));
//			}
//		}
//
//		console.log(classUnitsWithinBoundary);
//
	}



		/*
		 * this function will exclude the calls within another function
		 */
		function findCallsForMethod(methodUnit){
			var calls = [];
	
			function findCallsFromActionElement(actionElement){
				var calls = [];
	//			console.log("output action element");
	//			console.log(responseMethod.Signature.name);
	//			console.log(actionElement);
				calls = calls.concat(actionElement.Calls);
	
				for(var i in actionElement.ActionElements){
					calls = calls.concat(findCallsFromActionElement(actionElement.ActionElements[i]));
				}
	
				return calls;
			}
	
			for(var i in methodUnit.BlockUnit.ActionElements){
	
				var actionElement = methodUnit.BlockUnit.ActionElements[i];
				calls = calls.concat(findCallsFromActionElement(actionElement));
			}
	
			return calls;
		}

	//	function findSubClasses(classUnit){
	//		function findSubClassesFromActionElement(ActionElement){
	//			var classUnits = [];
	//			for(var k in ActionElement.ClassUnits){
	//				classUnits.push(ActionElement.ClassUnits[k]);
	//				var subClassUnits = findSubClasses(ActionElement.ClassUnits[k]);
	//				classUnits = classUnits.concat(subClassUnits);
	//			}
	//			return classUnits;
	//		}
	//		var classUnits = [];
	//		for(var i in classUnit.MethodUnits){
	//			var ActionElements = classUnit.MethodUnits[i].BlockUnit.ActionElements;
	//			for(var j in ActionElements){
	//				var ActionElement = ActionElements[j];
	//				classUnits = classUnits.concat(findSubClassesFromActionElement(ActionElement));
	//				for(var k in ActionElement.ActionElements){
	//					classUnits = classUnits.concat(findSubClassesFromActionElement(ActionElement.ActionElements[k]));
	//				}
	//			}
	//		}
	//
	//		return classUnits;
	//	}

	//	function locateClassUnitForMethod(methodUnitToCompare, ClassUnits){
	//		console.log("UUID");
	//		console.log(methodUnitToCompare.UUID);
	//
	//		function identifyFromActionElement(targetActionElement, methodUnitToCompare){
	//
	//			for(var i in targetActionElement.ClassUnits){
	//			var result = locateClassUnitForMethod(methodUnitToCompare, targetActionElement.ClassUnits[i]);
	//			if(result){
	//				return result;
	//			}
	//			}
	//			for(var i in targetActionElement.ActionElements){
	//				var result = identifyFromActionElement(targetActionElement.ActionElements, methodUnitToCompare);
	//				if(result){
	//					return result;
	//				}
	//			}
	//
	//			return false;
	//		}
	////		var classUnitToSelect = null;
	//		for(var i in ClassUnits){
	//			var classUnit = ClassUnits[i];
	//			if(!classUnit){
	//				continue;
	//			}
	//			console.log(classUnit);
	//			var MethodUnits = classUnit.MethodUnits;
	//			for(var j in MethodUnits){
	//				var methodUnit = MethodUnits[j];
	//				if(methodUnit.UUID === methodUnitToCompare.UUID){
	//					return classUnit;
	//				}
	//				else{
	//					for(var k in methodUnit.BlockUnit.ActionElements){
	//						var actionElement = methodUnit.BlockUnit.ActionElements[k];
	//						var result = identifyFromActionElement(actionElement, methodUnitToCompare);
	//						if(result){
	//							return result;
	//						}
	//					}
	//				}
	//			}
	//		}
	//
	//		return false;
	//	}
	//
	//	function locateMethodUnitForActionElement(actionElementToCompare, ClassUnits){
	//		console.log("UUID");
	//		console.log(actionElementToCompare.UUID);
	////		var classUnitToSelect = null;
	//
	//		function IdentifyFromActionElement(targetActionElement, associatedMethod, actionElementToCompare){
	//			if(targetActionElement.UUID === actionElementToCompare.UUID){
	//				console.log("UUID equal");
	//
	//				console.log("select method");
	////				console.log(methodUnit);
	//				return associatedMethod;
	//
	//				}
	//				else{
	//
	//					for(var i in targetActionElement.ActionElements){
	//						var includedActionElement = targetActionElement.ActionElements[i];
	//						var result = IdentifyFromActionElement(includedActionElement, associatedMethod, actionElementToCompare);
	//						if(result){
	//							return result;
	//						}
	//					}
	//
	//
	//					var result = locateMethodUnitForActionElement(actionElementToCompare, targetActionElement.ClassUnits);
	//					if(result){
	//						return false;
	//					}
	//				}
	//
	//			return false;
	//		}
	//
	//		for(var i in ClassUnits){
	//			var classUnit = ClassUnits[i];
	//			var MethodUnits = classUnit.MethodUnits;
	//			for(var j in MethodUnits){
	//				var methodUnit = MethodUnits[j];
	//				for(var k in methodUnit.BlockUnit.ActionElements){
	//					var actionElement = methodUnit.BlockUnit.ActionElements[k];
	//					console.log("to compare action element");
	//					console.log(actionElement.UUID);
	//					var result = IdentifyFromActionElement(actionElement, methodUnit, actionElementToCompare);
	//					if(result){
	//						return result;
	//					}
	//				}
	//			}
	//		}
	//
	//		return false;
	//	}


	//	function isResponseClass(ClassUnit){
	//		for(var i in ClassUnit.MethodUnits){
	//			if(ClassUnit.MethodUnits[i].isResponse){
	//				return true;
	//			}
	//		}
	//		return false;
	//	}



//		function locateComponentForMethod(targetMethodUnit, components){
//		for(var i in components){
//			var component = components[i];
//			for(var j in component.classUnits){
//				var classUnit = component.classUnits[j];
//				
//				var MethodUnits = classUnit.MethodUnits;
//				for(var k in MethodUnits){
//					var methodUnit = MethodUnits[k];
//					if(methodUnit.UUID === targetMethodUnit.UUID){
//						return component;
//					}
//				}
//				
//			}
//		}
//		return null;
//	}
	
//	function findSubMethods(classUnit){
//		var subMethods = [];
//		
//		function findSubMethodsFromActionElement(actionElement){
//			var subMethods = [];
//			
//			for(var i in actionElement.ClassUnits){
//				var classUnit = actionElement.ClassUnits[i];
//				var result = findSubMethods(classUnit);
//				subMethods = subMethods.concat(result);
//			}
//			for(var i in actionElement.ActionElements){
//				var result = findSubMethodsFromActionElement(actionElement.ActionElements[i]);
//				subMethods = subMethods.concat(result);
//			}
//			
//			return subMethods;
//		}
//		
//		for(var i in classUnit.MethodUnits){
//				var methodUnit = classUnit.MethodUnits[i];
//				subMethods.push(methodUnit);
//				
//				for(var j in methodUnit.BlockUnit.ActionElements){
//					var actionElement = methodUnit.BlockUnit.ActionElements[j];
//					var result = findSubMethodsFromActionElement(actionElement);
//					subMethods = subMethods.concat(result);
//				}
//		}
//		
//		return subMethods;
//	}
	
	

	function createMethodUnit(XMIMethodUnit) {
		return {
			name: XMIMethodUnit['$']['name'],
			kind: XMIMethodUnit['$']['kind'],
			//				key: XMIMethodUnit['$']['name']+"_"+ XMIMethodUnit['$']['kind'],
			UUID: XMIMethodUnit['$']['UUID']
		};
	}

	function createActionElement(XMIActionElement) {
		return {
			name: XMIActionElement['$']['name'],
			kind: XMIActionElement['$']['kind'],
			//				key: XMIActionElement['$']['name']+"_"+ XMIActionElement['$']['kind']
			UUID: XMIActionElement['$']['UUID'],
		}
	}

	function identifyResponseMethods() {
	}

	// system components only include the ones that are the system level. Extra rules or manual effort is required.
	function identifyComponentsFromExternalResources(filePath, callbackfunc) {
		fs.readFile(filePath, "utf8", function (err, data) {
			if (err) {
				console.log(err);
				if (callbackfunc) {
					callbackfunc(false);
				}
			}

			var taggedClassUnits = JSON.parse(data);
			for (var i in taggedClassUnits.systemClassUnits) {
				var systemClassUnit = taggedClassUnits.systemClassUnits[i];
				if (systemClassUnit.isSystemComponent) {
					taggedClassUnits.sysemComponentClassUnits.push(systemClassUnit);
				}
			}

			if (callbackfunc) {
				callbackfunc(taggedClassUnits);
			}

		});
	}
	
	module.exports = {
			convertToJsonPath : convertToJsonPath,
			identifyActionElement: identifyActionElement,
			identifyMethodUnit: identifyMethodUnit,
			identifyClassUnit: identifyClassUnit,
			identifyCalls: identifyCalls,
			identifyExtends: identifyExtends,
			identifyStorableUnits: identifyStorableUnits,
			identifyExternalClass: identifyExternalClass,
//			identifyComposition: identifyComposition,
			assignUUID: function(object) {
					if (object instanceof Array) {
						for (var i in object) {
							assignUUID(object[i]);
						}
					} else if (object instanceof Object) {
						if (object['$']) {
							object['$']['UUID'] = uuidV1();
						} else {
							object['UUID'] = uuidV1();
						}

						for (var i in object) {
							if (i === '$') {
								continue;
							}
							assignUUID(object[i]);
						}
					}
				},
			identifyPackagedClassUnits: function(xmiString){
				
				var XMIPackagedClasses= [];
				var XMIModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\')]');
				//scan the xmi files, and establish the necessary dictionaries.
				for (var i in XMIModels) {
					var XMIModel = XMIModels[i];
					console.log("inspect models....");
					var isWithinBoundary = true;
					if (XMIModel['$']['name'] === "externals") {
						isWithinBoundary = false;
					}
					//search the top level classes under the packages.
					var XMIPackages = jp.query(XMIModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Package\')]');
					for (var j in XMIPackages) {
						console.log("inspect packages....");
						var XMIPackage = XMIPackages[j];
						var XMIClasses = jp.query(XMIPackage, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
						for (var k in XMIClasses) {
							XMIClasses.isWithinBoundary = isWithinBoundary;
							XMIPackagedClasses[k] = XMIClasses[k];
						}
					}
				}
				
				return XMIPackagedClasses;
			}
			
	}
}());
