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
			

//			   createClassDiagramFunc(Model.DomainModel.Elements, Model.DomainModel.OutputDir+"/"+"class_diagram.dotty", function(){
//				   console.log("class diagram is output: "+Model.DomainModel.OutputDir+"/"+"class_diagram.dotty");
//			   });
		
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
		
		for(var i in Model.UseCases){
			var UseCase = Model.UseCases[i];
			drawSequenceDiagram(UseCase, Model.DomainModel, UseCase.OutputDir);
		}
		
		drawClassDiagram(Model.DomainModel, Model.DomainModel.OutputDir)
		
		if(callbackfunc){
			callbackfunc(Model);
		}
		
		var debug = require("../../utils/DebuggerOutput.js");
		
		debug.writeJson("parsed_domain_model_6_20_"+Model._id, Model.DomainModel);
		
		console.log("parsed domain model");
		console.log(Model.DomainModel);
		
		debug.writeJson("parsed_model_from_parser_"+Model._id, Model);
	}
	
	/*
	 * 
	 * The structure of the plantUML tools
	 * 
	 * @startuml
skinparam sequenceArrowThickness 2
skinparam roundcorner 20
skinparam maxmessagesize 60
skinparam sequenceParticipant underline

actor User
participant "First Class" as A
participant "Second Class" as B
participant "Last Class" as C

User -> A: DoWork
activate A

A -> B: Create Request
activate B

B -> C: DoWork
activate C
C --> B: WorkDone
destroy C

B --> A: Request Created
deactivate B

A --> User: Done
deactivate A

@enduml
	 * 
	 * 
	 */
	
	
	function drawSequenceDiagram(UseCase, DomainModel, outputDir){
//		UseCase.DiagramType = "sequence_diagram";
		
		var plantUMLString = "@startuml \nskinparam sequenceArrowThickness 2 \nskinparam roundcorner 20 \nskinparam maxmessagesize 60 \nskinparam sequenceParticipant underline\n\n"
		
		//logic to create actors
		var actorActivityDic = {};
		var componentDic = {};
		for(var i in UseCase.Activities){
			var activity = UseCase.Activities[i];
			if(activity.Stimulus){
				if(!actorActivityDic[activity.Group]){
					actorActivityDic[activity.Group] = [];
				}
				var actorActivities = actorActivityDic[activity.Group];
				actorActivities.push(activity);
			}
			
			if(activity.Component){
				var index = (i + 9).toString(36).toUpperCase();
				if(!componentDic[activity.Component.Name]){
				componentDic[activity.Component.Name] = index;
				}
			}
		}
		

//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("actor_activity_dic"+UseCase._id, actorActivityDic);	
		
		for(var i in actorActivityDic){
			console.log("actor: "+i);
			plantUMLString += "actor "+i;
			
		}

		plantUMLString += "\n";
		
//		for(var i in DomainModel.Elements){
//			var element = DomainModel.Elements[i];
//			var index = (i + 9).toString(36).toUpperCase();
//			plantUMLString += "participant \""+element.Name+"\" as "+index+"\n";
//			componentDic[element.Name] = index;
//		}
		
		for(var i in componentDic){
			console.log("actor: "+i);
			plantUMLString += "participant \""+i+"\" as "+componentDic[i]+"\n";
			
		}

		plantUMLString += "\n";
		
		var precedenceRelationDic = {};
		for(var i in UseCase.PrecedenceRelations){
			var precedenceRelation = UseCase.PrecedenceRelations[i];
			
			var start = precedenceRelation.start;
			if(!start){
				continue;
			}
			
			if(!precedenceRelationDic[start._id]){
				precedenceRelationDic[start._id] = [];
			}
			precedenceRelationDic[start._id].push(precedenceRelation);
		}
		
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("precedence_relation_dic"+UseCase._id, precedenceRelationDic);
		
		var visitedPrecedenceRelations = {};
		var activatedComponents = {};
		
		function traverseActivitySequence(start){
//			var precedenceRelation = UseCase.PrecedenceRelations[i];
			
//			var start = precedenceRelation.start;
			
			var precedenceRelations = precedenceRelationDic[start._id];
			
			for(var i in precedenceRelations){
			
			var precedenceRelation = precedenceRelations[i];
			
			var end = precedenceRelation.end;
			
			if(visitedPrecedenceRelations[start._id+"__"+end._id]){
				continue;
			}
			
			visitedPrecedenceRelations[start._id+"__"+end._id] = "1";
			
			console.log(end);
			
			if(start.Stimulus){
				plantUMLString += start.Group;
			}
			else{
				if(start.Component){
				plantUMLString += componentDic[start.Component.Name];
				}
			}
			
			plantUMLString += " -> ";
			
			if(end.Stimulus){
				plantUMLString += end.Group;
			}
			else{
				if(end.Component){
				plantUMLString += componentDic[end.Component.Name];
				}
			}
			
			if(end.Component){
				plantUMLString += ": "+end.Name+"\n";
				if(activatedComponents[componentDic[end.Component.Name]] == 0 || !activatedComponents[componentDic[end.Component.Name]]){
				plantUMLString += "activate "+componentDic[end.Component.Name]+"\n\n";
				activatedComponents[componentDic[end.Component.Name]] = 1;
				}
			}
			
			traverseActivitySequence(end)
			
			if(end.Component){
				if(activatedComponents[componentDic[end.Component.Name]] == 1){
					plantUMLString += "deactivate "+componentDic[end.Component.Name]+"\n\n";
//					activatedComponents[componentDic[end.Component.Name]]=1;
					activatedComponents[componentDic[end.Component.Name]] = 0;
				}
			}
			
			}
		}
	
		
		for(var i in actorActivityDic){
			var actorActivities = actorActivityDic[i];
			for(var j in actorActivities){
				//plantUMLString += "actor "+actorActivities[j].Name;
				var actorActivity = actorActivities[j];
				traverseActivitySequence(actorActivity);
			}
		}
		
		plantUMLString += "@enduml";
		
		var files = [{fileName : "sequence_diagram.txt", content : plantUMLString}];
		umlFileManager.writeFiles(outputDir, files, function(err){
		 if(err){
			 console.log(err);
			 return;
		 }
		 
		 plantUMLUtil.generateUMLDiagram(outputDir+"/sequence_diagram.txt", function(outputDir){
			 console.log(outputDir);
		 });
		});
		
		return plantUMLString;
	}
	
	
	/*
	 * 
	 * The structure of the plantUML tools
	 * 
@startuml
skinparam classAttributeIconSize 0
class Dummy {
 -field1
 #field2
 ~method1()
 +method2()
}

@enduml
	 * 
	 * 
	 */
	
	function drawClassDiagram(DomainModel, outputDir){
		
		var classElements = DomainModel.Elements;
		var classElementDic = {};
		
		var plantUMLString = '@startuml\nskinparam classAttributeIconSize 0\n\n';
		
        for(i = 0;  i < classElements.length; i++){
            var curClass = classElements[i];
            if(!curClass["Name"]){
            	continue;
            }
            
            classElementDic[curClass._id] = curClass;
            

            plantUMLString += "class ";
            
            plantUMLString += curClass["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
            
            if (classElements[i]["Attributes"].length == 0 && classElements[i]["Operations"].length == 0){
            	 plantUMLString += " \n\n";
            	 continue;
            }

            plantUMLString += " {\n";

            var classAttributes = classElements[i]["Attributes"];
                for(j = 0; j < classAttributes.length; j++) {
                    plantUMLString += '- ' ;
                    plantUMLString += classAttributes[j]["Name"];
                    plantUMLString += ':'+classAttributes[j]["Type"];
                    plantUMLString += '\n';
                }

            var classOperations = classElements[i]["Operations"];
                for(j = 0; j < classOperations.length;j++) {
                    
               	 plantUMLString += '~ ' ;
                    plantUMLString += classOperations[j]["Name"] + '(';
                    var para_len = classOperations[j]["Parameters"].length;
                    for (k = 0; k < para_len - 1; k++) {
                   	 plantUMLString += classOperations[j]["Parameters"][k]["Type"]+" "+ classOperations[j]["Parameters"][k]["Name"];
                    }
                    plantUMLString += ')';

                    if(para_len > 0){
                    plantUMLString += ':'+classOperations[j]["Parameters"][para_len - 1]["Type"];
                    }
                    plantUMLString += "\n";
                }

            plantUMLString += '}\n\n';
		 }
        
       //create the links between the classes
//        Realizations:[],
//		Associations: [],
////		Inheritances: [],
//		Generalizations: [],
        
        for(var i in DomainModel.Realizations){
        	var realization = DomainModel.Realizations[i];
        	var supplier = classElementDic[realization.Supplier];
        	var client = classElementDic[realization.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += clientName + " <|-- " + supplierName+"\n\n";
        	
        }
        
        for(var i in DomainModel.Associations){
        	var association = DomainModel.Associations[i];
        	
        	var supplier = classElementDic[association.Supplier];
        	var client = classElementDic[association.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += supplierName + " .. " + clientName+"\n\n";
        }
        
        for(var i in DomainModel.Generalizations){
        	var generalization = DomainModel.Generalizations[i];
        	
        	var supplier = classElementDic[generalization.Supplier];
        	var client = classElementDic[generalization.Client];
        	if(!supplier || !client){
        		continue;
        	}
        	
        	var supplierName = supplier["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	var clientName = client["Name"].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
        	
        	plantUMLString += supplierName + " <|-- " + clientName+"\n\n";
        }
       
        
       plantUMLString += '@enduml';
       
       var files = [{fileName : "class_diagram.txt", content : plantUMLString}];
		umlFileManager.writeFiles(outputDir, files, function(err){
		 if(err){
			 console.log(err);
			 return;
		 }
		 
		 plantUMLUtil.generateUMLDiagram(outputDir+"/class_diagram.txt", function(outputDir){
			 console.log(outputDir);
		 });
		});

        
        return plantUMLString;
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
