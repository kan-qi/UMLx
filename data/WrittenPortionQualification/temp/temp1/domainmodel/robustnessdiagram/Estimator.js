!INC Local Scripts.EAConstants-JScript
!INC MyGroup.EnvironmentVariables
!INC MyGroup.RobustnessDiagram_query_Jscript
!INC MyGroup.RobustnessDiagram_repository_Jscript
!INC MyGroup.RobustnessDiagram_index_builder_Jscript
!INC MyGroup.RobustnessDiagram_paths_Jscript

/*
 * Script Name: 
 * Author: 
 * Purpose: 
 * Date: 
 */
 
function main()
{
	// TODO: Enter script code here!
	Repository.EnsureOutputVisible("Script");
		
	var theElement as EA.Element;
    theElement = Repository.GetTreeSelectedObject();

	var estimatedResult = estimateUsecase(theElement);
	
}
 
/**
* to iterate through all the paths within the use cases and find the slocs for the matched pattern of the each path
*
*/

function estimateUsecase(theElement){
	var indexBuilder = new IndexBuilder(INDEX_PATH);
	var index = indexBuilder.loadIndex();
	var pathRepository = new PathRepository(PATH_DB_PATH);
	
	var usecaseEstimation = {
		Name: theElement.Name,
		PathEstimations: new Array()
	};
	
	Session.Output("to estimate use case: "+theElement.Name);
	// to evaluate the paths by identifying
	var pathEvaluator = function(path){
		var pattern = toPattern(path);
		var pathIds = queryByPatternStrict(pattern, index);
		var paths = pathRepository.findPathsByIds(pathIds);
		Session.Output(toPathString(path));
		Session.Output("historical sloc records for the matched pattern:");
		var slocs_str = "[";
		var slocs = new Array();
		var pathNum = 0;
		var total = 0;
		for(var key in paths){
			slocs.push(paths[key]);
			slocs_str += paths[key];
			//if(key != paths.length-1){
				slocs_str += ";";
			//}
			
			var sloc = parseInt(paths[key]);
			if(paths[key] != "" && !isNaN(sloc)){
				total += sloc;
				pathNum++;
			}
		}
		slocs_str += "]";
		var pathEstimation = {
			PathString: toPathString(path),
			Slocs: slocs,
			SlocsStr: slocs_str,
			Average: total/pathNum
		};
		usecaseEstimation.PathEstimations.push(pathEstimation);
	}
	traverseUseCase(theElement, pathEvaluator);
	return usecaseEstimation;
}

function estimateModel(theElement){
	
    Session.Output("to estimate model: "+ theElement.Name);
	
	var modelEstimation = {
		Name: theElement.Name,
		UsecaseEstimations: new Array()
	};
	
	var childrenElements as EA.Collection;
	childrenElements=theElement.Elements;
	
	for (var i=0; i<childrenElements.Count; i++){
		var modelDefElement as EA.Element;
		modelDefElement = childrenElements.GetAt(i);
		if( modelDefElement.Type == "UseCase" ){
		var usecaseEstimation = estimateUsecase(modelDefElement);
		modelEstimation.UsecaseEstimations.push(usecaseEstimation);
		}
		else{
			
		}
	}
	
	return modelEstimation;
}


function test_query_path_sloc(){
	var indexBuilder = new IndexBuilder(INDEX_PATH);
	var index = indexBuilder.loadIndex();
	var pathIds = queryByPatternStrict(["actor","boundary","control+", "entity"], index);
	var pathRepository = new PathRepository(PATH_DB_PATH);
	var paths = pathRepository.findPathsByIds(pathIds);
	var total= 0;
	var pathNum = 0;
	for (var key in paths){
		var sloc = parseInt(paths[key]);
		if(paths[key] != "" && !isNaN(sloc)){
		total += sloc;
		pathNum++;
		}
	}
	Session.Output("the estimated sloc for the pattern: "+ total/pathNum);
}

function startEstimateSelectedUsecase(){
	Repository.EnsureOutputVisible("Script");
	
	var theElement as EA.Element;
    theElement = Repository.GetTreeSelectedObject();
	var usecaseEstimation = estimateUsecase(theElement);
	
	var filepath = ESTIMATION_PATH_SCHEME.replace("%s", usecaseEstimation.Name);
	
	try{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if(fso.FileExists(filepath)){
		fso.DeleteFile(filepath);
	}
	
	var f1 = fso.OpenTextFile(filepath, 2, true);
	var totalSlocs = 0;
	f1.WriteLine("path,historical slocs, average");
	var pathEstimations = usecaseEstimation.PathEstimations;
	for (var  i=0; i<pathEstimations.length; i++){
		var pathEstimation = pathEstimations[i];
		f1.WriteLine(pathEstimation.PathString+","+pathEstimation.SlocsStr+","+pathEstimation.Average);
		totalSlocs += pathEstimation.totalSlocs;
	}
	f1.WriteLine("total slocs: "+totalSlocs);
	f1.Close();
	
	}
	catch(err){
		Session.Output(err.message);
	}
		
}

function startEstimateSelectedModel(){
	Repository.EnsureOutputVisible("Script");
	
	var theElement as EA.Element;
    theElement = Repository.GetTreeSelectedObject();
	var modelEstimation = estimateModel(theElement);
	
	var filepath = ESTIMATION_PATH_SCHEME.replace("%s", modelEstimation.Name);
	
	try{
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	if(fso.FileExists(filepath)){
		fso.DeleteFile(filepath);
	}
	
	var f1 = fso.OpenTextFile(filepath, 2, true);
	f1.WriteLine("use case, path,historical slocs, average");
	var usecaseEstimations = modelEstimation.UsecaseEstimations;
	var totalSlocs = 0;
	for (var j=0; j< usecaseEstimations.length; j++){
		var usecaseEstimation = usecaseEstimations[j];
		f1.WriteLine(usecaseEstimation.Name+",,,");
		var pathEstimations = usecaseEstimation.PathEstimations;
		for (var  i=0; i<pathEstimations.length; i++){
		var pathEstimation = pathEstimations[i];
		f1.WriteLine(","+pathEstimation.PathString+","+pathEstimation.SlocsStr+","+pathEstimation.Average);
		totalSlocs += pathEstimation.Average;
		}
	}
	
	f1.WriteLine("total slocs: "+totalSlocs);
	f1.Close();
	
	}
	catch(err){
		Session.Output(err.message);
	}
}

startEstimateSelectedModel();

//test_query_path_sloc();

//main();