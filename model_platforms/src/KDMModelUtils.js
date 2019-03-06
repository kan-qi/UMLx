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

	
	function convertToJsonPath(path){
		if(!path){
			return "undefined";
		}
		var toNodes = path.split('/');
		var jsonPath = "$['xmi:XMI']['kdm:Segment'][0]";
		for(var i in toNodes){
			var toNode = toNodes[i];
			if(!toNode.startsWith("@")){
				continue;
			}
			var parts = toNode.replace("@", "").split(".");
			jsonPath += "['"+parts[0]+"']["+parts[1]+"]";
		}
		
		return jsonPath;
	}
	
	// system classes include all the class elements which are developed in the project. The classes don't include the classes from the third party applications.
	function identifyExternalClass(xmiString) {
		//the system classes are determined by excluding the classes that are within the external packages.

		var externalClassUnitsByName = {};
		
		var XMIExternalModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\' && @[\'$\'][\'name\']==\'externals\')]');

		for (var i in XMIExternalModels) {
			var XMIExternalModel = XMIExternalModels[i];
			var XMIExternalClasses = jp.query(XMIExternalModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\' || @[\'$\'][\'xsi:type\']==\'code:InterfaceUnit\' || @[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
			for (var j in XMIExternalClasses) {
				var XMIExternalClassUnit = XMIExternalClasses[j];
				var classUnit = {
					name: XMIExternalClassUnit['$']['name'],
					type: XMIExternalClassUnit['$']['xsi:type'],
				}

				externalClassUnitsByName[classUnit.name] = classUnit;
			}
		}

		return externalClassUnitsByName;
	}
	
	function identifyAggregateClassUnits(xmiString){

		var XMIPackagedClassUnits = identifyPackagedClassUnits(xmiString);
		
		//scan the xmi files, and establish the necessary dictionaries.
		for (var k in XMIPackagedClasseUnits) {
					console.log("inspect Classes....");
					var XMIClass = XMIPackagedClasseUnits[k];

					var subClassUnits = [];
					var subMethodUnits = [];
					var subInterfaces = [];

					var identifiedClassUnit = identifyClassUnit(XMIClass, xmiString, subClassUnits, subInterfaces, subMethodUnits);
					identifiedClassUnit.isWithinBoundary = XMIClass.isWithinBoundary;

					subClassUnits.push(identifiedClassUnit);

					for (l in subClassUnits) {
						subClassUnits[l].isWithinBoundary = XMIClass.isWithinBoundary;
						dicClassUnits[subClassUnits[l].UUID] = subClassUnits[l];

						for (var m in subClassUnits[l].methodUnits) {
							dicMethodClass[subClassUnits[l].methodUnits[m].UUID] = subClassUnits[l].UUID;
						}
					}

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

					for (var l in subMethodUnits) {
						var subMethodUnit = subMethodUnits[l];
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
		}
		
	}

	function aggregateClassUnit(subClassUnits, isWithinBoundary, dicClassComposite, dicCompositeSubclasses) {


		var compositeClassUnit = {
			methodUnits : [],
			attrUnits: [],
			classUnits: subClassUnits,
			UUID: uuidV1(),
			isComposite: (subClassUnits.length != 1),
			isWithinBoundary: isWithinBoundary
		}
		compositeClassUnit.name = compositeClassUnit.UUID;

		var childrenClasses = [];

		for (var i in subClassUnits) {
			var subClassUnit = subClassUnits[i];
			compositeClassUnit.methodUnits = compositeClassUnit.methodUnits.concat(subClassUnit.methodUnits);
			compositeClassUnit.attrUnits = compositeClassUnit.attrUnits.concat(subClassUnit.attrUnits);
			dicClassComposite[subClassUnit.UUID] = compositeClassUnit.UUID;
			childrenClasses.push(subClassUnit.UUID);
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
						attrUnits: [],
						classUnits: [],
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
			});
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

			if(subActionElements){
				subActionElements.push(includedActionElement);
			}
		}

		var XMIClassUnits = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
		for(var i in XMIClassUnits){
			var XMIClassUnit = XMIClassUnits[i];
			var includedClassUnit = identifyClassUnit(XMIClassUnit, xmiString, subClasses, subInterfaces, subMethods, subActionElements);

			if(!includedClassUnit.name){
				includedClassUnit.name = XMIActionElement.name+"_inner_"+i;
			}

		 actionElement.classUnits.push(includedClassUnit);
			
			if(subClasses){
				subClasses.push(includedClassUnit);
			}
		}

		return actionElement;
	}
	
	function identifyMethodUnit(XMIMethodUnit, xmiString, subClasses, subInterfaces, subMethods, subActionElements){
		
		var methodUnit = {
				UUID: XMIMethodUnit['$']['UUID'],
				signature: null,
				blockUnit : {
					actionElements: []
				},
				attachment: XMIMethodUnit
		}

		var XMISignature = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Signature\')]')[0];
		if(XMISignature){
		var XMIParameters = jp.query(XMISignature, '$.parameterUnit[?(@[\'$\'][\'type\'])]');

		methodUnit.signature = {
				name: XMISignature['$']['name'],
				parameterUnits: []
		};

		for(var j in XMIParameters){
			
			var parameterType = {
					name: "unknown",
			}
			
			var XMIParameterType = jp.query(xmiString, convertToJsonPath(XMIParameters[j]['$']['type']))[0];
			if(XMIParameterType){
				parameterType.name = XMIParameterType['$']['name'];
				parameterType.UUID = XMIParameterType['$']['UUID'];
			}
			
			methodUnit.signature.parameterUnits.push({
				name: XMIParameters[j]["$"]["name"],
				kind: XMIParameters[j]['$']['kind'],
				type: parameterType
			});
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
		 
			if(subActionElements){
				subActionElements.push(actionElement);
			}
		}
		}

		return methodUnit;
	}

	function identifyClassUnit(XMIClassUnit, xmiString, subClasses, subInterfaces, subMethods, subActionElements){

		console.log("identify:"+XMIClassUnit['$']['name']);

		// those elements store all the same type of elements in the sub classes.
		var classUnit = {
				name: XMIClassUnit['$']['name'],
				isAbstract: XMIClassUnit['$']['isAbstract'],
				source : null,
				methodUnits : [],
				attrUnits: [],
				interfaceUnits : [],
				imports : [],
				classUnits: [],
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

			classUnit.classUnits.push(IncludedClassUnit);
			
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

		var XMIClassUnits = jp.query(xmiString, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
		var externalClass
		var classUnits = [];
		var externalClassUnitsByName = identifyExternalClass(xmiString);
		var externalClassUnits = [];
		var systemClassUnits = [];
		var systemComponetClassUnits = [];
		for(var i in XMIClassUnits){
			var XMIClassUnit = XMIClassUnits[i];
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
			}

			classUnits.push(classUnit);

			if(externalClassUnitsByName[classUnit.name]){
				externalClassUnits.push(classUnit);
			}
			else{
				systemClassUnits.push(classUnit);
			}
		}

		classUnitsByCategories = {
				classUnits: classUnits,
				systemClassUnits: systemClassUnits,
				systemComponentClassUnits: systemClassUnits, //just for experimental purpose.
				externalClassUnits: externalClassUnits
			};

		return classUnitsByCategories;
	}
	
	function createCodeElement(XMICodeElement){
		var codeElement = {
				name: XMICodeElement['$']['name'],
				stereoType: XMICodeElement['$']['xsi:type'],
		        type: XMICodeElement['$']['type'],
		        uuid: XMICodeElement['$']['UUID'],
		}
		return codeElement;
	}

		/*
		 * this function will exclude the calls within another function
		 */
		function findCallsForMethod(methodUnit){
			var calls = [];
	
			function findCallsFromActionElement(actionElement){
				var calls = [];
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

	function createMethodUnit(XMIMethodUnit) {
		return {
			name: XMIMethodUnit['$']['name'],
			kind: XMIMethodUnit['$']['kind'],
			UUID: XMIMethodUnit['$']['UUID']
		};
	}

	function createActionElement(XMIActionElement) {
		return {
			name: XMIActionElement['$']['name'],
			kind: XMIActionElement['$']['kind'],
			UUID: XMIActionElement['$']['UUID'],
		}
	}

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
					var isWithinBoundary = true;
					if (XMIModel['$']['name'] === "externals") {
						isWithinBoundary = false;
					}
					//search the top level classes under the packages.
					var XMIPackages = jp.query(XMIModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Package\')]');
					for (var j in XMIPackages) {
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
