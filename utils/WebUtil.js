(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var uuidV1 = require('uuid/v1');
	var codeAnalysisUtil = require("./CodeAnalysisUtil.js");
	var stringSimilarity = require('string-similarity');
	var fileManagerUtil = require("./FileManagerUtils.js");

	var exec = require('child_process').exec;

	// the log file might be very large, specical stream reader is required.

	var es = require('event-stream');
	var async = require("async");

	function generateAndroidAnalysis(project) {
		var apkFileName = project.apkFileName;

		var apkFilePath = project.path+"/"+apkFileName;
		var outputDir = project.path;
		console.log(outputDir);
		var executeAPKAnalysis = function(apkFileName, outputDir, callback){

		 	if(!apkFileName){
			  	console.log('empty apk name');
			  	if(callback){
			  		callback(false);
			  	}
		  		return;
		  	}

		  	var apkName = apkFileName.replace(/\.apk/g, "");

//		  	var wslPath = function(path){
//		  		path = path.replace(/:/g, "");
//		  		path = path.replace(/\\/g, "/");
//		  		path = "/mnt/"+path;
//		  		return path;
//		  	}

//		   	var command = "wsl.exe /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/gator a " +
//		   		"-p \"/mnt/f/D/AndroidAnalysis/UMLxExperiment/APKs/"+apkFileName+"\" "+
//		   		"-client GUIHierarchyPrinterClient " +
//		   		"-outputDir \"" + outputDir + "/" + apkName + "\"";

//		 	var command = "wsl.exe /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/gator a " +
//	   		"-p \""+wslPath(apkFilePath)+"\" "+
//	   		"-client GUIHierarchyPrinterClient " +
//	   		"-outputDir \"" + wslPath(outputDir) + "\"";

//	   		var command = "/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/gator a " +
//            	   		"-p \""+apkFilePath+"\" "+
//            	   		"-client GUIHierarchyPrinterClient " +
//            	   		"-outputDir \"" + outputDir + "\"";


//           var command = "java -cp \"./facility-tools/Android-toolkit/out/production/Android-toolkit:./facility-tools/Android-toolkit/libs/*\" "
//           +"org.umlx.UMLxAndroidToolKit \""+apkFilePath+"\""
//           +" \""+outputDir+"\"";

           var command = "";
           if(project.package){
           command = "java -cp \"./facility-tools/Android-toolkit/out/production/Android-toolkit:./facility-tools/Android-toolkit/libs/*\" "
                      +"org.umlx.UMLxAndroidToolKit \""+apkFilePath+"\""
                      +" \""+outputDir+"\" "+"\""+project.package+"\"";
//            command = "java -cp \"./facility-tools/Android-toolkit/bin:./facility-tools/Android-toolkit/libs/*\" "
//                                 +"org.umlx.UMLxAndroidToolKit \""+apkFilePath+"\""
//                                 +" \""+outputDir+"\" "+"\""+project.package+"\"";
           }
           else{
           command = "java -cp \"./facility-tools/Android-toolkit/out/production/Android-toolkit:./facility-tools/Android-toolkit/libs/*\" "
                      +"org.umlx.UMLxAndroidToolKit \""+apkFilePath+"\""
                      +" \""+outputDir+"\"";

//           command = "java -cp \"./facility-tools/Android-toolkit/bin:./facility-tools/Android-toolkit/libs/*\" "
//                      +"org.umlx.UMLxAndroidToolKit \""+apkFilePath+"\""
//                      +" \""+outputDir+"\"";
           }

//		 	console.log(outputDir);
//		   	console.log(command);

			var child = exec(command,  {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
				if (error !== null) {
					console.log("error in generating apk analysis.");
					console.log(error);
					if(callback){
				  		callback(false);
				  	}
					return;
				}

				if(callback){
					callback(outputDir)
				}
			});

			child.stdout.on('data', function(data) {
                console.log(data);
            });
		}
		return checkExistsWithTimeout(executeAPKAnalysis, apkFileName, outputDir)
	}


function checkExistsWithTimeout(executeAPKAnalysis, apkFileName, outputDir, timeout = 3 * 60 * 60 * 1000) {


		return new Promise(function (resolve, reject) {


			var apkName = apkFileName.replace(/\.apk/g, "");

            //	var dir = outputDir +"/"+apkName;

			var fileNames = ["gator-handlers.txt", "android-analysis-output.json"];

			mkdirp(outputDir, function(err) {
				      // to generate svg file.

				  	if(err){
				  		console.log('error in creating output folder');

				  		reject(new Error('error in creating output folder.'));

				  		return;
				  	}

			var watcher = null;
			var timer = setTimeout(function () {
				if(watcher != null){
				watcher.close();
				}
				reject(new Error('File did not exists and was not created during the timeout.'));
			}, timeout);

			var alreadyExist = true;
			try{
				for(var i in fileNames){
				   console.log("check file existence: "+fileNames[i]);
				   require('fs').accessSync(outputDir+"/"+fileNames[i], fs.R_OK | fs.W_OK)
				}
			}catch(e){
            // console.log("watch on files...");
				alreadyExist = false;
				var checkExists = {};
				for(var i in fileNames){
					checkExists[fileNames[i]] = 0;
				}
				watcher = fs.watch(outputDir, function (eventType, filename) {
					if (eventType === 'change') {
            // console.log(filename+" has changed");
						checkExists[filename] = 1;
						var allExists = true;

						for(var i in fileNames){
							if(checkExists[fileNames[i]] == 0){
								allExists = false;
								break;
							}
						}

						if(allExists){
						clearTimeout(timer);
						if(watcher != null){
						watcher.close();
						}
						resolve();
						}
					}
				});



				if(executeAPKAnalysis){
					executeAPKAnalysis(apkFileName, outputDir, function(result){
						clearTimeout(timer);
						if(watcher != null){
						watcher.close();
						}

						if(!result){
							reject(new Error('analysis failed'));
						}
						else{
							resolve();
						}
					});
				}
				else{
					clearTimeout(timer);
					if(watcher != null){
					watcher.close();
					}

					reject(new Error('analysis function doesn\'t exist.'));
				}
			}

		if(alreadyExist){
		console.log("files already exist");
		setTimeout(function () {
			clearTimeout(timer);
			if(watcher){
			watcher.close();
			}
			resolve();
		}, 10);
		}
			});
		});

	}


	function checkExistsWithTimeout1(executeAPKAnalysis, apkFileName, outputDir, timeout = 3 * 60 * 60 * 1000) {

		return new Promise(function (resolve, reject) {

			var apkName = apkFileName.replace(/\.apk/g, "");

			var dir = outputDir +"/"+apkName;

			var fileNames = ["gator-handlers.txt", "android-analysis-output.json"];

			/* parameters in project object are supposed to change to the local path */
			var project = {
                "reportDir": outputDir,
                "repoDir": outputDir,
                "path": outputDir + "/" + apkName,
                "modelFile": "android-analysis-output.json",
                "stimulusFile": "gator-handlers.txt",
                "tag": apkName,
                "apkFileName":apkFileName,
                "logFile":"filtered_android_log.txt",
                "useCaseRec":"record.txt",
                "clusterConfig": "S1W1L1"
            }

			mkdirp(dir, function(err) {
				      // to generate svg file.

			  	if(err){
			  		console.log('error in creating output folder');

			  		reject(new Error('error in creating output folder.'));

			  		return;
			  	}

				var watcher = null;
				var timer = setTimeout(function () {
					if(watcher != null){
						watcher.close();
					}
					reject(new Error('File did not exists and was not created during the timeout.'));
				}, timeout);

				var alreadyExist = true;
				try{
					for(var i in fileNames){
					   console.log("check file existence: "+fileNames[i]);
					   require('fs').accessSync(dir+"/"+fileNames[i], fs.R_OK | fs.W_OK)
					}
				}catch(e){
	            // console.log("watch on files...");
					alreadyExist = false;
					var checkExists = {};
					for(var i in fileNames){
						checkExists[fileNames[i]] = 0;
					}
					watcher = fs.watch(dir, function (eventType, filename) {
						if (eventType === 'change') {
	            // console.log(filename+" has changed");
							checkExists[filename] = 1;
							var allExists = true;

							for(var i in fileNames){
								if(checkExists[fileNames[i]] == 0){
									allExists = false;
									break;
								}
							}

							if(allExists){
								clearTimeout(timer);
								if(watcher != null){
									watcher.close();
								}
								resolve(project);
							}
						}
					});


					if(executeAPKAnalysis){
						executeAPKAnalysis(apkFileName, dir, function(result){
							clearTimeout(timer);
							if(watcher != null){
								watcher.close();
							}

							if(!result){
								reject(new Error('analysis failed'));
							}
							else{
								resolve(project);
							}
						});
					}
					else{
						clearTimeout(timer);
						if(watcher != null){
							watcher.close();
						}

						reject(new Error('analysis function doesn\'t exist.'));
					}
				}

				if(alreadyExist){
					console.log("files already exist");
					setTimeout(function () {
						clearTimeout(timer);
						if(watcher){
							watcher.close();
						}
						resolve(project);
					}, 10);
				}
			});
		});
	}


	module.exports = {
		generateAndroidAnalysis: generateAndroidAnalysis
	}
}())
