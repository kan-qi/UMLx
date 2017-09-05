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
		return "Path_Num,UseCase_Num,Diagram_Num,INT,INT_ALY,DM,DM_ALY,CTRL,CTRL_ALY,EXTIVK,EXTIVK_ALY,EXTCLL,EXTCLL_ALY,TN,TN_ALY,WTN_ALY,WTNDC_ALY";
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
		modelEmpirics.TN+","+
		modelAnalytics.TN+","+
		modelAnalytics.WTN+","+
		modelAnalytics.WTNDC;
	}
	
	function toUseCaseEvaluationHeader(){
		return "CCSS_EMP,CCSS_ALY, EI_EMP,EI_ALY,EO_EMP,EO_ALY,EQ,EQ_ALY,FN,FN_ALY,DM, DM_ALY,INT,INT_ALY,CTRL,CTRL_ALY,EXTIVK,EXTIVK_ALY,EXTCLL,EXTCLL_ALY,TN,TN_ALY";
		
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
			useCaseEmpirics.TN+","+
			useCaseAnalytics.TN;
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
//		modelEmpirics.TN = 0;
//	}
	
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
	modelEmpirics.TN = 0;
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
		useCaseEmpirics.TN = Number(useCaseEmpirics.TN);
		
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
	 	modelEmpirics.TN += useCaseEmpirics.TN;
	 	
	 	console.log(modelEmpirics);
	}
	
	
	module.exports = {
			toModelEvaluationHeader: toModelEvaluationHeader,
			toModelEvaluationRow: toModelEvaluationRow,
			toUseCaseEvaluationHeader: toUseCaseEvaluationHeader,
			toUseCaseEvaluationRow: toUseCaseEvaluationRow,
//			loadFromModelEmpirics: loadFromModelEmpirics,
			loadFromUseCaseEmpirics: loadFromUseCaseEmpirics
	}
	
	
}())