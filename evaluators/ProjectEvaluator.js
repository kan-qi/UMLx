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
		return "Type";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		var modelEmpirics = modelInfo.ModelEmpirics;
		
		return modelEmpirics.Type;
	}
	
	
	module.exports = {
			toModelEvaluationHeader: toModelEvaluationHeader,
			toModelEvaluationRow: toModelEvaluationRow
	}
	
	
}())