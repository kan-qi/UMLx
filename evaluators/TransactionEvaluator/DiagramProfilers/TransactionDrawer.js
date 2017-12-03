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
		
		//graph.Name = "test";
		//console.log(dotty);
		
		if(callbackfunc){
//		var fileName = diagram.Name+'_graph.dotty';
//		console.log(fileName);
//		var graphFilePath = diagram.OutputDir+'/'+fileName;
		dottyUtil.drawDottyGraph(dotty,graphFilePath,callbackfunc);
		}
	   return dotty;
	}
	
	module.exports = {
		drawTransactions:function(transactions, filePath, callbackfunc){
//			console.log('draw class diagram	');
//			var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_");
//			diagram.DotGraphFile = fileName+'_class.dotty';
//			diagram.SvgGraphFile = fileName+'_class.svg';
//			diagramDrawer.drawClassDiagram(diagram, function(diagram){
//				console.log('class diagram is drawed.');
//			});
			drawTransactions(transactions, filePath, callbackfunc);
		},
	}
}())