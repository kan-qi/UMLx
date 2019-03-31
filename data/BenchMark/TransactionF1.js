(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	var config = require("../../config.js");
	var FileManagerUtil = require("../../utils/FileManagerUtil.js");
	
	function readTransactionEvaluationResults(transactionEvaluationPath, callbackfunc){
		var transactionEvaluation = {};
		FileManagerUtil.loadCSVFile(transactionEvaluationPath, true, function(data){
//			data = [data[0]];
//			console.log(data);
			for(var i in data){
				
				var partDic = {};
				var pathStr = "";
				var record = data[i];
				var path = record['path'];
				var parts = path.split('->')
				for(var j in parts){
					if(j < 2){
						continue;
					}
					var partElements = parts[j].split(":");
					if(partElements[0].startsWith("stl#") || partDic[partElements[0]]){
						continue;
					}
					else{
						pathStr += partElements[0]+"->";
					}
					
					if(j == parts.length-1){
						pathStr += partElements[1];
					}
				}
				transactionEvaluation[pathStr] = 0;
//				console.log(transactionEvaluation);
			}
			
			if(callbackfunc){
				callbackfunc(transactionEvaluation);
			}
		})
	}
	
	function readTransactions(transactionsPath, callbackfunc){
		var transactions = {};
		FileManagerUtil.loadCSVFile(transactionsPath, true, function(data){

			for(var i in data){
				var partDic = {};
				var pathStr = "";
				var parts = [];
				var record = data[i];
				for(var j in record){
					var part = record[j];
					if(j.startsWith("Part") && part !== ""){
						parts.push(part);
					}
					
				}
				
				for(var j in parts){
					pathStr += parts[j];
					if(j != parts.length-1){
					pathStr += "->";
					}
				}
				
				transactions[pathStr] = 0;
			}
			
//			console.log(transactions);
			
			if(callbackfunc){
				callbackfunc(transactions);
			}
		})
	}
	
	function calTransactionF1(transactionEvaluationPath, transactionsPath, type){
			    readTransactionEvaluationResults(transactionEvaluationPath, function(identifiedTransactions){
			    	readTransactions(transactionsPath, function(transactions){
			    		
					    for(var i in transactions){
					    	if(identifiedTransactions[i]){
					    		identifiedTransactions[i] = 1;
					    		transactions[i] = 1;
					    	}
					    	else{
					    		identifiedTransactions[i] = 0;
					    		transactions[i] = 0;
					    	}
					    }
					    
					    //console.log(identifiedTransactions);
					    
					    var falsePositives = 0;
					    var truePositives = 0;
					    var falseNegatives = 0;
					    var total1 = 0;
					    var total2 = 0;
					    for(var i in identifiedTransactions){
					    	console.log("identified1");
					    	console.log(total1+" "+i);
					    	if(identifiedTransactions[i] == 1){
					    		truePositives++;
					    	}
					    	else{
					    		falsePositives++;
					    	}
					    	total1++;
					    }
					    
					    for(var i in transactions){
					    	console.log("identified2");
					    	console.log(total2+" "+i);
					    	if(transactions[i] == 0){
					    		falseNegatives++;
					    	}
					    	total2++;
					    }
					    
					    var precision = truePositives/total1;
					    var recall = truePositives/total2;
					    var f1 = precision+recall == 0 ? 0: 2*(precision*recall)/(precision+recall);
					    
					    console.log(precision+" "+recall+" "+f1);
				    });
			    	});
	}
	
	module.exports = {
			readTransactions: readTransactions,
			readTransactionEvaluationResults: readTransactionEvaluationResults,
			calTransactionF1:calTransactionF1
	}
})();
