(function(){
	

	var exec = require('child_process').exec;
	
	//if you haven't add Rscript into path variable of OS. You can use the absolute path.
	//var RExec = '\"C:/Program Files/R/R-3.5.1/bin/Rscript\"';
	
	//if you have added Rscript into path variable of OS.
	var RExec = '\"Rscript\"';
	
	var debug = require("./DebuggerOutput.js");
	var config = require("../config.js");
	
	//var libPaths = "C:/Users/flyqk/Documents/R/win-library/3.5;C:/Program Files/R/R-3.5.1/library";
	var libPaths = config.r_libraries;

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

	function runRScriptTest(command) {
	    // test the rscript command with:
	    // node -e 'require("./utils/RscriptUtil.js").runRScriptTest(command)'
//	    console.log(libPaths);
	    var child = exec(RExec+" "+command, {env: {"R_LIBS_USER": libPaths}}, function(error, stdout, stderr) {
	                    console.log(stderr);
	                    console.log(stdout);
        				if (error) {
        					console.log(error);
        				}
        });
	}

	function loop(){
		if(runningCount < threadLimit){
			var commandObject = commandPool.shift();
			
			debug.appendFile("commands", commandObject.command);
//			console.log("exist program");
//			process.exit();
			runningCount++;
			//var child = exec(RExec+" "+commandObject.command, function(error, stdout, stderr) {
			//console.log(libPaths);
			var child = exec(RExec+" "+commandObject.command, {env: {"R_LIBS_USER": libPaths}}, function(error, stdout, stderr) {
					
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
			runRScript: runRScript,
			runRScriptTest: runRScriptTest
	}
})();
