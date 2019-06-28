/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
//	var xml2js = require('xml2js');
//	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function contains(arr, obj) {  
	    var i = arr.length;  
	    while (i--) {  
	        if (arr[i] === obj) {  
	            return true;  
	        }  
	    }  
	    return false;  
	}  
	
	function parseUseCaseDiagram(XMIUseCases, XMIUMLModel, Model){

		//create a catelog for the actors.
		var XMIActors = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		var ActorsByID = {};
		var actors =[];
		var roles = [];
		for(var i in XMIActors){
			var XMIActor = XMIActors[i];
			actors.push(XMIActor['$']);
			if(!contains(roles, XMIActor['$']['name'])){
				roles.push(XMIActor['$']['name']);
			}
			ActorsByID[XMIActor['$']['xmi:id']] = {
					Name: XMIActor['$']['name'],
					_id: XMIActor['$']['xmi:id']
			}		
		}
		
		console.log(XMIUMLModel);
		
		var useCaseNum = 0;
		for(var i in XMIUseCases){
			var XMIUseCase = XMIUseCases[i];
			useCaseNum++;
			var UseCase = {
					_id: XMIUseCase['$']['xmi:id'],
					Name: XMIUseCase['$']['name'],
					PrecedenceRelations : [],
					Activities : [],
//					Attachment: XMIUseCase
			}
			Model.Actors = actors;
			Model.Roles= roles;
//			parseSequenceDiagram(UseCase, XMIUseCase, XMIClassesByStandardizedName, DomainElementsByID);
//			parseActivityDiagram(UseCase, XMIUseCase, XMIClassesByStandardizedName, DomainElementsByID);
		
		}
		
	}


	module.exports = {
			parseUseCaseDiagram : parseUseCaseDiagram
	}
}());