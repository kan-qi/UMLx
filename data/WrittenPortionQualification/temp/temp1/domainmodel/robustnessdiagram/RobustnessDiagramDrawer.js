/**
 * http://usejsdoc.org/
 */

(function(){
	
	function convertToDotty(robustnessDiagram){
		var graph = "digraph g {";
		var Elements = robustnessDiagram.Elements;
		for(var i in Elements){
			var element = Elements[i];
			var connectors = element.Connectors;
			if(connectors !== undefined){
			for(var connectorId in connectors){
				if(Elements[connectors[connectorId].ClientID] !== undefined && Elements[connectors[connectorId].SupplierID] != undefined){
				var start = Elements[connectors[connectorId].ClientID]['Name'];
				var end = Elements[connectors[connectorId].SupplierID]['Name'];
				if(start === element.Name){
					graph += "\""+start+"\"->\""+end+"\";";
					
				}
				}
//				console.log(element.Name+":");
//				console.log(start+"->"+end+";");
//				console.log("");
			}
			}
		}
		graph += "}";
//		console.log(graph);
		
//		var image = Viz(graph, { format:"dot", engine:"dot" });
		
		return graph
	}
//	var Viz = require('viz.js');
	module.exports = {
		draw: function(robustnessDiagram, callbackfunc){
			var fs = require('fs');
			var graph = convertToDotty(robustnessDiagram);
			var graphFilePath = robustnessDiagram.outputDir+"/"+robustnessDiagram.dotGraphFile; 
			console.log(graphFilePath);
			fs.writeFile(graphFilePath, graph, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			    
			    console.log("The file was saved!");
			    callbackfunc(robustnessDiagram);
			});
		}
	}
}())