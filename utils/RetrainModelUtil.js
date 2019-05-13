(function(){
	

	var exec = require('child_process').exec;
	
	var RExec = '\"C:/Program Files/R/R-3.2.5/bin/Rscript\"';
	

	var debug = require("./DebuggerOutput.js");
	
	//every other functions which call R script should call this function.
	
	var commandPool = [];
	var runningCount = 0;
	var threadLimit = 10;
	
	function runRScript(command, callbackfunc){
//		console.log('generate model Analytics');
//		console.log(command);
//		return;
		commandPool.push({
			command: command,
			callbackfunc: callbackfunc
		});
		loop();
	}
	
	function loop(){
		if(runningCount < threadLimit){
			var commandObject = commandPool.shift();
			
			debug.appendFile("commands", commandObject.command);
//			console.log("exist program");
//			process.exit();
			runningCount++;
			var child = exec(RExec+" "+commandObject.command, function(error, stdout, stderr) {
				if (error) {
//					console.log('exec error: ' + error);
					console.log(error);
					if(commandObject.callbackfunc){
						commandObject.callbackfunc(false);
					}
				} else {
					if(commandObject.callbackfunc){
						commandObject.callbackfunc(true);
					}
				}
				
				runningCount--;
				if(commandPool.length > 0){
					loop();
				}
			});
		}
	}
	
	module.exports = {
			runRScript: runRScript
	}
})();
