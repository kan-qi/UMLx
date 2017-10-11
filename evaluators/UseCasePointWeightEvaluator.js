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
	
	function evaluateModel(modelInfo){
		//calculate the normalized use case point effort.
		var modelAnalytics = modelInfo.ModelAnalytics;
		var modelEmpirics = modelInfo.ModelEmpirics;
		
		var ef = modelEmpirics.EF;
		var tcf = modelEmpirics.TCF;
		var effort = modelEmpirics.Effort;
		var normalizedUCEffort = effort/(ef*tcf*20);
		
		modelAnalytics.NormalizedUCEffort = normalizedUCEffort;
		
		var simpleUC = 0;
		var averageUC = 0;
		var complexUC = 0;
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			var useCaseAnalytics = useCase.UseCaseAnalytics;
			var nt = useCaseAnalytics.NT;
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
		
		modelAnalytics.SimpleUC = simpleUC;
		modelAnalytics.AverageUC = averageUC;
		modelAnalytics.ComplexUC = complexUC;
	}
	
	
	function toModelEvaluationHeader(){
		return "Simple_UC, Average_UC, Complex_UC, Normalized_UC_Effort";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		var modelAnalytics = modelInfo.ModelAnalytics;
		var modelEmpirics = modelInfo.ModelEmpirics;
	
		
		return modelAnalytics.SimpleUC+","+
		modelAnalytics.AverageUC+","+
		modelAnalytics.ComplexUC+","+
		modelAnalytics.NormalizedUCEffort;
	}
	
	function evaluateRepoForModels(repoAnalytics){
		 repoAnalytics.repoModelEvaluationResultsPath = repoAnalytics.OutputDir+"/Model_Evaluation_Results";
		 
			mkdirp(repoAnalytics.repoModelEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
						 var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/UseCasePointWeightsCalibration.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForModelsFileName+'" "'+repoAnalytics.repoModelEvaluationResultsPath+'"';	
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
		evaluateModel: evaluateModel,
		evaluateRepoForModels: evaluateRepoForModels
	}
	
	
}())