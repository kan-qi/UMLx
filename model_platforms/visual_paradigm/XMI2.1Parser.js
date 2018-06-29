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
	//var activityDiagramParser= require("./ActivityDiagramParser.js");
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
	
	function extractUserSystermInteractionModel(filePath, callbackfunc) {
		
		fs.readFile(filePath, function(err, data) {
			parser.parseString(data, function(err, xmiString) {
		
		var debug = require("../../utils/DebuggerOutput.js");
		debug.writeJson("XMIString", xmiString);
			
		//var	XMIUMLModel = xmiString['xmi:XMI']['uml:Model'];
		
//		$.store.book[?(@.title =~ /^.*Sword.*$/)]
//		console.log("hello");
		
		//create a catalog for the different types of the elements.
/*		var XMICustomProfiles = jp.query(XMIUMLModel, '$..["thecustomprofile:entity"][?(@["$"])]').map((obj) => {obj.type="entity"; return obj;});
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
*/		
		//create a catelog for the actors.
		var XMIActors = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Actor\')]');
		var ActorsByID = {};
		for(var i in XMIActors){
			var XMIActor = XMIActors[i];
			ActorsByID[XMIActor['$']['xmi:id']] = {
					Name: XMIActor['$']['name'],
					_id: XMIActor['$']['xmi:id']
			}
		}
				
		var Model = {
				Interactions: []
		};
		
		//console.log(XMIUMLModel);

		var XMIClasses = jp.query(xmiString, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Class\')]');
		var XMIClassesByStandardizedName = [];
		//var DomainElementsByID = [];
		
		for(var i in XMIClasses){
			var XMIClass = XMIClasses[i];

			//var domainElement = createDomainElement(XMIClass);
			XMIClassesByStandardizedName[standardizeName(XMIClass['$']['name'])] = XMIClass;
			//DomainElementsByID[domainElement._id] = domainElement;
		}
		console.log(XMIClasses);

		var XMIInteractions = jp.query(xmiString, '$..ownedBehavior[?(@[\'$\'][\'xmi:type\']==\'uml:Interaction\')]');
		
		for(var i in XMIInteractions){
			var XMIInteraction = XMIInteractions[i];
			
			var Interaction = {
					_id: XMIInteraction['$']['xmi:id'],
					Name: XMIInteraction['$']['name'],
					PrecedenceRelations : [],
					Activities : []
			}
			sequenceDiagramParser.parseSequenceDiagram(Interaction, XMIInteraction, XMIClassesByStandardizedName);
			Model.Interactions.push(Interaction);
		}
		
		
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
