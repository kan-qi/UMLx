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
	var util = require('util');
    const uuidv4 = require('uuid/v4');

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

		var classDic = {}; //class to the index
		var classes = []; //apply composite class units as classes
		var methods = []; // store the number of methods in each class
		var attrs = [];
		
		for(var i in compositeClassUnits) {
			var compositeClassUnit = compositeClassUnits[i];
			classDic[compositeClassUnit.UUID] = i;
			var classU = {
				UUID: compositeClassUnit.UUID,
				name: compositeClassUnit.name,
			}
			classes.push(classU);
			
			var methodNum = 0;
			var attrNum = 0;
			for(var j in compositeClassUnit.classUnits){
				var classUnit = dicClassUnits[compositeClassUnit.classUnits[j]];
				if(classUnit){
				methodNum += classUnit.methodUnits.length;
				attrNum += classUnit.attrUnits.length;
				}
			}
			methods.push(methodNum);
			attrs.push(attrNum);
		}
		
		//composite classes are used for metrics claculation and clustering

		var callMetric = calculateCallMetric(callGraph, classes, classDic, methods);
		var accessMetric = calculateAccessMetric(accessGraph, classes, classDic, methods, attrs);
		var typeDependencyMetric = calculateTypeDependencyMetric(typeDependencyGraph, classes, classDic, methods);
		var extendsMetric = calculateExtendsMetric(extendsGraph, classes, classDic, methods);
		var compositionMetric = calculateCompositionMetric(compositionGraph, classes, classDic, methods);
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson2("call_metrics", callMetric);
		debug.writeJson2("access_metrics", accessMetric);
		
		var metric = zeroArray(classes.length, classes.length);
		var maxMetric = 0;
		var relations = [];

		for (var i = 0; i < classes.length; i++) {
			for (var j = 0; j < classes.length; j++) {
				metric[i][j] = callMetric[i][j] + accessMetric[i][j] + typeDependencyMetric[i][j] + extendsMetric[i][j] + compositionMetric[i][j];
				maxMetric = Math.max(maxMetric, metric[i][j]);
			}
		}
		
		debug.writeJson2("merged_metrics", metric);

		var nodesNullAll = [];
		var nodesClassAll = [];
		var edgesAll = [];

		var nodesNullAllTree = [];
		var nodesClassAllTree = [];
		var edgesAllTree = [];

		var clusterTree = findClusters(classes, metric, nodesNullAllTree, nodesClassAllTree, edgesAllTree, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, 1, 1.5);
		var clusteredClasses = findClusters(classes, metric, nodesNullAll, nodesClassAll, edgesAll, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, 1, 1.5);

		drawClusteringGraph(nodesNullAll, nodesClassAll, edgesAll, outputDir, "componentsComposite.dotty");
		drawClusteringGraph(nodesNullAllTree, nodesClassAllTree, edgesAllTree, outputDir, "componentsTree.dotty");
		
		var clusters = []; // [[component1], [component2], ...]

		var cutoffDepth = 17; //there might be multiple criterion to determining the cutoff tree

		var currentLevel = [];
		var currentLevelDepth = 0;
		currentLevel = currentLevel.concat(clusteredClasses);
		var utilityCluster = []; //the classes that are not related to other components are regarded as utility components.
		while(currentLevelDepth < cutoffDepth){
			var nextLevel = [];
			var nodeToExpand = null;
			while ((nodeToExpand = currentLevel.shift())){
				if (nodeToExpand.size == 1 && nodeToExpand.hasOwnProperty('value')) {
//					clusters.push([nodeToExpand.value]);
					utilityCluster.push(nodeToExpand.value);
				}
				else {
					nextLevel = nextLevel.concat(nodeToExpand.children);
				}
			}
			currentLevel = nextLevel;
			currentLevelDepth++;
		}
		
		clusters.push(utilityCluster);
		
		for (var i in currentLevel) {
			var newComponent = [];
			var bfs = [currentLevel[i]];
			while (bfs.length > 0) {
				var node = bfs.pop(0);
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
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson2("clusters", clusters);

		var dicComponents = {};
		var dicClassComponent = {};  // {classUnit.UUID: component.UUID}

		for(var i in clusters){
			var classUnits = clusters[i];

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
		
		drawComponentGraph(dicComponents, outputDir, "agglomerative_clustering.dotty");

		return {
			dicComponents: dicComponents,
			dicClassComponent: dicClassComponent
		};

	}
	
	
//	function drawComponentGraph(disComponents, outputDir, fileName) {
//
//		if(!fileName){
//			fileName = "agglomerative_kdm_clusters.dotty";
//		}
//		var path = outputDir+"/"+fileName;
//		let graph = 'digraph g {\
//			fontsize=26\
//			rankdir="LR"';
//
//		graph += 'node [fontsize=24 shape=ellipse]';
//		for (var i in disComponents) {
//			var component = disComponents[i];
//			graph += '"a'+component['UUID'].replace(/-/g, '')+'" [label="'+component['name'].replace(/[\$|\s+]/g, '')+'"]';
//		}
//
//		// graph += 'node [fontsize=24 shape=point]';
//		graph += 'node [fontsize=24 shape=rectangle]';
//		for (var i in disComponents) {
//			var component = disComponents[i];
//			for (var j in component.classUnits) {
//				var classUnit = component.classUnits[j];
//				graph += '"a'+classUnit['UUID'].replace(/-/g, '')+'" [label="'+classUnit['name'].replace(/[\$|\s+]/g, '')+'"]';
//			}
//		}
//		
//		for (var i in disComponents) {
//			var component = disComponents[i];
//			for (var j in component.classUnits) {
//				var classUnit = component.classUnits[j];
////				graph += component['name'].replace(/[\.|\$|\s+]/g, '')+' -> {'+classUnit['name'].replace(/[\.|\$|\s+]/g, '')+'}';
//				graph += '"a'+component['UUID'].replace(/-/g, '')+'"->"a'+classUnit['UUID'].replace(/-/g, '')+'"';
//			}
//		}
//
//		graph += 'imagepath = \"./\"}';
//		dottyUtil = require("../../utils/DottyUtil.js");
//		dottyUtil.drawDottyGraph(graph, path, function(){
//			console.log("drawing is down");
//		});
//
//		return graph;
//
//	}

	function drawClusteringGraph(nodesNullAll, nodesClassAll, edgesAll, outputDir, fileName) {

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
		  

		  var typeDependencyMetrics = zeroArray(classes.length, classes.length);
		  
		  if(!typeDependencyGraph){
			  return typeDependencyMetrics;
		  }

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

		console.log("class dic");
		console.log(classDic);
		if (typeDependencyGraph) {
			for (var i in typeDependencyGraph.edgesAttrComposite) {
				var edge = typeDependencyGraph.edgesAttrComposite[i];
				var col = classDic[edge.start.component.UUID];
				var row = classDic[edge.end.component.UUID];
				attrs[col][row]++;
				// classArray[col] = false;
				// classArray[row] = false;
			}
			for (var i in typeDependencyGraph.edgesPComposite) {
				var edge = typeDependencyGraph.edgesPComposite[i];
				var col = classDic[edge.start.component.UUID];
				var row = classDic[edge.end.component.UUID];
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

	function calculateAccessMetric(accessGraph, classes, classDic, methods, attrs) {
		console.log("access metric")
		
		var access = zeroArray(classes.length, classes.length);
		var accessors = {};
		var accessed = {};
		var accessMetrics = zeroArray(classes.length, classes.length);

		for (var i in accessGraph.edgesComposite) {
			var edge = accessGraph.edgesComposite[i];
			var col = classDic[edge.start.component.UUID];
			var row = classDic[edge.end.component.UUID];
			if(col == null || row == null){
				continue;
			}
			access[col][row]++;

			if (!(col in accessors)) {
				accessors[col] = {}
			}
			if (!(row in accessors[col])) {
				accessors[col][row] = new Set([edge.start.component.UUID]);
			}
			else {
				accessors[col][row].add(edge.start.component.UUID);
			}

			if (!(col in accessed)) {
				accessed[col] = {}
			}
			if (!(row in accessed[col])) {
				accessed[col][row] = new Set([edge.end.component.UUID]);
			}
			else {
				accessed[col][row].add(edge.end.component.UUID);
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
		
		return accessMetrics;

	}

	function calculateCallMetric(callGraph, classes, classDic, methods){
		console.log("call metric");

		var calls = zeroArray(classes.length, classes.length);
		var callers = {};
		var callees = {};
		var callMetrics = zeroArray(classes.length, classes.length);

		for (var i in callGraph.edgesComposite) {
			var edge = callGraph.edgesComposite[i];
			var col = classDic[edge.start.component.UUID];
			var row = classDic[edge.end.component.UUID];
			if(col == null || row == null){
				continue;
			}

			calls[col][row]++;

			if (!(col in callers)) {
				callers[col] = {}
			}
			if (!(row in callers[col])) {
				callers[col][row] = new Set([edge.start.component.UUID]);
			}
			else if (!(callers[col][row].has(edge.start.component.UUID))) {
				callers[col][row].add(edge.start.component.UUID);
			}

			if (!(col in callees)) {
				callees[col] = {}
			}
			if (!(row in callees[col])) {
				callees[col][row] = new Set([edge.end.component.UUID]);
			}
			else if (!(callees[col][row].has(edge.end.component.UUID))) {
				callees[col][row].add(edge.start.component.UUID);
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
		
		return callMetrics;
		
	}

	function calculateExtendsMetric(extendsGraph, classes, classDic, methods) {
		var extendsMetrics = zeroArray(classes.length, classes.length);

		if (!extendsGraph) {
			return extendsMetrics;
		}

		for (var i in extendsGraph.edges) {
			var edge = extendsGraph.edges[i];
			var col = classDic[edge.start.component.UUID];
			var row = classDic[edge.end.component.UUID];
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
			var col = classDic[edge.start.component.UUID];
			var row = classDic[edge.end.component.UUID];
			if(!col || !row){
				continue;
			}
			compositionMetrics[col][row]++;
		}

		return compositionMetrics;
	}

// mode => 0: SINGLE_LINKAGE; 1: CONPLETE_LINKAGE; 2: AVERAGE_LINKAGE
	function findClusters(classArray, metrics, nodesNullAll, nodesClassAll, edgesAll, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, mode, threshold) {

		var clusterfck = require("clusterfck");

		// coupling metric table for class c1 to c5
		//	   c1  c2  c3  c4  c5
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
		
		//apply index
		var indMetrics = [];
		for(var i in metrics){
			var metric = metrics[i];
			
			var indMetric = [];
			indMetric[0] = Number(i);
			for(var j in metric){
				indMetric.push(metric[j]);
			}
			indMetrics.push(indMetric);
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

		var clusters = clusterfck.hcluster(indMetrics, distance, linkage, threshold);
		
		console.log("computation mode");
		console.log(mode);
		
		console.log("clusterfck");
		console.log(clusters);
		
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson2("clusterfck", clusters);
		
		console.log("metrics");
		console.log(indMetrics.length);
		console.log(indMetrics);
//		console.log(classArray.length);
//		for(var i in classArray){
//			console.log(classArray[i].name);
//		}
//		console.log(metrics);
		
//		var rowDic = {}
//		for (var i in metrics) {
//			var metric = metrics[i].toString();
//			if (metric in rowDic) {
//				rowDic[metric].push(classArray[i]);
//			}
//			else {
//				var classes = new Array(classArray[i]);
//				rowDic[metric] = classes;
//			}
//		}
		
//		console.log("row dic");
//		console.log(Object.keys(rowDic).length);
//		console.log(rowDic);

		// console.log("check");
//     var classClusters = convertTree(clusters, rowDic);
		var classClusters = [];
		// var nodesNullAll = [];
		// var nodesClassAll = [];
		// var edgesAll = [];
		var ind = 0
		for (var i in clusters) {
			var cluster = clusters[i];
			
			console.log("examine cluster");
			console.log(cluster);
			 
			nodesNull = [];
			nodesClass = [];
			edges = [];
			var dis = calculateDis(cluster, mode);
			console.log("dis");
			console.log(dis);
			// var distance = 0;
			// if (count != 0) {
			// 	distance = sum/count;
			// }
			var startNode = {
				name: 'c'+ind,
				distance: dis
			}
			ind++;
			var classCluster = convertTree(cluster, classArray, nodesNull, nodesClass, edges, startNode, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, mode);
//			console.log("classcluster")
//			console.log(util.inspect(classCluster, false, null))
			nodesClassAll.push(nodesClass);
			nodesNullAll.push(nodesNull);
			edgesAll.push(edges);
			classClusters.push(classCluster);
		}
		
//		 console.log("check");
//		 console.log(classClusters);

		return classClusters;
	}

	// function convertSingle(cluster, rowDic) {
	// 	var row = cluster["value"].toString();
	// 	var classes = rowDic[row];
	// 	var classSelected = classes[classes.length-1];
	// 	return classSelected;
	// }
//	function findClassUnit(classUUID, classUnits) {
//
//		for (var i in classUnits) {
//			var classUnit = classUnits[i];
//			if (classUUID == classUnit.UUID) {
//				return classUnit;
//			}
//		}
//		return null;
//
//	}

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
	

	function distance(a, b) {
		  var d = 0;
		  var inter = 0
		  var union = 0
		  for (var i = 1; i < a.length; i++) {
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
					
//					var inter = 0;
//					var union = 0;
//					for (var i = 0; i < a.length; i++) {
//						if (a[i] && b[i]) {
//							inter++;
//						}
//						if (a[i] || b[i]) {
//							union++;
//						}
//					}
//					var JaccSimi;
//					if (union == 0) {
//						JaccSimi = 0
//					}
//					else {
//						JaccSimi = inter/union;
//					}
//					d = 1 - JaccSimi;
					
					var d = distance(a, b);
					
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

	function convertTree(cluster, classes, nodesNull, nodesClass, edges, startNode, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, mode) {
		  var classClusters = {};
		  
			if (cluster.size == 1) {
				var clsIndex = cluster["value"][0];
				var selectedClass = classes[clsIndex];
				
				
//				var row = cluster["value"].toString();
//				var classes = rowDic[row];
//				var classSelected = classes[classes.length-1];
//				console.log("selected classess")
//				console.log(classes);
				
				var children = dicCompositeSubclasses[selectedClass.UUID];
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
					var child = dicClassUnits[children[i]];
					console.log('find child');
					console.log(child);
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
//				classes.pop();
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

						var child = convertTree(cluster[property], classes, nodesNull, nodesClass, edges, nodeF, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, mode);
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
	
	function identifyComponentsACDC(
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
			outputDir,
			acdcClusterFile
	) {

		var dicComponents = {};
		var dicClassComponent = {};  // {classUnit.UUID: component.UUID}
		var dicClassNameComponent = {};
		var dicClassComponentByName = {};
		var classNames = [];
		
//		var acdc = fileManager.readFileSync("./data/GitAndroidAnalysis/alltheapps_ACDC_java/bin_acdc_clustered.rsf");
//		var acdc = fileManager.readFileSync("./data/GitAndroidAnalysis/AnotherMonitor__ACDC_java/bin_acdc_clustered.rsf");
		
//		var acdcClusterFile = "./data/GitAndroidAnalysis/AnotherMonitor__ACDC_java/clustered_classes_7_5.txt";
		
		var acdc = fileManager.readFileSync(acdcClusterFile);
		
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
			identifyComponents: identifyComponents,
			identifyComponentsACDC: identifyComponentsACDC
	}
}());
