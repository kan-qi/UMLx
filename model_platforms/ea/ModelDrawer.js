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
		dotty += "node[shape=record]";
		
		// used to get rid of duplicates.
		var drawnObjects = [];
		function DottyDraw(){
			this.drawnObjects = [];
			this.draw = function(dottyObject){
				if(drawnObjects[dottyObject]){
					return "";
				}
				else{
					drawnObjects[dottyObject] = 1;
					return dottyObject;
				}
			}
		}
		var dottyDraw = new DottyDraw();
		
		var diagrams = model.Diagrams;
		for(var i in diagrams){
			var diagram = diagrams[i];
			if(diagram.Type === 'Logical'){
				for(var i in diagram.Elements){

					var element = diagram.Elements[i];
//					var element = target.element;
					var elementInternal = "{";
					var elementInternalIndex = 0;
					elementInternal += "<f"+elementInternalIndex+">"+element.Name;
					elementInternalIndex++;
					
					var attributes = element.Attributes;
//					console.log(attributes);
					for(var j in attributes){
						var attribute = attributes[j];
//						dotty += '"'+element.Name+'"->"'+attribute.Name+'";';
						elementInternal += "|<f"+elementInternalIndex+">"+attribute.Name;
						elementInternalIndex++;
					}
					var operations = element.Operations;
//					console.log(operations);
					for(var j in operations){
						var operation = operations[j];
//						dotty += '"'+element.Name+'"->"'+operation.Name+'";';
						elementInternal += "|<f"+elementInternalIndex+">"+operation.Name;
						elementInternalIndex++;
					}
					
					elementInternal += "}";
					dotty += dottyDraw.draw(element._id+'[label="'+elementInternal+'" shape=Mrecord];');
//					dotty += dottyDraw.draw('"'+element._id+'"->"'+target._id+'";');
				}
			} else if(diagram.Type === 'Sequence' || diagram.Type === 'Analysis' || diagram.Type === 'Activity'){
				var Nodes = diagram.Nodes;
				for(var j in Nodes){
					var node = Nodes[j];
//					dotty += '"'+node.Name+'";';
					dotty += dottyDraw.draw(node._id+'[label="'+node.Name+'" shape=ellipse];');
				}
				var Edges = diagram.Edges;
				for(var i in Edges){
					var edge = Edges[i];
						var start = edge.start;
						var end = edge.end;
//						dotty += '"'+start.Name+'"->"'+end.Name+'";';
						dotty += dottyDraw.draw('"'+start._id+'"->"'+end._id+'";');
				}
			}
		}
		
		dotty += '}';
		
		if(callbackfunc){
		console.log(filePath);
		dottyUtil.drawDottyGraph(dotty,filePath,callbackfunc);
		}
	   return dotty;
	}
	
	module.exports = {
		drawModel:function(model, filePath, callbackfunc){
			drawModel(model, filePath, callbackfunc);
		},
	}
}())