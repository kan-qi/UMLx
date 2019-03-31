/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	var sequenceDiagramParser= require("./SequenceDiagramParser.js");
	var activityDiagramParser= require("./ActivityDiagramParser.js");
	//var analysisDiagramParser= require("./AnalysisDiagramParser.js");
	//var useCaseDiagramParser = require("./UseCaseDiagramParser.js");
	var TransactionIdentifier = require("./TransactionIdentification.js");
	
	var domainModelSearchUtil = require("../../utils/DomainModelSearchUtil.js");
	
	function contains(arr, obj) {  
	    var i = arr.length;  
	    while (i--) {  
	        if (arr[i] === obj) {  
	            return true;  
	        }  
	    }  
	    return false;  
	}  
	
	function standardizeName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}
	
	function createDomainElement(XMIClass){
		var XMIAttributes = jp.query(XMIClass, '$.ownedAttribute[?(@[\'$\'][\'xmi:type\']==\'uml:Property\')]');
		var attributes = new Array();
		
		for(var i in XMIAttributes){
			var XMIAttribute = XMIAttributes[i];
			var types = jp.query(XMIAttribute, '$.type[?(@[\'$\'][\'xmi:idref\'])]');
			var type = "EAJava_void";
			if(types && types.length > 0){
				type = types[0]['$']['xmi:idref'];
			}
			
			console.log(XMIAttribute);
			var attribute = {
					Name: XMIAttribute['$']['name'],
					Type: type,
					isStatic: XMIAttribute['$']['isStatic']
			}
			attributes.push(attribute);
		}

		var XMIOperations = jp.query(XMIClass, '$.ownedOperation[?(@[\'$\'][\'xmi:id\'])]');
		var operations = new Array();

		for(var i in XMIOperations){
			var XMIOperation = XMIOperations[i];
			var XMIParameters = jp.query(XMIOperation, '$.ownedParameter[?(@[\'$\'][\'xmi:id\'])]');
			var parameters = [];
			for(var j in XMIParameters){
				var XMIParameter = XMIParameters[j];
				var parameter = {
						Name: XMIParameter['$']['name'],
						Type: XMIParameter['$']['type']
				}
				parameters.push(parameter);
			}
			
			var operation = {
					Name: XMIOperation['$']['name'],
					Visibility: XMIOperation['$']['visibility'],
					Parameters: parameters
			}
			operations.push(operation);
		}

		return {
				_id: XMIClass['$']['xmi:id'],
				Name: XMIClass['$']['name'],
				Operations: operations,
				Attributes: attributes
			}
	}
	
	function extractUserSystermInteractionModel(xmiString, workDir, ModelOutputDir, ModelAccessDir, callbackfunc) {
			
		var	XMIUMLModel = xmiString['uml:Model'];
		
		var CustomProfiles = {};
		
		var Model = {
				Actors:[],
				Roles:[],
				UseCases: [],
				DomainModel: {
					Elements: [],
					Usages: [],
					Realizations:[],
					Associations: [],
//					Inheritances: [],
					Generalizations: [],
					OutputDir : ModelOutputDir+"/domainModel",
					AccessDir : ModelAccessDir+"/domainModel",
					DiagramType : "class_diagram",
                    InheritanceStats: null
				},
				OutputDir: ModelOutputDir,
				AccessDir: ModelAccessDir
				
		};
		
		var DomainElementsBySN = {};
		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
		var XMIClassesByStandardizedName = [];
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];
			
			var domainElement = createDomainElement(XMIClass);
			
			DomainElementsBySN[domainModelSearchUtil.standardizeName(domainElement.Name)] = domainElement;
			
			XMIClassesByStandardizedName[standardizeName(XMIClass['$']['name'])] = XMIClass;
			
			Model.DomainModel.Elements.push(domainElement);
		}
	   
	 //create a catelog for the actors.
		var XMIActors = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		var ActorsByID = {};
		for(var i in XMIActors){
			var XMIActor = XMIActors[i];
			var actor = {
					Name: XMIActor['$']['name'],
					_id: XMIActor['$']['xmi:id']
			}
			
			ActorsByID[XMIActor['$']['xmi:id']] = actor;
			
			Model.Actors.push(actor);
		}
		
		//search for the use cases
		var XMIUseCases = jp.query(xmiString, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
		
		XMIUseCases = XMIUseCases.concat(jp.query(XMIUMLModel, '$..[\'uml:Diagram\'][?(@[\'$\'][\'diagramType\']==\'ActivityDiagram\')]'));
		
		//parsing use cases.
		for(var i in XMIUseCases){
			var XMIUseCase = XMIUseCases[i];
			var fileName = XMIUseCase['$']['xmi:id'];
			
			var UseCase = {
					_id: XMIUseCase['$']['xmi:id'],
					Name: XMIUseCase['$']['name'],
					PrecedenceRelations : [],
					Activities : [],
					OutputDir : ModelOutputDir+"/"+fileName,
					AccessDir : ModelAccessDir+"/"+fileName,
					DiagramType : "none",
//					BusinessValue: BusinessValues[XMIUseCase['$']['xmi:id']],
//					PMEffort: PMEstimates[XMIUseCase['$']['xmi:id']],
//					DEVEffort: DEVEstimates[XMIUseCase['$']['xmi:id']]
//					Attachment: XMIUseCase
			}
			
			//adding the extra values that are tagged to the use cases
			
			sequenceDiagramParser.parseSequenceDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, ActorsByID);
			activityDiagramParser.parseActivityDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, XMIUMLModel);
			
			UseCase.Transactions = TransactionIdentifier.traverseUseCaseForTransactions(UseCase);
			
			Model.UseCases.push(UseCase);
		}
		
		if(callbackfunc){
			callbackfunc(Model);
		}
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("XMI_model_output_visual_paradigm", Model);
	}
	
	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel
	}
}());
