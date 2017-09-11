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
		return {
				COCOMONormalizedEffort : 0,
				UUCW:0,
				UAW:0,
				TCF:0,
				EF:0
			};
		
	}
	
	function loadFromModelEmpirics(modelEmpirics, model){
		
		if(!modelEmpirics.UseCasePoinData){
			modelEmpirics.UseCasePointData = initUseCasePointData();
		}
		var useCasePointData = modelEmpirics.UseCasePointData;
		
		for(var i in useCasePointData){
			if(modelEmpirics[i]){
				useCasePointData[i] = Number(modelEmpirics[i]);
			}
		}
		
		if(modelEmpirics.COCOMOData){
			var normalizedEffort = normalizeEffortForUseCasePoint(modelEmpirics.COCOMOData);
			useCasePointData.Effort_Norm_UCP = normalizedEffort;
		}
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
	
	function evaluateModel(modelInfo){
		calculateEUCP(modelInfo);
		calculateEXUCP(modelInfo);
		calculateDUCP(modelInfo);
	}
	
	// to converge use case empirics and use case analytics, dump it and evaluate it.
	function toUseCaseEvaluationHeader(useCaseInfo, index, header){
		
	}
	
	// to converge use case empirics and use case analytics, dump it and evaluate it.
	function toUseCaseEvaluationRow(useCaseInfo, index, header){
		
	}
	
	function toModelEvaluationHeader(){
		return "UEUCW,UEUCW_ALY,UEXUCW,UEXUCW_ALY,UDUCW,UDUCW_ALY,UAW,UAW_ALY,TCF,TCF_ALY,EF,EF_ALY,EUCP,EUCP_ALY,EXUCP,EXUCP_ALY,DUCP_ALY,Effort_Norm_UCP";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		var modelAnalytics = modelInfo.ModelAnalytics;
		var modelEmpirics = modelInfo.ModelEmpirics;
		
		var useCaseNormEffort = 0;
		if(modelEmpirics.UseCasePointData){
			useCaseNormEffort = modelEmpirics.UseCasePointData.Effort_Norm_UCP;
		}
		
//		console.log(modelAnalytics);
		
		return modelEmpirics.UEUCW+","+
		modelAnalytics.UseCasePointData.UEUCW+","+
		modelEmpirics.UEXUCW+","+
		modelAnalytics.UseCasePointData.UEXUCW+","+
		modelEmpirics.UDUCW+","+
		modelAnalytics.UseCasePointData.UDUCW+","+
		modelEmpirics.UAW+","+
		modelAnalytics.UAW+","+
		modelEmpirics.TCF+","+
		modelAnalytics.TCF+","+
		modelEmpirics.EF+","+
		modelAnalytics.EF+","+
		modelEmpirics.EUCP+","+
		modelAnalytics.UseCasePointData.EUCP.toFixed(2)+","+
		modelEmpirics.EXUCP+","+
		modelAnalytics.UseCasePointData.EXUCP.toFixed(2)+","+
		modelAnalytics.UseCasePointData.DUCP.toFixed(2)+","+ //replace DUCP
		useCaseNormEffort.toFixed(2);
	}
	
	function toUseCaseEvaluationHeader(){
		return "UEUCW_EMP,UEUCW_ALY,UEXUCW_EMP,UEXUCW_ALY, Effort,Effort_ALY";
	}
	
	function toUseCaseEvaluationRow(useCaseInfo, index){
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
		var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;

			return useCaseEmpirics.UEUCW+","+
			useCaseAnalytics.UEUCW+","+
//			useCaseEmpirics.IT+","+
//			useCaseAnalytics.IT+","+
			//UEUCW
			useCaseEmpirics.UEXUCW+","+
			useCaseAnalytics.UEXUCW+","+
			useCaseEmpirics.Effort+","+
			useCaseAnalytics.Effort;
	}

	function calculateEUCP(modelInfo){
		
		var UEUCW = 0;
		for(var i in modelInfo.UseCases){
		var useCase = modelInfo.UseCases[i];
		var useCaseAnalytics = useCase.UseCaseAnalytics;
		useCaseAnalytics.UEUCW = 0;

		if(useCaseAnalytics.TN <= 0){
			useCaseAnalytics.UEUCW = 0;
		}
		else if(useCaseAnalytics.TN <= 3){
			useCaseAnalytics.UEUCW = 5;
		}
		else if(useCaseAnalytics.TN<= 7){
			useCaseAnalytics.UEUCW = 10;
		}
		else{
			useCaseAnalytics.UEUCW = 15;
		}
		UEUCW += useCaseAnalytics.UEUCW;
		}

		var modelEmpirics = modelInfo.ModelEmpirics;
		var modelAnalytics = modelInfo.ModelAnalytics;
		
//		var TCF = modelAnalytics.TCF? modelAnalytics.TCF : modelEmpirics.UseCasePointData.TCF;
//		var EF = modelAnalytics.EF? modelAnalytics.EF : modelEmpirics.UseCasePointData.EF;
//		var UAW = modelAnalytics.UAW? modelAnalytics.UAW : modelEmpirics.UseCasePoint.UAW;
		
		var TCF = Number(modelEmpirics.TCF);
		var EF = Number(modelEmpirics.EF);
		var UAW = Number(modelEmpirics.UAW);
		
		var EUCP = (UEUCW+UAW)*TCF*EF;

		if(!modelAnalytics.UseCasePointData){
			modelAnalytics.UseCasePointData = initUseCasePointData();
		}
		var useCasePointData = modelAnalytics.UseCasePointData;

//		console.log(useCasePointData);

		useCasePointData.TCF = TCF;
		useCasePointData.EF = EF;
		useCasePointData.UAW = UAW;
		useCasePointData.UEUCW = UEUCW;
		useCasePointData.EUCP = EUCP;
		
//		console.log(useCasePointData);
		
		return EUCP;
		
	}
	
	function calculateEXUCP(modelInfo){
		var UEXUCW = 0;
		for(var i in modelInfo.UseCases){
		var useCase = modelInfo.UseCases[i];
		var useCaseAnalytics = useCase.UseCaseAnalytics;
		useCaseAnalytics.UEXUCW = 0;
		// merge the analytics by the levels.
		for(var j in useCaseAnalytics.Diagrams){
			var diagramAnalytics = useCaseAnalytics.Diagrams[j].DiagramAnalytics;
//			console.log(diagramAnalytics);
			for(var k in diagramAnalytics.Paths){
				var path = diagramAnalytics.Paths[k];
				var utw = 0;
				var doN = path.Elements.length;
				var uieN = path.boundaryNum
				//to evaluate the unadjusted transactional weight for each transaction for exucp
				var operationalCharacteristics = path.Operations.transactional;
				
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
				
				//check if it is a transaction
				if(operationalCharacteristics.indexOf("TRAN_NA") > -1){
					continue;
				}

				useCaseAnalytics.UEXUCW += utw;
			  }
		 	}
		   UEXUCW += useCaseAnalytics.UEXUCW;
		}
		
		var modelAnalytics = modelInfo.ModelAnalytics;
		var modelEmpirics = modelInfo.ModelEmpirics;
		
//		//currently using the data from evaluations to calculate the eucp.
//		var TCF = modelAnalytics.TCF? modelAnalytics.TCF: modelEmpirics.UseCasePointData.TCF;
//		var EF = modelAnalytics.EF? modelAnalytics.EF: modelEmpirics.UseCasePointData.EF;
//		var UAW = modelAnalytics.UAW? modelAnalytics.UAW: modelEmpirics.UseCasePointData.UAW;
//		var EXUCP = (UEXUCW+UAW)*TCF*EF;
		
		var TCF = Number(modelEmpirics.TCF);
		var EF = Number(modelEmpirics.EF);
		var UAW = Number(modelEmpirics.UAW);
		
		var EXUCP = (UEXUCW+UAW)*TCF*EF;
		
		var modelEmpirics = modelInfo.ModelEmpirics;
		var modelAnalytics = modelInfo.ModelAnalytics;
		
		if(!modelAnalytics.UseCasePointData){
			modelAnalytics.UseCasePointData = initUseCasePointData();
//			modelAnalytics.UseCasePointData = {};
		}
		var useCasePointData = modelAnalytics.UseCasePointData;
//		console.log(useCasePointData);

		useCasePointData.TCF = TCF;
		useCasePointData.EF = EF;
		useCasePointData.UAW = UAW;
		useCasePointData.UEXUCW = UEXUCW;
		useCasePointData.EXUCP = EXUCP;
		
		return EXUCP;
	}
	
	function calculateDUCP(modelInfo){
		var UDUCW = 0;
		for(var i in modelInfo.UseCases){
		var useCase = modelInfo.UseCases[i];
		var useCaseAnalytics = useCase.UseCaseAnalytics;
		useCaseAnalytics.UDUCW = 0;
		// merge the analytics by the levels.
		for(var j in useCaseAnalytics.Diagrams){
			var diagramAnalytics = useCaseAnalytics.Diagrams[j].DiagramAnalytics;
//			console.log(diagramAnalytics);
			for(var k in diagramAnalytics.Paths){
				var path = diagramAnalytics.Paths[k];
				var utw = 0;
				var doN = path.Elements.length;
				var uieN = path.boundaryNum
				//to evaluate the unadjusted transactional weight for each transaction for ducp
				var operationalCharacteristics = path.Operations.transactional;
				
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
				if(operationalCharacteristics.indexOf("TRAN_NA") > -1){
					continue;
				}

				useCaseAnalytics.UDUCW += utw;
			  }
		 	}
		   UDUCW += useCaseAnalytics.UDUCW;
		}
		
		var modelAnalytics = modelInfo.ModelAnalytics;
		var modelEmpirics = modelInfo.ModelEmpirics;
		
//		//currently using the data from evaluations to calculate the eucp.
//		var TCF = modelAnalytics.TCF? modelAnalytics.TCF: modelEmpirics.UseCasePointData.TCF;
//		var EF = modelAnalytics.EF? modelAnalytics.EF: modelEmpirics.UseCasePointData.EF;
//		var UAW = modelAnalytics.UAW? modelAnalytics.UAW: modelEmpirics.UseCasePointData.UAW;
//		var DUCP = (UDUCW+UAW)*TCF*EF;
		
		var TCF = Number(modelEmpirics.TCF);
		var EF = Number(modelEmpirics.EF);
		var UAW = Number(modelEmpirics.UAW);
		
		var DUCP = (UDUCW+UAW)*TCF*EF;
		
		var modelEmpirics = modelInfo.ModelEmpirics;
		var modelAnalytics = modelInfo.ModelAnalytics;
		
		if(!modelAnalytics.UseCasePointData){
			modelAnalytics.UseCasePointData = initUseCasePointData();
//			modelAnalytics.UseCasePointData = {};
		}
		var useCasePointData = modelAnalytics.UseCasePointData;
//		console.log(useCasePointData);

		useCasePointData.TCF = TCF;
		useCasePointData.EF = EF;
		useCasePointData.UAW = UAW;
		useCasePointData.UDUCW = UDUCW;
		useCasePointData.DUCP = DUCP;
		
		return DUCP;
	}
	
	function evaluateRepoForModels(repoAnalytics){
		 repoAnalytics.repoModelEvaluationResultsPath = repoAnalytics.OutputDir+"/Model_Evaluation_Results";
		 
			mkdirp(repoAnalytics.repoModelEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
						 var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/LinearRegressionForUseCasePoints.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForModelsFileName+'" "'+repoAnalytics.repoModelEvaluationResultsPath+'"';
							console.log(command);
							var child = exec(command, function(error, stdout, stderr) {

								if (error !== null) {
//									console.log('exec error: ' + error);
									console.log('exec error: repo id=' + repoAnalytics._id);
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
		loadFromModelEmpirics: loadFromModelEmpirics,
		evaluateModel: evaluateModel,
		evaluateRepoForModels: evaluateRepoForModels
	}
	
	
}())