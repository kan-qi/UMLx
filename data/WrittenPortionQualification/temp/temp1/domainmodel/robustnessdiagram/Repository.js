!INC Local Scripts.EAConstants-JScript
!INC MyGroup.RobustnessDiagram_paths_Jscript



/*
 * Script Name: RobustnessDiagram_establish_knowledgebase
 * Author: Kan Qi
 * Purpose: To establish the knowledgebase while thinking its structure in memory as well as in file.
 * This is a library class. This class provide all the registed paths to other classes, where are referenced by ids.
 * 
 * path repository:
 * 1. provide a use interface of the paths in CSV for users to fill in the slocs, by keeping the names of the components.
 * 2. keep a universal repository for all the paths in history in form of ids and slocs.
 * use the ids as the reference to each other.
 * the domain of the program. One instance of the program keeps the information about one domain of projects.
 *
 *Date: 2016/06/06
 */
 
/*
* load the knowedge from file. Think of the file is too large and more efficient indexing technique to support specific search operations.
*/

function PathRepository(dbpath){
	this.dbpath = dbpath;
}


/* add a path with element uui to represent the nodes within the graph to the reposition
* return a path which has been saved to the path repository in all history in form:
* path = {
* id: 9,
* path: [],
* pathString: '',
* sloc: 93
* }
*/


// update path repository after scanning the profiled models fo the slocs.
PathRepository.prototype.updatePathRecords = function(pathRecords){
	
	try{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		Session.Output("upate path repository");
		
		if(fso.FileExists(this.dbpath)){
			fso.DeleteFile(this.dbpath);
		}
		
		
		var f1 = fso.OpenTextFile(this.dbpath, 2, true);
		
		for(var id in pathRecords){
			f1.WriteLine(id+","+pathRecords[id]);
		}
		
		f1.Close();
		
	} catch(err){
		Session.Output(err.message);
	}
}


// return all the records currently in the path db
PathRepository.prototype.getPathRecords = function(){
	var pathRecords = new Array();
	
	try{
		
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		if(!fso.FileExists(this.dbpath)){
			
		}
		else{
			var f1 = fso.OpenTextFile(this.dbpath, 1)
			while(!f1.AtEndOfStream){
				var recordElements = f1.ReadLine().split(",");
				if(recordElements[0] != null && recordElements[0] != ""){
					pathRecords[recordElements[0]] = recordElements[1];
				}
			}
			f1.close();
		}
		
		
	} catch(err){
		Session.Output(err.message);
	}
	
	return pathRecords;
};

PathRepository.prototype.add = function(path, profilepath){
	var pathString = toPathString(path);
	var id = this.generateId();
	
	try{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		Session.Output("writing path to repository: "+path);
		
		var f1;
		var f2;
		if(!fso.FileExists(profilepath)){
		f1 = fso.OpenTextFile(profilepath, 2, true);
		f1.WriteLine("id,path,sloc");
		}
		else {
		f1 = fso.OpenTextFile(profilepath, 8);	
		}
		
		if(!fso.FileExists(this.dbpath)){
		f2 = fso.OpenTextFile(this.dbpath, 2, true);
		}
		else {
		f2 = fso.OpenTextFile(this.dbpath, 8);	
		}
		
		f2.WriteLine(id+",");
		f2.Close();
		
		f1.WriteLine(id+","+pathString+",");
		f1.Close();
	}
	catch(err){
		Session.Output(err.message);
	}
	
	return id;
}

PathRepository.prototype.findPathById = function(id){
	
}

PathRepository.prototype.findPathsByIds = function(ids){
	var paths = new Array();
		
	try{
		
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		Session.Output("find paths in repository for ids: "+ids.length);
		if(!fso.FileExists(this.dbpath)){
			
		}
		else{
			
			var f1 = fso.OpenTextFile(this.dbpath, 1);
			while(!f1.AtEndOfStream){
				var line = f1.ReadLine();
				var elements = line.split(",");
				var id = elements[0];
				if(id.match(/^[0-9]+/i)[0] == "undefined"){
					continue;
				}
				var match = false;
				for(var i=0;i<ids.length;i++){
						if(id == ids[i]){
							match = true;
							break;
						}
				}
				if(match){
				paths[id] = elements[1];
				}
			}
			f1.close();
		}
		
		
	} catch(err){
		Session.Output(err.message);
	}
	
	return paths;
}


PathRepository.prototype.generateId = function(){
	var id = -1;
		
	try{
		
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		if(!fso.FileExists(this.dbpath)){
			id=0;
		}
		else{
			var f1 = fso.OpenTextFile(this.dbpath, 1)
			var lastLine = "-1";
			while(!f1.AtEndOfStream){
				lastLine = f1.ReadLine();
			}
			f1.close();
			id = parseInt(lastLine.match(/^[0-9]+/i)[0]) + 1;
		}
		
		
	} catch(err){
		Session.Output(err.message);
	}
	
	return id;
}


 
function main()
{
	// TODO: Enter script code here!
}

//main();