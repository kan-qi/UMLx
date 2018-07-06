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
					TL: [3,5,10]
				},
				weights:[
					10, 15, 20
				]
			},
			swtii: {
				classification:{
					TD: [2,7,10],
					TL: [3,5,10],
				},
				weights:[
					[9, 12, 18],
					[10, 15, 20],
					[12, 19, 22]
				]
			},
			swtiii: {
				classification:{
					DETs: [3,8,15],
					TD: [2,7,10],
					TL: [3,5,10]
				},
				weights:[
					[[7, 9, 14], [9, 12, 19],[11, 15, 19]],
					[[9, 12, 18], [10, 15, 20], [12, 19, 22]],
					[[11, 14, 19], [11, 16, 21], [14, 21, 28]]
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
			dimensionIndex++;
			var dimensionLevels = classification[i];
			for(var j in dimensionLevels){
				if(dimensions[i] <= dimensionLevels[j]){
					levelsOfDimension[dimensionIndex] = j;
					break;
				}
			}
		}
		
		console.log(levelsOfDimension);
		
		var weights = weightingSchema.weights;
		for(var i in levelsOfDimension){
			weights = weights[levelsOfDimension[i]];
		}
		
		console.log(weights);
		
		return weights;
	}
	
	/*
	 * test cases
	 */
	
//	determineTransactionWeight({DETs: 2, TD: 8, TL: 4}, "swtiii");
//	determineTransactionWeight({TL: 4}, "swti");
//	determineTransactionWeight({TD: 8, TL: 4}, "swtii");
	
	function loadModelEmpirics(modelLoad, modelInfo, modelId){
		
		modelInfo['UseCasePointData'] = {
			COCOMONormalizedEffort : 0,
			UUCW:0,
			UAW:0,
			TCF:1,
			EF:1,
			Effort_Norm_UCP : 0
		};
		
		
		for(var i in modelInfo['UseCasePointData']){
			if(modelLoad[i]){
				modelInfo['UseCasePointData'][i] = Number(modelLoad[i]);
			}
		}
		
		modelInfo['UseCasePointData'].Effort_Norm_UCP = normalizeEffortForUseCasePoint(modelInfo['COCOMOData']);
}
	
	// normalise effort by cocomo.
	function normalizeEffortForUseCasePoint(cocomoData){
		//normalize effort with the equation in use case driven paper
		var effort_actual = cocomoData.Effort;
		var ksloc = cocomoData.KSLOC;
		var sf_delta = (cocomoData.SF.PREC - cocomoCalculator.COCOMO.SF.PREC.N) + 
		(cocomoData.SF.FLEX - cocomoCalculator.COCOMO.SF.FLEX.N) + 
		(cocomoData.SF.RESL - cocomoCalculator.COCOMO.SF.RESL.N);
		
		var em_delta = cocomoData.EM.PROD.RELY *
		cocomoData.EM.PROD.DATA *
		cocomoData.EM.PROD.DOCU *
		cocomoData.EM.PLAT.STOR *
		cocomoData.EM.PLAT.PVOL *
		cocomoData.EM.PERS.PLEX *
		cocomoData.EM.PROJ.TOOL *
		cocomoData.EM.PROJ.SITE *
		cocomoData.EM.PROJ.SCED ;
		
		cocomoData.Norm_Factor = 1/(em_delta*Math.pow(ksloc, 0.01*sf_delta));
		return effort_actual*cocomoData.Norm_Factor;
	}
	
	function toModelEvaluationHeader(){
//		return "UEUCW,UEUCW_ALY,UEXUCW,UEXUCW_ALY,UDUCW,UDUCW_ALY,UAW,UAW_ALY,TCF,TCF_ALY,EF,EF_ALY,EUCP,EUCP_ALY,EXUCP,EXUCP_ALY,DUCP_ALY,Effort_Norm_UCP";
//		return "UEUCW,UEXUCW,UDUCW,UAW,TCF,EF,EUCP,EXUCP,DUCP,SWTI,SWTII,SWTIII,Effort_Norm_UCP";
		return "UAW,TCF,EF,EUCP,EXUCP,DUCP,SWTI,SWTII,SWTIII,Effort_Norm_UCP";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		
		return 
//		modelInfo['UseCasePointData'].UEUCW+","+
//		modelInfo['UseCasePointData'].UEXUCW+","+
//		modelInfo['UseCasePointData'].UDUCW+","+
		modelInfo['UseCasePointData'].UAW+","+
		modelInfo['UseCasePointData'].TCF+","+
		modelInfo['UseCasePointData'].EF+","+
		modelInfo['UseCasePointData'].EUCP.toFixed(2)+","+
		modelInfo['UseCasePointData'].EXUCP.toFixed(2)+","+
		modelInfo['UseCasePointData'].DUCP.toFixed(2)+","+ //replace DUCP
		modelInfo['UseCasePointData'].SWTI.toFixed(2)+","+
		modelInfo['UseCasePointData'].SWTII.toFixed(2)+","+
		modelInfo['UseCasePointData'].SWTIII.toFixed(2)+","+ //replace DUCP
		modelInfo['UseCasePointData'].Effort_Norm_UCP.toFixed(2);
	}
	
	function toUseCaseEvaluationHeader(){
		return "SWTI,SWTII,SWTIII";
	}
	
	function toUseCaseEvaluationRow(useCaseInfo, index){
			return useCaseInfo['UseCasePointData'].SWTI+","+
			useCaseInfo['UseCasePointData'].SWTII+","+
			useCaseInfo['UseCasePointData'].SWTIII;
	}
	
	function evaluateUseCase(useCaseInfo){
		useCaseInfo['UseCasePointData'] = {}
		
		// those measurements should be take by specific evaluators.
		for(var i in useCaseInfo.Transactions){
		var transaction = useCaseInfo.Transactions[i];
			
		var TL = transaction['TransactionAnalytics'].TL;
		var DETs = transaction['TransactionAnalytics'].DETs;
		var TD = transaction['TransactionAnalytics'].TD;
		var archDiff = transaction['TransactionAnalytics'].Arch_Diff;
		
//		var swti = 10;
//		
//		var swtii = 10;
//		if(archDiff <= 4){
//			swtii = 4;
//		} else if (archDiff < 7){ 	 	
//			swtii = 10;
//		} else {
//			swtii = 15;
//		}
//		
//		var swtiii = 10;
//		if(archDiff <= 4){
//			if(DETs <= 14){
//				swtiii = 2;
//			} else if (DETs < 20){
//				swtiii = 4;
//			} else {
//				swtiii = 6;
//			}
//		} else if (archDiff < 7){
//			if(DETs <= 14){
//				swtiii = 8;
//			} else if (DETs < 20){
//				swtiii = 10;
//			} else {
//				swtiii = 14;
//			}
//		} else {
//			if(DETs <= 14){
//				swtiii = 12;
//			} else if (DETs < 20){
//				swtiii = 15;
//			} else {
//				swtiii = 18;
//			}
//		}
		
		var swti =  determineTransactionWeight({TL:TL}, "swti");
		var swtii =  determineTransactionWeight({TD: TD, TL:TL}, "swtii")
		var swtiii =  determineTransactionWeight({DETs: DETs, TD: TD, TL:TL}, "swtiii");
				
		useCaseInfo['UseCasePointData'].SWTI = swti;
		useCaseInfo['UseCasePointData'].SWTII = swtii;
		useCaseInfo['UseCasePointData'].SWTIII = swtiii;
		}
				
	}
	

	function evaluateModel(modelInfo){
//		if(!modelInfo['UseCasePointData']){
			modelInfo['UseCasePointData'] = {
			COCOMONormalizedEffort : 0,
			UUCW:0,
			UAW:0,
			TCF:1,
			EF:1,
			Effort_Norm_UCP : 0,
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
		if(useCaseInfo['UseCasePointData']){
			modelInfo['UseCasePointData'].SWTI += useCaseInfo['UseCasePointData'].SWTI;
			modelInfo['UseCasePointData'].SWTII += useCaseInfo['UseCasePointData'].SWTII;
			modelInfo['UseCasePointData'].SWTIII += useCaseInfo['UseCasePointData'].SWTIII;
		}
		}
		
		var TCF = Number(modelInfo['UseCasePointData'].TCF);
		var EF = Number(modelInfo['UseCasePointData'].EF);
		var UAW = Number(modelInfo['UseCasePointData'].UAW);
		
		modelInfo['UseCasePointData'].EUCP = (modelInfo['UseCasePointData'].SWTI+UAW)*TCF*EF;
		modelInfo['UseCasePointData'].EXUCP = (modelInfo['UseCasePointData'].SWTII+UAW)*TCF*EF;
		modelInfo['UseCasePointData'].DUCP = (modelInfo['UseCasePointData'].SWTIII+UAW)*TCF*EF;

	}
	
	function analyseRepoEvaluation(repoInfo){
		 repoInfo['UseCasePointData'] = {
				 repoUseCasePointEvaluationResultsPath : repoInfo.OutputDir+"/Model_Evaluation_Results"
		 }
		 
			mkdirp(repoInfo['UseCasePointData'].repoUseCasePointEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
						 var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/LinearRegressionForUseCasePoints.R "'+repoInfo.OutputDir+"/"+repoInfo.ModelEvaluationFileName+'" "'+repoInfo['UseCasePointData'].repoUseCasePointEvaluationResultsPath+'"';
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
		loadModelEmpirics: loadModelEmpirics,
		evaluateUseCase: evaluateUseCase,
		evaluateModel: evaluateModel,
		analyseRepoEvaluation: analyseRepoEvaluation
	}
	
	
}())