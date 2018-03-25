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
					Type: type
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
					Parameters: parameters
			}
			operations.push(operation);
		}
		//				
		// console.log(classDiagram);
//		component.Operations = operations;
//		component.Attributes = attributes;
//		component.Type = 'class';
		
		return {
				_id: XMIClass['$']['xmi:id'],
				Name: XMIClass['$']['name'],
				Operations: operations,
				Attributes: attributes,
//				Attachment: XMIClass
			}
	}
	
	function extractUserSystermInteractionModel(filePath, callbackfunc) {
		
		fs.readFile(filePath, function(err, data) {
			parser.parseString(data, function(err, xmiString) {
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("XMIString", xmiString);
		
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
				UseCases: [],
				DomainModel: {
					Elements: []
				}
		};
		
//		console.log(XMIUMLModel);

		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
//		var XMIClassesByStandardizedName = [];
		var DomainElementsBySN = {};
		
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
		}
//		console.log(XMIClasses);
//		debug.writeJson("XMIClasses", XMIClasses);
		// draw the class diagram of the model
	function createClassDiagramFunc(graphFilePath){
           var json_obj = {
           	   "allClass" :[
				   {"className": "bookTicketMangement",
			        "attributes": [
					   	{"attributeName": "ticketName",
				         "attributeType": "String"
						},
						 {"attributeName": "ticketId",
						 "attributeType": "int"
                         }
                      ],
					"operations": [
						 {"operationName":"bookTicketsManagement(int)",
						  "operationReturn":"void"
						 }
					   ],
					"kids": ["BookTickets","bookTicketInterface"]
				   },

				   {"className": "BookTickets",
					"attributes": [
						{"attributeName": "BookTicketName",
						 "attributeType": "int"
                           }
                       ],
					 "operations": [],
					 "kids": []
                   },

                   {"className": "bookTicketInterface",
                    "attributes": [
                       {"attributeName": "BookTicketInput",
                        "attributeType": "int"
					   }
					 ],
                     "operations": [],
                      "kids": []
                   }
			   ]
		   }

			var graph = 'digraph class_diagram {';
             graph += 'node [fontsize = 8 shape = "record"]';
             graph += ' edge [arrowhead = "ediamond"]'
             for(i = 0;  i < json_obj.allClass.length; i++){
                 var curClass = json_obj.allClass[i];
                 graph += curClass["className"];
                 graph += '[ label = "{';
                 graph += curClass["className"];


                 var classAttributes = json_obj.allClass[i]["attributes"];
                 if (classAttributes.length != 0){
                     graph += '|';
                     for(j = 0; j < classAttributes.length; j++) {
                         graph += '-   ' ;
                         graph += classAttributes[j]["attributeName"];
                         graph += ':'+classAttributes[j]["attributeType"];
                         graph += '\\l';
                     }
                 }



                 // graph += '|';

                 var classOperations = json_obj.allClass[i]["operations"];
                 if (classOperations.length != 0){
                     graph += '|';
                     for(j = 0; j < classOperations.length;j++) {
                         graph += '+   ' ;
                         graph += classOperations[j]["operationName"];
                         graph += ':'+classOperations[j]["operationReturn"];
                         graph += "\\l";
                     }
                 }



                 graph += '}"]';

                 var classKids = json_obj.allClass[i]["kids"];
                 for(j = 0; j < classKids.length;j++) {
                     graph += curClass["className"] ;
                     graph += '->';
                     graph += classKids[j] + ' ';

                 }
			 }




            graph += 'imagepath = \"./public\"}';
            
     		console.log("graph is:"+graph);
     		dottyUtil = require("../../utils/DottyUtil.js");
     		dottyUtil.drawDottyGraph(graph, graphFilePath, function(){
     			console.log("class Diagram is done");
     		});

             
             return graph;
		}
		
	createClassDiagramFunc("C:/Users/attri/UMLx/UMLx/img/class_diagram");
		
		
		//search for the use cases
		var XMIUseCases = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:UseCase\')]');
//		console.log(XMIUseCases);
//		debug.writeJson("XMIUseCases", XMIUseCases);
		
		for(var i in XMIUseCases){
			var XMIUseCase = XMIUseCases[i];
			
			var UseCase = {
					_id: XMIUseCase['$']['xmi:id'],
					Name: XMIUseCase['$']['name'],
					PrecedenceRelations : [],
					Activities : [],
//					Attachment: XMIUseCase
			}
			
			sequenceDiagramParser.parseSequenceDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, ActorsByID);
			activityDiagramParser.parseActivityDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles);
			analysisDiagramParser.parseAnalysisDiagram(UseCase, XMIUseCase, DomainElementsBySN, CustomProfiles, XMIExtension, XMIUMLModel);
			
			Model.UseCases.push(UseCase);
		}
		
		
		for(var i in DomainElementsBySN){
			Model.DomainModel.Elements.push(DomainElementsBySN[i]);
		}
		
//		return Model;
		
		if(callbackfunc){
			callbackfunc(Model);
		}
		
			});
		});
	}
	
	module.exports = {
			extractUserSystermInteractionModel : extractUserSystermInteractionModel
	}
}());
