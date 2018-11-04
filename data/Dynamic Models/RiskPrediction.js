(function(){
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	
	var RExec = '\"C:/Program Files/R/R-3.2.5/bin/Rscript\" ./Rscript/RiskPredication.R ';
	
//	var RExec = 'Rscript ./Rscript/RiskPredication.R ';
	
	function runRiskPredictionModel(dataUrl, callbackfunc){
//		console.log('generate model Analytics');
		console.log(dataUrl);
		var child = exec(RExec+'"'+dataUrl+'"', function(error, stdout, stderr) {

			if (error) {
//				console.log('exec error: ' + error);
				console.log(error);
				if(callbackfunc){
					callbackfunc(false);
				}
			} else {
				fs.readFile("./Temp/risk-prediction-report.txt", 'utf-8', (err, str) => {
					fs.readFile("./Temp/risk-prediction-results.txt", 'utf-8', (err, resultStr) => {
					   if (err) throw err;
					   var results = [];
					   var lines = resultStr.split(/\r?\n/g);
					   var itemKeys = [];
					   console.log(lines);
					   for(var i in lines){
						   var line = lines[i];
						   if(line === ""){
							   continue;
						   }
						   console.log(line);
						   line = line.replace(/\"/g, "");
						   items = line.split(/\s+/g);
						   if(i == 0){
							   itemKeys = items;
							   continue;
						   }
						   
						   var result = {};
						   for(var j in items){
							   //skip the [1] for each row
							   if(j == 0){
								   continue;
							   }
							   result[itemKeys[j]] = items[j];
						   }
						   results.push(result);
//						   if(valueSet.length > 2){
//						   console.log(valueSet);
//						   results[valueSet[1]] = valueSet[2];
//						   }
					   }
					   console.log(results);
//					    console.log(data);
					   if(callbackfunc){
						   callbackfunc({results: results, report: str});
					   }
					});
				});
//				if(callbackfunc){
//					callbackfunc("alright");
//				}
			}
		});
	}
	
	function runTaskPredictionModelByJSON(jsonData, callbackfunc){
		var currentStatus = jsonData['current_status'];
//		currentStatus['strategy'] = "current_status";
//		var prioritizedStrategies = [];
		var expectedStatusArray = [];
		var strategies = jsonData['strategies'];
		for(var i in strategies){
			var strategy = strategies[i];
//			var name = strategy['strategy'];
			var effects = strategy['effects'];
			var expectedStatus = JSON.parse(JSON.stringify(currentStatus));
//			expectedStatus['strategy'] = name;
			for(var j in effects){
				expectedStatus[j] += effects[j];
			}
			expectedStatusArray.push(expectedStatus);
		}
		
		runRiskPredictionModelByJSON(expectedStatusArray.concat(currentStatus), function(predictionResults){
			var riskLevelForCurrentStatus = null;
			var riskLevelsForStrategies = [];
			var results = predictionResults['results'];
//			console.log(strategies)
			for(var i in results){
				if(i == results.length - 1){
					 riskLevelForCurrentStatus = results[i];
				}
				else {
					console.log(strategies[i-1]);
					results[i].strategy = strategies[i]['strategy'];
					riskLevelsForStrategies.push(results[i]);
				}
			}
			
			riskLevelsForStrategies.sort(function(a, b){
				return a.predicted - b.predicted;
			});
			
			var ratedStrategies = [];
			var priority = 0;
			var lastPredictedRiskLevel = -1;
			riskLevelsForStrategies.forEach(function(riskLevelForStrategy){
				var strategyRating = {};
				if(riskLevelForStrategy.predicted != lastPredictedRiskLevel){
					priority ++;
				}
				strategyRating[riskLevelForStrategy.strategy] = {
						priority: priority,
						riskLevel: riskLevelForStrategy.predicted
				}
				ratedStrategies.push(strategyRating);
				lastPredictedRiskLevel = riskLevelForStrategy.predicted;
			});
			
			predictionResults['results'] = [riskLevelForCurrentStatus];
			predictionResults['recommendedTasks'] = ratedStrategies;
			if(callbackfunc){
				callbackfunc(predictionResults);
			}
		});
	}
	
	
	function runRiskPredictionModelByJSON(jsonData, callbackfunc){
		var csvFilePath = "./Temp/risk-prediction-data.csv";
		var csvFileHeader = "";
		var csvFileRows = [];
		var csvFileContent = "";
		
//		console.log(jsonData);
		
		for(var i in jsonData){
			var jsonEntry = jsonData[i];
			var csvFileRow = "";
			for(var j in jsonEntry){
			if(i == 0){
			csvFileHeader += j+",";
			}
			csvFileRow += jsonEntry[j]+",";
			}

			csvFileRows.push(csvFileRow);
		}
		
		
		csvFileContent = csvFileHeader.substring(0, csvFileHeader.length-1);
		for(var i in csvFileRows){
			csvFileContent += "\n"+ csvFileRows[i].substring(0, csvFileRows[i].length-1);
		}
		
		console.log(csvFileContent);
		
		fs.writeFile(csvFilePath, csvFileContent, function(err){
			if(err){
				if(callbackfunc){
					callbackfunc(err);
				}
				return;
			}
			runRiskPredictionModel(csvFilePath, callbackfunc);
			
		});
	}
	
	
	module.exports = {
			runRiskPredictionModel: runRiskPredictionModel,
			runRiskPredictionModelByJSON: runRiskPredictionModelByJSON,
			runTaskPredictionModelByJSON: runTaskPredictionModelByJSON
	}
})();
