/*
 * Script Name: robustnessdiagram profiler.
 * Author:  Kan Qi
 * Purpose: to profile the paths within the model of the project for evaluation on the lines of source code.
 * Also establish the index by the pattern of the paths, so as to categorize the paths. Finally to store the index
 * and pathes into files to keep them as the knowledge for future estimation.
 *
 * Parsing strategies:
 *
 * 1. store the index as well as the paths. 
 * 2. store the patterns and the paths, and create index on the way. Patterns and paths are separated, and associated by ids.
 * The second strategy seems better.
 *
 * The essential data structure should be the index. The most compact data representation form by the requirements for the data needed for analysis.
 *
 * update about the definition 
 * 1. to profile the model file in these factors:
 * 	  C: the number of controllers
 *    M: the number of models:
 *    A: the number of actors:
 *    P: the number of independent paths:
 * 2. In the future, there will be more metrics to evaluate the model file to facilitate the analytics about the graph.
 *
 * Date: 06-11-2016
 */
 
(function(){
	module.exports = {
			
	}
})();
function addProfiledModel(filepath){
	try{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var f1;
	if(!fso.FileExists(PROFILED_MODELS_PATH)){
		f1 = fso.OpenTextFile(PROFILED_MODELS_PATH, 2, true);
		}
		else {
		f1 = fso.OpenTextFile(PROFILED_MODELS_PATH, 8);	
	}
	f1.WriteLine(filepath);
	f1.Close();
	}
	catch(err){
		Session.Output(err.message);
	}
}

function removeProfileRecord(filepath){
	
}
 
function startProfile()
{
	Repository.EnsureOutputVisible("Script");
	
	var theElement as EA.Element;
    theElement = Repository.GetTreeSelectedObject();
	
		
    //Session.Output(theElement.Name);
	
	var profilePath = PATH_PROFILE_PATH_SCHEME.replace("%s", theElement.Name);
	var pathRepository = new PathRepository(PATH_DB_PATH);
	var indexBuilder = new IndexBuilder(INDEX_PATH);
	indexBuilder.loadIndex();
	
	var childrenElements as EA.Collection;
	childrenElements=theElement.Elements;
	
	
	var pathIndexer = function(path){
		var pattern = toPattern(path);
		indexBuilder.indexPath(pattern, function(pointer){
			if(!pointer.hasOwnProperty("pathIds") || pointer.pathIds == null){
				pointer.pathIds = new Array();
			}
		
			pointer.pathIds.push(pathRepository.add(path, profilePath));
		});
	}
	
	Session.Output(childrenElements.Count)
	for (var i=0; i<childrenElements.Count; i++){
		var modelDefElement as EA.Element;
		modelDefElement = childrenElements.GetAt(i);
		if( modelDefElement.Type == "UseCase" ){
			Session.Output("Use Case:"+modelDefElement.Name);
			traverseUseCase(modelDefElement, pathIndexer);
			addProfiledModel(profilePath);
		}
		else{
			Session.Output("other:"+modelDefElement.Name);
		}
	}
	
	indexBuilder.saveIndex();
}

startProfile();

function testLoadIndex(){
	var indexBuilder = new IndexBuilder(INDEX_PATH);
	indexBuilder.loadIndex();
}