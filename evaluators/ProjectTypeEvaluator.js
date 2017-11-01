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
	
	function loadModelEmpirics(modelLoad, modelInfo, modelIndex) {

		if(!modelInfo["ProjectTypeEmpirics"]){
			modelInfo["ProjectTypeEmpirics"] = {
				projectType: ""
				}
		}
		
		modelInfo['ProjectTypeEmpirics'].projectType = modelLoad.projectType;
		
	}
	
	function toModelEvaluationHeader(){
		return "Type";
	}
	
	function toModelEvaluationRow(modelInfo, index){
		if(modelInfo["ProjectTypeEmpirics"]){
			return modelInfo['ProjectTypeEmpirics'].projectType;
		}
		
		return "";
	}
	
	
	module.exports = {
			toModelEvaluationHeader: toModelEvaluationHeader,
			toModelEvaluationRow: toModelEvaluationRow
	}
	
	
}())