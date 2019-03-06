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


	//	var xpath = require('xpath');
	//	var dom = require('xmldom').DOMParser;

	function assignUUID(object) {
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
	}


	var dicClassUnits = {};
	var dicMethodUnits = {};
	var dicCompositeClasses = {};
	var dicClassComposite = {}; // {subclass.UUID, compositeClassUnit.UUID}
	var dicCompositeSubclasses = {}; // {compositeClassUnit.UUID, [subclass.UUID]}
	var dicMethodClass = {};	 // {method.uuid, class.uuid}
	var dicActionElementMethod = {};

	function analyseCode(xmiString, outputDir) {
		assignUUID(xmiString);
		
		console.log("========================================");

		console.log("identify the structured class units");
		var XMIModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\')]');
		var topClassUnits = [];

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
					console.log("inspect Classes....");
					var XMIClass = XMIClasses[k];

					var subClassUnits = [];
					var subMethodUnits = [];
					var subInterfaces = [];

					var identifiedClassUnit = kdmModelUtils.identifyClassUnit(XMIClass, xmiString, subClassUnits, subInterfaces, subMethodUnits);
					identifiedClassUnit.isWithinBoundary = isWithinBoundary;

					subClassUnits.push(identifiedClassUnit);

					for (l in subClassUnits) {
						subClassUnits[l].isWithinBoundary = isWithinBoundary;
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

					//define the dictionary for methods and classes.
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
		}

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson2("identified_class_units", dicClassUnits);

		debug.writeJson2("identified_method_units", dicMethodUnits);

		debug.writeJson2("identified_action_element_method", dicActionElementMethod);

		debug.writeJson2("identified_class_composite", dicClassComposite);

		debug.writeJson2("identified_composite_classes", dicCompositeClasses);

		console.log("=====================================");

		console.log("construct the dependency graphs");

		var referencedClassUnits = [];
		var referencedCompositeClassUnits = [];

		var dicMethodParameters = {};

		var callGraph = constructCallGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters);
		var typeDependencyGraph = constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters);
		var accessGraph = constructAccessGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters);
		var extendsGraph = constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters);
		var compositionGraph = constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters);

		var result =  {
			dicClassUnits: dicClassUnits,
			dicCompositeClassUnits: dicCompositeClasses,
			dicMethodUnits: dicMethodUnits,
			callGraph: callGraph,
			dicMethodClass: dicMethodClass,
			typeDependencyGraph: typeDependencyGraph,
			accessGraph: accessGraph,
			extendsGraph: extendsGraph,
			compositionGraph: compositionGraph,
			referencedclassUnits: referencedClassUnits,
			referencedCompositeClassUnits: referencedCompositeClassUnits,
			dicCompositeSubclasses: dicCompositeSubclasses,
			dicMethodParameters: dicMethodParameters
		};
		
		return result;
	}

	function aggregateClassUnit(subClassUnits, isWithinBoundary, dicClassComposite, dicCompositeSubclasses) {


		var compositeClassUnit = {
			methodUnits: [],
			attrUnits: [],
			classUnits: [],
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
			compositeClassUnit.classUnits.push(subClassUnit.UUID);
		}

		dicCompositeSubclasses[compositeClassUnit.UUID] = childrenClasses;

		return compositeClassUnit;
	}

	function constructTypeDependencyGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters) {

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

		for (var i in dicClassUnits) {
			var classUnit = dicClassUnits[i];
			var XMIClassAttrUnits = classUnit.attrUnits
			for (var q in XMIClassAttrUnits) {
				var XMIClassAttrUnit = XMIClassAttrUnits[q];
				if (XMIClassAttrUnit.type == undefined) {
					continue;
				}
				var XMIClassAttrUnitType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(XMIClassAttrUnit.type));
				var targetClassUnit = null;

				if (!XMIClassAttrUnitType || XMIClassAttrUnitType.length < 1) {
					continue;
				}

				for (var j in dicClassUnits) {
					var classUnitCandidate = dicClassUnits[j];
					if (classUnitCandidate.UUID == XMIClassAttrUnitType[0]['$']['UUID']) {
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
					if (!referencedCompositeClassUnits.includes(compositeClassUnit)) {
						referencedCompositeClassUnits.push(compositeClassUnit);
					}

					if (!referencedCompositeClassUnits.includes(compositeTargetClassUnit)) {
						referencedCompositeClassUnits.push(compositeTargetClassUnit);
					}
				}
				else {
					continue;
				}

				var startNodeComposite = nodesByNameAttrComposite[compositeClassUnit.UUID];
				if (!startNodeComposite) {
					startNodeComposite = {
						name: compositeClassUnit.name,
						component: {
							name: compositeClassUnit.name,
							UUID: compositeClassUnit.UUID
						},
						UUID: compositeClassUnit.UUID
					};
					nodesAttrComposite.push(startNodeComposite);
					nodesByNameAttrComposite[compositeClassUnit.UUID] = startNodeComposite;
				}

				var endNodeComposite = nodesByNameAttrComposite[compositeTargetClassUnit.UUID];
				if (!endNodeComposite) {
					endNodeComposite = {
						name: compositeTargetClassUnit.name,
						component: {
							name: compositeTargetClassUnit.name,
							UUID: compositeTargetClassUnit.UUID,
						},
						UUID: compositeTargetClassUnit.UUID
					};
					nodesAttrComposite.push(endNodeComposite);
					nodesByNameAttrComposite[compositeTargetClassUnit.UUID] = endNodeComposite;
				}
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
						name: classUnit.name + ":" + XMIClassAttrUnit.name,
						component: {
							name: classUnit.name,
							UUID: classUnit.UUID
						},
						UUID: XMIClassAttrUnit.UUID,
						attributeName: XMIClassAttrUnit.name
					};
					nodesAttr.push(startNode);
					nodesByNameAttr[classUnit.UUID] = startNode;
				}

				var endNode = nodesByNameAttr[targetClassUnit.UUID];
				if (!endNode) {
					endNode = {
						name: targetClassUnit.name,
						component: {
							name: targetClassUnit.name,
							UUID: targetClassUnit.UUID,
						},
						UUID: targetClassUnit.UUID
					};
					nodesAttr.push(endNode);
					nodesByNameAttr[targetClassUnit.UUID] = endNode;
				}
				edgesAttr.push({ start: startNode, end: endNode });

			}
			var methodUnits = classUnit.methodUnits;
			for (var i in methodUnits) {
				var methodUnit = methodUnits[i];
				var methodParameters = methodUnit.signature.parameterUnits; // the parameters of the method, including input and return
				var methodClassUnit = classUnit;

				if (!methodParameters || !methodClassUnit || !methodClassUnit.isWithinBoundary) {
					continue;
				}

				// To find the local variable
				var methodActionElements = methodUnit.blockUnit.actionElements;
				for (var k in methodActionElements) {
					var methodActionElement = methodActionElements[k];
					var methodLocalVariables = methodActionElement.attrUnits;
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
							if (!referencedCompositeClassUnits.includes(compositeClassUnit)) {
								referencedCompositeClassUnits.push(compositeClassUnit);
							}

							if (!referencedCompositeClassUnits.includes(compositeTargetClassUnit)) {
								referencedCompositeClassUnits.push(compositeTargetClassUnit);
							}
						}
						else {
							continue;
						}

						var startNodeComposite = nodesByNamePComposite[methodUnit.UUID];
						if (!startNodeComposite) {
							startNodeComposite = {
								name: compositeClassUnit.name + ":" + methodUnit.signature.name + ":" + methodLocalVariable.name,
								component: {
									name: compositeClassUnit.name,
									UUID: compositeClassUnit.UUID
								},
								 UUID: compositeClassUnit.UUID
							};
							nodesPComposite.push(startNodeComposite);
							nodesByNamePComposite[methodUnit.UUID] = startNodeComposite;
						}

						var endNodeComposite = nodesByNamePComposite[compositeTargetClassUnit.UUID];
						if (!endNodeComposite) {
							endNodeComposite = {
								name: compositeTargetClassUnit.name,
								component: {
									name: compositeTargetClassUnit.name,
									UUID: compositeTargetClassUnit.UUID,
								},
								UUID: compositeTargetClassUnit.UUID
							};
							nodesPComposite.push(endNodeComposite);
							nodesByNamePComposite[compositeTargetClassUnit.UUID] = endNodeComposite;
						}
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
							var methodParameters = methodUnit.signature.parameterUnits;
							var name = null;
							var dicParameters = [];
							for (var l in methodParameters) {
								if (methodParameters[l].hasOwnProperty('name')) {
									name = methodParameters[l].name;
								}
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
								name: methodClassUnit.name + ":" + methodUnit.signature.name + ":" + methodLocalVariable.name,
								component: {
									name: methodClassUnit.name,
									UUID: methodClassUnit.UUID
								},
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
								component: {
									name: targetClassUnit.name,
									UUID: targetClassUnit.UUID
								},
								UUID: targetClassUnit.UUID
							};
							nodesLocal.push(endNode);
							nodesByNameLocal[targetClassUnit.UUID] = endNode;
							nodesP.push(endNode);
							nodesByNameP[targetClassUnit.UUID] = endNode;
						}
						edgesLocal.push({ start: startNode, end: endNode });
						edgesP.push({ start: startNode, end: endNode });
					}
				}

				// targeted at input and return parameters of this method
				for (var i in methodParameters) {
					var methodParameter = methodParameters[i];
					var type = methodParameter.type;

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
						if (!referencedCompositeClassUnits.includes(compositeClassUnit)) {
							referencedCompositeClassUnits.push(compositeClassUnit);
						}

						if (!referencedCompositeClassUnits.includes(compositeTargetClassUnit)) {
							referencedCompositeClassUnits.push(compositeTargetClassUnit);
						}
					}
					else {
						continue;
					}

					var startNodeComposite = nodesByNamePComposite[methodUnit.UUID];
					if (!startNodeComposite) {
						startNodeComposite = {
							name: compositeClassUnit.name + ":" + methodUnit.signature.name + ":" + methodParameter.name,
							component: {
								name: compositeClassUnit.name,
								UUID: compositeClassUnit.UUID
							},
							 UUID: compositeClassUnit.UUID
						};
						nodesPComposite.push(startNodeComposite);
						nodesByNamePComposite[methodUnit.UUID] = startNodeComposite;
					}

					var endNodeComposite = nodesByNamePComposite[compositeTargetClassUnit.UUID];
					if (!endNodeComposite) {
						endNodeComposite = {
							name: compositeTargetClassUnit.name,
							component: {
								name: compositeTargetClassUnit.name,
								UUID: compositeTargetClassUnit.UUID,
							},
							UUID: compositeTargetClassUnit.UUID
						};
						nodesPComposite.push(endNodeComposite);
						nodesByNamePComposite[compositeTargetClassUnit.UUID] = endNodeComposite;
					}
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
							name: methodClassUnit.name + ":" + methodUnit.signature.name + ":" + methodParameter.name,
							// isResponse: methodUnit.isResponse,
							component: {
								name: methodClassUnit.name,
								UUID: methodClassUnit.UUID
							},
							method: {
								name: methodUnit.signature.name,
								UUID: methodUnit.UUID,
								parameter: {
									name: methodParameter.name,
									UUID: methodParameter.UUID
								}
							},
							UUID: methodClassUnit.UUID
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
							component: {
								name: targetClassUnit.name,
								UUID: targetClassUnit.UUID
							},
							UUID: targetClassUnit.UUID
						};
						nodesPara.push(endNode);
						nodesByNamePara[targetClassUnit.UUID] = endNode;
						nodesP.push(endNode);
						nodesByNameP[targetClassUnit.UUID] = endNode;
					}
					edgesPara.push({ start: startNode, end: endNode });
					edgesP.push({ start: startNode, end: endNode });

				}
			}
		}

		kdmModelDrawer.drawGraph(edgesAttr, nodesAttr, outputDir, "type_dependency_graph_attributes.dotty");
		kdmModelDrawer.drawGraph(edgesLocal, nodesLocal, outputDir, "type_dependency_graph_local.dotty");
		kdmModelDrawer.drawGraph(edgesPara, nodesPara, outputDir, "type_dependency_graph_parameter.dotty");
		kdmModelDrawer.drawGraph(edgesP, nodesP, outputDir, "type_dependency_graph.dotty");

		kdmModelDrawer.drawGraph(edgesAttrComposite, nodesAttrComposite, outputDir, "type_dependency_graph_attribute_composite.dotty");
		kdmModelDrawer.drawGraph(edgesPComposite, nodesPComposite, outputDir, "type_dependency_graph_composite.dotty");

		return { nodesAttr: nodesAttr, edgesAttr: edgesAttr, nodesP: nodesP, edgesP: edgesP, nodesPara: nodesPara, edgesPara: edgesPara, nodesAttrComposite: nodesAttrComposite, edgesAttrComposite: edgesAttrComposite, nodesPComposite: nodesPComposite, edgesPComposite: edgesPComposite };

	}

	function constructAccessGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters) {


		var edges = []; // call relation
		var nodes = []; // classes
		var nodesByName = {};

		var edgesComposite = []; // call relation
		var nodesComposite = []; // classes
		var nodesByNameComposite = {};

		for (var i in dicClassUnits) {
			var classUnit = dicClassUnits[i];
			var xmiClassUnit = classUnit.attachment;
			var methodUnits = classUnit.methodUnits;
			for (var q in methodUnits) {
				var methodUnit = methodUnits[q];

				if (!methodUnit || !classUnit.isWithinBoundary) {
					continue;
				}
				var methodBlockUnit = methodUnit.blockUnit;
				var methodActionElementsOut = methodUnit.blockUnit.actionElements;
				for (var z in methodActionElementsOut) {
					var methodActionElementOut = methodActionElementsOut[z];
					var methodActionElementsIn = methodActionElementOut.actionElements;
					for (var y in methodActionElementsIn) {
						var methodActionElementIn = methodActionElementsIn[y];
						var methodReads = methodActionElementIn.reads;
						for (var x in methodReads) {
							var methodRead = methodReads[x];
							var targetFrom = methodRead.from;
							var targetTo = methodRead.to;

							if (!targetFrom || !targetTo) {
								continue;
							}

							if (targetTo.xsiType && targetTo.xsiType == 'code:StorableUnit') {
								var methodAccessType = targetTo.methodAccessType;
								var methodAccessTypeResult = jp.query(xmiString, kdmModelUtils.convertToJsonPath(methodAccessType));
								var methodAccessUUID = targetTo.UUID;
								var targetClassUnit = null;
								var targetAttrUnit = null;
								for (var a in dicClassUnits) {
									var classUnitCandidate = dicClassUnits[a];
									var classAttrUnits = classUnitCandidate.attrUnits;
									for (var b in classAttrUnits) {
										var storableUnitCandidate = classAttrUnits[b];
										if (storableUnitCandidate.UUID == methodAccessUUID) {
											targetClassUnit = classUnitCandidate;
											targetAttrUnit = storableUnitCandidate;
										}
									}
								}

								if (!targetClassUnit || !targetClassUnit.isWithinBoundary) {
									continue;
								}

								if (targetAttrUnit.type == undefined) {
									continue;
								}
								var XMIClassAttrUnitType = jp.query(xmiString, kdmModelUtils.convertToJsonPath(targetAttrUnit.type));
								var targetStorableType = null;
								for (var j in dicClassUnits) {
									var classUnitCandidate = dicClassUnits[j];
									if (classUnitCandidate.UUID == XMIClassAttrUnitType[0]['$']['UUID']) {
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
									if (!referencedCompositeClassUnits.includes(compositeClassUnit)) {
										referencedCompositeClassUnits.push(compositeClassUnit);
									}

									if (!referencedCompositeClassUnits.includes(compositeTargetClassUnit)) {
										referencedCompositeClassUnits.push(compositeTargetClassUnit);
									}
								}
								else {
									continue;
								}

								var startNodeComposite = nodesByNameComposite[methodUnit.UUID];
								if (!startNodeComposite) {
									startNodeComposite = {
										name: compositeClassUnit.name + ":" + methodUnit.signature.name,
										// isResponse: methodUnit.isResponse,
										component: {
											name: compositeClassUnit.name,
											UUID: compositeClassUnit.UUID
										},
										UUID: methodUnit.UUID
									};
									nodesComposite.push(startNodeComposite);
									nodesByNameComposite[methodUnit.UUID] = startNodeComposite;
								}

								var endNodeComposite = nodesByNameComposite[targetAttrUnit.UUID];
								if (!endNodeComposite) {
									endNodeComposite = {
										name: compositeTargetClassUnit.name,
										component: {
											name: compositeTargetClassUnit.name,
											UUID: compositeTargetClassUnit.UUID,
										},
										UUID: targetAttrUnit.UUID
									};
									nodesComposite.push(endNodeComposite);
									nodesByNameComposite[targetAttrUnit.UUID] = endNodeComposite;
								}
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
									var methodParameters = methodUnit.signature.parameterUnits;
									var name = null;
									var dicParameters = [];
									for (var l in methodParameters) {
										if (methodParameters[l].hasOwnProperty('name')) {
											name = methodParameters[l].name;
										}
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
										name: classUnit.name + ":" + methodUnit.signature.name,
										component: {
											name: classUnit.name,
											UUID: classUnit.UUID
										},
										UUID: methodUnit.UUID,
										methodName: methodUnit.signature.name,
									};
									nodes.push(startNode);
									nodesByName[methodUnit.UUID] = startNode;
								}

								var endNode = nodesByName[targetAttrUnit.UUID];
								if (!endNode) {
									endNode = {
										name: targetClassUnit.name + ":" + targetAttrUnit.name,
										component: {
											name: targetClassUnit.name,
											UUID: targetClassUnit.UUID,
										},
										UUID: targetAttrUnit.UUID,
										attributeName: targetAttrUnit.name,
										attributeType: targetStorableType.name,
										attributeTypeUUID: targetStorableType.UUID,
									};
									nodes.push(endNode);
									nodesByName[targetAttrUnit.UUID] = endNode;
								}
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

	function constructCallGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters) {

		//the edges are now defined between methods...

		var edges = []; // call relation
		var nodes = []; // classes
		var nodesByName = {};

		var edgesComposite = []; // call relation
		var nodesComposite = []; // classes
		var nodesByNameComposite = {};


		for (var i in dicClassUnits) {
			var classUnit = dicClassUnits[i];
			var xmiClassUnit = classUnit.attachment;

			var calls = kdmModelUtils.identifyCalls(xmiClassUnit);

			console.log("identified calls: " + calls.length);

			for (var j in calls) {
				var call = calls[j];
				var callXMIActionElement = jp.query(xmiString, call.from)[0];
				var targetXMIMethodUnit = jp.query(xmiString, call.to)[0];

				if (!targetXMIMethodUnit || !callXMIActionElement) {
					continue;
				}
				var callMethodUUID = dicActionElementMethod[callXMIActionElement['$']['UUID']]

				var callMethodUnit = dicMethodUnits[callMethodUUID];

				var debug = require("../../utils/DebuggerOutput.js");
				debug.appendFile("call_method_units", callMethodUUID+"\n");

				var callClassUnit = classUnit;

				var targetMethodUnit = dicMethodUnits[targetXMIMethodUnit['$']['UUID']];

				if (!callMethodUnit || !targetMethodUnit) {
					continue;
				}

				var targetClassUnit = dicClassUnits[dicMethodClass[targetMethodUnit.UUID]];

				if (!targetClassUnit.isWithinBoundary) {
					continue;
				}

				var compositeClassUnitUUID = dicClassComposite[callClassUnit.UUID];
				var compositeTargetClassUnitUUID = dicClassComposite[targetClassUnit.UUID];

				var compositeClassUnit = dicCompositeClasses[compositeClassUnitUUID];
				var compositeTargetClassUnit = dicCompositeClasses[compositeTargetClassUnitUUID];

				if (!compositeClassUnit || !compositeTargetClassUnit) {
					continue;
				}

				console.log("identified composite classes");

					if (!referencedCompositeClassUnits.includes(compositeClassUnit)) {
						referencedCompositeClassUnits.push(compositeClassUnit);
					}

					if (!referencedCompositeClassUnits.includes(compositeTargetClassUnit)) {
						referencedCompositeClassUnits.push(compositeTargetClassUnit);
					}

				var startNodeComposite = nodesByNameComposite[callMethodUnit.UUID];
				if (!startNodeComposite) {
					startNodeComposite = {
						name: compositeClassUnit.name + ":" + callMethodUnit.signature.name,
						component: {
							name: compositeClassUnit.name,
							UUID: compositeClassUnit.UUID
						},
						UUID: callMethodUnit.UUID
					};
					nodesComposite.push(startNodeComposite);
					nodesByNameComposite[callMethodUnit.UUID] = startNodeComposite;
				}

				var endNodeComposite = nodesByNameComposite[targetMethodUnit.UUID];
				if (!endNodeComposite) {
					endNodeComposite = {
						name: compositeTargetClassUnit.name + ":" + targetMethodUnit.signature.name,
						component: {
							name: compositeTargetClassUnit.name,
							UUID: compositeTargetClassUnit.UUID,
						},
						UUID: targetMethodUnit.UUID
					};
					nodesComposite.push(endNodeComposite);
					nodesByNameComposite[targetMethodUnit.UUID] = endNodeComposite;
				}
				edgesComposite.push({ start: startNodeComposite, end: endNodeComposite });



					if (!referencedClassUnits.includes(callClassUnit)) {
						referencedClassUnits.push(callClassUnit);
					}

					if (!referencedClassUnits.includes(targetClassUnit)) {
						referencedClassUnits.push(targetClassUnit);
					}

				if (!(dicMethodParameters.hasOwnProperty(callMethodUnit.UUID))) {
					var methodParameters = callMethodUnit.signature.parameterUnits;
					var name = null;
					var parameters = [];
					for (var l in methodParameters) {
						if (methodParameters[l].hasOwnProperty('name')) {
							name = methodParameters[l].name;
						}
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
							Type: typeClass.name,
							TypeUUID: typeClass.UUID,
						};
						parameters.push(parameter);
					}
					dicMethodParameters[callMethodUnit.UUID] = parameters;
				}

				var startNode = nodesByName[callMethodUnit.UUID];
				if (!startNode) {
					startNode = {
						name: callClassUnit.name + ":" + callMethodUnit.signature.name,
						isResponse: callMethodUnit.isResponse,
						component: {
							name: callClassUnit.name,
							UUID: callClassUnit.UUID,
						},
						UUID: callMethodUnit.UUID,
						methodName: callMethodUnit.signature.name,
					};
					nodes.push(startNode);
					nodesByName[callMethodUnit.UUID] = startNode;
				}

				var endNode = nodesByName[targetMethodUnit.UUID];
				if (!endNode) {
					endNode = {
						name: targetClassUnit.name + ":" + targetMethodUnit.signature.name,
						isResponse: targetMethodUnit.isResponse,
						component: {
							name: targetClassUnit.name,
							UUID: targetClassUnit.UUID,
						},
						UUID: targetMethodUnit.UUID,
						methodName: targetMethodUnit.signature.name,

					};
					nodes.push(endNode);
					nodesByName[targetMethodUnit.UUID] = endNode;
				}
				edges.push({ start: startNode, end: endNode });
			}

		}

		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "call_dependency_graph.dotty");
		kdmModelDrawer.drawGraph(edgesComposite, nodesComposite, outputDir, "call_dependency_graph_composite.dotty");


		return { nodes: nodes, edges: edges, nodesComposite: nodesComposite, edgesComposite: edgesComposite };

	}

	function constructExtendsGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters) {

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
				var childXMIClassUnit = extendRelation.to;
				var parentXMIClassUnit = extendRelation.from;

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

				if (!referencedCompositeClassUnits.includes(childCompositeClassUnit)) {
					referencedCompositeClassUnits.push(childCompositeClassUnit);
				}
				if (!referencedCompositeClassUnits.includes(parentCompositeClassUnit)) {
					referencedCompositeClassUnits.push(parentCompositeClassUnit);
				}

				// TODO: create a composite graph
				// Or is it really necessary?

				var startNode = nodesByName[childXMIClassUnit['$'].UUID];
				if (!startNode) {
					startNode = {
						name: childXMIClassUnit['$'].name,
						isAbstract: childXMIClassUnit['$'].isAbstract,
						component: {
							name: childCompositeClassUnit.name,
							UUID: childCompositeClassUnit.UUID,
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
							UUID: parentCompositeClassUnit.UUID,
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

	function constructCompositionGraph(topClassUnits, xmiString, outputDir, referencedClassUnits, referencedCompositeClassUnits, dicMethodParameters) {
		
		var edges = []; // directed edge to describe "extends"
		var nodes = []; // classes
		var nodesByName = {}; // by UUID

		for (var i in dicClassUnits) {
			
			var classUnit = dicClassUnits[i];
			var xmiClassUnit = classUnit.attachment;

			console.log("classUnit");
			console.log(classUnit);

			// e.g. Car class contains an Engine instance
			var compositionItems = kdmModelUtils.identifyAttrUnits(xmiClassUnit);

			for (var j in compositionItems) {
				var compositionItem = compositionItems[j];

				var itemClassUnit = jp.query(xmiString, compositionItem.type)[0];
				
				if(!itemClassUnit){
					continue;
				}

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

				if (!referencedCompositeClassUnits.includes(itemCompositeClassUnit)) {
					referencedCompositeClassUnits.push(itemCompositeClassUnit);
				}
				if (!referencedCompositeClassUnits.includes(parentCompositeClassUnit)) {
					referencedCompositeClassUnits.push(parentCompositeClassUnit);
				}


				// add the edge and nodes (the item points to class, b/c item "composes" class)
				var startNode = nodesByName[itemClassUnit['$'].UUID];
				if (!startNode) {
					startNode = {
						name: itemClassUnit['$'].name,
						isAbstract: itemClassUnit['$'].isAbstract,
						component: {
							name: itemCompositeClassUnit.name,
							UUID: itemCompositeClassUnit.UUID,
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
							UUID: parentCompositeClassUnit.UUID,
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

	// system classes include all the class elements which are developed in the project. The classes don't include the classes from the third party applications.
	function identifyExternalClass(xmiString) {
		//the system classes are determined by excluding the classes that are within the external packages.
		console.log("determine external class units");

		var externalClassUnitsByName = {};
		var XMIExternalModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\' && @[\'$\'][\'name\']==\'externals\')]');

		for (var i in XMIExternalModels) {
			var XMIExternalModel = XMIExternalModels[i];
			var XMIExternalClasses = jp.query(XMIExternalModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\' || @[\'$\'][\'xsi:type\']==\'code:InterfaceUnit\' || @[\'$\'][\'xsi:type\']==\'code:StorableUnit\')]');
			console.log("ok");
			console.log(XMIExternalClasses);
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
	

	module.exports = {
		analyseCode: analyseCode
	}
}());