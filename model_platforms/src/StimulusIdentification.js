/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var codeAnalysis = require("./codeAnalysis.js");

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	var xmiSring = "";
	
	/*
	 * The response has been identified int he control flow construction step. Stimulus nodes are constructed by creating triggering nodes connecting to those stimulus.
	 */
	
	function identifyStimuli(controlFlowGraph, callbackfunc) {
		var stimulusNodes = [];
		var triggeringEdges = [];
		
		for(var i in controlFlowGraph.nodes){
//			var component = components[i];
//			var classUnits = component.classUnits;
			var node = controlFlowGraph.nodes[i];		
			if(node.isResponse){
							//create a stimulus nodes for the activity.
							var stimulus = {
									Type: "Stimulus",
									Name: "stl#"+node.Name,
									_id: node._id+"_STL",
//									Attachment: XMIActivity,
									Stimulus: true,
									trigger: "stimulus",
									OutScope: false
							}
							
							node.trigger = stimulus._id;
							
							controlFlowGraph.nodes.push(stimulus);
							controlFlowGraph.edges.push({start: stimulus, end: node});
					}
				}
	}
		
	
	module.exports = {
			identifyStimuli : identifyStimuli,
	}
}());
