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
			
			console.log("estimation command");
			console.log(command);

			
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

						   console.log(str);

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
		
		/*
		 *  This function calculate the project management decisions based on estimated effort, including the duration and personnel.
		 */
		
		makeProjectManagementDecisions: function(modelInfo, umlEstimationInfo, projectEffort){
			//predict presonnel, schedule based on predicted effort
			//need to update
			var sizeMetric = umlEstimationInfo.sizeMetric;
			var transactionMetric = umlEstimationInfo.transactionMetric;
			
			var estimationResults = {
					Effort: projectEffort,
					UseCases: [],
					SizeMeasurement: modelInfo['ExtendedUseCasePointData'][transactionMetric]
			};
			
//			calculateResourceAllocation(modelInfo, personnel);
//			modelInfo.predictedPersonnel = personnel;
			
			//need to update
//			var projectDuration = projectEffort/10;
			
			//the better way of estimating the duration by COCOMO
			/*
			 * PM_NS = A*Size^E*\prod_(i=1)^nEM_i
			 * 
			 * TDEV_NS = C*(PM_NS)^F
			 * 
			 * F = D + 0.2*0.01*\sum_(j=1)^5(SF_j)
			 * = D + 0.2*(E-B)
			 * 
			 * A = 2.94
			 * B = 0.91
			 * C = 3.67
			 * D = 0.28
			 * 
			 * P = PM_NS/TDEV_NS
			 * 
			 * 152 is for PH/PM ratio
			 */
			
//			modelInfo.predictedDuration = projectDuration;
//			calculateDistributedDuration(modelInfo, modelInfo.predictedDuration);
			
			var projectEffortInPM = projectEffort/152;
			
			var projectDuration = 3.67*(projectEffortInPM)^(0.28+0.2*(1.15-0.91))
			
			estimationResults.Duration = projectDuration;
			

//			var personnel = projectEffort/12;
			
			var personnel = projectEffortInPM/projectDuration;
			

			estimationResults.Personnel = personnel;
			estimationResults.Personnel_UI = personnel*modelInfo['TransactionAnalytics'].INT/modelInfo['TransactionAnalytics'].NT;
			estimationResults.Personnel_DB = personnel*modelInfo['TransactionAnalytics'].DM/modelInfo['TransactionAnalytics'].NT;
			estimationResults.Personnel_FS = personnel*modelInfo['TransactionAnalytics'].CTRL/modelInfo['TransactionAnalytics'].NT;
			
			
			//calculate distributions

			//distribute project effort
			for(var i in modelInfo.UseCases){
				var useCase = modelInfo.UseCases[i];
				
				var useCaseEstimates = {
						Name: useCase.Name,
						_id: useCase._id,
						SizeMeasurement: useCase['ExtendedUseCasePointData'][transactionMetric]
				};
				
				useCaseEstimates.Effort = projectEffort/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
//				useCase.effort_dis_2 = projectEffort/modelInfo.UEXUCW*useCase.UEXUCW;
//				useCase.effort_dis_3 = projectEffort/modelInfo.UDUCW*useCase.UDUCW;
				
//				var useCase = modelInfo.UseCases[i];
				useCaseEstimates.Duration = projectDuration/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
//				useCase.duration_dist_2 = projectDuration/modelInfo.UEXUCW*useCase.UEXUCW;
//				useCase.duration_dist_3 = projectDuration/modelInfo.UDUCW*useCase.UDUCW;
				
				//distribute project effort
				
					useCaseEstimates.Personnel = personnel/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
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