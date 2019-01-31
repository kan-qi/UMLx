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
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var codeAnalysis = require("./CodeAnalysis.js");
	var util = require('util');
    const uuidv4 = require('uuid/v4');
    var fileManager = require('../../utils/FileManagerUtils.js');

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;


	function identifyComponents(
		callGraph, 
		accessGraph, 
		typeDependencyGraph, 
		extendsGraph,
		compositionGraph,
		classes, 
		classUnits, 
		dicCompositeSubclasses, 
		outputDir
	) {
		// console.log("!!!!!!!!!!!");
		// console.log(dicCompositeSubclasses);

		var classDic = {};
		var classArray = [];
		var methods = []; // store the number of methods in each class
		var classesByName = {};

		 var classes = []
		 for (var i in classesAll) {
		 	var classUnit = classesAll[i];
		 	if (classUnit.isWithinBoundary) {
		 		// classUnit['notReferenced'] = true;
		 		classes.push(classUnit);
		 	}
		 }
		

		for(var i in classes) {
			var classUnit = classes[i];
			classDic[classUnit.UUID] = i;
			var classU = {
				UUID: classUnit.UUID,
				name: classUnit.name,
				// notReferenced: true
			}
			classArray.push(classU);
			methods.push(classUnit.methodUnits?classUnit.methodUnits.length:0);
			classesByName[classUnit.name] = classUnit;
		}

//		var callMetric = calculateCallMetric(callGraph, classes, classDic, methods);
//		var accessMetric = calculateAccessMetric(accessGraph, classes, classDic, methods);
//		var typeDependencyMetric = calculateTypeDependencyMetric(typeDependencyGraph, classes, classDic, methods);
//		var extendsMetric = calculateExtendsMetric(extendsGraph, classes, classDic, methods);
//		var compositionMetric = calculateCompositionMetric(compositionGraph, classes, classDic, methods);
//
//		var metric = zeroArray(classes.length, classes.length);
//		var maxMetric = 0;
//		var relations = [];
//
//		for (var i = 0; i < classes.length; i++) {
//			for (var j = 0; j < classes.length; j++) {
//				metric[i][j] = callMetric[i][j] + accessMetric[i][j] + typeDependencyMetric[i][j] + extendsMetric[i][j] + compositionMetric[i][j];
//				maxMetric = Math.max(maxMetric, metric[i][j]);
//			}
//		}
//
//		for (var i = 0; i < classes.length; i++) {
//			var row = [];
//			for (var j = 0; j < classes.length; j++) {
//				if (metric[i][j] > 0) {
//				// if (metric[i][j] >= maxMetric/100) {
//					row.push(true);
//				}
//				else {
//					row.push(false);
//				}
//			}
//			relations.push(row);
//		}
		// console.log(classArray);
		// console.log("relations");
		// console.log(metric);
		// console.log(relations);

//		var nodesNullAll = [];
//		var nodesClassAll = [];
//		var edgesAll = [];
//
//		var nodesNullAllTree = [];
//		var nodesClassAllTree = [];
//		var edgesAllTree = [];
//
//		var clusterTree = findClusters(classArray, relations, nodesNullAllTree, nodesClassAllTree, edgesAllTree, dicCompositeSubclasses, classUnits, 0, 1.5);
//		var clusteredClasses = findClusters(classArray, relations, nodesNullAll, nodesClassAll, edgesAll, dicCompositeSubclasses, classUnits, 0, 0.6);
//		// console.log("checkcheckcheck")
//		// console.log(util.inspect(clusteredClasses, false, null))
//		var debug = require("../../utils/DebuggerOutput.js");

		// console.log("666666666");
		// console.log(nodesNullAllTree);
		// console.log(nodesClassAllTree);
		// console.log(edgesAllTree);
		
		
		


//		drawGraph(nodesNullAll, nodesClassAll, edgesAll, outputDir, "componentsComposite.dotty");
//		drawGraph(nodesNullAllTree, nodesClassAllTree, edgesAllTree, outputDir, "componentsTree.dotty");

//		debug.writeJson("clusteredClasses", clusteredClasses);
//
//		console.log("clusteredClasses");
//		console.log(clusteredClasses);
//
//		var cutoffDepth = 0; //there might be multiple criterion to determining the cutoff tree
//
//		var clusters = []; // [[component1], [component2], ...]
//
//
//		var currentLevel = [];
//		var currentLevelDepth = 0;
//		currentLevel = currentLevel.concat(clusteredClasses);
//		while(currentLevelDepth < cutoffDepth){
//			var nextLevel = [];
//			var nodeToExpand = null;
//			// console.log("currentLevel");
//			// console.log(currentLevel);
//			while ((nodeToExpand = currentLevel.shift())){
//				// console.log("nodeToExpand");
//				// console.log(nodeToExpand);
//				if (nodeToExpand.size == 1 && nodeToExpand.hasOwnProperty('value')) {
//					clusters.push([nodeToExpand.value]);
//				}
//				else {
//					nextLevel = nextLevel.concat(nodeToExpand.children);
//				}
//			}
//			currentLevel = nextLevel;
//			currentLevelDepth++;
//		}
//
//
//		for (var i in currentLevel) {
//			var newComponent = [];
//			var bfs = [currentLevel[i]];
//			while (bfs.length > 0) {
//				// console.log("bfs");
//				// console.log(bfs);
//				var node = bfs.pop(0);
//				// console.log("node");
//				// console.log(node);
//				if(!node){
//					continue;
//				}
//				if (node.size == 1 && node.hasOwnProperty('value')) {
//					newComponent.push(node.value);
//				}
//				else {
//					bfs = bfs.concat(node.children);
//				}
//			}
//			clusters.push(newComponent)
//		}

		// clusters = clusters.concat(currentLevel);

		// components are collections of classes and with interface class which are determined based on clusters.
		// need more thinking about the interface class

		// function searchClassesFromCluster(cluster, level){
		// 	if(!cluster){
		// 		return [];
		// 	}
    //
		// 	if(!level){
		// 		level = 0;
		// 	}
    //
		// 	var classes = [];
		// 	if (cluster.size == 1 && cluster.hasOwnProperty('value')) {
		// 		cluster.level = level;
		// 		classes.push(cluster.value);
		// 	}
		// 	// if(!cluster.left && !cluster.right){
		// 	// 	cluster.level = level;
		// 	// 	classes.push(cluster.value)
		// 	// }
		// 	else{
		// 		var children = cluster.children;
		// 		for (var i in children) {
		// 			var childClass = searchClassesFromCluster(children[i], level++);
		// 			classes.concat(childClass);
		// 		}
		// 		// var leftClasses = searchClassesFromCluster(cluster.left, level++);
		// 		// var rightClasses = searchClassesFromCluster(cluster.right, level++);
		// 		// classes = classes.concat(leftClasses);
		// 		// classes = classes.concat(rightClasses);
		// 	}
    //
		// 	return classes;
		// }
		//


    // console.log("clusters!!!");
		// console.log(util.inspect(clusters, false, null))
		// console.log(clusters);

		var dicComponents = {};
		var dicClassComponent = {};  // {classUnit.UUID: component.UUID}
		var dicClassComponentByName = {};
		
		var acdc = fileManager.readFileSync("acdc.rsf");
		var lines = acdc.split("\n");
		for(var i in lines){
			var line = lines[i];
			var lineElements = line.split("	");
			if(lineElements.length === 3){
				
//			}
//		}
//
//		for(var i in clusters){
//			var classUnits = clusters[i];

			// var classes = searchClassesFromCluster(clusters[i]);
//			var interfaceClass = null;
			// console.log("!!!!!!!!!!!!");
		  // console.log(classes);

			// var classUnits = [];
			// for(var j in classes){
			// 	var identifiedClass = classes[j];
			// 	var referencedClassUnit = classesByName[identifiedClass.name];
			// 	classUnits.push(referencedClassUnit);
			// }
			// console.log("classUnits")
			// console.log(classUnits)


			//determine the component name by using the top level class or the class that has the largest number of methods.
			// for now the simple implementation is to use the first class unit.

//			if(classUnits.length < 1){
//				continue;
//			}

			var component = dicClassComponentByName[lineElements[1]];
			if(!component){
			component = {
					name: lineElements[1],
					UUID: uuidv4(),
					classUnits: []
			}
			dicClassComponentByName[lineElements[1]] = component;
			dicComponents[component.UUID] = component;
			}

			var classUnit = classesByName[lineElements[2]]
			if(classUnit) {
				component.classUnits.push(classUnit);
				dicClassComponent[classUnit.UUID] = component.UUID;
			}
		}
		}

		return {
			dicComponents: dicComponents,
			dicClassComponent: dicClassComponent
		};

	}

	function drawGraph(disComponents, fileName) {

		if(!fileName){
			fileName = "acdc_kdm_clusters.dotty";
		}
		var path = outputDir+"/"+fileName;
		let graph = 'digraph g {\
			fontsize=26\
			rankdir="LR"';

		graph += 'node [fontsize=24 shape=rectangle]';
		for (var i in disComponents) {
			var component = disComponents[i];
			graph += '"a'+component['UUID'].replace(/-/g, '')+'" [label="'+component['name'].replace(/\s+/g, '')+'"]';
		}

		// graph += 'node [fontsize=24 shape=point]';
		graph += 'node [fontsize=24 shape=ellipse]';
		for (var i in disComponents) {
			var component = disComponents[i];
			for (var j in component.classUnits) {
				var classUnit = component.classUnits[j];
				graph += '"a'+classUnit['UUID'].replace(/-/g, '')+'" [label="'+classUnit['name'].replace(/\s+/g, '')+'"]';
			}
		}
		
		for (var i in disComponents) {
			var component = disComponents[i];
			for (var j in component.classUnits) {
				var classUnit = component.classUnits[j];
				graph += component['name']+' -> {'+classUnit['name']+'}';
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
