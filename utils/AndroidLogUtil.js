(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var uuidV1 = require('uuid/v1');
	var codeAnalysisUtil = require("./CodeAnalysisUtil.js");
	var stringSimilarity = require('string-similarity');
	var fileManagerUtil = require("./FileManagerUtils.js");
	
	//the log file might be very large, specical stream reader is required.
	
	var es = require('event-stream');

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
		parseAndroidLog(logPath, startTime, endTime, function(data){
//				
//				for(var i in domainModel.Elements){
//					var element = domainModel.Elements[i];
//					console.log("processing element: "+element.Name);
//					for(var j in element.Operations){
//						var operation = element.Operations[j];
//						domainModelElementsByMethod[operation.Name] = element;
//					}
//				}
			
			
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
	
	module.exports = {
		parseAndroidLog: parseAndroidLog,
		identifyTransactions: identifyTransactions,
		identifyTransactionsFile: identifyTransactionsFile,
		filterAndroidLog: filterAndroidLog
	}
}())