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
	var RScriptExec = require('../utils/RScriptUtil.js')
	
	module.exports = {
		predictEffort: function(modelInfo, predictionModel, callbackfunc){
		
			var command = './Rscript/EffortEstimation.R "'+predictionModel+'" "'+modelInfo.OutputDir+'/modelEvaluation.csv" "'+modelInfo.OutputDir+'/project_effort_estimation_result.txt"';
			
			RScriptExec.runRScript(command,function(result){
				if (!result) {
//					console.log('exec error: ' + error);
					console.log("project effort estimation error");
					if(callbackfunc){
						callbackfunc(false);
					}
				} else {
					fs.readFile(modelInfo.OutputDir+"./project_effort_estimation_result.txt", 'utf-8', (err, str) => {
						   if (err) throw err;
						   var results = {};
						   var lines = resultStr.split(/\r?\n/);
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
		calcualteDistributedEffort: function(modelInfo, projectEffort){
			
				//distribute project effort
				for(var i in modelInfo.UseCases){
					var useCase = modelInfo.UseCases[i];
					useCase.effort_dis_1 = projectEffort/modelInfo.UEUCW*useCase.UEUCW;
					useCase.effort_dis_2 = projectEffort/modelInfo.UEXUCW*useCase.UEXUCW;
					useCase.effort_dis_3 = projectEffort/modelInfo.UDUCW*useCase.UDUCW;
				}
			
		},
		predictDuration: function(modelInfo, projectEffort, callbackfunc){
			//need to update
			var projectDuration = projectEffort/10;
			
			modelInfo.predictedDuration = projectDuration;
			calculateDistributedDuration(model, modelInfo.predictedDuration);
			
			if(callbackfunc){
				callbackfunc(modelInfo);
			}
			
		},
		calculateDistributedDuration: function(modelInfo, projectDuration){
			//distribute project effort
			for(var i in modelInfo.UseCases){
				var useCase = modelInfo.UseCases[i];
				useCase.effort_dis_1 = projectDuration/modelInfo.UEUCW*useCase.UEUCW;
				useCase.effort_dis_2 = projectDuration/modelInfo.UEXUCW*useCase.UEXUCW;
				useCase.effort_dis_3 = projectDuration/modelInfo.UDUCW*useCase.UDUCW;
			}
			
		},
		predictPersonnel: function(modelInfo, projectEffort, callbackfunc){
			//need to update
			var personnel = projectEffort/12;
			calculateResourceAllocation(modelInfo, personnel);
			modelInfo.predictedPersonnel = personnel;
			
			if(callbackfunc){
				callbackfunc(modelInfo);
			}
		},
		calculateResourceAllocation: function(modelInfo, personnel){
			//distribute project effort
				modelInfo.personnel_ui = personnel*modelInfo.INT/modelInfo.NT;
				modelInfo.personnel_db = personnel*modelInfo.DM/modelinfo.NT;
				modelInfo.personnel_fs = personnel.modelInfo.CTRL/modelInfo.NT;
		}
		
	}
}())