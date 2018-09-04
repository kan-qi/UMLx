/*
 * Script Name: count numbers of the independent transactions for each type of operational scenarios 
 * Author: kqi
 * Purpose: to search through the diagram to find out all the independent transactions, 
 * and to find out the corresponding operational scenarios they corresponds.
 * There are five different identified basic operational scenarios:
 * 1. actor -> boundary -> control -> entity, mainly for data management
 * 2. actor -> boundary -> control -> entity -> control -> boundary, mainly for data management with feedback
 * 3. actor -> boundary -> control -> boundary, mainly for validation or interface management
 * 4. actor1 -> boundary -> control -> actor2, mainly for calling for service outside of the system
 * 5. actor2 -> control -> entity, mainly for outside system calling all services from the system
 * 
 * I'll have to rework on the pattern tree. To integrate widecard functionality.
 * 
 * summary: search for independent transactions, and recognize the patterns.
 * Date: 8/9/2017
 * 
 * There is no functional operations any more, the hierarchy of operational characteristics are listed below:
 * 
 * transaction (TN): {
 *  control (CTRL): {
 *  	data management (DM) : {
 *  		external input (EI),
 *  		external inquiry (EQ)
 *  	}
 *      interface management (INT),
 *      external invocation (EXTIVK),
 *      external call (EXTCLL)
 *  }
 * }
 */

(function(){
	//the last element is the pattern type. 0 is reserved for not matched type
	//for the partially matched elements, the value should be a distribution.
	
	//[] represents the similarity across the patterns.
	//# represents tags for the elements within the same pattern. To distinguish an element in the pattern.
	//Building patterns with exact representation, but parsing the condition when matching
	 
	
	module.exports = {
//			processDiagram: function(diagram, usecase){
//				return true;
//			},
			processTransaction: function(transaction, usecase){
//				var transactionLength = 0;
//				var avgDegree = 0;
//				var archDiff = 0;
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				var actorNum = 0;
				var TransactionStr = "";
				for(var i = 0; i < transaction.Nodes.length; i++)
				{
					var node = transaction.Nodes[i];
//					var components = diagram.allocate(node);
					
					if(node.Component){
						var component = node.Component;
//						avgDegree += component.InboundNumber;

						if(component.Type=="actor")actorNum++;
						if(component.Type=="boundary")boundaryNum++;
						if(component.Type=="control")controlNum++;
						if(component.Type=="entity")entityNum++;
					}
					
//					transactionLength++;
					TransactionStr += node.Name;
					if(i != transaction.Nodes.length - 1){
						TransactionStr += "->";
					}
					
				}
				transaction.TransactionStr = TransactionStr;
//				if(transactionLength > 0){
//					avgDegree = avgDegree / transactionLength;
//				}
//				else {
//					avgDegree = 0;
//				}
//				archDiff = avgDegree*transactionLength;
				
//				transaction.transactionLength = transactionLength;
//				transaction.avgDegree = avgDegree;
//				transaction.archDiff = archDiff;
				transaction.boundaryNum = boundaryNum;
				transaction.controlNum = controlNum;
				transaction.entityNum = entityNum;
				transaction.actorNum = actorNum;
				transaction.length = transaction.Nodes.length;
				return true;
				
			},
			processElement: function(element, usecase){
				return true;
			},
			processLink: function(link){
				return true;
			},
			identifyParents: function(element, relations){
				var parents = [];
				for(var i in relations){
					var relation = relations[i];
					if(relation['Client'] && relation['Client'] === element._id){
						parents.push(relation['Supplier']);
					}
				}
				return parents;
			},
			identifyAncestors: function(element, relations){
//				var Ancestors = [];
				var visited = {};
				var maxDepth = 0;
				var searchAncestors = function(id, relations, depth){
				if(maxDepth < depth){
					maxDepth = depth;
				}
			    var ancestors = [];
				for(var i in relations){
					var relation = relations[i];
					if(relation['Client'] && relation['Client'] === id && !visited[relation['Supplier']]){
						ancestors.push(relation['Supplier']);
						visited[relation['Supplier']] = 1;
						var searchedAncestors = searchAncestors(relation['Supplier'], relations, depth++);
						for(var i in searchedAncestors){
							ancestors.push(searchedAncestors[i]);
						}
					}
				}
				return ancestors;
				}
				
				return {
					depth: maxDepth,
					elements: searchAncestors(element._id, relations)
				}
				
			},
			identifyChildren: function(element, relations){
				var children = [];
				for(var i in relations){
					var relation = relations[i];
					if(relation['Supplier'] && relation['Supplier'] === element._id){
						children.push(relation['Client']);
					}
				}
				return children;
			},
			identifyOffSprings: function(element, relations){
				var visited = {};
				var maxDepth = 0;
				
				var searchOffSprings = function(id, relations, depth){
			    if(maxDepth < depth){
			    	maxDepth = depth;
			    }
			    var offSprings = [];
			    
				for(var i in relations){
					var relation = relations[i];
					if(relation['Supplier'] && relation['Supplier'] === id && !visited[relation['Client']]){
						offSprings.push(relation['Client']);
						visited[relation['Client']] = 1;
						var searchedOffSprings = searchOffSprings(relation['Client'], relations, depth++);
						for(var i in searchedOffSprings){
							offSprings.push(searchedOffSprings[i]);
						}
					}
				}
				return offSprings;
				}
				
				
				var offSprings = searchOffSprings(element._id, relations, 0);
				
				return {
					depth: maxDepth,
					elements: offSprings
				}
			}
	}
})();
