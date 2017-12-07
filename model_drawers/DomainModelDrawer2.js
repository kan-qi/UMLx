/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	
	module.exports = {
		drawDomainModel: function(domainModel, callbackfunc){
			var domainModelAnalytics = domainModel.DomainModelAnalytics;
			var diagrams = domainModelAnalytics.Diagrams;
			var graph = 'digraph g {';
			for(var i in diagrams){
			var diagramAnalytics = diagrams[i].DiagramAnalytics;
			for(var j in diagramAnalytics.Elements){
				var element = diagramAnalytics.Elements[j];
//				console.log(element);
				var attributes = element.Attributes;
//				console.log(attributes);
				for(var k in attributes){
					var attribute = attributes[k];
					graph += '"'+element.Name+'"->"'+attribute.Name+'";';
				}
				var operations = element.Operations;
//				console.log(operations);
				for(var k in operations){
					var operation = operations[k];
					graph += '"'+element.Name+'"->"'+operation.Name+'";';
				}
			}
			}
			graph += '}';
			var graphFilePath = domainModel.outputDir+'/'+domainModel.dotGraphFile; 
//			console.log(graphFilePath);
			mkdirp(domainModel.outputDir, function(err) {
			    // path exists unless there was an error
				 if(err) {
				        return console.log(err);
				 }
//				 console.log(graph);
				 fs.writeFile(graphFilePath, graph, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			    
			    console.log('The file was saved!');
			    if(callbackfunc){
			    	callbackfunc(graphFilePath);
			    }
				
			});
			});
			return graph
		}
	}
}())