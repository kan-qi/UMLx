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
	var cocomoCalculator = require('./COCOMOCalculator.js');
	
	function initUseCasePointData(){
		return 
		
	}
	
	function loadModelEmpirics(modelLoad, modelInfo, modelId){
		
		modelInfo['UseCasePointData'] = {
			COCOMONormalizedEffort : 0,
			UUCW:0,
			UAW:0,
			TCF:0,
			EF:0,
			Effort_Norm_UCP : 0
		};
		
//		if(!modelInfo['UseCasePointData'].UseCasePoinData){
//			modelInfo['UseCasePointData'].UseCasePointData = initUseCasePointData();
//		}
//		var useCasePointData = modelInfo['UseCasePointData'].UseCasePointData;
		
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
//		var cocomoData = modelInfo.COCOMOData;
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
		return "UEUCW,UEXUCW,UDUCW,UAW,TCF,EF,EUCP,EXUCP,DUCP,Effort_Norm_UCP";
	}
	
	function toModelEvaluationRow(modelInfo, index){
//		var modelAnalytics = modelInfo.ModelAnalytics;
//		var modelInfo['UseCasePointData'] = modelInfo.ModelEmpirics;
		
//		var useCaseNormEffort = 0;
//		if(modelInfo['UseCasePointData'].UseCasePointData){
//			useCaseNormEffort = modelInfo['UseCasePointData'].UseCasePointData.Effort_Norm_UCP;
//		}
		
//		console.log(modelAnalytics);
		
		return modelInfo['UseCasePointData'].UEUCW+","+
		modelInfo['UseCasePointData'].UEXUCW+","+
		modelInfo['UseCasePointData'].UDUCW+","+
		modelInfo['UseCasePointData'].UAW+","+
		modelInfo['UseCasePointData'].TCF+","+
		modelInfo['UseCasePointData'].EF+","+
		modelInfo['UseCasePointData'].EUCP.toFixed(2)+","+
		modelInfo['UseCasePointData'].EXUCP.toFixed(2)+","+
		modelInfo['UseCasePointData'].DUCP.toFixed(2)+","+ //replace DUCP
		modelInfo['UseCasePointData'].Effort_Norm_UCP.toFixed(2);
	}
	
	function toUseCaseEvaluationHeader(){
//		return "UEUCW_EMP,UEUCW_ALY,UEXUCW_EMP,UEXUCW_ALY, Effort,Effort_ALY";
		return "UEUCW,UEXUCW,UDUCW,Effort";
	}
	
	function toUseCaseEvaluationRow(useCaseInfo, index){
//		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
//		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;

			return useCaseInfo['UseCasePointData'].UEUCW+","+
			useCaseInfo['UseCasePointData'].UEXUCW+","+
//			useCaseEmpirics.IT+","+
//			useCaseInfo['UseCasePointData'].IT+","+
			//UEUCW
//			useCaseEmpirics.UEXUCW+","+
			useCaseInfo['UseCasePointData'].UDUCW+","+
//			useCaseEmpirics.Effort+","+
			useCaseInfo['UseCasePointData'].Effort;
	}
	
	function evaluateUseCase(useCaseInfo){
		useCaseInfo['UseCasePointData'] = {}
		
		//evaluate UEUCW

		useCaseInfo['UseCasePointData'].UEUCW = 0;
		
		if(useCaseInfo['UseCasePointData'].TN <= 0){
			useCaseInfo['UseCasePointData'].UEUCW = 0;
		}
		else if(useCaseInfo['UseCasePointData'].TN <= 3){
			useCaseInfo['UseCasePointData'].UEUCW = 5;
		}
		else if(useCaseInfo['UseCasePointData'].TN<= 7){
			useCaseInfo['UseCasePointData'].UEUCW = 10;
		}
		else{
			useCaseInfo['UseCasePointData'].UEUCW = 15;
		}
		
		//evaluate UEXUCW
		useCaseInfo['UseCasePointData'].UEXUCW = 0;
		// merge the analytics by the levels.
		for(var j in useCaseInfo.Diagrams){
			var diagramInfo = useCaseInfo.Diagrams[j];
//			console.log(diagramInfo);
			for(var k in diagramInfo.Paths){
				var path = diagramInfo.Paths[k];
				var utw = 0;
				var doN = path.Elements.length;
				var uieN = path.boundaryNum
				
				
				if(doN <= 0){
					utw = 0;
				} else if (doN < 3){
					if(uieN < 2){
						utw = 2
					} else if(uieN < 6){
						utw = 2
					} else{
						utw = 5
					}
				} else if( doN < 8){
					if(uieN < 2){
						utw = 2
					} else if(uieN < 6){
						utw = 5
					} else{
						utw = 13
					}
				} else {
					if(uieN < 2){
						utw = 5
					} else if(uieN < 6){
						utw = 13
					} else{
						utw = 13
					}
				}
				
				path.utw = utw;
				
				//to evaluate the unadjusted transactional weight for each transaction for exucp
				var operationalCharacteristics = path['TransactionAnalytics'].Transactional;
				//check if it is a transaction
				if(operationalCharacteristics.indexOf("TRAN_NA") > -1){
					continue;
				}

				useCaseInfo['UseCasePointData'].UEXUCW += utw;
			  }
		}
			
		//evaluate DUCW
			useCaseInfo['UseCasePointData'].UDUCW = 0;
			// merge the analytics by the levels.
			for(var j in useCaseInfo['UseCasePointData'].Diagrams){
				var diagramInfo = useCaseInfo['UseCasePointData'].Diagrams[j];
//				console.log(diagramInfo);
				for(var k in diagramInfo.Paths){
					var path = diagramInfo.Paths[k];
					var utw = 0;
					var doN = path.Elements.length;
					var uieN = path.boundaryNum;
					
					if(doN <= 0){
						utw = 0;
					} else if (doN < 3){
						if(uieN < 2){
							utw = 2
						} else if(uieN < 6){
							utw = 2
						} else{
							utw = 5
						}
					} else if( doN < 8){
						if(uieN < 2){
							utw = 2
						} else if(uieN < 6){
							utw = 5
						} else{
							utw = 13
						}
					} else {
						if(uieN < 2){
							utw = 5
						} else if(uieN < 6){
							utw = 13
						} else{
							utw = 13
						}
					}
					
					var archDiff = path.archDiff;
					if(archDiff < 5){
						utw -= 1;
					}
					else if(archDiff > 6){
						utw += 2;
					}
					
					path.utw = utw;
					
					//check if it is a transaction
					//to evaluate the unadjusted transactional weight for each transaction for ducp
					var operationalCharacteristics = path['TransactionAnalytics'].Transactional;
					if(operationalCharacteristics.indexOf("TRAN_NA") > -1){
						continue;
					}

					useCaseInfo['UseCasePointData'].UDUCW += utw;
				  }
			}
	}
	

	function evaluateModel(modelInfo){
		if(!modelInfo['UseCasePointData']){
			modelInfo['UseCasePointData'] = {
			COCOMONormalizedEffort : 0,
			UUCW:0,
			UAW:0,
			TCF:0,
			EF:0,
			Effort_Norm_UCP : 0
			}
		}
		
		modelInfo['UseCasePointData'].UEUCW = 0;
		modelInfo['UseCasePointData'].EUCP = 0;
		modelInfo['UseCasePointData'].UEXUCW = 0;
		modelInfo['UseCasePointData'].EXUCP = 0;
		modelInfo['UseCasePointData'].UDUCW = 0;
		modelInfo['UseCasePointData'].DUCP = 0;
		
		
		calculateEUCP(modelInfo);
		calculateEXUCP(modelInfo);
		calculateDUCP(modelInfo);
	}
	

	function calculateEUCP(modelInfo){
		
		var UEUCW = 0;
		for(var i in modelInfo.UseCases){
		
		var useCaseInfo = modelInfo.UseCases[i];
		
//		var useCaseAnalytics = useCase.UseCaseAnalytics;
		
		UEUCW += useCaseInfo['UseCasePointData'].UEUCW;
		}
//
//		var modelInfo['UseCasePointData'] = modelInfo.ModelEmpirics;
//		var modelAnalytics = modelInfo.ModelAnalytics;
		
//		var TCF = modelAnalytics.TCF? modelAnalytics.TCF : modelInfo['UseCasePointData'].UseCasePointData.TCF;
//		var EF = modelAnalytics.EF? modelAnalytics.EF : modelInfo['UseCasePointData'].UseCasePointData.EF;
//		var UAW = modelAnalytics.UAW? modelAnalytics.UAW : modelInfo['UseCasePointData'].UseCasePoint.UAW;
		
		var TCF = Number(modelInfo['UseCasePointData'].TCF);
		var EF = Number(modelInfo['UseCasePointData'].EF);
		var UAW = Number(modelInfo['UseCasePointData'].UAW);
		
		var EUCP = (UEUCW+UAW)*TCF*EF;

//		if(!modelInfo['UseCasePointData']){
//			modelInfo['UseCasePointData'] = initUseCasePointData();
//		}
		
//		var useCasePointData = modelInfo['UseCasePointData'];

//		console.log(useCasePointData);

//		useCasePointData.TCF = TCF;
//		useCasePointData.EF = EF;
//		useCasePointData.UAW = UAW;
		modelInfo['UseCasePointData'].UEUCW = UEUCW;
		modelInfo['UseCasePointData'].EUCP = EUCP;
		
//		console.log(useCasePointData);
		
		return EUCP;
		
	}
	
	function calculateEXUCP(modelInfo){
		var UEXUCW = 0;
		for(var i in modelInfo.UseCases){
		var useCaseInfo = modelInfo.UseCases[i];
//		var useCaseAnalytics = useCase.UseCaseAnalytics;
		UEXUCW += useCaseInfo['UseCasePointData'].UEXUCW;
		}
		
//		var modelAnalytics = modelInfo.ModelAnalytics;
//		var modelInfo['UseCasePointData'] = modelInfo.ModelEmpirics;
		
//		//currently using the data from evaluations to calculate the eucp.
//		var TCF = modelAnalytics.TCF? modelAnalytics.TCF: modelInfo['UseCasePointData'].UseCasePointData.TCF;
//		var EF = modelAnalytics.EF? modelAnalytics.EF: modelInfo['UseCasePointData'].UseCasePointData.EF;
//		var UAW = modelAnalytics.UAW? modelAnalytics.UAW: modelInfo['UseCasePointData'].UseCasePointData.UAW;
//		var EXUCP = (UEXUCW+UAW)*TCF*EF;
		
		var TCF = Number(modelInfo['UseCasePointData'].TCF);
		var EF = Number(modelInfo['UseCasePointData'].EF);
		var UAW = Number(modelInfo['UseCasePointData'].UAW);
		
		var EXUCP = (UEXUCW+UAW)*TCF*EF;
		
//		var modelInfo['UseCasePointData'] = modelInfo.ModelEmpirics;
//		var modelAnalytics = modelInfo.ModelAnalytics;
		
//		if(!modelInfo['UseCasePointData']){
//			modelInfo['UseCasePointData'] = initUseCasePointData();
////			modelInfo['UseCasePointData'] = {};
//		}
		var useCasePointData = modelInfo['UseCasePointData'];
//		console.log(useCasePointData);

//		useCasePointData.TCF = TCF;
//		useCasePointData.EF = EF;
//		useCasePointData.UAW = UAW;
		modelInfo['UseCasePointData'].UEXUCW = UEXUCW;
		modelInfo['UseCasePointData'].EXUCP = EXUCP;
		
		return EXUCP;
	}
	
	function calculateDUCP(modelInfo){
		var UDUCW = 0;
		for(var i in modelInfo.UseCases){
		var useCaseInfo = modelInfo.UseCases[i];
//		var useCaseAnalytics = useCase.UseCaseAnalytics;
		UDUCW += useCaseInfo['UseCasePointData'].UDUCW;
		}
		
//		var modelAnalytics = modelInfo.ModelAnalytics;
//		var modelInfo['UseCasePointData'] = modelInfo.ModelEmpirics;
		
//		//currently using the data from evaluations to calculate the eucp.
//		var TCF = modelAnalytics.TCF? modelAnalytics.TCF: modelInfo['UseCasePointData'].UseCasePointData.TCF;
//		var EF = modelAnalytics.EF? modelAnalytics.EF: modelInfo['UseCasePointData'].UseCasePointData.EF;
//		var UAW = modelAnalytics.UAW? modelAnalytics.UAW: modelInfo['UseCasePointData'].UseCasePointData.UAW;
//		var DUCP = (UDUCW+UAW)*TCF*EF;
		
		var TCF = Number(modelInfo['UseCasePointData'].TCF);
		var EF = Number(modelInfo['UseCasePointData'].EF);
		var UAW = Number(modelInfo['UseCasePointData'].UAW);
		
		var DUCP = (UDUCW+UAW)*TCF*EF;
//		
//		var modelInfo['UseCasePointData'] = modelInfo.ModelEmpirics;
//		var modelAnalytics = modelInfo.ModelAnalytics;
		
//		if(!modelInfo['UseCasePointData']){
//			modelInfo['UseCasePointData'] = initUseCasePointData();
////			modelInfo['UseCasePointData'] = {};
//		}
//		var useCasePointData = modelInfo['UseCasePointData'];
//		console.log(useCasePointData);

//		useCasePointData.TCF = TCF;
//		useCasePointData.EF = EF;
//		useCasePointData.UAW = UAW;
		modelInfo['UseCasePointData'].UDUCW = UDUCW;
		modelInfo['UseCasePointData'].DUCP = DUCP;
		
		return DUCP;
	}
	
	function evaluateRepo(repoInfo){
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
		evaluateRepo: evaluateRepo
	}
	
	
}())