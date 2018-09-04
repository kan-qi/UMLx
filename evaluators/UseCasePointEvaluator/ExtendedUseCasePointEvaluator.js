 /**
 * http://usejsdoc.org/
 * 
 * Integrate use case point evaluator to calculate eucp, exucp, ducp
 * 
 * Includes the methods  to calculate EUCP, EXUCP, DUCP.
 * 
 * Directly coding the parameters for performance consideration.
 */


(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var cocomoCalculator = require('../COCOMOEvaluator/COCOMOCalculator.js');
	
	// this json object should be copied from the trained model from transaction analysis
	var transactionWeightingSchema = {
			  "EUCP": {
				    "normFactor": 6.5385,
				    "cuts": [],
				    "levels": {
				      "l1": [1.0067, 0.0556]
				    }
				  },
				  "EXUCP": {
				    "normFactor": 0.9938,
				    "cuts": {
				      "TL": ["-Inf", 4.1256, 5.6526, 7.1796, "Inf"],
				      "TD": ["-Inf", 3.466, 5.714, 7.9619, "Inf"]
				    },
				    "levels": {
				      "l1": [1.1589, 1.0102],
				      "l2": [1.3385, 1.0156],
				      "l3": [2.2486, 0.9932],
				      "l4": [3.2167, 1.073],
				      "l5": [5.1356, 1.8595],
				      "l6": [7.8923, 2.8829],
				      "l7": [12.2764, 4.7942]
				    }
				  },
				  "DUCP": {
				    "normFactor": 0.9535,
				    "cuts": {
				      "TL": ["-Inf", 4.6775, 6.6278, "Inf"],
				      "TD": ["-Inf", 4.2785, 7.1495, "Inf"],
				      "DETs": ["-Inf", 6.5641, 15.0865, "Inf"]
				    },
				    "levels": {
				      "l1": [1.2291, 0.955],
				      "l2": [1.448, 0.9917],
				      "l3": [2.3152, 0.9518],
				      "l4": [3.2419, 1.002],
				      "l5": [5.2473, 2.1658],
				      "l6": [7.8886, 2.8567],
				      "l7": [12.1638, 5.0031]
				    }
				  }
				}





	
	var transactionWeightingJsonFile = "./transaction_weighting_schema.json";
	
	function initEvaluator(callbackfunc){
		
		//readTransactionWeightingSchema
		fs.readFile(transactionWeightingJsonFile, 'utf-8', (err, str) => {
			   if (err) throw err;
//			    console.log(data);
			  
		});
	}
	
	
//	function determineTransactionWeight(dimensions, schema){
//		var weightingSchema = transactionWeightingSchema[schema];
//		var classification = weightingSchema.classification;
//		
//		console.log(classification);
//		
//		var levelsOfDimension = {};
//		var dimensionIndex = 0;
//		for(var i in classification){
//			var dimensionLevels = classification[i];
//			for(var j in dimensionLevels){
//				if(dimensions[i] <= dimensionLevels[j]){
//					levelsOfDimension[dimensionIndex] = j-1;
//					break;
//				}
//			}
//			dimensionIndex++;
//		}
//		
//		console.log(levelsOfDimension);
//		
//		var weights = weightingSchema.weights;
//		for(var i in levelsOfDimension){
//			console.log("weights");
//			console.log(weights);
//			weights = weights[levelsOfDimension[i]];
//		}
//		
//		console.log(weights);
//		
//		if(weights.length){
//			console.log(dimensions);
//			console.log(schema);
//			throw "weights";
//		}
//		
//		return weights;
//	}
	
	function determineTransactionWeight(dimensions, schema){
		var weightingSchema = transactionWeightingSchema[schema];
		var cuts = weightingSchema.cuts;
		var levels = weightingSchema.levels;
		var dimNum = Object.keys(dimensions).length;
		var level = 0;
		for(var i in cuts){
			cutpoints = cuts[i];
			value = dimensions[i];
			for(var j in cutpoints){
				var cutpoint = cutpoints[j];
				if(cutpoint === "-Inf"){
					cutpoint = Number.NEGATIVE_INFINITY
				}
				else if(cutpoint === "Inf"){
					cutpoint = Number.POSITIVE_INFINITY;
				}
				else {
					cutpoint = Number(cutpoint);
				}
				if(value > cutpoint){
					level ++;
				}
				else{
					break;
				}
			}
		}
		
		level = level-dimNum+1;
		if(level == 0){
			level = 1;
		}
		
//		console.log(level);
//		console.log(levels);
		return Number(levels["l"+level][0]);
	}
	
	/*
	 * test cases
	 */
	
//	determineTransactionWeight({DETs: 2, TD: 8, TL: 4}, "swtiii");
//	determineTransactionWeight({TL: 9}, "swti");
//	determineTransactionWeight({TD: 13, TL: 5}, "swtii");

	function toModelEvaluationHeader(){
//		return "UEUCW,UEUCW_ALY,UEXUCW,UEXUCW_ALY,UDUCW,UDUCW_ALY,UAW,UAW_ALY,TCF,TCF_ALY,EF,EF_ALY,EUCP,EUCP_ALY,EXUCP,EXUCP_ALY,DUCP_ALY,Effort_Norm_UCP";
//		return "UEUCW,UEXUCW,UDUCW,UAW,TCF,EF,EUCP,EXUCP,DUCP,SWTI,SWTII,SWTIII,Effort_Norm_UCP";
		return "EUCP,EXUCP,DUCP,SWTI,SWTII,SWTIII";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		
		return modelInfo['ExtendedUseCasePointData'].EUCP+","+
		modelInfo['ExtendedUseCasePointData'].EXUCP+","+
		modelInfo['ExtendedUseCasePointData'].DUCP+","+ //replace DUCP
		modelInfo['ExtendedUseCasePointData'].SWTI+","+
		modelInfo['ExtendedUseCasePointData'].SWTII+","+
		modelInfo['ExtendedUseCasePointData'].SWTIII; //replace DUCP
//		modelInfo['ExtendedUseCasePointData'].Effort_Norm_UCP.toFixed(2);
	}
	
	function toUseCaseEvaluationHeader(){
		return "SWTI,SWTII,SWTIII";
	}
	
	function toUseCaseEvaluationRow(useCaseInfo, index){
			return useCaseInfo['ExtendedUseCasePointData'].SWTI+","+
			useCaseInfo['ExtendedUseCasePointData'].SWTII+","+
			useCaseInfo['ExtendedUseCasePointData'].SWTIII;
	}
	
	function evaluateUseCase(useCaseInfo){
		useCaseInfo['ExtendedUseCasePointData'] = {
				SWTI : 0,
				SWTII : 0,
				SWTIII : 0,
		}
		
		// those measurements should be take by specific evaluators.
		for(var i in useCaseInfo.Transactions){
		var transaction = useCaseInfo.Transactions[i];
			
		var TL = transaction['TransactionAnalytics'].TL;
		var DETs = transaction['TransactionAnalytics'].DETs;
		var TD = transaction['TransactionAnalytics'].TD;
		var archDiff = transaction['TransactionAnalytics'].Arch_Diff;
		
//		console.log(TL+" "+DETs+" "+TD);
		var swti =  determineTransactionWeight({}, "EUCP");
		var swtii =  determineTransactionWeight({TD: TD, TL:TL}, "EXUCP")
		var swtiii =  determineTransactionWeight({DETs: DETs, TD: TD, TL:TL}, "DUCP");
				
		useCaseInfo['ExtendedUseCasePointData'].SWTI += swti;
		useCaseInfo['ExtendedUseCasePointData'].SWTII += swtii;
		useCaseInfo['ExtendedUseCasePointData'].SWTIII += swtiii;
		}
		
				
	}
	

	function evaluateModel(modelInfo){
//		if(!modelInfo['ExtendedUseCasePointData']){
			modelInfo['ExtendedUseCasePointData'] = {
//			COCOMONormalizedEffort : 0,
//			UUCW:0,
//			UAW:0,
//			TCF:1,
//			EF:1,
//			Effort_Norm_UCP : 0,
//			UEUCW: 0,
			EUCP: 0,
//			UEXUCW: 0,
			EXUCP: 0,
//			UDUCW: 0,
			DUCP: 0,
			SWTI: 0,
			SWTII: 0,
			SWTIII: 0
			}
//		}
		
		
		
		//calculate EUCP
//		var UEUCW = 0;
		for(var i in modelInfo.UseCases){
		var useCaseInfo = modelInfo.UseCases[i];
		if(useCaseInfo['ExtendedUseCasePointData']){
			modelInfo['ExtendedUseCasePointData'].SWTI += useCaseInfo['ExtendedUseCasePointData'].SWTI;
			modelInfo['ExtendedUseCasePointData'].SWTII += useCaseInfo['ExtendedUseCasePointData'].SWTII;
			modelInfo['ExtendedUseCasePointData'].SWTIII += useCaseInfo['ExtendedUseCasePointData'].SWTIII;
		}
		}
		
		var TCF = Number(modelInfo['UseCasePointData'].TCF);
		var EF = Number(modelInfo['UseCasePointData'].EF);
		var UAW = Number(modelInfo['UseCasePointData'].UAW);
		
		modelInfo['ExtendedUseCasePointData'].EUCP = (modelInfo['ExtendedUseCasePointData'].SWTI+UAW)*TCF*EF;
		modelInfo['ExtendedUseCasePointData'].EXUCP = (modelInfo['ExtendedUseCasePointData'].SWTII+UAW)*TCF*EF;
		modelInfo['ExtendedUseCasePointData'].DUCP = (modelInfo['ExtendedUseCasePointData'].SWTIII+UAW)*TCF*EF;

	}
	
	function analyseRepoEvaluation(repoInfo){
		 repoInfo['ExtendedUseCasePointData'] = {
				 repoUseCasePointEvaluationResultsPath : repoInfo.OutputDir+"/Model_Evaluation_Results"
		 }
		 
			mkdirp(repoInfo['ExtendedUseCasePointData'].repoUseCasePointEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
						 var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/LinearRegressionForUseCasePoints.R "'+repoInfo.OutputDir+"/"+repoInfo.ModelEvaluationFileName+'" "'+repoInfo['ExtendedUseCasePointData'].repoUseCasePointEvaluationResultsPath+'"';
							console.log(command);
							var child = exec(command, function(error, stdout, stderr) {

								if (error !== null) {
//									console.log('exec error: ' + error);
									console.log('exec error: repo id=' + repoInfo._id);
								} 
								console.log("Repo Evaluation were saved!");
							});
			});
	}
	
	function estimateProjectEffort(modelInfo, sizeMetric){
		return Number(modelInfo['ExtendedUseCasePointData'][sizeMetric])*Number(transactionWeightingSchema[sizeMetric].normFactor);
	}
	

	module.exports = {
		toModelEvaluationHeader: toModelEvaluationHeader,
		toModelEvaluationRow: toModelEvaluationRow,
		toUseCaseEvaluationHeader: toUseCaseEvaluationHeader,
		toUseCaseEvaluationRow: toUseCaseEvaluationRow,
		evaluateUseCase: evaluateUseCase,
		evaluateModel: evaluateModel,
		analyseRepoEvaluation: analyseRepoEvaluation,
		estimateProjectEffort: estimateProjectEffort
	}
	
	
}())