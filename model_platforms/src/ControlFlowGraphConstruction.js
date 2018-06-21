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

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;
	
	var xmiSring = "";
	
	function establishControlFlow(components, classes, relations, callbackfunc) {
	}
	
	
	
//	function drawRobustnessDiagram(useCase, edges, nodes){
//		var path = useCase.OutputDir+"/"+"kdm_diagram.dotty"
//		useCase.DiagramType = "kdm_diagram";
//		drawReferences(edges, nodes, path);
//		
//	}
	
	
	module.exports = {
			establishControlFlow : establishControlFlow,
	}
}());
