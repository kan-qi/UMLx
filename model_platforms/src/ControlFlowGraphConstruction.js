/**
 * This module is used to establish the control flow between the components.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * use code analysis to identify the classes and necessary information from the code.
 * Identify the system components.....
 * Identify the stimuli.
 * Identify the boundary.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var codeAnalysis = require("./codeAnalysis.js");
	var kdmModelUtils = require("./KDMModelUtils.js");
	var kdmModelDrawer = require("./KDMModelDrawer.js");

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	var xmiSring = "";
	
//	function drawRobustnessDiagram(useCase, edges, nodes){
//		var path = useCase.OutputDir+"/"+"kdm_diagram.dotty"
//		useCase.DiagramType = "kdm_diagram";
//		drawReferences(edges, nodes, path);
//		
//	}
	
	function establishControlFlow(components, xmiString, outputDir){
		//the edges are now defined between methods...
		var edges = [];
		var nodes = [];
//		var nodesByName = {};
		
		var responseMethods = [];
		// find the calls from 
		for(var i in components){
//			var classUnit = classUnits[i];
//			var classUnit = topClassUnits[i];
//			console.log('test');
//			console.log(classUnit);
//			var xmiClassUnit = classUnit.attachment;
			
			for(var j in components[i].classUnits){
			var methods = findSubMethods(components[i].classUnits[j]);
			for(var k in methods){
				var method = methods[k];
				if(method.isResponse){
					responseMethods.push(method);
				}
			}
			}
		}
		
//		function expandActionElementForCalls(actionElement){
//			
//		}
		
		var methodSequences = [];
		

		console.log("output response methods");
		console.log(responseMethods);
		
		
//		var count = 0;
		for(var i in responseMethods){
//			count++;
			var responseMethod = responseMethods[i];
			var methodSequence = [];
			methodSequence.push({
				action:"response",
				methodUnit: responseMethod
			});
			var expandedMethods = expandMethod(responseMethod, xmiString);
			console.log("expanded methods");
			console.log(expandedMethods);
			methodSequence = methodSequence.concat(expandedMethods);

			console.log("method sequence");
			console.log(methodSequence);
			methodSequences.push(methodSequence)
			
		}
	
		var nodes = [];
		var nodesByID = {};
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("method_sequences", methodSequences);
		
		console.log("method_sequences");
		console.log(methodSequences);
		
		for(var i in methodSequences){
			var methodSequence = methodSequences[i];
			var preNode = null;
			for(var j in methodSequence){
				var action = methodSequence[j].action;
				var targetMethodUnit = methodSequence[j].methodUnit;
				console.log("target method unit");
				console.log(targetMethodUnit);
				var targetComponent = locateComponentForMethod(targetMethodUnit, components);
				console.log("target component");
				console.log(targetComponent);
				if(!targetComponent){
					continue;
				}
				var node = nodesByID[targetMethodUnit.UUID];
				if(!node){
					node = {
							Name: targetComponent.name+"_"+targetMethodUnit.Signature.name,
							isResponse: targetMethodUnit.isResponse,
							Component: {
								uuid: targetComponent.uuid
							},
							trigger: action,
							_id: targetMethodUnit.UUID
//							classUnit: targetClassUnit
//							isWithinBoundary: targetClassUnit.isWithinBoundary
						};
					nodes.push(node);
					nodesByID[node._id] = node;
				}

//				var end = targetClassUnit.name;
				
				if(preNode){
				edges.push({start: preNode, end: node});
				}
				

				preNode = node;
			}
		}
		
		
		
		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "kdm_cfg_graph.dotty")
		
		return {nodes: nodes, edges: edges};
	}
	
	function locateComponentForMethod(targetMethodUnit, components){
		for(var i in components){
			var component = components[i];
			for(var j in component.classUnits){
				var classUnit = component.classUnits[j];
				
				var MethodUnits = classUnit.MethodUnits;
				for(var k in MethodUnits){
					var methodUnit = MethodUnits[k];
					if(methodUnit.UUID === targetMethodUnit.UUID){
						return component;
					}
				}
				
			}
		}
		return null;
	}
	
	function findSubMethods(classUnit){
		var subMethods = [];
		
		function findSubMethodsFromActionElement(actionElement){
			var subMethods = [];
			
			for(var i in actionElement.ClassUnits){
				var classUnit = actionElement.ClassUnits[i];
				var result = findSubMethods(classUnit);
				subMethods = subMethods.concat(result);
			}
			for(var i in actionElement.ActionElements){
				var result = findSubMethodsFromActionElement(actionElement.ActionElements[i]);
				subMethods = subMethods.concat(result);
			}
			
			return subMethods;
		}
		
		for(var i in classUnit.MethodUnits){
				var methodUnit = classUnit.MethodUnits[i];
				subMethods.push(methodUnit);
				
				for(var j in methodUnit.BlockUnit.ActionElements){
					var actionElement = methodUnit.BlockUnit.ActionElements[j];
					var result = findSubMethodsFromActionElement(actionElement);
					subMethods = subMethods.concat(result);
				}
		}
		
		return subMethods;
	}
	
	
	function expandMethod(methodUnit, xmiString){
		
		var methodSequence = [];
		
//		for(var i in responseMethod.BlockUnit.ActionElements){
//			var actionElement = responseMethod.BlockUnit.ActionElements[i];
//			
//			console.log("output action element");
//			console.log(responseMethod.Signature.name);
//			console.log(actionElement);
//			var calls = actionElement.Calls;
		
			var calls = findCallsForMethod(methodUnit);
			
			console.log("output calls");
			console.log(calls);

			for(var i in calls){
			var call = calls[i];
			
			var callXMIActionElement = jp.query(xmiString, kdmModelUtils.convertToJsonPath(call.from))[0];
			var targetXMIMethodUnit = jp.query(xmiString, kdmModelUtils.convertToJsonPath(call.to))[0];

			if(!targetXMIMethodUnit || !callXMIActionElement){
				continue;
			}
			
			var callActionElement = kdmModelUtils.identifyActionElement(callXMIActionElement, xmiString);
			console.log("call action element");
			console.log(callActionElement);
			
			
			var targetMethodUnit = kdmModelUtils.identifyMethodUnit(targetXMIMethodUnit, xmiString);
			
			console.log("find methods to expand");
			console.log(targetMethodUnit);
			
			if(methodUnit.UUID == targetMethodUnit.UUID){
				continue;
			}
			
			methodSequence.push(
					{	
						action: callActionElement.UUID,
						methodUnit: targetMethodUnit
					});
			
			var result = expandMethod(targetMethodUnit, xmiString);
			console.log("expanded methods");
			console.log(result);
			methodSequence = methodSequence.concat(result);
			
			}
//		}
			
		return methodSequence;
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
	
	
	module.exports = {
			establishControlFlow : establishControlFlow,
	}
}());
