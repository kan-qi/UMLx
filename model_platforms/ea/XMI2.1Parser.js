/**
 * This module is used to parse different elements and also relationships (e.g. generalizations) in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	var sequenceDiagramParser= require("./SequenceDiagramParser.js");
	var activityDiagramParser= require("./ActivityDiagramParser.js");
	var analysisDiagramParser= require("./AnalysisDiagramParser.js");
	var useCaseDiagramParser = require("./UseCaseDiagramParser.js");
	var TransactionIdentifier = require("./TransactionIdentification.js");
	var visualSprintDiagramParser = require("./VisualSprintDiagramParser.js");
	
	var domainModelSearchUtil = require("../../utils/DomainModelSearchUtil.js");
	var plantUMLUtil = require("../../utils/PlantUMLUtil.js");
	
	var umlFileManager = require('../../UMLFileManager');

	/*
	 * The actual parsing method, which take xmi file as the input and construct a user-system interaction model with an array of use cases and a domain model.
	 * 
	 * The model has the following structure:
	 * 
	 * model = {
	 * 	domainModel:{}
	 *  useCases: []
	 * }
	 * 
	 * useCase = {
					id: XMIUseCase['$']['xmi:id'],
					Name: XMIUseCase['$']['name'],
					precedenceRelations : [],
					Activities : [],
					Attachment: XMIUseCase
	 * 
	 * }
	 * 
	 * activity = {
						Type: "message",
						Name: XMIMessage['$']['name'],
						id: XMIMessage['$']['xmi:id'],
						Attachment: XMIMessage
	 * }
	 * 
	 * precedenceRelations = {
	 * 		start: preActivity,
	 * 		end: nextActivity
	 * 
	 * }
	 *
	 *
	 *For different stereotypes, for example 'uml:Object", 'uml:Actor', they have their specific properties.
	 *
	 *There are a few more tags for the activities...
	 *user activities....and system activities...
	 */
	
	function contains(arr, obj) {  
	    var i = arr.length;  
	    while (i--) {  
	        if (arr[i] === obj) {  
	            return true;  
	        }  
	    }  
	    return false;  
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
					name: XMIAttribute['$']['name'],
					type: type,
					isStatic: XMIAttribute['$']['isStatic']
			}
			attributes.push(attribute);
		}

		var XMIOperations = jp.query(XMIClass, '$.ownedOperation[?(@[\'$\'][\'xmi:id\'])]');
		var operations = new Array();

		for(var i in XMIOperations){
			var XMIOperation = XMIOperations[i];
			var XMIParameters = jp.query(XMIOperation, '$.ownedParameter[?(@[\'$\'][\'xmi:id\'])]');
			var parameterUnits = [];
			for(var j in XMIParameters){
				var XMIParameter = XMIParameters[j];
				var parameterUnit = {
						name: XMIParameter['$']['name'],
						type: XMIParameter['$']['type']
				}
				parameterUnits.push(parameterUnit);
			}
			
			var operation = {
					name: XMIOperation['$']['name'],
					visibility: XMIOperation['$']['visibility'],
					parameterUnits: parameterUnits
			}
			operations.push(operation);
		}
		
		if(operations.length === 0 && XMIClass['$']['name']){

			var operation = {
					name: XMIClass['$']['name'].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, ''),
					visibility: "public",
					parameterUnits: []
			}
			
			operations.push(operation);

		}

		return {
				_id: XMIClass['$']['xmi:id'],
				name: XMIClass['$']['name'],
				Operations: operations,
				Attributes: attributes
			}
	}
	
	function queryExtensionConnectors(XMIExtension){
		var extensionConnectors = jp.query(XMIExtension, '$..connector[?(@[\'$\'][\'xmi:idref\'])]');

		var extensionConnectorsByID = {};
		for(var i in extensionConnectors){
			var extensionConnector = extensionConnectors[i];
			var source = jp.query(XMIExtension, '$..source[?(@[\'$\'][\'xmi:idref\'])]')[0];
			var target = jp.query(XMIExtension, '$..target[?(@[\'$\'][\'xmi:idref\'])]')[0];
			if(!source || !target){
				continue;
			}
			extensionConnectorsByID[extensionConnector['$']['xmi:idref']] = {
				_id: extensionConnector['$']['xmi:idref'],
				sourceID: source['$']['xmi:idref'],
				targetID: target['$']['xmi:idref']
			}
		}
		return extensionConnectorsByID;
	}
	
	
	function extractUserSystermInteractionModel(xmiString, workDir, ModelOutputDir, ModelAccessDir, callbackfunc) {
			
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		var XMIExtension = xmiString['xmi:XMI']['xmi:Extension'];
		
		var extensionConnectorsByID = queryExtensionConnectors(XMIExtension);
		
		//create a catalog for the different types of the elements.
		var XMICustomProfiles = jp.query(XMIUMLModel, '$..["thecustomprofile:entity"][?(@["$"])]').map((obj) => {obj.type="entity"; return obj;});
		XMICustomProfiles =  XMICustomProfiles.concat(jp.query(XMIUMLModel, '$..["VHDL:entity"][?(@["$"])]').map((obj) => {obj.type="entity"; return obj;}));
		XMICustomProfiles = XMICustomProfiles.concat(jp.query(XMIUMLModel, '$..["thecustomprofile:control"][?(@["$"])]').map((obj) => {obj.type="control"; return obj;}));
		XMICustomProfiles = XMICustomProfiles.concat(jp.query(XMIUMLModel, '$..["thecustomprofile:boundary"][?(@["$"])]').map((obj) => {obj.type="boundary"; return obj;}));
		
		var CustomProfiles = {};
		
		for(var i in XMICustomProfiles){
			var XMICustomProfile = XMICustomProfiles[i];
			console.log(XMICustomProfile);
			if(XMICustomProfile["$"]['base_Lifeline']){
				CustomProfiles[XMICustomProfile["$"]['base_Lifeline']] = XMICustomProfile.type;
			}
			else if(XMICustomProfile["$"]['base_InstanceSpecification']){
				CustomProfiles[XMICustomProfile["$"]['base_InstanceSpecification']] = XMICustomProfile.type;
			}
		}
		
		//create a catelog for the actors.
		var XMIActors = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		var ActorsByID = {};
		for(var i in XMIActors){
			var XMIActor = XMIActors[i];
			ActorsByID[XMIActor['$']['xmi:id']] = {
					name: XMIActor['$']['name'],
					_id: XMIActor['$']['xmi:id']
			}
		}
		
		
		var Model = {
				Actors:[],
				Roles:[],
				UseCases: [],
				DomainModel: {
					Elements: [],
					Usages: [],
					Realizations:[],
					Associations: [],
					Generalizations: [],
					callGraph: {edges: []},
					accessGraph: {edges: []},
					typeDependencyGraph: {edges: [], edgesLocal: [], edgesParam: [], edgesReturn: []},
					extendsGraph: {edges: []},
					compositionGraph: {edges: []},
					inheritanceGraph: {edges: []},
					implementationGraph: {edges: []},
					OutputDir : ModelOutputDir+"/domainModel",
					AccessDir : ModelAccessDir+"/domainModel",
					DiagramType : "class_diagram",
				}
		};
	
		//establish the dictionary that include pm_estimate, dev_estimate, and business_value data

		var XMIPMEstimates = jp.query(XMIUMLModel, '$..["thecustomprofile:pm_effort"][?(@["$"])]');
		var PMEstimates = {};
		for(var i in XMIPMEstimates){
			var XMIPMEstimate = XMIPMEstimates[i];
			PMEstimates[XMIPMEstimate['$']['base_UseCase']] = XMIPMEstimate['$']['pm_effort'];
		}
		var XMIDEVEstimates = jp.query(XMIUMLModel, '$..["thecustomprofile:dev_effort"][?(@["$"])]');
		var DEVEstimates = {};
		for(var i in XMIDEVEstimates){
			var XMIDEVEstimate = XMIDEVEstimates[i];
			DEVEstimates[XMIDEVEstimate['$']['base_UseCase']] = XMIDEVEstimate['$']['dev_effort'];
		}
		
		var XMIBusinessValues = jp.query(XMIUMLModel, '$..["thecustomprofile:business_value"][?(@["$"])]');
		var BusinessValues = {};
		for(var i in XMIBusinessValues){
			var XMIBusinessValue = XMIBusinessValues[i];
			BusinessValues[XMIBusinessValue['$']['base_UseCase']] = XMIBusinessValue['$']['business_value'];
		}
		
		var DomainElementsBySN = {};
		
		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
		XMIClasses = XMIClasses.concat(jp.query(XMIUMLModel, '$..nestedClassifier[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]'));
		
		//populate domain model with classes
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];
			console.log(XMIClass);

			var domainElement = createDomainElement(XMIClass);
			DomainElementsBySN[domainModelSearchUtil.standardizeName(domainElement.Name)] = domainElement;
    		
    		var XMIGeneralizations = jp.query(XMIClass, '$.generalization[?(@[\'$\'][\'xmi:type\']==\'uml:Generalization\')]');
      		for(var i in XMIGeneralizations){
      			var XMIGeneralization = XMIGeneralizations[i];
      			var generalization = {
      				_id: XMIGeneralization['$']['xmi:id'],
      				type: "generalization",
  					Supplier: XMIClass['$']['xmi:id'],
  					Client: XMIGeneralization['$']['general']
      			}
      			Model.DomainModel.Generalizations.push(generalization);
      		}
		}
		
        var XMIAssociations = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Association\')]');
		for(var i in XMIAssociations){
			// having problem with association parsing.
			
			var XMIAssoc = XMIAssociations[i];
			
			var XMIType = jp.query(XMIAssoc, '$..type[?(@[\'$\'][\'xmi:idref\'])]')[0];
			if(!XMIType){
				continue;
			}
			
			extensionConnector = extensionConnectorsByID[XMIAssoc['$']['xmi:id']];
			
			if(!extensionConnector){
				continue;
			}
			
			var association = {
				_id: XMIAssoc['$']['xmi:id'],
				type: "association",
				Supplier: extensionConnector.sourceID,
				Client: extensionConnector.targetID
			}
			Model.DomainModel.Associations.push(association);
		}
		
		
		var XMIUsages = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Usage\')]');
		for(var i in XMIUsages){
			var XMIUsage = XMIUsages[i];
			var domainUsage = {
				_id: XMIUsage['$']['xmi:id'],
				type: "usage",
				Supplier: XMIUsage['$']['supplier'],
				Client: XMIUsage['$']['client']
			}
			Model.DomainModel.Usages.push(domainUsage);
		}

		var XMIReals = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Realization\')]');
		for(var i in XMIReals){
			var XMIReal = XMIReals[i];
			var domainRealization = {
				_id: XMIReal['$']['xmi:id'],
				type: "realization",
				Supplier: XMIReal['$']['supplier'],
				Client: XMIReal['$']['client']
			}
			Model.DomainModel.Realizations.push(domainRealization);
		}
		
		Model.DomainModel.DiagramType = "class_diagram";
			
		//search for the use cases
		var XMIUseCases = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:UseCase\')]');

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
					BusinessValue: BusinessValues[XMIUseCase['$']['xmi:id']],
					PMEffort: PMEstimates[XMIUseCase['$']['xmi:id']],
					DEVEffort: DEVEstimates[XMIUseCase['$']['xmi:id']]
			}
			
			//adding the extra values that are tagged to the use cases
			
			sequenceDiagramParser.parseSequenceDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, ActorsByID);
			activityDiagramParser.parseActivityDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles);
			analysisDiagramParser.parseAnalysisDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, XMIExtension, XMIUMLModel);
			
			UseCase.Transactions = TransactionIdentifier.traverseUseCaseForTransactions(UseCase);
			
//			for(var j in useCase.Transactions){
//				var transaction = useCase.Transactions[j];
//				var TransactionStrByIDs = "";
//				for(var k in transaction.Elements){
//					var node = transaction.Elements[k];
//					TransactionStrByIDs += node._id+"->";
//				}
//				transaction.TransactionStrByIDs = transaction.TransactionStrByIDs;
//			}
			
			Model.UseCases.push(UseCase);
			
		}
		

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("use_case_parsing_finished_"+Model._id, Model);		
		
        var DomainElements = [];
		
		for(var i in DomainElementsBySN){
		Model.DomainModel.Elements.push(DomainElementsBySN[i]);
		}
		
		useCaseDiagramParser.parseUseCaseDiagram(XMIUseCases, XMIUMLModel, Model);
		
		visualSprintDiagramParser.parseUserStoryDiagram(XMIUseCases, XMIUMLModel, Model);
		
		for(var i in Model.UseCases){
			var UseCase = Model.UseCases[i];
			plantUMLUtil.drawSequenceDiagram(UseCase, Model.DomainModel, UseCase.OutputDir);
		}
		
		plantUMLUtil.drawClassDiagram(Model.DomainModel, Model.DomainModel.OutputDir)
		
		if(callbackfunc){
			callbackfunc(Model);
		}
		
		var debug = require("../../utils/DebuggerOutput.js");
		
		debug.writeJson("parsed_domain_model_6_20_"+Model._id, Model.DomainModel);
		
		console.log("parsed domain model");
		console.log(Model.DomainModel);
		
		debug.writeJson("parsed_model_from_parser_"+Model._id, Model);
	}
	
	
	
	
	
	
	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel
	}
}());
