/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
 */
(function() {
	
	/*
	 * This method is used to draw different dependency graphs between different nodes.
	 */
		function drawGraph(edges, nodes, outputDir, fileName){
			if(!fileName){
				fileName = "kdm_callgraph_diagram.dotty";
			}
			var path = outputDir+"/"+fileName;
			
			let graph = 'digraph g {\
				fontsize=26\
				rankdir="LR"\
				node [fontsize=24 shape=rectangle]';

			nodes.forEach((node) => {
				graph += '"'+node.Name+'" [';
				if(node.isWithinBoundary){
					graph += " color=red";
				}
				else{
					graph += " color=black";
				}

				if(node.isResponse){
					graph += " style=\"rounded, filled\", fillcolor=red";
				}
				else{
					graph += "";
				}

				graph += "];";
			});

			var drawnEdges = {

			};

			var filter = true;

			edges.forEach((edge) => {
				
				var start = edge.start.Name;
				var end = edge.end.Name;
				var edge = '"'+start+'"->"'+end+'";';
				if(!drawnEdges[edge]){
				graph += '"'+start+'"->"'+end+'";';
				}

				if(filter){
					drawnEdges[edge] = 1;
				}
			});

			graph += 'imagepath = \"./\"}';
			dottyUtil = require("../../utils/DottyUtil.js");
			dottyUtil.drawDottyGraph(graph, path, function(){
				console.log("drawing is done");
			});

			return graph;

		}
	
	module.exports = {
			drawGraph : drawGraph
	}
}());
