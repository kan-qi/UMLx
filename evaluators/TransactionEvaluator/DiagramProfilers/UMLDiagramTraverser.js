(function(){/* 
* expand on a use case node of the model.
* the element refers to a use case within the model.
* this method will be used in two different places among the scripts, whare are profiler and estimator, with different path professor
* The model of robustness diagram fers to what provided by EA.
* To explore what is provided within the diagrams and find the second order informaton: paths and removing duplicates
* 
* 
*/
	
var diagramDrawer = require('./DiagramDrawer.js');
var exec = require('child_process').exec;


function traverseBehavioralDiagram(diagram){
	
	var entries=diagram.Entries;// tag: elements
	
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
//		var toExpandID = toExpand.id;
//		var expanded = false;
		// test completeness of the expanded path first to decide if continue to expand
		var childNodes = diagram.expand(node);
		// if null is returned, then node is an end node.
		
		if(!childNodes){
			Paths.push(pathToNode);
		}
		else{

			for(var i in childNodes){
				var childNode = childNodes[i];
				var toExpandNode = {
						Node: childNode,
						PathToNode: pathToNode.concat(childNode)
					}
				toExpandCollection.push(toExpandNode);
			}		
		}
		
		
	}
	
	return Paths;
}	

/*
* change of strategy. To traverse all the paths first and then match the pattern space.
*
*/

function isCycled(path){
	var lastNode = path[path.length-1];
		for(var i=0; i < path.length-1; i++){
			if(path[i] == lastNode){
				return true;
			}
		}
	return false;
}

/*
*
* when encounter a boundary, start expansion. Or the other strategy is to eliminate the at the pattern matching stage
* currently boundary is defined as:
* Actor
* Boundary
*
*/

function isBoundary(){
	
}

module.exports = {
	traverseDiagram: function(diagram, callbackfunc){
		if(diagram.Type === 'Sequence' || diagram.Type === "Analysis" || diagram.Type === "Activity"){
			var paths = traverseBehavioralDiagram(diagram);
			diagram.Paths = paths;
			diagramDrawer.drawBehavioralDiagram(diagram, callbackfunc);
		} 
		return diagram;
	}
};


}());