(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	
	function runPyScript(filePath, callbackfunc){

		    var command = 'python '+filePath;
		
			var child = exec(command, function(error, stdout, stderr) {
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				console.log('The file was saved!');
		
				if(callbackfunc){
				  callbackfunc(outputFile);
				 }
			});
			
			child.stdout.on('data', function(data) {
		  	    console.log(data); 
		  	});
	}
	
	module.exports = {
			runPyScript:runPyScript,
	}
})();
