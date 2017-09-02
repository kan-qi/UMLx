!INC Local Scripts.EAConstants-JScript

/*
 * Script Name: 
 * Author: 
 * Purpose: 
 * Date: 
 */
 

var workingBaseDirPCAtHome = "C:\\Users\\flyqk\\Documents\\Research WorkSpace\\Research-Works\\ea scripts\\";
var workingBaseDirLaptop = "C:\\Users\\flyqk\\Documents\\Research Workspace\\Research Works\\ea scripts\\";
var workingBaseDir = workingBaseDirLaptop;

// one instance of the program will learn the paths for one domain of the projects, and all the data will be keep under that domain.
var domain = "Saas\\";

var workingDir = workingBaseDir+domain;

var dbDir = workingDir+"db\\";

var estimationDir = workingDir + "estimations\\";


var PATH_PROFILE_PATH_SCHEME = workingDir + "RobustnessDiagram_path_profile_%s.csv";
// store all the historically profiled paths for their ids.
var PATH_DB_PATH = dbDir + "RobustnessDiagram_path_db";
// to temporarily store the path of profiles to scan
var PROFILED_MODELS_PATH = dbDir + "RobustenssDiagram_profiled_models";
// store the index in form of pattern elements.
var INDEX_PATH = dbDir+"RobustnessDiagram_index";

var ESTIMATION_PATH_SCHEME = estimationDir + "RobustnessDiagram_estimation_for_%s.csv";

// initiate the resources for the domain
(function(){
	
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		if(!fso.FolderExists(workingDir)){
			Session.Output("create the domain space");
			fso.CreateFolder(workingDir);
		}
		
		if(!fso.FolderExists(dbDir)){
			Session.Output("create the domain database space");
			fso.CreateFolder(dbDir);
		}

})();
		
/*
*
* The steps to give initial estimations:
* 1. run profile script to generate the profile for specific model
* 2. supply the lines of code for paths in the profile.
* 3. run the learning script to understand sloc for specific paths.
* 4. run estimator script for specific diagram or the whole model.
*
*/
