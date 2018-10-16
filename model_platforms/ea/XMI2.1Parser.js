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
	var visualSprintDiagramParser = require("./VisualSprintDiagramParser.js");
	
	var domainModelSearchUtil = require("../../utils/DomainModelSearchUtil.js");

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
//				Attachment: XMIClass
			}
	}
	
	function extractUserSystermInteractionModel(xmiString, workDir, ModelOutputDir, ModelAccessDir, callbackfunc) {
			
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		var XMIExtension = xmiString['xmi:XMI']['xmi:Extension'];
		
		//create a catalog for the different types of the elements.
		var XMICustomProfiles = jp.query(XMIUMLModel, '$..["thecustomprofile:entity"][?(@["$"])]').map((obj) => {obj.type="entity"; return obj;});
		XMICustomProfiles = jp.query(XMIUMLModel, '$..["VHDL:entity"][?(@["$"])]').map((obj) => {obj.type="entity"; return obj;});
		XMICustomProfiles = XMICustomProfiles.concat(jp.query(XMIUMLModel, '$..["thecustomprofile:control"][?(@["$"])]').map((obj) => {obj.type="control"; return obj;}));
		XMICustomProfiles = XMICustomProfiles.concat(jp.query(XMIUMLModel, '$..["thecustomprofile:boundary"][?(@["$"])]').map((obj) => {obj.type="boundary"; return obj;}));
		
		var CustomProfiles = {};
		
		for(var i in XMICustomProfiles){
//			var CustomProfile = {};
			var XMICustomProfile = XMICustomProfiles[i];
			console.log(XMICustomProfile);
//			var id = "";
			if(XMICustomProfile["$"]['base_Lifeline']){
				CustomProfiles[XMICustomProfile["$"]['base_Lifeline']] = XMICustomProfile.type;
			}
			else if(XMICustomProfile["$"]['base_InstanceSpecification']){
				CustomProfiles[XMICustomProfile["$"]['base_InstanceSpecification']] = XMICustomProfile.type;
			}
		}
		
//		console.log(CustomProfiles);
		
		//create a catelog for the actors.
		var XMIActors = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		var ActorsByID = {};
		for(var i in XMIActors){
			var XMIActor = XMIActors[i];
			ActorsByID[XMIActor['$']['xmi:id']] = {
					Name: XMIActor['$']['name'],
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
//					Inheritances: [],
					Generalizations: [],
					OutputDir : ModelOutputDir+"/domainModel",
					AccessDir : ModelAccessDir+"/domainModel",
					DiagramType : "class_diagram",
//                    InheritanceStats: null
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
//			XMIClassesBydomainModelSearchUtil.standardizeNameizedName[domainModelSearchUtil.standardizeNameizeName(XMIClass['$']['name'])] = XMIClass;
			
//			var matchedDomainElement = domainElementSearchUtil.matchDomainElement(domainElement.Name, DomainElementsBySN);
			
//			if(!matchedDomainElement){
				DomainElementsBySN[domainModelSearchUtil.standardizeName(domainElement.Name)] = domainElement;
//			}
//			else{
				//copy the attributes into the matched domain element
//				console.log(matchedDomainElement);
//				for(var i in domainElement.Operations){
//					matchedDomainElement.Operations.push(domainElement.Operations[i]);
//				}
//				
//				for(var i in domainElement.Attributes){
//					matchedDomainElement.Attributes.push(domainElement.Attributes[i]);
//				}
//			}
    		
    		var XMIGeneralizations = jp.query(XMIClass, '$.generalization[?(@[\'$\'][\'xmi:type\']==\'uml:Generalization\')]');
//      		var DomainGeneralizationByID = [];
      		for(var i in XMIGeneralizations){
      			var XMIGeneralization = XMIGeneralizations[i];
      			//      console.log(XMIAssoc);
      			var generalization = {
      				_id: XMIGeneralization['$']['xmi:id'],
      				type: "generalization",
  					Supplier: XMIClass['$']['xmi:id'],
  					Client: XMIGeneralization['$']['general']
      			}
//      			DomainAssociationByID[domainAssociation._id] = domainAssociation;
      			Model.DomainModel.Generalizations.push(generalization);
      		}
		}
		
        var XMIAssociations = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Association\')]');
//		var DomainAssociationByID = [];
		for(var i in XMIAssociations){
			var XMIAssoc = XMIAssociations[i];
			//      console.log(XMIAssoc);
			var XMIType = jp.query(XMIAssoc, '$..type[?(@[\'$\'][\'xmi:idref\'])]')[0];
			if(!XMIType){
				continue;
			}
			var association = {
				_id: XMIAssoc['$']['xmi:id'],
				type: "association",
				Supplier: XMIClass['$']['xmi:id'],
				Client: XMIType['$']['xmi:idref']
			}
//			DomainAssociationByID[domainAssociation._id] = domainAssociation;
			Model.DomainModel.Associations.push(association);
		}
		
		
		var XMIUsages = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Usage\')]');
//		var DomainUsagesByID = [];
		for(var i in XMIUsages){
			var XMIUsage = XMIUsages[i];
			//      console.log(XMIUsage);
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
			//      console.log(XMIReal);
			var domainRealization = {
				_id: XMIReal['$']['xmi:id'],
				type: "realization",
				Supplier: XMIReal['$']['supplier'],
				Client: XMIReal['$']['client']
			}
			Model.DomainModel.Realizations.push(domainRealization);
		}
		
		Model.DomainModel.DiagramType = "class_diagram";
			

			   createClassDiagramFunc(Model.DomainModel.Elements, Model.DomainModel.OutputDir+"/"+"class_diagram.dotty", function(){
				   console.log("class diagram is output: "+Model.DomainModel.OutputDir+"/"+"class_diagram.dotty");
			   });
		
			 //search for the use cases
				var XMIUseCases = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:UseCase\')]');
//				console.log(XMIUseCases);
//				debug.writeJson("XMIUseCases", XMIUseCases);
				
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
//					Attachment: XMIUseCase
			}
			
			//adding the extra values that are tagged to the use cases
			
			sequenceDiagramParser.parseSequenceDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, ActorsByID);
			activityDiagramParser.parseActivityDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles);
			analysisDiagramParser.parseAnalysisDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, XMIExtension, XMIUMLModel);
			
			Model.UseCases.push(UseCase);
		}
		

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("use_case_parsing_finished_"+Model._id, Model);		
		
//		console.log(XMIUMLModel);
		
		var DomainElements = [];
		
		for(var i in DomainElementsBySN){
		Model.DomainModel.Elements.push(DomainElementsBySN[i]);
		}
		
//		console.log(XMIClasses);
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("XMIClasses", XMIClasses);
		
		useCaseDiagramParser.parseUseCaseDiagram(XMIUseCases, XMIUMLModel, Model);
		
		visualSprintDiagramParser.parseUserStoryDiagram(XMIUseCases, XMIUMLModel, Model);
		
		if(callbackfunc){
			callbackfunc(Model);
		}
		
		var debug = require("../../utils/DebuggerOutput.js");
		
		debug.writeJson("parsed_domain_model_6_20_"+Model._id, Model.DomainModel);
		
		console.log("parsed domain model");
		console.log(Model.DomainModel);
		
		debug.writeJson("parsed_model_from_parser_"+Model._id, Model);
	}
	
	// draw the class diagram of the model
	function createClassDiagramFunc(classElements, graphFilePath, callbackfunc){
	
//		    console.log("run the create class dia");
//            console.log("class diagram model is"+classElements);
//            console.log("class diagram model is"+JSON.stringify(classElements));
              
			var graph = 'digraph class_diagram {';
             graph += 'node [fontsize = 8 shape = "record"]';
             graph += ' edge [arrowhead = "ediamond"]'
             for(i = 0;  i < classElements.length; i++){
                 var curClass = classElements[i];
                 graph += curClass["_id"];
                 graph += '[ id = ' + curClass["_id"];
                 graph += ' label = "{';
                 graph += curClass["Name"];


                 var classAttributes = classElements[i]["Attributes"];
                 if (classAttributes.length != 0){
                     graph += '|';
                     for(j = 0; j < classAttributes.length; j++) {
                         graph += '-   ' ;
                         graph += classAttributes[j]["Name"];
                         graph += ':'+classAttributes[j]["Type"];
                         graph += '\\l';
                     }
                 }

                 // graph += '|';

                 var classOperations = classElements[i]["Operations"];
                 if (classOperations.length != 0){
                     graph += '|';
                     for(j = 0; j < classOperations.length;j++) {
                         
                    	 graph += '+   ' ;
                         graph += classOperations[j]["Name"] + '(';
                         var para_len = classOperations[j]["Parameters"].length;
                         for (k = 0; k < para_len - 1; k++) {
                        	 graph += classOperations[j]["Parameters"][k]["Type"]+" "+ classOperations[j]["Parameters"][k]["Name"];
                         }
                         graph += ')';

                         if(para_len > 0){
                         graph += ':'+classOperations[j]["Parameters"][para_len - 1]["Type"];
                         }
                         graph += "\\l";
                     }
                 }



                 graph += '}"]';
			 }
             
            graph += 'imagepath = \"./public\"}';
            
     		console.log("graph is:"+graph);
     		dottyUtil = require("../../utils/DottyUtil.js");
     		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
     			console.log("class Diagram is done");
     		});

             
             return graph;
		}
	
	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel
	}
}());
