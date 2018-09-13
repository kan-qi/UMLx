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
//		return "DET,RET,ILF,EIF,EI,EO,EQ,FN,FUNC_NA";
		return "DET,RET,ILF,EIF,EI,EO,EQ,FN,FP";
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
		+ modelInfo["FPAnalytics"].FP;
//		+ modelInfo["FPAnalytics"].FUNC_NA;
	}
	
	function toUseCaseEvaluationHeader() {
//		return "EI,EO,EQ,FN,FUNC_NA";
		return "EI,EO,EQ,FN";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {

		return useCaseInfo["FPAnalytics"].EI + ","
				+ useCaseInfo["FPAnalytics"].EO + ","
				+ useCaseInfo["FPAnalytics"].EQ + ","
				+ useCaseInfo["FPAnalytics"].FN;
//				+ useCaseInfo["FPAnalytics"].FUNC_NA;
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
//		FUNC_NA : 0,
		FN : 0
		}
		
//		for ( var i in useCaseInfo.Diagrams) {
//			var diagram = useCaseInfo.Diagrams[i];
//			
//			if (!useCaseInfo.DiagramAnalytics) {
//				useCaseInfo.DiagramAnalytics = {};
//			}
			
//			var FUNC_NA = 0;
			var FN = 0;
			var EI = 0;
			var EO = 0;
			var EQ = 0;
			
			var EIEvaluation = [ [ '', 'x>=1&&x<=4', 'x>=5&&x<=15', 'x>16' ],
				[ 'y==1', '3', '3', '4' ], [ 'y==2', '3', '4', '6' ],
				[ 'y>=3', '4', '6', '6' ], ];
			var EOEvaluation = [ [ '', 'x>=1&&x<=4', 'x>=5&&x<=15', 'x>16' ],
				[ 'y==1', '4', '4', '5' ], [ 'y==2', '4', '5', '6' ],
				[ 'y>=3', '5', '6', '6' ], ];
			var EQEvaluation = [ [ '', 'x>=1&&x<=4', 'x>=5&&x<=15', 'x>16' ],
				[ 'y==1', '3', '3', '4' ], [ 'y==2', '3', '4', '6' ],
				[ 'y>=3', '4', '6', '6' ], ];
			
			for ( var i in useCaseInfo.Transactions) {
				var transaction = useCaseInfo.Transactions[i];
				// console.log('--------Process Transaction-------');
				
				functionPointProcessor.processTransaction(transaction, useCaseInfo);
				
				var functionalOperations = transaction["FPAnalytics"].Functional;
				
				var DET = transaction["FPAnalytics"].DET;
				var FTR = transaction["FPAnalytics"].FTR;
				
				if (functionalOperations.indexOf("EI") > -1) {
					EI += assessComplexity(DET, FTR, EIEvaluation);
//					EI++;
					
				}
				if (functionalOperations.indexOf("DM") > -1) {
					DM += assessComplexity(DET, FTR, EOEvaluation);
//					DM++;
				}
				else {
					EQ += assessComplexity(DET, FTR, EQEvaluation);
//					EQ++;
				}
				
//				if(functionalOperations.indexOf("FUNC_NA") > -1){
//					FUNC_NA++;
//				}
//				else {
					FN ++;
//				}
				
			}


//			diagram["FPEmpirics"] = {};
			
			useCaseInfo["FPAnalytics"].EI = EI;
			useCaseInfo["FPAnalytics"].EO = EO;
			useCaseInfo["FPAnalytics"].EQ = EQ;
//			useCaseInfo["FPAnalytics"].FUNC_NA = FUNC_NA;
			useCaseInfo["FPAnalytics"].FN = FN;
			
//			useCaseInfo["FPAnalytics"].EI += diagram["FPEmpirics"].EI;
//			useCaseInfo["FPAnalytics"].EO += diagram["FPEmpirics"].EO;
//			useCaseInfo["FPAnalytics"].EQ += diagram["FPEmpirics"].EQ;
//			useCaseInfo["FPAnalytics"].FUNC_NA += diagram["FPEmpirics"].FUNC_NA;
//			useCaseInfo["FPAnalytics"].FN += diagram["FPEmpirics"].FN;
//		}
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
		
		for(var i in domainModelInfo.Elements){
			var element = domainModelInfo.Elements[i];
			
			functionPointProcessor.	processElement(element, domainModelInfo);
			
			var DET = element.attributeNum;
			var RET = 1;
			var ILF = 0;
			var EIF = 0;
			
			//counting for ILF
			if(element['FPAnalytics'].ILF){
				
				ILF = assessComplexity(DET, RET, ILFEvaluation);

			}
			// counting for EIF
			else{

				EIF = assessComplexity(DET, RET, EIFEvaluation);

			}

			domainModelInfo["FPAnalytics"].DET += DET;
			domainModelInfo["FPAnalytics"].RET += RET;
			domainModelInfo["FPAnalytics"].ILF += ILF;
			domainModelInfo["FPAnalytics"].EIF += EIF;
			
		}
			
		return domainModelInfo["FPAnalytics"];

	}
	
	function assessComplexity(x, y, weightingSchema){
		var weight = 0;
		for (var j = 1; j < weightingSchema[0].length; j++) {
			var xCondition = weightingSchema[0][j];
			var xEvaluationStr = "var x="
					+ x
					+ ";if("
					+ xCondition
					+ "){module.exports = true;}else{module.exports = false;}";
			var xResult = eval(xEvaluationStr);
			if (xResult) {
				for (var k = 1; k < weightingSchema.length; k++) {
					var yCondition = weightingSchema[k][0];
					var yEvaluationStr = "var y="
							+ y
							+ ";if("
							+ yCondition
							+ "){module.exports = true;}else{module.exports = false;}";
					var yResult = eval(yEvaluationStr);
					// console.log(yResult);
					if (yResult) {
						weight = Number(weightingSchema[k][j]);
						break;
					}
				}
				break;
			}
		}
		
		if(weight == 0){
			weight = Number(weightingSchema[2][2]);
		}
		
		return weight;
	}
	
	function evaluateModel(modelInfo) {

		modelInfo["FPAnalytics"] = {
				EI : 0,
				EO : 0,
				EQ : 0,
//				FUNC_NA : 0,+
				FN : 0,
				DET :0,
				RET :0,
				ILF :0,
				EIF :0,
		}

		if (modelInfo.DomainModel) {
			var domainModelInfo = modelInfo.DomainModel;
			if(domainModelInfo["FPAnalytics"]){
			modelInfo["FPAnalytics"].DET += domainModelInfo["FPAnalytics"].DET;
			modelInfo["FPAnalytics"].RET += domainModelInfo["FPAnalytics"].RET;
			modelInfo["FPAnalytics"].ILF += domainModelInfo["FPAnalytics"].ILF;
			modelInfo["FPAnalytics"].EIF += domainModelInfo["FPAnalytics"].EIF;
			}
		}
		
		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];
			if(useCaseInfo["FPAnalytics"]){
			modelInfo["FPAnalytics"].EI = useCaseInfo["FPAnalytics"].EI;
			modelInfo["FPAnalytics"].EO = useCaseInfo["FPAnalytics"].EO;
			modelInfo["FPAnalytics"].EQ = useCaseInfo["FPAnalytics"].EQ;
//			modelInfo["FPAnalytics"].FUNC_NA = useCaseInfo["FPAnalytics"].FUNC_NA;
			modelInfo["FPAnalytics"].FN = useCaseInfo["FPAnalytics"].FN;
			}
		}
		
		modelInfo["FPAnalytics"].FP = domainModelInfo["FPAnalytics"].ILF + domainModelInfo["FPAnalytics"].EIF + useCaseInfo["FPAnalytics"].EI + useCaseInfo["FPAnalytics"].EO + useCaseInfo["FPAnalytics"].EQ; 
		
		return modelInfo["FPAnalytics"];

	}

	function evaluateRepo(repoInfo, callbackfunc) {
		repoInfo["FPAnalytics"] = {
				EI : 0,
				EO : 0,
				EQ : 0,
//				FUNC_NA : 0,
				FN : 0,
				DET :0,
				RET :0,
				ILF :0,
				EIF :0,
				FP : 0
		}
		// initiate the fields in repo analytics;

		for ( var i in repoInfo.models) {
			var modelInfo = repoInfo.models[i];
			
			if(modelInfo["FPAnalytics"]){
			repoInfo["FPAnalytics"].DET += modelInfo["FPAnalytics"].DET;
			repoInfo["FPAnalytics"].RET += modelInfo["FPAnalytics"].RET;
			repoInfo["FPAnalytics"].ILF += modelInfo["FPAnalytics"].ILF;
			repoInfo["FPAnalytics"].EIF += modelInfo["FPAnalytics"].EIF;
			repoInfo["FPAnalytics"].EI += modelInfo["FPAnalytics"].EI;
			repoInfo["FPAnalytics"].EO += modelInfo["FPAnalytics"].EO;
			repoInfo["FPAnalytics"].EQ += modelInfo["FPAnalytics"].EQ;
//			repoInfo["FPAnalytics"].FUNC_NA += modelInfo["FPAnalytics"].FUNC_NA;
			repoInfo["FPAnalytics"].FN += modelInfo["FPAnalytics"].FN;
			repoInfo["FPAnalytics"].FP += modelInfo["FPAnalytics"].FP;
			}
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