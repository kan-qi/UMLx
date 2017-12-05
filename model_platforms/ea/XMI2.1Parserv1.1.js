/**
 * This module is used to parse different XMI modelf files.
 */
(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	
	function standardiseName(name){
		return name.replace(/\s/g, '').toUpperCase()
	}

	function extractModelComponents(parsedResult) {
		var xmiExtension = parsedResult['xmi:XMI']['xmi:Extension'][0];
		var components = {};
		
		var xmiElements = parsedResult['xmi:XMI']['xmi:Extension'][0]['elements'][0]['element'];
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
		var xmiConnectors = parsedResult['xmi:XMI']['xmi:Extension'][0]['connectors'][0]['connector'];
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
		var xmiDiagrams = parsedResult['xmi:XMI']['xmi:Extension'][0]['diagrams'][0]['diagram'];
		for ( var i in xmiDiagrams) {
			var xmiDiagram = xmiDiagrams[i];
			// elements from diagram doesn't have sufficient information.
			var diagram = {
					_id : xmiDiagram['$']['xmi:id'],
					Category : 'Diagram',
					Type : xmiDiagram['properties'][0]['$']['type'],
					Name : xmiDiagram['properties'][0]['$']['name'],
					Package : xmiDiagram['model'][0]['$']['owner'],
//					XMIElement: xmiDiagram,
//					ComponentIDs : componentIDs,
				};
			
			populateDiagram(diagram, xmiDiagram, components);

			components[xmiDiagram['$']['xmi:id']] = diagram; 
		}

		return components;
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
		 * Search diagrams from the existing components.
		 */
		for ( var i in modelComponents) {
			if(modelComponents[i].Category === "Diagram"){
				var diagram = modelComponents[i];

				if(!filter || diagram.Type == filter){
					/*
					 * only consider the diagrams that are not filtered out.
					 */
					model.Diagrams.push(diagram);
				}
			}
		}
		
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
		
		for(var i in model.Diagrams){
			var diagram = model.Diagrams[i];
			if(diagram.Type === "Logical"){
				domainModel.Diagrams.push(diagram);
			}
//			console.log("diagrams");
//			console.log(diagram);
		}
		
		// make extra processing for the domain model diagrams. To reference their elements 
		domainModel.findElement = function(elementName){

//			console.log("checking class elments");
//			console.log(elementName);
			for(var i in this.Diagrams){
				var diagram = this.Diagrams[i];
				for(var j in diagram.Elements){
					var element = diagram.Elements[j];
					//apply the rules to convert to standard names, and use the standard ones to compare with each other.
					if(standardiseName(elementName) === standardiseName(element.Name)){
						return element;
					}
				}
			}
		}
		
		model.DomainModel = domainModel;
		
		function UseCase(name){
			this.Name = name;
			this.Diagrams = [];
		}
		
		var UseCases = [];
		
		for(var i in model.Diagrams){
			var diagram = model.Diagrams[i];
			if(diagram.UseCase){
				if(!UseCases[diagram.UseCase._id]){
					UseCases[diagram.UseCase._id] = {
							Name: diagram.UseCase.Name,
							Diagrams: []
					};
				}

				var useCase = UseCases[diagram.UseCase._id];
				useCase.Diagrams.push(diagram);
			}
		}
		
		model.UseCases = [];
		for(var i in UseCases){

//			console.log("checking use cases");
			var useCase = UseCases[i];
			for(var j in useCase.Diagrams){
//				console.log("checking diagrams");
				var diagram = useCase.Diagrams[j];
				for(var k in diagram.Nodes){
					var node = diagram.Nodes[k];
					var source = node.source;
					var sourceComponent = model.DomainModel.findElement(source.Name);
					source.component = sourceComponent;
//					console.log("source component");
//					console.log(source);
					var target = node.target;
					var targetComponent = model.DomainModel.findElement(target.Name);
					target.component = targetComponent;
				}
			}
			model.UseCases.push(useCase);
		}
		
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
		
//		var debug = require("../../utils/DebuggerOutput.js");
//		debug.writeJson("model",model);
		
//		var modelDrawer = require("./../evaluators/TransactionEvaluator/DiagramProfilers/ModelDrawer.js");
		var modelDrawer = require("./ModelDrawer.js");
		modelDrawer.drawModel(model, "./debug/model.dotty", function(){
			console.log("model is drawn");
		});
		return model;
	}
	
	/*
	 * Diagrams are abstracted into nodes. Each node is an activity, action, or operation.
	 * Each node should have a tag about the which component the action is implemented upon, if the action is detailed.
	 */

	function populateDiagram(diagram, xmiElement, modelComponents) {
		
//		var xmiElement = modelComponents[diagram._id];
		
		var componentIDs = [];
		if (xmiElement['elements']) {
			for ( var j in xmiElement['elements'][0]['element']) {
				componentIDs.push(xmiElement['elements'][0]['element'][j]['$']['subject']);
			}
		}
		
		if (diagram.Type === 'Sequence') {
			/*
			 * For sequence diagrams. Nodes are the messages.
			 * The message that is implemented by components. The components have been identified at the 
			 */
			
			diagram.UseCase = {
				_id: xmiElement['model'][0]['$']['parent'],
				Name: modelComponents[xmiElement['model'][0]['$']['parent']].Name
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
					_id: xmiElement['model'][0]['$']['parent'],
					Name: modelComponents[xmiElement['model'][0]['$']['parent']].Name
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
					component.Supper = source;
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
					_id: xmiElement['model'][0]['$']['parent'],
					Name: modelComponents[xmiElement['model'][0]['$']['parent']].Name
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
					Activities.push(component);
					//for activity components, there is no source and target.
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
				if (category === 'Element') { // more conditions to filter the
					// element
					if (type === 'class') {
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
			}
			diagram.Elements = Elements;
			diagram.ElementNum = elementNum;
			diagram.AttributeNum = attributeNum;
			diagram.OperationNum = operationNum;
			
		}
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