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
	var UCPEvaluator = require('../evaluators/UseCasePointEvaluator/ExtendedUseCasePointEvaluator.js');
	
	var defaultModelConfig = eucpConfig;

	var eucpConfig = {
	sizeMetric : "EUCP",
	transactionMetric : "SWTI",
	estimationResultsFile : "estimationResultEUCP.json",
	label: "eucp_effort_prediction"
	}
	
	var exucpConfig = {
	sizeMetric : "EXUCP",
	transactionMetric : "SWTII",
	estimationResultsFile : "estimationResultEXUCP.json",
	label: "exucp_effort_prediction"
	}
	
	
	var ducpConfig = {
	sizeMetric : "DUCP",
	transactionMetric : "SWTIII",
	estimationResultsFile : "estimationResultDUCP.json",
	label: "ducp_effort_prediction"
	}
	
	

	/*
	 *  This function calculate the project management decisions based on estimated effort, including the duration and personnel.
	 */
	
	function estimateUseCaseEffort(modelInfo, estimationResults, projectEffort, modelConfig){
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
		
		var availablePersonnel = null;
		var availableSchedule = null;
		var hoursPerMonth = null;
		if(modelInfo.projectInfo){
			availablePersonnel = modelInfo.projectInfo.personnel;
			availableSchedule = modelInfo.projectInfo.schedule;
			hoursPerMonth = modelInfo.projectInfo.hoursPerMonth;
		}
		
		var projectEffortInPMCOCOMO = projectEffort/152;
		
		console.log("project effort");
		console.log(projectEffortInPM);
		
		var projectDuration = 3.67*Math.pow(projectEffortInPMCOCOMO, 0.28+0.2*(1.15-0.91));
		
		if(availableSchedule && projectDuration > availableSchedule){
			projectDuration = availableSchedule;
		}
		
		console.log("schedule prediction");
		console.log(projectDuration);
		
		if(!hoursPerMonth){
			hoursPerMonth = 152;
		}

		var projectEffortInPM = projectEffort/hoursPerMonth;
		
		var personnel = projectEffortInPM/projectDuration;
		
		var feasible = true;
		
		if(availablePersonnel){
			if(personnel > availablePersonnel){
			// try to fit the resource using personnel as invariant.
			var refitSchedule = projectEffortInPM/personnel;
			if(refitSchedule > availableSchedule){
				feasible = false;
				projectDuration = availableSchedule;
			} else{
				projectDuration = refitSchedule;
			}
			personnel = availablePersonnel;
			}
		}
		
		estimationResults.feasible = feasible;
		
		console.log("transaction data");
		console.log(modelInfo['TransactionAnalytics']);
		
		var personnel_UI_estimated = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : personnel*modelInfo['TransactionAnalytics'].INT/modelInfo['TransactionAnalytics'].NT;
		var personnel_DB_estimated = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : personnel*modelInfo['TransactionAnalytics'].DM/modelInfo['TransactionAnalytics'].NT;
		var personnel_FS_estimated = modelInfo['TransactionAnalytics'].NT == 0 ? 0 : personnel*modelInfo['TransactionAnalytics'].CTRL/modelInfo['TransactionAnalytics'].NT;
		
		personnel_UI = Math.round(personnel_UI_estimated);
		personnel_DB = Math.round(personnel_DB_estimated);
		personnel_FS = Math.round(personnel_FS_estimated);
		
		if(personnel_UI == 0 && personnel_UI_estimated != 0){
			personnel_UI = 1;
		}
		
		if(personnel_DB == 0 && personnel_DB_estimated != 0){
			personnel_DB = 1;
		}
		
		if(personnel_FS == 0 && personnel_FS_estimated != 0){
			personnel_FS = 1;
		}
		
//		personnel = personnel_UI + personnel_DB + personnel_FS;
		
		estimationResults.Personnel_UI = personnel_UI;
		estimationResults.Personnel_DB = personnel_DB;
		estimationResults.Personnel_FS = personnel_FS;
		
		estimationResults.Personnel = Math.round(personnel);
		
//		projectDuration = projectEffortInPM/personnel;
		
		estimationResults.Duration = projectDuration.toFixed(2);
		
		estimationResults.HoursPerMonth = hoursPerMonth;
		
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

			useCaseEstimates.SizeMeasurement = Number(useCase['ExtendedUseCasePointData'][modelConfig.transactionMetric]).toFixed(2);
			
			var useCaseEffort = (useCase['ExtendedUseCasePointData'][modelConfig.transactionMetric] == 0 || modelInfo['ExtendedUseCasePointData'][modelConfig.transactionMetric] == 0) ? 0 : projectEffort/modelInfo['ExtendedUseCasePointData'][modelConfig.transactionMetric]*useCase['ExtendedUseCasePointData'][modelConfig.transactionMetric];
			
//			useCase.effort_dis_2 = projectEffort/modelInfo.UEXUCW*useCase.UEXUCW;
//			useCase.effort_dis_3 = projectEffort/modelInfo.UDUCW*useCase.UDUCW;
			
			var useCaseEffortInPMCOCOMO = useCaseEffort/152;
			
			var useCaseDuration = 3.67*Math.pow(useCaseEffortInPMCOCOMO, 0.28+0.2*(1.15-0.91));

//			var personnel = projectEffort/12;
			
			if(availableSchedule && useCaseDuration > availableSchedule){
				useCaseDuration = availableSchedule;
			}
			
			var useCaseEffortInPM = useCaseEffort/hoursPerMonth;
			
			var useCasePersonnel = useCaseDuration == 0 ? 0 : useCaseEffortInPM/useCaseDuration;
			
			useCaseEstimates.feasible = true;
//			if(availablePersonnel){
//				if(useCasePersonnel < availablePersonnel){
//				useCaseEstimates.feasible = false;
//				}
//				else{
//				useCasePersonnel = availablePersonnel;
//				}
//			}
			
			if(availablePersonnel){
				if(useCasePersonnel > availablePersonnel){
				// try to fit the resource using personnel as invariant.
				var refitSchedule = useCaseEffortInPM/useCasePersonnel;
				if(refitSchedule > availableSchedule){
					useCaseEstimates.feasible = false;
					useCaseDuration = availableSchedule;
				} else{
					useCaseDuration = refitSchedule;
				}
				useCasePersonnel = availablePersonnel;
				}
			}
			
//			var useCase = modelInfo.UseCases[i];
//			useCaseEstimates.Duration = projectDuration/modelInfo['ExtendedUseCasePointData'][modelConfig.transactionMetric]*useCase['ExtendedUseCasePointData'][modelConfig.transactionMetric];
		
//			useCase.duration_dist_2 = projectDuration/modelInfo.UEXUCW*useCase.UEXUCW;
//			useCase.duration_dist_3 = projectDuration/modelInfo.UDUCW*useCase.UDUCW;
			
			//distribute project effort
			
//				useCaseEstimates.Personnel = personnel/modelInfo['ExtendedUseCasePointData'][modelConfig.transactionMetric]*useCase['ExtendedUseCasePointData'][modelConfig.transactionMetric];
//				useCaseEstimates.Personnel = useCasePersonnel.toFixed(2);
//				useCase.personnel_dist_2 = personnel/modelInfo.UEXUCW*useCase.UEXUCW;
//				useCase.personnel_dist_3 = personnel/modelInfo.UDUCW*useCase.UDUCW;
			
				
				
				var personnel_UI_estimated = useCase['TransactionAnalytics'].NT == 0 ? 0 : useCasePersonnel*useCase['TransactionAnalytics'].INT/useCase['TransactionAnalytics'].NT;
				var personnel_DB_estimated = useCase['TransactionAnalytics'].NT == 0 ? 0 : useCasePersonnel*useCase['TransactionAnalytics'].DM/useCase['TransactionAnalytics'].NT;
				var personnel_FS_estimated = useCase['TransactionAnalytics'].NT == 0 ? 0 : useCasePersonnel*useCase['TransactionAnalytics'].CTRL/useCase['TransactionAnalytics'].NT;

				personnel_UI = Math.round(personnel_UI_estimated);
				personnel_DB = Math.round(personnel_DB_estimated);
				personnel_FS = Math.round(personnel_FS_estimated);
				
				if(personnel_UI == 0 && personnel_UI_estimated != 0){
					personnel_UI = 1;
				}
				
				if(personnel_DB == 0 && personnel_DB_estimated != 0){
					personnel_DB = 1;
				}
				
				if(personnel_FS == 0 && personnel_FS_estimated != 0){
					personnel_FS = 1;
				}
				
				useCasePersonnel = personnel_UI + personnel_DB + personnel_FS;
				
				useCaseEstimates.Personnel = Math.round(useCasePersonnel);
				
				useCaseEstimates.Personnel_UI = personnel_UI;
				useCaseEstimates.Personnel_DB = personnel_DB;
				useCaseEstimates.Personnel_FS = personnel_FS;

				
//				useCaseDuration = useCaseEffortInPM / personnel;
				useCaseEstimates.Duration = useCaseDuration.toFixed(2);

				useCaseEstimates.Effort = useCaseEffort.toFixed(2);
				
				estimationResults.UseCases.push(useCaseEstimates);
		}
		

		console.log("estimation result");
		console.log(estimationResults);
		
		
	}
	// distribute the effort to different types of components.
	function estimateMVCEffort(modelInfo, estimationResults, projectEffort, modelConfig){
		
		var mvcEstimates = {
				ViewEffort : 0,
				ModelEffort : 0,
				ControlEffort : 0
		}
		
		var domainModelInfo = modelInfo.DomainModel;
		var viewWeight = 0;
		var entityWeight = 0;
		var controlWeight = 0;
		for(var i in domainModelInfo.Elements){
			var element = domainModelInfo.Elements[i];
//			console.log("domain elements");
//			console.log(element);
			if(element.Type === "boundary"){
				viewWeight++;
//				viewWeight += element.Operations.length;
			}
			else if(element.Type === "entity"){
				entityWeight++;
//				modelWeight += element.Operations.length;
			}
			else if(element.Type === "control"){
				controlWeight++;
//				controlWeight += element.Operations.length;
			}
		}
		
		var totalWeight = viewWeight + controlWeight + entityWeight;
		
		mvcEstimates.ViewEffort = totalWeight == 0 ? 0: viewWeight/totalWeight*projectEffort;
		mvcEstimates.ViewEffort = mvcEstimates.ViewEffort.toFixed(2);
		mvcEstimates.ModelEffort = totalWeight == 0 ? 0 : entityWeight/totalWeight*projectEffort;
		mvcEstimates.ModelEffort = mvcEstimates.ModelEffort.toFixed(2);
		mvcEstimates.ControlEffort = totalWeight == 0 ? 0 : controlWeight/totalWeight*projectEffort;
		mvcEstimates.ControlEffort = mvcEstimates.ControlEffort.toFixed(2);
		
//		console.log("mvc estimates");
//		console.log(mvcEstimates);
		
		estimationResults.DomainModel.MVCEstimates = mvcEstimates;
		
		
//		return mvcEstimate;
	}
	
	// evaluate business value
	function evaluateBusinessValue(modelInfo, estimationResults, projectEffort, modelConfig){
		
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
			
			useCaseEstimates.BusinessValue = useCase.BusinessValue ? useCase.BusinessValue : 0;
			useCaseEstimates.EffortBVRatio = useCaseEstimates.BusinessValue == 0? 0 : useCaseEstimates.Effort / useCaseEstimates.BusinessValue;
			useCaseEstimates.EffortBVRatio = useCaseEstimates.EffortBVRatio.toFixed(2);
		}
		
	}
	
	// synthesize different proposals of effort estimation.
	function syntehsizeEffortProposals(modelInfo, estimationResults, projectEffort, modelConfig){
		
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
			var useCasePMEffort = useCase.PMEffort ? Number(useCase.PMEffort) : -1;
			var useCaseDEVEffort = useCase.DEVEffort ? Number(useCase.DEVEffort) : -1;
			
			var differentEstimates = [];
			differentEstimates.push({estimate: useCaseEffort, weight:analysisWeight});
			differentEstimates.push({estimate: useCasePMEffort, weight:developerWeight});
			differentEstimates.push({estimate: useCaseDEVEffort, weight:projectManagerWeight});
			
//			console.log("different estimates");
//			console.log(differentEstimates);
			

//			console.log("synthesized effort");

			
			var synthesizedEffort = 0;
			var totalWeight = 1;
			for(var i in differentEstimates){
				var differentEstimate = differentEstimates[i];
				if(differentEstimate.estimate != -1){
					totalWeight += differentEstimate.weight;
					synthesizedEffort += differentEstimate.estimate*differentEstimate.weight;
//					console.log(synthesizedEffort);
				}
			}
			
			synthesizedEffort = synthesizedEffort/totalWeight;
			
			
			useCaseEstimates.useCasePMEffort = useCasePMEffort.toFixed(2);
			useCaseEstimates.useCaseDEVEffort = useCaseDEVEffort.toFixed(2);
			useCaseEstimates.synthesizedEffort = synthesizedEffort.toFixed(2);
			
			totalSynthesizedEffort += synthesizedEffort;
		}
		
		estimationResults.TotalSynthesizedEffort = totalSynthesizedEffort;
	
	}
	
	function predictEffort(modelInfo, key, callbackfunc){
		
		var modelConfig = defaultModelConfig;
		
		if(this.modelConfig){
			modelConfig = this.modelConfig;
		}
//		var estimator = umlEstimationInfo.estimator;
//		var model = umlEstimationInfo.model;
		
//		var predictionModel = model.replace(" ", "_")+"_"+estimator.replace(" ", "_")+"_model.rds";
		
		console.log("model info");
		console.log(modelInfo);
//	
//		var command = './Rscript/EffortEstimation.R "'+modelConfig.predictionModel+'" "'+modelInfo.OutputDir+'/modelEvaluation.csv" "'+modelInfo.OutputDir+'" "'+modelConfig.label+'"';
//		
//		console.log("estimation command");
//		console.log(command);
		
//		process.exit();
		
//		RScriptExec.runRScript(command,function(result){
//			if (!result) {
////				console.log('exec error: ' + error);
//				console.log("project effort estimation error");
//				if(callbackfunc){
//					// error because of the R script
//					callbackfunc(false);
//				}
//			} else {
//				fs.readFile(modelInfo.OutputDir+"/"+modelConfig.label+"_result.json", 'utf-8', (err, str) => {
//					   if (err) throw err;
//					   console.log(str);
					   
					   var projectEffort = UCPEvaluator.estimateProjectEffort(modelInfo, modelConfig.sizeMetric)
					   
					   console.log("test effort repo");
					   console.log(modelInfo['ExtendedUseCasePointData']);
					   
					   var estimationResults = {
							   	EstimationModel: key,
							    PredictionModel : modelConfig.predictionModel,
								SizeMetric : modelConfig.sizeMetric,
								TransactionMetric : modelConfig.transactionMetric,
								Effort: projectEffort.toFixed(2),
								UseCases: [],
								DomainModel: {},
								SizeMeasurement: Number(modelInfo['ExtendedUseCasePointData'][modelConfig.sizeMetric]).toFixed(2)
						};
					   
					   estimateUseCaseEffort(modelInfo, estimationResults, projectEffort, modelConfig);
					   estimateMVCEffort(modelInfo, estimationResults, projectEffort, modelConfig);
					   syntehsizeEffortProposals(modelInfo, estimationResults, projectEffort, modelConfig);
					   evaluateBusinessValue(modelInfo, estimationResults, projectEffort, modelConfig)
					   
					   estimationResults.EstimationResultsFile = modelConfig.estimationResultsFile;
					   
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

//				});
//			}
//		});
	}
	
	module.exports = {
		init: function(modelSelect){
			var estimationModel = {
					
			};
//			var modelConfig = null;
			
			if(modelSelect === "eucp_lm"){
				estimationModel.modelConfig = eucpConfig;
			}
			else if(modelSelect === "exucp_lm"){
				estimationModel.modelConfig = exucpConfig;
			}
			else if(modelSelect === "ducp_lm"){
				estimationModel.modelConfig = ducpConfig;
			}
			
//			if(!modelConfig){
//				predictionModel = modelConfig.predictionModel;
//				sizeMetric = modelConfig.sizeMetric;
//				transactionMetric = modelConfig.transactionMetric;
//				estimationResultsFile = modelConfig.estimationResultsFile;
//				label = modelConfig.label;
//				
////				console.log("setting config");
////				console.log(sizeMetric);
//			}
			
			estimationModel.predictEffort = predictEffort;
			
//			console.log(modelConfig);
			
			return estimationModel;
		},
		// this function will predict project effort in different forms, for example, by mvc components and use cases.
		predictEffort: predictEffort,
		
	}
}())
