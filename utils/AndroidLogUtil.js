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
	
	
	function parseAndroidLogs(logPaths, dir, startTime, endTime, callback){
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
			    	
			    	var dataElement = JSON.parse(line.substring(tagPos+7, line.length));
			    	
					var timeStamp = Number(dataElement.time);
					
					if(timeStamp < startTime || timeStamp > endTime){
			    		continue;
					}

					if(dataElement.methodSign !== lastMethodSign){
			    		methods.push(dataElement.methodSign);
			    		data.push(dataElement);
			    	}
			    	
			    	lastMethodSign = dataElement.methodSign;
					
					 }
			  }
				
				if(callback){
					callback(data);
				}
			  
		  });
	}
	
	function parseAndroidLogFolder(logFolder, startTime, endTime, callback){
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
			
	    	if(line === ""){
	    		s.resume();
	    		return;
	    	}
	    	
	    	var tagPos = line.indexOf("Xlog : ");
	    	
	    	if(tagPos == -1){
	    		s.resume();
	    		return;
	    	}
	    	
	    	var dataElement = JSON.parse(line.substring(tagPos+7, line.length));
// var dataElement = JSON.parse(line.substring(tagPos+8, line.length));
	    	
	    	
			var timeStamp = Number(dataElement.time);
			
			if(timeStamp < startTime || timeStamp > endTime){
				s.resume();
	    		return;
			}
	    	
	    	if(dataElement.methodSign !== lastMethodSign){
	    		methods.push(dataElement.methodSign);
	    		data.push(dataElement);
	    	}
	    	
	    	lastMethodSign = dataElement.methodSign;
	    	
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
	
	function identifyTransactions(logPath, dicComponent, dicComponentDomainElement, dicResponseMethodUnits, startTime, endTime, callback){

		parseAndroidLogFolder(logPath, startTime, endTime, function(data){
			
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
			  	
				var transactions = [];
				
				var transaction = null;
				
				var lastDomainModelElement = null;
				
				var ind = 0;
				
				for(var i in data){
					ind++;
					
					var dataElement = data[i];
					
					var domainModelElement = null;
					var matches = stringSimilarity.findBestMatch(dataElement.methodSign, methodSigns);
// if(matches.bestMatch.rating > 0.9){
					component = dicMethodComponent[matches.bestMatch.target];
					domainModelElement = dicComponentDomainElement[component.UUID]
// }
					
					if(domainModelElement == null || domainModelElement == lastDomainModelElement){
// lastDomainModelElement = domainModelElement;
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
				
				if(transaction != null){
					transactions.push(transaction);
				}
				
				if(callback){
					callback(transactions);
				}
		});
	}
	
	function identifyTransactionsFile(logPath, modelPath){
				var str = fileManagerUtil.readFileSync(modelPath);
				var dicComponent = JSON.parse(str);
				return identifyTransactions(logPath, dicComponent);
			  
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
	  
	   var command = "wsl.exe /mnt/f/D/ResearchSpace/ResearchProjects/UMLx/facility-tools/gator/gator a " +
	   		"-p \"/mnt/f/D/AndroidAnalysis/UMLxExperiment/APKs/"+apkFileName+"\" "+
	   		"-client GUIHierarchyPrinterClient " +
	   		"-outputDir \"/mnt/f/D/ResearchSpace/ResearchProjects/UMLx/data/GitAndroidAnalysis/batch_analysis/"+apkName+"\"";
	   
	   console.log(command);

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
		
		
	 }
	
		
		return checkExistsWithTimeout(executeAPKAnalysis, apkFileName, outputDir)

	}
	
	
	function checkExistsWithTimeout(executeAPKAnalysis, apkFileName, outputDir, timeout = 3 * 60 * 60 * 1000) {
		
		
		return new Promise(function (resolve, reject) {
			

			var apkName = apkFileName.replace(/\.apk/g, "");
			 
			var dir = outputDir +"/"+apkName;
			
			var fileNames = ["gator-handlers.txt", "android-analysis-output.json"];
				
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
