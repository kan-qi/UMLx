(function(){

	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var config = require("../config.js");
//	var OutputDir = './debug';
	var OutputDir = config.debugOutputDir;

	function writeJson(token, message, callbackfunc){
		console.log(token);
		mkdirp(OutputDir, function(err) { 
		fs.writeFile(OutputDir+'/'+token+'.json', JSON.stringify(message), function(err){
			if(err){
				console.log(err);
			}
		});
		});
	}
	
	function appendFile(token, message, callbackfunc){
		mkdirp(OutputDir, function(err) { 
			fs.appendFile(OutputDir+'/'+token+'.txt', message,function (err) {
				  if (err) throw err;
				  console.log('Saved!');
				  if(callbackfunc){
					  callbackfunc(OutputDir+'/'+token+'.txt');
				  }
				});
			});
	}
	
	module.exports = {
			writeJson: writeJson,
			appendFile:appendFile
	}
	
	
})();
