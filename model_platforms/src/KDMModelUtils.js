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
	
	function identifyActionElement(XMIActionElement, xmiString){
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
			var includedActionElement = identifyActionElement(includedXMIActionElement, xmiString);
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
		}

		var XMIClassUnits = jp.query(XMIActionElement, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
		console.log("---inner classes------");
//		console.log(XMIClassUnits);
		for(var i in XMIClassUnits){
			console.log("---------------inner classes--------------");
			var XMIClassUnit = XMIClassUnits[i];
			var includedClassUnit = identifyClassUnit(XMIClassUnit, xmiString);

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
		}

		console.log("identified action element");
		console.log(ActionElement);

		return ActionElement;
	}
	
	function identifyMethodUnit(XMIMethodUnit, xmiString){

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
				isResponse: false,
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
			console.log("iterate parameters");
			MethodUnit.Signature.parameterUnits.push({
				name: XMIParameters[j]["$"]["name"],
				kind: XMIParameters[j]['$']['kind'],
				type: XMIParameters[j]['$']['type']
			});
//			MethodUnit.key += "_"+ XMIParameters[j]["$"]["name"]+"_"+XMIParameters[j]["$"]["kind"];

			var XMIParameterType = jp.query(xmiString, convertToJsonPath(XMIParameters[j]["$"]['type']));
			console.log("parameter type");
			console.log(XMIParameterType);
			console.log("determine response method");
			if(XMIParameterType){
				if(XMIParameterType[0]['$']['name'].indexOf("event") !=-1 || XMIParameterType[0]['$']['name'].indexOf("Event") !=-1) {
					MethodUnit.isResponse = true;
					console.log("found response method");
				}
			}


		}


		if(XMISignature["$"]["name"] === "main"){
			MethodUnit.isResponse = true;
		}

		}

		//identify action elements from blockUnit
		var XMIBlockUnit = jp.query(XMIMethodUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:BlockUnit\')]')[0];
		if(XMIBlockUnit){
		var XMIActionElements = jp.query(XMIBlockUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'action:ActionElement\')]');
		for(var j in XMIActionElements){
			var XMIActionElement = XMIActionElements[j];
			actionElement = identifyActionElement(XMIActionElement, xmiString);
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
		}
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
	 */
	function identifyClassUnit(XMIClassUnit, xmiString){

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
			var methodUnit = identifyMethodUnit(XMIMethodUnit, xmiString);
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

			var IncludedClassUnit = identifyClassUnit(includedXMIClassUnit, xmiString);
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
		var methodUnitsByName = {};
		for(var i in XMIMethodUnits){
			var XMIMethodUnit = XMIMethodUnits[i];
			console.log(XMIMethodUnit);
			var actionElement = createMethodUnit(XMIMethodUnit);
			methodUnitsByName[actionElement.UUID] = actionElement;
		}

		return methodUnitsByName;
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
			})
		}

		return calls;
	}

	
	
	module.exports = {
			convertToJsonPath : convertToJsonPath,
			identifyActionElement: identifyActionElement,
			identifyMethodUnit: identifyMethodUnit,
			identifyClassUnit: identifyClassUnit,
			identifyCalls: identifyCalls
	}
}());
