(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	
	module.exports = {
		testWithJSON: function(functionObject, JSONFiles, callbackfunc){
			fs.readFile(jsonFilePath, 'utf-8', (err, str) => {
				   if (err) throw err;
//				    console.log(str);
				  
				   var result = JSON.parse(str);
				    
//				    console.log("csv data is loaded");
//				    console.log(data);
				    
				    if(callbackfunc){
				    	callbackfunc(result);
				    }
			});
		}
	}
}())