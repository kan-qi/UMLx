/**
 * http://usejsdoc.org/
 * 
 * Integrate use case point evaluator to calculate eucp, exucp, ducp
 * 
 * Includes the methods  to calculate EUCP, EXUCP, DUCP, 
 */


(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var cocomoCalculator = require('../COCOMOEvaluator/COCOMOCalculator.js');
	
	var transactionWeightingSchema = {
			swti:{
				classification:{
					TL: [Number.NEGATIVE_INFINITY,3,5,10,Number.POSITIVE_INFINITY]
				},
				weights:[
					10, 15, 20, 30
				]
			},
			swtii: {
				classification:{
					TD: [Number.NEGATIVE_INFINITY,2,7,10,Number.POSITIVE_INFINITY],
					TL: [Number.NEGATIVE_INFINITY,3,5,10,Number.POSITIVE_INFINITY],
				},
				weights:[
					[9, 12, 18, 25],
					[10, 15, 20, 30],
					[12, 19, 22, 45],
					[15, 21, 28, 50]
				]
			},
			swtiii: {
				classification:{
					DETs: [Number.NEGATIVE_INFINITY,3,8,15,Number.POSITIVE_INFINITY],
					TD: [Number.NEGATIVE_INFINITY,2,7,10,Number.POSITIVE_INFINITY],
					TL: [Number.NEGATIVE_INFINITY,3,5,10,Number.POSITIVE_INFINITY]
				},
				weights:[
					[[7, 9, 14, 18], [9, 12, 19, 25],[11, 15, 19, 22],[13, 18, 20, 25]],
					[[9, 12, 18, 25],[10, 15, 20, 30],[12, 19, 22, 45],[15, 21, 28, 50]],
					[[11, 14, 19, 21], [11, 16, 21, 28], [14, 21, 28, 38],[18, 19, 23, 51]],
					[[12, 18, 21, 24], [14, 18, 25, 31], [18, 25, 31, 42],[21, 27, 28, 54]]
				]
			}
			};

	
	var transactionWeightingJsonFile = "./transaction_weighting_schema.json";
	
	function initEvaluator(callbackfunc){
		
		//readTransactionWeightingSchema
		fs.readFile(transactionWeightingJsonFile, 'utf-8', (err, str) => {
			   if (err) throw err;
//			    console.log(data);
			  
		});
	}
	
	
	function determineTransactionWeight(dimensions, schema){
		var weightingSchema = transactionWeightingSchema[schema];
		var classification = weightingSchema.classification;
		
		console.log(classification);
		
		var levelsOfDimension = {};
		var dimensionIndex = 0;
		for(var i in classification){
			var dimensionLevels = classification[i];
			for(var j in dimensionLevels){
				if(dimensions[i] <= dimensionLevels[j]){
					levelsOfDimension[dimensionIndex] = j-1;
					break;
				}
			}
			dimensionIndex++;
		}
		
		console.log(levelsOfDimension);
		
		var weights = weightingSchema.weights;
		for(var i in levelsOfDimension){
			console.log("weights");
			console.log(weights);
			weights = weights[levelsOfDimension[i]];
		}
		
		console.log(weights);
		
		if(weights.length){
			console.log(dimensions);
			console.log(schema);
			throw "weights";
		}
		
		return weights;
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
		
		var swti =  determineTransactionWeight({TL:TL}, "swti");
		var swtii =  determineTransactionWeight({TD: TD, TL:TL}, "swtii")
		var swtiii =  determineTransactionWeight({DETs: DETs, TD: TD, TL:TL}, "swtiii");
				
		useCaseInfo['ExtendedUseCasePointData'].SWTI = swti;
		useCaseInfo['ExtendedUseCasePointData'].SWTII = swtii;
		useCaseInfo['ExtendedUseCasePointData'].SWTIII = swtiii;
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
	

	module.exports = {
		toModelEvaluationHeader: toModelEvaluationHeader,
		toModelEvaluationRow: toModelEvaluationRow,
		toUseCaseEvaluationHeader: toUseCaseEvaluationHeader,
		toUseCaseEvaluationRow: toUseCaseEvaluationRow,
		evaluateUseCase: evaluateUseCase,
		evaluateModel: evaluateModel,
		analyseRepoEvaluation: analyseRepoEvaluation
	}
	
	
}())