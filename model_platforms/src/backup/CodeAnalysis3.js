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
 * /*
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

(function () {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var uuidV1 = require('uuid/v1');
	var kdmModelUtils = require("./KDMModelUtils.js");
	var kdmModelDrawer = require("./KDMModelDrawer.js");

	var dicClassUnits = {};
	var dicMethodUnits = {};
	var dicCompositeClasses = {};
	var dicClassComposite = {}; // {subclass.UUID, compositeClassUnit.UUID}
	var dicCompositeSubclasses = {}; // {compositeClassUnit.UUID, [subclass.UUID]}
	var dicMethodClass = {};	 // {method.uuid, class.uuid}
	var dicActionElementMethod = {};

	function analyseCode(xmiString, outputDir) {
		kdmModelUtils.assignUUID(xmiString);

		//		var debug = require("../../utils/DebuggerOutput.js");
		//		debug.writeJson("KDM_Example", xmiString);
		//		console.log("determine the class units within the model");

		console.log("========================================");

		console.log("identify the structured class units");

		var topClassUnits = [];
		
		var XMIPackagedClassUnits = kdmModelUtils.identifyPackagedClassUnits(xmiString);
		
//		var XMIModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\')]');

		//scan the xmi files, and establish the necessary dictionaries.
		for (var k in XMIPackagedClasseUnits) {
					console.log("inspect Classes....");
					var XMIClass = XMIPackagedClasseUnits[k];

					var subClassUnits = [];
					var subMethodUnits = [];
					var subInterfaces = [];
					//						var subActionElements = [];

					var identifiedClassUnit = kdmModelUtils.identifyClassUnit(XMIClass, xmiString, subClassUnits, subInterfaces, subMethodUnits);
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

		// console.log("classUnits");
		// console.log(classUnits);
		// console.log("topClassUnits");
		// console.log(topClassUnits);
		//
		// console.log("dicCompositeClasses");
		// console.log(dicCompositeClasses);
		//
		// console.log("dicClassComposite");
		// console.log(dicClassComposite);

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

		console.log("=====================================");

		console.log("construct the dependency graphs");

		var referencedClassUnits = [];
		var referencedClassUnitsComposite = [];

		var dicMethodParameters = {};

		var callGraph = constructCallGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
		var typeDependencyGraph = constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
		var accessGraph = constructAccessGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
		var extendsGraph = constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);
		var compositionGraph = constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters);

		//		console.log("dicCompositeSubclasses");
		//		console.log(dicCompositeSubclasses);
		// console.log("typeDependencyGraph");
		// console.log(typeDependencyGraph);

		//		debug.writeJson("constructed_call_graph", callGraph);


		return {
			dicClassUnits: dicClassUnits,
			dicMethodUnits: dicMethodUnits,
			callGraph: callGraph,
			dicMethodClass: dicMethodClass,
			typeDependencyGraph: typeDependencyGraph,
			accessGraph: accessGraph,
			extendsGraph: extendsGraph,
			compositionGraph: compositionGraph,
			referencedClassUnits: referencedClassUnits,
			referencedClassUnitsComposite: referencedClassUnitsComposite,
			dicCompositeSubclasses: dicCompositeSubclasses,
			dicMethodParameters: dicMethodParameters,
		};
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

	//	function locateCompositeClassUnit(classUnitUUID, dicCompositeClasses) {
	//
	//		for (var i in dicCompositeClasses) {
	//			var compositeClassUnit = dicCompositeClasses[i];
	//			if (compositeClassUnit.UUID == classUnitUUID) {
	//				return compositeClassUnit;
	//			}
	//		}
	//
	//		return null;
	//
	//	}

	function constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters) {

		// var edges = [];
		// var nodes = [];
		// var nodesByName = {};

		var edgesAttr = [];
		var nodesAttr = [];
		var nodesByNameAttr = {};

		var edgesLocal = [];
		var nodesLocal = [];
		var nodesByNameLocal = {};

		var edgesPara = [];
		var nodesPara = [];
		var nodesByNamePara = {};

		var nodesP = [];
		var edgesP = [];
		var nodesByNameP = {};

		var edgesAttrComposite = [];
		var nodesAttrComposite = [];
		var nodesByNameAttrComposite = {};

		var nodesPComposite = [];
		var edgesPComposite = [];
		var nodesByNamePComposite = {};

		// console.log("top classes");
		// console.log(topClassUnits);

		for (var i in dicClassUnits) {
			var classUnit = dicClassUnits[i];
			//			console.log('test');
			//			console.log(classUnit);
			// var xmiClassUnit = classUnit.attachment;
			var XMIClassStorableUnits = classUnit.StorableUnits
			for (var q in XMIClassStorableUnits) {
				var XMIClassStorableUnit = XMIClassStorableUnits[q];
				if (XMIClassStorableUnit.type == undefined) {
					continue;
				}
				var XMIClassStorableUnitType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(XMIClassStorableUnit.type));
				var targetClassUnit = null;
				// console.log('StorableUnit');
				// console.log(XMIClassStorableUnitType[0]['$']['UUID']);

				if (!XMIClassStorableUnitType || XMIClassStorableUnitType.length < 1) {
					continue;
				}

				for (var j in dicClassUnits) {
					var classUnitCandidate = dicClassUnits[j];
					if (classUnitCandidate.UUID == XMIClassStorableUnitType[0]['$']['UUID']) {
						targetClassUnit = classUnitCandidate;
					}
				}
				console.log("targetClassUnit");
				console.log(targetClassUnit);
				if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within dicClassUnits, like string, int...
					continue;
				}

				var compositeClassUnitUUID = dicClassComposite[classUnit.UUID];
				var compositeTargetClassUnitUUID = dicClassComposite[targetClassUnit.UUID];
				var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
				var compositeTargetClassUnit = dicCompositeClasses[compositeTargetClassUnitUUID];

				// eliminate the composite classes which are not composite (only containing one original class) and not related to other classes
				if ((compositeClassUnit != compositeTargetClassUnit) || compositeClassUnit.isComposite) {
					if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
						referencedClassUnitsComposite.push(compositeClassUnit);
					}

					if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
						referencedClassUnitsComposite.push(compositeTargetClassUnit);
					}
				}
				else {
					continue;
				}

				var startNodeComposite = nodesByNameAttrComposite[compositeClassUnit.UUID];
				if (!startNodeComposite) {
					startNodeComposite = {
						name: compositeClassUnit.name,
						// isResponse: methodUnit.isResponse,
						component: {
							name: compositeClassUnit.name,
							classUnit: compositeClassUnit.UUID
						},
						UUID: compositeClassUnit.UUID
						//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodesAttrComposite.push(startNodeComposite);
					nodesByNameAttrComposite[compositeClassUnit.UUID] = startNodeComposite;
				}

				var endNodeComposite = nodesByNameAttrComposite[compositeTargetClassUnit.UUID];
				if (!endNodeComposite) {
					endNodeComposite = {
						name: compositeTargetClassUnit.name,
						// isResponse: targetMethodUnit.isResponse,
						component: {
							name: compositeTargetClassUnit.name,
							classUnit: compositeTargetClassUnit.UUID,
						},
						UUID: compositeTargetClassUnit.UUID
						//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodesAttrComposite.push(endNodeComposite);
					nodesByNameAttrComposite[compositeTargetClassUnit.UUID] = endNodeComposite;
				}
				//				var end = targetClassUnit.name;
				edgesAttrComposite.push({ start: startNodeComposite, end: endNodeComposite });



				if (classUnit != targetClassUnit) {
					if (!referencedClassUnits.includes(classUnit)) {
						referencedClassUnits.push(classUnit);
					}

					if (!referencedClassUnits.includes(targetClassUnit)) {
						referencedClassUnits.push(targetClassUnit);
					}
				}
				else {
					continue;
				}

				var startNode = nodesByNameAttr[classUnit.UUID];
				if (!startNode) {
					startNode = {
						name: classUnit.name + ":" + XMIClassStorableUnit.name,
						// isResponse: methodUnit.isResponse,
						component: {
							name: classUnit.name,
							classUnit: classUnit.UUID
						},
						UUID: XMIClassStorableUnit.UUID,
						attributeName: XMIClassStorableUnit.name
						//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodesAttr.push(startNode);
					nodesByNameAttr[classUnit.UUID] = startNode;
				}

				var endNode = nodesByNameAttr[targetClassUnit.UUID];
				if (!endNode) {
					endNode = {
						name: targetClassUnit.name,
						// isResponse: targetMethodUnit.isResponse,
						component: {
							name: targetClassUnit.name,
							classUnit: targetClassUnit.UUID,
						},
						UUID: targetClassUnit.UUID
						//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodesAttr.push(endNode);
					nodesByNameAttr[targetClassUnit.UUID] = endNode;
				}
				//				var end = targetClassUnit.name;
				edgesAttr.push({ start: startNode, end: endNode });




			}
			// var calls = kdmModelUtils.identifyCalls(xmiClassUnit);
			// var XMIMethodUnits = jp.query(xmiClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
			var XMIMethodUnits = classUnit.MethodUnits;
			for (var i in XMIMethodUnits) {
				// var XMIMethodUnit = XMIMethodUnits[i];
				// var methodUnit = kdmModelUtils.identifyMethodUnit(XMIMethodUnit, xmiString);
				var methodUnit = XMIMethodUnits[i];
				var methodParameters = methodUnit.Signature.parameterUnits; // the parameters of the method, including input and return
				// var methodClassUnit = locateClassUnitForMethod(methodUnit, topClassUnits); // the class which owns the method
				var methodClassUnit = classUnit;

				if (!methodParameters || !methodClassUnit || !methodClassUnit.isWithinBoundary) {
					continue;
				}

				// To find the local variable
				var methodActionElements = methodUnit.BlockUnit.ActionElements;
				for (var k in methodActionElements) {
					var methodActionElement = methodActionElements[k];
					var methodLocalVariables = methodActionElement.StorableUnits;
					for (var p in methodLocalVariables) {
						var methodLocalVariable = methodLocalVariables[p];
						var localVariableType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodLocalVariable.type));
						if (!localVariableType || localVariableType.length < 1) {
							continue;
						}
						var targetClassUnit = null;
						for (var j in dicClassUnits) {
							var classUnitCandidate = dicClassUnits[j];
							if (classUnitCandidate.UUID == localVariableType[0]['$']['UUID']) {
								targetClassUnit = classUnitCandidate;
							}
						}
						if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within dicClassUnits, like string, int...
							continue;
						}

						var compositeClassUnitUUID = dicClassComposite[methodClassUnit.UUID];
						var compositeTargetClassUnitUUID = dicClassComposite[targetClassUnit.UUID];
						var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
						var compositeTargetClassUnit = dicCompositeClasses[compositeTargetClassUnitUUID];


						if ((compositeClassUnit != compositeTargetClassUnit) || compositeClassUnit.isComposite) {
							if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
								referencedClassUnitsComposite.push(compositeClassUnit);
							}

							if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
								referencedClassUnitsComposite.push(compositeTargetClassUnit);
							}
						}
						else {
							continue;
						}

						var startNodeComposite = nodesByNamePComposite[methodUnit.UUID];
						if (!startNodeComposite) {
							startNodeComposite = {
								name: compositeClassUnit.name + ":" + methodUnit.Signature.name + ":" + methodLocalVariable.name,
								// isResponse: methodUnit.isResponse,
								component: {
									name: compositeClassUnit.name,
									classUnit: compositeClassUnit.UUID
								},
								// UUID: compositeClassUnit.UUID
								//							isWithinBoundary: targetClassUnit.isWithinBoundary
							};
							nodesPComposite.push(startNodeComposite);
							nodesByNamePComposite[methodUnit.UUID] = startNodeComposite;
						}

						var endNodeComposite = nodesByNamePComposite[compositeTargetClassUnit.UUID];
						if (!endNodeComposite) {
							endNodeComposite = {
								name: compositeTargetClassUnit.name,
								// isResponse: targetMethodUnit.isResponse,
								component: {
									name: compositeTargetClassUnit.name,
									classUnit: compositeTargetClassUnit.UUID,
								},
								UUID: compositeTargetClassUnit.UUID
								//							isWithinBoundary: targetClassUnit.isWithinBoundary
							};
							nodesPComposite.push(endNodeComposite);
							nodesByNamePComposite[compositeTargetClassUnit.UUID] = endNodeComposite;
						}
						//				var end = targetClassUnit.name;
						edgesPComposite.push({ start: startNodeComposite, end: endNodeComposite });

						if (methodClassUnit != targetClassUnit) {
							if (!referencedClassUnits.includes(methodClassUnit)) {
								referencedClassUnits.push(methodClassUnit);
							}

							if (!referencedClassUnits.includes(targetClassUnit)) {
								referencedClassUnits.push(targetClassUnit);
							}
						}
						else {
							continue;
						}

						if (!(dicMethodParameters.hasOwnProperty(methodUnit.UUID))) {
							var methodParameters = methodUnit.Signature.parameterUnits;
							var name = null;
							var dicParameters = [];
							for (var l in methodParameters) {
								if (methodParameters[l].hasOwnProperty('name')) {
									name = methodParameters[l].name;
								}
								//								var type = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodParameters[l].type));
								var type = methodParameters[l].type;
								var typeClass = null;
								for (var j in dicClassUnits) {
									var classUnitCandidate = dicClassUnits[j];
									if (classUnitCandidate.UUID == type.UUID) {
										typeClass = classUnitCandidate;
									}
								}
								if (!typeClass) {
									continue;
								}
								var parameter = {
									Name: name,
									// kind: methodParameters[l].kind,
									Type: typeClass.name,
									TypeUUID: typeClass.UUID,
								};
								dicParameters.push(parameter);
							}
							dicMethodParameters[methodUnit.UUID] = dicParameters;
						}

						var startNode = nodesByNameLocal[methodUnit.UUID];
						if (!startNode) {
							startNode = {
								name: methodClassUnit.name + ":" + methodUnit.Signature.name + ":" + methodLocalVariable.name,
								// isResponse: methodUnit.isResponse,
								component: {
									name: methodClassUnit.name,
									classUnit: methodClassUnit.UUID
								},
								// UUID: methodLocalVariable.UUID
								//							isWithinBoundary: targetClassUnit.isWithinBoundary
							};
							nodesLocal.push(startNode);
							nodesByNameLocal[methodUnit.UUID] = startNode;
							nodesP.push(startNode);
							nodesByNameP[methodUnit.UUID] = startNode;
						}

						var endNode = nodesByNameLocal[targetClassUnit.UUID];
						if (!endNode) {
							endNode = {
								name: targetClassUnit.name,
								// isResponse: targetMethodUnit.isResponse,
								component: {
									name: targetClassUnit.name,
									classUnit: targetClassUnit.UUID
								},
								UUID: targetClassUnit.UUID
								//							isWithinBoundary: targetClassUnit.isWithinBoundary
							};
							nodesLocal.push(endNode);
							nodesByNameLocal[targetClassUnit.UUID] = endNode;
							nodesP.push(endNode);
							nodesByNameP[targetClassUnit.UUID] = endNode;
						}
						//				var end = targetClassUnit.name;
						edgesLocal.push({ start: startNode, end: endNode });
						edgesP.push({ start: startNode, end: endNode });



						// console.log("checkcheckcheck!");
						// console.log({start: startNodeComposite, end: endNodeComposite});
						// console.log({start: startNode, end: endNode});

					}
				}

				// targeted at input and return parameters of this method
				for (var i in methodParameters) {
					var methodParameter = methodParameters[i];
					//					var XMIParameterType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodParameter.type));
					var type = methodParameter.type;
					//					
					//					if(!XMIParameterType || XMIParameterType.length < 1){
					//						continue;
					//					}

					//					console.log(XMIParameterType);

					var targetClassUnit = null;
					for (var j in dicClassUnits) {
						var classUnitCandidate = dicClassUnits[j];
						if (classUnitCandidate.UUID == type.UUID) {
							targetClassUnit = classUnitCandidate;
						}
					}

					if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within dicClassUnits, like string, int...
						continue;
					}

					var compositeClassUnitUUID = dicClassComposite[methodClassUnit.UUID];
					var compositeTargetClassUnitUUID = dicClassComposite[targetClassUnit.UUID];
					var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
					var compositeTargetClassUnit = dicCompositeClasses[compositeTargetClassUnitUUID];


					if ((compositeClassUnit != compositeTargetClassUnit) || compositeClassUnit.isComposite) {
						if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
							referencedClassUnitsComposite.push(compositeClassUnit);
						}

						if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
							referencedClassUnitsComposite.push(compositeTargetClassUnit);
						}
					}
					else {
						continue;
					}

					var startNodeComposite = nodesByNamePComposite[methodUnit.UUID];
					if (!startNodeComposite) {
						startNodeComposite = {
							name: compositeClassUnit.name + ":" + methodUnit.Signature.name + ":" + methodParameter.name,
							// isResponse: methodUnit.isResponse,
							component: {
								name: compositeClassUnit.name,
								classUnit: compositeClassUnit.UUID
							},
							// UUID: compositeClassUnit.UUID
							//							isWithinBoundary: targetClassUnit.isWithinBoundary
						};
						nodesPComposite.push(startNodeComposite);
						nodesByNamePComposite[methodUnit.UUID] = startNodeComposite;
					}

					var endNodeComposite = nodesByNamePComposite[compositeTargetClassUnit.UUID];
					if (!endNodeComposite) {
						endNodeComposite = {
							name: compositeTargetClassUnit.name,
							// isResponse: targetMethodUnit.isResponse,
							component: {
								name: compositeTargetClassUnit.name,
								classUnit: compositeTargetClassUnit.UUID,
							},
							UUID: compositeTargetClassUnit.UUID
							//							isWithinBoundary: targetClassUnit.isWithinBoundary
						};
						nodesPComposite.push(endNodeComposite);
						nodesByNamePComposite[compositeTargetClassUnit.UUID] = endNodeComposite;
					}
					//				var end = targetClassUnit.name;
					edgesPComposite.push({ start: startNodeComposite, end: endNodeComposite });

					if (methodClassUnit != targetClassUnit) {
						if (!referencedClassUnits.includes(methodClassUnit)) {
							referencedClassUnits.push(methodClassUnit);
						}

						if (!referencedClassUnits.includes(targetClassUnit)) {
							referencedClassUnits.push(targetClassUnit);
						}
					}
					else {
						continue;
					}

					var startNode = nodesByNamePara[methodUnit.UUID];
					if (!startNode) {
						startNode = {
							name: methodClassUnit.name + ":" + methodUnit.Signature.name + ":" + methodParameter.name,
							// isResponse: methodUnit.isResponse,
							component: {
								name: methodClassUnit.name,
								classUnit: methodClassUnit.UUID
							},
							method: {
								name: methodUnit.Signature.name,
								UUID: methodUnit.UUID,
								parameter: {
									name: methodParameter.name,
									UUID: methodParameter.UUID
								}
							},
							UUID: methodParameter.UUID
							//							isWithinBoundary: targetClassUnit.isWithinBoundary
						};
						nodesPara.push(startNode);
						nodesByNamePara[methodUnit.UUID] = startNode;
						nodesP.push(startNode);
						nodesByNameP[methodUnit.UUID] = startNode;
					}

					var endNode = nodesByNamePara[targetClassUnit.UUID];
					if (!endNode) {
						endNode = {
							name: targetClassUnit.name,
							// isResponse: targetMethodUnit.isResponse,
							component: {
								name: targetClassUnit.name,
								classUnit: targetClassUnit.UUID
							},
							UUID: targetClassUnit.UUID
							//							isWithinBoundary: targetClassUnit.isWithinBoundary
						};
						nodesPara.push(endNode);
						nodesByNamePara[targetClassUnit.UUID] = endNode;
						nodesP.push(endNode);
						nodesByNameP[targetClassUnit.UUID] = endNode;
					}
					//				var end = targetClassUnit.name;
					edgesPara.push({ start: startNode, end: endNode });
					edgesP.push({ start: startNode, end: endNode });



					// console.log("checkcheckcheck!")
					// console.log({start: startNodeComposite, end: endNodeComposite})
					// console.log({start: startNode, end: endNode})


				}
			}
		}

		// console.log("edgesPComposite");
		// console.log(edgesPComposite);

		kdmModelDrawer.drawGraph(edgesAttr, nodesAttr, outputDir, "type_dependency_graph_attributes.dotty");
		kdmModelDrawer.drawGraph(edgesLocal, nodesLocal, outputDir, "type_dependency_graph_local.dotty");
		kdmModelDrawer.drawGraph(edgesPara, nodesPara, outputDir, "type_dependency_graph_parameter.dotty");
		kdmModelDrawer.drawGraph(edgesP, nodesP, outputDir, "type_dependency_graph.dotty");

		kdmModelDrawer.drawGraph(edgesAttrComposite, nodesAttrComposite, outputDir, "type_dependency_graph_attribute_composite.dotty");
		kdmModelDrawer.drawGraph(edgesPComposite, nodesPComposite, outputDir, "type_dependency_graph_composite.dotty");

		return { nodesAttr: nodesAttr, edgesAttr: edgesAttr, nodesP: nodesP, edgesP: edgesP, nodesPara: nodesPara, edgesPara: edgesPara, nodesAttrComposite: nodesAttrComposite, edgesAttrComposite: edgesAttrComposite, nodesPComposite: nodesPComposite, edgesPComposite: edgesPComposite };

	}

	function constructAccessGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters) {


		var edges = []; // call relation
		var nodes = []; // classes
		var nodesByName = {};

		var edgesComposite = []; // call relation
		var nodesComposite = []; // classes
		var nodesByNameComposite = {};

		// console.log("top classes");
		// console.log(topClassUnits);

		for (var i in dicClassUnits) {
			var classUnit = dicClassUnits[i];
			// console.log('test');
			// console.log(classUnit);
			var xmiClassUnit = classUnit.attachment;
			var methodUnits = classUnit.MethodUnits;
			// var XMIMethodUnits = jp.query(xmiClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
			for (var q in methodUnits) {
				// var XMIMethodUnit = XMIMethodUnits[q];
				// var methodUnit = kdmModelUtils.identifyMethodUnit(XMIMethodUnit, xmiString);
				var methodUnit = methodUnits[q];
				// var methodClassUnit = locateClassUnitForMethod(methodUnit, topClassUnits); // the class which owns the method

				if (!methodUnit || !classUnit.isWithinBoundary) {
					continue;
				}

				// console.log("Reads!!!!");
				// console.log(methodUnit);
				// console.log("methodUnitAbove");
				var methodBlockUnit = methodUnit.BlockUnit;
				// console.log(methodBlockUnit);
				// if (methodBlockUnit.length > 0) {
				var methodActionElementsOut = methodUnit.BlockUnit.ActionElements;
				for (var z in methodActionElementsOut) {
					console.log("actionelementout");
					var methodActionElementOut = methodActionElementsOut[z];
					console.log(methodActionElementOut);
					var methodActionElementsIn = methodActionElementOut.ActionElements;
					for (var y in methodActionElementsIn) {
						var methodActionElementIn = methodActionElementsIn[y];
						var methodReads = methodActionElementIn.Reads;
						for (var x in methodReads) {
							var methodRead = methodReads[x];
							var targetFrom = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodRead.from));
							var targetTo = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodRead.to));

							if (!targetFrom || !targetTo || targetFrom.length < 1 || targetTo.length < 1) {
								continue;
							}

							if (targetTo[0]['$']['xsi:type'] && targetTo[0]['$']['xsi:type'] == 'code:StorableUnit') {
								var methodAccessType = targetTo[0]['$']['type'];
								var methodAccessTypeResult = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodAccessType));
								var methodAccessUUID = targetTo[0]['$']['UUID'];
								var targetClassUnit = null;
								var targetStorableUnit = null;
								for (var a in dicClassUnits) {
									var classUnitCandidate = dicClassUnits[a];
									var classStorableUnits = classUnitCandidate.StorableUnits;
									for (var b in classStorableUnits) {
										var StorableUnitCandidate = classStorableUnits[b];
										if (StorableUnitCandidate.UUID == methodAccessUUID) {
											targetClassUnit = classUnitCandidate;
											targetStorableUnit = StorableUnitCandidate;
										}
									}

								}

								if (!targetClassUnit || !targetClassUnit.isWithinBoundary) {
									continue;
								}

								if (targetStorableUnit.type == undefined) {
									continue;
								}
								var XMIClassStorableUnitType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(targetStorableUnit.type));
								var targetStorableType = null;
								// console.log('StorableUnit');
								// console.log(XMIClassStorableUnitType[0]['$']['UUID']);
								for (var j in dicClassUnits) {
									var classUnitCandidate = dicClassUnits[j];
									if (classUnitCandidate.UUID == XMIClassStorableUnitType[0]['$']['UUID']) {
										targetStorableType = classUnitCandidate;
										break;
									}
								}

								if (!targetStorableType) {
									continue;
								}

								var compositeClassUnitUUID = dicClassComposite[classUnit.UUID];
								var compositeTargetClassUnitUUID = dicClassComposite[targetClassUnit.UUID];
								var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
								var compositeTargetClassUnit = dicCompositeClasses[compositeTargetClassUnitUUID];


								if ((compositeClassUnit != compositeTargetClassUnit) || compositeClassUnit.isComposite) {
									if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
										referencedClassUnitsComposite.push(compositeClassUnit);
									}

									if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
										referencedClassUnitsComposite.push(compositeTargetClassUnit);
									}
								}
								else {
									continue;
								}

								var startNodeComposite = nodesByNameComposite[methodUnit.UUID];
								if (!startNodeComposite) {
									startNodeComposite = {
										name: compositeClassUnit.name + ":" + methodUnit.Signature.name,
										// isResponse: methodUnit.isResponse,
										component: {
											name: compositeClassUnit.name,
											classUnit: compositeClassUnit.UUID
										},
										UUID: methodUnit.UUID
										// UUID: compositeClassUnit.UUID
										//							isWithinBoundary: targetClassUnit.isWithinBoundary
									};
									nodesComposite.push(startNodeComposite);
									nodesByNameComposite[methodUnit.UUID] = startNodeComposite;
								}

								var endNodeComposite = nodesByNameComposite[targetStorableUnit.UUID];
								if (!endNodeComposite) {
									endNodeComposite = {
										name: compositeTargetClassUnit.name,
										// isResponse: targetMethodUnit.isResponse,
										component: {
											name: compositeTargetClassUnit.name,
											classUnit: compositeTargetClassUnit.UUID,
										},
										UUID: targetStorableUnit.UUID
										//							isWithinBoundary: targetClassUnit.isWithinBoundary
									};
									nodesComposite.push(endNodeComposite);
									nodesByNameComposite[targetStorableUnit.UUID] = endNodeComposite;
								}
								//				var end = targetClassUnit.name;
								edgesComposite.push({ start: startNodeComposite, end: endNodeComposite });


								if (classUnit != targetClassUnit) {
									if (!referencedClassUnits.includes(classUnit)) {
										referencedClassUnits.push(classUnit);
									}

									if (!referencedClassUnits.includes(targetClassUnit)) {
										referencedClassUnits.push(targetClassUnit);
									}
								}
								else {
									continue;
								}

								if (!(dicMethodParameters.hasOwnProperty(methodUnit.UUID))) {
									var methodParameters = methodUnit.Signature.parameterUnits;
									var name = null;
									var dicParameters = [];
									for (var l in methodParameters) {
										if (methodParameters[l].hasOwnProperty('name')) {
											name = methodParameters[l].name;
										}
										//											var type = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodParameters[l].type));
										var type = methodParameters[l].type;
										var typeClass = null;
										for (var j in dicClassUnits) {
											var classUnitCandidate = dicClassUnits[j];
											if (classUnitCandidate.UUID == type.UUID) {
												typeClass = classUnitCandidate;
											}
										}
										if (!typeClass) {
											continue;
										}
										var parameter = {
											Name: name,
											// kind: methodParameters[l].kind,
											Type: typeClass.name,
											TypeUUID: typeClass.UUID,
										};
										dicParameters.push(parameter);
									}
									dicMethodParameters[methodUnit.UUID] = dicParameters;
								}



								var startNode = nodesByName[methodUnit.UUID];
								if (!startNode) {
									startNode = {
										name: classUnit.name + ":" + methodUnit.Signature.name,
										// isResponse: methodUnit.isResponse,
										component: {
											name: classUnit.name,
											classUnit: classUnit.UUID
										},
										UUID: methodUnit.UUID,
										methodName: methodUnit.Signature.name,
										//							isWithinBoundary: targetClassUnit.isWithinBoundary
									};
									nodes.push(startNode);
									nodesByName[methodUnit.UUID] = startNode;
								}

								var endNode = nodesByName[targetStorableUnit.UUID];
								if (!endNode) {
									endNode = {
										name: targetClassUnit.name + ":" + targetStorableUnit.name,
										// isResponse: targetMethodUnit.isResponse,
										component: {
											name: targetClassUnit.name,
											classUnit: targetClassUnit.UUID,
										},
										UUID: targetStorableUnit.UUID,
										attributeName: targetStorableUnit.name,
										attributeType: targetStorableType.name,
										attributeTypeUUID: targetStorableType.UUID,
										//							isWithinBoundary: targetClassUnit.isWithinBoundary
									};
									nodes.push(endNode);
									nodesByName[targetStorableUnit.UUID] = endNode;
								}
								//				var end = targetClassUnit.name;
								edges.push({ start: startNode, end: endNode });
							}

						}
					}
				}

			}

		}
		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "access_dependency_graph.dotty");
		kdmModelDrawer.drawGraph(edgesComposite, nodesComposite, outputDir, "access_dependency_graph_composite.dotty");

		return { nodes: nodes, edges: edges, nodesComposite: nodesComposite, edgesComposite: edgesComposite };
	}

	function constructCallGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters) {

		//the edges are now defined between methods...

		var edges = []; // call relation
		var nodes = []; // classes
		var nodesByName = {};

		var edgesComposite = []; // call relation
		var nodesComposite = []; // classes
		var nodesByNameComposite = {};

		// console.log("top classes");
		// console.log(topClassUnits);

		for (var i in dicClassUnits) {
			//			var classUnit = dicClassUnits[i];
			var classUnit = dicClassUnits[i];
			//			console.log('test');
			//			console.log(classUnit);
			var xmiClassUnit = classUnit.attachment;

			console.log("classUnit");
			console.log(classUnit);

			var calls = kdmModelUtils.identifyCalls(xmiClassUnit);
			//			var calls = classUnit.Calls;
			//			var index = 0;
			//
			//			var startNode = nodesByName[classUnit.name];
			//			if(!startNode){
			//				startNode = {
			//						name: classUnit.name,
			//						isResponse: isResponseClass(classUnit),
			////						isWithinBoundary: classUnit.isWithinBoundary
			//					};
			//				nodes.push(startNode);
			//				nodesByName[classUnit.name] = startNode;
			//			}

			console.log("identified calls: " + calls.length);

			for (var j in calls) {
				var call = calls[j];
				var callXMIActionElement = jp.query(xmiString, kdmModelUtils.convertToJsonPath(call.from))[0];
				var targetXMIMethodUnit = jp.query(xmiString, kdmModelUtils.convertToJsonPath(call.to))[0];

				//				console.log("target xmi method");
				//				console.log(callXMIActionElement);
				//				console.log(targetXMIMethodUnit);

				if (!targetXMIMethodUnit || !callXMIActionElement) {
					continue;
				}

				//				var callActionElement = kdmModelUtils.identifyActionElement(callXMIActionElement, xmiString);
				//				console.log("call action element");
				//				console.log(callActionElement);
				//				
				var callMethodUUID = dicActionElementMethod[callXMIActionElement['$']['UUID']]

				console.log("call method uuid");
				console.log(callXMIActionElement['$']['UUID']);
				console.log(callMethodUUID);

				var callMethodUnit = dicMethodUnits[callMethodUUID];

				console.log("call method unit");
				console.log(callMethodUnit);

				//				console.log("call method unit");
				//				console.log(callMethodUnit);

				//				var debug = require("../../utils/DebuggerOutput.js");
				//				debug.appendFile("call_method_units", JSON.stringify(callMethodUnit));
				//				
				//				var callClassUnit = locateClassUnitForMethod(callMethodUnit, dicClassUnits);
				// TODO: find the corresponding composite class

				var callClassUnit = classUnit;

				//				var targetMethodUnit = kdmModelUtils.identifyMethodUnit(targetXMIMethodUnit, xmiString);
				//				console.log("target method unit");
				//				console.log(targetMethodUnit);

				//				var targetClassUnit = locateClassUnitForMethod(targetMethodUnit, dicClassUnits);

				var targetMethodUnit = dicMethodUnits[targetXMIMethodUnit['$']['UUID']];

				console.log("target method unit");
				console.log(targetMethodUnit);

				if (!callMethodUnit || !targetMethodUnit) {
					continue;
				}

				var targetClassUnit = dicClassUnits[dicMethodClass[targetMethodUnit.UUID]];

				console.log("target class unit");
				console.log(targetClassUnit);

				if (targetClassUnit.isWithinBoundary) {
					continue;
				}

				var compositeClassUnitUUID = dicClassComposite[callClassUnit.UUID];
				var compositeTargetClassUnitUUID = dicClassComposite[targetClassUnit.UUID];

				var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
				var compositeTargetClassUnit = dicCompositeClasses[compositeTargetClassUnitUUID];

				//				console.log("dicClassComposite");
				//				console.log(dicClassComposite);

				if (!compositeClassUnit || !compositeTargetClassUnit) {
					continue;
				}

				console.log("identified composite classes");

				if ((compositeClassUnit != compositeTargetClassUnit) || compositeClassUnit.isComposite) {
					if (!referencedClassUnitsComposite.includes(compositeClassUnit)) {
						referencedClassUnitsComposite.push(compositeClassUnit);
					}

					if (!referencedClassUnitsComposite.includes(compositeTargetClassUnit)) {
						referencedClassUnitsComposite.push(compositeTargetClassUnit);
					}
				}
				else {
					continue;
				}


				console.log("identified composite classes");

				// console.log("callClassUnit");
				// console.log(callClassUnit);
				// console.log("compositeClassUnitUUID");
				// console.log(compositeClassUnitUUID);
				// console.log("compositeClassUnit");
				// console.log(compositeClassUnit);

				console.log(callMethodUnit);

				var startNodeComposite = nodesByNameComposite[callMethodUnit.UUID];
				if (!startNodeComposite) {
					startNodeComposite = {
						name: compositeClassUnit.name + ":" + callMethodUnit.Signature.name,
						// isResponse: methodUnit.isResponse,
						component: {
							name: compositeClassUnit.name,
							classUnit: compositeClassUnit.UUID
						},
						UUID: callMethodUnit.UUID
						// UUID: compositeClassUnit.UUID
						//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodesComposite.push(startNodeComposite);
					nodesByNameComposite[callMethodUnit.UUID] = startNodeComposite;
				}

				var endNodeComposite = nodesByNameComposite[targetMethodUnit.UUID];
				if (!endNodeComposite) {
					endNodeComposite = {
						name: compositeTargetClassUnit.name + ":" + targetMethodUnit.Signature.name,
						// isResponse: targetMethodUnit.isResponse,
						component: {
							name: compositeTargetClassUnit.name,
							classUnit: compositeTargetClassUnit.UUID,
						},
						UUID: targetMethodUnit.UUID
						//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodesComposite.push(endNodeComposite);
					nodesByNameComposite[targetMethodUnit.UUID] = endNodeComposite;
				}
				//				var end = targetClassUnit.name;
				edgesComposite.push({ start: startNodeComposite, end: endNodeComposite });



				if (callClassUnit != targetClassUnit) {
					if (!referencedClassUnits.includes(callClassUnit)) {
						referencedClassUnits.push(callClassUnit);
					}

					if (!referencedClassUnits.includes(targetClassUnit)) {
						referencedClassUnits.push(targetClassUnit);
					}
				}
				else {
					continue;
				}

				if (!(dicMethodParameters.hasOwnProperty(callMethodUnit.UUID))) {
					var methodParameters = callMethodUnit.Signature.parameterUnits;
					var name = null;
					var dicParameters = [];
					for (var l in methodParameters) {
						if (methodParameters[l].hasOwnProperty('name')) {
							name = methodParameters[l].name;
						}
						//						var type = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodParameters[l].type));
						// console.log("type");
						// console.log(type);
						var type = methodParameters[l].type;
						var typeClass = null;
						for (var j in dicClassUnits) {
							var classUnitCandidate = dicClassUnits[j];
							if (classUnitCandidate.UUID == type.UUID) {
								typeClass = classUnitCandidate;
							}
						}
						if (!typeClass) {
							continue;
						}
						// console.log("typeClass");
						// console.log(typeClass);
						var parameter = {
							Name: name,
							// kind: methodParameters[l].kind,
							Type: typeClass.name,
							TypeUUID: typeClass.UUID,
						};
						dicParameters.push(parameter);
					}
					dicMethodParameters[callMethodUnit.UUID] = dicParameters;
				}

				var startNode = nodesByName[callMethodUnit.UUID];
				if (!startNode) {
					startNode = {
						name: callClassUnit.name + ":" + callMethodUnit.Signature.name,
						isResponse: callMethodUnit.isResponse,
						component: {
							name: callClassUnit.name,
							classUnit: callClassUnit.UUID,
							// methodNumber: callClassUnit.MethodUnits.length
						},
						UUID: callMethodUnit.UUID,
						methodName: callMethodUnit.Signature.name,

						//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodes.push(startNode);
					nodesByName[callMethodUnit.UUID] = startNode;
				}

				var endNode = nodesByName[targetMethodUnit.UUID];
				if (!endNode) {
					endNode = {
						name: targetClassUnit.name + ":" + targetMethodUnit.Signature.name,
						isResponse: targetMethodUnit.isResponse,
						component: {
							name: targetClassUnit.name,
							classUnit: targetClassUnit.UUID,
							// methodNumber: callClassUnit.MethodUnits.length
						},
						UUID: targetMethodUnit.UUID,
						methodName: targetMethodUnit.Signature.name,

						//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodes.push(endNode);
					nodesByName[targetMethodUnit.UUID] = endNode;
				}
				//				var end = targetClassUnit.name;
				edges.push({ start: startNode, end: endNode });
			}

		}

		//		var controlElements = kdmModelUtils.identifyCalls(xmiString, actionElements, methodUnits);


		//		console.log("========================================");
		//
		//		console.log("========================================");
		//
		//
		//		fs.writeFile("./model_platforms/src/structured_class_units.json", JSON.stringify(dicClassUnits), function(err){
		//			if(err) {
		//			 	console.log(err);
		//			}
		////			 	if(callbackfunc){
		////			    	callbackfunc(false);
		////				}
		////		    }
		////			else{
		////				if(callbackfunc){
		////			    	callbackfunc(true);
		////				}
		////			}
		//
		//		});

		//		console.log("nodes");
		//		console.log(nodes);
		//		console.log("edges");
		//		console.log(edges);

		// drawGraph(edges, nodes, outputDir, "kdm_call_graph.dotty");
		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "call_dependency_graph.dotty");
		kdmModelDrawer.drawGraph(edgesComposite, nodesComposite, outputDir, "call_dependency_graph_composite.dotty");


		return { nodes: nodes, edges: edges, nodesComposite: nodesComposite, edgesComposite: edgesComposite };

	}

	function constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters) {

		var edges = []; // directed edge to describe "extends"
		var nodes = []; // classes
		var nodesByName = {}; // by UUID

		for (var i in dicClassUnits) {
			var classUnit = dicClassUnits[i];
			var xmiClassUnit = classUnit.attachment;

			console.log("classUnit");
			console.log(classUnit);

			var extendRelations = kdmModelUtils.identifyExtends(xmiClassUnit);

			console.log("identified extendRelations: " + extendRelations.length);


			for (var j in extendRelations) {
				var extendRelation = extendRelations[j];
				var childXMIClassUnit = jp.query(xmiString, kdmModelUtils.convertToJsonPath(extendRelation.from))[0];
				var parentXMIClassUnit = jp.query(xmiString, kdmModelUtils.convertToJsonPath(extendRelation.to))[0];

				if (!childXMIClassUnit || !parentXMIClassUnit) {
					continue;
				}

				var childCompositeClassUnitUUID = dicClassComposite[childXMIClassUnit['$'].UUID];
				var parentCompositeClassUnitUUID = dicClassComposite[parentXMIClassUnit['$'].UUID];
				
				var childCompositeClassUnit = dicCompositeClasses[childCompositeClassUnitUUID];
				var parentCompositeClassUnit = dicCompositeClasses[parentCompositeClassUnitUUID];

				if (!childCompositeClassUnit || !parentCompositeClassUnit) {
					continue;
				}

				// Why only check the child?
				// (written referring to constructCallGraph function, 
				// in there, only compositeClassUnit is checked)
				if (childCompositeClassUnit === parentCompositeClassUnit && !childCompositeClassUnit.isComposite) {
					continue;
				}

				if (!referencedClassUnitsComposite.includes(childCompositeClassUnit)) {
					referencedClassUnitsComposite.push(childCompositeClassUnit);
				}
				if (!referencedClassUnitsComposite.includes(parentCompositeClassUnit)) {
					referencedClassUnitsComposite.push(parentCompositeClassUnit);
				}

				// TODO: create a composite graph
				// Or is it really necessary?


				// create the normal graph (non-composite)

				var startNode = nodesByName[childXMIClassUnit['$'].UUID];
				if (!startNode) {
					startNode = {
						name: childXMIClassUnit['$'].name,
						isAbstract: childXMIClassUnit['$'].isAbstract,
						component: {
							name: childCompositeClassUnit.name,
							classUnit: childCompositeClassUnit.UUID,
						},
						UUID: childXMIClassUnit['$'].UUID,
					};
					nodes.push(startNode);
					nodesByName[startNode.UUID] = startNode;
				}

				var endNode = nodesByName[parentXMIClassUnit['$'].UUID];
				if (!endNode) {
					endNode = {
						name: parentXMIClassUnit['$'].name,
						isAbstract: parentXMIClassUnit['$'].isAbstract,
						component: {
							name: parentCompositeClassUnit.name,
							classUnit: parentCompositeClassUnit.UUID,
						},
						UUID: parentXMIClassUnit['$'].UUID,
					};
				}

				edges.push({ start: startNode, end: endNode });
			}
		}

		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "extends_graph.dotty");

		return {
			nodes: nodes,
			edges: edges
		};
	}

	function constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicMethodParameters) {
		
		var edges = []; // directed edge to describe "extends"
		var nodes = []; // classes
		var nodesByName = {}; // by UUID

		for (var i in dicClassUnits) {
			
			var classUnit = dicClassUnits[i];
			var xmiClassUnit = classUnit.attachment;

			console.log("classUnit");
			console.log(classUnit);

			// e.g. Car class contains an Engine instance
			var compositionItems = kdmModelUtils.identifyStorableUnits(xmiClassUnit);

			for (var j in compositionItems) {
				var compositionItem = compositionItems[j];

				var itemClassUnit = jp.query(xmiString, kdmModelUtils.convertToJsonPath(compositionItem.type))[0];

				// do not consider class outside boundary, e.g. String
				if (!dicClassUnits[itemClassUnit['$'].UUID] || !dicClassUnits[itemClassUnit['$'].UUID].isWithinBoundary) {
					continue;
				}

				var parentClassUnit = xmiClassUnit;

				// similar to constructExtendsGraph, need to add to composite
				var itemCompositeClassUnitUUID = dicClassComposite[itemClassUnit['$'].UUID];
				var parentCompositeClassUnitUUID = dicClassComposite[parentClassUnit['$'].UUID];

				var itemCompositeClassUnit = dicCompositeClasses[itemCompositeClassUnitUUID];
				var parentCompositeClassUnit = dicCompositeClasses[parentCompositeClassUnitUUID];

				if (!itemCompositeClassUnit || !parentCompositeClassUnit) {
					continue;
				}

				if (itemCompositeClassUnit === parentCompositeClassUnit && !itemCompositeClassUnit.isComposite) {
					continue;
				}

				if (!referencedClassUnitsComposite.includes(itemCompositeClassUnit)) {
					referencedClassUnitsComposite.push(itemCompositeClassUnit);
				}
				if (!referencedClassUnitsComposite.includes(parentCompositeClassUnit)) {
					referencedClassUnitsComposite.push(parentCompositeClassUnit);
				}


				// add the edge and nodes (the item points to class, b/c item "composes" class)
				var startNode = nodesByName[itemClassUnit['$'].UUID];
				if (!startNode) {
					startNode = {
						name: itemClassUnit['$'].name,
						isAbstract: itemClassUnit['$'].isAbstract,
						component: {
							name: itemCompositeClassUnit.name,
							classUnit: itemCompositeClassUnit.UUID,
						},
						UUID: itemClassUnit['$'].UUID,
					};
					nodes.push(startNode);
					nodesByName[startNode.UUID] = startNode;
				}

				var endNode = nodesByName[classUnit.UUID];
				if (!endNode) {
					endNode = {
						name: classUnit.name,
						isAbstract: classUnit.isAbstract,
						component: {
							name: parentCompositeClassUnit.name,
							classUnit: parentCompositeClassUnit.UUID,
						},
						UUID: classUnit.UUID,
					};
				}

				edges.push({ start: startNode, end: endNode });
			}
		}

		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "composition_graph.dotty");

		return {
			nodes: nodes,
			edges: edges
		};
	}


	//	/*
	//	 * this function will exclude the calls within another function
	//	 */
	//	function findCallsForMethod(methodUnit){
	//		var calls = [];
	//
	//		function findCallsFromActionElement(actionElement){
	//			var calls = [];
	////			console.log("output action element");
	////			console.log(responseMethod.Signature.name);
	////			console.log(actionElement);
	//			calls = calls.concat(actionElement.Calls);
	//
	//			for(var i in actionElement.ActionElements){
	//				calls = calls.concat(findCallsFromActionElement(actionElement.ActionElements[i]));
	//			}
	//
	//			return calls;
	//		}
	//
	//		for(var i in methodUnit.BlockUnit.ActionElements){
	//
	//			var actionElement = methodUnit.BlockUnit.ActionElements[i];
	//			calls = calls.concat(findCallsFromActionElement(actionElement));
	//		}
	//
	//		return calls;
	//	}

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

	//	function drawReferences(edges, nodes, graphFilePath){
	//
	//
	//	}

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


	//	function drawCallGraph(controlElements){
	//
	//	}



	module.exports = {
		analyseCode: analyseCode
	}
}());
