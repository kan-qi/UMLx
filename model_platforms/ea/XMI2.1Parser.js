/**
 * This module is used to parse different XMI modelf files.
 */

class Node{
	constructor(Id, Name)
	{
		this.Id = Id;
		this.Name = Name;
	}
}

class Edge {
	constructor(fromEnd, toEnd, Id, Name)
	{
		this.fromEnd = fromEnd;
		this.toEnd = toEnd;
		this.Id = Id;
		this.Name = Name;
	}
}


class Graph{
	constructor()
	{
		this.nodes = [];
		this.edges = [];
	}
	
	addNode(node){
		this.nodes.push(node);
	}
	
	addEdge(edge){
		this.edges.push(edge);
	}
	
	getNodes(){
		return this.nodes;
	}
	
	getEdges(){
		return this.edges;
	}
}


var http = require('http');
var fs = require('fs');
var parser = require('xml2js').Parser();
var _ = require('lodash');

var xmlParser = require('xml2js').Parser();
var fileSystem = require('fs');
var graph = new Graph();



// read a file.
function readFile(callback) {
	fs.readFile('project.xml', function(err, data) {
		if (err) {
			console.log('Parser : the file entered is not read.');
			callback()
		} else {
			console.log ('Parser: The file was read');
			callback(data);
		}
	});
}


// Parse the xml data of the sequence diagram.
function parseData (data){
	xmlParser.parseString(data, function (err, result) {
		if (err)
			console.log ("error in parsing", err);
		extractNodes(result);
		extractEdges(result);
		console.log ('the nodes are ', JSON.stringify(graph.getNodes()));
		console.log ('the messages are', JSON.stringify(graph.getEdges()));
	});
}



// Function to extract the nodes suchs as InteractionLifeLine, from the parsed
// JSON.
function extractNodes(sequenceDiagramJSON){
	// TODO: is an array.
	var models = sequenceDiagramJSON.Project.Models;
	
	var model = models[0];
	var modelChildren = model.Frame[0].ModelChildren;
	var diagramChildren = modelChildren[0];
		
	extractInteractionActors(diagramChildren);
	
	extractInteractionLifeLine(diagramChildren);

}

function extractInteractionLifeLine(diagramChildren){
	var interactionLifeLines = _.get(diagramChildren,'InteractionLifeLine',[]);

	for (var index = 0; index < interactionLifeLines.length; index++){
		
		var interactionLifeLine = interactionLifeLines[index];
		// extract the interactionlifeline id and name.
		var interactionLifeLineAttributes = interactionLifeLine.$;
		var id = interactionLifeLineAttributes.Id;
		var name = interactionLifeLineAttributes.Name;
		
		// create a new node with the interaction Life Line information.
		var node = new Node(id, name);
		graph.addNode(node);
	}
}



function extractInteractionActors(diagramChildren){
// extract if models are present
	
	var modelActors = _.get(diagramChildren, 'InteractionActor', []);
	
	console.log ('the interactionLifeLines ', JSON.stringify(diagramChildren));
	
	for (var index = 0; index < modelActors.length; index++){
		
		var modelActor = modelActors[index];
		var modelActorAttributes = modelActor.$;
		var id = modelActorAttributes.Id;
		var name = modelActorAttributes.Name;
		
		// create a new node with the interaction Life Line information.
		var node = new Node(id, name);
		graph.addNode(node);
	}
}



// Extracts the Messages between InteractionLifeLine as edges to a graph node.
function extractEdges (sequenceDiagramJSON){	
	// TODO: is an array.
	var models = sequenceDiagramJSON.Project.Models;
	
	var model = models[0];
	var modelChildren = model.ModelRelationshipContainer[0].ModelChildren;
	
	var modelRelationshipContainers = modelChildren[0];
	for (var index = 0; index < modelRelationshipContainers.ModelRelationshipContainer[0].ModelChildren.length; index++){
		
		var relationshipMessages = modelRelationshipContainers.ModelRelationshipContainer[0].ModelChildren[index];
		
		for (var messageIndex = 0; messageIndex < relationshipMessages.Message.length; messageIndex++){
			var relationshipMessage = relationshipMessages.Message[messageIndex];
			
			// extract the message id and name.
			var messageAttributes  = relationshipMessage.$;
			var messageId = messageAttributes.Id;
			var messageName = messageAttributes.Name;
			
			// extract the message from element Id.
			var fromEndInfo = relationshipMessage.FromEnd;
			var messageEnd = fromEndInfo[0];
			var messageEndInfo = messageEnd.MessageEnd[0];
			var endElementId = messageEndInfo.$.EndModelElement;
			
			// extract the to element Id.
			var toEndInfo = relationshipMessage.ToEnd;
			var messageTo = toEndInfo[0];
			var messageToInfo = messageTo.MessageEnd[0];
			var toElementId = messageToInfo.$.EndModelElement;
			
			// add Edge to the graph.
			var edge = new Edge(endElementId, toElementId, messageId, messageName);
			graph.addEdge(edge);
		}
	}	
}

(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	
	function extractModelComponents(parsedResult){
		var components = {};
		
		var elements = parsedResult['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'];
		for(var i in elements){
			var element = elements[i];
			var component = {
					Category: 'Element',
					StereoType: element['$']['xmi:type'],
					Name: element['$']['name']
			};
			if(component.StereoType === 'uml:Object'){
				var connectors = new Array();
				if (element['links'] && element['links'][0]) {
					for (var j in element['links'][0]['Association']) {
						var association = element['links'][0]['Association'][j];
						connectors
						.push({
							ClientID : association['$']['start'],
							SupplierID : association['$']['end']
						});
					}
					
				for (var j in element['links'][0]['Dependency']) {
					var dependency = element['links'][0]['Dependency'][j];
					connectors
					.push({
						ClientID : dependency['$']['start'],
						SupplierID : dependency['$']['end']
					});
				}
				
				for (var j in element['links'][0]['InformationFlow']) {
					var informationFlow = element['links'][0]['InformationFlow'][j];
					connectors
					.push({
						ClientID : informationFlow['$']['start'],
						SupplierID : informationFlow['$']['end']
					});
				}
				

				}
				
				component.Connectors = connectors;
				component.Type = element['properties'][0]['$']['stereotype'];
			}
			else if(component.StereoType === 'uml:Actor'){
				var connectors = new Array();
				if (element['links'] && element['links'][0]) {
					for (var j in element['links'][0]['Association']) {
						var association = element['links'][0]['Association'][j];
						connectors
						.push({
							ClientID : association['$']['start'],
							SupplierID : association['$']['end']
						});
					}
					
					for (var j in element['links'][0]['Dependency']) {
						var dependency = element['links'][0]['Dependency'][j];
						connectors
						.push({
							ClientID : dependency['$']['start'],
							SupplierID : dependency['$']['end']
						});
					}
					
					for (var j in element['links'][0]['InformationFlow']) {
						var informationFlow = element['links'][0]['InformationFlow'][j];
						connectors
						.push({
							ClientID : informationFlow['$']['start'],
							SupplierID : informationFlow['$']['end']
						});
					}
				}
				component.Connectors = connectors;
				component.Type = 'actor';
			}
			else if(component.StereoType === 'uml:Class'){
				var attributes = new Array();
				if(element['attributes']){
				if (element['attributes'][0]['attribute']) {
					for (var j = 0; j < element['attributes'][0]['attribute'].length; j++) {
						var attribute = element['attributes'][0]['attribute'][j];
						if(!attribute['$']['name']){
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
				if(element['operations']){
				if (element['operations'][0]['operation']) {
					for (var j = 0; j < element['operations'][0]['operation'].length; j++) {
						var operation = element['operations'][0]['operation'][j];
						var parameters = [];
						for(var k in operation['parameters'][0]['parameter']){
							var parameter = operation['parameters'][0]['parameter'][k];
							parameters.push({
								Type: parameter['properties'][0]['$']['type']
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
//				console.log(classDiagram);
				component.Operations = operations;
				component.Attributes = attributes;
				component.Type = 'class';
			}
			else if (component.StereoType === 'uml:Sequence') {
					var connectors = new Array();
					if (element['links'] && element['links'][0] && element['links'][0]['Sequence']) {
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
			}
			else if(component.Stereotype === 'uml:Requirement'){
				console.log('requirement element: '+component.Name);
			}

			components[element['$']['xmi:idref']] = component;
			
		}
		
		var connectors = parsedResult['xmi:XMI']['xmi:Extension'][0]['connectors'][0]['connector'];
		for(var i in connectors){
			var connector = connectors[i];
			components[connector['$']['xmi:idref']] = {
					Category: 'Connector',
					Type: connector['properties'][0]['$']['ea_type'],
					Name: connector['properties'][0]['$']['name'],
					ClientID: connector['target'][0]['$']['xmi:idref'],
					SupplierID:  connector['source'][0]['$']['xmi:idref']
			};
		}
		
		var diagrams = parsedResult['xmi:XMI']['xmi:Extension'][0]['diagrams'][0]['diagram'];
		for(var i in diagrams){
			var diagram = diagrams[i];
			//elements from diagram doesn't have sufficient information.
			var componentIDs = [];
			if(diagram['elements']){
			for(var j in diagram['elements'][0]['element']) {
				componentIDs.push(diagram['elements'][0]['element'][j]['$']['subject']);
			}
			}
			components[diagram['$']['xmi:id']] = {
					Category: 'Diagram',
					Type: diagram['properties'][0]['$']['type'],
					Name: diagram['properties'][0]['$']['name'],
					ComponentIDs: componentIDs
			};
		}
		
		return components;
	}
	
	function extractModels(parsedResult){
		var modelComponents = extractModelComponents(parsedResult);
		var models = {};
		var xmiExtension = parsedResult['xmi:XMI']['xmi:Extension'][0];
		for(var i in xmiExtension['diagrams'][0]['diagram']){
			var diagram = xmiExtension['diagrams'][0]['diagram'][i];
			var modelPackage = models['Packages'];
			if(!modelPackage){
				modelPackage = {};
				models['Packages'] = modelPackage;
			}
			var owner = modelPackage[diagram['model'][0]['$']['owner']];
			if(!owner){
				owner = {};
				modelPackage[diagram['model'][0]['$']['owner']] = owner;
			}
			
			var model = owner;
			
			if(diagram['properties'][0]['$']['type'] === 'Sequence' ||
				diagram['properties'][0]['$']['type'] === 'Analysis') {
				if(diagram['model'][0]['$']['parent']){
					if(!owner['UseCases']){
						owner['UseCases'] = {};
					}
					
					useCase = owner['UseCases'][diagram['model'][0]['$']['parent']];
					if(!useCase){
						var useCaseComponent = modelComponents[diagram['model'][0]['$']['parent']];
//						console.log(useCaseComponent);
						useCase = {
								Name: useCaseComponent.Name
						};
						owner['UseCases'][diagram['model'][0]['$']['parent']] = useCase;
					}
					model = useCase;
					}
			}
			else if(diagram['properties'][0]['$']['type'] === 'Logical') {
				domainModel = owner['DomainModel'];
				if(!domainModel){
					domainModel = {};
					owner['DomainModel'] = domainModel;
				}
				model = domainModel;
			}
//			console.log(modelComponents[diagram['$']['xmi:id']]);
			
			if(!model.Diagrams){
				model['Diagrams'] = {};
			}
			model['Diagrams'][diagram['$']['xmi:id']] = modelComponents[diagram['$']['xmi:id']];
			
			populateDiagram(model['Diagrams'][diagram['$']['xmi:id']], modelComponents);
		}
		return models;
	}
	
	function populateDiagram(diagram, modelComponents){
		if(diagram.Type === 'Sequence'){
			var Elements = {};
			var Messages = [];
//			console.log(modelComponents);
			for(var i in diagram['ComponentIDs']){
				var component = modelComponents[diagram['ComponentIDs'][i]];
				var category = component.Category;
				var type = component.Type;
				if(category === 'Element'){ // more conditions to filter the element
					if(type === 'actor' || type === 'boundary' || type==='control' || type === 'entity'){
					Elements[diagram['ComponentIDs'][i]] = component;
					}
				}
				else if(category === 'Connector') {
					if(type === 'Sequence'){
					Messages.push(component);
					}
				}
			}
			diagram.Elements = Elements;
			diagram.Messages = Messages;
		} else if(diagram.Type === 'Analysis'){
			var Elements = {};
			for(var i in diagram['ComponentIDs']){
				var component = modelComponents[diagram['ComponentIDs'][i]];
				var category = component.Category;
				var type = component.Type;
				if(category === 'Element'){ // more conditions to filter the element
					if(type === 'actor' || type === 'boundary' || type==='control' || type === 'entity'){
					Elements[diagram['ComponentIDs'][i]] = component;
					}
				}
			}
			diagram.Elements = Elements;
			
		} else if(diagram.Type === "Logical"){
			var Elements = {};
			var elementNum = 0;
			var attributeNum = 0;
			var operationNum = 0;
			for(var i in diagram['ComponentIDs']){
				var component = modelComponents[diagram['ComponentIDs'][i]];
				if(!component){
					continue;
				}
				var category = component.Category;
				var type = component.Type;
				if(category === 'Element'){ // more conditions to filter the element
					if(type === 'class'){
					Elements[diagram['ComponentIDs'][i]] = component;
					elementNum ++;
					if(component.Operations){
						for(var j in component.Operations){
							operationNum++;
						}
					}
					if(component.Attributes){
						for(var j in component.Attributes){
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
	
	function extractUseCasesFromParsedResult(parsedResult){
	
	}
	
	
	function extractDomainModelFromParsedResult(parsedResult){
		
	}
	
	module.exports = {
			parseSequenceDiagram: function (file, callback){
				readFile(parseData);
				// TODO :you make use of the constructed graph object from here.
				
			},	
			extractClassDiagrams: function(file, func){
				fs.readFile(file, function(err, data) {
					parser.parseString(data, function(err, result) {
						var classDiagrams = extractClassDiagramsFromParsedResult(result);
						if(func){
							func(classDiagrams);
						}
					});
				});
			},
			extractSequenceDiagrams : function(file, func) {
				fs.readFile(file, function(err, data) {
					parser.parseString(data, function(err, result) {
						var sequenceDiagrams = extractSequenceDiagramsFromParsedResult(result);
						if(func){
							func(sequenceDiagrams);
						}
					});
				});
			},
			extractRobustnessDiagrams : function(file, func){
				fs.readFile(file, function(err, data) {
					parser.parseString(data, function(err, result) {
						var robustnessDiagrams = extractRobustnessDiagramsFromParsedResult(result);
						if(func){
							func(robustnessDiagrams);
						}
					});
				});
			} ,
			extractUseCases: function(file, func){
				//Use Cases include sequence diagrams, robustness diagram, and activity diagrams.
			},
			extractDomainModel: function(file, func){
				// Domain Models include class diagrams, information block diagrams
			},
			extractModels: function(file, func){
				// robustnessDiagram
				// contained in the
				// xmi model file
				fs.readFile(file, function(err, data) {
					parser.parseString(data, function(err, result) {
					var models = extractModels(result);
					
					if(func){
					func(models);
					}
				})
				});
			},
	}
}());