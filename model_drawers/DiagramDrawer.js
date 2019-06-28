/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var exec = require('child_process').exec;
	var dottyUtil = require("../utils/DottyUtil.js");
	
	function drawRobustnessDiagramFunc(robustnessDiagram, callbackfunc){
		var graph = 'digraph g {';
		var Elements = robustnessDiagram.Elements;
		for(var i in Elements){
			var element = Elements[i];
			var connectors = element.Connectors;
			if(connectors !== undefined){
			for(var j in connectors){
				if(Elements[connectors[j].targetID] && Elements[connectors[j].SupplierID]){
				var start = Elements[connectors[j].targetID]['Name'];
				var end = Elements[connectors[j].SupplierID]['Name'];
				if(start === element.Name){
					graph += '"'+start+'"->"'+end+'";';
				}
				}
			}
			}
		}
		graph += '}';
		
		if(callbackfunc){
		var graphFilePath = robustnessDiagram.OutputDir+'/'+robustnessDiagram.DotGraphFile; 
//		console.log(graphFilePath);
		dottyUtil.drawDottyGraph(graph, graphFilePath,callbackfunc);
		}
		return graph
	}
	
	function drawSequenceDiagramFunc(sequenceDiagram, callbackfunc){
		var graph = 'digraph g {';
		var Elements = sequenceDiagram.Elements;
		for(var i in Elements){
			var element = Elements[i];
			var connectors = element.Connectors;
			if(connectors !== undefined){
			for(var j in connectors){
				if(Elements[connectors[j].targetID] && Elements[connectors[j].SupplierID]){
				var start = Elements[connectors[j].targetID]['Name'];
				var end = Elements[connectors[j].SupplierID]['Name'];
				if(start === element.Name){
					graph += '"'+start+'"->"'+end+'";';
					
				}
				}
			}
			}
		}
		graph += '}';
		
		if(callbackfunc){
		var fileName = sequenceDiagram.Name+'_sequence.dotty';
		var graphFilePath = sequenceDiagram.OutputDir+'/'+sequenceDiagram.DotGraphFile;
		dottyUtil.drawDottyGraph(graph,graphFilePath,callbackfunc);
		}
	   return graph;
	}
	
	function drawClassDiagramFunc(classDiagram, callbackfunc){
		var graph = 'digraph g {';
		for(var i in classDiagram.Elements){
		var element = classDiagram.Elements[i];
		var attributes = element.Attributes;
//		console.log(attributes);
		for(var j in attributes){
			var attribute = attributes[j];
			graph += '"'+element.Name+'"->"'+attribute.Name+'";';
		}
		var operations = element.Operations;
//		console.log(operations);
		for(var j in operations){
			var operation = operations[j];
			graph += '"'+element.Name+'"->"'+operation.Name+'";';
		}
		}
		graph += '}';
		
		if(callbackfunc){
		var graphFilePath = classDiagram.OutputDir+'/'+classDiagram.DotGraphFile;
		dottyUtil.drawDottyGraph(graph,graphFilePath,callbackfunc);
		}
	   return graph;
	}
	
	function drawStructuralDiagram(diagram, callbackfunc){
		var graph = 'digraph g {';
		for(var i in diagram.Elements){
		var element = diagram.Elements[i];
		var attributes = element.Attributes;
//		console.log(attributes);
		for(var j in attributes){
			var attribute = attributes[j];
			graph += '"'+element.Name+'"->"'+attribute.Name+'";';
		}
		var operations = element.Operations;
//		console.log(operations);
		for(var j in operations){
			var operation = operations[j];
			graph += '"'+element.Name+'"->"'+operation.Name+'";';
		}
		}
		graph += '}';
		
		
		var graphFilePath = diagram.OutputDir+'/'+diagram.DotGraphFile;
	
	   return graph;
	}
	
	function drawBehavioralDiagram(diagram, callbackfunc){
		console.log("DiagramDrawer: drawBehaviorDiagram");
		var dotty = 'digraph g {';
		var Nodes = diagram.Nodes;
		for(var j in Nodes){
			var node = Nodes[j];
			dotty += '"'+node.Name+'";';
		}
		var Edges = diagram.Edges;
		for(var i in Edges){
			var edge = Edges[i];
			//var edges = node.Edges;
			//if(edges !== undefined){
			//for(var j in edges){
			//	var edge = edges[j];
				var start = edge.start;
				var end = edge.end;
				dotty += '"'+start.Name+'"->"'+end.Name+'";';
			//}
			//}
		}
		dotty += '}';
		
		//graph.Name = "test";
		//console.log(dotty);
		
		if(callbackfunc){
		var fileName = diagram.Name+'_graph.dotty';
		console.log(fileName);
		var diagramFilePath = diagram.OutputDir+'/'+fileName;
		dottyUtil.drawDottyGraph(graph,graphFilePath,callbackfunc);
		}
		
	   return dotty;
	}
	
	module.exports = {
		drawClassDiagram:function(diagram, callbackfunc){
//			console.log('draw class diagram	');
			var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_");
			diagram.DotGraphFile = fileName+'_class.dotty';
			diagram.SvgGraphFile = fileName+'_class.svg';
//			diagramDrawer.drawClassDiagram(diagram, function(diagram){
//				console.log('class diagram is drawed.');
//			});
			drawClassDiagramFunc(diagram, callbackfunc);
		},
		drawRobustnessDiagram: function(diagram, callbackfunc){
			var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_");
			diagram.DotGraphFile = fileName+'_robustness.dotty';
			diagram.SvgGraphFile = fileName+'_robustness.svg';
//			diagramDrawer.drawRobustnessDiagram(diagram, function(diagram){
//				console.log('robustness diagram is drawed.');
//			});
			drawRobustnessDiagramFunc(diagram, callbackfunc);
		},
		drawSequenceDiagram: function(diagram, callbackfunc){
			var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_");
			diagram.DotGraphFile = fileName+'_sequence.dotty';
			diagram.SvgGraphFile = fileName+'_sequence.svg';
//			diagramDrawer.drawSequenceDiagram(diagram, function(diagram){
//				console.log('sequence diagram is drawed.');
//			});
			drawSequenceDiagramFunc(diagram, callbackfunc);
		},
		drawDiagram: function(diagram, callbackfunc){
			if(diagram.Type === 'Logical'){
				drawStructuralDiagram(diagram, callbackfunc);
			} else if(diagram.Type === 'Sequence' || diagram.Type === 'Analysis' || diagram.Type === 'Activity'){
				drawBehavioralDiagram(diagram, callbackfunc);
			}
		},
		drawBehavioralDiagram: drawBehavioralDiagram
	}
}())