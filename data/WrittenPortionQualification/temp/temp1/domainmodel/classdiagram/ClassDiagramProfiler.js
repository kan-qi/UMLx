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
	traverseClassDiagram : function(classDiagram, diagramProcessor){

	return classDiagram;
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
//	var sequenceDiagram = Repository.GetTreeSelectedObject();
//   
//	var useCaseProfile = traverseUseCase(sequenceDiagram);
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
//		var path = workingDir + "SequenceDiagram_"+sequenceDiagram.Name.replace(' ', '_')+"paths_profile.txt";
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