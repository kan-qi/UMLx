/**
 * http://usejsdoc.org/
 *
 * This evaluator will be responsible for evaluating the basic elements of UML diagrams: class diagrams, sequence diagrams, activity diagrams, etc.
 *
 * The basic elements, for example, include:
 *
 */

(function() {

	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var RScriptExec = require('../../utils/RScriptUtil.js');
	var umlFileManager = require('../../UMLFileManager');

	// to output the header for data for the use cases.
	function toModelEvaluationHeader() {
		return "UseCase_Num,Tran_Num,Activity_Num,Component_Num,Precedence_Num,Stimulus_Num,Response_Num";
	}
	
	function toModelEvaluationRow(modelInfo, index) {

		return  modelInfo["USIMAnalytics"].UseCaseNum + ","
				+modelInfo["USIMAnalytics"].TranNum + ","
				+ modelInfo["USIMAnalytics"].ActivityNum + ","
				+ modelInfo["USIMAnalytics"].ComponentNum + ","
				+ modelInfo["USIMAnalytics"].PrecedenceNum + ","
				+ modelInfo["USIMAnalytics"].StimulusNum+","
				+ modelInfo["USIMAnalytics"].ResponseNum;
	}

	function evaluateModel(modelInfo, callbackfunc) {

		modelInfo["USIMAnalytics"] = {
				UseCaseNum : 0,
				TranNum : 0,
				ActivityNum : 0,
				ComponentNum : 0,
				PrecedenceNum : 0,
				StimulusNum : 0,
				ResponseNum: 0,
				USIMAnalyticsFileName : "USIMAnalytics.csv"
		}
		
		for ( var i in modelInfo.UseCases) {
			var useCase = modelInfo.UseCases[i];

			for ( var j in useCase.Activities) {
				var activity = useCase.Activities[j]; // tag: elements
				
				if(activity.isResponse){
					modelInfo["USIMAnalytics"].ResponseNum++;
				}
				
			}
			modelInfo["USIMAnalytics"].ActivityNum += useCase.Activities.length;
			modelInfo["USIMAnalytics"].TranNum += useCase.Transactions.length;
			modelInfo["USIMAnalytics"].StimulusNum += useCase.Transactions.length;
			modelInfo["USIMAnalytics"].PrecedenceNum += useCase.PrecedenceRelations.length;
		}
		
		modelInfo["USIMAnalytics"].UseCaseNum = modelInfo.UseCases.length;


		if(modelInfo.DomainModel){
			modelInfo["USIMAnalytics"].ComponentNum = modelInfo.DomainModel.Elements.length;
		}

		if (callbackfunc) {

			dumpModelElementsInfo(modelInfo, function(err){
			if(err){
				callbackfunc(err);
			}

			//Needs to be upgraded soon
			console.log("evaluate uml elements at model level");

			var command = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["USIMAnalytics"].USIMAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "usim_statistics.json"';
			
			
			RScriptExec.runRScript(command,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
							
			});
		});
		}

		return modelInfo["USIMAnalytics"];
	}

	function evaluateRepo(repoInfo, callbackfunc) {
		repoInfo["USIMAnalytics"] = {
				UseCaseNum : 0,
				TranNum : 0,
				ActivityNum : 0,
				ComponentNum : 0,
				PrecedenceNum : 0,
				StimulusNum : 0,
				USIMAnalyticsFileName : "USIMAnalytics.csv"
		}
	
		for ( var i in repoInfo.Models) {
			var modelInfo = repoInfo.Models[i];

			if(modelInfo["USIMAnalytics"]){
			repoInfo["USIMAnalytics"].TranNum += modelInfo["USIMAnalytics"].TranNum;
			repoInfo["USIMAnalytics"].UseCaseNum += modelInfo["USIMAnalytics"].UseCaseNum;
			repoInfo["USIMAnalytics"].ComponentNum += modelInfo["USIMAnalytics"].ComponentNum;
			repoInfo["USIMAnalytics"].PrecedenceNum += modelInfo["USIMAnalytics"].PrecedenceNum;
			repoInfo["USIMAnalytics"].StimulusNum += modelInfo["USIMAnalytics"].StimulusNum;
			repoInfo["USIMAnalytics"].ActivtyNum += modelInfo["USIMAnalytics"].ActivtyNum;
			}
		}

		if (callbackfunc) {

			dumpRepoElementsInfo(repoInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			//Needs to be upgraded soon
			console.log("evaluate uml elements at repo level");

			var command1 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["USIMAnalytics"].USIMAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "usim_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
							if(callbackfunc){
								callbackfunc(repoInfo["USIMAnalytics"]);
							}
			});

		});
		}

		return repoInfo["USIMAnalytics"];
	}

	function dumpModelElementsInfo(modelInfo, callbackfunc, modelNum) {


		modelNum = !modelNum ? 0 : modelNum;

		var usimAnalyticsStr = "";		
		
		if(modelNum == 0){
			usimAnalyticsStr += toModelEvaluationHeader(modelInfo);
		}

		usimAnalyticsStr += "\n"+toModelEvaluationRow(modelInfo);

		
		if(callbackfunc){

		var files = [
			{fileName : modelInfo["USIMAnalytics"].USIMAnalyticsFileName , content : usimAnalyticsStr}
		];

		umlFileManager.writeFiles(modelInfo.OutputDir, files, callbackfunc);
		
		}

		return {
			usimAnalyticsStr: usimAnalyticsStr,
			modelNum: modelNum,
		}

	}

	function dumpRepoElementsInfo(repoInfo, callbackfunc) {

		var usimAnalyticsStr = "";

		for ( var i in repoInfo.Models) {

			var modelInfo = repoInfo.Models[i];
			var modelDump = dumpModelElementsInfo(modelInfo, null, i);
			
			usimAnalyticsStr += modelDump.usimAnalyticsStr;
		}


		if(callbackfunc){

			var files = [
				{fileName : repoInfo["USIMAnalytics"].USIMAnalyticsFileName , content : usimAnalyticsStr}
			];
			
		umlFileManager.writeFiles(repoInfo.OutputDir, files, callbackfunc);

		}

	}


	module.exports = {
		toModelEvaluationHeader : toModelEvaluationHeader,
		toModelEvaluationRow : toModelEvaluationRow,
		evaluateRepo : evaluateRepo,
		evaluateModel : evaluateModel,
	}

}())
