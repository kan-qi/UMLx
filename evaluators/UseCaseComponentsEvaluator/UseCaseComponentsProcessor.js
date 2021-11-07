/*
 * Script Name: UMLModelProcessor2.js
 * Author: kqi
 * Purpose:
 *  1. provide helper functions, for example, the graph traversal functions.
 *  2. provide classification rules for identifying specific entities.
 *  3. provide weights for calculating metrics.
 */

(function(){


	module.exports = {
			processTransaction: function(transaction, usecase){
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				var actorNum = 0;
				var TransactionStr = "";
				var i = 0;
				for(var j in transaction.Nodes)
				{
<<<<<<< HEAD
					var node = transaction.Nodes[i];
//					var components = diagram.allocate(node);
=======
					var node = transaction.Nodes[j];
>>>>>>> 8b08cd56893f5b7556a384bf2d315f21164c7522

					if(node.Component){
						var component = node.Component;

						if(component.Type=="actor")actorNum++;
						if(component.Type=="boundary")boundaryNum++;
						if(component.Type=="control")controlNum++;
						if(component.Type=="entity")entityNum++;
					}
<<<<<<< HEAD
					
//					transactionLength++;
					TransactionStr += node.Name;
					if(i !== transaction.Nodes.length - 1){
=======

					if(i !== 0){
>>>>>>> 8b08cd56893f5b7556a384bf2d315f21164c7522
						TransactionStr += "-->";
					}

					TransactionStr += node.Name;

					i++

				}
				transaction.TransactionStr = TransactionStr;

				if(transaction.TransactionStr.includes("undefined")){
					console.log("undefined transactions");
					return false;
				}

				transaction.boundaryNum = boundaryNum;
				transaction.controlNum = controlNum;
				transaction.entityNum = entityNum;
				transaction.actorNum = actorNum;
				transaction.length = transaction.Nodes.length;

				return true;

			},
			processElement: function(element, usecase){
				element.Name = element.Name ? element.Name.replace(/,/gi, "") : "undefined";
				if(element.Component){
					var component = element.Component;
					element.Type = component.Type;
					element.ComponentName = component.Name;
				}


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
						var searchedAncestors = searchAncestors(relation['Supplier'], relations, ++depth);
						for(var j in searchedAncestors){
							ancestors.push(searchedAncestors[j]);
						}
					}
				}
				return ancestors;
				}

				var ancestors = searchAncestors(element._id, relations, 0);

				return {
					elements: ancestors,
					depth: maxDepth
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
						var searchedOffSprings = searchOffSprings(relation['Client'], relations, ++depth);
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
