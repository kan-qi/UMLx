/**
 * This module is used to parse different elements in XMI files to construct the user-system interaction model.
 */
(function() {
	var fs = require('fs');
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	
	function traverseUseCaseForTransactions(useCase){
		
//		console.log("UMLDiagramTraverser: traverseBehaviralDiagram");
	
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
			
			for (var j in useCase.Activities){
				var activity = useCase.Activities[j];
				//define the node structure to keep the infor while traversing the graph
				if(activity.Stimulus){
				var node = {
					//id: startElement, //ElementGUID
					Node: activity,
					PathToNode: [activity],
					OutScope: activity.OutScope
				};
				toExpandCollection.push(node);
				}
			}
			
			var Paths = new Array();
			var toExpand;
			
			while((toExpand = toExpandCollection.pop()) != null){
				console.log("path searching...");
				var node = toExpand.Node;
				var pathToNode = toExpand.PathToNode;

					var childNodes = [];
					for(var j in useCase.PrecedenceRelations){
						var edge = useCase.PrecedenceRelations[j];
						if(edge.start == node){
							childNodes.push(edge.end);
						}
					}
				
				if(childNodes.length == 0){
					Paths.push({Nodes: pathToNode, OutScope: toExpand.OutScope});
				}
				else{
					for(var j in childNodes){
						var childNode = childNodes[j];
						if(!childNode){
							continue;
						}
						
						var OutScope = false;
						if(toExpand.OutScope||childNode.OutScope){
							OutScope = true;
						}
						
						var toExpandNode = {
							Node: childNode,
							PathToNode: pathToNode.concat(childNode),
							OutScope: OutScope
						}

						if(!isCycled(toExpandNode.PathToNode) && childNode.Group === "System"){
						toExpandCollection.push(toExpandNode);
						}
						else{
						Paths.push({Nodes: toExpandNode.PathToNode, OutScope: toExpandNode.OutScope});
						}
					}		
				}
				
				
			}
			
			//eliminate the duplicates
			var pathsByString = {};
			var uniquePaths = [];
			for(var i in Paths){
				path = Paths[i];
				var pathString = "";
				for(var j in path.Nodes){
					var node = path.Nodes[j];
					pathString += node._id;
				}
				if(!pathsByString[pathString]){
					pathsByString[pathString] = 1;
					uniquePaths.push(path);
				}
				else{
				console.log("duplicate");
				}
			}

			return uniquePaths;
	}



	module.exports = {
			traverseUseCaseForTransactions : traverseUseCaseForTransactions
	}
}());