/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var exec = require('child_process').exec;
	var dottyUtil = require("../utils/DottyUtil.js");
	
	function drawStimulusNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" ALIGN="CENTER">\
			<TR><TD><IMG SRC="stimulus_icon.png"/></TD></TR>\
		  <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
	}
	
	function drawInternalNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" ALIGN="CENTER">\
			<TR><TD><IMG SRC="internal_activity_icon.png"/></TD></TR>\
		  <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
	}

	function drawExternalNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" ALIGN="CENTER">\
			<TR><TD><IMG SRC="external_activity_icon.png"/></TD></TR>\
		  <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
	}
	
	function drawPaths(paths, graphFilePath, callbackfunc){
		
		console.log("draw paths");
		
		var dotty = 'digraph g {';
		dotty += "node[shape=plaintext]";
//		dotty += "node[shape=record]";
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
//		var Nodes = diagram.Nodes;
		for(var i in paths){
			// add tag to every nodes, such that paths will be separated in drawing.
			var pathTag = "_"+i;

			dotty += "subgraph cluster"+i+" {";
			var path = paths[i];
			var preNode = null;
			for(var j in path.Nodes){
				var node = path.Nodes[j];
//				console.log("path nodes");
//				console.log(node);
				
				var nodeToDraw = drawExternalNode(node.id+pathTag, node.name);
				
				if(node.stimulus){
					nodeToDraw = drawStimulusNode(node.id+pathTag, node.name);
				} else if(node.inScope){
					nodeToDraw = drawInternalNode(node.id+pathTag, node.name);
				}

//				dotty += dottyDraw.draw(node.id+pathTag+'[label="'+node.name+'" shape=ellipse];');
				
				dotty += dottyDraw.draw(nodeToDraw);
				
				if(preNode){
					var start = preNode;
					var end = node;
					dotty += dottyDraw.draw('"'+start.id+pathTag+'"->"'+end.id+pathTag+'";');
				}
				
				var target = node.target;
				if(target){
					dotty += dottyDraw.draw(target.id+pathTag+'[label="'+target.name+'"];');
					dotty += dottyDraw.draw('"'+target.id+pathTag+'"->"'+node.id+pathTag+'";');
					if(target.component){
						var component = target.component;
						var componentInternal = "{";
						var componentInternalIndex = 0;
						componentInternal += "<f"+componentInternalIndex+">"+component.name;
						componentInternalIndex++;
						for (var k in component.Attributes){
							var attribute = component.Attributes[k];
//							componentInternal += '"'+attribute.name+'"->"'+component.name+'";';
							componentInternal += "|<f"+componentInternalIndex+">"+attribute.name;
							componentInternalIndex++;
						}
						
						for (var k in component.Operations){
							var operation = component.Operations[k];
//							dotty += '"'+operation.name+'"->"'+component.name+'";';
							componentInternal += "|<f"+componentInternalIndex+">"+operation.name;
							componentInternalIndex++;
						}
						
						componentInternal += "}";
						dotty += dottyDraw.draw(component.id+pathTag+'[label="'+componentInternal+'" shape=Mrecord];');
						dotty += dottyDraw.draw('"'+component.id+pathTag+'"->"'+target.id+pathTag+'";');
					}
				}
				
				preNode = node;
			}
			dotty += "label = \"transaction"+pathTag+"\";}";
		}
		
		dotty += 'imagepath = \"./imgs\"}';
		
		if(callbackfunc){
		dottyUtil.drawDottyGraph(dotty,graphFilePath,callbackfunc);
		}
	   return dotty;
	}
	
	module.exports = {
		drawPaths:function(paths, filePath, callbackfunc){
			drawPaths(paths, filePath, callbackfunc);
		},
	}
}())