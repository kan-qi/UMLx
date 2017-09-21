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
	});
}

// Function to extract the nodes suchs as InteractionLifeLine, from the parsed
// JSON.
function extractNodes(sequenceDiagramJSON){	
	// TODO: is an array.
	var models = sequenceDiagramJSON.Project.Models;
	
	var model = models[0];
	var modelChildren = model.Frame[0].ModelChildren;
	var interactionLifeLines = modelChildren[0];
		
	for (var index = 0; index < interactionLifeLines.InteractionLifeLine.length; index++){
		
		var interactionLifeLine = interactionLifeLines.InteractionLifeLine[index];
		
		//extract the interactionlifeline id and name.
		var interactionLifeLineAttributes = interactionLifeLine.$;
		var id = interactionLifeLineAttributes.Id;
		var name = interactionLifeLineAttributes.Name;
		
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
			
			//add Edge to the graph.
			var edge = new Edge(endElementId, toElementId, messageId, messageName);
			graph.addEdge(edge);
		}
	}	
}
