(function(){/* 
* expand on a use case node of the model.
* the element refers to a use case within the model.
* this method will be used in two different places among the scripts, whare are profiler and estimator, with different path professor
* The model of robustness diagram keeps the same as what provided by EA.
* 
* to publish interfaces doing traversing, for example, when a path found. The interfaces are:
* processPath();
* processElements();
* processEdge();
* 
*/

module.exports = {
	traverseRobustnessDiagram : function(robustnessDiagram, diagramProcessor){
	
	console.log("#===================================#");
	
	console.log("Current Use Case: "+ robustnessDiagram.Name);
	
	console.log("#===================================#");
	
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
		var links = Element.Connectors; //tag: connectors
		//console.log(Element.Stereotype);
		//Change of strategy. Not only start with 'Actor', but also start with the nodes which has
		// no incoming calls
		//if(Element.Type=="Actor"){
			//startElements.push(Element);
			//ActorNum++;
		//}
		
		if(diagramProcessor !== undefined && diagramProcessor.processElement !== undefined){
			diagramProcessor.processElement(Element, i, robustnessDiagram);
		}
		
		
		for(var j in links){
			if(diagramProcessor !== undefined && diagramProcessor.processLink !== undefined){
				diagramProcessor.processLink(links[j], j, robustnessDiagram);
			}
		}
		
		
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
		
		if(isStartElement){
			startElements.push(i);
		}
		
		if(Element.Type=="Actor")ActorNum++;
		if(Element.Stereotype=="boundary")BoundaryNum++;
		if(Element.Stereotype=="control")ControlNum++;
		if(Element.Stereotype=="entity")EntityNum++;
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
	console.log("Start Elements: "+startElements.length);
	
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
		var toExpandElement = elementSet[toExpandID];
		
		if(toExpandElement === undefined){
			continue;
		}
		
		var links = toExpandElement.Connectors;
//		console.log("toExpand: "+toExpandElement.Name);
//		console.log("Connectors count: "+links.length);
		if(links === undefined){
			continue;
		}
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
			expanded = true;
			}
		}
		else{
			console.log("Found Path!");
//			console.log(toPathString(pathToElement));
			
		}
		
		if(!expanded){
			var path = {Elements: pathToElement};
			Paths.push(path);
			if(diagramProcessor !== undefined && diagramProcessor.processPath !== undefined){
				diagramProcessor.processPath(path, robustnessDiagram);
			}
		}
	}
	
	
	
	console.log("#===================================#");
	
	console.log("End Current Use Case:"+ robustnessDiagram.Name + " Path Number: "+Paths.length);
	
	console.log("#===================================#");
	
	robustnessDiagram.Paths = Paths;
//	console.log(Paths);
//	return {
//		Name: robustnessDiagram.Name,
//		TotalLinks: TotalLinks,
//		ActorNum: ActorNum,
//		BoundaryNum: BoundaryNum,
//		EntityNum: EntityNum,
//		ControlNum: ControlNum,
//		Paths: Paths
//	}
	
	return robustnessDiagram;
}
};

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

/*
* Lib method:
* translate path in array of GUID to string
*/

//function toPathString(path){
//		var pathString = "";
//		for(var j=0; j<path.length; j++){
//			pathString += Repository.GetElementByGuid(path[j]).Name;
//			if(j != path.length -1){
//				pathString += "->"
//			}
//		}
//	return pathString;
//}


//function main()
//{
//	Repository.EnsureOutputVisible("Script");
//	//var selectedPackage as EA.Package;
//	
//	var robustnessDiagram = Repository.GetTreeSelectedObject();
//   
//	var useCaseProfile = traverseUseCase(robustnessDiagram);
//	
//	console.log("Use case: "+ useCaseProfile.Name);
//	console.log("Total # Links= "+ useCaseProfile.TotalLinks);
//	console.log("Total # Actors= "+ useCaseProfile.ActorNum );
//	console.log("Total # Boundaries= "+ useCaseProfile.BoundaryNum );
//	console.log("Total # Controls= "+ useCaseProfile.ControlNum);
//	console.log("Total # Entities= "+ useCaseProfile.EntityNum );
//	console.log("Total # Paths= "+ useCaseProfile.Paths.length );
//	
//	var fso = new ActiveXObject("Scripting.FileSystemObject");
//	
//	try{
//		var path = workingDir + "RobustnessDiagram_"+robustnessDiagram.Name.replace(' ', '_')+"paths_profile.txt";
//		console.log("writing to current location: "+path);
//		var f1 = fso.OpenTextFile(path, 2, true);
//		var Paths = useCaseProfile.Paths;
//		for (var i=0; i<Paths.length; i++){
//			var Path = Paths[i];
//			var pathString = toPathString(Path);
//			f1.WriteLine(pathString);
//			f1.WriteLine();
//		}
//		
//		f1.WriteLine("number of paths: "+ Paths.length);
//		f1.Close();
//	}
//	catch(err){
//		console.log(err.message);
//	}
//}

}());

//main();