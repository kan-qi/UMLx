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
		
//		var Nodes = diagram.Nodes;
		for(var i in transactions){
			var transaction = transactions[i];
			var preNode = null;
			for(var j in transaction){
				var node = transaction[j];
				dotty += '"'+node.Name+'";';
				if(preNode){
					var start = preNode;
					var end = node;
					dotty += '"'+start.Name+'"->"'+end.Name+'";';
				}
				
				var target = node.target;
				if(target){
					dotty += '"'+target.Name+'"->"'+node.Name+'";';
					if(target.component){
						var component = target.component;
						dotty += '"'+component.Name+'"->"'+target.Name+'";';
						for (var k in component.Operations){
							var operation = component.Operations[k];
							dotty += '"'+operation.Name+'"->"'+component.Name+'";';
						}
						
						for (var k in component.Attributes){
							var attribute = component.Attributes[k];
							dotty += '"'+attribute.Name+'"->"'+component.Name+'";';
						}
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