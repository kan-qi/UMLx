(function() {
	class Node{
		constructor(Id, Name)
		{
			this.Id = Id;
			this.Name = Name;
		}
	}

class ActivityNode{
	
	constructor(Id, Name, PartitionName)
	{
		this.Id = Id;
		this.Name = Name;
		this.partitionName = PartitionName;
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
	function readFile(fileName, processFunction ,dataCallback) {
		fs.readFile(fileName, function(err, data) {
			if (err) {
				console.log('Parser : the file entered is not read.');
				dataCallback(err);
			} else {
				console.log ('Parser: The file was read');
				processFunction(data, dataCallback);
			}
		});
	}
	
	
	// Parse the xml data of the sequence diagram.
	function parseData (data,dataCallback){
		xmlParser.parseString(data, function (err, result) {
			if (err)
				console.log ("error in parsing", err);
			extractNodes(result);
			extractEdges(result);
			dataCallback(graph);
		});
	}
	
	
	function extractContainedElements(activityComponents){
		var activityDiagram = activityComponents[0];
		var  activityPartitions = activityDiagram.ActivityPartition;
		
		for (var partition = 0; partition < activityPartitions.length; partition++){
			var activityPartition = activityPartitions[partition];
			
			var partitionName = activityPartition.$.Name;
			
			var containedElement = activityPartition.ContainedElements[0];
			
			var initialNodes = _.get(containedElement, 'InitialNode', {});
			for (initialNodeElement = 0; initialNodeElement < initialNodes.length; initialNodeElement++){
				var initialNode = initialNodes[initialNodeElement];
				var node = new ActivityNode(initialNode.$.Idref, initialNode.$.Name, partitionName);
				graph.addNode(node);
			}
		
			var activityActions = _.get(containedElement, 'ActivityAction', {});
			for (var activtiyAction = 0; activtiyAction < activityActions.length; activtiyAction++){
				var action = activityActions[activtiyAction];
				var actionNode = new ActivityNode (action.$.Idref,action.$.Name, partitionName);
				graph.addNode(actionNode);
			}
			
			var decisionNodes = _.get(containedElement, 'DecisionNode', {});
			for (var decision = 0; decision  < decisionNodes.length; decision++){
				var decisionNode = decisionNodes[decision];
				var decisionGraphNode = new ActivityNode(decisionNode.$.Idref, decisionNode.$.Name, partitionName);
				graph.addNode(decisionGraphNode);
			}
			
			var finalNodes = _.get(containedElement, 'ActivityFinalNode', {});
			for (var finalNodeElement = 0; finalNodeElement < finalNodes.length; finalNodeElement++){
				var finalNode = finalNodes[finalNodeElement];
				var finalGraphNode = new ActivityNode(finalNode.$.Idref, finalNode.$.Name, partitionName);
				graph.addNode(finalGraphNode);
			}
		}
	}
	
	
	
	function extractContainedRelationships(relationshipComponents){
		var controlFlows = relationshipComponents[0].ControlFlow;
		for (var flow = 0; flow < controlFlows.length; flow++){
			var controlFlow = controlFlows[flow];
			
			var fromId = controlFlow.$.From;
			var toId = controlFlow.$.To;
			var id = controlFlow.$.Id;
			var Name = controlFlow.$.Guard;
			
			var edge = new Edge(fromId,toId, id, Name);
			graph.addEdge(edge);
		}
	}
	

	function extractActivityNodes(activityDiagramJSON){
		var models = activityDiagramJSON.Project.Models[0];
	
		console.log ('the models are ', JSON.stringify(models));
		var activityComponents = undefined;
		if (_.get(models,'Activity', undefined) == undefined){
			activityComponents = models.ActivitySwimlane2[0].ModelChildren;
		}else{
			var activityModel = models.Activity[0];
			var activityModelChildren = activityModel.ModelChildren[0];
			activityComponents = activityModelChildren.ActivitySwimlane2[0].ModelChildren;
		}
		
		extractContainedElements(activityComponents);
	}
	
	function extractActivityEdges(activityDiagramJSON){
		var models = activityDiagramJSON.Project.Models[0];
		var relationshipModel = models.ModelRelationshipContainer[0];
		var relationshipModelChildren = relationshipModel.ModelChildren[0];		
		var relationshipComponents = relationshipModelChildren.ModelRelationshipContainer[0].ModelChildren;
		
		extractContainedRelationships(relationshipComponents);
	}
	
	function parseActivityData(data, dataCallback){
		xmlParser.parseString(data, function (err, result) {
			if (err)
				console.log ("error in parsing", err);
			
			extractActivityNodes(result);
			extractActivityEdges(result);
			dataCallback(graph);
		});
	}
	
	// Function to extract the nodes suchs as InteractionLifeLine, from the
	// parsed
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
	
	
	// Extracts the Messages between InteractionLifeLine as edges to a graph
	// node.
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
	
	function extractSequenceDiagrams (file, func) {
		readFile(file, parseData, func);
	}
	
	function extractActivityDiagram(file, func){
		readFile(file, parseActivityData, func);
	}
	
	module.exports = { extractSequenceDiagrams };
	
}());


