/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var exec = require('child_process').exec;

	var dottyUtil = require("../../../utils/DottyUtil.js");
	
	function drawTransactions(transactions, graphFilePath, callbackfunc){
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
//		var Nodes = diagram.Nodes;
		for(var i in transactions){
			// add tag to every nodes, such that transactions will be separated in drawing.
			var transactionTag = "_"+i;
			var transaction = transactions[i];
			var preNode = null;
			for(var j in transaction.Nodes){
				var node = transaction.Nodes[j];
//				console.log("transaction nodes");
//				console.log(node);
				dotty += dottyDraw.draw(node._id+transactionTag+'[label="'+node.Name+'" shape=ellipse];');
				if(preNode){
					var start = preNode;
					var end = node;
					dotty += dottyDraw.draw('"'+start._id+transactionTag+'"->"'+end._id+transactionTag+'";');
				}
				
				var target = node.target;
				if(target){
					dotty += dottyDraw.draw(target._id+transactionTag+'[label="'+target.Name+'"];');
					dotty += dottyDraw.draw('"'+target._id+transactionTag+'"->"'+node._id+transactionTag+'";');
					if(target.component){
						var component = target.component;
						var componentInternal = "{";
						var componentInternalIndex = 0;
						componentInternal += "<f"+componentInternalIndex+">"+component.Name;
						componentInternalIndex++;
						for (var k in component.Attributes){
							var attribute = component.Attributes[k];
//							componentInternal += '"'+attribute.Name+'"->"'+component.Name+'";';
							componentInternal += "|<f"+componentInternalIndex+">"+attribute.Name;
							componentInternalIndex++;
						}
						
						for (var k in component.Operations){
							var operation = component.Operations[k];
//							dotty += '"'+operation.Name+'"->"'+component.Name+'";';
							componentInternal += "|<f"+componentInternalIndex+">"+operation.Name;
							componentInternalIndex++;
						}
						
						componentInternal += "}";
						dotty += dottyDraw.draw(component._id+transactionTag+'[label="'+componentInternal+'" shape=Mrecord];');
						dotty += dottyDraw.draw('"'+component._id+transactionTag+'"->"'+target._id+transactionTag+'";');
					}
				}
				
				preNode = node;
				
			}
		}
		
		dotty += '}';
		
		if(callbackfunc){
		dottyUtil.drawDottyGraph(dotty,graphFilePath,callbackfunc);
		}
	   return dotty;
	}
	
	module.exports = {
		drawTransactions:function(transactions, filePath, callbackfunc){
			drawTransactions(transactions, filePath, callbackfunc);
		},
	}
}())