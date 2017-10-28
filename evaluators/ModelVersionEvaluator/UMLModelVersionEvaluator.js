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
	var umlFileManager = require('../../UMLFileManager');

	function evaluateModel(modelInfo, callbackfunc) {
//		var modelAnalytics = modelInfo.ModelAnalytics;
		// analyse use cases
		
		modelInfo['ModelVersion'] = {
				ModelVersionInfoFileName : "modelVersionInfo.csv"
		}
		
		if (callbackfunc) {
		dumpModelVersionInfo(modelInfo, callbackfunc);
		}
		
//		return modelAnalytics;
		return modelInfo['ModelVersion'];
	}

	function evaluateRepo(repoInfo, callbackfunc) {
//		var repoAnalytics = repoInfo.RepoAnalytics;
		
		repoInfo['ModelVersion'] = {
				ModelVersionInfoFileName : "modelVersionInfo.csv"
		}
		
		if (callbackfunc) {
			dumpRepoVersionInfo(repoInfo, callbackfunc);
		}
		
		return repoInfo['ModelVersion'];
	}


	function dumpModelVersionInfo(modelInfo, callbackfunc, modelVersionNum) {
		modelVersionNum = !modelVersionNum ? 0 : modelVersionNum;
		
		var modelVersionInfoStr = modelVersionNum == 0 ? "id,model_name,update_time,number_of_paths\n" : "";

		modelVersionInfoStr += modelInfo._id + "," + modelInfo.Name + "," + modelInfo.creationTime + "," + modelInfo["ElementAnalytics"].PathNum + "\n";
		
		for ( var i in modelInfo.Versions) {
			var version = modelInfo.Versions[i];
			modelVersionInfoStr += version._id + ","
					+ version.Name + "," 
					+ version.creationTime + ","
					+ version["ElementAnalytics"].PathNum + "\n";
		}
		
		// console.log(domainModelAnalytics);

		if(callbackfunc){


		var files = [{fileName : modelInfo['ModelVersion'].ModelVersionInfoFileName , content : modelVersionInfoStr}];
		
		umlFileManager.writeFiles(modelInfo.OutputDir, files,function(){
			//Needs to be upgraded soon
			console.log("evaluate uml elements at model level");
			
			var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/ModelVersionEvaluator/ModelVersionAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo['ModelVersion'].ModelVersionInfoFileName+'" "'+modelInfo.OutputDir+'" "."';
			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {

				if (error !== null) {
//					console.log('exec error: ' + error);
					console.log('exec error: model id=' + modelInfo._id)
					if(callbackfunc){
						callbackfunc(false);
					}
				}
				if(callbackfunc){
					callbackfunc(modelInfo);
				}
			});
		});
		
		}
		
		return {
			modelVersionInfoStr: modelVersionInfoStr,
			modelVersionNum : modelVersionNum
		}

		
	}

	function dumpRepoVersionInfo(repoInfo, callbackfunc) {
		
		var modelVersionNum = 0;
		var modelVersionInfoStr = "";

		for ( var i in repoInfo.Models) {
			
			var modelInfo = repoInfo.Models[i];
			var modelVersionDump = dumpModelVersionInfo(modelInfo, null, modelVersionNum);
			modelVersionInfoStr += modelVersionDump.modelVersionInfoStr;
			modelVersionNum = modelVersionNum;
		}
		

		if(callbackfunc){
				
		var files = [{fileName : repoInfo['ModelVersion'].ModelVersionInfoFileName , content : modelVersionInfoStr}];
		
		umlFileManager.writeFiles(repoInfo.OutputDir, files,function(){
			//Needs to be upgraded soon
			console.log("evaluate uml elements at repo level");
			var command = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./evaluators/ModelVersionEvaluator/ModelVersionAnalyticsScript.R "'+repoInfo.OutputDir+"/"+repoInfo['ModelVersion'].ModelVersionInfoFileName+'" "'+repoInfo.OutputDir+'" "."';
//			console.log('generate model Analytics');
			console.log(command);
			var child = exec(command, function(error, stdout, stderr) {

				if (error !== null) {
//					console.log('exec error: ' + error);
					console.log('exec error: repo id=' + repoInfo._id)
					if(callbackfunc){
						callbackfunc(false);
					}
				} 
				if(callbackfunc){
					callbackfunc(repoInfo);
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