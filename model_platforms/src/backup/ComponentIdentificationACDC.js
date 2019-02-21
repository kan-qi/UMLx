/**
 * This module is to identify the components by the clustering algorithms.
 *
 * The clustering algorithm should be based on the three kinds of graphs: call graph, access graph, and type dependency graph that are constructed in Code Analysis.js
 *
 * This script relies on KDM and Java model
 *
 * The goal is the establish the control flow between the modules:
 * 
 * Identify the boundary (via KDM).
 * Identify the system components.
 * Establish the control flow between the components
 * Identify the stimuli.
 * 
 * 
 * Identify the components from ACDC results.
 *
 */

(function() {
	var fs = require('fs');
	var util = require('util');
    const uuidv4 = require('uuid/v4');
    var fileManager = require('../../utils/FileManagerUtils.js');
	var stringSimilarity = require('string-similarity');

	
	
	module.exports = {
			identifyComponents: identifyComponents
	}
}());
