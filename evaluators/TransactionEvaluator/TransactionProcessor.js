(function(){

/*
 * Adding extra processing on use cases, for example, transactions traversing, and pattern matching.
 */
	
//	var UMLDiagramTraverser = require("./UMLDiagramTraverser.js");
	var transactionPatternMatchUtil = require("../../utils/TransactionPatternMatchUtil.js");
	var domainModelSerchUtil = require("../../utils/DomainModelSearchUtil.js");

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

	var transactionalPatternTreeRoot = transactionPatternMatchUtil.establishPatternParseTree(transactionalPatterns);
	
	module.exports = {
			processTransaction: function(transaction,  usecase, model){
				
				//the total degree should be determined differently. If an element has a component, then the degree is the number of components associated with the current component, and if not, it is the number of messages, associated with the current messages.
				var totalDegree = 0;
				// var totalComponents = 0;
				var dataElementTypes = 0;

				var componentNum = 0;
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				var actorNum = 0;

				var components = {};
				
				for(var i in transaction.Nodes)
				{	
					var node = transaction.Nodes[i];

						if(node.Component){
							
//							console.log("associating component");
//							console.log(node.Component);
						
								var edges = usecase.PrecedenceRelations;
								for(var j in edges){
									var edge = edges[j];
									
									if(edge.end && edge.end.Component && edge.end.Component._id === node.Component._id){
										console.log("checking degree");
										totalDegree++;
									}
								}
								
									var matchedOperation = domainModelSerchUtil.matchOperation(node.Name, node.Component);
									
//									var matchedOperation = "";
									
//									console.log("matched oepration");
									
									if(matchedOperation){
//										var debug = require("../../utils/DebuggerOutput.js");
//										debug.appendFile("matchedOperation", matchedOperation.Name);
										for(var j in matchedOperation.Parameters){
											dataElementTypes++;
										}
									}
									else{
										dataElementTypes++;
									}
									
									components[node.Component["_id"]] = node.Component;

					    var type = node.Component.Type;
						if (type === "actor") {
							actorNum++;
						} else if (type === "boundary") {
							boundaryNum++;
						} else if (type === "control") {
							controlNum++;
						} else if (type === "entity") {
							entityNum++;
						}
						
						componentNum++;
									
						}
						
				}
				

				// totalComponents = Object.keys(components).length;
				
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
						
						function matchCategories(categories, characteristic){
							var categoriesToReturn = [];
							for(var category in categories){
								var results = ((function(category, categories){
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
							
							for(var i in results){
								if(categoriesToReturn.indexOf(results[i]) == -1){
									categoriesToReturn.push(results[i]);
								}
							}
							}
							
							return categoriesToReturn;
					}
						
						var matchedCategories = [];
						for(var j in operationalCharacteristics){
							var returnedCategories = matchCategories(categories, operationalCharacteristics[j]);
							for(var k in returnedCategories){
								if(matchedCategories.indexOf(returnedCategories[k]) == -1){
									matchedCategories.push(returnedCategories[k]);
								}
							}
						}
						transaction['TransactionAnalytics'].Transactional = matchedCategories;
					}
					else{
						transaction['TransactionAnalytics'].Transactional = ['TRAN_NA'];
					}
					
				transaction['TransactionAnalytics'].TransactionalTag = "";
				if(transaction['TransactionAnalytics'].Transactional.length > 0){
					transaction['TransactionAnalytics'].TransactionalTag = transaction['TransactionAnalytics'].Transactional.join(',');
				}
				
				transaction['TransactionAnalytics'].TL = transaction.Nodes.length;
				//The transaction length is defined as the number of operations of a transaction, which can be the number of activities, messages, interactions.
				
				transaction['TransactionAnalytics'].TC = componentNum;
				
				transaction['TransactionAnalytics'].TD = componentNum == 0? 0 : totalDegree/componentNum;
				
				transaction['TransactionAnalytics'].DETs = dataElementTypes;

				transaction['TransactionAnalytics'].ComponentNum = componentNum;
				transaction['TransactionAnalytics'].BoundaryNum = boundaryNum;
				transaction['TransactionAnalytics'].ControlNum = controlNum;
				transaction['TransactionAnalytics'].EntityNum = entityNum;
				transaction['TransactionAnalytics'].ActorNum = actorNum;
				
				transaction['TransactionAnalytics'].Arch_Diff = transaction['TransactionAnalytics'].TL*transaction['TransactionAnalytics'].TD;
				
				console.log("transaction process: transaction process");
				console.log(transaction);
				
				return true;
			}
	}
})();
