(function(){
	
	var UMLDiagramTraverser = require("./DiagramProfilers/UMLDiagramTraverser.js");
	var pathPatternMatchUtil = require("../../utils/PathPatternMatchUtil.js");

	var diagramDrawer = require('./DiagramProfilers/DiagramDrawer.js');

	 var transactionalPatterns = [
		 ['actor', 'boundary', 'control[+]', 'entity', 'pattern#1', 'EI', 'transactional','Data management'],
		 ['actor', 'boundary', 'control[+]', 'entity', 'control[+]', 'boundary','pattern#2','EQ,INT', 'transactional', 'Data management with feedback or inquiry'],
		 ['actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'INT', 'transactional', 'validation or interface management'],
		 ['actor', 'boundary', 'control[+]', 'actor', 'pattern#4', 'EXTIVK', 'transactional','Invocation from external system'],
		 ['actor', 'control[+]', 'actor', 'pattern#5', 'EXTIVK', 'transactional','Invocation from external system'],
		 ['actor', 'boundary', 'control[+]', 'entity', 'control[+]', 'actor', 'pattern#6', 'EXTIVK,EQ', 'transactional','Invocation from external system'],
		 ['actor', 'control[+]', 'entity','pattern#7', 'EXTCLL,EI', 'transactional', 'Invocation of services provided by external system'],
		 ['actor', 'control[+]', 'boundary','pattern#8', 'EXTCLL,INT', 'transactional', 'Invocation of services provided by external system'],
		 ['actor', 'control[+]', 'pattern#9', 'CTRL', 'transactional','Control flow without operating on any entities or interfaces'],
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

	var transactionalPatternTreeRoot = pathPatternMatchUtil.establishPatternParseTree(transactionalPatterns);
	
	module.exports = {
			/*
			 * At the diagram level, the components need to associate with domain model.
			 */
			processDiagram: function(diagram, usecase, model, callbackfunc){
				diagram.Paths = UMLDiagramTraverser.traverseDiagram(diagram);
				diagramDrawer.drawBehavioralDiagram(diagram, callbackfunc);
			},
			processPath: function(path, diagram, usecase){
				var components = [];
				for(var i in path.Nodes)
				{	
					var node = path.Nodes[i];
					
					if(i === 0){
						if(node.source){
						components.push(node.source);
						}
					}
	
					if(node.target){
						if(node.target){
						components.push(node.target);
						}
					}
//					var node = path[i];
//					var elementID = path['Elements'][i];
//					var components = diagram.allocate(node);
//					if(!element){
//						break;
//					}
//					for(var j in components){
//						totalDegree += components[j].InboundNumber;
//						tranLength++;	
//					}
				}

				path['TransactionAnalytics'] = {};
				
				var transactionalOperations = pathPatternMatchUtil.recognizePattern(components, diagram, transactionalPatternTreeRoot);
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
						path['TransactionAnalytics'].Transactional = matchedCategories;
//						console.log(path.Operations.transactional);
					}
					else{
						path['TransactionAnalytics'].Transactional = ['TRAN_NA'];
					}
					
				if(path['TransactionAnalytics'].Transactional.length > 0){
					path['TransactionAnalytics'].TransactionalTag += ","+path['TransactionAnalytics'].Transactional.join(',');
				}
				

				var totalDegree = 0;
				var tranLength = 0;
				
				path['TransactionAnalytics'].Components = components;
				path['TransactionAnalytics'].TranLength = tranLength;
				//need to think it through
				path['TransactionAnalytics'].TotalDegree = totalDegree;
				
				return true;
			},
			processElement: function(element, diagram, usecase){
				// determine if the element is the duplicate of a existing one, if it is, keep the one that is more complex: OutboundNumber+InboundNumber
				// some of the element may not have type. just filter out the element.
				return true;
			},
			processLink: function(link){
				return true;
			}
	}
})();
