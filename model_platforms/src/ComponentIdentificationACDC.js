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

	function identifyComponents(
			callGraph, 
			accessGraph, 
			typeDependencyGraph, 
			extendsGraph,
			compositionGraph,
			compositeClassUnits, 
			classUnits, 
			dicCompositeSubclasses, 
			dicCompositeClassUnits,
			dicClassUnits,
			dicClassComposite,
			outputDir
	) {

		var dicComponents = {};
		var dicClassComponent = {};  // {classUnit.UUID: component.UUID}
		var dicClassNameComponent = {};
		var dicClassComponentByName = {};
		var classNames = [];
		
//		var acdc = fileManager.readFileSync("./data/GitAndroidAnalysis/alltheapps_ACDC_java/bin_acdc_clustered.rsf");
		var acdc = fileManager.readFileSync("./data/GitAndroidAnalysis/AnotherMonitor__ACDC_java/bin_acdc_clustered.rsf");
		var lines = acdc.split("\n");
		for(var i in lines){
			var line = lines[i];
			var lineElements = line.split(/\s/g);
			
			if(lineElements.length === 3){
				
			if(lineElements[0] != "contain"){
				continue;
			}

			var component = dicClassComponentByName[lineElements[1]];
			if(!component){
			component = {
					name: lineElements[1],
					UUID: uuidv4(),
					classUnits: []
			}
			dicComponents[component.UUID] = component;
			dicClassComponentByName[lineElements[1]] = component;
			}

//			var classUnit = classesByName[lineElements[2]]
//			if(classUnit) {
//				component.classUnits.push(classUnit);
//				dicClassComponent[classUnit.UUID] = component.UUID;
//			}
			

			dicClassNameComponent[lineElements[2]] = component.UUID;
			classNames.push(lineElements[2])
			
//			component.classUnits.push({
//				name: lineElements[2],
//				UUID: uuidv4()
//			})
			
		}
		}
		
		for(var i in classUnits) {
		var classUnit = classUnits[i];
		var className = classUnit.packageName+"."+classUnit.name;
		
		var matches = stringSimilarity.findBestMatch(className, classNames);
//		if(matches.bestMatch.rating > 0.8){
		component = dicComponents[dicClassNameComponent[matches.bestMatch.target]];
		component.classUnits.push(classUnit);
		dicClassComponent[classUnit.UUID] = component.UUID;
//		}
		
		}
		
		drawComponentGraph(dicComponents, outputDir, "acdc_clustering.dotty");

		return {
			dicComponents: dicComponents,
			dicClassComponent: dicClassComponent
		};

	}

	function drawComponentGraph(disComponents, outputDir, fileName) {

		if(!fileName){
			fileName = "acdc_kdm_clusters.dotty";
		}
		var path = outputDir+"/"+fileName;
		let graph = 'digraph g {\
			fontsize=26\
			rankdir="LR"';

		graph += 'node [fontsize=24 shape=ellipse]';
		for (var i in disComponents) {
			var component = disComponents[i];
			graph += '"a'+component['UUID'].replace(/-/g, '')+'" [label="'+component['name'].replace(/[\$|\s+]/g, '')+'"]';
		}

		// graph += 'node [fontsize=24 shape=point]';
		graph += 'node [fontsize=24 shape=rectangle]';
		for (var i in disComponents) {
			var component = disComponents[i];
			for (var j in component.classUnits) {
				var classUnit = component.classUnits[j];
				graph += '"a'+classUnit['UUID'].replace(/-/g, '')+'" [label="'+classUnit['name'].replace(/[\$|\s+]/g, '')+'"]';
			}
		}
		
		for (var i in disComponents) {
			var component = disComponents[i];
			for (var j in component.classUnits) {
				var classUnit = component.classUnits[j];
//				graph += component['name'].replace(/[\.|\$|\s+]/g, '')+' -> {'+classUnit['name'].replace(/[\.|\$|\s+]/g, '')+'}';
				graph += '"a'+component['UUID'].replace(/-/g, '')+'"->"a'+classUnit['UUID'].replace(/-/g, '')+'"';
			}
		}

		graph += 'imagepath = \"./\"}';
		dottyUtil = require("../../utils/DottyUtil.js");
		dottyUtil.drawDottyGraph(graph, path, function(){
			console.log("drawing is down");
		});

		return graph;

	}
	
	
	module.exports = {
			identifyComponents: identifyComponents
	}
}());
