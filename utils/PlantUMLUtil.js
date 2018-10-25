(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	var config = require("../config.js");
	
	function generateSequenceDiagram(sequenceDiagramInputPath, callbackfunc){
		
	    //to generate svg file.
	    var command = 'java -jar ./tools/plantuml.jar "'+sequenceDiagramInputPath+'"';
		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			console.log('The file was saved!');
			
			 if(callbackfunc){
			  callbackfunc(sequenceDiagramInputPath);
			 }
		});
	    
}
	
	module.exports = {
			generateSequenceDiagram:generateSequenceDiagram
	}
})();
