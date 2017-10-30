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
	var mkdirp = require('mkdirp');
	var umlFileManager = require('../../UMLFileManager');
	var functionPointProcessor = require('./FunctionPointProcessor.js');
	
	function loadUseCaseEmpirics(useCaseLoad, useCaseInfo, useCaseIndex, modelInfo, modelIndex) {

		if(!useCaseInfo["FPEmpirics"]){
			useCaseInfo["FPEmpirics"] = {
				EI : 0,
				EQ : 0,
				EO : 0,
				}
		}
		
		useCaseInfo["FPEmpirics"].EI = Number(useCaseLoad["FPEmpirics"].EI);
		useCaseInfo["FPEmpirics"].EQ = Number(useCaseLoad["FPEmpirics"].EQ);
		useCaseInfo["FPEmpirics"].EO = Number(useCaseLoad["FPEmpirics"].EO);

		if (!modelInfo["FPEmpirics"]) {
			modelInfo["FPEmpirics"] = {
					EI : 0,
					EQ : 0,
					ILF : 0,
					ELF: 0,
					EO : 0,
					DET : 0,
					RET : 0
					}
		}
		
//		var modelInfo["FPEmpirics"] = modelInfo["FPEmpirics"];

		modelInfo["FPEmpirics"].EI += useCaseInfo["FPEmpirics"].EI;
		modelInfo["FPEmpirics"].EO += useCaseInfo["FPEmpirics"].EO;
		modelInfo["FPEmpirics"].EQ += useCaseInfo["FPEmpirics"].EQ;

//		console.log(modelInfo["FPEmpirics"]);
	}
	
	
	function loadDomainModelEmpirics(domainModelLoad, domainModel, domainModelIndex, modelInfo, modelIndex) {

		if(!domainModelInfo['FPEmpirics']){
			domainModelInfo['FPEmpirics'] = {
					ILF : 0,
					ELF: 0,
					DET : 0,
					RET : 0
					}
		}
		
		domainModelInfo["FPEmpirics"].ILF = Number(domainModelInfo["FPEmpirics"].ILF);
		domainModelInfo["FPEmpirics"].ELF = Number(domainModelInfo["FPEmpirics"].ELF);
		domainModelInfo["FPEmpirics"].DET = Number(domainModelInfo["FPEmpirics"].DET);
		domainModelInfo["FPEmpirics"].RET = Number(domainModelInfo["FPEmpirics"].RET);

		if (!modelInfo["FPEmpirics"]) {
			modelInfo["FPEmpirics"] = {
					EI : 0,
					EQ : 0,
					ILF : 0,
					ELF: 0,
					EO : 0,
					DET : 0,
					RET : 0
					};
		}
		
//		var modelInfo["FPEmpirics"] = modelInfo["FPEmpirics"];

//		modelInfo["FPEmpirics"].CCSS += domainModelInfo["FPEmpirics"].CCSS;
		// modelInfo["FPEmpirics"].IT += domainModelInfo["FPEmpirics"].IT;
		modelInfo["FPEmpirics"].ILF += domainModelInfo["FPEmpirics"].ILF;
		modelInfo["FPEmpirics"].ELF += domainModelInfo["FPEmpirics"].ELF;
		modelInfo["FPEmpirics"].DET += domainModelInfo["FPEmpirics"].DET;
		modelInfo["FPEmpirics"].RET += domainModelInfo["FPEmpirics"].RET;

//		console.log(modelInfo["FPEmpirics"]);
	}
	
	
	function toModelEvaluationHeader() {
		return "DET,RET,ILF,EIF,EO,EQ,FN,FUNC_NA";
	}

	function toModelEvaluationRow(modelInfo, index) {

		return modelInfo["FPAnalytics"].DET + ","
		+ modelInfo["FPAnalytics"].RET + ","
		+ modelInfo["FPAnalytics"].ILF + ","
		+ modelInfo["FPAnalytics"].EIF + ","
		+ modelInfo["FPAnalytics"].EI + ","
		+ modelInfo["FPAnalytics"].EO + ","
		+ modelInfo["FPAnalytics"].EQ + ","
		+ modelInfo["FPAnalytics"].FN + ","
		+ modelInfo["FPAnalytics"].FUNC_NA;
	}
	
	function toUseCaseEvaluationHeader() {
		return "EI,EO,EQ,FN,FUNC_NA";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {

		return useCaseInfo["FPAnalytics"].EI + ","
				+ useCaseInfo["FPAnalytics"].EO + ","
				+ useCaseInfo["FPAnalytics"].EQ + ","
				+ useCaseInfo["FPAnalytics"].FN + ","
				+ useCaseInfo["FPAnalytics"].FUNC_NA;
	}
	
	function toDomainModelEvaluationHeader() {
		return "DET,RET,ILF,EIF";
	}

	function toDomainModelEvaluationRow(domainModelInfo, index) {

		return domainModelInfo["FPAnalytics"].DET + ","
				+ domainModelInfo["FPAnalytics"].RET + ","
				+ domainModelInfo["FPAnalytics"].ILF + ","
				+ domainModelInfo["FPAnalytics"].EIF;
	}

	function evaluateUseCase(useCaseInfo) {
		
//		var useCaseInfo["FPAnalytics"] = useCaseInfo.UseCaseAnalytics;
//		
		useCaseInfo["FPAnalytics"] = {
		EI : 0,
		EO : 0,
		EQ : 0,
		FUNC_NA : 0,
		FN : 0
		}
		
		for ( var i in useCaseInfo.Diagrams) {
			var diagram = useCaseInfo.Diagrams[i];
			
			if (!diagram.DiagramAnalytics) {
				diagram.DiagramAnalytics = {};
			}
			
			var FUNC_NA = 0;
			var FN = 0;
			var EI = 0;
			var EO = 0;
			var EQ = 0;
			
			for ( var j in diagram.Paths) {
				var path = diagram.Paths[j];
				// console.log('--------Process Path-------');
				
				functionPointProcessor.processPath(path, diagram, useCaseInfo);
				
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


			diagram["FPEmpirics"] = {};
			
			diagram["FPEmpirics"].EI = EI;
			diagram["FPEmpirics"].EO = EO;
			diagram["FPEmpirics"].EQ = EQ;
			diagram["FPEmpirics"].FUNC_NA = FUNC_NA;
			diagram["FPEmpirics"].FN = FN;
			
			useCaseInfo["FPAnalytics"].EI += diagram["FPEmpirics"].EI;
			useCaseInfo["FPAnalytics"].EO += diagram["FPEmpirics"].EO;
			useCaseInfo["FPAnalytics"].EQ += diagram["FPEmpirics"].EQ;
			useCaseInfo["FPAnalytics"].FUNC_NA += diagram["FPEmpirics"].FUNC_NA;
			useCaseInfo["FPAnalytics"].FN += diagram["FPEmpirics"].FN;
		}
	}
	
	function evaluateDomainModel(domainModelInfo){

		domainModelInfo["FPAnalytics"] = {
		DET :0,
		RET :0,
		ILF :0,
		EIF :0
		}
		
		var ILFEvaluation = [ [ '', 'x>=1&&x<=19', 'x>=20&&x<=50', 'x>50' ],
				[ 'y==1', '7', '7', '10' ], [ 'y>=2&&y<=5', '7', '10', '15' ],
				[ 'y>5', '10', '15', '15' ], ];
		var EIFEvaluation = [ [ '', 'x>=1&&x<=19', 'x>=20&&x<=50', 'x>50' ],
				[ 'y==1', '5', '5', '7' ], [ 'y>=2&&y<=5', '5', '7', '10' ],
				[ 'y>5', '7', '10', '10' ], ];
		
		
		for ( var i in domainModelInfo["FPAnalytics"].Diagrams) {
			var diagram = domainModelInfo["FPAnalytics"].Diagrams[i];
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

			domainModelInfo["FPAnalytics"].DET += DET;
			domainModelInfo["FPAnalytics"].RET += RET;
			domainModelInfo["FPAnalytics"].ILF += ILF;
			domainModelInfo["FPAnalytics"].EIF += EIF;
		}
		
		return domainModelInfo["FPAnalytics"];

	}
	
	function evaluateModel(modelInfo) {

		modelInfo["FPAnalytics"] = {
				EI : 0,
				EO : 0,
				EQ : 0,
				FUNC_NA : 0,
				FN : 0,
				DET :0,
				RET :0,
				ILF :0,
				EIF :0,
		}

		if (modelInfo.DomainModel) {
			var domainModelInfo = modelInfo.DomainModel;
//			domainModelInfo["FPAnalytics"] = domainModelInfo.DomainModelAnalytics;
			modelInfo["FPAnalytics"].DET += domainModelInfo["FPAnalytics"].DET;
			modelInfo["FPAnalytics"].RET += domainModelInfo["FPAnalytics"].RET;
			modelInfo["FPAnalytics"].ILF += domainModelInfo["FPAnalytics"].ILF;
			modelInfo["FPAnalytics"].EIF += domainModelInfo["FPAnalytics"].EIF;
		}
		
		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];
//			var useCaseInfo["FPAnalytics"] = useCaseInfo.UseCaseAnalytics;
			modelInfo["FPAnalytics"].EI = useCaseInfo["FPAnalytics"].EI;
			modelInfo["FPAnalytics"].EO = useCaseInfo["FPAnalytics"].EO;
			modelInfo["FPAnalytics"].EQ = useCaseInfo["FPAnalytics"].EQ;
			modelInfo["FPAnalytics"].FUNC_NA = useCaseInfo["FPAnalytics"].FUNC_NA;
			modelInfo["FPAnalytics"].FN = useCaseInfo["FPAnalytics"].FN;
		}
		
		return modelInfo["FPAnalytics"];

	}

	function evaluateRepo(repoInfo, callbackfunc) {
		repoInfo["FPAnalytics"] = {
				EI : 0,
				EO : 0,
				EQ : 0,
				FUNC_NA : 0,
				FN : 0,
				DET :0,
				RET :0,
				ILF :0,
				EIF :0,
		}
		// initiate the fields in repo analytics;

		for ( var i in repoInfo.models) {
			var modelInfo = repoInfo.models[i];
//			var modelInfo["FPAnalytics"] = modelInfo.ModelAnalytics;
			
			repoInfo["FPAnalytics"].DET += modelInfo["FPAnalytics"].DET;
			repoInfo["FPAnalytics"].RET += modelInfo["FPAnalytics"].RET;
			repoInfo["FPAnalytics"].ILF += modelInfo["FPAnalytics"].ILF;
			repoInfo["FPAnalytics"].EIF += modelInfo["FPAnalytics"].EIF;
			repoInfo["FPAnalytics"].EI += modelInfo["FPAnalytics"].EI;
			repoInfo["FPAnalytics"].EO += modelInfo["FPAnalytics"].EO;
			repoInfo["FPAnalytics"].EQ += modelInfo["FPAnalytics"].EQ;
			repoInfo["FPAnalytics"].FUNC_NA += modelInfo["FPAnalytics"].FUNC_NA;
			repoInfo["FPAnalytics"].FN += modelInfo["FPAnalytics"].FN;
		}
		
		return repoInfo["FPAnalytics"];
	}



	module.exports = {
		toModelEvaluationHeader : toModelEvaluationHeader,
		toModelEvaluationRow : toModelEvaluationRow,
		toUseCaseEvaluationHeader: toUseCaseEvaluationHeader,
		toUseCaseEvaluationRow: toUseCaseEvaluationRow,
		toDomainModelEvaluationHeader:toDomainModelEvaluationHeader,
		toDomainModelEvaluationRow:toDomainModelEvaluationRow,
		evaluateUseCase : evaluateUseCase,
		evaluateDomainModel: evaluateDomainModel,
		evaluateModel : evaluateModel,
		evaluateRepo : evaluateRepo,
		loadUseCaseEmpirics: loadUseCaseEmpirics
	}

}())