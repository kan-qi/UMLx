(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var uuidV1 = require('uuid/v1');
	var codeAnalysisUtil = require("./CodeAnalysisUtil.js");
	var stringSimilarity = require('string-similarity');
	var fileManagerUtil = require("./FileManagerUtils.js");
	
	function parseAndroidLog(logPath){
//		fs.readFile(logPath, 'utf-8', (err, str) => {
//			  if (err) throw err;
		
				var str = fileManagerUtil.readFileSync(logPath);

//				console.log("str data");
//				console.log(str);
		
			  	var data = [];
			    var lines = str.split(/\r?\n/g);
//			    console.log(lines);
			    var cols = [];
			    var lastMethodSign = "";
			    
			    for(var i = 0;i < lines.length;i++){
			        //code here using lines[i] which will give you each line
			    	var line = lines[i];

			    	if(line === ""){
			    		continue;
			    	}
			    	
			    	var tagPos = line.indexOf("V/Xlog:");
			    	
			    	if(tagPos == -1){
			    		continue;
			    	}
			    	
			    	var dataElement = JSON.parse(line.substring(tagPos+8, line.length));
			    	
//			    	console.log(dataElement);
			    	
			    	if(dataElement.methodSign !== lastMethodSign){
			    		console.log(dataElement.methodSign);
			    		data.push(dataElement);
			    	}
			    	
			    	lastMethodSign = dataElement.methodSign;
			    }
			    
			    console.log("log data");
			    console.log(lines);
			    
			    return data;
			    
//			   if(callback){
//				   callback(data);
//			   }
//		});
	}
	
	function identifyTransactions(logPath, dicComponent){
		var data = parseAndroidLog(logPath);
		
//				
//				for(var i in domainModel.Elements){
//					var element = domainModel.Elements[i];
//					console.log("processing element: "+element.Name);
//					for(var j in element.Operations){
//						var operation = element.Operations[j];
//						domainModelElementsByMethod[operation.Name] = element;
//					}
//				}
			  
			  	var dicMethodComponent = {};
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
			  				methodSigns.push(methodSign);
			  				console.log(methodSign);
			  			}
			  		}
			  	}
			  	

//				var debug = require("./DebuggerOutput.js");
//				debug.writeJson2("dicMethodComponent", dicMethodComponent);
				
				var transactions = [];
				var transaction = {
						Nodes: [],
						OutScope: false,
						TransactionStr: ""
				}
				
				var lastDomainModelElement = null;
				
//				console.log("log data");
//				console.log(data);
				
				for(var i in data){
					var dataElement = data[i];
					
					console.log("processing call: "+dataElement.methodSign);
					
//					var domainModelElement = domainModelElementsByMethod[dataElement.methodSign];
//					var domainModelElement = dicMethodComponent[dataElement.methodSign];
					
					var domainModelElement = null;
					var matches = stringSimilarity.findBestMatch(dataElement.methodSign, methodSigns);
					if(matches.bestMatch.rating > 0.9){
					domainModelElement = dicMethodComponent[matches.bestMatch.target];
					}
					
					if(domainModelElement !== null || domainModelElement == lastDomainModelElement){
						lastDomainModelElement = domainModelElement;
						continue;
					}
					
					lastDomainModelElement = domainModelElement;
					
					var activity = {
							Name: methodSign,
							_id: uuidV1(),
							Type: "activity",
							Stimulus: transaction.Nodes.length == 0? true: false,
							OutScope: false,
							Group: "System",
							Component: domainModelElement
					}
					
					transaction.Nodes.push(activity);
				}
				
				transactions.push(transaction);
				
//				console.log("transactions:");
//				console.log(transactions);
				
				var debug = require("./DebuggerOutput.js");
				debug.writeJson2("identifiedTransactions", transactions);
				
				return transactions;
				
//				if(callback){
//					callback(transactions);
//				}
//			  
//		});
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
		identifyTransactionsFile: identifyTransactionsFile
	}
}())