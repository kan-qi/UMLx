(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	var config = require("../config.js");
	
	function generateUMLDiagram(UMLDiagramInputPath, callbackfunc, type){
		
	    //to generate svg file.
	    var command = 'java -jar ./tools/plantuml.jar "'+UMLDiagramInputPath+'"';
	    if(type === "class_diagram"){
	    	command += ' -xmi';
	    }
		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			console.log('The file was saved!');
			
			 if(callbackfunc){
			  callbackfunc(UMLDiagramInputPath);
			 }
		});
		


        var debug = require("./DebuggerOutput.js");
        debug.appendFile1("plant_uml_commands", command+"\n");
	    
}
	
	module.exports = {
			generateUMLDiagram:generateUMLDiagram
	}
})();
