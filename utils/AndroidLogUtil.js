(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var uuidV1 = require('uuid/v1');
	var codeAnalysisUtil = require("./CodeAnalysisUtil.js");
	var stringSimilarity = require('string-similarity');
	var fileManagerUtil = require("./FileManagerUtils.js");

	var exec = require('child_process').exec;
	
	//the log file might be very large, specical stream reader is required.
	
	var es = require('event-stream');
	var async = require("async");
	
	
	function parseAndroidLogs(logPaths, dir, startTime, endTime, callback){
//		var directory = path.join(__dirname, 'css');
		// can also use this function as a filter of the file.
		var lineNr = 0;

	    var lastMethodSign = "";
	    
	    const stringData = {};
	    
	    var str = "";
	    
	    var data = [];
	    
	    var methods = [];
	    
//	    console.log(logPaths);
	
		  async.eachSeries(logPaths, function (file, done) {
//		    if (!file.endsWith('.txt')) { callback(false); return;} // (1)
			console.log(file);

		    fs.stat(dir+"/"+file, function (err, stats) {
		      if(err){done(); return;}
		      
		      if (stats.isDirectory()) { done(); return;} // (2)
		      console.log("read file: "+file);
		      
//		      const chunks = [];

		      var stream = fs.createReadStream(dir+"/"+file).on('end', function () {
//		        callback(); // (3)
		    	  console.log("end file"+file);
		    	  done()
		    	  
		      }).on('data', function (data) {
//		    	console.log("data" + data.toString('utf8'));
//		    	stringData.push(data);
		    	  if(!stringData[file]){
		    		  stringData[file] = [];
		    	  }
//		    	  console.log(data);
//		    	  process.exit();
		    	  stringData[file].push(data);
		    });
		      
		  });
		  }, function () {
//		    res.end(); // (5)

			  console.log('Read entire file.')
			  
//			  str = stringData.toString('utf8'); 
	    	  
		    	// pause the readstream
			  
//			  console.log("log files");
//			  console.log(str);


					 //code here using lines[i] which will give you each line
//			    	var line = lines[i];
			  for(var i in stringData){
				  var str = Buffer.concat(stringData[i]).toString();
			  	
					 var lines = str.split(/\r?\n/g);
					 
					 for(var j in lines){
				

				    lineNr += 1;
				
					var line = lines[j];

			    	if(line === ""){
			    		continue;
			    	}
			    	
//			    	var tagPos = line.indexOf("V/Xlog:");
			    	var tagPos = line.indexOf("Xlog : ");
			    	
			    	if(tagPos == -1){
			    		continue;
			    	}
			    	
//			    	console.log(line.substring(tagPos+7, line.length));
			    	
			    	var dataElement = JSON.parse(line.substring(tagPos+7, line.length));
//			    	var dataElement = JSON.parse(line.substring(tagPos+8, line.length));
			    	
			    	
					var timeStamp = Number(dataElement.time);
					
					if(timeStamp < startTime || timeStamp > endTime){
			    		continue;
					}
					
//			    	console.log(dataElement);
			    	
			    	if(dataElement.methodSign !== lastMethodSign){
//			    		console.log(dataElement.methodSign);
			    		methods.push(dataElement.methodSign);
			    		data.push(dataElement);
//			    		data[dataElement.time] = dataElement;
			    	}
			    	
			    	lastMethodSign = dataElement.methodSign;
			    	
					// resume the readstream, possibly from a callback
//					s.resume();
			    	
					 }
					
//		      stream.pipe(res, { end: false }); // (4)
			  
			  }
				
				if(callback){
					callback(data);
				}
			  
		  });
	}
	
	function parseAndroidLogFolder(logFolder, startTime, endTime, callback){
//		var directory = path.join(__dirname, 'css');
		fs.readdir(logFolder, function (err, files) {
			
			parseAndroidLogs(files, logFolder, startTime, endTime, callback);
		  
		});
	}

	function parseAndroidLog(logPath, startTime, endTime, callback){
		// can also use this function as a filter of the file.
		var lineNr = 0;

	    var lastMethodSign = "";
	    
	    var data = [];
	    
	    var methods = [];
		
		var s = fs.createReadStream(logPath)
		.pipe(es.split())
		.pipe(es.mapSync(function(line){
			
			// pause the readstream
			s.pause();

			lineNr += 1;

			 //code here using lines[i] which will give you each line
//	    	var line = lines[i];

	    	if(line === ""){
	    		s.resume();
	    		return;
	    	}
	    	
//	    	var tagPos = line.indexOf("V/Xlog:");
	    	var tagPos = line.indexOf("Xlog : ");
	    	
	    	if(tagPos == -1){
	    		s.resume();
	    		return;
	    	}
	    	
//	    	console.log(line.substring(tagPos+7, line.length));
	    	
	    	var dataElement = JSON.parse(line.substring(tagPos+7, line.length));
//	    	var dataElement = JSON.parse(line.substring(tagPos+8, line.length));
	    	
	    	
			var timeStamp = Number(dataElement.time);
			
			if(timeStamp < startTime || timeStamp > endTime){
				s.resume();
	    		return;
			}
			
//	    	console.log(dataElement);
	    	
	    	if(dataElement.methodSign !== lastMethodSign){
//	    		console.log(dataElement.methodSign);
	    		methods.push(dataElement.methodSign);
	    		data.push(dataElement);
//	    		data[dataElement.time] = dataElement;
	    	}
	    	
	    	lastMethodSign = dataElement.methodSign;
	    	
			// resume the readstream, possibly from a callback
			s.resume();
		})
		.on('error', function(err){
			console.log('Error while reading file.', err);
			if(callback){
				callback(false);
			}
		})
		.on('end', function(){
			console.log('Read entire file.')
			if(callback){
				callback(data);
			}
		})
		);
	}
	
	function filterAndroidLog(logPath){
		// can also use this function as a filter of the file.
		console.log("filter android log");
		
		var lineNr = 0;

	    var lastMethodSign = "";

		var debuggerOutputUtil = require("./DebuggerOutput.js");
		
		var s = fs.createReadStream(logPath)
		.pipe(es.split())
		.pipe(es.mapSync(function(line){
			
			
			// pause the readstream
			s.pause();

			lineNr += 1;
			
			if(line.indexOf("getIntervalWidth()") > -1){
				s.resume();
				return;
			}
			
			debuggerOutputUtil.appendFile1("filtered_android_log", line);

	    	
			// resume the readstream, possibly from a callback
			s.resume();
		})
		.on('error', function(err){
			console.log('Error while reading file.', err);
			if(callback){
				callback(false);
			}
		})
		.on('end', function(){
			console.log('Read entire file.')
		})
		);
	}
	
//	function parseAndroidLog(logPath){
//		
//				var str = fileManagerUtil.readFileSync(logPath);
//
//			  	var data = [];
////				var data = {};
//			    var lines = str.split(/\r?\n/g);
//			    var cols = [];
//			    var lastMethodSign = "";
//			    
//			    var methods = [];
//			    
//			    for(var i = 0;i < lines.length;i++){
//			        //code here using lines[i] which will give you each line
//			    	var line = lines[i];
//
//			    	if(line === ""){
//			    		continue;
//			    	}
//			    	
////			    	var tagPos = line.indexOf("V/Xlog:");
//			    	var tagPos = line.indexOf("Xlog : ");
//			    	
//			    	if(tagPos == -1){
//			    		continue;
//			    	}
//			    	
//			    	var dataElement = JSON.parse(line.substring(tagPos+7, line.length));
////			    	var dataElement = JSON.parse(line.substring(tagPos+8, line.length));
//			    	
////			    	console.log(dataElement);
//			    	
//			    	if(dataElement.methodSign !== lastMethodSign){
////			    		console.log(dataElement.methodSign);
//			    		methods.push(dataElement.methodSign);
//			    		data.push(dataElement);
////			    		data[dataElement.time] = dataElement;
//			    	}
//			    	
//			    	lastMethodSign = dataElement.methodSign;
//			    }
//			    
//
//				var debug = require("./DebuggerOutput.js");
//				debug.writeJson("android_transaction_data", methods);
//		
//			    return data;
//	}
	
	function identifyTransactions(logPath, dicComponent, dicComponentDomainElement, dicResponseMethodUnits, startTime, endTime, callback){
//		parseAndroidLog(logPath, startTime, endTime, function(data){
//		console.log("identify transactions");
//		process.exit();
		parseAndroidLogFolder(logPath, startTime, endTime, function(data){
//				
//				for(var i in domainModel.Elements){
//					var element = domainModel.Elements[i];
//					console.log("processing element: "+element.Name);
//					for(var j in element.Operations){
//						var operation = element.Operations[j];
//						domainModelElementsByMethod[operation.Name] = element;
//					}
//				}
			
//				console.log("log data");
//				console.log(data);
//				process.exit(0);
//			
			
				if(!data){
					console.log('read log error');
					if(callback){
						callback(false);
					}
					return;
				}
			  
			  	var dicMethodComponent = {};
			  	var dicMethods = {};
			  	var methodSigns = [];
			  	
			  	console.log("establish methods for components:");
			  	
			  	for(var i in dicComponent){
			  		var component = dicComponent[i];
			  		for(var j in component.classUnits){
			  			var classUnit = component.classUnits[j];
			  			var className = classUnit.name;
			  			var packageName = classUnit.packageName;
			  			for(var k in classUnit.methodUnits){
			  				var methodUnit = classUnit.methodUnits[k];
			  				var methodSign = codeAnalysisUtil.genMethodUnitSignFull(methodUnit, className, packageName);
			  				dicMethodComponent[methodSign] = component;
			  				dicMethods[methodSign] = methodUnit;
			  				methodSigns.push(methodSign);
//			  				console.log(methodSign);
			  			}
			  		}
			  	}
			  	

				var debug = require("./DebuggerOutput.js");
//				debug.writeJson2("dicMethodComponent", dicMethodComponent);
				debug.writeJson2("methodSigns", methodSigns);
				
				var transactions = [];
				
				var transaction = null;
				
				var lastDomainModelElement = null;
				
//				console.log("log data");
//				console.log(data);
				
				var ind = 0;
				
				for(var i in data){
					ind++;
					
					var dataElement = data[i];
					
					console.log("processing call: "+dataElement.methodSign);
					
//					var domainModelElement = domainModelElementsByMethod[dataElement.methodSign];
//					var domainModelElement = dicMethodComponent[dataElement.methodSign];
					
					var domainModelElement = null;
					var matches = stringSimilarity.findBestMatch(dataElement.methodSign, methodSigns);
					console.log("best matched method:" + matches.bestMatch.target);
//					if(matches.bestMatch.rating > 0.9){
					component = dicMethodComponent[matches.bestMatch.target];
					domainModelElement = dicComponentDomainElement[component.UUID]
//					}
					
					if(domainModelElement == null || domainModelElement == lastDomainModelElement){
//						lastDomainModelElement = domainModelElement;
						continue;
					}
					
					console.log("best matched domain model element:" + domainModelElement.Name);
					
					var methodUnit = dicMethods[matches.bestMatch.target];
					
					
					if(dicResponseMethodUnits[methodUnit.UUID]){
						if(transaction != null){
							transactions.push(transaction);
						}
						transaction = {
								Nodes: [],
								OutScope: false,
								TransactionStr: ""
						}
						
					}
					
					if(!transaction){
						continue;
					}
					
					var activity = {
							Name: methodUnit.name,
//							Name: ind+"method",
							_id: uuidV1().replace(/\-/g, "_"),
							Type: "activity",
							Stimulus: transaction.Nodes.length == 0? true: false,
							OutScope: false,
							Group: "System",
							Component: domainModelElement
					}
					
					transaction.Nodes.push(activity);

					lastDomainModelElement = domainModelElement;
				}
				
//				console.log("transaction retrieved");
//				console.log(startTime);
//				console.log(endTime);
//				console.log(data);
//				console.log(transaction);
//				process.exit(0);
				
				if(transaction != null){
					transactions.push(transaction);
				}
				
//				console.log("transactions:");
//				console.log(transactions);
				
//				var debug = require("./DebuggerOutput.js");
//				debug.writeJson2("identifiedTransactions", transactions);
				
//				return transactions;
				
				if(callback){
					callback(transactions);
				}
//			  
//		});
		});
	}
	
	function identifyTransactionsFile(logPath, modelPath){
//		fs.readFile(modelPath, 'utf-8', (err, str) => {
//			  if (err) throw err;
				var str = fileManagerUtil.readFileSync(modelPath);
				var dicComponent = JSON.parse(str);
				return identifyTransactions(logPath, dicComponent);
			  
//		});
	}
	
	function generateAndroidAnalysis(apkFileName, outputDir) {
		  
	var executeAPKAnalysis = function(apkFileName, outputDir, callback){
		
	  if(!apkFileName){
		  	console.log('empty apk name');
		  	if(callback){
		  		callback(false);
		  	}
	  		return;
	  }

	  var apkName = apkFileName.replace(/\.apk/g, "");
	  
	
			  
//		var appRoot = path.dirname(require.main.filename);
//		var apkName = apkFileName.replace(/\.apk/g, "");
		
//		var command = "wsl.exe java -Xmx12G " +
//				"-cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main " +
//				"-sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid " +
//				"-sdkDir /mnt/c/Android_SDK " +
//				"-listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml " +
//				"-wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml " +
//				"-resourcePath /tmp/gator-awg1muop/res " +
//				"-manifestFile /tmp/gator-awg1muop/AndroidManifest.xml " +
//				"-project \"/mnt/f/D/AndroidAnalysis/UMLxExperiment/APKs/"+apkFileName+"\" "+
//				"-apiLevel android-26 " +
//				"-guiAnalysis " +
//				"-benchmarkName \""+apkName+"\" "+
//				"-android /mnt/c/Android_SDK/platforms/android-26/android.jar " +
//				"-client GUIHierarchyPrinterClient " +
//				"-outputDir \"/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName+"\"";

	   var command = "wsl.exe /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/gator a " +
	   		"-p \"/mnt/f/D/AndroidAnalysis/UMLxExperiment/APKs/"+apkFileName+"\" "+
	   		"-client GUIHierarchyPrinterClient " +
	   		"-outputDir \"/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName+"\"";
	   
	   console.log(command);

//	   apkOutputDir = "D:/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName;
		
		var child = exec(command,  {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
			if (error !== null) {
				// On Windows, closing the eclipse window will trigger this error
				// callbackfunc(new Error("Error generating KDM."));
				console.log("error in generating apk analysis.");
				console.log(error);
//				if(callbackfunc){
//					callbackfunc(false);
//				}
				if(callback){
			  		callback(false);
			  	}
				return;
			}
			
			if(callback){
				callback(outputDir)
			}
		});
		
		
	 }
	
		
		return checkExistsWithTimeout(executeAPKAnalysis, apkFileName, outputDir)
//			.then(function(res) {
//				
//				console.log("time out and kill");
//				child.kill();
//
//				callbackfunc(outputFiles);
//
//				console.log("android analysis is finished.")
//			})
//			.catch(function(err) {
//				callbackfunc(err);
//			});
	}
	
	
//	function generateAndroidAnalysis(apkFileName, callbackfunc) {
////		var appRoot = path.dirname(require.main.filename);
//		var apkName = apkFileName.replace(/\.apk/g, "");
//		
////		var command = "wsl.exe java -Xmx12G " +
////				"-cp /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/build/libs/sootandroid-1.0-SNAPSHOT-all.jar presto.android.Main " +
////				"-sootandroidDir /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid " +
////				"-sdkDir /mnt/c/Android_SDK " +
////				"-listenerSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/listeners.xml " +
////				"-wtgSpecFile /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/sootandroid/wtg.xml " +
////				"-resourcePath /tmp/gator-awg1muop/res " +
////				"-manifestFile /tmp/gator-awg1muop/AndroidManifest.xml " +
////				"-project \"/mnt/f/D/AndroidAnalysis/UMLxExperiment/APKs/"+apkFileName+"\" "+
////				"-apiLevel android-26 " +
////				"-guiAnalysis " +
////				"-benchmarkName \""+apkName+"\" "+
////				"-android /mnt/c/Android_SDK/platforms/android-26/android.jar " +
////				"-client GUIHierarchyPrinterClient " +
////				"-outputDir \"/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName+"\"";
//
//	   var command = "wsl.exe /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/gator a " +
//	   		"-p \"/mnt/f/D/AndroidAnalysis/UMLxExperiment/APKs/"+apkFileName+"\" "+
//	   		"-client GUIHierarchyPrinterClient " +
//	   		"-outputDir \"/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName+"\"";
//	   
//	   console.log(command);
//
//		var outputDir = "D:/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName;
//		
//		var child = exec(command,  {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
//			if (error !== null) {
//				// On Windows, closing the eclipse window will trigger this error
//				// callbackfunc(new Error("Error generating KDM."));
//				console.log("error in generating apk analysis.");
////				console.log(error);
////				if(callbackfunc){
////					callbackfunc(false);
////				}
//				return;
//			}
//			
////			if(callbackfunc){
////				callbackfunc(outputDir)
////			}
//		});
//
//		var outputDir = "D:/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName;
////		var outputFile1 = "D:/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName+"/android-analysis-output.json";
//		
//		var outputFiles = ["gator-handlers.txt", "android-analysis-output.json"];
//		
//		
//		checkExistsWithTimeout(outputFiles, outputDir, command)
//			.then(function(res) {
//				
//				console.log("time out and kill");
//				child.kill();
//
//				callbackfunc(outputFiles);
//
//				console.log("android analysis is finished.")
//			})
//			.catch(function(err) {
//				callbackfunc(err);
//			});
//	}
	
//	// helper to wait for KDM output file to exist, and have content
//	// modified from source:
//	// https://stackoverflow.com/a/47764403
//	function checkExistsWithTimeout(filePath, timeout = 100 * 1000) {
//		return new Promise(function (resolve, reject) {
//			var watcher = null;
//			var timer = setTimeout(function () {
//				if(watcher != null){
//				watcher.close();
//				}
//				reject(new Error('File did not exists and was not created during the timeout.'));
//			}, timeout);
//	
//			fs.access(filePath, fs.constants.R_OK, function (err) {
//				if (!err) {
//					clearTimeout(timer);
//					if(watcher){
//					watcher.close();
//					}
//					resolve();
//				}
//			});
//	
//			var dir = path.dirname(filePath);
//			var basename = path.basename(filePath);
//			watch = fs.watch(dir, function (eventType, filename) {
//				if (eventType === 'change' && filename === basename) {
//					clearTimeout(timer);
//					watcher.close();
//					resolve();
//				}
//			});
//		});
//	}
	
	
	// helper to wait for KDM output file to exist, and have content
	// modified from source:
	// https://stackoverflow.com/a/47764403
	function checkExistsWithTimeout(executeAPKAnalysis, apkFileName, outputDir, timeout = 3 * 60 * 60 * 1000) {
		
		
		return new Promise(function (resolve, reject) {
			

			var apkName = apkFileName.replace(/\.apk/g, "");
			 
//			var dir = "D:/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName;
			var dir = outputDir +"/"+apkName;
//			var outputFile1 = "D:/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName+"/android-analysis-output.json";
			
			var fileNames = ["gator-handlers.txt", "android-analysis-output.json"];
			
//			  apkOutputDir = outputDir + "\\" + apkName;
			  
				//  FileManagerUtil.deleteFolderRecursive(outputDir);
				
			mkdirp(dir, function(err) {
				      //to generate svg file.
				  		
				  	if(err){
				  		console.log('error in creating output folder');
//					  	if(callback){
//					  		callback(false);
//					  	}
				  		
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
				   //code to action if file exists
				}
			}catch(e){
				   //code to action if file does not exist
//				var dir = path.dirname(filePath);
//				var basename = path.basename(filePath);
				console.log("watch on files...");
				alreadyExist = false;
				var checkExists = {};
				for(var i in fileNames){
					checkExists[fileNames[i]] = 0;
				}
				watcher = fs.watch(dir, function (eventType, filename) {
					if (eventType === 'change') {
						console.log(filename+" has changed");
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
					executeAPKAnalysis(apkFileName, dir, function(result){
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
		// files exist, just return
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
	
	module.exports = {
		parseAndroidLog: parseAndroidLog,
		identifyTransactions: identifyTransactions,
		identifyTransactionsFile: identifyTransactionsFile,
		filterAndroidLog: filterAndroidLog,
		generateAndroidAnalysis: generateAndroidAnalysis
	}
}())
