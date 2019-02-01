(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var uuidV1 = require('uuid/v1');
	
	function parseAndroidLog(logPath, callback){
		fs.readFile(logPath, 'utf-8', (err, str) => {
			
			  if (err) throw err;
		
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
			    	lastMethodSign = dataElement.methodSign
			    	}
			    	
			    	data.push(dataElement);
			    }
			    
//			   console.log(data);
			    
			   if(callback){
				   callback(data);
			   }
		});
	}
	
	function identifyTransactions(logPath, modelPath, callback){
		parseAndroidLog(logPath, function(data){
			fs.readFile(modelPath, 'utf-8', (err, str) => {
				  if (err) throw err;
					var USIMInstance = JSON.parse(str);
					var domainModel = USIMInstance.DomainModel;
					var domainModelElementsByMethod = {};
					for(var i in domainModel.Elements){
						var element = domainModel.Elements[i];
						console.log("processing element: "+element.Name);
						for(var j in element.Operations){
							var operation = element.Operations[j];
							domainModelElementsByMethod[operation.Name] = element;
						}
					}
					
					var transactions = [];
					var transaction = {
							Nodes: [],
							OutScope: false,
							TransactionStr: ""
					}
					for(var i in data){
						var dataElement = data[i];
						
						console.log("processing call: "+dataElement.methodSign);
						
						var domainModelElement = domainModelElementsByMethod[dataElement.methodSign];
						if(domainModelElement !== null){
							continue;
						}
						
						var activity = {
								Name: methodSign,
								_id: uuidV1(),
								Type: "activity",
								Stimulus: transaction.Nodes.length == 0? true: false,
								OutScope: false,
								Group: System,
								Component: domainModelElement
						}
						
						transaction.Nodes.push(activity);
					}
					
					transactions.push(transaction);
					
					console.log("transactions:");
					console.log(transactions);
					
					if(callback){
						callback(transactions);
					}
				  
			});
		});
	}
	
	module.exports = {
		parseAndroidLog: parseAndroidLog,
		identifyTransactions: identifyTransactions
	}
}())