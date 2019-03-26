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
	var kdmModelUtils = require("./KDMModelUtils.js");
	var kdmModelDrawer = require("./KDMModelDrawer.js");
	
	var xmiSring = "";
	
	function establishControlFlow(dicComponents, dicClassComponent, dicMethodClass, dicResponseMethodUnits, dicMethods, callGraph, outputDir){
		var edges = [];
		var nodes = [];

		var methodSequences = [];
		
		for(var i in dicResponseMethodUnits){
			var responseMethod = dicResponseMethodUnits[i];
			var methodSequence = [];
			methodSequence.push({
				action:"response",
				methodUnit: responseMethod
			});
			var expandedMethods = expandMethod(responseMethod, callGraph, dicMethods,{});
			methodSequence = methodSequence.concat(expandedMethods);
			methodSequences.push(methodSequence)
			
		}
	
		var nodes = [];
		var nodesByID = {};
		
		for(var i in methodSequences){
			var methodSequence = methodSequences[i];
			var preNode = null;
			var preComponent = null;
			for(var j in methodSequence){
				var action = methodSequence[j].action;
				var targetMethodUnit = methodSequence[j].methodUnit;
				var targetClassUnitUUID = dicMethodClass[targetMethodUnit.UUID];
				var targetComponent = dicComponents[dicClassComponent[targetClassUnitUUID]];

				if(!targetComponent){
					continue;
				}
				
				var node = nodesByID[targetMethodUnit.UUID];
				if(!node){
					node = {
							name: targetComponent.name+"_"+targetMethodUnit.signature.name,
							isResponse: action === "response" ? true : false,
							component: {
								UUID: targetComponent.UUID
							},
							trigger: action,
							UUID: targetMethodUnit.UUID
					};
					nodes.push(node);
					nodesByID[node.UUID] = node;
				}
				
				if(preNode && preComponent && preComponent != targetComponent){
				edges.push({start: preNode, end: node});
				}
				
				preNode = node;
				preComponent = targetComponent;
			}
		}
		
//		var cfg = identifyStimuli(nodes, edges);
		
		kdmModelDrawer.drawGraph(cfg.edges, cfg.nodes, outputDir, "kdm_cfg_graph.dotty");
		
		return cfg;
	}
	
	/*
	 * The response has been identified int he control flow construction step. Stimulus nodes are constructed by creating triggering nodes connecting to those stimulus.
	 */
	
	function identifyStimuli(nodes, edges) {
		var stimulusNodes = [];
		var triggeringEdges = [];
		
		for(var i in nodes){
			var node = nodes[i];
			node.type = "node";
			if(node.isResponse){
							node.type = "response";
							//create a stimulus nodes for the activity.
							var stimulusNode = {
									type: "stimulus",
									name: "stl#"+node.name,
									UUID: node.UUID+"_STL",
									trigger: "stimulus"
							}
							
							node.trigger = stimulusNode._id;
							
							stimulusNodes.push(stimulusNode);
							triggeringEdges.push({start: stimulusNode, end: node});
					}

		}
		
		nodes = nodes.concat(stimulusNodes);
		edges = edges.concat(triggeringEdges);
		
		return {nodes: nodes, edges: edges};
	}
	
	function expandMethod(methodUnit, callGraph, dicMethods, expandedMethods){
		
		var methodSequence = [];
		
			var calls = findCallsForMethod(methodUnit, callGraph, dicMethods);
			expandedMethods[methodUnit.UUID] = 1;

			for(var i in calls){
			var call = calls[i];
			
			methodSequence.push(call);
			
			if(!expandedMethods[call.methodUnit.UUID]){
			var result = expandMethod(call.methodUnit, callGraph, dicMethods,expandedMethods);
			methodSequence = methodSequence.concat(result);
			}
			}
			
		return methodSequence;
	}
	
	/*
	 * this function will exclude the calls within another function
	 */
	function findCallsForMethod(methodUnit, callGraph, dicMethods){
		var calls = [];
		
		for(var i in callGraph.edges){
			var edge = callGraph.edges[i];
			if(edge.start.UUID === methodUnit.UUID){
				calls.push({action:dicMethods[edge.start.UUID], methodUnit:dicMethods[edge.end.UUID]});
			}
		}
	
		return calls;
	}
	
	
	module.exports = {
			establishControlFlow : establishControlFlow,
	}
}());
