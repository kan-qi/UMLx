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
	

function traverseRobustnessDiagram(robustnessDiagram){

	
//	console.log("#===================================#");
//	
//	console.log("Current robustness diagram: "+ robustnessDiagram.Name);
//	
//	console.log("#===================================#");
	
	var elementSet=robustnessDiagram.Elements; // tag: elements
	
	var TotalLinks=0;
	var ActorNum=0;
	var BoundaryNum=0;
	var ControlNum=0;
	var EntityNum=0;
	
	// to preserve the ElementIDs in stead of the elements.
	var startElements = new Array();
	
	// process robustness diagram at the element level for the nodes and edges.
	for(var i in elementSet){
		var Element = elementSet[i]; //tag: elements
//		console.log(Element);
		var links = Element.Connectors; //tag: connectors
		var isStartElement = true;
		var outboundNumber = 0;
		var inboundNumber = 0;
		
		for(var j=0; j<links.length;j++){
			var link=links[j];
			
			var clientID = link.ClientID; //tag: ClientID;
			var supplierID = link.SupplierID; //tag: SupplierID;
			
			if(supplierID == i){ //tag: ElementID
				isStartElement = false;
				inboundNumber++;
			}
			else{
				outboundNumber++;
			}
		}
		
		if(Element.Type == "actor"){
			isStartElement = true;
		}
		
		if(isStartElement){
			startElements.push(i);
		}
		
//		console.log(Element);
		
		if(Element.Type=="actor")ActorNum++;
		if(Element.Type=="boundary")BoundaryNum++;
		if(Element.Type=="control")ControlNum++;
		if(Element.Type=="entity")EntityNum++;
		TotalLinks+=links.length/2;
		
		Element.IsStartElement = isStartElement;
		Element.OutboundNumber = outboundNumber;
		Element.InboundNumber = inboundNumber;
	}
	
	robustnessDiagram.TotalLinks=TotalLinks;
	robustnessDiagram.ActorNum=ActorNum;
	robustnessDiagram.BoundaryNum=BoundaryNum;
	robustnessDiagram.ControlNum=ControlNum;
	robustnessDiagram.EntityNum=EntityNum;
	
	
	// traverse robustness diagram for the paths 
//	console.log("Start Elements: "+startElements.length);
	
	var toExpandCollection = new Array();
	for (var i=0; i < startElements.length; i++){
		var startElement = startElements[i];
		//define the node structure to keep the infor while traversing the graph
		var node = {
			id: startElement, //ElementGUID
			pathToNode: [startElement]
		};
		toExpandCollection.push(node);
	}
	
	var Paths = new Array();
	var toExpand;
	while((toExpand = toExpandCollection.pop()) != null){
		var pathToElement = toExpand.pathToNode;
		var toExpandID = toExpand.id;
		var expanded = false;
		// test completeness of the expanded path first to decide if continue to expand
		
		if(!isCycled(pathToElement)){
		// there are two kinds of elements in to ExpandCollections: startNodes and expandedNodes.
		// for expandedNodes, the pathToNode should have length larger than 1 to be a path, when it is either a view or a actor or has no other nodes to expand.
		var toExpandElement = elementSet[toExpandID];
		
		// if there is no such toExpandID element in elementSet, then it is an illegal element.
		if(!toExpandElement){
			continue;
		}
		
		var links = toExpandElement.Connectors;
//		console.log("toExpand: "+toExpandElement.Name);
//		console.log("Connectors count: "+links.length);
		
		// if the element doesn't have any link, then it is an illegal element as well.
		if(!links){
			continue;
		}
		
		var isEndNode = false;
		if(pathToElement.length > 2){
		if(toExpandElement.Type == "boundary"){
			isEndNode = true;
		}
		else if(toExpandElement.Type == "actor"){
			isEndNode = true;
		}
		else {
			var hasOutBound = false;
			for(var i=0; i<links.length;i++){
				var link =links[i];
				var clientID = link.ClientID;
				if(clientID == toExpandID){
					hasOutBound = true;
					break;
				}
			}
			
			if(!hasOutBound){
//				console.log("is end node");
				isEndNode = true;
			}
		}
		}
		
		if(!isEndNode){
//		console.log("is not end node");
		for(var i=0; i<links.length;i++){
			var link =links[i];
			
			var clientID = link.ClientID;
			var supplierID = link.SupplierID;
			
			if(supplierID == toExpandID){
				continue;
			}
			
			var supplierEnd = elementSet[supplierID];
			//console.log("clinet: "+clientEnd.Name);
//			console.log("supplier: "+supplierEnd.Name);
			//create new Node to push into the queue for further expansion
			var expandedNode = {
				id: supplierID,
				pathToNode: pathToElement.concat([supplierID])
			}
			
			toExpandCollection.push(expandedNode);
			}
		}
		else{
			var path = {Elements: pathToElement};
		    Paths.push(path);
		}
		
		}
//		else{
			//console.log("Found Path!");
//			console.log(toPathString(pathToElement));
//		}
		
	}
	
//	console.log("#===================================#");
//	
//	console.log("End Current Use Case:"+ robustnessDiagram.Name + " Path Number: "+Paths.length);
//	
//	console.log("#===================================#");
	
//	console.log(Paths);
	
	robustnessDiagram.Paths = Paths;
	
	return robustnessDiagram;
}

function traverseSequenceDiagram(sequenceDiagram){
//	console.log("#===================================#");
//	console.log("Current Sequence Diagram: "+ sequenceDiagram.Name);
//	console.log("#===================================#");
	
	var elementSet=sequenceDiagram.Elements; // tag: elements
	
	var TotalLinks=0;
	var ActorNum=0;
	var BoundaryNum=0;
	var ControlNum=0;
	var EntityNum=0;
	
	// process robustness diagram at the element level for the nodes and edges.
	for(var i in elementSet){
		var Element = elementSet[i]; //tag: elements
		var links = Element.Connectors; //tag: connectors
		
		var outboundNumber = 0;
		var inboundNumber = 0;
		
		for(var j=0; j<links.length;j++){
			var link=links[j];
			
			var clientID = link.ClientID; //tag: ClientID;
			var supplierID = link.SupplierID; //tag: SupplierID;
			
			if(supplierID == i){ //tag: ElementID
				inboundNumber++;
			}
			else{
				outboundNumber++;
			}
		}
		
		if(Element.Type=="actor")ActorNum++;
		if(Element.Type=="boundary")BoundaryNum++;
		if(Element.Type=="control")ControlNum++;
		if(Element.Type=="entity")EntityNum++;
		TotalLinks+=links.length/2;
		
		Element.OutboundNumber = outboundNumber;
		Element.InboundNumber = inboundNumber;
	}
	
	sequenceDiagram.TotalLinks=TotalLinks;
	sequenceDiagram.ActorNum=ActorNum;
	sequenceDiagram.BoundaryNum=BoundaryNum;
	sequenceDiagram.ControlNum=ControlNum;
	sequenceDiagram.EntityNum=EntityNum;
	
	
	// traverse sequence diagram for the paths, and the method is different from robustness diagrams
	
	var Paths = new Array();
	var Messages = sequenceDiagram.Messages;
	var curPath = [];
	var message = null;
	while((message = Messages.shift())){
		if(curPath.length === 0){
			curPath.push(message.SupplierID);
			curPath.push(message.ClientID);
		}
		else{
			var lastElement = curPath[curPath.length - 1];
//			console.log('last element: '+lastElement);
//			console.log('supplier id: ' + message.SupplierID);
			if(message.SupplierID === lastElement){
				curPath.push(message.ClientID);
//				console.log('push path');
			}
			else{
				Paths.push({'Elements':curPath});
				curPath = [];
				curPath.push(message.SupplierID);
				curPath.push(message.ClientID);
			}
		}
//		console.log(curPath);
	}
	
	Paths.push({'Elements':curPath});
	

//	console.log('================path==============');
//	console.log(Paths);
//	console.log('================end path==============');
	
	for(var i in Paths){
		var path = Paths[i];
	}
	
	sequenceDiagram.Paths = Paths;
	return sequenceDiagram;
}

function traverseStructuralDiagram(diagram, diagramProcess){
//	console.log("#===================================#");
//	console.log("Current Class Diagram: "+ diagram.Name);
//	console.log("#===================================#");
	var attributeNum = 0;
	for(var i in diagram.Attributes){
		var attribute = diagram.Attributes[i];
		var isAttribute = true;
//		if(diagramProcess && diagramProcess.processAttribute){
//			isAttribute = diagramProcess.processAttribute(attribute);
//		}
		
		if(isAttribute){
			attributeNum ++;
		}
	}
	
	
	var operationNum = 0;
	for(var i in diagram.Operations){
		var operation = diagram.Operations[i];
		var isOperation = true;
		if(diagramProcess && diagramProcess.processOperation){
			isOperation = diagramProcess.processOperation(operation);
		}
		
		if(isOperation){
			operationNum ++;
		}
	}
	
	diagram.AttributeNum = attributeNum;
	diagram.OperationNum = operationNum;
	return diagram;
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
	profileRobustnessDiagram : traverseBehavioralDiagram,
	profileSequenceDiagram: traverseBehavioralDiagram,
	profileClassDiagram: traverseStructuralDiagram,
	profileDiagram: function(diagram, func){
		if(diagram.Type === 'Logical'){
			traverseStructuralDiagram(diagram);
			diagramDrawer.drawClassDiagram(diagram, func);
		} else if(diagram.Type === 'Sequence' || diagram.Type === "Analysis" || diagram.Type === "Activity"){
			traverseBehavioralDiagram(diagram);
			diagramDrawer.drawBehavioralDiagram(diagram, func);
		} 
		return diagram;
	},
	traverseBehavioralDiagram: traverseBehavioralDiagram,
	traverseStructuralDiagram: traverseStructuralDiagram
};


}());