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
	var analysisDiagramParser= require("./AnalysisDiagramParser.js");
	var useCaseDiagramParser = require("./UseCaseDiagramParser.js");
	var visualSprintDiagramParser = require("./VisualSprintDiagramParser.js");
	
//        var inheritanceStats = {
//                'depth': 0,
//                'numInheritedFrom': 0,
//                'numDerivedClass': 0,
//                'coupling': 0,
//                'children': {},
//                'topLevelClasses': 0,
//                'numOfChildren': {},
//                'tree':{},
//        };

	/*
	 * The actual parsing method, which take xmi file as the input and construct a user-system interaction model with an array of use cases and a domain model.
	 * 
	 * The model has the following structure:
	 * 
	 * model = {
	 * 	domainModel:[]
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

		// console.log(classDiagram);
//		component.Operations = operations;
//		component.Attributes = attributes;
//		component.Type = 'class';
		
		return {
				_id: XMIClass['$']['xmi:id'],
				Name: XMIClass['$']['name'],
				Operations: operations,
				Attributes: attributes
//				Attachment: XMIClass
			}
	}
	
	function extractUserSystermInteractionModel(xmiString, ModelOutputDir, ModelAccessDir, callbackfunc) {
		
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("XMIString", xmiString);
			
		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		var XMIExtension = xmiString['xmi:XMI']['xmi:Extension'];
//		$.store.book[?(@.title =~ /^.*Sword.*$/)]
//		console.log("hello");
		
		//create a catalog for the different types of the elements.
		var XMICustomProfiles = jp.query(XMIUMLModel, '$..["thecustomprofile:entity"][?(@["$"])]').map((obj) => {obj.type="entity"; return obj;});
		XMICustomProfiles = XMICustomProfiles.concat(jp.query(XMIUMLModel, '$..["thecustomprofile:control"][?(@["$"])]').map((obj) => {obj.type="control"; return obj;}));
		XMICustomProfiles = XMICustomProfiles.concat(jp.query(XMIUMLModel, '$..["thecustomprofile:boundary"][?(@["$"])]').map((obj) => {obj.type="boundary"; return obj;}));
		
		var CustomProfiles = {};
//		console.log("custom profiles");
//		console.log(XMICustomProfiles);
//		debug.writeJson("XMICustomProfiles", XMICustomProfiles);
		
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
//			CustomProfile.type = "entity";
//			CustomProfiles[id] = "entity";
		}
		
		console.log(CustomProfiles);
		
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
                    InheritanceStats: null
				}
		};
		
//		console.log(XMIUMLModel);

		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
//		var XMIClassesByStandardizedName = [];
		var DomainElementsBySN = {};
		var DomainElements = [];
		
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];
			console.log(XMIClass);
//			var domainElement = {
//				id: XMIClass['$']['xmi:id'],
//				Name: XMIClass['$']['name'],
//				Attachment: XMIClass
//			}
			var domainElement = createDomainElement(XMIClass);
//			XMIClassesByStandardizedName[standardizeName(XMIClass['$']['name'])] = XMIClass;
			DomainElementsBySN[standardizeName(XMIClass['$']['name'])] = domainElement;
//			model.DomainModel.push(domainElement);
			
			/*
			 * the logic has been implemented in another place.
			 */
//            var XMIGeneralizations = jp.query(XMIClass, '$.generalization[?(@[\'$\'][\'xmi:type\']==\'uml:Generalization\')]');
//            
//            for (i in XMIGeneralizations) {
//                inheritanceStats['coupling']++;
//                inheritanceStats['numInheritedFrom']++;
//                inheritanceStats['tree'][XMIClass['$']['xmi:id']] = XMIGeneralizations[i]['$']['general'];
//                if (XMIGeneralizations[i]['$']['general'] in inheritanceStats['numOfChildren']) {
//                    inheritanceStats['numOfChildren'][XMIGeneralizations[i]['$']['general']]++;
//                } else {
//                    inheritanceStats['numOfChildren'][XMIGeneralizations[i]['$']['general']] = 1;
//                }
//                
//                var generalization = {
//						id: XMIGeneralizations[i]['$']['general'],
//						type: "generalization",
//						Supplier: XMIClass['$']['xmi:id'],
//						Client: XMIGeneralizations[i]['$']['general']
//				}
//				Model.DomainModel.Generalizations.push(generalization);
//            }
            
//          if (XMIGeneralizations.length == 0) {
//              inheritanceStats['topLevelClasses']++;
//              inheritanceStats['numOfChildren'][XMIClass['$']['xmi:id']] = 0;
//              inheritanceStats['tree'][XMIClass['$']['xmi:id']] = '#';
//          } else {
//              inheritanceStats['children'][XMIClass['$']['xmi:id']] = null;
//              
//          }
            
            var XMIAssociations = jp.query(XMIClass, '$.packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Association\')]');
//    		var DomainAssociationByID = [];
    		for(var i in XMIAssociations){
    			var XMIAssoc = XMIAssociations[i];
    			//      console.log(XMIAssoc);
    			var association = {
    				_id: XMIAssoc['$']['xmi:id'],
    				type: "association",
					Supplier: XMIClass['$']['xmi:id'],
					Client: XMIGeneralization['$']['general']
    			}
//    			DomainAssociationByID[domainAssociation._id] = domainAssociation;
    			Model.DomainModel.Associations.push(association);
    		}
            
			
//			//search for generalization edges.
//			var XMIGeneralizations = jp.query(XMIUMLModel, '$..generalization[?(@[\'$\'][\'xmi:type\']==\'uml:Generalization\')]');
//			for(var j in XMIGeneralizations){
//				var XMIGeneralization = XMIGeneralizations[j];
//				var association = {
//						id: XMIGeneralization['$']['general'],
//						type: "generalization"
//				}
//				domainElement.Associations.push(association);
//			}
			
			Model.DomainModel.Elements.push(domainElement);
		}

		
		console.log(XMIClasses);
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("XMIClasses", XMIClasses);
		
		Model.DomainModel.DiagramType = "class_diagram";
	   createClassDiagramFunc(Model.DomainModel.Elements, Model.DomainModel.OutputDir+"/"+"class_diagram.dotty", function(){
		   console.log("class diagram is output: "+Model.DomainModel.OutputDir+"/"+"class_diagram.dotty");
	   });
//		
		
		//search for the use cases
		var XMIUseCases = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:UseCase\')]');
//		console.log(XMIUseCases);
//		debug.writeJson("XMIUseCases", XMIUseCases);
		
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
					DiagramType : "none"
			
//					Attachment: XMIUseCase
			}
			
			sequenceDiagramParser.parseSequenceDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, ActorsByID);
			activityDiagramParser.parseActivityDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles);
			analysisDiagramParser.parseAnalysisDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, XMIExtension, XMIUMLModel);
			
			Model.UseCases.push(UseCase);
		}
		

		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("use_case_parsing_finished_"+Model._id, Model);
		
		
//		for(var i in DomainElementsBySN){
//			Model.DomainModel.Elements.push(DomainElementsBySN[i]);
//		}
//        Model.DomainModel.InheritanceStats = inheritanceStats;
		
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

//		for(var i in DomainUsagesByID){
//			Model.DomainModel.Usages.push(DomainUsagesByID[i]);
//		}

		var XMIReals = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Realization\')]');
//		var DomainRealizationByID = [];
		for(var i in XMIReals){
			var XMIReal = XMIReals[i];
			//      console.log(XMIReal);
			var domainRealization = {
				_id: XMIReal['$']['xmi:id'],
				type: "realization",
				Supplier: XMIUsage['$']['supplier'],
				Client: XMIUsage['$']['client']
			}
			Model.DomainModel.Realizations.push(domainRealization);
		}

//		for(var i in DomainRealizationByID){
//			Model.DomainModel.Realization.push(DomainRealizationByID[i]);
//		}

//		var XMIAssociations = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Association\')]');
//		var DomainAssociationByID = [];
//		for(var i in XMIAssociations){
//			var XMIAssoc = XMIAssociations[i];
//			//      console.log(XMIAssoc);
//			var domainAssociation = {
//				_id: XMIAssoc['$']['xmi:id']
//			}
//			DomainAssociationByID[domainAssociation._id] = domainAssociation;
//		}
		
//		var XMIGens = jp.query(XMIUMLModel, '$..generalization[?(@[\'$\'][\'xmi:type\']==\'uml:Generalization\')]');
//		var DomainGeneralizationByID = [];
//		for(var i in XMIGens){
//			var XMIAssoc = XMIGens[i];
//			//      console.log(XMIAssoc);
//			var domainGeneralization = {
//				_id: XMIAssoc['$']['xmi:id']
//			}
//			DomainGeneralizationByID[domainGeneralization._id] = domainGeneralization;
//		}
		
//		var XMIGens = jp.query(XMIUMLModel, '$..generalization[?(@[\'$\'][\'xmi:type\']==\'uml:Dependency\')]');
//		var DomainDependencyByID = [];
//		for(var i in XMIGens){
//			var XMIAssoc = XMIGens[i];
//			//      console.log(XMIAssoc);
//			var domainDependency = {
//				_id: XMIAssoc['$']['xmi:id'],
//				Supplier: XMIUsage['$']['supplier'],
//				Client: XMIUsage['$']['client']
//			}
//			DomainDependencyByID[domainDependency._id] = domainDependency;
//		}
		
		useCaseDiagramParser.parseUseCaseDiagram(XMIUseCases, XMIUMLModel, Model);
		
		visualSprintDiagramParser.parseUserStoryDiagram(XMIUseCases, XMIUMLModel, Model);
		
//		return Model;
		
		if(callbackfunc){
			callbackfunc(Model);
		}
		
		var debug = require("../../utils/DebuggerOutput.js");
		
		debug.writeJson("parsed_domain_model_6_20_"+Model._id, Model.DomainModel);
		
		console.log("parsed domain model");
		console.log(Model.DomainModel);
		
		debug.writeJson("parsed_model_from_parser_"+Model._id, Model);
		
//			});
//	});
//		return Mode;
		
	}
	
	// draw the class diagram of the model
	function createClassDiagramFunc(classElements, graphFilePath, callbackfunc){
	
		      console.log("run the create class dia");
              console.log("class diagram model is"+classElements);
              console.log("class diagram model is"+JSON.stringify(classElements));
		//           var json_obj = {
//           	   "allClass" :[
//				   {"className": "bookTicketMangement",
//			        "attributes": [
//					   	{"attributeName": "ticketName",
//				         "attributeType": "String"
//						},
//						 {"attributeName": "ticketId",
//						 "attributeType": "int"
//                         }
//                      ],
//					"operations": [
//						 {"operationName":"bookTicketsManagement(int)",
//						  "operationReturn":"void"
//						 }
//					   ],
//					"kids": ["BookTickets","bookTicketInterface"]
//				   },
//
//				   {"className": "BookTickets",
//					"attributes": [
//						{"attributeName": "BookTicketName",
//						 "attributeType": "int"
//                           }
//                       ],
//					 "operations": [],
//					 "kids": []
//                   },
//
//                   {"className": "bookTicketInterface",
//                    "attributes": [
//                       {"attributeName": "BookTicketInput",
//                        "attributeType": "int"
//					   }
//					 ],
//                     "operations": [],
//                      "kids": []
//                   }
//			   ]
//		   }

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
                         for (k = 0; k < classOperations[j]["Parameters"].length - 1; k++) {
                        	 graph += classOperations[j]["Parameters"][k]["Type"]+" "+ classOperations[j]["Parameters"][k]["Name"];
                         }
                         graph += ')';
                         graph += ':'+classOperations[j]["Parameters"][para_len - 1]["Type"];
                         graph += "\\l";
                     }
                 }



                 graph += '}"]';

                 
                 /*
                  * need someone to fix this part.
                  */
//                 var classAss = classElements[i]["Associations"];
//                 for(j = 0; j < classAss.length;j++) {
//                     graph += curClass["_id"] ;
//                     graph += '->';
//                     graph += classAss[j]["id"] + ' ';
//
//                 }
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
