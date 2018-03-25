(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	var path = require('path');
	var mkdirp = require('mkdirp');
	
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
				 if(callbackfunc){
				  callbackfunc(graphFilePath);
				 }
			});
		    
		   
		});
		});
	}
	
	module.exports = {
			drawDottyGraph: drawDottyGraph
	}
})();
