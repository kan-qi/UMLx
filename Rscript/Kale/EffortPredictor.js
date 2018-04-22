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
	
	function calculateDistributedEffort(modelInfo, projectEffort){
		
		//distribute project effort
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			useCase.effort_dis_1 = projectEffort/modelInfo.UEUCW*useCase.UEUCW;
			useCase.effort_dis_2 = projectEffort/modelInfo.UEXUCW*useCase.UEXUCW;
			useCase.effort_dis_3 = projectEffort/modelInfo.UDUCW*useCase.UDUCW;
		}
	
    }
	
	function calculateDistributedDuration(modelInfo, projectDuration){
		//distribute project effort
		for(var i in modelInfo.UseCases){
			var useCase = modelInfo.UseCases[i];
			useCase.duration_dist_1 = projectDuration/modelInfo.UEUCW*useCase.UEUCW;
			useCase.duration_dist_2 = projectDuration/modelInfo.UEXUCW*useCase.UEXUCW;
			useCase.duration_dist_3 = projectDuration/modelInfo.UDUCW*useCase.UDUCW;
		}
		
	}
	
	function calculateResourceAllocation(modelInfo, personnel){
		//distribute project effort
			modelInfo.personnel_ui = personnel*modelInfo.INT/modelInfo.NT;
			modelInfo.personnel_db = personnel*modelInfo.DM/modelInfo.NT;
			modelInfo.personnel_fs = personnel*modelInfo.CTRL/modelInfo.NT;
			
			for(var i in modelInfo.UseCases){
				var useCase = modelInfo.UseCases[i];
				useCase.personnel_dist_1 = personnel/modelInfo.UEUCW*useCase.UEUCW;
				useCase.personnel_dist_2 = personnel/modelInfo.UEXUCW*useCase.UEXUCW;
				useCase.personnel_dist_3 = personnel/modelInfo.UDUCW*useCase.UDUCW;
				
				useCase.personnel_ui = useCase.personnel_dist_1*useCase.INT/useCase.NT;
				useCase.personnel_db = useCase.personnel_dist_1*useCase.DM/useCase.NT;
				useCase.personnel_fs = useCase.personnel_dist_1*useCase.CTRL/useCase.NT;
			}
			
	}
	
	module.exports = {
		predictEffort: function(modelInfo, predictionModel, callbackfunc){
		
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
						   var results = {};
						   var lines = str.split(/\r?\n/);
						   for(var i in lines){
							   var line = lines[i];
							   line = line.replace(/\"/g, "");
							   var valueSet = line.split(/\s+/);
							   if(valueSet.length > 2){
							   console.log(valueSet);
							   results[valueSet[1]] = valueSet[2];
							   }
						   }
						   
						   modelInfo.EffortEstimationResults = results;
						   modelInfo.predicted_effort = 1302;
						   
						   
						   calculateDistributedEffort(modelInfo, modelInfo.predicted_effort);
//						    console.log(data);
						   if(callbackfunc){
							   callbackfunc(modelInfo);
						   }
					});
//					if(callbackfunc){
//						callbackfunc("alright");
//					}
				}
			});
		},
		calculateDistributedEffort: calculateDistributedEffort,
		predictDuration: function(modelInfo, projectEffort, callbackfunc){
			//need to update
			var projectDuration = projectEffort/10;
			
			modelInfo.predictedDuration = projectDuration;
			calculateDistributedDuration(modelInfo, modelInfo.predictedDuration);
			
			if(callbackfunc){
				callbackfunc(modelInfo);
			}
			
		},
		calculateDistributedDuration: calculateDistributedDuration,
		predictPersonnel: function(modelInfo, projectEffort, callbackfunc){
			//need to update
			var personnel = projectEffort/12;
			calculateResourceAllocation(modelInfo, personnel);
			modelInfo.predictedPersonnel = personnel;
			
			if(callbackfunc){
				callbackfunc(modelInfo);
			}
		},
		calculateResourceAllocation: calculateResourceAllocation
		
	}
}())
