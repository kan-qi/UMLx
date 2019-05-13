/**
 * http://usejsdoc.org/
 * 
 * This evaluator module evaluates the uploaded source code for the number of lines of source code etc. 
 * The analysis assumes the reference to the source code dir, and using the integrated cloc and UCC to evaluate the lines of source code.
 * 
 * 
 */

/**
 * http://usejsdoc.org/
 * 
 * Integrate use case point evaluator to calculate eucp, exucp, ducp
 * 
 * Includes the methods  to calculate EUCP, EXUCP, DUCP, 
 */


(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	
	
	function toModelEvaluationHeader(){
		return "SLOC";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		
		return modelInfo['CodeAnalysis'].SLOC;
	}

	function evaluateModel(modelInfo){
		if(!modelInfo['CodeAnalysis']){
			modelInfo['CodeAnalysis'] = {
			SLOC : 0
			}
		}
		
		modelInfo['CodeAnalysis'].SLOC = calculateSloc(modelInfo.url);
		
	}
	
	function evaluateRepo(repoInfo, callbackfunc){
		
		if(!repoInfo['CodeAnalysis']){
			repoInfo['CodeAnalysis'] = {
			SLOC : 0
			}
		}
		
		repoInfo['CodeAnalysis'].SLOC = 0;
		
		for(var i in repoInfo.Models){
			var modelInfo = repoInfo.Models[i];
			repoInfo['CodeAnalysis'].SLOC += modelInfo['CodeAnalysis'].SLOC;
		}
		
	}
	
	function calculateSloc(url){
		return 0;
	}
	

	module.exports = {
		toModelEvaluationHeader: toModelEvaluationHeader,
		toModelEvaluationRow: toModelEvaluationRow,
		evaluateModel: evaluateModel,
		evaluateRepo: evaluateRepo
	}
	
}())