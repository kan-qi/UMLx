(function() {
	// Retrieve
	
	/*
	 *  This script will call the classes within repoAnalyzer.
	 * 
	 */
	
	var classPath = "C:/Users/Kan Qi/Google Drive/ResearchSpace/Research Projects/Repo Analyser/bin/"
	var projectDir = "C:/Users/Kan Qi/Google Drive/ResearchSpace/Research Projects/UMLx";
	var umlModelEvaluator = require("../UMLEvaluator.js");
	var umlFileManager = require("../UMLFileManager.js");
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var RScriptExec = require('../utils/RScriptUtil.js');
	
	var predictionModel = "eucp_linear_regression_model.rds";
	var sizeMetric = "EXUCP"
	var transactionMetric = "SWTII";
	
	/*
	 *  This function calculate the project management decisions based on estimated effort, including the duration and personnel.
	 */
	
	function estimateUseCaseEffort(modelInfo, estimationResults, projectEffort){
		//predict presonnel, schedule based on predicted effort
		//need to update
//		var sizeMetric = umlEstimationInfo.sizeMetric;
//		var transactionMetric = umlEstimationInfo.transactionMetric;
		
//		calculateResourceAllocation(modelInfo, personnel);
//		modelInfo.predictedPersonnel = personnel;
		
		//need to update
//		var projectDuration = projectEffort/10;
		
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
		
//		modelInfo.predictedDuration = projectDuration;
//		calculateDistributedDuration(modelInfo, modelInfo.predictedDuration);
		
		var projectEffortInPM = projectEffort/152;
		
		console.log("project effort");
		console.log(projectEffortInPM);
		
		var projectDuration = 3.67*Math.pow(projectEffortInPM, 0.28+0.2*(1.15-0.91));
		
		console.log(projectDuration);
		
		estimationResults.Duration = projectDuration.toFixed(2);
		

//		var personnel = projectEffort/12;
		
		var personnel = projectEffortInPM/projectDuration;
		
		estimationResults.Personnel = personnel.toFixed(2);
		
		var personnel_UI = personnel*modelInfo['TransactionAnalytics'].INT/modelInfo['TransactionAnalytics'].NT;
		var personnel_DB = personnel*modelInfo['TransactionAnalytics'].DM/modelInfo['TransactionAnalytics'].NT;
		var personnel_FS = personnel*modelInfo['TransactionAnalytics'].CTRL/modelInfo['TransactionAnalytics'].NT;
		
		estimationResults.Personnel_UI = personnel_UI.toFixed(2);
		estimationResults.Personnel_DB = personnel_DB.toFixed(2);
		estimationResults.Personnel_FS = personnel_FS.toFixed(2);
		
		var useCaseEstimatesById = {};
		
		for(var i in estimationResults.UseCases){
			useCaseEstimatesById[estimationResults.UseCases[i]._id] = estimationResults.UseCases[i];
		}
		
		
		//calculate distributions

		//distribute project effort
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			
			var useCaseEstimates = useCaseEstimatesById[useCase._id];
			if(!useCaseEstimates){
				useCaseEstimatesById[useCase._id] = {
						Name: useCase.Name,
						_id: useCase._id,
				}
				useCaseEstimates = useCaseEstimatesById[useCase._id];
			}


			useCaseEstimates.SizeMeasurement = useCase['ExtendedUseCasePointData'][transactionMetric];
			
			var useCaseEffort = projectEffort/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
			
			useCaseEstimates.Effort = useCaseEffort.toFixed(2);
//			useCase.effort_dis_2 = projectEffort/modelInfo.UEXUCW*useCase.UEXUCW;
//			useCase.effort_dis_3 = projectEffort/modelInfo.UDUCW*useCase.UDUCW;
			
			var useCaseEffortInPM = useCaseEstimates.Effort/152;
			
			var useCaseDuration = 3.67*Math.pow(useCaseEffortInPM, 0.28+0.2*(1.15-0.91));
			
			useCaseEstimates.Duration = useCaseDuration.toFixed(2);

//			var personnel = projectEffort/12;
			
			var useCasePersonnel = useCaseEffortInPM/useCaseDuration;
			
//			var useCase = modelInfo.UseCases[i];
//			useCaseEstimates.Duration = projectDuration/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
		
//			useCase.duration_dist_2 = projectDuration/modelInfo.UEXUCW*useCase.UEXUCW;
//			useCase.duration_dist_3 = projectDuration/modelInfo.UDUCW*useCase.UDUCW;
			
			//distribute project effort
			
//				useCaseEstimates.Personnel = personnel/modelInfo['ExtendedUseCasePointData'][transactionMetric]*useCase['ExtendedUseCasePointData'][transactionMetric];
				useCaseEstimates.Personnel = useCasePersonnel.toFixed(2);
//				useCase.personnel_dist_2 = personnel/modelInfo.UEXUCW*useCase.UEXUCW;
//				useCase.personnel_dist_3 = personnel/modelInfo.UDUCW*useCase.UDUCW;
				
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
		
		
	}
	// distribute the effort to different types of components.
	function estimateMVCEffort(modelInfo, estimationResults, projectEffort){
		
		var mvcEstimates = {
				ViewEffort : 0,
				ModelEffort : 0,
				ControlEffort : 0
		}
		
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
		
		mvcEstimates.ViewEffort = viewWeight/totalWeight*projectEffort;
		mvcEstimates.ModelEffort = modelWeight/totalWeight*projectEffort;
		mvcEstimates.ControlEffort = controlWeight/totalWeight*projectEffort;
		
		estimationResults.DomainModel.MVCEstimates = mvcEstimates;
		
//		return mvcEstimate;
	}
	
	// synthesize different proposals of effort estimation.
	function syntehsizeEffortProposals(modelInfo, estimationResults, projectEffort){
		
		var projectManagerWeight = 0.5;
		var developerWeight = 0.2;
		var analysisWeight = 0.3;
		
		var totalSynthesizedEffort = 0;
		
		var useCaseEstimatesById = {};
		
		for(var i in estimationResults.UseCases){
			useCaseEstimatesById[estimationResults.UseCases[i]._id] = estimationResults.UseCases[i];
		}
		
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			
			var useCaseEstimates = useCaseEstimatesById[useCase._id];
			if(!useCaseEstimates){
				useCaseEstimatesById[useCase._id] = {
						Name: useCase.Name,
						_id: useCase._id
				}
				useCaseEstimates = useCaseEstimatesById[useCase._id];
			}
			
			var useCaseEffort = useCaseEstimates.Effort;
			var useCaseEffortProjectManager = modelInfo['UserStoryData'] ? modelInfo['UserStoryData'].project_manager_estimate : -1;
			var useCaseEffortDeveloper = modelInfo['UserStoryData'] ? modelInfo['UserStoryData'].developer_estimate : -1;
			
			var differentEstimates = [];
			differentEstimates.push({estimate: useCaseEffort, weight:analysisWeight});
			differentEstimates.push({estimate: useCaseEffortProjectManager, weight:developerWeight});
			differentEstimates.push({estimate: useCaseEffortDeveloper, weight:projectManagerWeight});
			
			var synthesizedEffort = useCaseEffort;
			var totalWeight = 1;
			for(var i in differentEstimates){
				var differentEstimate = differentEstimates[i];
				if(differentEstimate.estimate != -1){
					totalWeight += differentEstimate.weight;
					synthesizedEffort += differentEstimate.estimate*differentEstimate.weight;
				}
			}
			
			synthesizedEffort = synthesizedEffort/totalWeight;
			
			useCaseEstimates.useCaseEffortProjectManager = useCaseEffortProjectManager;
			useCaseEstimates.useCaseEffortDeveloper = useCaseEffortDeveloper;
			useCaseEstimates.synthesizedEffort = synthesizedEffort;
			
			totalSynthesizedEffort += synthesizedEffort;
		}
		
		estimationResults.TotalSynthesizedEffort = totalSynthesizedEffort;
	
	}
	
	module.exports = {
		// this function will predict project effort in different forms, for example, by mvc components and use cases.
		predictEffort: function(modelInfo, key, callbackfunc){
			
//			var estimator = umlEstimationInfo.estimator;
//			var model = umlEstimationInfo.model;
			
//			var predictionModel = model.replace(" ", "_")+"_"+estimator.replace(" ", "_")+"_model.rds";
			
			console.log("model info");
			console.log(modelInfo);
//		
			var command = './Rscript/EffortEstimation.R "'+predictionModel+'" "'+modelInfo.OutputDir+'/modelEvaluation.csv" "'+modelInfo.OutputDir+'" "exucp_effort_prediction';
			
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
					fs.readFile(modelInfo.OutputDir+"/exucp_effort_prediction_result.json", 'utf-8', (err, str) => {
						   if (err) throw err;
						   console.log(str);
						   
						   var projectEffort = JSON.parse(str).result;
						   
						   var estimationResults = {
								   	EstimationModel: key,
								    PredictionModel : predictionModel,
									SizeMetric : sizeMetric,
									TransactionMetric : transactionMetric,
									Effort: projectEffort.toFixed(2),
									UseCases: [],
									DomainModel: {},
									SizeMeasurement: modelInfo['ExtendedUseCasePointData'][sizeMetric]
							};
						   
						   estimateUseCaseEffort(modelInfo, estimationResults, projectEffort);
						   estimateMVCEffort(modelInfo, estimationResults, projectEffort);
						   syntehsizeEffortProposals(modelInfo, estimationResults, projectEffort);
						   
						   estimationResults.EstimationResultsFile = "estimationResultEXUCP.json"
							   
							   var files = [{fileName : estimationResults.EstimationResultsFile , content : JSON.stringify(estimationResults)}];
								
								umlFileManager.writeFiles(modelInfo.OutputDir, files, function(err){
								if(err){
									 if(callbackfunc){
										   callbackfunc(false);
									   }
									return;
								}

								   modelInfo[key] = estimationResults;
								  
								   if(callbackfunc){
									   callbackfunc(modelInfo);
								   }
								});
					});
				}
			});
		}
		
	}
}())