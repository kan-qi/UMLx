/**
 * http://usejsdoc.org/
 * 
 * This is evaluator module works as a filter mostly to output the necessary
 * information from model analysis to model evaluation.
 * 
 * This file implements IFPUG, COSMIC, MKII for benchmarking with the existing 
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
		return "DET,RET,ILF,EIF,EI,EO,EQ,FN,IFPUG,NI,NE,MKII,EXT,ERY,RED,WRT,COSMIC";
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
		+ modelInfo["FPAnalytics"].IFPUG + ","
		+ modelInfo["FPAnalytics"].NI + ","
		+ modelInfo["FPAnalytics"].NE + ","
		+ modelInfo["FPAnalytics"].MKII + ","
		+ modelInfo["FPAnalytics"].EXT + ","
		+ modelInfo["FPAnalytics"].ERY + ","
		+ modelInfo["FPAnalytics"].RED + ","
		+ modelInfo["FPAnalytics"].WRT + ","
		+ modelInfo["FPAnalytics"].COSMIC;
	}
	
	function toUseCaseEvaluationHeader() {
		return "EI,EO,EQ,FN,NI,NE,EXT,ERY,RED,WRT";
	}

	function toUseCaseEvaluationRow(useCaseInfo, index) {

		return useCaseInfo["FPAnalytics"].EI + ","
				+ useCaseInfo["FPAnalytics"].EO + ","
				+ useCaseInfo["FPAnalytics"].EQ + ","
				+ useCaseInfo["FPAnalytics"].FN + ","
				+ useCaseInfo["FPAnalytics"].NI + ","
				+ useCaseInfo["FPAnalytics"].NE + ","
				+ useCaseInfo["FPAnalytics"].EXT + ","
				+ useCaseInfo["FPAnalytics"].ERY + ","
				+ useCaseInfo["FPAnalytics"].RED + ","
				+ useCaseInfo["FPAnalytics"].WRT;
	}
	
	function toDomainModelEvaluationHeader() {
		return "DET,RET,ILF,EIF,OBJ";
	}

	function toDomainModelEvaluationRow(domainModelInfo, index) {

		return domainModelInfo["FPAnalytics"].DET + ","
				+ domainModelInfo["FPAnalytics"].RET + ","
				+ domainModelInfo["FPAnalytics"].ILF + ","
				+ domainModelInfo["FPAnalytics"].EIF + ","
				+ domainModelInfo["FPAnalytics"].OBJ;
	}
	

	function evaluateDomainModel(domainModelInfo){

		domainModelInfo["FPAnalytics"] = {
		//IFPUG
		DET :0,
		RET :0,
		ILF :0,
		EIF :0,
		//MKII
		OBJ: 0,
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
			
			domainModelInfo["FPAnalytics"].OBJ += 1;
		}
			
		return domainModelInfo["FPAnalytics"];

	}


	function evaluateUseCase(useCaseInfo) {
		
		useCaseInfo["FPAnalytics"] = {
		//IFPUG
		EI : 0,
		EO : 0,
		EQ : 0,
		FN : 0,
		//MKII
		NI: 0,
		NE: 0,
		//COSMIC
		EXT: 0,
		ERY: 0,
		RED: 0,
		WRT: 0
		}
		
			var FN = 0;
			var EI = 0;
			var EO = 0;
			var EQ = 0;
			
			var NI = 0;
			var NE = 0;
			
			//COSMIC
			var EXT = 0;
			var ERY = 0;
			var RED = 0;
			var WRT = 0;
			
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
					NI++;
					
					ERY++;
					WRT++;
				}
				else if (functionalOperations.indexOf("EO") > -1) {
					DM += assessComplexity(DET, FTR, EOEvaluation);
					NE++;
					
					EXT++;
					RED++;
				}
				else {
					EQ += assessComplexity(DET, FTR, EQEvaluation);
					NI++;
					NE++;

					ERY++;
					EXT++;
					WRT++;
					RED++;
				}
				
					FN ++;
				
			}

			useCaseInfo["FPAnalytics"].EI = EI;
			useCaseInfo["FPAnalytics"].EO = EO;
			useCaseInfo["FPAnalytics"].EQ = EQ;
			useCaseInfo["FPAnalytics"].FN = FN;
			
			useCaseInfo["FPAnalytics"].NI = NI;
			useCaseInfo["FPAnalytics"].NE = NE;
			
			useCaseInfo["FPAnalytics"].ERY = ERY;
			useCaseInfo["FPAnalytics"].EXT = EXT;
			useCaseInfo["FPAnalytics"].WRT = WRT;
			useCaseInfo["FPAnalytics"].RED = RED;
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
				//IFPUG
				EI : 0,
				EO : 0,
				EQ : 0,
				FN : 0,
				DET :0,
				RET :0,
				ILF :0,
				EIF :0,
				//MKII
				NI: 0,
				NE: 0,
				OBJ: 0,
				//COSMIC
				EXT: 0,
				ERY: 0,
				RED: 0,
				WRT: 0
				
		}

		if (modelInfo.DomainModel) {
			var domainModelInfo = modelInfo.DomainModel;
			if(domainModelInfo["FPAnalytics"]){
			modelInfo["FPAnalytics"].DET += domainModelInfo["FPAnalytics"].DET;
			modelInfo["FPAnalytics"].RET += domainModelInfo["FPAnalytics"].RET;
			modelInfo["FPAnalytics"].ILF += domainModelInfo["FPAnalytics"].ILF;
			modelInfo["FPAnalytics"].EIF += domainModelInfo["FPAnalytics"].EIF;
			modelInfo["FPAnalytics"].OBJ += domainModelInfo["FPAnalytics"].OBJ;
			}
		}
		
		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];
			if(useCaseInfo["FPAnalytics"]){
			modelInfo["FPAnalytics"].EI += useCaseInfo["FPAnalytics"].EI;
			modelInfo["FPAnalytics"].EO += useCaseInfo["FPAnalytics"].EO;
			modelInfo["FPAnalytics"].EQ += useCaseInfo["FPAnalytics"].EQ;
			modelInfo["FPAnalytics"].FN += useCaseInfo["FPAnalytics"].FN;
			modelInfo["FPAnalytics"].NI += useCaseInfo["FPAnalytics"].NI;
			modelInfo["FPAnalytics"].NE += useCaseInfo["FPAnalytics"].NE;
			modelInfo["FPAnalytics"].EXT += useCaseInfo["FPAnalytics"].EXT;
			modelInfo["FPAnalytics"].ERY += useCaseInfo["FPAnalytics"].ERY;
			modelInfo["FPAnalytics"].RED += useCaseInfo["FPAnalytics"].RED;
			modelInfo["FPAnalytics"].WRT += useCaseInfo["FPAnalytics"].WRT;
			}
		}
		
		
		modelInfo["FPAnalytics"].IFPUG = modelInfo["FPAnalytics"].ILF + modelInfo["FPAnalytics"].EIF + modelInfo["FPAnalytics"].EI + modelInfo["FPAnalytics"].EO + modelInfo["FPAnalytics"].EQ;
		
		modelInfo["FPAnalytics"].MKII  = modelInfo["FPAnalytics"].NI*0.58 + modelInfo["FPAnalytics"].NE*1.66+ modelInfo["FPAnalytics"].OBJ*0.26;
		
		modelInfo["FPAnalytics"].COSMIC  = modelInfo["FPAnalytics"].EXT + modelInfo["FPAnalytics"].ERY + modelInfo["FPAnalytics"].RED + modelInfo["FPAnalytics"].WRT;
		
		return modelInfo["FPAnalytics"];

	}

	function evaluateRepo(repoInfo, callbackfunc) {
		repoInfo["FPAnalytics"] = {
				EI : 0,
				EO : 0,
				EQ : 0,
				FN : 0,
				DET :0,
				RET :0,
				ILF :0,
				EIF :0,
				IFPUG : 0,
				//MKII
				NI: 0,
				NE: 0,
				OBJ: 0,
				MKII: 0,
				//COSMIC
				EXT: 0,
				ERY: 0,
				RED: 0,
				WRT: 0,
				COSMIC: 0
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
			repoInfo["FPAnalytics"].FN += modelInfo["FPAnalytics"].FN;
			repoInfo["FPAnalytics"].IFPUG += modelInfo["FPAnalytics"].IFPUG;
			repoInfo["FPAnalytics"].NI += modelInfo["FPAnalytics"].NI;
			repoInfo["FPAnalytics"].NE += modelInfo["FPAnalytics"].NE;
			repoInfo["FPAnalytics"].MKII += modelInfo["FPAnalytics"].MKII;
			repoInfo["FPAnalytics"].EXT += modelInfo["FPAnalytics"].EXT;
			repoInfo["FPAnalytics"].ERY += modelInfo["FPAnalytics"].ERY;
			repoInfo["FPAnalytics"].RED += modelInfo["FPAnalytics"].RED;
			repoInfo["FPAnalytics"].WRT += modelInfo["FPAnalytics"].WRT;
			repoInfo["FPAnalytics"].COSMIC += modelInfo["FPAnalytics"].COSMIC;
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