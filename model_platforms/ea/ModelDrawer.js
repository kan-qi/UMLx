/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var exec = require('child_process').exec;
	

	var dottyUtil = require("../../utils/DottyUtil.js");
	
	function drawModel(model, filePath, callbackfunc){
		var dotty = 'digraph g {';
		var diagrams = model.Diagrams;
//		var Nodes = diagram.Nodes;
		for(var i in diagrams){
			var diagram = diagrams[i];
			if(diagram.Type === 'Logical'){
				
				for(var i in diagram.Elements){
					var element = diagram.Elements[i];
					var attributes = element.Attributes;
//					console.log(attributes);
					for(var j in attributes){
						var attribute = attributes[j];
						dotty += '"'+element.Name+'"->"'+attribute.Name+'";';
					}
					var operations = element.Operations;
//					console.log(operations);
					for(var j in operations){
						var operation = operations[j];
						dotty += '"'+element.Name+'"->"'+operation.Name+'";';
					}
				}
			} else if(diagram.Type === 'Sequence' || diagram.Type === 'Analysis' || diagram.Type === 'Activity'){
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
			}
		}
		
		dotty += '}';
		
		//graph.Name = "test";
		//console.log(dotty);
		
		if(callbackfunc){
		console.log(filePath);
//		var graphFilePath = diagram.OutputDir+'/'+fileName;
		dottyUtil.drawDottyGraph(dotty,filePath,callbackfunc);
		}
	   return dotty;
	}
	
	module.exports = {
		drawModel:function(model, filePath, callbackfunc){
//			console.log('draw class diagram	');
//			var fileName = model.Name.replace(/[^A-Za-z0-9_]/gi, "_");
//			model.DotGraphFile = fileName+'_class.dotty';
//			model.SvgGraphFile = fileName+'_class.svg';
//			diagramDrawer.drawClassDiagram(diagram, function(diagram){
//				console.log('class diagram is drawed.');
//			});
			drawModel(model, filePath, callbackfunc);
		},
	}
}())