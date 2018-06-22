/**
 * This module is to identify the components by the clustering algorithms.
 * 
 * The clustering algorithm should be based on the three kinds of graphs: call graph, access graph, and type dependency graph that are constructed in Code Analysis.js
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the sytem components.....
 * Establish the control flow between the components
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
	
	function identifyComponents(classes, relations) {

	}
	
	module.exports = {
			identifyComponents : identifyComponents,
	}
}());
