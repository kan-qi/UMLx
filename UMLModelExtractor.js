/**
 * This module is responsible for extra
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	
	function standardiseName(name){
		return name.replace(/\s/g, '').toUpperCase();
	}

	/*
	 * Diagrams are abstracted into nodes. Each node is an activity, action, or operation.
	 * Each node should have a tag about the which component the action is implemented upon, if the action is detailed.
	 */

	function populateDiagram(diagram, modelComponents) {
		
//		var xmiElement = modelComponents[diagram._id];
		
		
		
		if (diagram.Type === 'Sequence') {
			/*
			 * For sequence diagrams. Nodes are the messages.
			 * The message that is implemented by components. The components have been identified at the 
			 */
			
			diagram.UseCase = {
				_id: diagram.Parent,
				Name: modelComponents[diagram.Parent].Name
			}
		
			var Messages = [];
			var seqNo = 0;
			// here some logic needs to be applied to extract the structure for sequence diagrams
			// console.log(modelComponents);
			for ( var i in componentIDs) {
				var component = modelComponents[componentIDs[i]];
				if(!component){
					continue;
				}
				
				if (component.Category === 'Connector' && component.Type === 'Sequence') {
						component.seqNo = seqNo;
						component.Name = component.seqNo+". "+ component.Name;
						component.tag = "message";
						component.inboundNum = 0;
						component.outboundNum = 0;
						component.source = modelComponents[component.SourceID];
						component.target = modelComponents[component.TargetID];
						Messages.push(component);
						seqNo++;
						console.log(component.Name);
				}
			}
			
			diagram.Nodes = Messages;
			diagram.Edges = [];
			
			for(var j in diagram.Nodes){
				/*
				 * The rule of identifying the adjacency of the edges.
				 * 
				 * Find the last message that has been delivered to the object that initiate the current message, and create a edge between the two messages.
				 * "last" means the largest number of the order for the messages that have been created.
				 * 
				 */
				
				var message = diagram.Nodes[j];
				var seqNo = message.seqNo;
				var preMessage = null;
				
				//search the incoming edges for a message.
				var incomingMessages = [];
				for(var k in diagram.Nodes){
					var otherMessage = diagram.Nodes[k];
						if(otherMessage.target == message.source){
							incomingMessages.push(otherMessage);
						}
						
				}
				
				for(var k in incomingMessages){
					var incomingMessage = incomingMessages[k];
					var incomingNo = incomingMessage.seqNo;
					if(incomingNo < seqNo){
						preMessage = incomingMessage;
					}
					else{
						break;
					}
				}
				if(preMessage){
					diagram.Edges.push({start:preMessage, end:message})
					preMessage.outboundNum ++;
					message.inboundNum ++;
				}
			}
			
			var entries = [];
			// to generate an entry message set of start the search.
			for(var i in diagram.Nodes){
				var message = diagram.Nodes[i];
				//console.log(message);
				//console.log(message.SourceID);
				//console.log(modelComponents[message.SourceID]);
//				if(modelComponents[message.SourceID] && modelComponents[message.SourceID].Type === "boundary"){
				if(message.inboundNum == 0){
					entries.push(message);
				}
			}
			
			diagram.Entries = entries;
			
			// the rules to expand on a node. if the node is an end node, then the expansion rule will return null.
			
			diagram.expand = function(message){
				// add condition on actor to prevent stop searching for message [actor, view].
//				if(modelComponents[message.TargetID] && modelComponents[message.TargetID].Type === "boundary"){
//					return;
//				}
				if(message.outboundNum == 0){
					return;
				}
				else {

					var  children = [];
					for(var i in diagram.Edges){
						var edge = diagram.Edges[i];
						if(edge.start == message){
							children.push(edge.end);
						}
					}

					return children;
				}
				
			}
		} else if (diagram.Type === 'Analysis') {
			diagram.UseCase = {
					_id: diagram.Parent,
					Name: modelComponents[diagram.Parent].Name
				}
			var Interactions = [];
			
			for ( var i in componentIDs) {
				var component = modelComponents[componentIDs[i]];
				if(!component){
					continue;
				}
				if(component.Category === "Connector") {
					var source = modelComponents[component.SourceID];
					var target = modelComponents[component.TargetID];
					
					var tag = source.Name+">"+target.Name;
					component.Name = tag;
					component.source = source;
					component.target = target;
					component.inboundNum = 0;
					component.outboundNum = 0;
				
					Interactions.push(component);
				}
			}
			
			diagram.Nodes = Interactions;
			diagram.Edges = [];
			
			for(var j in diagram.Nodes){
				var node = diagram.Nodes[j];
				for(var k in diagram.Nodes){
					if(diagram.Nodes[j].SourceID === diagram.Nodes[k].TargetID){
						diagram.Edges.push({start: diagram.Nodes[k], end: diagram.Nodes[j]})
						diagram.Nodes[j].inboundNum ++;
						diagram.Nodes[k].outboundNum ++;
					
					}
				}
				

			}
			
//			console.log(diagram);
			
			var entries = [];
			// to generate an entry node set of start the search.
			for(var i in diagram.Nodes){
				var node = diagram.Nodes[i];
//				console.log(node);
//				console.log(node.SourceID);
//				console.log(modelComponents[node.SourceID]);
//				if(modelComponents[node.SourceID] && modelComponents[node.SourceID].Type === "boundary"){
				if(node.inboundNum == 0){
					entries.push(node);
				}
			}
			
			diagram.Entries = entries;
			
			// the rules to expand on a node. if the node is an end node, then the expansion rule will return null.
			
			diagram.expand = function(node){
				// add condition on actor to prevent stop searching for message [actor, view].
//				if(modelComponents[node.TargetID] && modelComponents[node.TargetID].Type === "boundary"){
//					return;
//				}
				if(node.outboundNum == 0){
					return;
				}
				else {

					var  children = [];
					for(var i in diagram.Edges){
						var edge = diagram.Edges[i];
						if(edge.start == node){
							children.push(edge.end);
						}
					}

					return children;
				}
				
			}

		} else if (diagram.Type === "Activity"){
			diagram.UseCase = {
					_id: diagram.Parent,
					Name: modelComponents[diagram.Parent].Name
				}
			var ControlFlows = [];
			var Activities = [];
			
			for ( var i in componentIDs) {
				var component = modelComponents[componentIDs[i]];
				if(!component){
					continue;
				}
				var category = component.Category;
//				var type = component.Type;
				if (category === 'Element') { // more conditions to filter the
					var source = modelComponents[component.SourceID];
					var target = modelComponents[component.TargetID];
					Activities.push(component);
					//for activity components, there is no source and target.
					component.source = source;
					component.target = target;
					component.outboundNum = 0;
					component.inboundNum = 0;
				}
				
				if(category === "Connector") {
					ControlFlows.push(component);
					
				}
			}
			
			diagram.Nodes = Activities;
			diagram.Edges = [];
			
			for(var j in ControlFlows){
				var controlFlow = ControlFlows[j];
						diagram.Edges.push({start: modelComponents[controlFlow.SourceID], end: modelComponents[controlFlow.TargetID]})
						modelComponents[controlFlow.SourceID].outboundNum ++;
						modelComponents[controlFlow.TargetID].inboundNum ++;
			}
			
			console.log(diagram);
			
			var entries = [];
			// to generate an entry node set of start the search.
			for(var i in diagram.Nodes){
				var node = diagram.Nodes[i];
				if(node.inboundNum == 0){
					entries.push(node);
				}
			}
			
			diagram.Entries = entries;
			
			// the rules to expand on a node. if the node is an end node, then the expansion rule will return null.
			
			diagram.expand = function(node){
				// add condition on actor to prevent stop searching for message [actor, view].
//				if(modelComponents[node.TargetID] && modelComponents[node.TargetID].Type === "boundary"){
//					return;
//				}
				if(node.outboundNum == 0){
					return;
				}
				else {

					var children = [];
					for(var i in diagram.Edges){
						var edge = diagram.Edges[i];
						if(edge.start == node){
							children.push(edge.end);
						}
					}

					return children;
				}
				
			}
			
		} else if (diagram.Type === "Logical") {
			var Elements = [];
			var elementNum = 0;
			var attributeNum = 0;
			var operationNum = 0;
			for ( var i in componentIDs) {
				var component = modelComponents[componentIDs[i]];
				if (!component) {
					continue;
				}
				var category = component.Category;
				var type = component.Type;
				if (category === 'Element' && type === 'class') { // more conditions to filter the
					// element
						Elements.push(component);
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
			diagram.Elements = Elements;
			diagram.ElementNum = elementNum;
			diagram.AttributeNum = attributeNum;
			diagram.OperationNum = operationNum;
		}
	}
	

	function traverseBehavioralDiagram(diagram){
		console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
		var entries=diagram.Entries;// tag: elements
		
		function isCycled(path){
			var lastNode = path[path.length-1];
				for(var i=0; i < path.length-1; i++){
					if(path[i] == lastNode){
						return true;
					}
				}
			return false;
		}
		
		var toExpandCollection = new Array();
		
		for (var i=0; i < entries.length; i++){
			var entry = entries[i];
			//define the node structure to keep the infor while traversing the graph
			var node = {
				//id: startElement, //ElementGUID
				Node: entry,
				PathToNode: [entry]
			};
			toExpandCollection.push(node);
		}
		
		var Paths = new Array();
		var toExpand;
		while((toExpand = toExpandCollection.pop()) != null){
			var node = toExpand.Node;
			var pathToNode = toExpand.PathToNode;
//			var toExpandID = toExpand.id;
//			var expanded = false;
			// test completeness of the expanded path first to decide if continue to expand
			var childNodes = diagram.expand(node);
			// if null is returned, then node is an end node.
			
			if(!childNodes){
				Paths.push({Nodes: pathToNode});
			}
			else{

				for(var i in childNodes){
					var childNode = childNodes[i];
					var toExpandNode = {
							Node: childNode,
							PathToNode: pathToNode.concat(childNode)
						}

					if(!isCycled(toExpandNode.PathToNode)){
					toExpandCollection.push(toExpandNode);
					}
					else{
					 Paths.push({Nodes: toExpandNode.PathToNode});
					}
				}		
			}
			
			
		}
		
		return Paths;
	}	
	
	
	/*
	 * filter can be assigned with values: "sequence", "logic", "analysis", to extract specific types of diagrams.
	 * May need to adjust this structure to better structure the diagrams.
	 */
	function extractModel(parsedResult, filter) {
		var modelComponents = extractModelComponents(parsedResult);
		
		function Model(){
			this.Diagrams  = [];
		}
		
		/*
		 * model include a set of diagrams as well as a set of methods to search specific diagrams.
		 */
		var model = new Model();
		
		/*
		 * After we identify the diagrams of the model, we classify the diagrams into domain model, and build up different use cases based on the diagrams and use cases.
		 * 
		 * The information at this stage, we should remove all the ids as references.
		 * 
		 */
		
		/*
		 * 1. first build up the domain model.
		 * 2. the class of domain model is used to represent a whole level of abstraction.
		 */
		
		function DomainModel(){
			this.Diagrams = [];	
		}

		var domainModel = new DomainModel();
		
		model.DomainModel = domainModel;
		
		
		function UseCase(id, name){
			this._id = id;
			this.Name = name;
			this.Diagrams = [];
		}
		
		model.UseCases = [];
		/*
		 * Search diagrams from the existing components, and add them into the model's reference. Also classify the diagrams into domain model and use cases.
		 */

		var UseCases = [];

		for ( var i in modelComponents) {
			if(modelComponents[i].Category === "Diagram"){
				var diagram = modelComponents[i];

				if(!filter || diagram.Type == filter){
					/*
					 * only consider the diagrams that are not filtered out.
					 */
//					var diagram = model.Diagrams[i];
					// populate the diagram with the elements by replacing the ids.
					populateDiagram(diagram, modelComponent);
					
					if(diagram.Type === "Logical"){
						domainModel.Diagrams.push(diagram);
					}
					else if(diagram.UseCase){
						if(!UseCases[diagram.UseCase._id]){
							UseCases[diagram.UseCase._id] = new UseCase(
									diagram.UseCase._id,
									diagram.UseCase.Name
									);
						}
						var useCase = UseCases[diagram.UseCase._id];
						useCase.Diagrams.push(diagram);
						
						for(var j in diagram.Nodes){
							var node = diagram.Nodes[j];
							var source = node.source;
							if(source){
							var sourceComponent = model.DomainModel.findElement(source.Name);
							source.component = sourceComponent;
							}
//							console.log("source component");
//							console.log(source);
							var target = node.target;
							if(target){
							var targetComponent = model.DomainModel.findElement(target.Name);
							target.component = targetComponent;
							}
						}
					}
					

					model.Diagrams.push(diagram);
				}
			}
		}
		
	
		// get push the use cases into model.
		for(var i in UseCases){
//			console.log("checking use cases");
			var useCase = UseCases[i];
			model.UseCases.push(useCase);
		}
		
		// make extra processing for the domain model diagrams. To reference their elements 
		domainModel.findElement = function(elementName){
			if(!elementName){
				return null;
			}
			console.log("checking class elments");
			console.log(elementName);
			for(var i in this.Diagrams){
				var diagram = this.Diagrams[i];
				for(var j in diagram.Elements){
					var element = diagram.Elements[j];
					console.log("iterating class element");
					console.log(element.Name);
					//apply the rules to convert to standard names, and use the standard ones to compare with each other.
					if(standardiseName(elementName) === standardiseName(element.Name)){
						return element;
					}
				}
			}
		}
		

		// the function are just temporary for deriving information. will be erased after stored into database.
		model.findDegree = function(component){
			// this method to find out the degree of a component, which is the total number of outbound edges.
			var degree = 0;
			for(var i in this.Diagrams){
				var diagram = this.Diagrams[i];
				for(var j in diagram.Edges){
					var edge = diagram.Edges[j];
					if(edge.source){
						if(standardiseName(edge.source.Name) === standardiseName(component.Name)){
							degree++;
						}
					}
				}
			}
			return degree;
		}
		
		//crate a few high level functions for further analysis
		model.findAssociatedComponents = function(node){
			var components = new Set();
			if(node.target){
				var outgoingEdges = [];
				for(var i in this.Diagrams){
					var edges = this.Diagrams[i].edges;
					for(var j in edges){
						var edge = edges[j];
						if(edge.source == node.target){
							outgoingEdges.push(edge);
						}
					}
				}
				
				for(var edge in outgoingEdges){
					components.add(edge.target);
				}		
			}
			
			return Array.from(components);
		}
		

//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("model",model);
		
//		var modelDrawer = require("./../evaluators/TransactionEvaluator/DiagramProfilers/ModelDrawer.js");
		var modelDrawer = require("./ModelDrawer.js");
		modelDrawer.drawModel(model, "./debug/model.dotty", function(){
			console.log("model is drawn");
		});
		
		console.log("domain model");
		console.log(model.DomainModel);
		var domainModelDrawer = require("./DomainModelDrawer.js");
		domainModelDrawer.drawDomainModel(model.DomainModel, "./debug/domainModel.dotty", function(){
			console.log("domainModel is drawn");
		});
		
		
		return model;
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
													var classDiagrams =  extractModel(result, "Logical");
													if (func) {
														func(classDiagrams);
													}
												});
							});
		},
		extractSequenceDiagrams : function(file, func) {
			fs.readFile(file,function(err, data) {parser.parseString(data, function(err, result) {
											var sequenceDiagrams = extractModel(result, "Sequence");
											if (func) {
												func(sequenceDiagrams);
											}
										});
					});
			
		},
		extractRobustnessDiagrams : function(file, func) {
			fs.readFile(file,
							function(err, data) {
								parser
										.parseString(
												data,
												function(err, result) {
													var robustnessDiagrams = extractModel(result, "Analysis");
													if (func) {
														func(robustnessDiagrams);
													}
												});
							});
		},
		extractActivityDiagrams: function(file, func){
			fs.readFile(file,
					function(err, data) {
						parser
								.parseString(
										data,
										function(err, result) {
											var activityDiagrams = extractModel(result, "Activity");
											if (func) {
												func(activityDiagrams);
											}
										});
					});
		},
		extractUseCases : function(file, func) {
			// Use Cases include sequence diagrams, robustness diagram, and
			// activity diagrams.
			fs.readFile(file, function(err, data) {
				parser.parseString(data, function(err, result) {
					var model = extractModel(result);

					if (func) {
						func(model.UseCases);
					}
				})
			});
		},
		extractDomainModel : function(file, func) {
			// Domain Models include class diagrams, information block
			// diagrams
			fs.readFile(file, function(err, data) {
				parser.parseString(data, function(err, result) {
					var model = extractModel(result);

					if (func) {
						func(model.DomainModel);
					}
				})
			});
		},
		extractModel : function(file, func) {
			// robustnessDiagram
			// contained in the
			// xmi model file
			fs.readFile(file, function(err, data) {
				parser.parseString(data, function(err, result) {
					var model = extractModel(result);

					if (func) {
						func(model);
					}
				})
			});
		},
	}
}());