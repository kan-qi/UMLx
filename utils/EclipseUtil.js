(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	function generateKDMModel(projectPath, callbackfunc){
			var eclipseInstall = "\"C:/Users/flyqk/Documents/Google Drive/ResearchSpace/Research Projects/tools/eclipse-java-luna-SR2-win32-x86_64/eclipse/eclipse\"";
			var outputFile = projectPath + "/umlx_kdm.xmi";
		    //to generate svg file.
		    var command = eclipseInstall+' -consoleLog -console -noExit -application test21.test "' + projectPath + '" "'+outputFile+'"';
//			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				console.log('The file was saved!');
				//console.log("AAAAAAAAAAAAAAAAAAA");
				 /*var content;
				 fs.readFile(dir+'/'+fileName+'.svg', "utf8", function read(err, data) {
					if (err) {
						throw err;
					}
					content = data;
					console.log(content);
					content = content.replace('width=\"[0-9]+px\"', 'width=\"140px\"');
					content = content.replace('height=\"[0-9]+px\"', 'height=\"85px\"');
					fs.writeFile(dir+'/'+fileName+'.svg', content, function(err){
						if(err)
						{
							return console.log(err);
						}
					});
				});*/
				 if(callbackfunc){
				  callbackfunc(outputFile);
				 }
			});
		    
	}
	
	module.exports = {
			generateKDMModel:generateKDMModel
	}
})();
