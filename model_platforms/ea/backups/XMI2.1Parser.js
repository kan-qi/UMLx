/**
 * This module is used to parse different XMI modelf files.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();

	function extractModelComponents(parsedResult) {
		var components = {};

		var elements = parsedResult['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'];
		for ( var i in elements) {
			var element = elements[i];
			var component = {
				Category : 'Element',
				StereoType : element['$']['xmi:type'],
				Name : element['$']['name']
			};
			if (component.StereoType === 'uml:Object') {
				var connectors = new Array();
				if (element['links'] && element['links'][0]) {
					for ( var j in element['links'][0]['Association']) {
						var association = element['links'][0]['Association'][j];
						connectors.push({
							ClientID : association['$']['start'],
							SupplierID : association['$']['end']
						});
					}

					for ( var j in element['links'][0]['Dependency']) {
						var dependency = element['links'][0]['Dependency'][j];
						connectors.push({
							ClientID : dependency['$']['start'],
							SupplierID : dependency['$']['end']
						});
					}

					for ( var j in element['links'][0]['InformationFlow']) {
						var informationFlow = element['links'][0]['InformationFlow'][j];
						connectors.push({
							ClientID : informationFlow['$']['start'],
							SupplierID : informationFlow['$']['end']
						});
					}

				}

				component.Connectors = connectors;
				component.Type = element['properties'][0]['$']['stereotype'];
			} else if (component.StereoType === 'uml:Actor') {
				var connectors = new Array();
				if (element['links'] && element['links'][0]) {
					for ( var j in element['links'][0]['Association']) {
						var association = element['links'][0]['Association'][j];
						connectors.push({
							ClientID : association['$']['start'],
							SupplierID : association['$']['end']
						});
					}

					for ( var j in element['links'][0]['Dependency']) {
						var dependency = element['links'][0]['Dependency'][j];
						connectors.push({
							ClientID : dependency['$']['start'],
							SupplierID : dependency['$']['end']
						});
					}

					for ( var j in element['links'][0]['InformationFlow']) {
						var informationFlow = element['links'][0]['InformationFlow'][j];
						connectors.push({
							ClientID : informationFlow['$']['start'],
							SupplierID : informationFlow['$']['end']
						});
					}
				}
				component.Connectors = connectors;
				component.Type = 'actor';
			} else if (component.StereoType === 'uml:Class') {
				var attributes = new Array();
				if (element['attributes']) {
					if (element['attributes'][0]['attribute']) {
						for (var j = 0; j < element['attributes'][0]['attribute'].length; j++) {
							var attribute = element['attributes'][0]['attribute'][j];
							if (!attribute['$']['name']) {
								continue;
							}
							attributes.push({
								Name : attribute['$']['name'],
								Type : attribute['properties'][0]['$']['type']
							});
						}
					}
				}

				var operations = new Array();
				if (element['operations']) {
					if (element['operations'][0]['operation']) {
						for (var j = 0; j < element['operations'][0]['operation'].length; j++) {
							var operation = element['operations'][0]['operation'][j];
							var parameters = [];
							for ( var k in operation['parameters'][0]['parameter']) {
								var parameter = operation['parameters'][0]['parameter'][k];
								parameters
										.push({
											Type : parameter['properties'][0]['$']['type']
										});
							}
							operations.push({
								Name : operation['$']['name'],
								Parameters : parameters
							});
						}
					}
				}
				//				
				// console.log(classDiagram);
				component.Operations = operations;
				component.Attributes = attributes;
				component.Type = 'class';
			} else if (component.StereoType === 'uml:Sequence') {
				var connectors = new Array();
				if (element['links'] && element['links'][0]
						&& element['links'][0]['Sequence']) {
					for (var j = 0; j < element['links'][0]['Sequence'].length; j++) {
						var sequence = element['links'][0]['Sequence'][j];
						connectors.push({
							ClientID : sequence['$']['start'],
							SupplierID : sequence['$']['end']
						});
					}
				}
				component.Connectors = connectors;
				component.Type = element['properties'][0]['$']['stereotype'];
			} else if (component.Stereotype === 'uml:Requirement') {
				console.log('requirement element: ' + component.Name);
			}

			components[element['$']['xmi:idref']] = component;

		}

		var connectors = parsedResult['xmi:XMI']['xmi:Extension'][0]['connectors'][0]['connector'];
		for ( var i in connectors) {
			var connector = connectors[i];
			components[connector['$']['xmi:idref']] = {
				Category : 'Connector',
				Type : connector['properties'][0]['$']['ea_type'],
				Name : connector['properties'][0]['$']['name'],
				ClientID : connector['target'][0]['$']['xmi:idref'],
				SupplierID : connector['source'][0]['$']['xmi:idref']
			};
		}

		var diagrams = parsedResult['xmi:XMI']['xmi:Extension'][0]['diagrams'][0]['diagram'];
		for ( var i in diagrams) {
			var diagram = diagrams[i];
			// elements from diagram doesn't have sufficient information.
			var componentIDs = [];
			if (diagram['elements']) {
				for ( var j in diagram['elements'][0]['element']) {
					componentIDs
							.push(diagram['elements'][0]['element'][j]['$']['subject']);
				}
			}
			components[diagram['$']['xmi:id']] = {
				Category : 'Diagram',
				Type : diagram['properties'][0]['$']['type'],
				Name : diagram['properties'][0]['$']['name'],
				ComponentIDs : componentIDs
			};
		}

		return components;
	}

	function extractModels(parsedResult) {
		var modelComponents = extractModelComponents(parsedResult);
		var models = {};
		var xmiExtension = parsedResult['xmi:XMI']['xmi:Extension'][0];
		for ( var i in xmiExtension['diagrams'][0]['diagram']) {
			var diagram = xmiExtension['diagrams'][0]['diagram'][i];
			var modelPackage = models['Packages'];
			if (!modelPackage) {
				modelPackage = {};
				models['Packages'] = modelPackage;
			}
			var owner = modelPackage[diagram['model'][0]['$']['owner']];
			if (!owner) {
				owner = {};
				modelPackage[diagram['model'][0]['$']['owner']] = owner;
			}

			var model = owner;

			if (diagram['properties'][0]['$']['type'] === 'Sequence'
					|| diagram['properties'][0]['$']['type'] === 'Analysis') {
				if (diagram['model'][0]['$']['parent']) {
					if (!owner['UseCases']) {
						owner['UseCases'] = {};
					}

					useCase = owner['UseCases'][diagram['model'][0]['$']['parent']];
					if (!useCase) {
						var useCaseComponent = modelComponents[diagram['model'][0]['$']['parent']];
						// console.log(useCaseComponent);
						useCase = {
							Name : useCaseComponent.Name
						};
						owner['UseCases'][diagram['model'][0]['$']['parent']] = useCase;
					}
					model = useCase;
				}
			} else if (diagram['properties'][0]['$']['type'] === 'Logical') {
				domainModel = owner['DomainModel'];
				if (!domainModel) {
					domainModel = {};
					owner['DomainModel'] = domainModel;
				}
				model = domainModel;
			}
			// console.log(modelComponents[diagram['$']['xmi:id']]);

			if (!model.Diagrams) {
				model['Diagrams'] = {};
			}
			model['Diagrams'][diagram['$']['xmi:id']] = modelComponents[diagram['$']['xmi:id']];

			populateDiagram(model['Diagrams'][diagram['$']['xmi:id']],
					modelComponents);
		}
		return models;
	}

	function populateDiagram(diagram, modelComponents) {
		if (diagram.Type === 'Sequence') {
			var Elements = {};
			var Messages = [];
			// console.log(modelComponents);
			for ( var i in diagram['ComponentIDs']) {
				var component = modelComponents[diagram['ComponentIDs'][i]];
				var category = component.Category;
				var type = component.Type;
				if (category === 'Element') { // more conditions to filter the
					// element
					if (type === 'actor' || type === 'boundary'
							|| type === 'control' || type === 'entity') {
						Elements[diagram['ComponentIDs'][i]] = component;
					}
				} else if (category === 'Connector') {
					if (type === 'Sequence') {
						Messages.push(component);
					}
				}
			}
			diagram.Elements = Elements;
			diagram.Messages = Messages;
		} else if (diagram.Type === 'Analysis') {
			var Elements = {};
			for ( var i in diagram['ComponentIDs']) {
				var component = modelComponents[diagram['ComponentIDs'][i]];
				var category = component.Category;
				var type = component.Type;
				if (category === 'Element') { // more conditions to filter the
					// element
					if (type === 'actor' || type === 'boundary'
							|| type === 'control' || type === 'entity') {
						Elements[diagram['ComponentIDs'][i]] = component;
					}
				}
			}
			diagram.Elements = Elements;

		} else if (diagram.Type === "Logical") {
			var Elements = {};
			var elementNum = 0;
			var attributeNum = 0;
			var operationNum = 0;
			for ( var i in diagram['ComponentIDs']) {
				var component = modelComponents[diagram['ComponentIDs'][i]];
				if (!component) {
					continue;
				}
				var category = component.Category;
				var type = component.Type;
				if (category === 'Element') { // more conditions to filter the
					// element
					if (type === 'class') {
						Elements[diagram['ComponentIDs'][i]] = component;
						elementNum++;
						if (component.Operations) {
							for ( var j in component.Operations) {
								operationNum++;
							}
						}
						if (component.Attributes) {
							for ( var j in component.Attributes) {
								attributeNum++;
							}
						}
					}
				}
			}
			diagram.Elements = Elements;
			diagram.ElementNum = elementNum;
			diagram.AttributeNum = attributeNum;
			diagram.OperationNum = operationNum;
		}
	}

	function extractUseCasesFromParsedResult(parsedResult) {

	}

	function extractDomainModelFromParsedResult(parsedResult) {

	}

	module.exports = {
		extractClassDiagrams : function(file, func) {
			fs
					.readFile(
							file,
							function(err, data) {
								parser
										.parseString(
												data,
												function(err, result) {
													var classDiagrams = extractClassDiagramsFromParsedResult(result);
													if (func) {
														func(classDiagrams);
													}
												});
							});
		},
		extractSequenceDiagrams : function(file, func) {
		},
		extractRobustnessDiagrams : function(file, func) {
			fs
					.readFile(
							file,
							function(err, data) {
								parser
										.parseString(
												data,
												function(err, result) {
													var robustnessDiagrams = extractRobustnessDiagramsFromParsedResult(result);
													if (func) {
														func(robustnessDiagrams);
													}
												});
							});
		},
		extractUseCases : function(file, func) {
			// Use Cases include sequence diagrams, robustness diagram, and
			// activity diagrams.
		},
		extractDomainModel : function(file, func) {
			// Domain Models include class diagrams, information block
			// diagrams
		},
		extractModels : function(file, func) {
			// robustnessDiagram
			// contained in the
			// xmi model file
			fs.readFile(file, function(err, data) {
				parser.parseString(data, function(err, result) {
					var models = extractModels(result);

					if (func) {
						func(models);
					}
				})
			});
		},
	}
}());