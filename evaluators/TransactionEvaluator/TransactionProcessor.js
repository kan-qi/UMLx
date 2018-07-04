(function(){

/*
 * Adding extra processing on use cases, for example, transactions traversing, and pattern matching.
 */
	
//	var UMLDiagramTraverser = require("./UMLDiagramTraverser.js");
	var transactionPatternMatchUtil = require("../../utils/TransactionPatternMatchUtil.js");

//	var diagramDrawer = require('./DiagramProfilers/DiagramDrawer.js');

	 var transactionalPatterns = [
		 ['boundary', 'control[+]', 'entity', 'pattern#1', 'EI', 'transactional','Data management'],
		 ['boundary', 'control[+]', 'entity', 'control[+]', 'boundary','pattern#2','EQ,INT', 'transactional', 'Data management with feedback or inquiry'],
		 ['boundary', 'control[+]', 'boundary', 'pattern#3', 'INT', 'transactional', 'validation or interface management'],
		 ['boundary', 'control[+]', 'actor', 'pattern#4', 'EXTIVK', 'transactional','Invocation from external system'],
		 ['control[+]', 'actor', 'pattern#5', 'EXTIVK', 'transactional','Invocation from external system'],
		 ['boundary', 'control[+]', 'entity', 'control[+]', 'actor', 'pattern#6', 'EXTIVK,EQ', 'transactional','Invocation from external system'],
		 ['control[+]', 'entity','pattern#7', 'EXTCLL,EI', 'transactional', 'Invocation of services provided by external system'],
		 ['control[+]', 'boundary','pattern#8', 'EXTCLL,INT', 'transactional', 'Invocation of services provided by external system'],
		 ['control[+]', 'pattern#9', 'CTRL', 'transactional','Control flow without operating on any entities or interfaces'],
	];
	 
	function matchCategories(categories, characteristic){
//			console.log(categories);
//			console.log("characteristic");
//			console.log(characteristic);
			var categoriesToReturn = [];
			for(var category in categories){
				var results = ((function(category, categories){
//				console.log('categories.....');
//				console.log(category);
				if(category === characteristic){
						return [category];
				}
				else if(categories[category] === "#"){
						return [];
				}
				else {
					var matchedCategories = matchCategories(categories[category], characteristic);
					if(matchedCategories.length > 0){
						matchedCategories.unshift(category);
					}
					return matchedCategories;
				}
			})(category, categories));
			
//			console.log("result------------");
//			console.log(results);
			for(var i in results){
				if(categoriesToReturn.indexOf(results[i]) == -1){
					categoriesToReturn.push(results[i]);
				}
			}
			}
			
			return categoriesToReturn;
		}

	var transactionalPatternTreeRoot = transactionPatternMatchUtil.establishPatternParseTree(transactionalPatterns);
	
	module.exports = {
			/*
			 * At the diagram level, the components need to associate with domain model.
			 */
//			processUseCase: function(useCase, model, callbackfunc){
////				var useCase = model.UseCases[i];
//				
////				var entries=diagram.Entries;// tag: elements
//				
//				var toExpandCollection = new Array();
//				
//				for (var j in useCase.activities){
//					var activity = useCase.activities[j];
//					//define the node structure to keep the infor while traversing the graph
//					if(activity.stimulus){
//					var node = {
//						//id: startElement, //ElementGUID
//						Node: activity,
//						TransactionToNode: [activity],
//						OutScope: activity.outScope
//					};
//					toExpandCollection.push(node);
//					}
//				}
//				
//				var Transactions = new Array();
//				var toExpand;
//				while((toExpand = toExpandCollection.pop()) != null){
//					var node = toExpand.Node;
//					var transactionToNode = toExpand.TransactionToNode;
////					var toExpandID = toExpand.id;
////					var expanded = false;
//					// test completeness of the expanded transaction first to decide if continue to expand
////					var childNodes = diagram.expand(node);
//					// if null is returned, then node is an end node.
//					
////					diagram.expand = function(node){
//					// add condition on actor to prevent stop searching for message [actor, view].
////					if(modelComponents[node.TargetID] && modelComponents[node.TargetID].Type === "boundary"){
////						return;
////					}
////					if(node.outboundNum == 0){
////						return;
////					}
////					else {
//
//						var childNodes = [];
//						for(var j in useCase.precedenceRelations){
//							var edge = useCase.precedenceRelations[j];
//							if(edge.start == node){
//								childNodes.push(edge.end);
//							}
//						}
////						return children;
////					}
//					
////				}
//					
//					if(childNodes.length == 0){
//						Transactions.push({Nodes: transactionToNode, OutScope: toExpand.OutScope});
//					}
//					else{
//						for(var j in childNodes){
//							var childNode = childNodes[j];
//							if(!childNode){
//								continue;
//							}
//							
//							//if childNode is an outside activity
//							
//							var OutScope = false;
//							if(toExpand.OutScope||childNode.outScope){
//								OutScope = true;
//							}
//							
//							var toExpandNode = {
//								Node: childNode,
//								TransactionToNode: transactionToNode.concat(childNode),
//								OutScope: OutScope
//							}
//							
//							console.log("toExpandNode");
//							console.log(toExpandNode);
//							
//							console.log("child node");
//							console.log(childNodes);
//							console.log(childNode);
//							console.log(childNode.name);
//							console.log(childNode.group);
//
//							if(!isCycled(toExpandNode.TransactionToNode) && childNode.group === "System"){
//							toExpandCollection.push(toExpandNode);
//							}
//							else{
//							Transactions.push({Nodes: toExpandNode.TransactionToNode, OutScope: toExpandNode.OutScope});
//							}
//						}		
//					}
//			}
//				return Transactions;
//			},
//			processDiagram: function(diagram, usecase, model, callbackfunc){
//				console.log("transaction process: process diagram");
//				diagram.Transactions = UMLDiagramTraverser.traverseDiagram(diagram);
//				diagramDrawer.drawBehavioralDiagram(diagram, callbackfunc);
//				console.log(diagram.Transactions);
//			},
			processTransaction: function(transaction,  usecase, model){
//				var components = [];
//				var transactionStr = "";
				
				//the total degree should be determined differently. If an element has a component, then the degree is the number of components associated with the current component, and if not, it is the number of messages, associated with the current messages.
				var totalDegree = 0;
				
				for(var i in transaction.Nodes)
				{	
					var node = transaction.Nodes[i];
//					
//					if(i == 0){
//						if(node.source){
//						components.push(node.source);
//						}
//					}
//	
//					if(node.target){
//						components.push(node.target);
//					}
//					
////					var node = transaction[i];
////					var elementID = transaction['Elements'][i];
////					var components = diagram.allocate(node);
////					if(!element){
////						break;
////					}
////					for(var j in components){
////						totalDegree += components[j].InboundNumber;
////						tranLength++;	
////					}
//					
//					transactionStr += node.Name;
//					if( i != transaction.Nodes.length - 1){
//						transactionStr += "->";
//					}
					
//					var associatedComponents = model.findAssociatedComponents(node);
					
					//crate a few high level functions for further analysis
//					model.findAssociatedComponents = function(node){
//						var components = new Set();
					totalDegree += 1;
						if(node.Component){
							var outgoingEdges = [];
//							for(var i in this.Diagrams){
								var edges = usecase.precedenceRelations;
								for(var j in edges){
									var edge = edges[j];
									if(edge.end.Component == node.Component){
//										outgoingEdges.push(edge);
										totalDegree++;
									}
								}
//							}
							
//							for(var edge in outgoingEdges){
//								components.add(edge.target);
//							}		
						}
						
//						return Array.from(components);
//					}
					
//					totalDegree += associatedComponents.length + 1;
				}
				
//				console.log(transactionStr);
//				transaction.TransactionStr = transactionStr;

				transaction['TransactionAnalytics'] = {};
				
				var transactionalOperations = transactionPatternMatchUtil.recognizePattern(transaction, transactionalPatternTreeRoot);
				var transactionalOperationStr = "";
				for(var i=0; i < transactionalOperations.length; i++){
					if(i !== 0){
						transactionalOperationStr += ",";
					}
					transactionalOperationStr += transactionalOperations[i].semantics;
					}
					if(transactionalOperationStr !== ''){
						var operationalCharacteristics = transactionalOperationStr.split(/,/g);
						// search the characteristics hierarchy to identify the categories
//						console.log('operational characteristics');
//						console.log(operationalCharacteristics);
						var categories = {
								CTRL: {
									DM: {
										EI: '#',
										EQ: '#'
									},
									INT: '#',
									EXTIVK: '#',
									EXTCLL: '#'
								},
								
						}
						
						var matchedCategories = [];
						for(var j in operationalCharacteristics){
							var returnedCategories = matchCategories(categories, operationalCharacteristics[j]);
//							console.log("returned categories");
//							console.log(returnedCategories);
							for(var k in returnedCategories){
								if(matchedCategories.indexOf(returnedCategories[k]) == -1){
									matchedCategories.push(returnedCategories[k]);
								}
							}
						}
						transaction['TransactionAnalytics'].Transactional = matchedCategories;
//						console.log(transaction.Operations.transactional);
					}
					else{
						transaction['TransactionAnalytics'].Transactional = ['TRAN_NA'];
					}
					
				transaction['TransactionAnalytics'].TransactionalTag = "";
				if(transaction['TransactionAnalytics'].Transactional.length > 0){
					transaction['TransactionAnalytics'].TransactionalTag = transaction['TransactionAnalytics'].Transactional.join(',');
				}
				
				
//				transaction['TransactionAnalytics'].Components = components;
				transaction['TransactionAnalytics'].TranLength = transaction.Nodes.length;
				//The transaction length is defined as the number of operations of a transaction, which can be the number of activities, messages, interactions.
				
				
				
				transaction['TransactionAnalytics'].TotalDegree = totalDegree;
				
				console.log("transaction process: transaction process");
				console.log(transaction);
				
				
				return true;
			}
	}
})();
