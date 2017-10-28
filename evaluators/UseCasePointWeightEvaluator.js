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
	
	
	function toModelEvaluationHeader(){
		return "Simple_UC, Average_UC, Complex_UC, Normalized_UC_Effort";
	}
	
	function toModelEvaluationRow(modelInfo, index){
//		var modelAnalytics = modelInfo.ModelAnalytics;
//		var modelEmpirics = modelInfo.ModelEmpirics;
//	
		
		return modelInfo['UCWeightCal'].SimpleUC+","+
		modelInfo['UCWeightCal'].AverageUC+","+
		modelInfo['UCWeightCal'].ComplexUC+","+
		modelInfo['UCWeightCal'].NormalizedUCEffort;
	}
	
	
	function evaluateModel(modelInfo){
		//calculate the normalized use case point effort.
//		var modelAnalytics = modelInfo.ModelAnalytics;
//		var modelEmpirics = modelInfo.ModelEmpirics;
		
		modelInfo['UCWeightCal'] = {
				EF : 0,
				TCF : 0,
				Effort : 0,
				NormalizedUCEffort : 0
		}
		
		if(modelInfo['UCWeightCalEmp']){
			modelInfo['UCWeightCal'].EF = modelInfo['UCWeightCalEmp'].EF;
			modelInfo['UCWeightCal'].TCF = modelInfo['UCWeightCalEmp'].TCF;
			modelInfo['UCWeightCal'].Effort = modelInfo['UCWeightCalEmp'].Effort;
			modelInfo['UCWeightCal'].NormalizedUCEffort = modelInfo['UCWeightCal'].Effort/(modelInfo['UCWeightCal'].EF*modelInfo['UCWeightCal'].TCF*20);
		}
		
		
		var simpleUC = 0;
		var averageUC = 0;
		var complexUC = 0;
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			var nt = useCase["ElementAnalytics"].NT;
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
		
		modelInfo['UCWeightCal'].SimpleUC = simpleUC;
		modelInfo['UCWeightCal'].AverageUC = averageUC;
		modelInfo['UCWeightCal'].ComplexUC = complexUC;
	}
	

	function evaluateRepo(repoInfo){
		 repoInfo['UCWeightCal'] = {
			repoUseCaseEvaluationResultsPath : repoInfo.OutputDir+"/Use_Case_Evaluation_Results" 
		 }
		 
			mkdirp(repoInfo['UCWeightCal'].repoUseCaseEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
						 var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/UseCasePointWeightsCalibration.R "'+repoInfo.OutputDir+"/"+repoInfo.ModelEvaluationFileName+'" "'+repoInfo['UCWeightCal'].repoUseCaseEvaluationResultsPath+'"';	
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
		evaluateRepo: evaluateRepo
	}
	
	
}())