/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
 *
 * This file create a domain model by grouping the class units into domain elements.
 * The domain elements provides system component level information.
 * Class units are also classified into view, control, entity for operational transaction analysis.
 * The rules are defined as follows:
 *      1. response class units are view components.
 *      2. entities are the class units that are 1. have more than 1 attributes, 2 used as parameters/return types, 3 don't change attributes of other class units.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var codeAnalysisUtil = require("../../utils/CodeAnalysisUtil.js");
	var stringSimilarity = require('string-similarity');
	
function createDomainModel(componentInfo, ModelOutputDir, ModelAccessDir, callGraph, accessGraph, typeDependencyGraph, extendsGraph, compositionGraph, dicMethodUnits, dicResponseMethodUnits, dicClassUnits){
        /*
        *   The elements of the domain model;
        *   Generally determine the type of the component
        *
        */

		var dicComponents = componentInfo.dicComponents;
		var dicClassComponent = componentInfo.dicClassComponent;

		var DomainModel = {
			Elements: [],
			Usages: [],
			Associations: [],
			Generalizations: [],
			OutputDir : ModelOutputDir+"/domainModel",
			AccessDir : ModelAccessDir+"/domainModel",
			DiagramType : "class_diagram",
		    dicComponents: dicComponents, //additional information for assessing the class level of information
		    dicClassComponent: dicClassComponent,
		    dicClassUnits: dicClassUnits,
			callGraph: callGraph,
			accessGraph: accessGraph,
			typeDependencyGraph: typeDependencyGraph,
			extendsGraph: extendsGraph,
			compositionGraph: compositionGraph,
			dicMethodUnits: dicMethodUnits,
			dicResponseMethodUnits: dicResponseMethodUnits
		}

		var domainElementsByID = [];
		var domainElements = [];
		var dicComponentDomainElement = {};

		for(var i in dicComponents){
			console.log("create domain model element")
			var component = dicComponents[i];

			var domainElement = {
				Name: component.name,
				_id: 'c'+component.UUID.replace(/\-/g, "_"),
				Attributes: [],
				Operations: [],
				isResponse: false
			};

			for(var j in component.classUnits){
			    var classUnit = component.classUnits[j];
			    for(var k in classUnit.methodUnits){
                       var methodUnit = classUnit.methodUnits[k];
                       var parameters = methodUnit.signature.parameterUnits;
                       if (parameters == null) {
                            parameters = [];
                       	}

                       var operation = {
                       		Name: methodUnit.signature.name,
                       		_id: 'a'+methodUnit.UUID.replace(/\-/g, ""),
                       		Parameters: parameters.map((param)=>{return {Type: param.type}}),
                       		ReturnVal: {}
                       	}

                       	domainElement.Operations.push(operation);

                       if(dicResponseMethodUnits[methodUnit.UUID]){
                            domainElement.isResponse = true;
                       }
//                       else if(domainElement.Type != "boundary"){
//                            domainElement.Type = "control";
//                       }
			    }

			    for(var j in classUnit.attrUnits){
			           var attrUnit = classUnit.attrUnits[j];

			           var attr = {
                       					Name: attrUnit.name,
                       					_id: 'a'+attrUnit.UUID.replace(/\-/g, ""),
                       					Type: attrUnit.attrType,
                       					TypeUUID: 'a'+attrUnit.UUID.replace(/\-/g, ""),
                       				};
                       if(attrUnit.isStatic){
                        attr.isStatic = true;
                       }

                       domainElement.Attributes.push(attr);

			    }

			}

            if(domainElement.isResponse){
                domainElement.Type = "boundary";
            }
			else if(domainElement.Attributes.length >= 1.5 * domainElement.Operations.length){
                 domainElement.Type = "entity";
            }
            else {
                domainElement.Type = "control"
            }

			domainElements.push(domainElement);
			domainElementsByID[domainElement._id] = domainElement;
			dicComponentDomainElement[component.UUID] = domainElement;
		}

//		var operationsBySign = {};
//
		for (var i in callGraph.edges) {
			var edge = callGraph.edges[i];

			var startNode = edge.start;
			var callComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
			var callDomainElement = domainElementsByID[callComponentUUID];

			var endNode = edge.end;
			var calleeComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
			var calleeDomainElement = domainElementsByID[calleeComponentUUID];

			if(!callDomainElement.numberOfCalls){
			    callDomainElement.numberOfCalls = 0;
			}

			callDomainElement.numberOfCalls++;

			if(!callDomainElement || !calleeDomainElement || callDomainElement == calleeDomainElement){
				continue;
			}

			var usage = {
                  _id: startNode.component.UUID + "_" + endNode.component.UUID,
                  type: "usage",
                  Supplier: endNode.component.UUID,
                  Client: callComponentUUID
            };

            DomainModel.Usages.push(usage);

            var methodUnit = dicMethodUnits[endNode.UUID];
			foundMethod = false;
			for (var j in calleeDomainElement.Operations) {
				if (calleeDomainElement.Operations[j]._id == 'a'+endNode.UUID.replace(/\-/g, "") || calleeDomainElement.Operations[j].Name === endNode.methodName) {
					calleeDomainElement.Operations[j].visibility = "public";
				}
			}

//			if (!foundMethod) {
//				var parameters = methodUnit.parameterUnits;
//				if (parameters == null) {
//					parameters = [];
//				}
//				var operation = {
//					Name: endNode.methodName,
//					_id: 'a'+endNode.UUID.replace(/\-/g, ""),
//					Parameters: parameters.map((param)=>{return {Type: param.type}}),
//					ReturnVal: {}
//				}
//
//				calleeDomainElement.Operations.push(operation);
//
//				operationsBySign[codeAnalysisUtil.genMethodSign(methodUnit)] = 1;
//			}
		}

//		var attrsBySign = {};

		for (var i in accessGraph.edges) {
			var edge = accessGraph.edges[i];

			var startNode = edge.start;
			var accessComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
			var accessDomainElement = domainElementsByID[accessComponentUUID];

			var endNode = edge.end;
            var accesseeComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
            var accesseeDomainElement = domainElementsByID[accesseeComponentUUID];


			if(!accessDomainElement || !accesseeDomainElement || accessDomainElement == accesseeDomainElement){
				continue;
			}

			var usage = {
                 _id: startNode.component.UUID + "_" + endNode.component.UUID,
                 type: "usage",
                 Supplier: endNode.component.UUID,
                 Client: callComponentUUID
              };

             DomainModel.Usages.push(usage);

//			var foundAttr = false;
			for (var j in accesseeDomainElement.Attributes) {
				if (accesseeDomainElement.Attributes[j]._id == 'a'+endNode.UUID.replace(/\-/g, "") ) {
					accesseeDomainElement.Attributes[j].visibility = "public";
				}
			}

//			if (!foundAttr) {
//				var attr = {
//					Name: endNode.attrName,
//					_id: 'a'+endNode.UUID.replace(/\-/g, ""),
//					Type: endNode.attrType,
//					TypeUUID: 'a'+endNode.UUID.replace(/\-/g, "")
//				};
//				accesseeDomainElement.Attributes.push(attr);
//				attrsBySign[codeAnalysisUtil.genAttrSign(attr)] = 1;
//			}
		}

        for(var i in extendsGraph.edges){
            var edge = extendsGraph.edges[i];

            			var startNode = edge.start;
            			var extendComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
            			var extendDomainElement = domainElementsByID[extendComponentUUID];

            			var endNode = edge.end;
                        var extendedComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
                        var extendedDomainElement = domainElementsByID[extendedComponentUUID];


            			if(!extendDomainElement || !extendedDomainElement || extendDomainElement == extendedDomainElement){
            				continue;
            			}

            			var generalization = {
                             _id: startNode.component.UUID + "_" + endNode.component.UUID,
                             type: "generalization",
                             Supplier: extendComponentUUID,
                             Client: extendedComponentUUID
                          };

                         DomainModel.Generalizations.push(generalization);
        }

        for(var i in compositionGraph.edges){
           var edge = compositionGraph.edges[i];
           console.log(edge)
           var startNode = edge.start;
            var composeComponentUUID = 'c'+dicClassComponent[startNode.component.UUID].replace(/\-/g, "_");
            var composeDomainElement = domainElementsByID[composeComponentUUID];

                        			var endNode = edge.end;
                                    var composedComponentUUID = 'c'+dicClassComponent[endNode.component.UUID].replace(/\-/g, "_");
                                    var composedDomainElement = domainElementsByID[composedComponentUUID];


                        			if(!composeDomainElement || !composedDomainElement || composeDomainElement == composedDomainElement){
                        				continue;
                        			}

                        			var composition = {
                                         _id: startNode.component.UUID + "_" + endNode.component.UUID,
                                         type: "composition",
                                         Supplier: composeComponentUUID,
                                         Client: composedComponentUUID
                                      };

                                     DomainModel.Associations.push(composition);
        }


		DomainModel.Elements = domainElements;

		DomainModel.DiagramType = "domain_model";

		return {
			DomainModel:DomainModel,
			DomainElementsByID: domainElementsByID,
			dicComponentDomainElement: dicComponentDomainElement
		}

	}
		
	
	module.exports = {
        createDomainModel: createDomainModel
	}
}());
