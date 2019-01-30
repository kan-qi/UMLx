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

		// var classes = []
		// for (var i in classesAll) {
		// 	var classUnit = classesAll[i];
		// 	if (classUnit.isWithinBoundary) {
		// 		// classUnit['notReferenced'] = true;
		// 		classes.push(classUnit);
		// 	}
		// }

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

		var callMetric = calculateCallMetric(callGraph, classes, classDic, methods);
		var accessMetric = calculateAccessMetric(accessGraph, classes, classDic, methods);
		var typeDependencyMetric = calculateTypeDependencyMetric(typeDependencyGraph, classes, classDic, methods);
		var extendsMetric = calculateExtendsMetric(extendsGraph, classes, classDic, methods);
		var compositionMetric = calculateCompositionMetric(compositionGraph, classes, classDic, methods);

		var metric = zeroArray(classes.length, classes.length);
		var maxMetric = 0;
		var relations = [];

		for (var i = 0; i < classes.length; i++) {
			for (var j = 0; j < classes.length; j++) {
				metric[i][j] = callMetric[i][j] + accessMetric[i][j] + typeDependencyMetric[i][j] + extendsMetric[i][j] + compositionMetric[i][j];
				maxMetric = Math.max(maxMetric, metric[i][j]);
			}
		}

		for (var i = 0; i < classes.length; i++) {
			var row = [];
			for (var j = 0; j < classes.length; j++) {
				if (metric[i][j] > 0) {
				// if (metric[i][j] >= maxMetric/100) {
					row.push(true);
				}
				else {
					row.push(false);
				}
			}
			relations.push(row);
		}
		// console.log(classArray);
		// console.log("relations");
		// console.log(metric);
		// console.log(relations);

		var nodesNullAll = [];
		var nodesClassAll = [];
		var edgesAll = [];

		var nodesNullAllTree = [];
		var nodesClassAllTree = [];
		var edgesAllTree = [];

		var clusterTree = findClusters(classArray, relations, nodesNullAllTree, nodesClassAllTree, edgesAllTree, dicCompositeSubclasses, classUnits, 0, 1.5);
		var clusteredClasses = findClusters(classArray, relations, nodesNullAll, nodesClassAll, edgesAll, dicCompositeSubclasses, classUnits, 0, 0.6);
		// console.log("checkcheckcheck")
		// console.log(util.inspect(clusteredClasses, false, null))
		var debug = require("../../utils/DebuggerOutput.js");

		// console.log("666666666");
		// console.log(nodesNullAllTree);
		// console.log(nodesClassAllTree);
		// console.log(edgesAllTree);


		drawGraph(nodesNullAll, nodesClassAll, edgesAll, outputDir, "componentsComposite.dotty");
		drawGraph(nodesNullAllTree, nodesClassAllTree, edgesAllTree, outputDir, "componentsTree.dotty");

		debug.writeJson("clusteredClasses", clusteredClasses);

		console.log("clusteredClasses");
		console.log(clusteredClasses);

		var cutoffDepth = 0; //there might be multiple criterion to determining the cutoff tree

		var clusters = []; // [[component1], [component2], ...]


		var currentLevel = [];
		var currentLevelDepth = 0;
		currentLevel = currentLevel.concat(clusteredClasses);
		while(currentLevelDepth < cutoffDepth){
			var nextLevel = [];
			var nodeToExpand = null;
			// console.log("currentLevel");
			// console.log(currentLevel);
			while ((nodeToExpand = currentLevel.shift())){
				// console.log("nodeToExpand");
				// console.log(nodeToExpand);
				if (nodeToExpand.size == 1 && nodeToExpand.hasOwnProperty('value')) {
					clusters.push([nodeToExpand.value]);
				}
				else {
					nextLevel = nextLevel.concat(nodeToExpand.children);
				}
			}
			currentLevel = nextLevel;
			currentLevelDepth++;
		}


		for (var i in currentLevel) {
			var newComponent = [];
			var bfs = [currentLevel[i]];
			while (bfs.length > 0) {
				// console.log("bfs");
				// console.log(bfs);
				var node = bfs.pop(0);
				// console.log("node");
				// console.log(node);
				if(!node){
					continue;
				}
				if (node.size == 1 && node.hasOwnProperty('value')) {
					newComponent.push(node.value);
				}
				else {
					bfs = bfs.concat(node.children);
				}
			}
			clusters.push(newComponent)
		}

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

		for(var i in clusters){
			var classUnits = clusters[i];

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

			if(classUnits.length < 1){
				continue;
			}

			var component = {
					name: classUnits[0].name,
					UUID: uuidv4(),
					classUnits: classUnits
			}

			dicComponents[component.UUID] = component;

			for (var j in classUnits) {
				dicClassComponent[classUnits[j].UUID] = component.UUID;
			}
		}

		return {
			dicComponents: dicComponents,
			dicClassComponent: dicClassComponent
		};

	}

	function drawGraph(nodesNullAll, nodesClassAll, edgesAll, outputDir, fileName) {

		// console.log("!!!!!!!!!!!!");
    //
		// console.log(util.inspect(nodesClassAll, false, null));
		// console.log(util.inspect(nodesNullAll, false, null));
		// console.log(util.inspect(edgesAll, false, null));

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
				graph += '"a'+node['UUID'].replace(/-/g, '')+'" [label="'+node['name'].replace(/\s+/g, '')+'"]';
			}
		}

		// graph += 'node [fontsize=24 shape=point]';
		graph += 'node [fontsize=24 shape=ellipse]';
		for (var i in nodesNullAll) {
			var nodesNull = nodesNullAll[i];
			for (var j in nodesNull) {
				var node = nodesNull[j];
				graph += node.name+' ';
				if (node.distance != null) {
					graph += '[label="'+node.distance+'"]';
				}
			}
		}

		for (var i in edgesAll) {
			var edges = edgesAll[i];
			for (var j in edges) {
				var edge = edges[j];
				graph += edge['start']['name']+' -> {'+edge['end']['name']+'}';
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
		// 		UUID: classUnit.uuid,
		// 		name: classUnit.name
		// 	}
		// 	classArray.push(classU);
		// 	methods.push(classUnit.methodUnits.length);
		// }

		var attrs = zeroArray(classes.length, classes.length); //  the number of attributes of class Cli whose type is class Clj.
		// var RtnTypes = {};
		// var Params = {};
		// var LocalVars = {};
		var paras = zeroArray(classes.length, classes.length);
		var typeDependencyMetrics = zeroArray(classes.length, classes.length);

		console.log("class dic");
		console.log(classDic);
		if (typeDependencyGraph) {
			for (var i in typeDependencyGraph.edgesAttrComposite) {
				var edge = typeDependencyGraph.edgesAttrComposite[i];
				var col = classDic[edge.start.UUID];
				var row = classDic[edge.end.UUID];
				attrs[col][row]++;
				// classArray[col] = false;
				// classArray[row] = false;
			}
			for (var i in typeDependencyGraph.edgesPComposite) {
				var edge = typeDependencyGraph.edgesPComposite[i];
				var col = classDic[edge.start.UUID];
				var row = classDic[edge.end.UUID];
				paras[col][row]++;
				// classArray[col] = false;
				// classArray[row] = false;
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
			// methods.push(classUnit.methodUnits.length);
			attrs.push(classUnit.StorableUnits?classUnit.StorableUnits.length:0);
		}

		var access = zeroArray(classes.length, classes.length);
		var accessors = {};
		var accessed = {};
		var accessMetrics = zeroArray(classes.length, classes.length);

		for (var i in accessGraph.edgesComposite) {
			var edge = accessGraph.edgesComposite[i];
			var col = classDic[edge.start.UUID];
			var row = classDic[edge.end.UUID];
			if(col == null || row == null){
				continue;
			}
			access[col][row]++;
			// classArray[col] = false;
			// classArray[row] = false;

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
				accessed[col][row].add(edge.start.UUID);
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
		// 	methods.push(classUnit.methodUnits.length);
		// }

		var calls = zeroArray(classes.length, classes.length);
		// var callersNumber = zeroArray(classes.length, classes.length);
		// var calleesNumber = zeroArray(classes.length, classes.length);
		var callers = {};
		var callees = {};
		var callMetrics = zeroArray(classes.length, classes.length);

		// console.log(calls);

		for (var i in callGraph.edgesComposite) {
			var edge = callGraph.edgesComposite[i];
			var col = classDic[edge.start.UUID];
			var row = classDic[edge.end.UUID];
			if(col == null || row == null){
				continue;
			}
			// classArray[col] = false;
			// classArray[row] = false;
			// console.log("checkcheck");
			// console.log("classDic");
			// console.log(classDic);
			// console.log("classArray");
			// console.log(classArray);
			// console.log(edge);
			// console.log(col);
			// console.log(row);
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

	function calculateExtendsMetric(extendsGraph, classes, classDic, methods) {
		var extendsMetrics = zeroArray(classes.length, classes.length);

		if (!extendsGraph) {
			return extendsMetrics;
		}

		for (var i in extendsGraph.edges) {
			var edge = extendsGraph.edges[i];
			var col = classDic[edge.start.UUID];
			var row = classDic[edge.end.UUID];
			extendsMetrics[col][row]++;
		}

		return extendsMetrics;
	}

	function calculateCompositionMetric(compositionGraph, classes, classDic, methods) {
		var compositionMetrics = zeroArray(classes.length, classes.length);

		if (!compositionGraph) {
			return compositionMetrics;
		}

		for (var i in compositionGraph.edges) {
			var edge = compositionGraph.edges[i];
			var col = classDic[edge.start.UUID];
			var row = classDic[edge.end.UUID];
			if(!col || !row){
				continue;
			}
			compositionMetrics[col][row]++;
		}

		return compositionMetrics;
	}

// mode => 0: SINGLE_LINKAGE; 1: CONPLETE_LINKAGE; 2: AVERAGE_LINKAGE
	function findClusters(classArray, metrics, nodesNullAll, nodesClassAll, edgesAll, dicCompositeSubclasses, classUnits, mode, threshold) {

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

		// var threshold = 0.6;
		var linkage = null;
		if (mode == 0) {
			linkage = clusterfck.SINGLE_LINKAGE;
		}
		else if (mode == 1) {
			linkage = clusterfck.COMPLETE_LINKAGE;
		}
		else if (mode == 2) {
			linkage = clusterfck.AVERAGE_LINKAGE;
		}

		var clusters = clusterfck.hcluster(metrics, distance, linkage, threshold);
		console.log("clusterfck");
		console.log(clusters);

		// console.log("check");
    // var classClusters = convertTree(clusters, rowDic);
		var classClusters = [];
		// var nodesNullAll = [];
		// var nodesClassAll = [];
		// var edgesAll = [];
		var ind = 0
		for (var i in clusters) {
			var cluster = clusters[i];
			// console.log(cluster);
			nodesNull = [];
			nodesClass = [];
			edges = [];
			var dis = calculateDis(cluster, mode);
			// var distance = 0;
			// if (count != 0) {
			// 	distance = sum/count;
			// }
			var startNode = {
				name: 'c'+ind,
				distance: dis
			}
			ind++;
			var classCluster = convertTree(cluster, rowDic, nodesNull, nodesClass, edges, startNode, dicCompositeSubclasses, classUnits, mode);
//			console.log("classcluster")
//			console.log(util.inspect(classCluster, false, null))
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
	function findClassUnit(classUUID, classUnits) {

		for (var i in classUnits) {
			var classUnit = classUnits[i];
			if (classUUID == classUnit.UUID) {
				return classUnit;
			}
		}
		return null;

	}

	function findAllClass(node) {
		if (node.size == 1) {
			return [node.value];
		}
		else {
			var left = findAllClass(node.left);
			var right = findAllClass(node.right);
			var res = left.concat(right);
			return res;
		}
	}

	function calculateDis(node, mode) {

    var dis = null;
		if (!(node.hasOwnProperty("value"))) {
			var left = findAllClass(node.left);
			var right = findAllClass(node.right);
			var sum = 0;
			var count = 0;
			if (mode == 0) {
				dis = Number.MAX_VALUE;
			}
			else if (mode == 1) {
				dis = Number.MIN_VALUE;
			}
			for (var i in left) {
				var a = left[i];
				for (var j in right) {
					var b = right[j];
					var inter = 0;
					var union = 0;
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
					// sum += d;
					// count++;
					if (mode == 0) {
						if (d < dis) {
							dis = d;
						}
					}
					else if (mode == 1) {
						if (d > dis) {
							dis = d;
						}
					}
					else if (mode == 2) {
						sum += d;
						count++;
					}
				}
			}
		}
		else {
			dis = -1;
		}
		if (mode == 0 && dis == Number.MAX_VALUE) {
			dis = null;
		}
		else if (mode == 1 && dis == Number.MIN_VALUE) {
			dis = null;
		}
		else if (mode == 2) {
			if (count == 0) {
				dis = 0;
			}
			else {
				dis = sum/count;
			}
		}

		return dis;

	}

	function convertTree(cluster, rowDic, nodesNull, nodesClass, edges, startNode, dicCompositeSubclasses, classUnits, mode) {
		  var classClusters = {};
			// console.log("check!!!!!!!!!!");
			// console.log("mode");
			// console.log(mode);
			// console.log(cluster);
			// console.log("?????????????");
			// console.log(dicCompositeSubclasses);
			if (cluster.size == 1) {
				var row = cluster["value"].toString();
				var classes = rowDic[row];
				var classSelected = classes[classes.length-1];
				var children = dicCompositeSubclasses[classSelected.UUID];
				if(!children){
					return classClusters;
				}
				classClusters["size"] = children.length;
				// var endNode = {
				// 	name: startNode.name+"mid",
				// 	distance: null
				// }
				// nodesNull.push(endNode);
				// edges.push({start: startNode, end: endNode});
				var childrenClasses = [];
				for (var i in children) {
					var childClass = {};
					var child = findClassUnit(children[i], classUnits);
					if(!child){
						continue;
					}
					childClass['size'] = 1;
					childClass['value'] = child;
					childrenClasses.push(childClass);
					nodesClass.push(child);
					edges.push({start: startNode, end: {name: 'a'+child['UUID'].replace(/-/g, ''), distance: null}});
				}
				classClusters["children"] = childrenClasses;
				classes.pop();
				// classClusters["size"] = 1;
				// classClusters["value"] = classSelected;
				// classes.pop();
				// nodesClass.push(classSelected);
				// edges.push({start: rootName, end: 'a'+classSelected['UUID'].replace(/-/g, '')});
			}
			else {
				var children = [];
				for (var property in cluster) {
					// if (cluster.hasOwnProperty(property) && property != "size") {
					if (property == "left" || property == "right") {
						var dis = calculateDis(cluster[property], mode);

						// if (!("value" in cluster[property])) {
						// 	var left = findAllClass(cluster[property].left);
						// 	var right = findAllClass(cluster[property].right);
						// 	var sum = 0;
						// 	var count = 0;
						// 	var dis = null;
						// 	if (mode == 0) {
						// 		dis = Number.MAX_VALUE;
						// 		console.log("check!!!!!!!!!!");
						// 	}
						// 	else if (mode == 1) {
						// 		dis = Number.MIN_VALUE;
						// 	}
						// 	// var min = Number.MAX_VALUE;
						// 	// var sum = 0;
						// 	// var count = 0;
						// 	for (var i in left) {
						// 		var a = left[i];
						// 		for (var j in right) {
						// 			var b = right[j];
						// 			var inter = 0;
						// 			var union = 0;
						// 			for (var i = 0; i < a.length; i++) {
						// 		    if (a[i] && b[i]) {
						// 		      inter++;
						// 		    }
						// 		    if (a[i] || b[i]) {
						// 		      union++;
						// 		    }
						// 		  }
						// 		  var JaccSimi;
						// 		  if (union == 0) {
						// 		    JaccSimi = 0
						// 		  }
						// 		  else {
						// 		    JaccSimi = inter/union;
						// 		  }
						// 		  d = 1 - JaccSimi;
						// 			if (mode == 0) {
						// 				if (d < dis) {
						// 					dis = d;
						// 					console.log("check!!!!!!!!!!");
						// 					console.log(dis);
						// 				}
						// 			}
						// 			else if (mode == 1) {
						// 				if (d > dis) {
						// 					dis = d;
						// 				}
						// 			}
						// 			else if (mode == 2) {
						// 				sum += d;
						// 				count++;
						// 			}
						// 			// if (d < min) {
						// 			// 	min = d;
						// 			// }
						// 			// sum += d;
						// 			// count++;
						// 		}
						// 	}
						// }
						// if (mode == 0 && dis == Number.MAX_VALUE) {
						// 	dis = null;
						// 	// console.log("check????");
						// }
						// else if (mode == 1 && dis == Number.MIN_VALUE) {
						// 	dis = null;
						// }
						// else if (mode == 2) {
						//   if (count == 0) {
						// 		dis = 0;
						// 	}
						// 	else {
						// 		dis = sum/count;
						// 	}
						// }
						// if (min == Number.MAX_VALUE) {
						// 	min = null;
						// }
						// var distance = 0;
						// if (count != 0) {
						// 	distance = sum/count;
						// }
						var nodeF = null;
						if (cluster[property]["size"] != 1) {
							var endNode = {
								name: startNode.name+property,
								distance: dis
							}
							nodeF = endNode;
							nodesNull.push(endNode);
							edges.push({start: startNode, end: endNode});
						}
						else {
							nodeF = startNode;
						}

						var child = convertTree(cluster[property], rowDic, nodesNull, nodesClass, edges, nodeF, dicCompositeSubclasses, classUnits, mode);
						children.push(child);
						// nodesNull.push(rootName+property);

						// edges.push({start: rootName, end: rootName+property});

					}
				}
				classClusters["children"] = children;
				classClusters["size"] = children.length;
				// var left = convertTree(cluster["left"], rowDic, nodesNull, nodesClass, edges, rootName+'l');
				// var right = convertTree(cluster["right"], rowDic, nodesNull, nodesClass, edges, rootName+'r');
				// classClusters["left"] = left;
				// classClusters["right"] = right;
				// classClusters["size"] = 2;
				// nodesNull.push(rootName+'l');
				// nodesNull.push(rootName+'r');
				// edges.push({start: rootName, end: rootName+'l'});
				// edges.push({start: rootName, end: rootName+'r'});
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
