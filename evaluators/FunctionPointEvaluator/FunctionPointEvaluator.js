/**
 * http://usejsdoc.org/
 * 
 * This is evaluator module works as a filter mostly to output the necessary
 * information from model analysis to model evaluation.
 * 
 * 
 * 
 */

(function() {

	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	var umlFileManager = require('../../UMLFileManager');
	var functionPointProcessor = require('./FunctionPointProcessor.js');
	
	function toModelEvaluationHeader() {
		return "DET,RET,ILF,EIF,EI,EO,EQ,FN,FUNC_NA";
	}

	function toModelEvaluationRow(modelInfo, index) {
		var modelAnalytics = modelInfo.ModelAnalytics;
//		var modelEmpirics = modelInfo.ModelEmpirics;

		return modelAnalytics.DET + ","
				+ modelAnalytics.RET + ","
				+ modelAnalytics.ILF + ","
				+ modelAnalytics.EIF + ","
				+ modelAnalytics.EI + ","
				+ modelAnalytics.EO + ","
				+ modelAnalytics.EQ + ","
				+ modelAnalytics.FN + ","
				+ modelAnalytics.FUNC_NA;
	}
	
	function toUseCaseEvaluationHeader() {
		return "EI,EO,EQ,FN,FUNC_NA";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
//		var modelEmpirics = useCaseInfo.ModelEmpirics;

		return useCaseAnalytics.EI + ","
				+useCaseAnalytics.EO + ","
				+ useCaseAnalytics.EQ + ","
				+ useCaseAnalytics.FN + ","
				+ useCaseAnalytics.FUNC_NA;
	}
	
	function toDomainModelEvaluationHeader() {
		return "DET,RET,ILF,EIF";
	}

	function toDomainModelEvaluationRow(domainModelInfo, index) {
		var domainModelAnalytics = domainModelInfo.DomainModelAnalytics;
//		var modelEmpirics = domainModelInfo.ModelEmpirics;

		return domainModelAnalytics.DET + ","
				+ domainModelAnalytics.RET + ","
				+ domainModelAnalytics.ILF + ","
				+ domainModelAnalytics.EIF;
	}

	function evaluateUseCase(useCaseInfo) {
		
		var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
		
		useCaseAnalytics.EI = 0;
		useCaseAnalytics.EO = 0;
		useCaseAnalytics.EQ = 0;
		useCaseAnalytics.FUNC_NA = 0;
		useCaseAnalytics.FN = 0;
		
		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			
			if (!diagram.DiagramAnalytics) {
				diagram.DiagramAnalytics = {};
			}
			
			var diagramAnalytics = diagram.DiagramAnalytics;
			
			var FUNC_NA = 0;
			var FN = 0;
			var EI = 0;
			var EO = 0;
			var EQ = 0;


//			diagram.DiagramAnalytics.Paths = [];
//			diagramAnalytics.PathAnalyticsFileName = 'pathsAnalytics.csv';
//			useCaseAnalytics.Diagrams.push(diagram);

			for ( var j in diagram.Paths) {
				var path = diagram.Paths[j];
				// console.log('--------Process Path-------');
				
				functionPointProcessor.processPath(path, diagram, useCaseInfo);
				
//				console.log(path);
				
				var functionalOperations = path.Functional;
				
				if (functionalOperations.indexOf("EI") > -1) {
					EI++;
				}
				if (functionalOperations.indexOf("EQ") > -1) {
					EQ++;
				}
				if (functionalOperations.indexOf("DM") > -1) {
					DM++;
				}
				
				if(functionalOperations.indexOf("FUNC_NA") > -1){
					FUNC_NA++;
				}
				else {
					FN ++;
				}
				
			}

			diagramAnalytics.EI = EI;
			diagramAnalytics.EO = EO;
			diagramAnalytics.EQ = EQ;
			diagramAnalytics.FUNC_NA = FUNC_NA;
			diagramAnalytics.FN = FN;
			
			useCaseAnalytics.EI += diagramAnalytics.EI;
			useCaseAnalytics.EO += diagramAnalytics.EO;
			useCaseAnalytics.EQ += diagramAnalytics.EQ;
			useCaseAnalytics.FUNC_NA += diagramAnalytics.FUNC_NA;
			useCaseAnalytics.FN += diagramAnalytics.FN;
		}
	}
	
	function evaluateDomainModel(domainModelInfo){

		var domainModelAnalytics = domainModelInfo.DomainModelAnalytics;
		
		domainModelAnalytics.DET = 0;
		domainModelAnalytics.RET = 0;
		domainModelAnalytics.ILF = 0;
		domainModelAnalytics.EIF = 0;
		
		var ILFEvaluation = [ [ '', 'x>=1&&x<=19', 'x>=20&&x<=50', 'x>50' ],
				[ 'y==1', '7', '7', '10' ], [ 'y>=2&&y<=5', '7', '10', '15' ],
				[ 'y>5', '10', '15', '15' ], ];
		var EIFEvaluation = [ [ '', 'x>=1&&x<=19', 'x>=20&&x<=50', 'x>50' ],
				[ 'y==1', '5', '5', '7' ], [ 'y>=2&&y<=5', '5', '7', '10' ],
				[ 'y>5', '7', '10', '10' ], ];
		
		
		for ( var i in domainModelAnalytics.Diagrams) {
			var diagram = domainModelAnalytics.Diagrams[i];
			var DET = diagram.AttributeNum;
			var RET = 1;
			var ILF = 0;
			var EIF = 0;
			if (DET > 0 && RET > 0) {
				for (var j = 1; j < ILFEvaluation[0].length; j++) {
					var ILFCondition = ILFEvaluation[0][j];
					var detEvaluationStr = "var x="
							+ DET
							+ ";if("
							+ ILFCondition
							+ "){module.exports = true;}else{module.exports = false;}";
					var detResult = eval(detEvaluationStr);
					if (detResult) {
						for (var k = 1; k < ILFEvaluation.length; k++) {
							var EIFCondition = ILFEvaluation[k][j];
							var retEvaluationStr = "var y="
									+ RET
									+ ";if("
									+ EIFCondition
									+ "){module.exports = true;}else{module.exports = false;}";
							var retResult = eval(retEvaluationStr);
							// console.log(retResult);
							if (retResult) {
								ILF = ILFEvaluation[j][k];
								break;
							}
						}
						break;
					}
				}
			}

			domainModelAnalytics.DET += DET;
			domainModelAnalytics.RET += RET;
			domainModelAnalytics.ILF += ILF;
			domainModelAnalytics.EIF += EIF;
		}
		
		return domainModelAnalytics;

	}
	
	function evaluateModel(modelInfo) {

		var modelAnalytics = modelInfo.ModelAnalytics;
		modelAnalytics.DET = 0;
		modelAnalytics.RET = 0;
		modelAnalytics.ILF = 0;
		modelAnalytics.EIF = 0;
		modelAnalytics.EI = 0;
		modelAnalytics.EO = 0;
		modelAnalytics.EQ = 0;
		modelAnalytics.FUNC_NA = 0;
		modelAnalytics.FN = 0;

		if (modelInfo.DomainModel) {
			var domainModelInfo = modelInfo.DomainModel;
			var domainModelAnalytics = domainModelInfo.DomainModelAnalytics;
			modelAnalytics.DET += domainModelAnalytics.DET;
			modelAnalytics.RET += domainModelAnalytics.RET;
			modelAnalytics.ILF += domainModelAnalytics.ILF;
			modelAnalytics.EIF += domainModelAnalytics.EIF;
		}
		
		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];
			var useCaseAnalytics = useCaseInfo.UseCaseAnalytics;
			modelAnalytics.EI = useCaseAnalytics.EI;
			modelAnalytics.EO = useCaseAnalytics.EO;
			modelAnalytics.EQ = useCaseAnalytics.EQ;
			modelAnalytics.FUNC_NA = useCaseAnalytics.FUNC_NA;
			modelAnalytics.FN = useCaseAnalytics.FN;
		}
		
		return modelAnalytics;

	}

	function evaluateRepo(repoInfo, callbackfunc) {
		var repoAnalytics = repoInfo.RepoAnalytics;
		// initiate the fields in repo analytics;
		repoAnalytics.DET = 0;
		repoAnalytics.RET = 0;
		repoAnalytics.ILF = 0;
		repoAnalytics.EIF = 0;
		repoAnalytics.EI = 0;
		repoAnalytics.EO = 0;
		repoAnalytics.EQ = 0;
		repoAnalytics.FUNC_NA = 0;
		repoAnalytics.FN = 0;

		for ( var i in repoInfo.models) {
			var modelInfo = repoInfo.models[i];
			var modelAnalytics = modelInfo.ModelAnalytics;
			
			repoAnalytics.DET += modelAnalytics.DET;
			repoAnalytics.RET += modelAnalytics.RET;
			repoAnalytics.ILF += modelAnalytics.ILF;
			repoAnalytics.EIF += modelAnalytics.EIF;
			repoAnalytics.EI += modelAnalytics.EI;
			repoAnalytics.EO += modelAnalytics.EO;
			repoAnalytics.EQ += modelAnalytics.EQ;
			repoAnalytics.FUNC_NA += modelAnalytics.FUNC_NA;
			repoAnalytics.FN += modelAnalytics.FN;
		}
		
		return repoAnalytics;
	}



	module.exports = {
		toModelEvaluationHeader : toModelEvaluationHeader,
		toModelEvaluationRow : toModelEvaluationRow,
		toUseCaseEvaluationHeader: toUseCaseEvaluationHeader,
		toUseCaseEvaluationRow: toUseCaseEvaluationRow,
		toDomainModelEvaluationHeader:toDomainModelEvaluationHeader,
		toDomainModelEvaluationRow:toDomainModelEvaluationRow,
		evaluateUseCase : evaluateUseCase,
		evaluateModel : evaluateModel,
		evaluateRepo : evaluateRepo
	}

}())