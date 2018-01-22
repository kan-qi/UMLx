/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var exec = require('child_process').exec;
	var dottyUtil = require("../../../utils/DottyUtil.js");
	
	function drawStimulusNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" ALIGN="CENTER">\
			<TR><TD><IMG SRC="Stimulus_icon.png"/></TD></TR>\
		  <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
	}
	
	function drawNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" ALIGN="CENTER">\
			<TR><TD><IMG SRC="activity_icon.png"/></TD></TR>\
		  <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
	}
	
	function drawOutOfScopeNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="out_of_scope_activity_icon.png"/></TD></TR>\
		  <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
	}
	
	function drawFragmentNode(id, label){
		return id+'[label=<\
			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">\
			<TR><TD><IMG SRC="fragment_node_icon.png"/></TD></TR>\
		  <TR><TD>'+label+'</TD></TR>\
		</TABLE>>];';
	}

//	function drawExternalNode(id, label){
//		return id+'[label=<\
//			<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" ALIGN="CENTER">\
//			<TR><TD><IMG SRC="external_activity_icon.png"/></TD></TR>\
//		  <TR><TD>'+label+'</TD></TR>\
//		</TABLE>>];';
//	}
	
	function drawPaths(paths, graphFilePath, callbackfunc){
		
		console.log("draw paths");
		console.log(paths);
		
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
			var pathTag = Number(i)+1;

			dotty += "subgraph cluster"+i+" {";
			var path = paths[i];
			var preNode = null;
			for(var j in path.Nodes){
				var node = path.Nodes[j];
//				console.log("path nodes");
//				console.log(node);
				
//				var nodeToDraw = drawExternalNode(node.id+pathTag, node.Name);
//				
//				if(node.Stimulus){
//					nodeToDraw = drawStimulusNode(node.id+pathTag, node.Name);
//				} else if(node.inScope){
//					nodeToDraw = drawInternalNode(node.id+pathTag, node.Name);
//				}
				
				var nodeToDraw = drawNode(node._id+pathTag, node.Name);
				
				if(node.Stimulus){
					nodeToDraw = drawStimulusNode(node._id+pathTag, node.Name);
				} else if(node.OutScope){
					nodeToDraw = drawOutOfScopeNode(node._id+pathTag, node.Name);
				} else if(node.Type === "fragment_start" || node.Type === "fragment_end"){
					nodeToDraw = drawFragmentNode(node._id+pathTag, node.Name);
				}

//				dotty += dottyDraw.draw(node._id+pathTag+'[label="'+node.Name+'" shape=ellipse];');
				
				dotty += dottyDraw.draw(nodeToDraw);
				
				if(preNode){
					var start = preNode;
					var end = node;
					dotty += dottyDraw.draw('"'+start._id+pathTag+'"->"'+end._id+pathTag+'";');
				}
				
				
//				var target = node.target;
//				if(target){
//					dotty += dottyDraw.draw(target._id+pathTag+'[label="'+target.Name+'"];');
//					dotty += dottyDraw.draw('"'+target._id+pathTag+'"->"'+node._id+pathTag+'";');
//					if(target.component){
//						var component = target.component;
//						var componentInternal = "{";
//						var componentInternalIndex = 0;
//						componentInternal += "<f"+componentInternalIndex+">"+component.Name;
//						componentInternalIndex++;
//						for (var k in component.Attributes){
//							var attribute = component.Attributes[k];
////							componentInternal += '"'+attribute.Name+'"->"'+component.Name+'";';
//							componentInternal += "|<f"+componentInternalIndex+">"+attribute.Name;
//							componentInternalIndex++;
//						}
//						
//						for (var k in component.Operations){
//							var operation = component.Operations[k];
////							dotty += '"'+operation.Name+'"->"'+component.Name+'";';
//							componentInternal += "|<f"+componentInternalIndex+">"+operation.Name;
//							componentInternalIndex++;
//						}
//						
//						componentInternal += "}";
//						dotty += dottyDraw.draw(component._id+pathTag+'[label="'+componentInternal+'" shape=Mrecord];');
//						dotty += dottyDraw.draw('"'+component._id+pathTag+'"->"'+target._id+pathTag+'";');
//					}
//				}
				
				preNode = node;
			}
			
			console.log("transaction detail");
			console.log(path);
			//to count the transaction
			var DE = path.Nodes.length;
			
			if(path.OutScope){
				dotty += 'bgcolor = "gray";'
			}
			dotty += "label = \"Transaction#"+pathTag+"\";}";
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