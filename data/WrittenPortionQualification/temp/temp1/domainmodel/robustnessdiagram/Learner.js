!INC Local Scripts.EAConstants-JScript
!INC MyGroup.RobustnessDiagram_repository_Jscript
!INC MyGroup.RobustnessDiagram_index_builder_Jscript

/*
 * Script Name: robustnessdiagram profiler.
 * Author:  Kan Qi
 * Purpose: 
 * 1. to scan all the profiles of paths for the user input of the slocs and associate the slocs with the path universal ids.
 * 2. dump different kinds of graphs to explain about the data current get.
 *
 * Likely:
 * There are several types of factors - deterministic or non deterministic
 * 1. the language or the cots of the project.
 * 2. the factors about the path. The number of elements.
 * 3. the factors about the entire graph.
 *
 * Date: 06-11-2016
 */
 
 

// this method should be implemented in profile javascript.


 function parseProfile(profilePath, onPathDetectedFunc){
	try{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		if(!fso.FileExists(profilePath)){
			return;
		}
		else{
			var f1 = fso.OpenTextFile(profilePath, 1)
			while(!f1.AtEndOfStream){
				var recordElements = f1.ReadLine().split(",");
				if(recordElements[0] != null && recordElements[0] != "" && recordElements[0] != "id"){
					if(onPathDetectedFunc != null){
						onPathDetectedFunc(recordElements[0], recordElements[2]);
					}
				}
			}
			f1.close();
		}
		
		
	} catch(err){
		Session.Output(err.message);
	}
	
}

 // scan all the models that have been profiled and categorize the slocs into path db
 function scanProfiledModels(){
	 
	 Repository.EnsureOutputVisible("Script");
	 var pathRepository = new PathRepository(PATH_DB_PATH);
	 var pathRecords = pathRepository.getPathRecords();
				 
	
	 try{
		 
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		if(!fso.FileExists(PROFILED_MODELS_PATH)){
			Session.Output("no records for profiled models");
			return;
		}
		else{
			var f1 = fso.OpenTextFile(PROFILED_MODELS_PATH, 1)
			while(!f1.AtEndOfStream){
			  var modelProfilePath = f1.ReadLine();
			  
			  if(!fso.FileExists(modelProfilePath)){
				  // think of removing the modelProfilePath from the records.
				  // correspondingly there should be an time to remove the ids for  the paths in the model. remove the paths with zero slocs
			  }
			  else{
				  // naive algorithm to check with n2 time complexity
				  // but we can load the path db into memory first and supply the slocs in the models.
				  parseProfile(modelProfilePath, function(id, sloc){
					  if(pathRecords[id] != "undefined"){
						  pathRecords[id] = sloc;
					  }
				  });
					  
			  }	
			}
			f1.close();
		}
		
		
	} catch(err){
		Session.Output(err.message);
	}
	
	pathRepository.updatePathRecords(pathRecords);
}

scanProfiledModels();