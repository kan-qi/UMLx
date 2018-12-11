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
	var RScriptExec = require('../../utils/RScriptUtil.js');
	var cocomoCalculator = require('../COCOMOEvaluator/COCOMOCalculator.js');
	
	// this json object should be copied from the trained model from transaction analysis
	var transactionWeightingSchema = {
			  "EUCP": {
					// "effortAdj": [1.2161, 4.8481],
					"effortAdj": [7.0161, 4.8481],
				    "sigma": [324.5969, 1060.5522],
				    "cuts": [],
				    "levels": {
				      "l1": [1.0148, 0.1974]
				    }
				  },
				  "EXUCP": {
				    "effortAdj": [1.2916, 0.0177],
				    "sigma": [364.0211, 322.5817],
				    "cuts": {
				      "TL": ["-Inf", 4.0428, 5.332, 6.8714, "Inf"],
				      "TD": ["-Inf", 3.2188, 4.7554, 6.7221, "Inf"]
				    },
				    "levels": {
				      "l1": [1.074, 0.2151],
				      "l2": [1.1757, 0.1954],
				      "l3": [2.0107, 0.1138],
				      "l4": [3.0116, 0.1272],
				      "l5": [5.0584, 0.4764],
				      "l6": [7.5272, 1.0731],
				      "l7": [7.9949, 1.3001]
				    }
				  },
				  "DUCP": {
				    "effortAdj": [1.328, 0.0155],
				    "sigma": [349.2104, 579.8986],
				    "cuts": {
				      "TL": ["-Inf", 4.481, 6.2851, "Inf"],
				      "TD": ["-Inf", 3.7272, 5.9592, "Inf"],
				      "DETs": ["-Inf", 5.4098, 11.2135, "Inf"]
				    },
				    "levels": {
				      "l1": [1.1668, 0.3195],
				      "l2": [1.2143, 0.2107],
				      "l3": [2.0123, 0.1127],
				      "l4": [3.0138, 0.1112],
				      "l5": [5.0833, 0.4605],
				      "l6": [7.8413, 1.066],
				      "l7": [7.6141, 1.1582]
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
		return {
			level:level,
			weight:Number(levels["l"+level][0])
		}
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
		

		var debug = require("../../utils/DebuggerOutput.js");
		
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
				
		useCaseInfo['ExtendedUseCasePointData'].SWTI += swti.weight;
		useCaseInfo['ExtendedUseCasePointData'].SWTII += swtii.weight;
		useCaseInfo['ExtendedUseCasePointData'].SWTIII += swtiii.weight;
		
		debug.appendFile("use_case_rated_transactions_"+useCaseInfo._id, transaction.TransactionStr+",EUCP,"+swti.level+","+swti.weight+",EXUCP,"+swtii.level+","+swtii.weight+",DUCP,"+swtiii.level+","+swtiii.weight+"\n");
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
						 var command1 = './Rscript/LinearRegressionForUseCasePoints.R "'+repoInfo.OutputDir+"/"+repoInfo.ModelEvaluationFileName+'" "'+repoInfo['ExtendedUseCasePointData'].repoUseCasePointEvaluationResultsPath+'"';
						 RScriptExec.runRScript(command1,function(result){
								if (!result) {
//									console.log('exec error: ' + error);
									console.log('exec error: repo id=' + repoInfo._id);
									return;
								}
								
							
								console.log("Repo Evaluation were saved!");
							});
			});
	}
	
	function estimateProjectEffort(modelInfo, sizeMetric){
		return Number(modelInfo['ExtendedUseCasePointData'][sizeMetric])*Number(transactionWeightingSchema[sizeMetric].effortAdj[0]);
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