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
	
	// system classes include all the class elements which are developed in the project. The classes don't include the classes from the third party applications.
	function identifyExternalClass(xmiString) {
		//the system classes are determined by excluding the classes that are within the external packages.
		console.log("determine external class units");

		//		var externalClassUnits = [];
		var externalClassUnitsByName = {};
		
			for (var j in XMIExternalClasses) {
				var XMIExternalClassUnit = XMIExternalClasses[j];
				var classUnit = {
					name: XMIExternalClassUnit['$']['name'],
					type: XMIExternalClassUnit['$']['xsi:type'],
				}

				externalClassUnitsByName[classUnit.name] = classUnit;
			}
			
		console.log("================================");
		return externalClassUnitsByName;
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

		var includedXMIActionElements = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');

		for(var i in includedXMIActionElements){
			var includedXMIActionElement = includedXMIActionElements[i];
			var includedActionElement = identifyActionElement(includedXMIActionElement, xmiString, subClasses, subInterfaces, subMethods, subActionElements);
			ActionElement.ActionElements.push(includedActionElement);
			
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

    // calls = [{to: , from: }]
		var calls = [];

		var XMICalls = jp.query(xmiString, '$..actionRelation[?(@[\'$\'][\'xsi:type\']==\'action:Calls\')]');
		for(var i in XMICalls){
			var XMICall = XMICalls[i];
			calls.push({
				to: XMICall['$']['to'],
				from:XMICall['$']['from']
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
				to: XMIExtend['$']['to'],
				from: XMIExtend['$']['from']
			});
		}

		return extendInstances;
	}

	function identifyStorableUnits(xmiString) {
		var storableUnits = [];
		var XMIStorableUnits = jp.query(xmiString, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
		for (var i in XMIStorableUnits) {
			var XMIStorableUnit = XMIStorableUnits[i];
			storableUnits.push({
				name: XMIStorableUnit['$']['name'],
				type: XMIStorableUnit['$']['type'] // this is a path to the class
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


	
	
	module.exports = {
			convertToJsonPath : convertToJsonPath,
			identifyActionElement: identifyActionElement,
			identifyMethodUnit: identifyMethodUnit,
			identifyClassUnit: identifyClassUnit,
			identifyCalls: identifyCalls,
			identifyExtends: identifyExtends,
			identifyStorableUnits: identifyStorableUnits,
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
