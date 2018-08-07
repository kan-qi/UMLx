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
	

	/*function createDomainElement(XMIClass){
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
               

                var generalizations = jp.query(XMIClass, '$.generalization[?(@[\'$\'][\'xmi:type\']==\'uml:Generalization\')]');
                if (generalizations.length == 0) {
                    inheritanceStats['topLevelClasses']++;
                    inheritanceStats['numOfChildren'][XMIClass['$']['xmi:id']] = 0;
                    inheritanceStats['tree'][XMIClass['$']['xmi:id']] = '#';
                } else {
                    inheritanceStats['children'][XMIClass['$']['xmi:id']] = null;
                    for (i in generalizations) {
                        inheritanceStats['coupling']++;
                        inheritanceStats['numInheritedFrom']++;
                        inheritanceStats['tree'][XMIClass['$']['xmi:id']] = generalizations[i]['$']['general'];
                        if (generalizations[i]['$']['general'] in inheritanceStats['numOfChildren']) {
                            inheritanceStats['numOfChildren'][generalizations[i]['$']['general']]++;
                        } else {
                            inheritanceStats['numOfChildren'][generalizations[i]['$']['general']] = 1;
                        }
                    }
                }

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
	}*/
	
	function extractUserSystermInteractionModel(xmiString, workDir, ModelOutputDir, ModelAccessDir, callbackfunc) {
		
			
//		var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
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
		
		// constructing the domain model.
		var	XMIUMLModel = xmiString['uml:Model'];
		
//		console.log(XMIUMLModel);
		
//      var Model = {
//				Elements: [],
//				Edges:[]
//		};
		
		var XMIClasses = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
		var XMIClassesByStandardizedName = [];
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];
			
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
			
			XMIClassesByStandardizedName[standardizeName(XMIClass['$']['name'])] = XMIClass;
			
          var XMIClassesByStandard = {
				_id: XMIClass['$']['xmi:id'],
				Name: XMIClass['$']['name'],
				Operations: operations,
				Attributes: attributes
			};
				Model.DomainModel.Elements.push(XMIClassesByStandard);
		}
	
    
     var XMIActivities = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
	   console.log(XMIActivities);
	   var XMIEdges = [];
	   for(var i in XMIActivities){
			 var XMIActivity = XMIActivities[i];		
			 XMIEdges = XMIEdges.concat(jp.query(XMIActivity, '$..["edge"][?(@["$"])]').map((obj) => {obj.type="uml:ControlFlow"; return obj;}));	
			 XMIEdges = XMIEdges.concat(jp.query(XMIActivity, '$..["edge"][?(@["$"])]').map((obj) => {obj.type="uml:ObjectFlow"; return obj;}));		
		}
		     console.log(XMIEdges.length);
	
	   for(var i in XMIEdges){
			var XMIEdge = XMIEdges[i];   
			var Edge = {
				_id: XMIEdge['$']['xmi:id'],
				Type:XMIEdge['$']['xmi:type'],
				Source:XMIEdge['$']['source'],
				Target:XMIEdge['$']['target']
			}
			Model.DomainModel.Associations.push(Edge);
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
		
				
//		var Model = {
//				Interactions: []
//		};
		
		//console.log(XMIUMLModel);

//		var XMIClasses = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
//		var XMIClassesByStandardizedName = [];
//		//var DomainElementsByID = [];
//		
//		for(var i in XMIClasses){
//			var XMIClass = XMIClasses[i];
//
//			//var domainElement = createDomainElement(XMIClass);
//			XMIClassesByStandardizedName[standardizeName(XMIClass['$']['name'])] = XMIClass;
//			//DomainElementsByID[domainElement._id] = domainElement;
//		}
//		console.log(XMIClasses);
//		console.log(XMIUMLModel);
		
		activityDiagramParser.parseActivityDiagram(XMIUMLModel, Model);
		
		sequenceDiagramParser.parseSequenceDiagram(XMIUMLModel, XMIClassesByStandardizedName, Model);

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
