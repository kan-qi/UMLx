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

	function parseAndroidLogsForUseCases(logPaths, dir, useCases, callback){
		var lineNr = 0;

	    var lastMethodSign = "";
	    
	    const stringData = {};
	    
	    var str = "";
	    
	    var data = [];
	    
	    var methods = [];
	    
		  async.eachSeries(logPaths, function (file, done) {

		    fs.stat(dir+"/"+file, function (err, stats) {
		      if(err){done(); return;}
		      
		      if (stats.isDirectory()) { done(); return;}
		      console.log("read file: "+file);

		      var stream = fs.createReadStream(dir+"/"+file).on('end', function () {
		    	  console.log("end file"+file);
		    	  done()
		    	  
		      }).on('data', function (data) {
		    	  if(!stringData[file]){
		    		  stringData[file] = [];
		    	  }
		    	  stringData[file].push(data);
		    });
		      
		  });
		  }, function () {

			  for(var i in stringData){
				  var str = Buffer.concat(stringData[i]).toString();
			  	
					 var lines = str.split(/\r?\n/g);
					 
					 for(var j in lines){
				

				    lineNr += 1;
				
					var line = lines[j];

			    	if(line === ""){
			    		continue;
			    	}
			    	
			    	var tagPos = line.indexOf("Xlog : ");
			    	
			    	if(tagPos == -1){
			    		continue;
			    	}
			    	
			    	var dataElement = null;
					 try {
			    	dataElement = JSON.parse(line.substring(tagPos+7, line.length));
					 } catch (e) {
						 console.error(e);
						 continue;
					}
			    	
					var timeStamp = Number(dataElement.time);
					
//					if(timeStamp < startTime || timeStamp > endTime){
//			    		continue;
//					}

//					if(dataElement.methodSign !== lastMethodSign){
//			    		methods.push(dataElement.methodSign);
//			    		data.push(dataElement);
//			    	}
//			    	
//			    	lastMethodSign = dataElement.methodSign;
			    	
			    	for(var i in useCases){
			    		var useCase = useCases[i];
						
						if(!useCase.lastMethodSign){
							useCase.lastMethodSign = "";
						}
						
						if(!useCase.calls){
							useCase.calls = new Set();
						}
						
						if(!useCase.methods){
							useCase.methods = new Set();
						}
						    
						if(timeStamp < useCase.startTime || timeStamp > useCase.endTime){
							continue;
						}
						
						if(useCase.lastMethodSign){
						var call = {
								start : useCase.lastMethodSign,
								end : dataElement.methodSign
						}
						if(dataElement.methodSign !== useCase.lastMethodSign && !useCase.calls.has(call)){
				    		useCase.methods.add(dataElement.methodSign);
				    		useCase.calls.add(call);
				    	}
						}
				    	
				    	useCase.lastMethodSign = dataElement.methodSign;
					}
			    	
					
					 }
			  }
				
				if(callback){
					callback(useCases);
				}
			  
		  });
	}
	
	
	function parseAndroidLogFolderForUseCases(logFolder, useCaseRec, callback){
		fs.readdir(logFolder, function (err, files) {
			parseAndroidLogsForUseCases(files, logFolder, useCaseRec, callback);
		  
		});
	}

	function parseAndroidLogForUseCases(logPath, useCases, callback){
		// can also use this function as a filter of the file.
		
		var lineNr = 0;
		
		var s = fs.createReadStream(logPath)
		.pipe(es.split())
		.pipe(es.mapSync(function(line){
			
			// pause the readstream
			s.pause();

			lineNr += 1;
			
	    	if(line === ""){
	    		s.resume();
	    		return;
	    	}
	    	
	    	var tagPos = line.indexOf("Xlog : ");
	    	
	    	if(tagPos == -1){
	    		s.resume();
	    		return;
	    	}
	    
			console.log("checking use case analysis");
			console.log(line.substring(tagPos+7, line.length));
			
			var dataElement = null;
			 try {
					dataElement = JSON.parse(line.substring(tagPos+7, line.length));
				  } catch (e) {
				    console.error(e);
				    s.resume();
				    return;
				  }
	    	
	    	// var dataElement = JSON.parse(line.substring(tagPos+8, line.length));
	    	
			var timeStamp = Number(dataElement.time);

			for(var i in useCases){
				var useCase = useCases[i];
				
				if(!useCase.lastMethodSign){
					useCase.lastMethodSign = "";
				}
				
				if(!useCase.calls){
					useCase.calls = new Set();
				}
				
				if(!useCase.methods){
					useCase.methods = new Set();
				}
				    
				if(timeStamp < useCase.startTime || timeStamp > useCase.endTime){
					continue;
				}
				
				if(useCase.lastMethodSign){
				var call = {
						start : useCase.lastMethodSign,
						end : dataElement.methodSign
				}
				if(dataElement.methodSign !== useCase.lastMethodSign && !useCase.calls.has(call)){
		    		useCase.methods.add(dataElement.methodSign);
		    		useCase.calls.add(call);
		    	}
				}
		    	
		    	useCase.lastMethodSign = dataElement.methodSign;
			}
	    	
			s.resume();
		})
		.on('error', function(err){
			console.log('Error while reading file.', err);
			if(callback){
				callback(useCases);
			}
//			s.resume();
		})
		.on('end', function(){
			console.log("use case analysis finishes");
			if(callback){
				callback(useCases);
			}
		})
		);
	}
	
	
	function identifyTransactions(logPath, dicComponent, dicComponentDomainElement, dicResponseMethodUnits, useCaseRec, callback){

		function identifyTransactionsFromLogData(useCaseData){

			if(!useCaseData){
				console.log('read log error');
				if(callback){
					callback(false);
				}
				return;
			}
		  
		  	var dicMethodComponent = {};
		  	var dicMethods = {};
		  	var methodSigns = [];
		  	
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
		  			}
		  		}
		  	}
			
			for(var i in useCaseData){

			var transactions = [];
				
			var transaction = null;
				
			var lastDomainModelElement = null;
				
			var ind = 0;
				
			useCaseData[i].methods.forEach(function(method){
				ind++;
				
				var domainModelElement = null;
				var matches = stringSimilarity.findBestMatch(method, methodSigns);
				// if(matches.bestMatch.rating > 0.9){
				component = dicMethodComponent[matches.bestMatch.target];
				domainModelElement = dicComponentDomainElement[component.UUID]
				// }
				
				if(domainModelElement == null){
					return;
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
					
					lastDomainModelElement = null;
				}
				else if(domainModelElement == lastDomainModelElement){
					return;
				}
				
				if(!transaction){
					return;
				}
				
				var activity = {
						Name: methodUnit.signature.name,
						_id: uuidV1().replace(/\-/g, "_"),
						Type: "activity",
						Stimulus: transaction.Nodes.length == 0? true: false,
						OutScope: false,
						Group: "System",
						Component: domainModelElement
				}
				
				transaction.Nodes.push(activity);

				lastDomainModelElement = domainModelElement;
			});
			
			if(transaction != null){
				transactions.push(transaction);
			}
			
			useCaseData[i].transactions = transactions;
			

			useCaseData[i].methods1 = Array.from(useCaseData[i].methods);
			useCaseData[i].calls1 = Array.from(useCaseData[i].calls);
			
			}
			
			if(callback){
				callback(useCaseData);
			}
			
		}
		
		if(fs.lstatSync(logPath).isDirectory()){
		parseAndroidLogFolderForUseCases(logPath, useCaseRec, function(useCaseData){
			identifyTransactionsFromLogData(useCaseData);
		});
		}
		else {
			parseAndroidLogForUseCases(logPath, useCaseRec, function(useCaseData){
				identifyTransactionsFromLogData(useCaseData);
			});
		}
	}
	
	function identifyTransactionsfromLogFile(logPath, modelPath){
		var str = fileManagerUtil.readFileSync(modelPath);
		var dicComponent = JSON.parse(str);
		return identifyTransactions(logPath, dicComponent);
	}
	
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


           var command = "java -cp \"./facility-tools/Android-toolkit/out/production/Android-toolkit:./facility-tools/Android-toolkit/libs/*\" "
           +"org.umlx.UMLxAndroidToolKit \""+apkFilePath+"\""
           +" \""+outputDir+"\"";
		   
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
		parseAndroidLogForUseCases: parseAndroidLogForUseCases,
		parseAndroidLogFolderForUseCases: parseAndroidLogFolderForUseCases,
		identifyTransactions: identifyTransactions,
		identifyTransactionsfromLogFile: identifyTransactionsfromLogFile,
		generateAndroidAnalysis: generateAndroidAnalysis
	}
}())
