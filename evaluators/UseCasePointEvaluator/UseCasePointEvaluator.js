/**
 * http://usejsdoc.org/
 * 
 * Integrate use case point evaluator to calculate eucp, exucp, ducp
 * 
 * this is obsolete file, the function should be replaced by the use case point calculator.
 * 
 * Includes the methods  to calculate EUCP, EXUCP, DUCP, 
 */


(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	
	
	
	function loadModelEmpirics(modelLoad, modelInfo, modelId){
		
		modelInfo['UseCasePointData'] = {
			COCOMONormalizedEffort : 0,
			UUCW:0,
			UAW:0,
			TCF:1,
			EF:1,
			Effort_Norm_UCP : 0,
			Effort_Norm_COCOMO : 0
		};
		
		
		for(var i in modelInfo['UseCasePointData']){
			if(modelLoad[i]){
				modelInfo['UseCasePointData'][i] = Number(modelLoad[i]);
			}
		}
		
		modelInfo['UseCasePointData'].Effort_Norm_COCOMO = 0;
//		normalizeEffortForUseCasePointByCOCOMO(modelInfo);

		
		console.log("cocomo data");
		console.log(modelInfo['UseCasePointData'].Effort_Norm_COCOMO);
		
		modelInfo['UseCasePointData'].Effort_Norm_UCP = modelInfo['UseCasePointData'].Effort/(modelInfo['UseCasePointData'].EF*modelInfo['UseCasePointData'].TCF*20);
}
	
	// normalise effort by cocomo.
	function normalizeEffortForUseCasePointByCOCOMO(modelInfo){
		//normalize effort with the equation in use case driven paper
		var cocomoData = modelInfo['COCOMOData'];
		if(!cocomoData){
			return 0;
		}
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
		return "UAW,TCF,EF,Simple_UC, Average_UC, Complex_UC, Effort_Norm_UCP, Effort_Norm_COCOMO, UUCP, UCP";
	}
	
	function toModelEvaluationRow(modelInfo, index){

		return modelInfo['UseCasePointData'].UAW+","+
		modelInfo['UseCasePointData'].TCF+","+
		modelInfo['UseCasePointData'].EF+","+
		modelInfo['UseCasePointData'].SimpleUC+","+
		modelInfo['UseCasePointData'].AverageUC+","+
		modelInfo['UseCasePointData'].ComplexUC+","+
		modelInfo['UseCasePointData'].Effort_Norm_UCP+","+
		modelInfo['UseCasePointData'].Effort_Norm_COCOMO+","+
		modelInfo['UseCasePointData'].UUCP+","+
		modelInfo['UseCasePointData'].UCP;
	}
	
	
	function evaluateModel(modelInfo){
		//calculate the normalized use case point effort.
		
		if(!modelInfo['UseCasePointData']){
		modelInfo['UseCasePointData'] = {
				EF : 1,
				TCF : 1,
				UAW : 0,
				Effort : 0,
				Effort_Norm_UCP : 0,
				Effort_Norm_COCOMO : 0
		}
		}
//		
//		if(modelInfo['UseCasePointDataEmp']){
//			modelInfo['UseCasePointData'].EF = modelInfo['UseCasePointDataEmp'].EF;
//			modelInfo['UseCasePointData'].TCF = modelInfo['UseCasePointDataEmp'].TCF;
//			modelInfo['UseCasePointData'].Effort = modelInfo['UseCasePointDataEmp'].Effort;
//			modelInfo['UseCasePointData'].NormalizedUCEffort = modelInfo['UseCasePointData'].Effort/(modelInfo['UseCasePointData'].EF*modelInfo['UseCasePointData'].TCF*20);
//		}
		
//		modelInfo['UseCasePointData'] = {
//		EF : 1,
//		TCF : 1,
//		Effort : 0,
//		NormalizedUCEffort : 0
//		}
		
		
		var simpleUC = 0;
		var averageUC = 0;
		var complexUC = 0;
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			var nt = useCase["ComponentAnalytics"].TranNum;
			if(nt <= 3){
				simpleUC++;
			}
			else if(nt <= 5){
				averageUC++;
			}
			else {
				complexUC++;
			}
		}
		
		modelInfo['UseCasePointData'].SimpleUC = simpleUC;
		modelInfo['UseCasePointData'].AverageUC = averageUC;
		modelInfo['UseCasePointData'].ComplexUC = complexUC;
		
		modelInfo['UseCasePointData'].UUCP = modelInfo['UseCasePointData'].SimpleUC*5+modelInfo['UseCasePointData'].AverageUC*10+modelInfo['UseCasePointData'].ComplexUC*15+modelInfo['UseCasePointData'].UAW;
		modelInfo['UseCasePointData'].UCP = modelInfo['UseCasePointData'].UUCP*modelInfo['UseCasePointData'].EF*modelInfo['UseCasePointData'].TCF;
	}
	

	function evaluateRepo(repoInfo){
		 repoInfo['UseCasePointData'] = {
			repoUseCaseEvaluationResultsPath : repoInfo.OutputDir+"/Use_Case_Evaluation_Results" 
		 }
		 
			mkdirp(repoInfo['UseCasePointData'].repoUseCaseEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
						 var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/UseCasePointWeightsCalibration.R "'+repoInfo.OutputDir+"/"+repoInfo.ModelEvaluationFileName+'" "'+repoInfo['UseCasePointData'].repoUseCaseEvaluationResultsPath+'"';	
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
		evaluateModel: evaluateModel,
		evaluateRepo: evaluateRepo,
		loadModelEmpirics: loadModelEmpirics
	}
	
	
}())