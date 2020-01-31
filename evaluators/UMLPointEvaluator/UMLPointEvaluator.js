/**
 * http://usejsdoc.org/
 * 
 * This is evaluator module works as a filter mostly to output the necessary
 * information from model analysis to model evaluation.
 * 
 * Number of actors (NOA)
 * Number of use cases (NOUC)
 * Number of roles (NOR)
 * Average Number of Actors per Use Case (ANA_UC)
 * Average Number of Roles per Use Case (ANR_UC)
 * UCP= NOA+NOUC+NOR
 * 
 * Number of Classes (NOC)
 * Number of Inheritance Relationships (NOIR)
 * Number of Use Relationships (NOUR)
 * Number of Realize Relationships (NORR)
 * Number of Methods (NOM)
 * Number of Parameters (NOP)
 * Number of Class Attributes (NOCA)
 * Number of Associations (NOASSOC)
 * Average Number of Methods per Class (ANM_CLS)
 * Average Number of Parameters per Class (ANP_CLS)
 * Average Number of Class Attributes per Class(ANCA_CLS)
 * Average Number of Associations per Class(ANASSOC_CLS)
 * Average Number of Relationships per Class(ANREL_CLS)

 * Class Points (CP)
 * CP = NOC+NOIR+NOUR+NORR+NOM+NOCA+NOASS
 * 
 */

(function() {

	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var umlFileManager = require('../../UMLFileManager');
	var functionPointProcessor = require('./FunctionPointProcessor.js');
	
	function toModelEvaluationHeader() {
		return "NOS,NOR,NOM,OP";
	}

	function toModelEvaluationRow(modelInfo, index) {

		return modelInfo["UMLPointAnalytics"].NOS + ","
		+ modelInfo["UMLPointAnalytics"].NOR + ","
		+ modelInfo["UMLPointAnalytics"].NOM + ","
		+ modelInfo["UMLPointAnalytics"].OP;
	}

	function evaluateModel(modelInfo) {
		
		modeInfo["UMLPointAnalytics"] = {
		NOS : 0,
		NOR : 0,
		NOM : 0,
		OP : 0
		}
		
			var NOS = 0;
			var NOR = 0;
			var NOM = 0;
			
			var NOSEvaluation = [ [ '', 'x>=1&&x<4', 'x>=4&&x<8', 'x>=8' ],
				[ 'y>=1&&y<3', '1', '1', '2' ], [ 'y>=3&&y<=7', '1', '2', '3' ],
				[ 'y>=8', '2', '3', '3' ], ];
			var NOREvaluation = [ [ '', 'x>=1&&x<4', 'x>=4&&x<8', 'x>=8' ],
				[ 'y>=0&&y<=1', '4', '4', '5' ], [ 'y>=2&&y<=3', '4', '5', '6' ],
				[ 'y>=4', '5', '6', '6' ], ];
			var NOMEvaluation = [ [ '', 'x>-Infinity'],
				[ 'y<Infinity', '10']];
//			
//			for ( var i in modeInfo.Transactions) {
//				var transaction = modeInfo.Transactions[i];
//				// console.log('--------Process Transaction-------');
//				
//				functionPointProcessor.processTransaction(transaction, modeInfo);
//				
//				var functionalOperations = transaction["UMLPointAnalytics"].Functional;
//				
//				var DET = transaction["UMLPointAnalytics"].DET;
//				var FTR = transaction["UMLPointAnalytics"].FTR;
//				
//				if (functionalOperations.indexOf("EI") > -1) {
//					EI += assessComplexity(DET, FTR, EIEvaluation);
////					EI++;
//					
//				}
//				if (functionalOperations.indexOf("DM") > -1) {
//					DM += assessComplexity(DET, FTR, EOEvaluation);
////					DM++;
//				}
//				else {
//					EQ += assessComplexity(DET, FTR, EQEvaluation);
////					EQ++;
//				}
//				
////				if(functionalOperations.indexOf("FUNC_NA") > -1){
////					FUNC_NA++;
////				}
////				else {
//					FN ++;
////				}
//				
//			}

			modeInfo["UMLPointAnalytics"].NOS = NOS;
			modeInfo["UMLPointAnalytics"].NOR = NOR;
			modeInfo["UMLPointAnalytics"].NOM = NOM;
			modeInfo["UMLPointAnalytics"].OP = OP;
			
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

	function evaluateRepo(repoInfo, callbackfunc) {
		repoInfo["UMLPointAnalytics"] = {
				NOS : 0,
				NOR : 0,
				NOM : 0,
				OP : 0
		}
		// initiate the fields in repo analytics;

		for ( var i in repoInfo.models) {
			var modelInfo = repoInfo.models[i];
			
			if(modelInfo["UMLPointAnalytics"]){
			repoInfo["UMLPointAnalytics"].NOS += modelInfo["UMLPointAnalytics"].NOS;
			repoInfo["UMLPointAnalytics"].NOR += modelInfo["UMLPointAnalytics"].NOR;
			repoInfo["UMLPointAnalytics"].NOM += modelInfo["UMLPointAnalytics"].NOM;
			repoInfo["UMLPointAnalytics"].OP += modelInfo["UMLPointAnalytics"].OP;
			}
		}
		
		return repoInfo["UMLPointAnalytics"];
	}

	module.exports = {
		toModelEvaluationHeader : toModelEvaluationHeader,
		toModelEvaluationRow : toModelEvaluationRow,
		evaluateModel : evaluateModel,
		evaluateRepo : evaluateRepo
	}

}())