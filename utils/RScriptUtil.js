(function(){
	

	var exec = require('child_process').exec;
	
	function runRScript(command, callbackfunc){
//		console.log('generate model Analytics');
//		console.log(command);
		var child = exec(command, function(error, stdout, stderr) {

			if (error) {
//				console.log('exec error: ' + error);
				console.log(error);
				if(callbackfunc){
					callbackfunc(false);
				}
			} else {
				if(callbackfunc){
					callback(true);
				}
			}
		});
	}
	
	module.exports = {
			runRScript: runRScript
	}
})();
