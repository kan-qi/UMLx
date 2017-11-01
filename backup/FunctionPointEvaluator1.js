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
		return "DET,RET,ILF,EIF";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		var modelAnalytics = modelInfo.ModelAnalytics;
		var modelEmpirics = modelInfo.ModelEmpirics;
		
		return modelAnalytics.DET+","+
		modelAnalytics.RET+","+
		modelAnalytics.ILF+","+
		modelAnalytics.EIF;
	}
	
	function evaluateModel(modelInfo){
		
		var modelAnalytics = modelInfo.ModelAnalytics;
		modelAnalytics.DET = 0;
		modelAnalytics.RET = 0;
		modelAnalytics.ILF = 0;
		modelAnalytics.EIF = 0;
		var ILFEvaluation = [
			['', 'x>=1&&x<=19', 'x>=20&&x<=50', 'x>50'],
			['y==1', '7', '7', '10'],
			['y>=2&&y<=5', '7', '10', '15'],
			['y>5', '10', '15', '15'],
			];
		var EIFEvaluation = [
			['', 'x>=1&&x<=19', 'x>=20&&x<=50', 'x>50'],
			['y==1', '5', '5', '7'],
			['y>=2&&y<=5', '5', '7', '10'],
			['y>5', '7', '10', '10'],
			];
		
		if(modelInfo.DomainModel){
		var domainModelInfo = modelInfo.DomainModel;
		var domainModelAnalytics = domainModelInfo.DomainModelAnalytics;
		for(var i in domainModelAnalytics.Diagrams){
		var diagram = domainModelAnalytics.Diagrams[i];
		var DET = diagram.AttributeNum;
		var RET = 1;
		var ILF = 0;
		var EIF = 0;
		if(DET > 0 && RET > 0){
			for(var j = 1; j<ILFEvaluation[0].length; j++){
				var ILFCondition = ILFEvaluation[0][j];
				var detEvaluationStr = "var x="+DET+";if("+ILFCondition+"){module.exports = true;}else{module.exports = false;}";
				var detResult = eval(detEvaluationStr);
				if(detResult){
					for(var k= 1; k<ILFEvaluation.length; k++ ){
						var EIFCondition = ILFEvaluation[k][j];
						var retEvaluationStr = "var y="+RET+";if("+EIFCondition+"){module.exports = true;}else{module.exports = false;}";
						var retResult = eval(retEvaluationStr);
//						console.log(retResult);
						if(retResult){
							ILF = ILFEvaluation[j][k];
							break;
						}
					}
					break;
				}
			}
		}

//		diagramAnalytics.DET = DET;
//		diagramAnalytics.RET = RET;
//		diagramAnalytics.ILF = ILF;
//		diagramAnalytics.EIF = EIF;
		
		modelAnalytics.DET += DET;
		modelAnalytics.RET += RET;
		modelAnalytics.ILF += ILF;
		modelAnalytics.EIF += EIF;
		}
		}

	}
	
	
	module.exports = {
			toModelEvaluationHeader: toModelEvaluationHeader,
			toModelEvaluationRow: toModelEvaluationRow,
			evaluateModel: evaluateModel
	}
	
	
}())