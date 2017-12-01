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
			} else if (component.StereoType = "uml:Activity"){
				
				var connectors = new Array();
				if (element['links'] && element['links'][0] && element['links'][0]['ControlFlow']) {
					for (var j = 0; j < element['links'][0]['ControlFlow'].length; j++) {
						var controlFlow = element['links'][0]['ControlFlow'][j];
						connectors.push({
							ClientID : controlFlow['$']['start'],
							SupplierID : controlFlow['$']['end']
						});
					}
				}
				component.Connectors = connectors;
				component.Type = element['properties'][0]['$']['stereotype'];
				
			}
			else if (component.Stereotype === 'uml:Requirement') {
				console.log('requirement element: ' + component.Name);
			}

			components[element['$']['xmi:idref']] = component;

		}

		//initiate connectors as components.
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
		
		//initiate diagrams as components.
		var diagrams = parsedResult['xmi:XMI']['xmi:Extension'][0]['diagrams'][0]['diagram'];
		for ( var i in diagrams) {
			var diagram = diagrams[i];
			// elements from diagram doesn't have sufficient information.
			var componentIDs = [];
			if (diagram['elements']) {
				for ( var j in diagram['elements'][0]['element']) {
					componentIDs.push(diagram['elements'][0]['element'][j]['$']['subject']);
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
	
	
	function Model(){
		this.Diagrams  = [];
	}

	/*
	 * filter can be assigned with values: "sequence", "logic", "analysis", to extract specific types of diagrams.
	 * May need to adjust this structure to better structure the diagrams.
	 */
	function extractModel(parsedResult, filter) {
		var modelComponents = extractModelComponents(parsedResult);
		var xmiExtension = parsedResult['xmi:XMI']['xmi:Extension'][0];
		
		/*
		 * model include a set of diagrams as well as a set of methods to search specific diagrams.
		 */
		var model = new Model();
		
		for ( var i in xmiExtension['diagrams'][0]['diagram']) {
			var xmiDiagram = xmiExtension['diagrams'][0]['diagram'][i];
			var diagram = {
					_id: xmiDiagram['$']['xmi:id'],
					Package : xmiDiagram['model'][0]['$']['owner'],
					Type : xmiDiagram['properties'][0]['$']['type'],
			};

			if(!filter || diagramType == filter){
//				console.log("populate model");
//				model['Diagrams'][diagram['$']['xmi:id']] = modelComponents[diagram['$']['xmi:id']];
				populateDiagram(diagram, xmiDiagram, modelComponents);
				model.Diagrams.push(diagram);
			}
		}
		
		model.getUseCases = function(){
			var UseCases = {};
			for(var i in this.Diagrams){
				var diagram = this.Diagrams[i];
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
			return UseCases;
		}
		
		model.findUseCaseByID = function(useCaseID){
			var useCases = this.getUseCases();
			var useCase = useCases[useCaseID];
			return useCase;
		}
		
		model.getDomainModel = function(){
			function DomainModel(){
				this.Diagrams = [];	
			} 
			
			var domainModel = new DomainModel();
			
			for(var i in this.Diagrams){
				var diagram = this.Diagrams[i];
				if(diagram.Type === "Logical"){
					domainModel.Diagrams.push(diagram);
				}
			}
			
			// make extra processing for the domain model diagrams. To reference their elements 
			domainModel.findElement = function(elementName){
				for(var i in this.Diagrams){
					var diagram = this.Diagrams[i];
					for(var j in diagram.Elements){
						var element = diagram.Elements[j];
						if(elementName === element.Name){
							return element;
						}
					}
				}
			}
			
			return DomainModel;
		}
		
		return model;
	}
	
	/*
	 * Diagrams are abstracted into nodes. Each node is an activity, action, or operation.
	 * Each node should have a tag about the which component the action is implemented upon, if the action is detailed.
	 */

	function populateDiagram(diagram, xmiDiagram, modelComponents) {
		
		if (diagram.Type === 'Sequence') {
			/*
			 * For sequence diagrams. Nodes are the messages.
			 * The message that is implemented by components.
			 */
			

			diagram.UseCase = {
				_id: xmiDiagram['model'][0]['$']['parent'],
				Name: modelComponents[xmiDiagram['model'][0]['$']['parent']].Name
			}
		
//			var Elements = {};
			var Messages = [];
			// here some logic needs to be applied to extract the structure for sequence diagrams
			// console.log(modelComponents);
			for ( var i in diagram['ComponentIDs']) {
				var component = modelComponents[diagram['ComponentIDs'][i]];
				if(!component){
					continue;
				}
				var category = component.Category;
//				var type = component.Type;
//				if (category === 'Element') { // more conditions to filter the
//					// element
//					if (type === 'actor' || type === 'boundary'
//							|| type === 'control' || type === 'entity') {
//						Elements[diagram['ComponentIDs'][i]] = component;
//					}
//				} else 
//					
				if (category === 'Connector') {
					if (type === 'Sequence') {
						Messages.push(component);
					}
				}
			}
			console.log(diagram);
//			diagram.Elements = Elements;
			diagram.Nodes = Messages;
			for(var j in diagram.Nodes){
				var node = diagram.Nodes[j];
				node.no = j;
				node.tag = "message";
				node.inboundNum = 0;
				node.outboundNum = 0;
				console.log(node.Name);
			}
			
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
				
				//search the incoming edges for a node.
				var incomingMessages = [];
				for(var k in diagram.Nodes){
					var messageIt = diagram.Nodes[k];
						if(messageIt.ClientID === message.SupplierID){
							incomingMessages.push(messageIt);
						}
						
				}
				
				console.log("incoming messages");
				console.log(incomingMessages);
				
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
			// to generate an entry node set of start the search.
			for(var i in diagram.Nodes){
				var node = diagram.Nodes[i];
				//console.log(node);
				//console.log(node.SupplierID);
				//console.log(modelComponents[node.SupplierID]);
//				if(modelComponents[node.SupplierID] && modelComponents[node.SupplierID].Type === "boundary"){
				if(node.inboundNum == 0){
					entries.push(node);
				}
			}
			
			diagram.Entries = entries;
			
			// the rules to expand on a node. if the node is an end node, then the expansion rule will return null.
			
			diagram.expand = function(node){
				// add condition on actor to prevent stop searching for message [actor, view].
//				if(modelComponents[node.ClientID] && modelComponents[node.ClientID].Type === "boundary"){
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
			
			// the function to search for the component that realize the message, can also the properties of the component.
			diagram.allocate = function(node){
				// the function call to call the method of an object.
				var component = modelComponents[node.ClientID];
				component.inboundNumber = 0;
				component.outboundNumber = 0;
				for(var i in diagram.Nodes){
					var otherNode = diagram.Nodes[i];
					if(otherNode.ClientID === node.ClientID){
						component.inboundNumber ++; 
					}
					else if(otherNode.SupplierID == node.ClientID){
						component.outboundNumber ++;
					}
				}
				// return an array, to add more flexibility, if a message is realized by more than one system components.
				return [component];
			}
			
			
		} else if (diagram.Type === 'Analysis') {
			diagram.UseCase = {
					_id: xmiDiagram['model'][0]['$']['parent'],
					Name: modelComponents[xmiDiagram['model'][0]['$']['parent']].Name
				}
			var Interactions = [];
//			var Elements = {};
			
			for ( var i in diagram['ComponentIDs']) {
				var component = modelComponents[diagram['ComponentIDs'][i]];
				if(!component){
					continue;
				}
				var category = component.Category;
//				var type = component.Type;
//				if (category === 'Element') { // more conditions to filter the
//					// element
//					if (type === 'actor' || type === 'boundary'
//							|| type === 'control' || type === 'entity') {
//						Elements[diagram['ComponentIDs'][i]] = component;
//					}
//				}
				
				if(category === "Connector") {
					var tag = modelComponents[component.SupplierID].Name+"I"+modelComponents[component.ClientID].Name;
					component.Name = tag;

					component.inboundNum = 0;
					component.outboundNum = 0;
				
					Interactions.push(component);
				}
			}
//			diagram.Elements = Elements;
			
			diagram.Nodes = Interactions;
			diagram.Edges = [];
			
			for(var j in diagram.Nodes){
				var node = diagram.Nodes[j];
//				var receiver = modelComponents[node.ClientID];
//				var connectors = receiver.Connectors;
				for(var k in diagram.Nodes){
					if(diagram.Nodes[j].SupplierID === diagram.Nodes[k].ClientID){
//						console.log(connectors[k])
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
				console.log(node);
				console.log(node.SupplierID);
				console.log(modelComponents[node.SupplierID]);
//				if(modelComponents[node.SupplierID] && modelComponents[node.SupplierID].Type === "boundary"){
				if(node.inboundNum == 0){
					entries.push(node);
				}
			}
			
			diagram.Entries = entries;
			
			// the rules to expand on a node. if the node is an end node, then the expansion rule will return null.
			
			diagram.expand = function(node){
				// add condition on actor to prevent stop searching for message [actor, view].
//				if(modelComponents[node.ClientID] && modelComponents[node.ClientID].Type === "boundary"){
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
			
			// the function to search for the component that realize the message, can also the properties of the component.
			diagram.allocate = function(node){
				// the function call to call the method of an object.
				var component = modelComponents[node.ClientID];
				if(!component){
					return [];
				}
				component.inboundNumber = 0;
				component.outboundNumber = 0;
				for(var i in diagram.Nodes){
					var otherNode = diagram.Nodes[i];
					if(otherNode.ClientID === node.ClientID){
						component.inboundNumber ++; 
					}
					else if(otherNode.SupplierID == node.ClientID){
						component.outboundNumber ++;
					}
				}
				// return an array, to add more flexibility, if a message is realized by more than one system components.
				return [component];
			}

		} else if (diagram.Type === "Activity"){
			diagram.UseCase = {
					_id: xmiDiagram['model'][0]['$']['parent'],
					Name: modelComponents[xmiDiagram['model'][0]['$']['parent']].Name
				}
			var ControlFlows = [];
			var Activities = [];
			
			for ( var i in diagram['ComponentIDs']) {
				var component = modelComponents[diagram['ComponentIDs'][i]];
				if(!component){
					continue;
				}
				var category = component.Category;
//				var type = component.Type;
				if (category === 'Element') { // more conditions to filter the
					// element
					//if (type === 'actor' || type === 'boundary' || type === 'control' || type === 'entity') {
					//	Elements[diagram['ComponentIDs'][i]] = component;
					//}
					Activities.push(component);
					component.outboundNum = 0;
					component.inboundNum = 0;
				}
				
				if(category === "Connector") {
					//var tag = modelComponents[component.SupplierID].Name+"I"+modelComponents[component.ClientID].Name;
					//component.Name = tag;
					//Interactions.push(component);
					
					ControlFlows.push(component);
					
				}
			}
//			diagram.Elements = Elements;
			
			diagram.Nodes = Activities;
			diagram.Edges = [];
			
			for(var j in ControlFlows){
				var controlFlow = ControlFlows[j];
//				var receiver = modelComponents[node.ClientID];
//				var connectors = node.Connectors;
//				for(var k in diagram.Nodes){
//					if(diagram.Nodes[j].SupplierID === diagram.Nodes[k].ClientID){
//						console.log(connectors[k])
						diagram.Edges.push({start: modelComponents[controlFlow.SupplierID], end: modelComponents[controlFlow.ClientID]})
						modelComponents[controlFlow.SupplierID].outboundNum ++;
						modelComponents[controlFlow.ClientID].inboundNum ++;
//					}
//				}
			}
			
			console.log(diagram);
			
			var entries = [];
			// to generate an entry node set of start the search.
			for(var i in diagram.Nodes){
				var node = diagram.Nodes[i];
				console.log(node);
				console.log(node.SupplierID);
				console.log(modelComponents[node.SupplierID]);
//				if(modelComponents[node.SupplierID] && modelComponents[node.SupplierID].Type === "boundary"){
				if(node.inboundNum == 0){
					entries.push(node);
				}
			}
			
			diagram.Entries = entries;
			
			// the rules to expand on a node. if the node is an end node, then the expansion rule will return null.
			
			diagram.expand = function(node){
				// add condition on actor to prevent stop searching for message [actor, view].
//				if(modelComponents[node.ClientID] && modelComponents[node.ClientID].Type === "boundary"){
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
			
			// the function to search for the component that realize the message, can also the properties of the component.
			diagram.allocate = function(node){
				// the function call to call the method of an object.
				var component = modelComponents[node.ClientID];
				if(!component){
					return [];
				}
				component.inboundNumber = 0;
				component.outboundNumber = 0;
				for(var i in diagram.Nodes){
					var otherNode = diagram.Nodes[i];
					if(otherNode.ClientID === node.ClientID){
						component.inboundNumber ++; 
					}
					else if(otherNode.SupplierID == node.ClientID){
						component.outboundNumber ++;
					}
				}
				// return an array, to add more flexibility, if a message is realized by more than one system components.
				return [component];
			}
			
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
		},
		extractDomainModel : function(file, func) {
			// Domain Models include class diagrams, information block
			// diagrams
		},
		extractModel : function(file, func) {
			// robustnessDiagram
			// contained in the
			// xmi model file
			fs.readFile(file, function(err, data) {
				parser.parseString(data, function(err, result) {
					var models = extractModel(result);

					if (func) {
						func(models);
					}
				})
			});
		},
	}
}());