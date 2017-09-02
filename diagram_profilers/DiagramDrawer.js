/**
 * http://usejsdoc.org/
 */

(function(){
//	var Viz = require('viz.js');
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var exec = require('child_process').exec;
	
	function drawRobustnessDiagramFunc(robustnessDiagram, callbackfunc){
		var graph = 'digraph g {';
		var Elements = robustnessDiagram.Elements;
		for(var i in Elements){
			var element = Elements[i];
			var connectors = element.Connectors;
			if(connectors !== undefined){
			for(var j in connectors){
				if(Elements[connectors[j].ClientID] && Elements[connectors[j].SupplierID]){
				var start = Elements[connectors[j].ClientID]['Name'];
				var end = Elements[connectors[j].SupplierID]['Name'];
				if(start === element.Name){
					graph += '"'+start+'"->"'+end+'";';
				}
				}
			}
			}
		}
		graph += '}';
		var graphFilePath = robustnessDiagram.outputDir+'/'+robustnessDiagram.dotGraphFile; 
//		console.log(graphFilePath);
		mkdirp(robustnessDiagram.outputDir, function(err) {
		    // path exists unless there was an error
			 if(err) {
			        return console.log(err);
			 }
			 fs.writeFile(graphFilePath, graph, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    
		    var command = 'dot -Tsvg "' + graphFilePath + '">"'+robustnessDiagram.outputDir+"/"+robustnessDiagram.svgGraphFile+'"';
//			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {
				if (error !== null) {
					console.log('exec error: ' + error);
				}

			    console.log('The file was saved!');
			    if(callbackfunc){
			    	callbackfunc(graphFilePath);
			    }
			});
			
			
		});
		});
		return graph
	}
	
	function drawSequenceDiagramFunc(sequenceDiagram, callbackfunc){
		var graph = 'digraph g {';
		var Elements = sequenceDiagram.Elements;
		for(var i in Elements){
			var element = Elements[i];
			var connectors = element.Connectors;
			if(connectors !== undefined){
			for(var j in connectors){
				if(Elements[connectors[j].ClientID] && Elements[connectors[j].SupplierID]){
				var start = Elements[connectors[j].ClientID]['Name'];
				var end = Elements[connectors[j].SupplierID]['Name'];
				if(start === element.Name){
					graph += '"'+start+'"->"'+end+'";';
					
				}
				}
			}
			}
		}
		graph += '}';
		
		var fileName = sequenceDiagram.Name+'_sequence.dotty';
		var graphFilePath = sequenceDiagram.outputDir+'/'+sequenceDiagram.dotGraphFile;
		mkdirp(sequenceDiagram.outputDir, function(err) {
		    // path exists unless there was an error
			 if(err) {
			        return console.log(err);
			 }
			 fs.writeFile(graphFilePath, graph, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    
		    var command = 'dot -Tsvg "' + graphFilePath + '">"'+sequenceDiagram.outputDir+"/"+sequenceDiagram.svgGraphFile+'"';
//			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {
				if (error !== null) {
					console.log('exec error: ' + error);
				}

			    console.log('The file was saved!');
			    if(callbackfunc){
			    callbackfunc(graphFilePath);
			    }

			});
		    		});
		});
	   return graph;
	}
	
	function drawClassDiagramFunc(classDiagram, callbackfunc){
		var graph = 'digraph g {';
		for(var i in classDiagram.Elements){
		var element = classDiagram.Elements[i];
		var attributes = element.Attributes;
//		console.log(attributes);
		for(var j in attributes){
			var attribute = attributes[j];
			graph += '"'+element.Name+'"->"'+attribute.Name+'";';
		}
		var operations = element.Operations;
//		console.log(operations);
		for(var j in operations){
			var operation = operations[j];
			graph += '"'+element.Name+'"->"'+operation.Name+'";';
		}
		}
		graph += '}';
		
		var graphFilePath = classDiagram.outputDir+'/'+classDiagram.dotGraphFile;
		mkdirp(classDiagram.outputDir, function(err) {
		    // path exists unless there was an error
			 if(err) {
			        return console.log(err);
			 }
//			 console.log(graph);
		fs.writeFile(graphFilePath, graph, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    
		    //to generate svg file.
		    var command = 'dot -Tsvg "' + graphFilePath + '">"'+classDiagram.outputDir+"/"+classDiagram.svgGraphFile+'"';
//			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				 console.log('The file was saved!');
				 if(callbackfunc){
				  callbackfunc(graphFilePath);
				 }
			});
		    
		   
		});
		});
	   return graph;
	}
	
	module.exports = {
		drawClassDiagram:function(diagram, callbackfunc){
//			console.log('draw class diagram	');
			var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_");
			diagram.dotGraphFile = fileName+'_class.dotty';
			diagram.svgGraphFile = fileName+'_class.svg';
//			diagramDrawer.drawClassDiagram(diagram, function(diagram){
//				console.log('class diagram is drawed.');
//			});
			drawClassDiagramFunc(diagram, callbackfunc);
		},
		drawRobustnessDiagram: function(diagram, callbackfunc){
			var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_");
			diagram.dotGraphFile = fileName+'_robustness.dotty';
			diagram.svgGraphFile = fileName+'_robustness.svg';
//			diagramDrawer.drawRobustnessDiagram(diagram, function(diagram){
//				console.log('robustness diagram is drawed.');
//			});
			drawRobustnessDiagramFunc(diagram, callbackfunc);
		},
		drawSequenceDiagram: function(diagram, callbackfunc){
			var fileName = diagram.Name.replace(/[^A-Za-z0-9_]/gi, "_");
			diagram.dotGraphFile = fileName+'_sequence.dotty';
			diagram.svgGraphFile = fileName+'_sequence.svg';
//			diagramDrawer.drawSequenceDiagram(diagram, function(diagram){
//				console.log('sequence diagram is drawed.');
//			});
			drawSequenceDiagramFunc(diagram, callbackfunc);
		},
		drawDiagram: function(diagram, callbackfunc){
			if(diagram.Type === 'Logical'){
				drawClassDiagramFunc(diagram, callbackfunc);
			} else if(diagram.Type === 'Sequence'){
				drawSequenceDiagramFunc(diagram, callbackfunc);
			} else if(diagram.Type === 'Analysis'){
				drawRobustnessDiagramFunc(diagram, callbackfunc);
			}
		}
	}
}())