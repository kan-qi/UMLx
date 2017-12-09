/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	module.exports = {
		draw: function(outputDir, classDiagram, callbackfunc){
			var fs = require('fs');
			var graph = "digraph g {";
			var attributes = classDiagram.Attributes;
			console.log(attributes);
			for(var i in attributes){
				var attribute = attributes[i];
				graph += "\""+classDiagram.Name+"\"->\""+attribute.Name+"\";";
			}
			var operations = classDiagram.Operations;
			console.log(operations);
			for(var i in operations){
				var operation = operations[i];
				graph += "\""+classDiagram.Name+"\"->\""+operation.Name+"\";";
			}
			graph += "}";
			console.log(graph);
			
//			var image = Viz(graph, { format:"dot", engine:"dot" });
//			
			var fileName = classDiagram.Name+'_class.dotty';
			var graphFilePath = outputDir+"/"+fileName.replace(/ /gi, "_");
			fs.writeFile(graphFilePath, graph, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			    
			    console.log("The file was saved!");
			    if(callbackfunc != null){
			    callbackfunc(graphFilePath);
			    }
			});
		   return graphFilePath;
		}
	}
}())