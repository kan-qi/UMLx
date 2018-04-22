(function() {
	// Retrieve
	
	/*
	 *  This script will call the classes within repoAnalyzer.
	 * 
	 */
	
	var classPath = "C:/Users/Kan Qi/Google Drive/ResearchSpace/Research Projects/Repo Analyser/bin/"
	var projectDir = "C:/Users/Kan Qi/Google Drive/ResearchSpace/Research Projects/UMLx";
	var umlModelEvaluator = require("../UMLEvaluator.js");
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var RScriptExec = require('../utils/RScriptUtil.js');
	
	module.exports = {
		predictEffort: function(modelInfo, umlEstimationInfo, callbackfunc){
			var estimator = umlEstimationInfo.estimator;
			var model = umlEstimationInfo.model;
			
			var predictionModel = model.replace(" ", "_")+"_"+estimator.replace(" ", "_")+"_model.rds";
		
			var command = './Rscript/EffortEstimation.R "'+predictionModel+'" "'+modelInfo.OutputDir+'/modelEvaluation.csv" "'+modelInfo.OutputDir+'"';
			
			RScriptExec.runRScript(command,function(result){
				if (!result) {
//					console.log('exec error: ' + error);
					console.log("project effort estimation error");
					if(callbackfunc){
						callbackfunc(false);
					}
				} else {
					fs.readFile(modelInfo.OutputDir+"/effort_prediction_result.json", 'utf-8', (err, str) => {
						   if (err) throw err;
//						   var results = {};
//						   var lines = str.split(/\r?\n/);
//						   for(var i in lines){
//							   var line = lines[i];
//							   line = line.replace(/\"/g, "");
//							   var valueSet = line.split(/\s+/);
//							   if(valueSet.length > 2){
//							   console.log(valueSet);
//							   results[valueSet[1]] = valueSet[2];
//							   }
//						   }
						   
//						   modelInfo.EffortEstimationResults = JSON.parse(str);
//						   modelInfo.predicted_effort = 1302;
						   
						   
//						   calculateProjectDecisions(modelInfo, modelInfo.predicted_effort);
//						    console.log(data);
						   if(callbackfunc){
							   callbackfunc(JSON.parse(str).result);
						   }
					});
//					if(callbackfunc){
//						callbackfunc("alright");
//					}
				}
			});
		},
		
		makeProjectManagementDecisions: function(modelInfo, umlEstimationInfo, projectEffort){
			//predict presonnel, schedule based on predicted effort
			//need to update
			var sizeMetric = umlEstimationInfo.sizeMetric;
			
			var estimationResults = {
					Effort: projectEffort,
					UseCases: [],
					SizeMeasurement: modelInfo['UseCasePointData'][sizeMetric]
			};
			
			var personnel = projectEffort/12;
//			calculateResourceAllocation(modelInfo, personnel);
//			modelInfo.predictedPersonnel = personnel;
			estimationResults.Personnel = personnel;
			estimationResults.Personnel_UI = personnel*modelInfo['TransactionAnalytics'].INT/modelInfo['TransactionAnalytics'].NT;
			estimationResults.Personnel_DB = personnel*modelInfo['TransactionAnalytics'].DM/modelInfo['TransactionAnalytics'].NT;
			estimationResults.Personnel_FS = personnel*modelInfo['TransactionAnalytics'].CTRL/modelInfo['TransactionAnalytics'].NT;
			
			//need to update
			var projectDuration = projectEffort/10;
			
//			modelInfo.predictedDuration = projectDuration;
//			calculateDistributedDuration(modelInfo, modelInfo.predictedDuration);
			estimationResults.Duration = projectDuration;
			
			//calculate distributions

			//distribute project effort
			for(var i in modelInfo.UseCases){
				var useCase = modelInfo.UseCases[i];
				var useCaseEstimates = {
						Name: useCase.Name,
						_id: useCase._id,
						SizeMeasurement: useCase['UseCasePointData'][sizeMetric]
				};
				
				useCaseEstimates.Effort = projectEffort/modelInfo['UseCasePointData'][sizeMetric]*useCase['UseCasePointData'][sizeMetric];
//				useCase.effort_dis_2 = projectEffort/modelInfo.UEXUCW*useCase.UEXUCW;
//				useCase.effort_dis_3 = projectEffort/modelInfo.UDUCW*useCase.UDUCW;
				
//				var useCase = modelInfo.UseCases[i];
				useCaseEstimates.Duration = projectDuration/modelInfo['UseCasePointData'][sizeMetric]*useCase['UseCasePointData'][sizeMetric];
//				useCase.duration_dist_2 = projectDuration/modelInfo.UEXUCW*useCase.UEXUCW;
//				useCase.duration_dist_3 = projectDuration/modelInfo.UDUCW*useCase.UDUCW;
				
				//distribute project effort
				
					useCaseEstimates.Personnel = personnel/modelInfo['UseCasePointData'][sizeMetric]*useCase['UseCasePointData'][sizeMetric];
//					useCase.personnel_dist_2 = personnel/modelInfo.UEXUCW*useCase.UEXUCW;
//					useCase.personnel_dist_3 = personnel/modelInfo.UDUCW*useCase.UDUCW;
					
					useCaseEstimates.Personnel_UI = useCaseEstimates.Personnel*useCase['TransactionAnalytics'].INT/useCase['TransactionAnalytics'].NT;
					useCaseEstimates.Personnel_DB = useCaseEstimates.Personnel*useCase['TransactionAnalytics'].DM/useCase['TransactionAnalytics'].NT;
					useCaseEstimates.Personnel_FS = useCaseEstimates.Personnel*useCase['TransactionAnalytics'].CTRL/useCase['TransactionAnalytics'].NT;
					
					estimationResults.UseCases.push(useCaseEstimates);
			}
			
			return estimationResults;
			
		}
		
	}
}())