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

class ClassNode{
	constructor(Id,Name,attributes,operations){
		this.Id = Id
		this.Name = Name
		this.attributes = attributes
		this.operations = operations
	}
}

	class ClassRelationEdge{
		constructor(fromEnd, toEnd,fromMultiplicity,toMultiplicity, Id)
		{
			this.fromEnd = fromEnd;
			this.toEnd = toEnd;
			this.fromMultiplicity = fromMultiplicity;
			this.toMultiplicity = toMultiplicity;
			this.Id = Id;
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
	
	class UseCaseAssociation {
		constructor(fromEnd, toEnd,fromMultiplicity,toMultiplicity, Id)
		{
			this.fromEnd = fromEnd;
			this.toEnd = toEnd;
			this.fromMultiplicity = fromMultiplicity;
			this.toMultiplicity = toMultiplicity;
			this.Id = Id;
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
	var graph;
	
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
	
	function parseSequenceDiagramData (data,dataCallback){
		xmlParser.parseString(data, function (err, result) {
			if (err)
				console.log ("error in parsing", err);
			

			extractSequenceDiagNodes(result);
			extractSequenceDiagramEdges(result);
			if (dataCallback){
				
				var response = { 'sequence_diagram' : graph};
				
				dataCallback(response);
			}
		});
	}
	
	function extractContainedActivityElements (activityComponents){
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
	
	function extractContainedClassElements (classComponents){
		
		for (var classIndex = 0; classIndex < classComponents.length; classIndex++){
			var classComponent = classComponents[classIndex];
			
			var className = classComponent.$.Name;
			var classId = classComponent.$.Id;
			
			var metaData = _.get(classComponent,"ModelChildren[0]",undefined);
			
			var attributes = []
			var operations = []
			
			if (metaData){	
				var attributesMetaData = metaData.Attribute;
				for (var attribute = 0; attribute < attributesMetaData.length; attribute++){
					attributes.push(attributesMetaData[attribute].$.Name);
				}
				
				var operationsMetaData = metaData.Operation;
				for (var operation = 0; operation < operationsMetaData.length; operation++){
					operations.push(operationsMetaData[operation].$.Name);
				}
			}
			
			var classNode = new ClassNode(classId, className, attributes, operations);
			graph.addNode(classNode);
		}
	}
	
	function extratContainedClassEdges (classEdgesComponents){
		var edgesComponents = classEdgesComponents[0];
		var edgeComponentsChildren = edgesComponents.ModelChildren[0].ModelRelationshipContainer;
		
		for (edgeRelation = 0; edgeRelation < edgeComponentsChildren.length; edgeRelation++){
		
			var edgeGroupChildren = edgeComponentsChildren[edgeRelation];
			
			if (_.get(edgeGroupChildren,'$.Name',undefined)  == "Association"){
				var associations = edgeGroupChildren.ModelChildren[0].Association;
				
				for (var associationIndex = 0; associationIndex < associations.length; associationIndex++){
					var association = associations[associationIndex];
					var id = association.$.Id;
					var fromEnd = association.FromEnd[0].AssociationEnd[0].$.EndModelElement;
					var fromMultiplicity = association.FromEnd[0].AssociationEnd[0].$.Multiplicity;
					var toEnd = association.ToEnd[0].AssociationEnd[0].$.EndModelElement;
					var toMultiplicity = association.ToEnd[0].AssociationEnd[0].$.Multiplicity;
				
					if (checkNodeisPresent(fromEnd) && checkNodeisPresent(toEnd)){
						var edge = new ClassRelationEdge(fromEnd, toEnd, fromMultiplicity, toMultiplicity, id);
						graph.addEdge(edge);
					}
				}
			}
			else if (_.get(edgeGroupChildren, '$.Name',undefined) == "Generalization"){
				var generalizations = edgeGroupChildren.ModelChildren[0].Generalization;
				
				for (var generalizationIndex = 0; generalizationIndex < generalizations.length; generalizationIndex++){
					var generalization = generalizations[generalizationIndex];
					
					var id = generalization.$.Id;
					var fromEnd = generalization.$.From;
					var toEnd = generalization.$.To;
					
					if (checkNodeisPresent(fromEnd) && checkNodeisPresent(toEnd)){
						var edge = new ClassRelationEdge(fromEnd, toEnd, '', '', id);
						graph.addEdge(edge);
					}
				}
			}
		}		
	}
	
	function extractContainedRelationships (relationshipComponent){
		var controlFlows = relationshipComponent.ModelChildren[0].ControlFlow;
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
	
	function extractActivityNodes (activityDiagramJSON){
		var models = activityDiagramJSON.Project.Models[0];
	
		var activityComponents = undefined;
		if (_.get(models,'Activity', undefined) == undefined){
			activityComponents = models.ActivitySwimlane2[0].ModelChildren;
		}else{
			var activityModel = models.Activity[0];
			var activityModelChildren = activityModel.ModelChildren[0];
			activityComponents = activityModelChildren.ActivitySwimlane2[0].ModelChildren;
		}
		
		extractContainedActivityElements(activityComponents);
	}
	
	function extractClassDiagramEdges (classDiagramJSON){
		var models = classDiagramJSON.Project.Models[0];
		extratContainedClassEdges(models.ModelRelationshipContainer);
	}
	
	function extractClassDiagramNodes (classDiagramJSON){
		
		var models = classDiagramJSON.Project.Models[0];
		extractContainedClassElements(models.Class);
		
		
	}
	
	function extractActivityEdges (activityDiagramJSON){
		var models = activityDiagramJSON.Project.Models[0];
		var relationshipModel = models.ModelRelationshipContainer[0];
		var relationshipModelChildren = relationshipModel.ModelChildren[0];		
		var relationshipComponents = relationshipModelChildren.ModelRelationshipContainer;
		
		for (var index = 0; index < relationshipComponents.length; index++){
			var relationshipComponent = relationshipComponents[index];
			if (_.get(relationshipComponent, "$.Name",undefined) == "ControlFlow")
				extractContainedRelationships(relationshipComponent);
		}
		
		
	}
	
	function parseActivityData (data, dataCallback){
		xmlParser.parseString(data, function (err, result) {
			if (err)
				console.log ("error in parsing", err);
			
			extractActivityNodes(result);
			extractActivityEdges(result);
			if (dataCallback){
				var response = { 'activity_diagram' : graph};
				dataCallback(response);
			}
		});
	}
	
	function parseClassData (data, dataCallback){
		xmlParser.parseString(data, function (err, result){
			if (err)
				console.log ("error in parsing", err);
			extractClassDiagramNodes(result);
			extractClassDiagramEdges(result);
			
			if (dataCallback){
				var response = { 'class_diagram' : graph};
				dataCallback(graph);
			}
		});
	}
	
	function extractSequenceDiagNodes (sequenceDiagramJSON){
		
		// TODO: is an array.
		var models = sequenceDiagramJSON.Project.Models;
		console.log ("the models ", JSON.stringify(models));
		var model = models[0];
		var modelChildren = model.Frame[0].ModelChildren;
		var diagramChildren = modelChildren[0];
			
		extractInteractionActors(diagramChildren);
		
		extractInteractionLifeLine(diagramChildren);
	
	}
	
	function extractInteractionLifeLine (diagramChildren){
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
	
	function extractInteractionActors (diagramChildren){
	// extract if models are present
		
		var modelActors = _.get(diagramChildren, 'InteractionActor', []);
		
		
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

	function extractSequenceDiagramEdges (sequenceDiagramJSON){	
		// TODO: is an array.
		var models = sequenceDiagramJSON.Project.Models;
		
		var model = models[0];
		
		
		var modelChildren = model.ModelRelationshipContainer[0].ModelChildren;
		
		var modelRelationshipContainers = modelChildren[0].ModelRelationshipContainer;
		
		// there can be many relationship container based on different diagrams
		// extract the one that contains the Message.
		for (var relationship = 0; relationship < modelRelationshipContainers.length; relationship++){
			var relationshipModel = modelRelationshipContainers[relationship];
			
			if (_.get(relationshipModel,"$.Name",undefined) == "Message")
			{	
				
				var messageChildren = relationshipModel.ModelChildren;
				
				var relationshipMessages = messageChildren[0].Message;
				
				for (var messageIndex = 0; messageIndex < relationshipMessages.length; messageIndex++){
					var relationshipMessage = relationshipMessages[messageIndex];
					
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
	}
	
	function parseUseCaseData(data,dataCallback){
		xmlParser.parseString(data, function (err, result) {
			if (err)
				console.log ("error in parsing", err);
			
			extractUseCaseNodes(result);
			extractUseCaseEdges(result);
			
			if (dataCallback){
				var response = {'usecase_diagram' : graph};
				dataCallback(response);
			}
		});
	}
	
	function extractUseCaseNodes(useCaseDiagramJSON){
		var models = useCaseDiagramJSON.Project.Models[0];

		console.log ("the use case ", JSON.stringify(useCaseDiagramJSON));
		var actors = _.get(models,"Actor",[]);
		
		for (var index = 0; index < actors.length; index++){
			var actor = actors[index];
			var id = actor.$.Id;
			var name = actor.$.Name;
			
			var node = new Node(id, name);
			graph.addNode(node);
		}
		
		extractUseCases(useCaseDiagramJSON);
	}
	
	function extractUseCases(useCaseDiagramJSON){
		
		var models = useCaseDiagramJSON.Project.Models[0];
		var useCases = _.get(models,"UseCase",[]);
		
		for (var index = 0; index < useCases.length; index++){
			
			var useCase = useCases[index];
			var id = useCase.$.Id;
			var Name = useCase.$.Name;
		
			var node = new Node(id, Name);
			graph.addNode(node);
		}
	}
	
	function extractUseCaseEdges(useCaseDiagramJSON){
		var models = useCaseDiagramJSON.Project.Models[0];
		
		var relationshipContainer = models.ModelRelationshipContainer[0];
		var modelChildrenRelationships = relationshipContainer.ModelChildren[0].ModelRelationshipContainer;
				
		for (var relationship = 0; relationship < modelChildrenRelationships.length; relationship++){
			var childrenRelationship = modelChildrenRelationships[relationship];
						
			if (_.get(childrenRelationship,"$.Name",undefined) == "Association"){
				var associations = childrenRelationship.ModelChildren[0].Association;
				for (var index = 0; index < associations.length; index++){
					var association = associations[index];
					
					var id = association.$.Id;
					
					var fromId = association.FromEnd[0].AssociationEnd[0].$.EndModelElement;
					var fromMultiplicity = association.FromEnd[0].AssociationEnd[0].$.Multiplicity;
					
					var endId = association.ToEnd[0].AssociationEnd[0].$.EndModelElement;
					var toMultiplicity = association.ToEnd[0].AssociationEnd[0].$.Multiplicity;
					
					if (checkNodeisPresent(fromId) && checkNodeisPresent(endId)){
						var edge = new UseCaseAssociation(fromId, endId, fromMultiplicity, toMultiplicity, id)
						graph.addEdge(edge);
					}
				}
			}
		}		
	}
	
	
	
	function checkNodeisPresent(nodeid){
		for (var index = 0; index < graph.getNodes().length; index++){
			var node = graph.getNodes()[index];
			if (nodeid == node.Id)
				return true;
		}
		return false;
	}
	
	
	function extractSequenceDiagrams (file, func) {
		readFile(file, parseSequenceDiagramData, func);
	}
	
	function extractActivityDiagram(file, func) {
		readFile(file, parseActivityData, func);
	}
	
	function extractClassDiagram(file, func) {
		readFile(file, parseClassData, func);
	}
	
	function extractUseCaseDiagram(file,func) {
		readFile(file, parseUseCaseData, func);
	}
	
	
	
	function parseModelData(data, dataCallback){
		xmlParser.parseString(data, function (err, result) {
			if (err)
				console.log ("error in parsing", err);
			
			console.log ("the result ", JSON.stringify(result));
			
			var response = {}
			
			graph = new Graph();
			extractSequenceDiagNodes(result);
			extractSequenceDiagramEdges(result);
			response['sequence_diagram'] = graph;
			
			graph = new Graph();
			extractActivityNodes(result);
			extractActivityEdges(result);
			response['activity_diagram'] = graph;
			
			graph = new Graph();
			extractClassDiagramNodes(result);
			extractClassDiagramEdges(result);
			response['class_diagram'] = graph;
			
			graph = new Graph();
			extractUseCaseNodes(result);
			extractUseCaseEdges(result);
			response['usecase_diagram'] = graph;
			
			if (dataCallback)
				dataCallback(response);
		});
	}
	
	
function extractDiagramModels(file,func){
		readFile(file,parseModelData, func);
	}

	module.exports = { extractSequenceDiagrams, extractUseCaseDiagram, extractActivityDiagram, extractDiagramModels}

}());


