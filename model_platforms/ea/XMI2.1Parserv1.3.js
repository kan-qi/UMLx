/**
 * This module is used to parse different XMI modelf files.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();

	function extractModelComponents(xmiString) {
		var xmiExtension = xmiString['xmi:XMI']['xmi:Extension'][0];
		var components = {};
		
		var xmiElements = xmiString['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'];
		for ( var i in xmiElements) {
			var xmiElement = xmiElements[i];
			var component = {
				//keep the ID of the xmi model, for re-analyse
				_id : xmiElement['$']['xmi:idref'],
				Category : 'Element',
				StereoType : xmiElement['$']['xmi:type'],
				Name : xmiElement['$']['name']
			};
			if (component.StereoType === 'uml:Object') {
				var connectors = new Array();
				if (xmiElement['links'] && xmiElement['links'][0]) {
					for ( var j in xmiElement['links'][0]['Association']) {
						var association = xmiElement['links'][0]['Association'][j];
						connectors.push({
							TargetID : association['$']['start'],
							SourceID : association['$']['end']
						});
					}

					for ( var j in xmiElement['links'][0]['Dependency']) {
						var dependency = xmiElement['links'][0]['Dependency'][j];
						connectors.push({
							TargetID : dependency['$']['start'],
							SourceID : dependency['$']['end']
						});
					}

					for ( var j in xmiElement['links'][0]['InformationFlow']) {
						var informationFlow = xmiElement['links'][0]['InformationFlow'][j];
						connectors.push({
							TargetID : informationFlow['$']['start'],
							SourceID : informationFlow['$']['end']
						});
					}

				}

				component.Connectors = connectors;
				component.Type = xmiElement['properties'][0]['$']['stereotype'];
			} else if (component.StereoType === 'uml:Actor') {
				var connectors = new Array();
				if (xmiElement['links'] && xmiElement['links'][0]) {
					for ( var j in xmiElement['links'][0]['Association']) {
						var association = xmiElement['links'][0]['Association'][j];
						connectors.push({
							TargetID : association['$']['start'],
							SourceID : association['$']['end']
						});
					}

					for ( var j in xmiElement['links'][0]['Dependency']) {
						var dependency = xmiElement['links'][0]['Dependency'][j];
						connectors.push({
							TargetID : dependency['$']['start'],
							SourceID : dependency['$']['end']
						});
					}

					for ( var j in xmiElement['links'][0]['InformationFlow']) {
						var informationFlow = xmiElement['links'][0]['InformationFlow'][j];
						connectors.push({
							TargetID : informationFlow['$']['start'],
							SourceID : informationFlow['$']['end']
						});
					}
				}
				component.Connectors = connectors;
				component.Type = 'actor';
			} else if (component.StereoType === 'uml:Class') {
				var attributes = new Array();
				if (xmiElement['attributes']) {
					if (xmiElement['attributes'][0]['attribute']) {
						for (var j = 0; j < xmiElement['attributes'][0]['attribute'].length; j++) {
							var attribute = xmiElement['attributes'][0]['attribute'][j];
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
				if (xmiElement['operations']) {
					if (xmiElement['operations'][0]['operation']) {
						for (var j = 0; j < xmiElement['operations'][0]['operation'].length; j++) {
							var operation = xmiElement['operations'][0]['operation'][j];
							var parameters = [];
							for ( var k in operation['parameters'][0]['parameter']) {
								var parameter = operation['parameters'][0]['parameter'][k];
								parameters.push({
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
				if (xmiElement['links'] && xmiElement['links'][0] && xmiElement['links'][0]['Sequence']) {
					for (var j = 0; j < xmiElement['links'][0]['Sequence'].length; j++) {
						var sequence = xmiElement['links'][0]['Sequence'][j];
						connectors.push({
							TargetID : sequence['$']['start'],
							SourceID : sequence['$']['end']
						});
					}
				}
				component.Connectors = connectors;
				component.Type = xmiElement['properties'][0]['$']['stereotype'];
			} else if (component.StereoType === "uml:Activity"){
				
				var connectors = new Array();
				if (xmiElement['links'] && xmiElement['links'][0] && xmiElement['links'][0]['ControlFlow']) {
					for (var j = 0; j < xmiElement['links'][0]['ControlFlow'].length; j++) {
						var controlFlow = xmiElement['links'][0]['ControlFlow'][j];
						connectors.push({
							TargetID : controlFlow['$']['start'],
							SourceID : controlFlow['$']['end']
						});
					}
				}
				component.Connectors = connectors;
				component.Type = xmiElement['properties'][0]['$']['stereotype'];
				
			}
			else if (component.Stereotype === 'uml:Requirement') {
				console.log('requirement xmiElement: ' + component.Name);
			}

			components[xmiElement['$']['xmi:idref']] = component;

		}

		//initiate connectors as components.
		var xmiConnectors = xmiString['xmi:XMI']['xmi:Extension'][0]['connectors'][0]['connector'];
		for ( var i in xmiConnectors) {
			var xmiConnector = xmiConnectors[i];
			components[xmiConnector['$']['xmi:idref']] = {
				_id : xmiConnector['$']['xmi:idref'],
				Category : 'Connector',
				Type : xmiConnector['properties'][0]['$']['ea_type'],
				Name : xmiConnector['properties'][0]['$']['name'],
				TargetID : xmiConnector['target'][0]['$']['xmi:idref'],
				SourceID : xmiConnector['source'][0]['$']['xmi:idref']
			};
		}
		
		//initiate diagrams as components.
		var xmiDiagrams = xmiString['xmi:XMI']['xmi:Extension'][0]['diagrams'][0]['diagram'];
		for ( var i in xmiDiagrams) {
			var xmiDiagram = xmiDiagrams[i];
			
			var componentIDs = [];
			if (xmiDiagram['elements']) {
				for ( var j in xmiDiagram['elements'][0]['element']) {
					componentIDs.push(xmiDiagram['elements'][0]['element'][j]['$']['subject']);
				}
			}
			
			// elements from diagram doesn't have sufficient information.
			var diagram = {
					_id : xmiDiagram['$']['xmi:id'],
					Category : 'Diagram',
					Type : xmiDiagram['properties'][0]['$']['type'],
					Name : xmiDiagram['properties'][0]['$']['name'],
					Package : xmiDiagram['model'][0]['$']['owner'],
					Parent: xmiElement['model'][0]['$']['parent'],
//					XMIElement: xmiDiagram,
					ComponentIDs : componentIDs,
				};
			
			populateDiagram(diagram, components);

			components[xmiDiagram['$']['xmi:id']] = diagram; 
		}

		return components;
	}

	module.exports = {
			
			extractModelComponents : extractModelComponent(xmiString)
	}
}());