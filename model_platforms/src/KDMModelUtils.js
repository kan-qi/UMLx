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

					//						for(var l in identifiedClassUnit.methodUnits){
					//							dicMethodUnits[identifiedClassUnit.methodUnits[l].UUID] = identifiedClassUnit.methodUnits[l];
					//							dicMethodClass[identifiedClassUnit.methodUnits[l].UUID] = identifiedClassUnit.UUID;
					//						}
					//						classUnits = classUnits.concat(identifiedClassUnit.classUnits);
					for (l in subClassUnits) {
						subClassUnits[l].isWithinBoundary = XMIClass.isWithinBoundary;
						//							classUnits.push(subClassUnits[l]);
						dicClassUnits[subClassUnits[l].UUID] = subClassUnits[l];

						for (var m in subClassUnits[l].methodUnits) {
							//								dicMethodUnits[subClassUnits[l].methodUnits[m].UUID] = subClassUnits[l].methodUnits[m];
							dicMethodClass[subClassUnits[l].methodUnits[m].UUID] = subClassUnits[l].UUID;
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
						for (var i in actionElement.actionElements) {
							var containedActionElement = actionElement.actionElements[i];
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
						for (var m in subMethodUnit.blockUnit.actionElements) {
							var actionElement = subMethodUnit.blockUnit.actionElements[m];
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
			methodUnits : [],
			attrUnits: [],
			//				calls : [],
			//			 classUnits: [],
			classUnits: subClassUnits,
			//				blockUnits : [],
			//				addresses: [],
			//				reads:[],
			//				calls:[],
			//				creates:[],
			//				actionElements:[],
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
			// console.log(subClassUnit.methodUnits);
			// console.log(subClassUnit.attrUnits);
			compositeClassUnit.methodUnits = compositeClassUnit.methodUnits.concat(subClassUnit.methodUnits);
			compositeClassUnit.attrUnits = compositeClassUnit.attrUnits.concat(subClassUnit.attrUnits);
			dicClassComposite[subClassUnit.UUID] = compositeClassUnit.UUID;
			childrenClasses.push(subClassUnit.UUID);
			// console.log(compositeClassUnit);
		}

		dicCompositeSubclasses[compositeClassUnit.UUID] = childrenClasses;

		return compositeClassUnit;
	}

	
	function identifyActionElement(XMIActionElement, xmiString, subClasses, subInterfaces, subMethods, subActionElements){
		var actionElement = {
						name:XMIActionElement['$']['name'],
						UUID:XMIActionElement['$']['UUID'],
						kind:XMIActionElement['$']['kind'],
						type:XMIActionElement['$']['xsi:type'],
//						key: XMIActionElement['$']['name']+"_"+XMIActionElement['$']['kind']+XMIActionElement['$']['xsi:type'],
//						methodUnits : [],
						attrUnits: [],
						classUnits: [],
//						interfaceUnits : [],
//						imports : [],
//						blockUnits : [],
						addresses: [],
						reads:[],
						calls:[],
						creates:[],
						actionElements:[],
						attachment:XMIActionElement
		}

		var XMIStorableUnits = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
		for(var i in XMIStorableUnits){
			var XMIStorableUnit = XMIStorableUnits[i];
		 actionElement.attrUnits.push({
				name: XMIStorableUnit['$']['name'],
				type: XMIStorableUnit['$']['type'],
				kind: XMIStorableUnit['$']['kind'],
				UUID: XMIStorableUnit['$']['UUID']
			})
		}

		var XMIAddresses = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Addresses\')]');
		for(var i in XMIAddresses){
			var XMIAddress = XMIAddresses[i];
		 actionElement.addresses.push({
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
			
		 actionElement.reads.push({
				to: targetTo,
				from: targetFrom
			})
		}

		var XMICalls = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Calls\')]');
		for(var i in XMICalls){
			var XMICall = XMICalls[i];
		 actionElement.calls.push({
				to: convertToJsonPath(XMICall['$']['to']),
				from:convertToJsonPath(XMICall['$']['from'])
			})
		}

		var XMICreates = jp.query(XMIActionElement, '$.actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Creates\')]');
		for(var i in XMICreates){
			var XMICreate = XMICreates[i];
		 actionElement.creates.push({
				to: convertToJsonPath(XMICreate['$']['to']),
				from:convertToJsonPath(XMICreate['$']['from'])
			})
		}

		var includedXMIActionElements = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');

		for(var i in includedXMIActionElements){
			var includedXMIActionElement = includedXMIActionElements[i];
			var includedActionElement = identifyActionElement(includedXMIActionElement, xmiString, subClasses, subInterfaces, subMethods, subActionElements);
		 actionElement.actionElements.push(includedActionElement);

//		 actionElement.methodUnits = actionElement.methodUnits.concat(includedActionElement.methodUnits);
//		 actionElement.attrUnits = actionElement.attrUnits.concat(includedActionElement.attrUnits);
//		 actionElement.calls = actionElement.calls.concat(includedActionElement.calls);
//		 actionElement.classUnits=ActionElement.classUnits.concat(includedActionElement.classUnits);
//		 actionElement.interfaceUnits=ActionElement.interfaceUnits.concat(includedActionElement.interfaceUnits);
//		 actionElement.imports=ActionElement.imports.concat(includedActionElement.imports);
//		 actionElement.blockUnits=ActionElement.blockUnits.concat(includedActionElement.blockUnits);
//		 actionElement.addresses=ActionElement.addresses.concat(includedActionElement.addresses);
//		 actionElement.reads=ActionElement.reads.concat(includedActionElement.reads);
//		 actionElement.calls=ActionElement.calls.concat(includedActionElement.calls);
//		 actionElement.creates=ActionElement.creates.concat(includedActionElement.creates);
//		 actionElement.actionElements=ActionElement.actionElements.concat(includedActionElement.actionElements);
			
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

		 actionElement.classUnits.push(includedClassUnit);

//		 actionElement.methodUnits = actionElement.methodUnits.concat(includedClassUnit.methodUnits);
//		 actionElement.attrUnits = actionElement.attrUnits.concat(includedClassUnit.attrUnits);
//		 actionElement.calls = actionElement.calls.concat(includedClassUnit.calls);
//		 actionElement.classUnits=ActionElement.classUnits.concat(includedClassUnit.classUnits);
//		 actionElement.interfaceUnits=ActionElement.interfaceUnits.concat(includedClassUnit.interfaceUnits);
//		 actionElement.imports=ActionElement.imports.concat(includedClassUnit.imports);
//		 actionElement.blockUnits=ActionElement.blockUnits.concat(includedClassUnit.blockUnits);
//		 actionElement.addresses=ActionElement.addresses.concat(includedClassUnit.addresses);
//		 actionElement.reads=ActionElement.reads.concat(includedClassUnit.reads);
//		 actionElement.calls=ActionElement.calls.concat(includedClassUnit.calls);
//		 actionElement.creates=ActionElement.creates.concat(includedClassUnit.creates);
//		 actionElement.actionElements=ActionElement.actionElements.concat(includedClassUnit.actionElements);
			
			if(subClasses){
				subClasses.push(includedClassUnit);
			}
		}

		console.log("identified action element");
		console.log(actionElement);

		return actionElement;
	}
	
	function identifyMethodUnit(XMIMethodUnit, xmiString, subClasses, subInterfaces, subMethods, subActionElements){
		
		var methodUnit = {
//				key: '',
				UUID: XMIMethodUnit['$']['UUID'],
				signature: null,
//				parameters: [],
//				methodUnits : [],
//				attrUnits: [],
//				calls : [],
//				classUnits: [],
//				interfaceUnits : [],
//				imports : [],
//				blockUnits : [],
				blockUnit : {
					actionElements: []
				},
//				addresses: [],
//				reads:[],
//				creates:[],
//				actionElements:[],
//				isResponse: false,
				attachment: XMIMethodUnit
		}



		var XMISignature = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Signature\')]')[0];
		if(XMISignature){
		var XMIParameters = jp.query(XMISignature, '$.parameterUnit[?(@[\'$\'][\'type\'])]');

//	 methodUnit.UUID = XMISignature['$']['name'];
	 methodUnit.signature = {
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
		 methodUnit.signature.parameterUnits.push({
				name: XMIParameters[j]["$"]["name"],
				kind: XMIParameters[j]['$']['kind'],
				type: parameterType
			});
//		 methodUnit.key += "_"+ XMIParameters[j]["$"]["name"]+"_"+XMIParameters[j]["$"]["kind"];
		}
		}

		//identify action elements from blockUnit
		var XMIBlockUnit = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:BlockUnit\')]')[0];
		if(XMIBlockUnit){
		var XMIActionElements = jp.query(XMIBlockUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');
		for(var j in XMIActionElements){
			var XMIActionElement = XMIActionElements[j];
			actionElement = identifyActionElement(XMIActionElement, xmiString, subClasses, subInterfaces, subMethods, subActionElements);
		 methodUnit.blockUnit.actionElements.push(actionElement);


//		 methodUnit.methodUnits=MethodUnit.methodUnits.concat(actionElement.methodUnits);
//		 methodUnit.attrUnits=MethodUnit.attrUnits.concat(actionElement.attrUnits);
//		 methodUnit.calls = methodUnit.calls.concat(actionElement.calls);
//		 methodUnit.classUnits=MethodUnit.classUnits.concat(actionElement.classUnits);
//		 methodUnit.interfaceUnits=MethodUnit.interfaceUnits.concat(actionElement.interfaceUnits);
//		 methodUnit.imports=MethodUnit.imports.concat(actionElement.imports);
//		 methodUnit.blockUnits.push(methodUnit.blockUnit);
//		 methodUnit.blockUnits=MethodUnit.blockUnits.concat(actionElement.blockUnits);
//		 methodUnit.addresses=MethodUnit.addresses.concat(actionElement.addresses);
//		 methodUnit.reads=MethodUnit.reads.concat(actionElement.reads);
//		 methodUnit.calls=MethodUnit.calls.concat(actionElement.calls);
//		 methodUnit.creates=MethodUnit.creates.concat(actionElement.creates);
//		 methodUnit.actionElements.push(actionElement);
//		 methodUnit.actionElements=MethodUnit.actionElements.concat(actionElement.actionElements);

//			for(var k in actionElement.methodUnits){
//				var foundMethodUnit = actionElement.methodUnits[k];
//				if(foundMethodUnit.isResponse){
//				 methodUnit.isResponse = true;
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
		if(methodUnit.isResponse){
		debug.appendFile("identified_response_method_units", methodUnit.signature.name);
		}

		return methodUnit;
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
		var classUnit = {
				name: XMIClassUnit['$']['name'],
				isAbstract: XMIClassUnit['$']['isAbstract'],
				source : null,
				methodUnits : [],
				attrUnits: [],
//				calls : [],
//				classUnits: [],
				interfaceUnits : [],
				imports : [],
				classUnits: [],
//				blockUnits : [],
//				addresses: [],
//				reads:[],
//				calls:[],
//				creates:[],
//				actionElements:[],
//				isResponse: false,
				UUID: XMIClassUnit['$']['UUID'],
				attachment: XMIClassUnit
		}

		var XMISource = jp.query(XMIClassUnit, '$.source[?(@[\'$\'][\'xsi:language\'])]')[0];

		if(XMISource){
		var XMIRegion = jp.query(XMISource, '$.region[?(@[\'$\'][\'xsi:language\'])]')[0];
		classUnit.source = {
				region: {
					language: XMIRegion['$']['language']
				}
		}
		}
		var XMIImports = jp.query(XMIClassUnit, '$.codeRelation[?(@[\'$\'][\'xsi:type\']==\'code:Imports\')]');

		for(var i in XMIImports){
			var XMIImport = XMIImports[i];
			classUnit.imports.push({
				from:XMIImport['$']['from'],
				to:XMIImport['$']['to']
			})
		}

		var XMIStorableUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');

		for(var i in XMIStorableUnits){
			var XMIStorableUnit = XMIStorableUnits[i];
			classUnit.attrUnits.push({
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
			classUnit.methodUnits.push(methodUnit);

//			classUnit.methodUnits = classUnit.methodUnits.concat(methodUnit.methodUnits);
//			classUnit.attrUnits = classUnit.attrUnits.concat(methodUnit.attrUnits);
//			classUnit.calls = classUnit.calls.concat(methodUnit.calls);
//			classUnit.classUnits=classUnit.classUnits.concat(methodUnit.classUnits);
//			classUnit.interfaceUnits=classUnit.interfaceUnits.concat(methodUnit.interfaceUnits);
//			classUnit.imports=classUnit.imports.concat(methodUnit.imports);
//			classUnit.blockUnits=classUnit.blockUnits.concat(methodUnit.blockUnits);
//			classUnit.addresses=classUnit.addresses.concat(methodUnit.addresses);
//			classUnit.reads=classUnit.reads.concat(methodUnit.reads);
//			classUnit.calls=classUnit.calls.concat(methodUnit.calls);
//			classUnit.creates=classUnit.creates.concat(methodUnit.creates);
//			classUnit.actionElements=classUnit.actionElements.concat(methodUnit.actionElements);

//
//			for(var j in methodUnit.methodUnits){
//				if(methodUnit.methodUnits[j].isResponse){
//					classUnit.isResponse = true;
//					break;
//				}
//			}
//
//			if(methodUnit.isResponse){
//				classUnit.isResponse = true;
//			}
			
			if(subMethods){
				subMethods.push(methodUnit);
			}
		}

		var XMIInterfaceUnits = jp.query(XMIClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:InterfaceUnit\')]');
		for(var i in XMIInterfaceUnits){
			var XMIInterfaceUnit = XMIInterfaceUnits[i];
			classUnit.interfaceUnits.push({
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

//			classUnit.methodUnits.concat(includedClassUnit.methodUnits);
//			classUnit.attrUnits.concat(includedClassUnit.attrUnits);
//			classUnit.calls.concat(includedClassUnit.calls);
//			classUnit.classUnits.concat(includedClassUnit.classUnits);
//			classUnit.interfaceUnits.concat(includedClassUnit.interfaceUnits);
//			classUnit.imports.concat(includedClassUnit.imports);
//			classUnit.blockUnits.concat(includedClassUnit.blockUnits);
//			classUnit.addresses.concat(includedClassUnit.addresses);
//			classUnit.reads.concat(includedClassUnit.reads);
//			classUnit.calls.concat(includedClassUnit.calls);
//			classUnit.creates.concat(includedClassUnit.creates);
//			classUnit.actionElements.push(includedClassUnit.actionElements);

//			classUnit.methodUnits = classUnit.methodUnits.concat(includedClassUnit.methodUnits);
//			classUnit.attrUnits = classUnit.attrUnits.concat(includedClassUnit.attrUnits);
//			classUnit.calls = classUnit.calls.concat(includedClassUnit.calls);
//			classUnit.classUnits=classUnit.classUnits.concat(includedClassUnit.classUnits);
//		 classUnit.interfaceUnits=classUnit.interfaceUnits.concat(includedClassUnit.interfaceUnits);
//		 classUnit.imports=classUnit.imports.concat(includedClassUnit.imports);
//		 classUnit.blockUnits=classUnit.blockUnits.concat(includedClassUnit.blockUnits);
//		 classUnit.addresses=classUnit.addresses.concat(includedClassUnit.addresses);
//		 classUnit.reads=classUnit.reads.concat(includedClassUnit.reads);
//		 classUnit.calls=classUnit.calls.concat(includedClassUnit.calls);
//		 classUnit.creates=classUnit.creates.concat(includedClassUnit.creates);
//		 classUnit.actionElements=classUnit.actionElements.concat(includedClassUnit.actionElements);

		 classUnit.classUnits.push(IncludedClassUnit);

//				if(includedClassUnit.isResponse){
//				 classUnit.isResponse = true;
//				}
			
			if(subClasses){
				subClasses.push(IncludedClassUnit);
			}
		}

		return classUnit;

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

	function identifyAttrUnits(xmiClass) {
		var attrUnits = [];
		var XMIStorableUnits = jp.query(xmiClass, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
		for (var i in XMIStorableUnits) {
			var XMIStorableUnit = XMIStorableUnits[i];
			attrUnits.push({
				name: XMIStorableUnit['$']['name'],
				type:  convertToJsonPath(XMIStorableUnit['$']['type']) // this is a path to the class
			});
		}

		return attrUnits;
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
	//			console.log(responseMethod.signature.name);
	//			console.log(actionElement);
				calls = calls.concat(actionElement.calls);
	
				for(var i in actionElement.actionElements){
					calls = calls.concat(findCallsFromActionElement(actionElement.actionElements[i]));
				}
	
				return calls;
			}
	
			for(var i in methodUnit.blockUnit.actionElements){
	
				var actionElement = methodUnit.blockUnit.actionElements[i];
				calls = calls.concat(findCallsFromActionElement(actionElement));
			}
	
			return calls;
		}

	//	function findSubClasses(classUnit){
	//		function findSubClassesFromActionElement(actionElement){
	//			var classUnits = [];
	//			for(var k in actionElement.classUnits){
	//				classUnits.push(actionElement.classUnits[k]);
	//				var subClassUnits = findSubClasses(actionElement.classUnits[k]);
	//				classUnits = classUnits.concat(subClassUnits);
	//			}
	//			return classUnits;
	//		}
	//		var classUnits = [];
	//		for(var i in classUnit.methodUnits){
	//			var actionElements = classUnit.methodUnits[i].blockUnit.actionElements;
	//			for(var j in actionElements){
	//				var actionElement = actionElements[j];
	//				classUnits = classUnits.concat(findSubClassesFromActionElement(actionElement));
	//				for(var k in actionElement.actionElements){
	//					classUnits = classUnits.concat(findSubClassesFromActionElement(actionElement.actionElements[k]));
	//				}
	//			}
	//		}
	//
	//		return classUnits;
	//	}

	//	function locateClassUnitForMethod(methodUnitToCompare, classUnits){
	//		console.log("UUID");
	//		console.log(methodUnitToCompare.UUID);
	//
	//		function identifyFromActionElement(targetActionElement, methodUnitToCompare){
	//
	//			for(var i in targetActionElement.classUnits){
	//			var result = locateClassUnitForMethod(methodUnitToCompare, targetActionElement.classUnits[i]);
	//			if(result){
	//				return result;
	//			}
	//			}
	//			for(var i in targetActionElement.actionElements){
	//				var result = identifyFromActionElement(targetActionElement.actionElements, methodUnitToCompare);
	//				if(result){
	//					return result;
	//				}
	//			}
	//
	//			return false;
	//		}
	////		var classUnitToSelect = null;
	//		for(var i in classUnits){
	//			var classUnit = classUnits[i];
	//			if(!classUnit){
	//				continue;
	//			}
	//			console.log(classUnit);
	//			var methodUnits = classUnit.methodUnits;
	//			for(var j in methodUnits){
	//				var methodUnit = methodUnits[j];
	//				if(methodUnit.UUID === methodUnitToCompare.UUID){
	//					return classUnit;
	//				}
	//				else{
	//					for(var k in methodUnit.blockUnit.actionElements){
	//						var actionElement = methodUnit.blockUnit.actionElements[k];
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
	//	function locateMethodUnitForActionElement(actionElementToCompare, classUnits){
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
	//					for(var i in targetActionElement.actionElements){
	//						var includedActionElement = targetActionElement.actionElements[i];
	//						var result = IdentifyFromActionElement(includedActionElement, associatedMethod, actionElementToCompare);
	//						if(result){
	//							return result;
	//						}
	//					}
	//
	//
	//					var result = locateMethodUnitForActionElement(actionElementToCompare, targetActionElement.classUnits);
	//					if(result){
	//						return false;
	//					}
	//				}
	//
	//			return false;
	//		}
	//
	//		for(var i in classUnits){
	//			var classUnit = classUnits[i];
	//			var methodUnits = classUnit.methodUnits;
	//			for(var j in methodUnits){
	//				var methodUnit = methodUnits[j];
	//				for(var k in methodUnit.blockUnit.actionElements){
	//					var actionElement = methodUnit.blockUnit.actionElements[k];
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


	//	function isResponseClass(classUnit){
	//		for(var i in classUnit.methodUnits){
	//			if(classUnit.methodUnits[i].isResponse){
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
//				var methodUnits = classUnit.methodUnits;
//				for(var k in methodUnits){
//					var methodUnit = methodUnits[k];
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
//			for(var i in actionElement.classUnits){
//				var classUnit = actionElement.classUnits[i];
//				var result = findSubMethods(classUnit);
//				subMethods = subMethods.concat(result);
//			}
//			for(var i in actionElement.actionElements){
//				var result = findSubMethodsFromActionElement(actionElement.actionElements[i]);
//				subMethods = subMethods.concat(result);
//			}
//			
//			return subMethods;
//		}
//		
//		for(var i in classUnit.methodUnits){
//				var methodUnit = classUnit.methodUnits[i];
//				subMethods.push(methodUnit);
//				
//				for(var j in methodUnit.blockUnit.actionElements){
//					var actionElement = methodUnit.blockUnit.actionElements[j];
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
			identifyAttrUnits: identifyAttrUnits,
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
