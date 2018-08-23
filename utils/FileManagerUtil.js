(function() {
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var path = require('path')
	
	 function deleteFolderRecursive(dir, rmSelf) {
		    var files;
		    rmSelf = (rmSelf === undefined) ? true : rmSelf;
		    dir = dir + "/";
		    try { files = fs.readdirSync(dir); } catch (e) { console.log("!Oops, directory not exist."); return; }
		    if (files.length > 0) {
		        files.forEach(function(x, i) {
		            if (fs.statSync(dir + x).isDirectory()) {
		            	deleteFolderRecursive(dir + x);
		            } else {
		                fs.unlinkSync(dir + x);
		            }
		        });
		    }
		    if (rmSelf) {
		        // check if user want to delete the directory ir just the files in this directory
		        fs.rmdirSync(dir);
		    }
		}
	 
	 function deleteFileSync(filePath){
		  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
			  fs.unlinkSync(filePath);
          }
	 }
	 
	 function readFilesSync(filePaths){
		 var fileContents = [];
		 for(var i in filePaths){
		 var path = filePaths[i];
		 if( fs.existsSync(path) ) {
			 var fileContent = fs.readFileSync(path, 'utf8');
			 fileContents.push(fileContent);
		 }
		 else{
			 fileContents.push("");
		 }
		 }
		 
		 return fileContents;
	 }
	 
	 function readFileSync(filePath){
		 if( fs.existsSync(filePath) ) {
			  return fs.readFileSync(filePath, 'utf8');
		 }
		 
		 return "";
	 }
	 
	 function writeFileSync(filePath, fileContent){
		 fs.writeFileSync(filePath, fileContent);
	 }
	 
	 function appendFile(filePath, message, callbackfunc){
		 var outputDir = path.dirname(filePath);
			mkdirp(outputDir, function(err) { 
				fs.appendFile(filePath, message,function (err) {
					  if (err) throw err;
					  console.log('Saved!');
					  if(callbackfunc){
						  callbackfunc(filePath+"  message: "+message);
					  }
					});
				});
		}
	
	module.exports = {
			deleteFolderRecursive : deleteFolderRecursive,
			readFilesSync : readFilesSync,
			readFileSync: readFileSync,
			writeFileSync: writeFileSync,
			deleteFileSync: deleteFileSync,
			appendFile: appendFile
	}
}())