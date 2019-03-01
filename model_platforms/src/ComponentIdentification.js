/**
 * This module is to identify the components by the clustering algorithms.
 *
 * The clustering algorithm should be based on the three kinds of graphs: call graph, access graph, and type dependency graph that are constructed in Code Analysis.js
 *
 * This script relies on KDM and Java linkl
 *
 * The goal is the establish the control flow between the modules:
 * 
 * Identify the boundary (via KDM).
 * Identify the system components.
 * Establish the control flow between the components
 * Identify the stimuli.
 * 
 * The component identification algorithm should be parameterized.
 * The linkage method
 * The similarity function
 * The weighting schema
 * 
 * Size:75%
 * S2W3L3
 * Unbiased Ellenberg Relative Complete
 * Cohesion:  75%-80%
 * S1W1L1
 * S1W1L1 Euclidean Binary Single
 * Coupline: 50%
 * S1W3L1
 * S1W3L1 Euclidean Relative Single
 */

(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var util = require('util');
    const uuidv4 = require('uuid/v4');
    var FileManagerUtil = require("../../utils/FileManagerUtils.js");
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
		clusteringConfig,
		outputDir
	) {
		if(!clusteringConfig){
		clusteringConfig = {
				 s: 2,
				 w: 3,
				 l: 3,
				 cut: 0.5,
				 tag:"S2W3L3"
	    }
		}

		var classDic = {}; //class to the index
		var classes = []; //apply composite class units as classes
		var methods = []; // store the number of methods in each class
		var attrs = [];
		
		//generate three types of clustering graphs with different optimizing graphs
		
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
				console.log(classUnit);
				if(classUnit){
				methodNum += classUnit.methodUnits.length;
				attrNum += classUnit.attrUnits.length;
				}
			}
			methods.push(methodNum);
			attrs.push(attrNum);
		}

		var debug = require("../../utils/DebuggerOutput.js");

		var metric = calculateWeight(typeDependencyGraph, callGraph, accessGraph, compositionGraph, extendsGraph, classes, classDic, methods, attrs, clusteringConfig.w);
		debug.writeJson2("clustering_metrics_"+clusteringConfig.tag, metric, outputDir);
		
		var nodesNullAllTree = [];
		var nodesClassAllTree = [];
		var edgesAllTree = [];

		var clusterTree = findClusters(classes, metric, nodesNullAllTree, nodesClassAllTree, edgesAllTree, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, clusteringConfig);
		//draw the tree without cutting
		drawClusteringGraph(nodesNullAllTree, nodesClassAllTree, edgesAllTree, outputDir, "clusteringTree.dotty");
		debug.writeJson2("clustering_tree_"+clusteringConfig.tag, clusterTree, outputDir);
		
		var clusteringResult = cutByLevel(clusterTree, clusteringConfig, outputDir);
	
		drawComponentGraph(clusteringResult.dicComponents, outputDir, "agglomerative_clustering_"+clusteringConfig.tag+".dotty");
		
		return clusteringResult
		
	}
	
	function cutByLevel(clusteredClasses, clusteringConfig, outputDir){
		var clusters = []; // [[component1], [component2], ...]

		//for each identified cluster we apply a cut to to sperate into the components
		var rootClusterClass = {
				size: clusteredClasses.length,
				children: []
		}
		
		var maxLevel = 0;
		for(var i in clusteredClasses){
		var clusteredClass = clusteredClasses[i];
		if(maxLevel < clusteredClass.depth){
			maxLevel = clusteredClass.depth;
		}
		rootClusterClass.children.push(clusteredClass);
//		var cutoffDepth = clusteringConfig.cut*clusteredClass.depth; //there might be multiple criterion to determining the cutoff tree
		}
		
		rootClusterClass.depth = maxLevel+1;
		
		var cutoffDepth = (1-clusteringConfig.cut)*rootClusterClass.depth;
//		var cutoffDepth = 3;
//		console.log("cutoff");
//		console.log(cutoffDepth);
//		cutoffDepth = 12;
//		process.exit();
		
		var currentLevel = [];
		var currentLevelDepth = 0;
		currentLevel.push(rootClusterClass);
		var utilityCluster = []; //the classes that are not related to other components are regarded as utility components.
		
		console.log("test nest level");
		while(currentLevelDepth < cutoffDepth){
			var nextLevel = [];
			var nodeToExpand = null;
			
			while ((nodeToExpand = currentLevel.shift())){
				
				if (nodeToExpand.size == 1 && nodeToExpand.hasOwnProperty('value')) {
					utilityCluster.push(nodeToExpand.value);
//					clusters.push([nodeToExpand.value]);
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
		
		console.log("clusters");
		console.log(clusters);
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson2("clusters_"+clusteringConfig.tag, clusters, outputDir);
//		process.exit();
		
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
		
		return {
			dicComponents: dicComponents,
			dicClassComponent: dicClassComponent
		};
		
	}
	

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
				for (var j = 0; j < row; j++) {
					tmp.push(0);
				}
			array.push(tmp);
		}
		return array;
	}
	
	function zeroList(size, defaultVal) {
		if(!defaultVal){
			defaultVal = 0;
		}
		else{
			defaultVal = JSON.parse(JSON.stringify(defaultVal));
		}
		var array = [];
		
		return array;
	}
	
	
	function calculateWeight(typeDependencyGraph, callGraph, accessGraph, compositionGraph, extendsGraph, classes, classDic, methods, attrs, w){
		
		
		console.log("call metric start");
		
		var metrics = zeroArray(classes.length, classes.length);
		
		
		var dependencyMetrics = calculateDependencyMetric(typeDependencyGraph, callGraph, accessGraph, compositionGraph, classes, classDic, methods, attrs);

		var connectors = dependencyMetrics.connectors;
		var referencedElements = dependencyMetrics.referencedElements;

		var referencingClasses = dependencyMetrics.referencingClasses;

		for (var key1 in connectors) {
				for (var key2 in connectors) {
					
						if(w === 1){
							//binary weight
							if(key1 === key2){
								metrics[parseInt(key1)][parseInt(key2)] = 1
							}
							else {
								metrics[parseInt(key1)][parseInt(key2)] = (connectors[parseInt(key1)][parseInt(key2)] + connectors[parseInt(key2)][parseInt(key1)]) > 0 ? 1 : 0;
							}
						}
						else if(w == 2){
							//absolute weight
							if(key1 === key2){
								metrics[parseInt(key1)][parseInt(key2)] = 1;
							}
							else{
								metrics[parseInt(key1)][parseInt(key2)] = connectors[parseInt(key1)][parseInt(key2)]/referencedElements[parseInt(key2)] + connectors[parseInt(key2)][parseInt(key1)]/referencedElements[parseInt(key1)];
							}
							
						}
						else{
							var log_freq_1 = Math.log(classes.length/referencingClasses[parseInt(key1)]);
							var log_freq_2 = Math.log(classes.length/referencingClasses[parseInt(key2)]);
							//relative weight
							if(key1 === key2){
								metrics[parseInt(key1)][parseInt(key2)] = log_freq_1;
							}
							else{
								metrics[parseInt(key1)][parseInt(key2)] = (referencedElements[parseInt(key1)][parseInt(key2)] ? connectors[parseInt(key1)][parseInt(key2)]/referencedElements[parseInt(key1)][parseInt(key2)] : 0) * log_freq_1 + (referencedElements[parseInt(key2)][parseInt(key1)] ? connectors[parseInt(key2)][parseInt(key1)]/referencedElements[parseInt(key2)][parseInt(key1)] : 0 )*log_freq_2;
							}
						}
//					}
				}
//			}
		}
		
		return metrics;
		
	}
	
	
	
	function calculateDependencyMetric(typeDependencyGraph, callGraph, accessGraph, compositionGraph, classes, classDic, methods, relative) {
		
		console.log("type dependency metric start");

		var references = zeroArray(classes.length, classes.length); //  the number of attributes of class Cli whose type is class Clj.
		
		var referencedElements = [];
		for (var i = 0; i < classes.length; i++) {
			var row = [];
				for (var j = 0; j < classes.length; j++) {
					row.push(new Set());
				}
			referencedElements.push(row);
		}
		
		var referencingClasses = [];
		for (var i = 0; i < classes.length; i++) {
			var set = new Set();
			set.add(classes[i].UUID);
			referencingClasses.push(set)
		}

		function addDependency(dependencyGraph, classDic, references, referencingClasses, referencedElements){
			for (var i in dependencyGraph) {
				var edge = dependencyGraph[i];
				var col = classDic[edge.start.component.UUID];
				var row = classDic[edge.end.component.UUID];
				
				if(!col || !row){
					continue;
				}
				
				references[col][row]++;
				
				if (!referencingClasses[row].has(edge.start.component.UUID)) {
					referencingClasses[row].add(edge.start.component.UUID);
				}
				
				if (! referencedElements[col][row].has(edge.end.UUID)) {
					referencedElements[col][row].add(edge.end.UUID);
				}
			}
		}
		
		addDependency(typeDependencyGraph.edgesReturnComposite, classDic, references, referencingClasses, referencedElements);
		addDependency(typeDependencyGraph.edgesParamComposite, classDic, references, referencingClasses, referencedElements);
		addDependency(typeDependencyGraph.edgesLocalComposite, classDic, references, referencingClasses, referencedElements);
		addDependency(callGraph.edgesComposite, classDic, references, referencingClasses, referencedElements);
		addDependency(accessGraph.edgesComposite, classDic, references, referencingClasses, referencedElements);
		addDependency(compositionGraph.edgesComposite, classDic, references, referencingClasses, referencedElements);
		
		console.log("type dependency metric end");

		return {
			connectors: references,
			referencedElements: referencedElements.map((item) => {return item.map((innerItem) => {return innerItem.size})}),
			referencingClasses: referencingClasses.map((item) => {return item.size})
		}
	}
	
	
	function findClusters(classArray, metrics, nodesNullAll, nodesClassAll, edgesAll, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, clusteringConfig, threshold) {

		var clusterfck = require("clusterfck");
	
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

		var linkage = null;
		
		if (clusteringConfig.l == 1) {
			linkage = "single"
		}
		else if (clusteringConfig.l == 2) {
			linkage = "average";
		}
		else {
			linkage = "complete"
		}
	
		var distance = null;
		
		if (clusteringConfig.s == 1) {
			distance = distanceEucli;
		}
		else if (clusteringConfig.s == 2) {
			distance = distanceJacc;
		}
		else {
			distance = distanceUnbEllenberg;
		}

		var clusters = clusterfck.hcluster(indMetrics, distance, linkage);
		if(!Array.isArray(clusters)){
			clusters = [clusters];
		}
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson2("clusterfck", clusters);
		
		var classClusters = [];
		var ind = 0
		for (var i in clusters) {
			var cluster = clusters[i];
			
			nodesNull = [];
			nodesClass = [];
			edges = [];
			var dis = calculateDis(cluster, clusteringConfig.l, distance);
			
			var startNode = {
				name: 'c'+ind,
				distance: dis
			}
			
			ind++;
			var classCluster = convertTree(cluster, classArray, nodesNull, nodesClass, edges, startNode, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, clusteringConfig.l, distance);
			nodesClassAll.push(nodesClass);
			nodesNullAll.push(nodesNull);
			edgesAll.push(edges);
			classClusters.push(classCluster);
		}

		return classClusters;
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
	
	// JaccSimi distance
	function distanceJacc(a, b) {
		  var inter = 0
		  var union = 0
		  
		  for (var i = 1; i < a.length; i++) {
		    if (a[i] && b[i]) {
		      inter++;
		      union++;
		    }
		    else if (a[i] && !b[i]) {
		      union++;
		    }
		    else if (!a[i] && b[i]){
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
		  
		  return 1-JaccSimi;
	}
	
	// Euclidean distance
	function distanceEucli(a, b) {
		  var d = 0;
		  for (var i = 1; i < a.length; i++) {
			  d += Math.pow(Math.abs(a[i]-b[i]), 2);
		  }
		  return Math.sqrt(d);
	}
	
	// Ellenberg distance
	function distanceUnbEllenberg(a, b) {
		  var Ma = 0
		  var Mb = 0
		  var Mc = 0
		  
		  for (var i = 1; i < a.length; i++) {
		    if (a[i] && b[i]) {
		      Ma += a[i] + b[i];
		    }
		    else if (a[i] && !b[i]) {
		      Mb++;
		    }
		    else if (!a[i] && b[i]){
		      Mc++;
		    }
		  }
		  
		  var unbEllenberg = 0;
		  if (1/2*Ma + Mb + Mc == 0) {
			  unbEllenberg = 0
		  }
		  else {
			  unbEllenberg = (1/2*Ma)/(1/2*Ma + Mb + Mc);
		  }
		  
		  return 1-unbEllenberg;
	}

	function calculateDis(node, linkage, distance) {

		var dis = -1;
		
//		console.log("calculating distance");
		
    	if (node.left && node.right) {
			var left = findAllClass(node.left);
			var right = findAllClass(node.right);
			var sum = 0;
			var count = 0;
			var max = Number.NEGATIVE_INFINITY;
			var min = Number.POSITIVE_INFINITY;
			for (var i in left) {
				var a = left[i];
				for (var j in right) {
					var b = right[j];
					var d = distance(a, b);
					console.log("distance between a and b");
					console.log(d);
					sum += d;
					count++;
					
					if(d > max){
						max = d;
					}
					
					if(d < min){
						min = d;
					}
				}
			}
			
			if (linkage === 1 && max != Number.NEGATIVE_INFINITY) {
				dis = max;
			}
			else if (linkage === 2 && min != Number.POSITIVE_INFINITY) {
				dis = min;
			}
			else if (linkage === 3 && count !== 0) {
					dis = sum/count;
			}
			
		}
    	
    	console.log("dis");
    	console.log(dis);

		return dis;

	}

	function convertTree(cluster, classes, nodesNull, nodesClass, edges, startNode, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, linkage, distance) {
		  var classClusters = {};
		  
			if (cluster.size == 1) {
				
				var clsIndex = cluster["value"][0];
				var selectedClass = classes[clsIndex];
				
				var children = dicCompositeSubclasses[selectedClass.UUID];
				if(!children){
					return classClusters;
				}
				
				classClusters["size"] = children.length;
				
				var childrenClasses = [];
				for (var i in children) {
					var childClass = {};
					var child = dicClassUnits[children[i]];
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
				classClusters["depth"] = 1;
				
			}
			else {
				var children = [];
				var depth = 0;
				for (var property in cluster) {
					if (property == "left" || property == "right") {
						var dis = calculateDis(cluster[property], linkage, distance);
		
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

						var child = convertTree(cluster[property], classes, nodesNull, nodesClass, edges, nodeF, dicCompositeSubclasses, classUnits, dicClassUnits, dicCompositeClassUnits, linkage, distance);
						
						if(child.depth > depth){
							depth = child.depth;
						}
						children.push(child);
					}
				}
				
				classClusters["children"] = children;
				classClusters["size"] = children.length;
				classClusters["depth"] = depth+1;
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
		
		var acdc = FileManagerUtil.readFileSync(acdcClusterFile);
		
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

			dicClassNameComponent[lineElements[2]] = component.UUID;
			classNames.push(lineElements[2])
			
		}
		}
		
		for(var i in classUnits) {
		var classUnit = classUnits[i];
		var className = classUnit.packageName+"."+classUnit.name;
		
		var matches = stringSimilarity.findBestMatch(className, classNames);
		component = dicComponents[dicClassNameComponent[matches.bestMatch.target]];
		component.classUnits.push(classUnit);
		dicClassComponent[classUnit.UUID] = component.UUID;
		
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
			console.log("drawing is finished");
		});

		return graph;

	}


	module.exports = {
			identifyComponents: identifyComponents,
			identifyComponentsACDC: identifyComponentsACDC
	}
}());