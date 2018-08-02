(function() {
	var fs = require('fs');
	
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
	
	module.exports = {
			deleteFolderRecursive : deleteFolderRecursive
	}
}())