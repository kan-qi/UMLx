(function(){
	var fs = require('fs');
	var path = require('path');
	var exec = require('child_process').exec;
	var config = require("../config.js");
	
	function generateKDMModel(projectPath, callbackfunc){
			var outputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
		    //to generate svg file.
		    var command = eclipseInstall+' -consoleLog -console -noExit -application test21.test "' + projectPath + '" "'+outputFile+'" -vmargs -Xmx10240M';
//		    var command = eclipseInstall+' -application test21.test "' + projectPath + '" "'+outputFile+'"';
//		    console.log(command);
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
			
			child.stdout.on('data', function(data) {
		  	    console.log(data); 
		  	});
	}
	
	function generateKDMModel2(projectPath, callbackfunc){
//		var eclipseInstall = "\"C:\\Users\\flyqk\\Documents\\Research Projects\\tools\\eclipse-java-luna-SR2-win32-x86_64\\eclipse\\eclipse\"";
//		var eclipseInstall = "\"C:\\Users\\flyqk\\Documents\\Research Projects\\tools\\eclipse-java-luna-SR2-win32-x86_64\\eclipse\\eclipse\"";
		
		var eclipseInstall = config.eclipseInstall;
		var outputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
	    //to generate svg file.
	    var command = eclipseInstall+' -consoleLog -console -noExit -application testMonitor3.id5 "' + projectPath + '" "'+outputFile+'" -vmargs -Xmx10240M';
//		console.log(command);
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
	
	//change this function to call the exported plugin project of eclipse
	function generateKDMModel3(projectPath, callbackfunc){
//		var eclipseInstall = "\"C:\\Users\\flyqk\\Documents\\Research Projects\\tools\\eclipse-java-luna-SR2-win32-x86_64\\eclipse\\eclipse\"";
//		var eclipseInstall = "\"C:\\Users\\flyqk\\Documents\\Research Projects\\tools\\eclipse-java-luna-SR2-win32-x86_64\\eclipse\\eclipse\"";
		
		var eclipseInstall = config.eclipseInstall;
		var outputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
	    //to generate svg file.
	    var command = eclipseInstall+' -consoleLog -console -noExit -application testMonitor3.id5 "' + projectPath + '" "'+outputFile+'" -vmargs -Xmx10240M';
//		console.log(command);
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


	// helper to wait for KDM output file to exist, and have content
	// modified from source:
	// https://stackoverflow.com/a/47764403
	function checkExistsWithTimeout(filePath, timeout = 100 * 1000) {
		return new Promise(function (resolve, reject) {
	
			var timer = setTimeout(function () {
				watcher.close();
				reject(new Error('File did not exists and was not created during the timeout.'));
			}, timeout);
	
			fs.access(filePath, fs.constants.R_OK, function (err) {
				if (!err) {
					clearTimeout(timer);
					watcher.close();
					resolve();
				}
			});
	
			var dir = path.dirname(filePath);
			var basename = path.basename(filePath);
			var watcher = fs.watch(dir, function (eventType, filename) {
				if (eventType === 'change' && filename === basename) {
					clearTimeout(timer);
					watcher.close();
					resolve();
				}
			});
		});
	}
	
	function generateKDMModel4(projectPath, callbackfunc) {
		var appRoot = path.dirname(require.main.filename);

		var outputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";

		// use full path (with appRoot) here only
		var command = config.kdmGenerationCommand + " -consoleLog -noExit \""
			+ appRoot + "/" + projectPath + "\" \""
			+ appRoot + "/" + outputFile + "\" -vmargs -Xmx10240M";

	   console.log(command);

		var child = exec(command, function(error, stdout, stderr) {
			if (error != null) {
				// On Windows, closing the eclipse window will trigger this error
				// callbackfunc(new Error("Error generating KDM."));
				console.log("error in generating KDM model.")
				return;
			}
		});

		checkExistsWithTimeout(outputFile)
			.then(function(res) {

				child.kill();

				callbackfunc(null, outputFile);

				console.log("kdm generation is finished.")
			})
			.catch(function(err) {
				callbackfunc(err);
			});
	}

	module.exports = {
			generateKDMModel:generateKDMModel,
			generateKDMModel2:generateKDMModel2,
			generateKDMModel4: generateKDMModel4
	}
})();
