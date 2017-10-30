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
	var mkdirp = require('mkdirp');
	var RScriptExec = require('../../utils/RScriptUtil.js');
	var umlFileManager = require('../../UMLFileManager.js');

	function evaluateModel(modelInfo, callbackfunc) {
//		var modelAnalytics = modelInfo.ModelAnalytics;
		// analyse use cases
		
		modelInfo['ModelVersion'] = {
				ModelVersionInfoFileName : "modelVersionInfo.csv"
		}
		
		if (callbackfunc) {
		dumpModelVersionInfo(modelInfo, function(err){
				//Needs to be upgraded soon
				if(err){
					console.log(err);
					callbackfunc(false);
					return;
				}
				console.log("evaluate model version info at model level");
				var command = './evaluators/ModelVersionEvaluator/ModelVersionAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo['ModelVersion'].ModelVersionInfoFileName+'" "'+modelInfo.OutputDir+'" "."';

				RScriptExec.runRScript(command,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					if(callbackfunc){
						callbackfunc(modelInfo);
					}
				});
		});
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
			dumpRepoVersionInfo(repoInfo, function(err){

					if(err){
						console.log(err);
						callbackfunc(false);
						return;
					}
					//Needs to be upgraded soon
					console.log("evaluate model version at repo level");
					var command = './evaluators/ModelVersionEvaluator/ModelVersionAnalyticsScript.R "'+repoInfo.OutputDir+"/"+repoInfo['ModelVersion'].ModelVersionInfoFileName+'" "'+repoInfo.OutputDir+'" "."';
					
					RScriptExec.runRScript(command,function(result){
						if (!result) {
//							console.log('exec error: ' + error);
//							console.log('exec error: model id=' + modelInfo._id)
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						if(callbackfunc){
							callbackfunc(repoInfo);
						}
					});
			});
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
		umlFileManager.writeFiles(modelInfo.OutputDir, files, callbackfunc);
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
			modelVersionNum = modelVersionDump.modelVersionNum;
		}
		
		if(callbackfunc){
		var files = [{fileName : repoInfo['ModelVersion'].ModelVersionInfoFileName , content : modelVersionInfoStr}];
		umlFileManager.writeFiles(repoInfo.OutputDir, files, callbackfunc)
		}
	   
	}

	module.exports = {
		evaluateRepo : evaluateRepo,
		evaluateModel : evaluateModel
	}

}())