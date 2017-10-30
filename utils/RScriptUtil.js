(function(){
	

	var exec = require('child_process').exec;
	
	var RExec = '\"C:/Program Files/R/R-3.2.5/bin/Rscript\"';
	
	function runRScript(command, callbackfunc){
//		console.log('generate model Analytics');
		console.log(command);
		var child = exec(RExec+" "+command, function(error, stdout, stderr) {

			if (error) {
//				console.log('exec error: ' + error);
				console.log(error);
				if(callbackfunc){
					callbackfunc(false);
				}
			} else {
				if(callbackfunc){
					callbackfunc(true);
				}
			}
		});
	}
	
	module.exports = {
			runRScript: runRScript
	}
})();
