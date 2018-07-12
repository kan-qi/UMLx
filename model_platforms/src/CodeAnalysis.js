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

						topClassUnits.push(identifiedClassUnit);
					}
			}
		}

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("constructed_class_units", classUnits);

		console.log("=====================================");

		console.log("determine the entry points");

//		identifyStimulus(xmiString);

		console.log("control flow construction");

		var referencedClassUnits = [];

		var callGraph = constructCallGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits);
		var typeDependencyGraph = constructTypeDependencyGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits);
		var accessGraph = constructAccessGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits);

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
			referencedClassUnits: referencedClassUnits
		};
	}

	function constructTypeDependencyGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits){

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

		console.log("top classes");
		console.log(topClassUnits);

		for (var i in topClassUnits) {
			var classUnit = topClassUnits[i];
			console.log('test');
			console.log(classUnit);
			var xmiClassUnit = classUnit.attachment;
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
				for (var j in topClassUnits) { //TODO: only consider topClassUnits, is it okay?
					var classUnitCandidate = topClassUnits[j];
					if (classUnitCandidate.UUID == XMIClassStorableUnitType[0]['$']['UUID']) {
						targetClassUnit = classUnitCandidate;
					}
				}
				console.log("targetClassUnit");
				console.log(targetClassUnit);
				if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within classUnits, like string, int...
					continue;
				}

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
			var XMIMethodUnits = jp.query(xmiClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
			for (var i in XMIMethodUnits) {
				var XMIMethodUnit = XMIMethodUnits[i];
				var methodUnit = kdmModelUtils.identifyMethodUnit(XMIMethodUnit, xmiString);
				var methodParameters = methodUnit.Signature.parameterUnits; // the parameters of the method, including input and return
				var methodClassUnit = locateClassUnitForMethod(methodUnit, topClassUnits); // the class which owns the method

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
						for (var j in topClassUnits) { //TODO: only consider topClassUnits, is it okay?
							var classUnitCandidate = topClassUnits[j];
							if (classUnitCandidate.UUID == localVariableType[0]['$']['UUID']) {
								targetClassUnit = classUnitCandidate;
							}
						}
						if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within classUnits, like string, int...
							continue;
						}

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

					}
				}

         // targeted at input and return parameters of this method
				for (var i in methodParameters) {
					var methodParameter = methodParameters[i];
					var XMIParameterType = jp.query(xmiString, convertToJsonPath(methodParameter.type));
					var targetClassUnit = null;
					for (var j in topClassUnits) {
						var classUnitCandidate = topClassUnits[j];
						if (classUnitCandidate.UUID == XMIParameterType[0]['$']['UUID']) {
							targetClassUnit = classUnitCandidate;
						}
					}

					if (!targetClassUnit || !targetClassUnit.isWithinBoundary) { // the type of the parameter is not within classUnits, like string, int...
						continue;
					}

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
							isResponse: methodUnit.isResponse,
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
								classUnit: methodClassUnit.UUID
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

				}
			}
		}

		kdmModelDrawer.drawGraph(edgesAttr, nodesAttr, outputDir, "testAttr.dotty");
		kdmModelDrawer.drawGraph(edgesLocal, nodesLocal, outputDir, "testLocal.dotty");
		kdmModelDrawer.drawGraph(edgesPara, nodesPara, outputDir, "testPara.dotty");
		kdmModelDrawer.drawGraph(edgesP, nodesP, outputDir, "testP.dotty");

		return {nodesAttr: nodesAttr, edgesAttr: edgesAttr, nodesP: nodesP, edgesP: edgesP};

	}

	function constructAccessGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits){


		var edges = []; // call relation
		var nodes = []; // classes
		var nodesByName = {}; // what's it for?

		console.log("top classes");
		console.log(topClassUnits);

		for(var i in topClassUnits){
			var classUnit = topClassUnits[i];
			console.log('test');
			console.log(classUnit);
			var xmiClassUnit = classUnit.attachment;
			var XMIMethodUnits = jp.query(xmiClassUnit, '$.codeElement[?(@[\'$\'][\'xsi:type\']==\'code:MethodUnit\')]');
			for (var q in XMIMethodUnits) {
				var XMIMethodUnit = XMIMethodUnits[q];
				var methodUnit = kdmModelUtils.identifyMethodUnit(XMIMethodUnit, xmiString);
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
								// for (var j in topClassUnits) {
								// 	var classUnitCandidate = topClassUnits[j];
								// 	if (classUnitCandidate.UUID == XMIParameterType[0]['$']['UUID']) {
								// 		targetClassUnit = classUnitCandidate;
								// 	}
								// }
								if ('xsi:type' in targetTo[0]['$'] && targetTo[0]['$']['xsi:type'] == 'code:StorableUnit') {
									var methodAccessType = targetTo[0]['$']['type'];
									var methodAccessTypeResult = jp.query(xmiString, convertToJsonPath(methodAccessType));
									var methodAccessUUID = targetTo[0]['$']['UUID'];
									var targetClassUnit = null;
									var targetStorableUnit = null;
									for (var a in topClassUnits) {
										var classUnitCandidate = topClassUnits[a];
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
									// console.log("className");
									// console.log(methodClassUnit.name);
									// console.log("methodName");
									// console.log(methodUnit.Signature.name);
									// console.log("targetTo");
									// console.log(targetTo);
									// console.log("targetType");
									// console.log(methodAccessTypeResult);
									// console.log("targetClassUnit");
									// console.log(targetClassUnit);
									// console.log("targetStorableUnit");
									// console.log(targetStorableUnit);
									// console.log("targetUUIDResult");
									// console.log(targetClassUnit);

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
												isResponse: methodUnit.isResponse,
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

		return {nodes: nodes, edges: edges};
	}

	function constructCallGraph(classUnits, topClassUnits, xmiString, outputDir, referencedClassUnits){

		//the edges are now defined between methods...

		var edges = []; // call relation
		var nodes = []; // classes
		var nodesByName = {}; // what's it for?

		console.log("top classes");
		console.log(topClassUnits);

		for(var i in topClassUnits){
//			var classUnit = classUnits[i];
			var classUnit = topClassUnits[i];
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
				var callMethodUnit = locateMethodUnitForActionElement(callActionElement, topClassUnits);
				console.log("call method unit");
				var debug = require("../../utils/DebuggerOutput.js");
				console.log(callMethodUnit);
				debug.appendFile("call_method_units", JSON.stringify(callMethodUnit));
				var callClassUnit = locateClassUnitForMethod(callMethodUnit, topClassUnits);

				var targetMethodUnit = kdmModelUtils.identifyMethodUnit(targetXMIMethodUnit, xmiString);
				console.log("target method unit");
				console.log(targetMethodUnit);
				var targetClassUnit = locateClassUnitForMethod(targetMethodUnit, topClassUnits);

//				console.log("located class");
//				console.log(targetClassUnit);

//				var start = startNode;

//				console.log("call method");
//				console.log(callMethodUnit);

				if(!callMethodUnit.Signature || !targetMethodUnit.Signature || !targetClassUnit.isWithinBoundary){
					continue;
				}

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


		return {nodes: nodes, edges: edges};

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
