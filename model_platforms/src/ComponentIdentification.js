/**
 * This module is to identify the components by the clustering algorithms.
 * 
 * The clustering algorithm should be based on the three kinds of graphs: call graph, access graph, and type dependency graph that are constructed in Code Analysis.js
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the boundary....
 * Identify the sytem components.....
 * Establish the control flow between the components
 * Identify the stimuli.
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

//		var clusterfck = require("clusterfck");

		// coupling metric table for class c1 to c5
//		     c1  c2  c3  c4  c5
		// c1 [  ,   ,   ,   ,   ]
		// c2 [  ,   ,   ,   ,   ]
		// c3 [  ,   ,   ,   ,   ]
		// c4 [  ,   ,   ,   ,   ]
		// c5 [  ,   ,   ,   ,   ]
		// true: W(i, j) > threshold, class i has the relatively strong relationship to class j
		var metrics = [
		    [true, false, true, false, true],
		    [false, true, false, false, true],
		    [false, true, true, true, false],
		    [false, true, false, false, false],
		    [false, true, true, false, false]
		];

		function distance(a, b) {
		  var d = 0;
		  var inter = 0
		  var union = 0
		  for (var i = 0; i < a.length; i++) {
		    if (a[i] && b[i]) {
		      inter++;
		    }
		    if (a[i] || b[i]) {
		      union++;
		    }
		  }
		  var JaccSimi;
		  if (union == 0) {
		    JaccSimi = 0
		  }
		  else {
		    JaccSimi = inter/union;
		  }
		  d = 1 - JaccSimi;
		  return d;
		}

		var threshold = 0.6;

		var clusters = clusterfck.hcluster(metrics, distance, clusterfck.SINGLE_LINKAGE, threshold);
		console.log(clusters);

	}
	
	
	module.exports = {
			identifyComponents : identifyComponents,
	}
}());
