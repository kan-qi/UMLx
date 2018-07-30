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
		// this function will predict project effort in different forms
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
						// error because of the R script
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
		
		estimateUseCaseEffort: function(modelInfo, umlEstimationInfo, projectEffort){
			//predict presonnel, schedule based on predicted effort
			//need to update
			var sizeMetric = umlEstimationInfo.sizeMetric;
			var transactionMetric = umlEstimationInfo.transactionMetric;
			
			var estimationResults = {
					Effort: projectEffort.toFixed(2),
					UseCases: [],
					SizeMeasurement: modelInfo['ExtendedUseCasePointData'][sizeMetric]
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
			 * 
			 * y = 3.67*(x)^(0.28+0.2*(1.15-0.91))
			 */
			
//			modelInfo.predictedDuration = projectDuration;
//			calculateDistributedDuration(modelInfo, modelInfo.predictedDuration);
			
			var projectEffortInPM = projectEffort/152;
			
			console.log("project effort");
			console.log(projectEffortInPM);
			
			var projectDuration = 3.67*Math.pow(projectEffortInPM, 0.28+0.2*(1.15-0.91));
			
			console.log(projectDuration);
			
			estimationResults.Duration = projectDuration.toFixed(2);
			

//			var personnel = projectEffort/12;
			
			var personnel = projectEffortInPM/projectDuration;
			
			estimationResults.Personnel = personnel.toFixed(2);
			
			var personnel_UI = personnel*modelInfo['TransactionAnalytics'].INT/modelInfo['TransactionAnalytics'].NT;
			var personnel_DB = personnel*modelInfo['TransactionAnalytics'].DM/modelInfo['TransactionAnalytics'].NT;
			var personnel_FS = personnel*modelInfo['TransactionAnalytics'].CTRL/modelInfo['TransactionAnalytics'].NT;
			
			estimationResults.Personnel_UI = personnel_UI.toFixed(2);
			estimationResults.Personnel_DB = personnel_DB.toFixed(2);
			estimationResults.Personnel_FS = personnel_FS.toFixed(2);
			
			
			//calculate distributions

			//distribute project effort
			for(var i in modelInfo.UseCases){
				var useCase = modelInfo.UseCases[i];
				
				var useCaseEstimates = {
						Name: useCase.Name,
						_id: useCase._id,
						SizeMeasurement: useCase['ExtendedUseCasePointData'][transactionMetric]
				};
				
				var useCaseEffort = projectEffort/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
				
				useCaseEstimates.Effort = useCaseEffort.toFixed(2);
//				useCase.effort_dis_2 = projectEffort/modelInfo.UEXUCW*useCase.UEXUCW;
//				useCase.effort_dis_3 = projectEffort/modelInfo.UDUCW*useCase.UDUCW;
				
				var useCaseEffortInPM = useCaseEstimates.Effort/152;
				
				var useCaseDuration = 3.67*Math.pow(useCaseEffortInPM, 0.28+0.2*(1.15-0.91));
				
				useCaseEstimates.Duration = useCaseDuration.toFixed(2);

//				var personnel = projectEffort/12;
				
				var useCasePersonnel = useCaseEffortInPM/useCaseDuration;
				
//				var useCase = modelInfo.UseCases[i];
//				useCaseEstimates.Duration = projectDuration/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
			
//				useCase.duration_dist_2 = projectDuration/modelInfo.UEXUCW*useCase.UEXUCW;
//				useCase.duration_dist_3 = projectDuration/modelInfo.UDUCW*useCase.UDUCW;
				
				//distribute project effort
				
//					useCaseEstimates.Personnel = personnel/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
					useCaseEstimates.Personnel = useCasePersonnel.toFixed(2);
//					useCase.personnel_dist_2 = personnel/modelInfo.UEXUCW*useCase.UEXUCW;
//					useCase.personnel_dist_3 = personnel/modelInfo.UDUCW*useCase.UDUCW;
					
					var personnel_UI = useCaseEstimates.Personnel*useCase['TransactionAnalytics'].INT/useCase['TransactionAnalytics'].NT;
					var personnel_DB = useCaseEstimates.Personnel*useCase['TransactionAnalytics'].DM/useCase['TransactionAnalytics'].NT;
					var personnel_FS = useCaseEstimates.Personnel*useCase['TransactionAnalytics'].CTRL/useCase['TransactionAnalytics'].NT;
					
					
					useCaseEstimates.Personnel_UI = personnel_UI.toFixed(2);
					useCaseEstimates.Personnel_DB = personnel_DB.toFixed(2);
					useCaseEstimates.Personnel_FS = personnel_FS.toFixed(2);
					
					estimationResults.UseCases.push(useCaseEstimates);
			}
			

			console.log("estimation result");
			console.log(estimationResults);
			
			return estimationResults;
			
		},
		// distribute the effort to different types of components.
		estimateMVCEffort: function(modelInfo, umlEstimationInfo, projectEffort){
			var domainModelInfo = modelInfo.DomainModel;
			var viewWeight = 0;
			var modelWeight = 0;
			var controlWeight = 0;
			for(var i in domainModelInfo.Elements){
				var element = domainModelInfo.Elements[i];
				if(element.type = ""){
					viewWeight += element.methodNum;
				}
				else if(element.type = ""){
					modelWeight += element.methodNum;
				}
				else {
					controlWeight += element.methodNum;
				}
			}
			
			var totalWeight = viewWeight + controlWeight + modelWeight;
			
			modelInfo.ViewEffort = viewWeight/totalWeight*projectEffort;
			modelInfo.ModelEffort = modelWeight/totalWeight*projectEffort;
			modelInfo.ControlEffort = controlWeight/totalWeight*projectEffort;
		},
		
		// synthesize different proposals of effort estimation.
		syntehsizeEffortProposals: function(modelInfo, umlEstimationInfo, projectEffort){
			var projectManagerWeight = 0.5;
			var developerWeight = 0.2;
			var analysisWeight = 0.3;
			
			var totalSynthesizedEffort = 0;
			
			for(var i in modelInfo.UseCases){
				var useCase = modelInfo.UseCases[i];
				var useCaseEffort = useCase.Effort;
				var useCaseEfforrtProjectManager = useCase.projectManagerEffort;
				var useCaseEffortDeveloper = useCase.developerEstimate;
				useCase.synthesizedEffort = useCaseEffort*analysisWeight + useCaseEfforrtProjectManager*projectManagerWeight+useCaseEffortDeveloper*developerWeight;
			}
			
			totalSynthesizedEffort = useCaseEffort+useCaseEffortProjectManager+useCaseEffortDeveloper;
			modelInfo.TotalSynthesizedEffort = totalSynthesizedEffort;
		}
		
		
	}
}())