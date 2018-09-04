(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	var path = require('path');
	var mkdirp = require('mkdirp');
	
	function drawPlainDiagram(nodes, edges, graphFilePath, callbackfunc){
		var graph = 'digraph g {';
		for(var i in nodes){
			var node = nodes[i];
			if(node !== undefined){
			graph += '"'+start+'";';
			}
		}
		
		for(var i in edges){
			var edge = edges[i];
			if(edge !== undefined){
			for(var j in edges){
				var start = edge.start;
				var end = edge.end;
				if(start && end){
					graph += '"'+start+'"->"'+end+'";';
				}
				
			}
			}
		}
		
		graph += '}';
		
		drawDottyGraph(graph, graphFilePath,callbackfunc);
	
	}
	
	function drawDottyGraph(dottyGraph, graphFilePath, callbackfunc){
		var dir = path.dirname(graphFilePath);
		var fileName = path.parse(graphFilePath).base.replace(/\.[^/.]+$/, "");
		mkdirp(dir, function(err) {
		    // path exists unless there was an error
			 if(err) {
			        return console.log(err);
			 }
//			 console.log(graph);
		fs.writeFile(graphFilePath, dottyGraph, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    
		    //to generate svg file.
		    var command = 'dot -Tsvg "' + graphFilePath + '">"'+dir+"/"+fileName+'.svg"';
//			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				console.log('The file was saved!');
				//console.log("AAAAAAAAAAAAAAAAAAA");
				 /*var content;
				 fs.readFile(dir+'/'+fileName+'.svg', "utf8", function read(err, data) {
					if (err) {
						throw err;
					}
					content = data;
					console.log(content);
					content = content.replace('width=\"[0-9]+px\"', 'width=\"140px\"');
					content = content.replace('height=\"[0-9]+px\"', 'height=\"85px\"');
					fs.writeFile(dir+'/'+fileName+'.svg', content, function(err){
						if(err)
						{
							return console.log(err);
						}
					});
				});*/
				 if(callbackfunc){
				  callbackfunc(graphFilePath);
				 }
			});
		    
		   
		});
		});
	}
	
	module.exports = {
			drawDottyGraph: drawDottyGraph,
			drawPlainDiagram: drawPlainDiagram
	}
})();
