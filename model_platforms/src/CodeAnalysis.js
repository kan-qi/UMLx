/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 *
 * This script relies on KDM and Java model
 *
 * The goal is the establish the control flow between the modules...
 * Identify the system boundary
 * Identify the sytem components.....
 * Identify the stimuli.
 * Identify the boundary.
 */
(function() {
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

	var xmiSring = "";

	function assignUUID(object){
		if(object instanceof Array){
				for(var i in object){
					assignUUID(object[i]);
				}
		} else if (object instanceof Object){
			if(object['$']){
				object['$']['UUID'] = uuidV1();
			}else{
				object['UUID'] = uuidV1();
			}

			for(var i in object){
				if(i === '$'){
					continue;
				}
				assignUUID(object[i]);
			}
		}
	}

	function analyseCode(xmiString, outputDir){
		assignUUID(xmiString);

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("KDM_Example", xmiString);
//		console.log("determine the class units within the model");

		console.log("========================================");

		console.log("identify the structured class units");
		var XMIModels = jp.query(xmiString, '$..model[?(@[\'$\'][\'xsi:type\']==\'code:CodeModel\')]');
		var topClassUnits = [];
		var classUnits = [];
		var compositeClassUnits = [];
		var dicCompositeClass = {}; // {subclass.UUID: compositeClassUnit.UUID}
		var dicChildrenClasses = {}; // {compositeClassUnit.UUID: [subclass.UUID]}
		for(var i in XMIModels){
			var XMIModel = XMIModels[i];
			console.log("inspect models....");
			var isWithinBoundary = true;
			if(XMIModel['$']['name'] === "externals"){
				isWithinBoundary = false;
			}
			//search the top level classes under the packages.
			var XMIPackages = jp.query(XMIModel, '$..codeElement[?(@[\'$\'][\'xsi:type\']==\'code:Package\')]');
			for(var j in XMIPackages){
				console.log("inspect packages....");
				var XMIPackage = XMIPackages[j];
				var XMIClasses = jp.query(XMIPackage, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:ClassUnit\')]');
					for(var k in XMIClasses){
						console.log("inspect Classes....");
						var XMIClass = XMIClasses[k];
						var identifiedClassUnit = kdmModelUtils.identifyClassUnit(XMIClass, xmiString);
						identifiedClassUnit.isWithinBoundary = isWithinBoundary;
						var subClassUnits = findSubClasses(identifiedClassUnit);
						subClassUnits.push(identifiedClassUnit);
//						classUnits.push(identifiedClassUnit);
//						classUnits = classUnits.concat(identifiedClassUnit.ClassUnits);
						for(l in subClassUnits){
							subClassUnits[l].isWithinBoundary = isWithinBoundary;
							classUnits.push(subClassUnits[l]);
						}
						// compositeClassUnit = aggregateClassUnit(identifiedClassUnit);
						//
						// console.log("subClassUnits");
            // console.log(subClassUnits);

						compositeClassUnit = aggregateClassUnit(subClassUnits, isWithinBoundary, dicCompositeClass, dicChildrenClasses);
						compositeClassUnits.push(compositeClassUnit);

						topClassUnits.push(identifiedClassUnit);
					}
			}
		}

		// console.log("classUnits");
		// console.log(classUnits);
		// console.log("topClassUnits");
		// console.log(topClassUnits);
    //
		// console.log("compositeClassUnits");
		// console.log(compositeClassUnits);
    //
		// console.log("dicCompositeClass");
		// console.log(dicCompositeClass);

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("constructed_class_units", classUnits);

		console.log("=====================================");

		console.log("determine the entry points");

//		identifyStimulus(xmiString);

		console.log("control flow construction");

		var referencedClassUnits = [];
		var referencedClassUnitsComposite = [];

		var callGraph = constructCallGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicCompositeClass, compositeClassUnits);
		var typeDependencyGraph = constructTypeDependencyGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicCompositeClass, compositeClassUnits);
		var accessGraph = constructAccessGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicCompositeClass, compositeClassUnits);

    console.log("dicChildrenClasses");
		console.log(dicChildrenClasses);
		// console.log("typeDependencyGraph");
		// console.log(typeDependencyGraph);

//		var controlFlowGraph = constructCFG(classUnits, topClassUnits, xmiString, outputDir);


		return {
//			callGraph: callGraph,
//			controlFlowGraph: controlFlowGraph,
			classUnits: classUnits,
			callGraph: callGraph,
			typeDependencyGraph: typeDependencyGraph,
			accessGraph: accessGraph,
			referencedClassUnits: referencedClassUnits,
			referencedClassUnitsComposite: referencedClassUnitsComposite,
			dicChildrenClasses: dicChildrenClasses
		};
	}

	function aggregateClassUnit(subClassUnits, isWithinBoundary, dicCompositeClass, dicChildrenClasses) {


		var compositeClassUnit = {
				// name: XMIClassUnit['$']['name'],
				MethodUnits : [],
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
			dicCompositeClass[subClassUnit.UUID] = compositeClassUnit.UUID;
			childrenClasses.push(subClassUnit.UUID);
			// console.log(compositeClassUnit);
		}

		dicChildrenClasses[compositeClassUnit.UUID] = childrenClasses;

		return compositeClassUnit;
	}

	function locateCompositeClassUnit(classUnitUUID, compositeClassUnits) {

		for (var i in compositeClassUnits) {
			var compositeClassUnit = compositeClassUnits[i];
			if (compositeClassUnit.UUID == classUnitUUID) {
				return compositeClassUnit;
			}
		}

		return null;

	}

	function constructTypeDependencyGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicCompositeClass, compositeClassUnits){

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

		for (var i in classUnits) {
			var classUnit = classUnits[i];
			console.log('test');
			console.log(classUnit);
			// var xmiClassUnit = classUnit.attachment;
			var XMIClassStorableUnits = classUnit.StorableUnits
      for (var q in XMIClassStorableUnits) {
				var XMIClassStorableUnit = XMIClassStorableUnits[q];
				if (XMIClassStorableUnit.type == undefined) {
					continue;
				}
				var XMIClassStorableUnitType = jp.query(xmiString, convertToJsonPath(XMIClassStorableUnit.type));
        var targetClassUnit = null;
				// console.log('StorableUnit');
				// console.log(XMIClassStorableUnitType[0]['$']['UUID']);
				for (var j in classUnits) { //TODO: only consider topClassUnits, is it okay?
					var classUnitCandidate = classUnits[j];
					if (classUnitCandidate.UUID == XMIClassStorableUnitType[0]['$']['UUID']) {
						targetClassUnit = classUnitCandidate;
					}
				}
				console.log("targetClassUnit");
				console.log(targetClassUnit);
				if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within classUnits, like string, int...
					continue;
				}

				var compositeClassUnitUUID = dicCompositeClass[classUnit.UUID];
				var compositeTargetClassUnitUUID = dicCompositeClass[targetClassUnit.UUID];
				var compositeClassUnit = locateCompositeClassUnit(compositeClassUnitUUID, compositeClassUnits);
				var compositeTargetClassUnit = locateCompositeClassUnit(compositeTargetClassUnitUUID, compositeClassUnits);

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
				if(!startNodeComposite){
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
				if(!endNodeComposite){
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
				edgesAttrComposite.push({start: startNodeComposite, end: endNodeComposite});



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
				if(!startNode){
					startNode = {
						name: classUnit.name,
						// isResponse: methodUnit.isResponse,
						component: {
							name: classUnit.name,
							classUnit: classUnit.UUID
						},
						UUID: classUnit.UUID
//							isWithinBoundary: targetClassUnit.isWithinBoundary
					};
					nodesAttr.push(startNode);
					nodesByNameAttr[classUnit.UUID] = startNode;
				}

				var endNode = nodesByNameAttr[targetClassUnit.UUID];
					if(!endNode){
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
						edgesAttr.push({start: startNode, end: endNode});




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
						var localVariableType = jp.query(xmiString, convertToJsonPath(methodLocalVariable.type));
						var targetClassUnit = null;
						for (var j in classUnits) {
							var classUnitCandidate = classUnits[j];
							if (classUnitCandidate.UUID == localVariableType[0]['$']['UUID']) {
								targetClassUnit = classUnitCandidate;
							}
						}
						if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within classUnits, like string, int...
							continue;
						}

						var compositeClassUnitUUID = dicCompositeClass[methodClassUnit.UUID];
						var compositeTargetClassUnitUUID = dicCompositeClass[targetClassUnit.UUID];
						var compositeClassUnit = locateCompositeClassUnit(compositeClassUnitUUID, compositeClassUnits);
						var compositeTargetClassUnit = locateCompositeClassUnit(compositeTargetClassUnitUUID, compositeClassUnits);


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
						if(!startNodeComposite){
							startNodeComposite = {
								name: compositeClassUnit.name+":"+methodUnit.Signature.name+":"+methodLocalVariable.name,
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
							if(!endNodeComposite){
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
						edgesPComposite.push({start: startNodeComposite, end: endNodeComposite});

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

						var startNode = nodesByNameLocal[methodUnit.UUID];
						if(!startNode){
							startNode = {
									name: methodClassUnit.name+":"+methodUnit.Signature.name+":"+methodLocalVariable.name,
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
							if(!endNode){
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
								edgesLocal.push({start: startNode, end: endNode});
								edgesP.push({start: startNode, end: endNode});



										// console.log("checkcheckcheck!");
										// console.log({start: startNodeComposite, end: endNodeComposite});
										// console.log({start: startNode, end: endNode});

					}
				}

         // targeted at input and return parameters of this method
				for (var i in methodParameters) {
					var methodParameter = methodParameters[i];
					var XMIParameterType = jp.query(xmiString, convertToJsonPath(methodParameter.type));
					var targetClassUnit = null;
					for (var j in classUnits) {
						var classUnitCandidate = classUnits[j];
						if (classUnitCandidate.UUID == XMIParameterType[0]['$']['UUID']) {
							targetClassUnit = classUnitCandidate;
						}
					}

					if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within classUnits, like string, int...
						continue;
					}

					var compositeClassUnitUUID = dicCompositeClass[methodClassUnit.UUID];
					var compositeTargetClassUnitUUID = dicCompositeClass[targetClassUnit.UUID];
					var compositeClassUnit = locateCompositeClassUnit(compositeClassUnitUUID, compositeClassUnits);
					var compositeTargetClassUnit = locateCompositeClassUnit(compositeTargetClassUnitUUID, compositeClassUnits);


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
					if(!startNodeComposite){
						startNodeComposite = {
							name: compositeClassUnit.name+":"+methodUnit.Signature.name+":"+methodParameter.name,
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
						if(!endNodeComposite){
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
							edgesPComposite.push({start: startNodeComposite, end: endNodeComposite});

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
					if(!startNode){
						startNode = {
							name: methodClassUnit.name+":"+methodUnit.Signature.name+":"+methodParameter.name,
							// isResponse: methodUnit.isResponse,
							component: {
								name: methodClassUnit.name,
								classUnit: methodClassUnit.UUID
							},
							// UUID: methodParameter.UUID
//							isWithinBoundary: targetClassUnit.isWithinBoundary
						};
						nodesPara.push(startNode);
						nodesByNamePara[methodUnit.UUID] = startNode;
						nodesP.push(startNode);
						nodesByNameP[methodUnit.UUID] = startNode;
					}

					var endNode = nodesByNamePara[targetClassUnit.UUID];
					if(!endNode){
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
					edgesPara.push({start: startNode, end: endNode});
					edgesP.push({start: startNode, end: endNode});



							// console.log("checkcheckcheck!")
							// console.log({start: startNodeComposite, end: endNodeComposite})
							// console.log({start: startNode, end: endNode})


				}
			}
		}

    // console.log("edgesPComposite");
		// console.log(edgesPComposite);

		kdmModelDrawer.drawGraph(edgesAttr, nodesAttr, outputDir, "testAttr.dotty");
		kdmModelDrawer.drawGraph(edgesLocal, nodesLocal, outputDir, "testLocal.dotty");
		kdmModelDrawer.drawGraph(edgesPara, nodesPara, outputDir, "testPara.dotty");
		kdmModelDrawer.drawGraph(edgesP, nodesP, outputDir, "testP.dotty");

		kdmModelDrawer.drawGraph(edgesAttrComposite, nodesAttrComposite, outputDir, "testAttrComposite.dotty");
		kdmModelDrawer.drawGraph(edgesPComposite, nodesPComposite, outputDir, "testPComposite.dotty");

		return {nodesAttr: nodesAttr, edgesAttr: edgesAttr, nodesP: nodesP, edgesP: edgesP, nodesAttrComposite: nodesAttrComposite, edgesAttrComposite: edgesAttrComposite, nodesPComposite: nodesPComposite, edgesPComposite: edgesPComposite};

	}

	function constructAccessGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicCompositeClass, compositeClassUnits){


		var edges = []; // call relation
		var nodes = []; // classes
		var nodesByName = {};

		var edgesComposite = []; // call relation
		var nodesComposite = []; // classes
		var nodesByNameComposite = {};

		// console.log("top classes");
		// console.log(topClassUnits);

		for(var i in classUnits){
			var classUnit = classUnits[i];
			// console.log('test');
			// console.log(classUnit);
			var xmiClassUnit = classUnit.attachment;
			var XMIMethodUnits = classUnit.MethodUnits;
			// var XMIMethodUnits = jp.query(xmiClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
			for (var q in XMIMethodUnits) {
				// var XMIMethodUnit = XMIMethodUnits[q];
				// var methodUnit = kdmModelUtils.identifyMethodUnit(XMIMethodUnit, xmiString);
				var methodUnit = XMIMethodUnits[q];
				// var methodClassUnit = locateClassUnitForMethod(methodUnit, topClassUnits); // the class which owns the method

				if (!methodUnit || !classUnit.isWithinBoundary) {
					continue;
				}

        // console.log("Reads!!!!");
				// console.log(methodUnit);
				// console.log("methodUnitAbove");
				var methodBlockUnit = methodUnit.BlockUnit;
				// console.log(methodBlockUnit);
				// TODO: should care about no ActionElement in blockUnit?
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
								var targetFrom = jp.query(xmiString, convertToJsonPath(methodRead.from));
								var targetTo = jp.query(xmiString, convertToJsonPath(methodRead.to));
								if ('xsi:type' in targetTo[0]['$'] && targetTo[0]['$']['xsi:type'] == 'code:StorableUnit') {
									var methodAccessType = targetTo[0]['$']['type'];
									var methodAccessTypeResult = jp.query(xmiString, convertToJsonPath(methodAccessType));
									var methodAccessUUID = targetTo[0]['$']['UUID'];
									var targetClassUnit = null;
									var targetStorableUnit = null;
									for (var a in classUnits) {
										var classUnitCandidate = classUnits[a];
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

									var compositeClassUnitUUID = dicCompositeClass[classUnit.UUID];
									var compositeTargetClassUnitUUID = dicCompositeClass[targetClassUnit.UUID];
									var compositeClassUnit = locateCompositeClassUnit(compositeClassUnitUUID, compositeClassUnits);
									var compositeTargetClassUnit = locateCompositeClassUnit(compositeTargetClassUnitUUID, compositeClassUnits);


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
									if(!startNodeComposite){
										startNodeComposite = {
											name: compositeClassUnit.name+":"+methodUnit.Signature.name,
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
										if(!endNodeComposite){
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
											edgesComposite.push({start: startNodeComposite, end: endNodeComposite});


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


									var startNode = nodesByName[methodUnit.UUID];
									if(!startNode){
										startNode = {
												name: classUnit.name+":"+methodUnit.Signature.name,
												// isResponse: methodUnit.isResponse,
												component: {
													name: classUnit.name,
													classUnit: classUnit.UUID
												},
												UUID: methodUnit.UUID
					//							isWithinBoundary: targetClassUnit.isWithinBoundary
											};
										nodes.push(startNode);
										nodesByName[methodUnit.UUID] = startNode;
									}

									var endNode = nodesByName[targetStorableUnit.UUID];
									if(!endNode){
										endNode = {
												name: targetClassUnit.name+":"+targetStorableUnit.name,
												// isResponse: targetMethodUnit.isResponse, //TODO isResponse?
												component: {
													name: targetClassUnit.name,
													classUnit: targetClassUnit.UUID,
												},
												UUID: targetStorableUnit.UUID
					//							isWithinBoundary: targetClassUnit.isWithinBoundary
											};
										nodes.push(endNode);
										nodesByName[targetStorableUnit.UUID] = endNode;
									}
					//				var end = targetClassUnit.name;
									edges.push({start: startNode, end: endNode});
								}

							}
						}
					}

			}

		}
		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "testAccess.dotty");
		kdmModelDrawer.drawGraph(edgesComposite, nodesComposite, outputDir, "testAccessComposite.dotty");

		return {nodes: nodes, edges: edges, nodesComposite: nodesComposite, edgesComposite: edgesComposite};
	}

	function constructCallGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits, referencedClassUnitsComposite, dicCompositeClass, compositeClassUnits){

		//the edges are now defined between methods...

		var edges = []; // call relation
		var nodes = []; // classes
		var nodesByName = {};

		var edgesComposite = []; // call relation
		var nodesComposite = []; // classes
		var nodesByNameComposite = {};

		// console.log("top classes");
		// console.log(topClassUnits);

		for(var i in classUnits){
//			var classUnit = classUnits[i];
			var classUnit = classUnits[i];
			console.log('test');
			console.log(classUnit);
			var xmiClassUnit = classUnit.attachment;

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

			for(var j in calls){
				var call = calls[j];
				var callXMIActionElement = jp.query(xmiString, convertToJsonPath(call.from))[0];
				var targetXMIMethodUnit = jp.query(xmiString, convertToJsonPath(call.to))[0];
				console.log("target xmi method");
				console.log(callXMIActionElement);
				console.log(targetXMIMethodUnit);

				if(!targetXMIMethodUnit || !callXMIActionElement){
					continue;
				}

				var callActionElement = kdmModelUtils.identifyActionElement(callXMIActionElement, xmiString);
				console.log("call action element");
				console.log(callActionElement);
				var callMethodUnit = locateMethodUnitForActionElement(callActionElement, classUnits);
				console.log("call method unit");
				var debug = require("../../utils/DebuggerOutput.js");
				console.log(callMethodUnit);
				debug.appendFile("call_method_units", JSON.stringify(callMethodUnit));
				var callClassUnit = locateClassUnitForMethod(callMethodUnit, classUnits);
				// TODO: find the corresponding composite class

				var targetMethodUnit = kdmModelUtils.identifyMethodUnit(targetXMIMethodUnit, xmiString);
				console.log("target method unit");
				console.log(targetMethodUnit);
				var targetClassUnit = locateClassUnitForMethod(targetMethodUnit, classUnits);

				if(!callMethodUnit.Signature || !targetMethodUnit.Signature || !targetClassUnit.isWithinBoundary){
					continue;
				}

				var compositeClassUnitUUID = dicCompositeClass[callClassUnit.UUID];
				var compositeTargetClassUnitUUID = dicCompositeClass[targetClassUnit.UUID];
				var compositeClassUnit = locateCompositeClassUnit(compositeClassUnitUUID, compositeClassUnits);
				var compositeTargetClassUnit = locateCompositeClassUnit(compositeTargetClassUnitUUID, compositeClassUnits);


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

        // console.log("callClassUnit");
        // console.log(callClassUnit);
        // console.log("compositeClassUnitUUID");
				// console.log(compositeClassUnitUUID);
				// console.log("compositeClassUnit");
				// console.log(compositeClassUnit);

				var startNodeComposite = nodesByNameComposite[callMethodUnit.UUID];
				if(!startNodeComposite){
					startNodeComposite = {
						name: compositeClassUnit.name+":"+callMethodUnit.Signature.name,
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
					if(!endNodeComposite){
						endNodeComposite = {
							name: compositeTargetClassUnit.name+":"+targetMethodUnit.Signature.name,
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
						edgesComposite.push({start: startNodeComposite, end: endNodeComposite});



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

				var startNode = nodesByName[callMethodUnit.UUID];
				if(!startNode){
					startNode = {
							name: callClassUnit.name+":"+callMethodUnit.Signature.name,
							isResponse: callMethodUnit.isResponse,
							component: {
								name: callClassUnit.name,
								classUnit: callClassUnit.UUID,
								// methodNumber: callClassUnit.MethodUnits.length
							},
							UUID: callMethodUnit.UUID

//							isWithinBoundary: targetClassUnit.isWithinBoundary
						};
					nodes.push(startNode);
					nodesByName[callMethodUnit.UUID] = startNode;
				}

				var endNode = nodesByName[targetMethodUnit.UUID];
				if(!endNode){
					endNode = {
							name: targetClassUnit.name+":"+targetMethodUnit.Signature.name,
							isResponse: targetMethodUnit.isResponse,
							component: {
								name: targetClassUnit.name,
								classUnit: targetClassUnit.UUID,
								// methodNumber: callClassUnit.MethodUnits.length
							},
							UUID: targetMethodUnit.UUID

//							isWithinBoundary: targetClassUnit.isWithinBoundary
						};
					nodes.push(endNode);
					nodesByName[targetMethodUnit.UUID] = endNode;
				}
//				var end = targetClassUnit.name;
				edges.push({start: startNode, end: endNode});
			}

		}

//		var controlElements = kdmModelUtils.identifyCalls(xmiString, actionElements, methodUnits);


//		console.log("========================================");
//
//		console.log("========================================");
//
//
//		fs.writeFile("./model_platforms/src/structured_class_units.json", JSON.stringify(classUnits), function(err){
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
		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "test.dotty");
		kdmModelDrawer.drawGraph(edgesComposite, nodesComposite, outputDir, "testCallComposite.dotty");


		return {nodes: nodes, edges: edges, nodesComposite: nodesComposite, edgesComposite: edgesComposite};

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

	function findSubClasses(classUnit){
		function findSubClassesFromActionElement(ActionElement){
			var classUnits = [];
			for(var k in ActionElement.ClassUnits){
				classUnits.push(ActionElement.ClassUnits[k]);
				var subClasses = findSubClasses(ActionElement.ClassUnits[k]);
				classUnits = classUnits.concat(subClasses);
			}
			return classUnits;
		}
		var classUnits = [];
		for(var i in classUnit.MethodUnits){
			var ActionElements = classUnit.MethodUnits[i].BlockUnit.ActionElements;
			for(var j in ActionElements){
				var ActionElement = ActionElements[j];
				classUnits = classUnits.concat(findSubClassesFromActionElement(ActionElement));
				for(var k in ActionElement.ActionElements){
					classUnits = classUnits.concat(findSubClassesFromActionElement(ActionElement.ActionElements[k]));
				}
			}
		}

		return classUnits;
	}

	function locateClassUnitForMethod(methodUnitToCompare, ClassUnits){
		console.log("UUID");
		console.log(methodUnitToCompare.UUID);

		function identifyFromActionElement(targetActionElement, methodUnitToCompare){

			for(var i in targetActionElement.ClassUnits){
			var result = locateClassUnitForMethod(methodUnitToCompare, targetActionElement.ClassUnits[i]);
			if(result){
				return result;
			}
			}
			for(var i in targetActionElement.ActionElements){
				var result = identifyFromActionElement(targetActionElement.ActionElements, methodUnitToCompare);
				if(result){
					return result;
				}
			}

			return false;
		}
//		var classUnitToSelect = null;
		for(var i in ClassUnits){
			var classUnit = ClassUnits[i];
			if(!classUnit){
				continue;
			}
			console.log(classUnit);
			var MethodUnits = classUnit.MethodUnits;
			for(var j in MethodUnits){
				var methodUnit = MethodUnits[j];
				if(methodUnit.UUID === methodUnitToCompare.UUID){
					return classUnit;
				}
				else{
					for(var k in methodUnit.BlockUnit.ActionElements){
						var actionElement = methodUnit.BlockUnit.ActionElements[k];
						var result = identifyFromActionElement(actionElement, methodUnitToCompare);
						if(result){
							return result;
						}
					}
				}
			}
		}

		return false;
	}

	function locateMethodUnitForActionElement(actionElementToCompare, ClassUnits){
		console.log("UUID");
		console.log(actionElementToCompare.UUID);
//		var classUnitToSelect = null;

		function IdentifyFromActionElement(targetActionElement, associatedMethod, actionElementToCompare){
			if(targetActionElement.UUID === actionElementToCompare.UUID){
				console.log("UUID equal");

				console.log("select method");
//				console.log(methodUnit);
				return associatedMethod;

				}
				else{

					for(var i in targetActionElement.ActionElements){
						var includedActionElement = targetActionElement.ActionElements[i];
						var result = IdentifyFromActionElement(includedActionElement, associatedMethod, actionElementToCompare);
						if(result){
							return result;
						}
					}


					var result = locateMethodUnitForActionElement(actionElementToCompare, targetActionElement.ClassUnits);
					if(result){
						return false;
					}
				}

			return false;
		}

		for(var i in ClassUnits){
			var classUnit = ClassUnits[i];
			var MethodUnits = classUnit.MethodUnits;
			for(var j in MethodUnits){
				var methodUnit = MethodUnits[j];
				for(var k in methodUnit.BlockUnit.ActionElements){
					var actionElement = methodUnit.BlockUnit.ActionElements[k];
					console.log("to compare action element");
					console.log(actionElement.UUID);
					var result = IdentifyFromActionElement(actionElement, methodUnit, actionElementToCompare);
					if(result){
						return result;
					}
				}
			}
		}

		return false;
	}


//	function isResponseClass(ClassUnit){
//		for(var i in ClassUnit.MethodUnits){
//			if(ClassUnit.MethodUnits[i].isResponse){
//				return true;
//			}
//		}
//		return false;
//	}





	function createMethodUnit(XMIMethodUnit){
		return {
				name: XMIMethodUnit['$']['name'],
				kind: XMIMethodUnit['$']['kind'],
//				key: XMIMethodUnit['$']['name']+"_"+ XMIMethodUnit['$']['kind'],
				UUID: XMIMethodUnit['$']['UUID']
		};
	}

	function createActionElement(XMIActionElement){
		return {
				name: XMIActionElement['$']['name'],
				kind: XMIActionElement['$']['kind'],
//				key: XMIActionElement['$']['name']+"_"+ XMIActionElement['$']['kind']
				UUID: XMIActionElement['$']['UUID'],
		}
	}

	function identifyResponseMethods(){
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

//	function drawCallGraph(controlElements){
//
//	}



	module.exports = {
			analyseCode: analyseCode
	}
}());
