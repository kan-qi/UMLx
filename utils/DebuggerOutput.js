(function(){

	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var OutputDir = './debug';
	
	function writeJson(token, message, callbackfunc){
		mkdirp(OutputDir, function(err) { 
		fs.writeFile(OutputDir+'/'+token+'.json', JSON.stringify(message), function(err){
			if(err){
				console.log(err);
			}
		});
		});
	}
	
	module.exports = {
			writeJson: writeJson
	}
})();
