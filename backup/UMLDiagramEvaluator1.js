/**
 * http://usejsdoc.org/
 * 
 *This is evaluator module works as a filter mostly to output the necessary information from model analysis to model evaluation.
 * 
 * 
 * 
 */


(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	
	function toModelEvaluationHeader(){
		return "Path_Num,UseCase_Num,Diagram_Num,INT,INT_ALY,DM,DM_ALY,CTRL,CTRL_ALY,EXTIVK,EXTIVK_ALY,EXTCLL,EXTCLL_ALY,NT,NT_ALY,NWT_ALY,NWT_DE_ALY";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		var modelAnalytics = modelInfo.ModelAnalytics;
		var modelEmpirics = modelInfo.ModelEmpirics;
		
		return modelAnalytics.PathNum+","+
		modelAnalytics.UseCaseNum+","+
		modelAnalytics.DiagramNum+","+
		modelEmpirics.INT+","+
		modelAnalytics.INT+","+
		modelEmpirics.DM+","+
		modelAnalytics.DM+","+
		modelEmpirics.CTRL+","+
		modelAnalytics.CTRL+","+
		modelEmpirics.EXTIVK+","+
		modelAnalytics.EXTIVK+","+
		modelEmpirics.EXTCLL+","+
		modelAnalytics.EXTCLL+","+
		modelEmpirics.NT+","+
		modelAnalytics.NT+","+
		modelAnalytics.NWT+","+
		modelAnalytics.NWT_DE;
	}
	
	function toUseCaseEvaluationHeader(){
		return "CCSS_EMP,CCSS_ALY, EI_EMP,EI_ALY,EO_EMP,EO_ALY,EQ,EQ_ALY,FN,FN_ALY,DM, DM_ALY,INT,INT_ALY,CTRL,CTRL_ALY,EXTIVK,EXTIVK_ALY,EXTCLL,EXTCLL_ALY,NT,NT_ALY";
		
	}
	
	function toUseCaseEvaluationRow(useCaseInfo, index){
			var useCaseEmpirics = useCaseInfo.UseCaseEmpirics;
			var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
			
			return useCaseEmpirics.CCSS+","+
			useCaseAnalytics.CCSS+","+
			useCaseEmpirics.EI+","+
			useCaseAnalytics.EI+","+
			useCaseEmpirics.EO+","+
			useCaseAnalytics.EO+","+
			useCaseEmpirics.EQ+","+
			useCaseAnalytics.EQ+","+
			useCaseEmpirics.FN+","+
			useCaseAnalytics.FN+","+
			useCaseEmpirics.DM+","+
			useCaseAnalytics.DM+","+
			useCaseEmpirics.INT+","+
			useCaseAnalytics.INT+","+
			useCaseEmpirics.CTRL+","+
			useCaseAnalytics.CTRL+","+
			useCaseEmpirics.EXTIVK+","+
			useCaseAnalytics.EXTIVK+","+
			useCaseEmpirics.EXTCLL+","+
			useCaseAnalytics.EXTCLL+","+
			useCaseEmpirics.NT+","+
			useCaseAnalytics.NT;
	}
	
//	function loadFromModelEmpirics(modelEmpirics, modelInfo, modelIndex){

//		modelEmpirics.CCSS = 0;
////		modelEmpirics.IT = 0;
//		modelEmpirics.ILF = 0;
//		modelEmpirics.ELF = 0;
//		modelEmpirics.EI = 0;
//		modelEmpirics.EO = 0;
//		modelEmpirics.EQ = 0;
//		modelEmpirics.DM = 0;
//		modelEmpirics.INT = 0;
//		modelEmpirics.CTRL = 0;
//		modelEmpirics.EXTIVK = 0;
//		modelEmpirics.EXTCLL = 0;
//		modelEmpirics.NT = 0;
//	}
	
	function evaluateModel(modelInfo){
		var NWT = 0;
		var NWT_DE = 0;
		for(var i in modelInfo.UseCases){
			var useCaseInfo = modelInfo.UseCases[i];
			var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
			NWT += useCaseAnalytics.NWT;
			NWT_DE += useCaseAnalytics.NWT_DE;
		}
		
		var modelAnalytics = modelInfo.ModelAnalytics;
		modelAnalytics.NWT = NWT;
		modelAnalytics.NWT_DE = NWT_DE;
	}
	
	function evaluateUseCase(useCaseInfo){
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;

		var NWT = 0;
		var NWT_DE = 0;
		
		for(var i in useCaseAnalytics.Diagrams){
			
		var diagram = useCaseAnalytics.Diagrams[i];
		var diagramAnalytics = diagram.DiagramAnalytics;
		
		for(var j in diagramAnalytics.Paths){
		var Path = diagramAnalytics.Paths[j];
		// The rules to determine NWT
		if(Path.archDiff < 5){
			Path.archWeight=4;
		}
		else if(Path.archDiff <= 7){
			Path.archWeight= 10;
		}
		else if(Path.archDiff > 7) {
			Path.archWeight=15;
		}
		
		NWT += Number(Path.archWeight);
		
		// The rules to determine DENT
		if(Path.pathLength <= 3) {
			// The rules to determine NWT
			if(Path.archDiff < 5){
				Path.implWeight=2;
			}
			else if(Path.archDiff <= 7){
				Path.implWeight= 8;
			}
			else if(Path.archDiff > 7) {
				Path.implWeight=12;
			}
		}
		else if(Path.pathLength <= 5){
			// The rules to determine NWT
			if(Path.archDiff < 5){
				Path.implWeight=4;
			}
			else if(Path.archDiff <= 7){
				Path.implWeight= 10;
			}
			else if(Path.archDiff > 7) {
				Path.implWeight=15;
			}
		} else if(Path.pathLength > 5 ){
			// The rules to determine NWT
			if(Path.archDiff < 5){
				Path.implWeight=6;
			}
			else if(Path.archDiff <= 7){
				Path.implWeight= 14;
			}
			else if(Path.archDiff > 7) {
				Path.implWeight=18;
			}
		}
		
		NWT_DE += Number(Path.implWeight);

		}
		}
		
		useCaseAnalytics.NWT = NWT;
		useCaseAnalytics.NWT_DE = NWT_DE;
	}
	
	function initModelEmpirics(modelEmpirics){
	modelEmpirics.CCSS = 0;
//	modelEmpirics.IT = 0;
	modelEmpirics.ILF = 0;
	modelEmpirics.ELF = 0;
	modelEmpirics.EI = 0;
	modelEmpirics.EO = 0;
	modelEmpirics.EQ = 0;
	modelEmpirics.DM = 0;
	modelEmpirics.INT = 0;
	modelEmpirics.CTRL = 0;
	modelEmpirics.EXTIVK = 0;
	modelEmpirics.EXTCLL = 0;
	modelEmpirics.NT = 0;
	}
	

	function loadFromUseCaseEmpirics(useCaseEmpirics, useCaseInfo, useCaseIndex, modelInfo, modelIndex){
		
		
		useCaseEmpirics.CCSS = Number(useCaseEmpirics.CCSS);
	 	//	useCaseEmpirics.IT = Number(useCaseEmpirics.IT);
		useCaseEmpirics.ILF = Number(useCaseEmpirics.ILF);
		useCaseEmpirics.ELF = Number(useCaseEmpirics.ELF);
		useCaseEmpirics.EI = Number(useCaseEmpirics.EI);
		useCaseEmpirics.EO = Number(useCaseEmpirics.EO);
		useCaseEmpirics.EQ = Number(useCaseEmpirics.EQ);
		useCaseEmpirics.DM = Number(useCaseEmpirics.DM);
		useCaseEmpirics.INT = Number(useCaseEmpirics.INT);
		useCaseEmpirics.CTRL = Number(useCaseEmpirics.CTRL);
		useCaseEmpirics.EXTIVK = Number(useCaseEmpirics.EXTIVK);
		useCaseEmpirics.EXTCLL = Number(useCaseEmpirics.EXTCLL);
		useCaseEmpirics.NT = Number(useCaseEmpirics.NT);
		
		if(!modelInfo.ModelEmpirics){
			modelInfo.ModelEmpirics = {};
			initModelEmpirics(modelInfo.ModelEmpirics);
		}
		else if(useCaseIndex == 0){
			initModelEmpirics(modelInfo.ModelEmpirics);
		}
		
		var modelEmpirics = modelInfo.ModelEmpirics;
		
	 	modelEmpirics.CCSS += useCaseEmpirics.CCSS;
	 	//	modelEmpirics.IT += useCaseEmpirics.IT;
	 	modelEmpirics.ILF += useCaseEmpirics.ILF;
	 	modelEmpirics.ELF += useCaseEmpirics.ELF;
	 	modelEmpirics.EI += useCaseEmpirics.EI;
	 	modelEmpirics.EO += useCaseEmpirics.EO;
	 	modelEmpirics.EQ += useCaseEmpirics.EQ;
	 	modelEmpirics.DM += useCaseEmpirics.DM;
	 	modelEmpirics.INT += useCaseEmpirics.INT;
	 	modelEmpirics.CTRL += useCaseEmpirics.CTRL;
	 	modelEmpirics.EXTIVK += useCaseEmpirics.EXTIVK;
	 	modelEmpirics.EXTCLL += useCaseEmpirics.EXTCLL;
	 	modelEmpirics.NT += useCaseEmpirics.NT;
	 	
	 	console.log(modelEmpirics);
	}
	

	function evaluateRepoForModels(repoAnalytics){
		 repoAnalytics.repoModelEvaluationResultsPath = repoAnalytics.OutputDir+"/Model_Evaluation_Results";
		 
			mkdirp(repoAnalytics.repoModelEvaluationResultsPath, function(err) { 
				if(err) {
					console.log(err);
			        return;
			    }
				 var command1 = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/BootstrapForIdentificationRate.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForModelsFileName+'" "'+repoAnalytics.repoModelEvaluationResultsPath+'"';
					console.log('evaluate models with bootstrap');
					console.log(command1);
					var child = exec(command1, function(error, stdout, stderr) {

						 var command2 = '"C:/Program Files/R/R-3.2.2/bin/Rscript" ./Rscript/LinearRegressionForNT.R "'+repoAnalytics.OutputDir+"/"+repoAnalytics.RepoEvaluationForModelsFileName+'" "'+repoAnalytics.repoModelEvaluationResultsPath+'"';
							console.log('evaluate models with bootstrap');
							console.log(command2);
							var child = exec(command2, function(error, stdout, stderr) {

								if (error !== null) {
//									console.log('exec error: ' + error);
									console.log('exec error: repo id=' + repoAnalytics._id);
								} 
								console.log("Repo Evaluation were saved!");
							});
					});
			});
	}
	
	module.exports = {
			toModelEvaluationHeader: toModelEvaluationHeader,
			toModelEvaluationRow: toModelEvaluationRow,
			toUseCaseEvaluationHeader: toUseCaseEvaluationHeader,
			toUseCaseEvaluationRow: toUseCaseEvaluationRow,
//			loadFromModelEmpirics: loadFromModelEmpirics,
			loadFromUseCaseEmpirics: loadFromUseCaseEmpirics,
			evaluateRepoForModels: evaluateRepoForModels,
			evaluateUseCase: evaluateUseCase,
			evaluateModel:evaluateModel
	}
	
	
}())