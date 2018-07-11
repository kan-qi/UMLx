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
	var util = require('util');
    const uuidv4 = require('uuid/v4');

//	var xpath = require('xpath');
//	var dom = require('xmldom').DOMParser;


  function identifyComponents(callGraph, accessGraph, typeDependencyGraph, classesAll, outputDir) {

		var classDic = {};
		var classArray = [];
		var methods = []; // store the number of methods in each class
		var classesByName = {};

		var classes = []
		for (var i in classesAll) {
			var classUnit = classesAll[i];
			if (classUnit.isWithinBoundary) {
				classes.push(classUnit);
			}
		}

		for(var i in classes) {
			var classUnit = classes[i];
			classDic[classUnit.UUID] = i;
			var classU = {
				UUID: classUnit.UUID,
				name: classUnit.name
			}
			classArray.push(classU);
			methods.push(classUnit.MethodUnits.length);
			classesByName[classUnit.name] = classUnit;
		}

		var callMetric = calculateCallMetric(callGraph, classes, classDic, methods);
		var accessMetric = calculateAccessMetric(accessGraph, classes, classDic, methods);
		var typeDependencyMetric = calculateTypeDependencyMetric(typeDependencyGraph, classes, classDic, methods);

		var metric = zeroArray(classes.length, classes.length);
		var maxMetric = 0;
		var relations = [];

		for (var i = 0; i < classes.length; i++) {
			for (var j = 0; j < classes.length; j++) {
				metric[i][j] = callMetric[i][j] + accessMetric[i][j] + typeDependencyMetric[i][j];
				maxMetric = metric[i][j] > maxMetric ? metric[i][j] : maxMetric;
			}
		}

		for (var i = 0; i < classes.length; i++) {
			var row = [];
			for (var j = 0; j < classes.length; j++) {
				if (metric[i][j] >= maxMetric/10) {
					row.push(true);
				}
				else {
					row.push(false);
				}
			}
			relations.push(row);
		}
		console.log(classArray);
		console.log("relations");
		console.log(metric);
		console.log(relations);

		var nodesNullAll = [];
		var nodesClassAll = [];
		var edgesAll = [];

		var clusteredClasses = findClusters(classArray, relations, nodesNullAll, nodesClassAll, edgesAll);
		console.log(util.inspect(clusteredClasses, false, null))
		var debug = require("../../utils/DebuggerOutput.js");

		drawGraph(nodesNullAll, nodesClassAll, edgesAll, outputDir, "components.dotty");

		debug.writeJson("clusteredClasses", clusteredClasses);

		var cutoffDepth = 4; //there might be multiple criterion to determining the cutoff tree

		var clusters = [];

		var currentLevel = [];
		var currentLevelDepth = 0;
		currentLevel.push(clusteredClasses[0]);
		while(currentLevelDepth < cutoffDepth){
			var nextLevel = [];
			var nodeToExpand = null;
			console.log("currentLevel");
			console.log(currentLevel);
			while ((nodeToExpand = currentLevel.shift())){
				console.log("nodeToExpand");
				console.log(nodeToExpand);
				var leftNode = nodeToExpand.left;
				var rightNode = nodeToExpand.right;
				if(!leftNode && !rightNode){
					clusters.push(nodeToExpand);
				}
				else{
					nextLevel.push(leftNode);
					nextLevel.push(rightNode);
				}
			}
			currentLevel = nextLevel;
			currentLevelDepth++;
		}

		clusters = clusters.concat(currentLevel);

		// components are collections of classes and with interface class which are determined based on clusters.
		// need more thinking about the interface class

		function searchClassesFromCluster(cluster, level){
			if(!cluster){
				return [];
			}

			if(!level){
				level = 0;
			}

			var classes = [];
			if(!cluster.left && !cluster.right){
				cluster.level = level;
				classes.push(cluster.value)
			}
			else{
				var leftClasses = searchClassesFromCluster(cluster.left, level++);
				var rightClasses = searchClassesFromCluster(cluster.right, level++);
				classes = classes.concat(leftClasses);
				classes = classes.concat(rightClasses);
			}

			return classes;
		}

		var components = [];

		for(var i in clusters){
			var classes = searchClassesFromCluster(clusters[i]);
//			var interfaceClass = null;

			var classUnits = [];
			for(var j in classes){
				var identifiedClass = classes[j];
				var referencedClassUnit = classesByName[identifiedClass.name];
				classUnits.push(referencedClassUnit);
			}

			var component = {
					name: i,
					uuid: uuidv4(),
					classUnits: classUnits
			}
			components.push(component);
		}

		console.log("components");
		console.log(components);

		return components;

	}

	function drawGraph(nodesNullAll, nodesClassAll, edgesAll, outputDir, fileName) {

		if(!fileName){
			fileName = "kdm_clusters.dotty";
		}
		var path = outputDir+"/"+fileName;
		let graph = 'digraph g {\
			fontsize=26\
			rankdir="LR"';

		graph += 'node [fontsize=24 shape=rectangle]';
		for (var i in nodesClassAll) {
			var nodesClass = nodesClassAll[i];
			for (var j in nodesClass) {
				var node = nodesClass[j];
				graph += '"'+node['name'].replace(/\s+/g, '')+'" [label="'+node['name'].replace(/\s+/g, '')+'"]';
			}
		}

		graph += 'node [shape=point label=""]';
		for (var i in nodesNullAll) {
			var nodesNull = nodesNullAll[i];
			for (var j in nodesNull) {
				var node = nodesNull[j];
				graph += node+' ';
			}
		}

		for (var i in edgesAll) {
			var edges = edgesAll[i];
			for (var j in edges) {
				var edge = edges[j];
				graph += edge['start']+' -> {'+edge['end'].replace(/\s+/g, '')+'}';
			}
		}

		graph += 'imagepath = \"./\"}';
		dottyUtil = require("../../utils/DottyUtil.js");
		dottyUtil.drawDottyGraph(graph, path, function(){
			console.log("drawing is down");
		});

		return graph;

	}

  function zeroArray(column, row) {
		var array = [];
		for (var i = 0; i < column; i++) {
			var tmp = [];
			if (row == 1) {
				tmp = 0;
			}
			else {
				for (var j = 0; j < row; j++) {
					tmp.push(0);
				}
			}
			array.push(tmp.slice());
		}
		return array;
	}

	function calculateTypeDependencyMetric(typeDependencyGraph, classes, classDic, methods) {
		console.log("type dependency metric");

		  console.log("typeDependencyGraph");
		  console.log(typeDependencyGraph);
		// console.log(typeDependencyGraph);

		// var classDic = {};
		// var classArray = [];
		// var methods = [];
    //
		// for(var i in classes) {
		// 	var classUnit = classes[i];
		// 	classDic[classUnit.UUID] = i;
		// 	var classU = {
		// 		UUID: classUnit.UUID,
		// 		name: classUnit.name
		// 	}
		// 	classArray.push(classU);
		// 	methods.push(classUnit.MethodUnits.length);
		// }

		var attrs = zeroArray(classes.length, classes.length); //  the number of attributes of class Cli whose type is class Clj.
		// var RtnTypes = {};
		// var Params = {};
		// var LocalVars = {};
		var paras = zeroArray(classes.length, classes.length);
		var typeDependencyMetrics = zeroArray(classes.length, classes.length);

		if (typeDependencyGraph) {
			for (var i in typeDependencyGraph.edgesAttr) {
	      var edge = typeDependencyGraph.edgesAttr[i];
				var col = classDic[edge.start.component.classUnit];
				var row = classDic[edge.end.component.classUnit];
				attrs[col][row]++;
			}
			for (var i in typeDependencyGraph.edgesP) {
				var edge = typeDependencyGraph.edgesP[i];
				var col = classDic[edge.start.component.classUnit];
				var row = classDic[edge.end.component.classUnit];
	      paras[col][row]++;
			}
		}

		for (var i = 0; i < classes.length; i++) {
			for (var j = 0; j < classes.length; j++) {
				var addition = 0;
				if (methods[i] != 0) {
					addition = paras[i][j]/methods[i];
				}
				typeDependencyMetrics[i][j] = attrs[i][j]+addition;
			}
		}

		// for (var key1 in accessors) {
		// 	if (accessors.hasOwnProperty(key1)) {
		// 		for (var key2 in accessors[key1]) {
		// 			if (accessors[key1].hasOwnProperty(key2)) {
		// 				// callersNumber[parseInt(key1)][parseInt(key2)] = callers[key1][key2].size;
		// 				// calleesNumber[parseInt(key1)][parseInt(key2)] = callees[key1][key2].size;
		// 				accessMetrics[parseInt(key1)][parseInt(key2)] = access[parseInt(key1)][parseInt(key2)]/methods[parseInt(key1)]*(accessors[key1][key2].size+accessed[key1][key2].size)/(methods[parseInt(key1)]+attrs[parseInt(key2)]);
		// 			}
		// 		}
		// 	}
		// }

    // console.log(classArray);
		console.log(typeDependencyMetrics);
    return typeDependencyMetrics;
	}

	function calculateAccessMetric(accessGraph, classes, classDic, methods) {
		console.log("access metric")
		// console.log(callGraph.nodes);
		// console.log(accessGraph.edges);
		// var classDic = {};
		// var classArray = [];
		// var methods = [];
		var attrs = []; // store the number of attributes for each class

		for(var i in classes) {
			var classUnit = classes[i];
			// classDic[classUnit.UUID] = i;
			// var classU = {
			// 	UUID: classUnit.UUID,
			// 	name: classUnit.name
			// }
			// classArray.push(classU);
			// methods.push(classUnit.MethodUnits.length);
			attrs.push(classUnit.StorableUnits.length);
		}

    var access = zeroArray(classes.length, classes.length);
		var accessors = {};
		var accessed = {};
		var accessMetrics = zeroArray(classes.length, classes.length);

		for (var i in accessGraph.edges) {
      var edge = accessGraph.edges[i];
			var col = classDic[edge.start.component.classUnit];
			var row = classDic[edge.end.component.classUnit];
			access[col][row]++;

			if (!(col in accessors)) {
				accessors[col] = {}
			}
			if (!(row in accessors[col])) {
				accessors[col][row] = new Set([edge.start.UUID]);
			}
			// else if (!(callers[col][row].has(edge.start.UUID))) {
			else {
				accessors[col][row].add(edge.start.UUID);
			}

			if (!(col in accessed)) {
				accessed[col] = {}
			}
			if (!(row in accessed[col])) {
				accessed[col][row] = new Set([edge.end.UUID]);
			}
			// else if (!(callees[col][row].has(edge.end.UUID))) {
			else {
				callees[col][row].add(edge.start.UUID);
			}
		}

		for (var key1 in accessors) {
			if (accessors.hasOwnProperty(key1)) {
				for (var key2 in accessors[key1]) {
					if (accessors[key1].hasOwnProperty(key2)) {
						// callersNumber[parseInt(key1)][parseInt(key2)] = callers[key1][key2].size;
						// calleesNumber[parseInt(key1)][parseInt(key2)] = callees[key1][key2].size;
						accessMetrics[parseInt(key1)][parseInt(key2)] = access[parseInt(key1)][parseInt(key2)]/methods[parseInt(key1)]*(accessors[key1][key2].size+accessed[key1][key2].size)/(methods[parseInt(key1)]+attrs[parseInt(key2)]);
					}
				}
			}
		}

    // console.log(classArray);
		console.log(accessMetrics);
		return accessMetrics;

	}

	function calculateCallMetric(callGraph, classes, classDic, methods){
		console.log("call metric")
		// console.log(callGraph.nodes);
		// console.log(callGraph.edges);
		// console.log("classUnitCheck");
		// console.log(classes);
		// var classDic = {};
		// var classArray = [];
		// var methods = []; // store the number of methods in each class
    //
		// for(var i in classes) {
		// 	var classUnit = classes[i];
		// 	classDic[classUnit.UUID] = i;
		// 	var classU = {
		// 		UUID: classUnit.UUID,
		// 		name: classUnit.name
		// 	}
		// 	classArray.push(classU);
		// 	methods.push(classUnit.MethodUnits.length);
		// }

		var calls = zeroArray(classes.length, classes.length);
		// var callersNumber = zeroArray(classes.length, classes.length);
		// var calleesNumber = zeroArray(classes.length, classes.length);
		var callers = {};
		var callees = {};
		var callMetrics = zeroArray(classes.length, classes.length);

    // console.log(calls);

		for (var i in callGraph.edges) {
      var edge = callGraph.edges[i];
			var col = classDic[edge.start.component.classUnit];
			var row = classDic[edge.end.component.classUnit];
			console.log("checkcheck");
			console.log(edge);
			console.log(col);
			console.log(row);
			calls[col][row]++;

			if (!(col in callers)) {
				callers[col] = {}
			}
			if (!(row in callers[col])) {
				callers[col][row] = new Set([edge.start.UUID]);
			}
			else if (!(callers[col][row].has(edge.start.UUID))) {
				callers[col][row].add(edge.start.UUID);
			}

			if (!(col in callees)) {
				callees[col] = {}
			}
			if (!(row in callees[col])) {
				callees[col][row] = new Set([edge.end.UUID]);
			}
			else if (!(callees[col][row].has(edge.end.UUID))) {
				callees[col][row].add(edge.start.UUID);
			}
		}

		for (var key1 in callers) {
			if (callers.hasOwnProperty(key1)) {
				for (var key2 in callers[key1]) {
					if (callers[key1].hasOwnProperty(key2)) {
						// callersNumber[parseInt(key1)][parseInt(key2)] = callers[key1][key2].size;
						// calleesNumber[parseInt(key1)][parseInt(key2)] = callees[key1][key2].size;
						callMetrics[parseInt(key1)][parseInt(key2)] = calls[parseInt(key1)][parseInt(key2)]/methods[parseInt(key1)]*(callers[key1][key2].size+callees[key1][key2].size)/(methods[parseInt(key1)]+methods[parseInt(key2)]);
					}
				}
			}
		}

    // console.log(classArray);
		console.log(callMetrics);
		return callMetrics;

		// for (var key1 in callees) {
		// 	if (callers.hasOwnProperty(key1)) {
		// 		for (var key2 in callees[key1]) {
		// 			if (callees[key1].hasOwnProperty(key2)) {
		// 				calleesNumber[parseInt(key1)][parseInt(key2)] = callees[key1][key2].size;
		// 			}
		// 		}
		// 	}
		// }
		// console.log(classDic);
		// console.log(classArray);
	}


	function findClusters(classArray, metrics, nodesNullAll, nodesClassAll, edgesAll) {

		var clusterfck = require("clusterfck");

		var rowDic = {}
		for (var i in metrics) {
			var metric = metrics[i].toString();
			if (metric in rowDic) {
				rowDic[metric].push(classArray[i]);
			}
			else {
				var classes = new Array(classArray[i]);
				rowDic[metric] = classes;
			}
		}

		// coupling metric table for class c1 to c5
//		     c1  c2  c3  c4  c5
		// c1 [  ,   ,   ,   ,   ]
		// c2 [  ,   ,   ,   ,   ]
		// c3 [  ,   ,   ,   ,   ]
		// c4 [  ,   ,   ,   ,   ]
		// c5 [  ,   ,   ,   ,   ]
		// true: W(i, j) > threshold, class i has the relatively strong relationship to class j
		// var metrics = [
		//     [true, false, true, false, true],
		//     [false, true, false, false, true],
		//     [false, true, true, true, false],
		//     [false, true, false, false, false],
		//     [false, true, true, false, false]
		// ];

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

		var threshold = 10;

		var clusters = clusterfck.hcluster(metrics, distance, clusterfck.SINGLE_LINKAGE, threshold);
		console.log("clusterfck");
		console.log(clusters);

		// console.log("check");
    // var classClusters = convertTree(clusters, rowDic);
		var classClusters = [];
		// var nodesNullAll = [];
		// var nodesClassAll = [];
		// var edgesAll = [];
		for (var i in clusters) {
			var cluster = clusters[i];
			// console.log(cluster);
			nodesNull = [];
			nodesClass = [];
			edges = [];
			var classCluster = convertTree(cluster, rowDic, nodesNull, nodesClass, edges, "m")
			nodesClassAll.push(nodesClass);
			nodesNullAll.push(nodesNull);
			edgesAll.push(edges);
			classClusters.push(classCluster);
		}
		// console.log("check");
    // console.log(classClusters);


		return classClusters;

	}

	// function convertSingle(cluster, rowDic) {
	// 	var row = cluster["value"].toString();
	// 	var classes = rowDic[row];
	// 	var classSelected = classes[classes.length-1];
	// 	return classSelected;
	// }

	function convertTree(cluster, rowDic, nodesNull, nodesClass, edges, rootName) {
		  var classClusters = {};
			// console.log(cluster);
			if (cluster["size"] == 1) {
				var row = cluster["value"].toString();
				var classes = rowDic[row];
				var classSelected = classes[classes.length-1];
				classClusters["size"] = 1;
				classClusters["value"] = classSelected;
				classes.pop();
				nodesClass.push(classSelected);
				edges.push({start: rootName, end: classSelected['name']});
			}
			else {
				var left = convertTree(cluster["left"], rowDic, nodesNull, nodesClass, edges, rootName+'l');
				var right = convertTree(cluster["right"], rowDic, nodesNull, nodesClass, edges, rootName+'r');
				classClusters["left"] = left;
				classClusters["right"] = right;
				classClusters["size"] = 2;
				nodesNull.push(rootName+'l');
				nodesNull.push(rootName+'r');
				edges.push({start: rootName, end: rootName+'l'});
				edges.push({start: rootName, end: rootName+'r'});
			}
			return classClusters;
	}


	module.exports = {
			// findClusters : findClusters,
			// calculateCallMetric: calculateCallMetric,
			// calculateAccessMetric: calculateAccessMetric,
			// calculateTypeDependencyMetric: calculateTypeDependencyMetric,
			identifyComponents: identifyComponents
	}
}());
