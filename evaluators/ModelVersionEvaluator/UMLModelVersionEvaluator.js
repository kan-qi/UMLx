/**
 * http://usejsdoc.org/
 * 
 * This is evaluator module works as a filter mostly to output the necessary
 * information from model analysis to model evaluation.
 * 
 * 
 * 
 */

(function() {

	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var umlFileManager = require('../UMLFileManager');

	function evaluateModel(modelInfo, callbackfunc) {
		var modelAnalytics = modelInfo.ModelAnalytics;
		// analyse use cases
	
		
		if (callbackfunc) {
		dumpModelElementsInfo(modelInfo, callbackfunc);
		}
		
		return modelAnalytics;
	}

	function evaluateRepo(repo, callbackfunc) {
		var repoAnalytics = repo.RepoAnalytics;

		if (callbackfunc) {
			dumpRepoElementsInfo(repo, callbackfunc);
		}
		
		return repoAnalytics;
	}


	function dumpModelElementsInfo(model, callbackfunc, elementNum, pathNum, entityNum, attributeNum, operationNum) {
		
		var modelVersionInfoStr = "id,model_name,update_time,number_of_paths\n"

		modelVersionInfoStr += model._id + "," + model.umlModelName + "," + model.creationTime + "," + model.ModelAnalytics.PathNum + "\n";
		for ( var i in model.Versions) {
			var version = model.Versions[i];
			modelVersionInfoStr += version._id + ","
					+ version.umlModelName + "," 
					+ version.creationTime + ","
					+ version.ModelAnalytics.PathNum + "\n";
		}
		
		// console.log(domainModelAnalytics);

		if(callbackfunc){

	
		modelAnalytics.ModelVersionInfoFileName = "model_version_info.csv";

		var files = [{fileName : modelAnalytics.ModelVersionInfoFileName , content : modelVersionInfoStr}];
		
		umlFileManager.writeFiles(modelAnalytics.OutputDir, files,function(){
			//Needs to be upgraded soon
			console.log("evaluate uml elements at model level");
			
//			var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/UMLModelElementsEvaluator/ModelElementsAnalyticsScript.R "'+modelAnalytics.OutputDir+"/"+modelAnalytics.ElementAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.PathAnalyticsFileName+'" "'+modelAnalytics.OutputDir+'/expandedPathAnalytics.csv" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.UseCaseAnalyticsFileName+'" "'+modelAnalytics.OutputDir+"/"+modelAnalytics.DomainModelAnalyticsFileName+'" "'+modelAnalytics.OutputDir+'/model_version_info.csv" "'+modelAnalytics.OutputDir+'" "."';
//			console.log(command);
//			var child = exec(command, function(error, stdout, stderr) {
//
//				if (error !== null) {
////					console.log('exec error: ' + error);
//					console.log('exec error: model id=' + modelAnalytics._id)
//					if(callbackfunc !== undefined){
//						callbackfunc(false);
//					}
//				}
//				if(callbackfunc !== undefined){
//					callbackfunc(modelAnalytics);
//				}
//			});
		})
		
		}
		
		return {
			entityAnalyticsStr: entityAnalyticsStr,
			entityNum: entityNum,
			attributeAnalyticsStr: attributeAnalyticsStr,
			attributeNum: attributeNum,
			operationAnalyticsStr: operationAnalyticsStr,
			operationNum: operationNum
		}

		
	}

	function dumpRepoElementsInfo(repo, callbackfunc) {
		
		
		var modelVersionInfoStr = "id,model_name,update_time,number_of_paths\n"

		for ( var i in repo.models) {
			
			var model = repo.models[i];
			var modelDump = dumpModelElementsInfo(model, null, elementNum, pathNum, entityNum, attributeNum, operationNum);
			
			
			modelVersionInfoStr += model._id + ","
					+ model.umlModelName + ","
					+ model.creationTime + ","
					+ model.ModelAnalytics.PathNum
					+ "\n";
			
			for ( var i in model.Versions) {
				var version = model.Versions[i];
				modelVersionInfoStr += version._id + "," + version.umlModelName
						+ "," + version.creationTime + ","
						+ version.ModelAnalytics.PathNum + "\n";
			}
		}
		

		if(callbackfunc){
		
	
		repoAnalytics.ModelVersionInfoFileName = "model_version_info.csv";
//		
		var files = [{fileName : repoAnalytics.ModelVersionInfoFileName , content : modelVersionInfoStr}];
		
		umlFileManager.writeFiles(repoAnalytics.OutputDir, files,function(){
			//Needs to be upgraded soon
			console.log("evaluate uml elements at repo level");
			var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/UMLModelElementsEvaluator/RepoElementsAnalyticsScript.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.ElementAnalyticsFileName+'" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.PathAnalyticsFileName+'" "'+repoAnalytics.OutputDir+'/expandedPathAnalytics.csv" "'+repoAnalytics.OutputDir+"/"+repoAnalytics.UseCaseAnalyticsFileName+'" "'+repoAnalytics.OutputDir+'/model_version_info.csv" "'+repoAnalytics.OutputDir+'" "."';
//			console.log('generate model Analytics');
			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {

				if (error !== null) {
//					console.log('exec error: ' + error);
					console.log('exec error: repo id=' + repoAnalytics._id)
					if(callbackfunc !== undefined){
						callbackfunc(false);
					}
				} 
				if(callbackfunc !== undefined){
					callbackfunc(repoAnalytics);
				}
			});
		})

		}
	   
	}

	module.exports = {
		evaluateRepo : evaluateRepo,
		evaluateModel : evaluateModel
	}

}())