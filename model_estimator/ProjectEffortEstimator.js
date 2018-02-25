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
		estimateProjectEffort: function(modelInfo, predictionModel, callbackfunc){
		
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
						   modelInfo.est_effort = 1302;
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
		
		analyseEffortEstimationResult: function(modelInfo, callbackfunc){
			//distribute project effort
			for(var i in modelInfo.UseCases){
				var useCase = modelInfo.UseCases[i];
				useCase.effort_dis_1 = modelInfo.est_effort/modelInfo.UEUCW*useCase.UEUCW;
				useCase.effort_dis_2 = modelInfo.est_effort/modelInfo.UEXUCW*useCase.UEXUCW;
				useCase.effort_dis_3 = modelInfo.est_effort/modelInfo.UDUCW*useCase.UDUCW;
			}
		}
//		runBaysianModelAverage: function(callbackfunc){
//			var command = 'java '+classPath+'repo.component.utilities.BayesianAverageReport "'+outputDir+'"';
//			console.log(command);
//			var child = exec(command, function(error, stdout, stderr) {
//
//				if (error !== null) {
//					console.log('exec error: ' + error);
//					callbackfunc(false);
//				} 
//				callbackfunc(chartPath);
//			});
//		},
//		runLinearRegression: function(repoAnalytics, modelEvaluations, x, y, callbackfunc){
////			var command = 'java -classpath "'+classPath+'" "repo.component.utilities.EffortDataCalibrateV3" "'+projectDir+"/"+repoAnalytics.OutputDir+'"';
//			
////			console.log(modelEvaluationData);
//			
//			var dataUrl = repoAnalytics.OutputDir + "/" + repoAnalytics.RepoEvaluationForModelsFileName;
//			var svgFileName = "linear_regression_plot_"+x+".svg";
//			var svgFilePath = repoAnalytics.OutputDir+"/"+svgFileName;
//			var reportFileName = "linear_regression_report_"+x+".txt";
//			var reportFilePath = repoAnalytics.OutputDir + "/" + reportFileName;
//			
//			var command = 'Rscript ./Rscript/LinearRegression.R "'+dataUrl+'" '+x+' '+y+' "'+reportFilePath+'" "'+svgFilePath+'"';
//			console.log(command);
//			var child = exec(command, function(error, stdout, stderr) {
////				console.log(stdout);
//				if (error !== null) {
//					console.log('exec error: ' + error);
//					callbackfunc(false);
//					return;
//				}
//				
//				fs.readFile(reportFilePath, 'utf-8', (err, data) => {
//					   if (err) throw err;
////					    console.log(data);
//					    var modelInfo = {
//								dataUrl:dataUrl,
//								x: x,
//								y: y,
//								outputDir:repoAnalytics.OutputDir,
//								accessDir:repoAnalytics.AccessDir,
//								svgFileName:svgFileName,
//								reportFileName:reportFileName,
//								parameters:[],
//								MMRE: 0,
//								PRED25:0,
//								PRED50:0
//							};
//					    var lines = data.split('\n');
//					    for(var i = 1;i < lines.length;i++){
//					        //code here using lines[i] which will give you each line
//					    	var line = lines[i];
//
//					    	if(line === ""){
//					    		continue;
//					    	}
//					    	
//
//					    	var segs = line.split(/\s+/g);
//					    	
//
//
//					    	console.log(segs);
//					    	
//					    	var parameter = {
//					    			name: segs[0],
//					    			estimate: parseFloat(segs[1]).toFixed(2),
//					    			stdError: parseFloat(segs[2]).toFixed(2),
//					    			tValue: parseFloat(segs[3]).toFixed(2),
//					    			pValue: parseFloat(segs[4]).toFixed(2)
//					    	}
//					    	modelInfo.parameters.push(parameter);
//					    }
//					  
//					    var pred25 = 0;
//					    var pred50 = 0;
//					    var tmre = 0;
//					    for(var i in modelEvaluations){
//					    	var modelEvaluation = modelEvaluations[i];
//					    	var estimatedValue = 0;
//					    	for(var j in modelInfo.parameters){
//					    		var parameter = modelInfo.parameters[j];
//					    		var measure = modelEvaluation[parameter.name];
////					    		console.log('parameter name:'+parameter.name);
//					    		if(!measure){
//					    			measure = 1;
//					    		}
//					    		
//					    		measure = parseFloat(measure);
////					    		console.log('measure:'+measure);
//					    		estimatedValue += measure*parameter.estimate;
//					    	}
//
//					    	var actualValue = parseFloat(modelEvaluation[y]);
//					    	if(actualValue === 0){
//					    		continue;
//					    	}
//					    	
////					    	console.log("actual: "+actualValue+" estimated: "+estimatedValue);
//					    	
//					    	rr = Math.abs(actualValue - estimatedValue)/actualValue;
//					    	if(rr < 0.25){
//					    		pred25++;
//					    	}
//					    	
//					    	if(rr < 0.5){
//					    		pred50++;
//					    	}
//					    	
//					    	tmre += rr;
//					    }
//					    
//					    if(modelEvaluations.length > 0){
//					    modelInfo.MMRE = parseFloat(tmre/modelEvaluations.length).toFixed(2);
//					    modelInfo.PRED25 = parseFloat(pred25/modelEvaluations.length).toFixed(2);
//					    modelInfo.PRED50 = parseFloat(pred50/modelEvaluations.length).toFixed(2);
//					    }
//					    
//					    repoAnalytics.ModelCalibrationResults= {};
//						repoAnalytics.ModelCalibrationResults[x] = modelInfo;
//						callbackfunc(repoAnalytics.ModelCalibrationResults);
//			    });
//				
//				
//			
//			});
//			
//		},
//		runLassoRegression: function(callbackfunc){
//			var chartPath = currentWorkDir+'public/output/repo/LassoRegressionReport.svg';
//			var command = 'java '+classPath+'EffortDataCalibrateV3 "'+chartPath+'"';
//			console.log(command);
//			var child = exec(command, function(error, stdout, stderr) {
//
//				if (error !== null) {
//					console.log('exec error: ' + error);
//					callbackfunc(false);
//				} 
//				callbackfunc(chartPath);
//			});
//		},
//		runLinearRegressionWithNormalizedData:function(callbackfunc){
//			var chartPath = currentWorkDir+'public/output/repo/LinearRegressionWithNormalizedDataReport.svg';
//			var command = 'java '+classPath+'NormalizedDataCalibrate "'+chartPath+'"';
//			console.log(command);
//			var child = exec(command, function(error, stdout, stderr) {
//
//				if (error !== null) {
//					console.log('exec error: ' + error);
//					callbackfunc(false);
//				} 
//				callbackfunc(chartPath);
//			});
//		}
	}
}())