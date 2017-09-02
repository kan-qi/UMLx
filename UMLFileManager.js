(function() {
	var fs = require('fs');
	var path = require('path');
	
	module.exports = {
		loadCSVFileAsString: function(csvFilePath, callbackfunc){
			fs.readFile(csvFilePath, 'utf-8', (err, str) => {
				   if (err) throw err;
//				    console.log(data);
				   if(callbackfunc){
					   callbackfunc(str);
				   }
			});
		},
		loadCSVFile:function(csvFilePath, header, callbackfunc){
			fs.readFile(csvFilePath, 'utf-8', (err, str) => {
				   if (err) throw err;
//				    console.log(str);
				    var data = [];
				    var lines = str.split(/\r?\n/g);
//				    console.log(lines);
				    var cols = [];
				    for(var i = 0;i < lines.length;i++){
				        //code here using lines[i] which will give you each line
				    	var line = lines[i];

				    	if(line === ""){
				    		continue;
				    	}
				    	
				    	
				    	var segs = line.split(/,/g);
//				    	console.log(segs);
//				    	console.log("iteration: "+i);
				    	
				    	if(header && i==0){
				    		for(var j in segs){
				    			cols.push(segs[j].replace(/[^A-Za-z0-9_]/gi, ""));
				    		}
				    		continue;
				    	}
				    	
				    	
				    	
				    	var dataElement = {};
				    	for(var j in segs){
				    		var col = cols[j];
				    		if(!col){
				    			col = j;
				    		}
				    		dataElement[col] = segs[j];
				    	}
				    	
				    	data.push(dataElement);
				    }
				    
//				    console.log("csv data is loaded");
//				    console.log(data);
				    
				    if(callbackfunc){
				    	callbackfunc(data);
				    }
			});
		},
		deleteFolder: function(url, callbackfunc){
			//fill out the function.
			if(callbackfunc){
			callbackfunc(url);
			}
		},
		deleteUMLFileInfo: function(umlFileInfo) {
			fs.unlinkSync(umlFileInfo.umlFilePath);
		},
		getUMLFileInfo: function(repoInfo, umlFilePath, umlModelType, umlModelName){
			 var stats = fs.statSync(umlFilePath);
			 var fileSizeInBytes = stats["size"];
			 //Convert the file size to megabytes (optional)
			 var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
			 var umlFileInfo = {};
			 umlFileInfo.fileId = path.parse(umlFilePath).base;
			 umlFileInfo._id = umlFileInfo.fileId + Date.now();
			 if(umlModelName === null || umlModelName === ''){
				 umlModelName = umlFileInfo.fileId;
			 }
			 umlFileInfo.fileSize = fileSizeInMegabytes;
			 umlFileInfo.creationTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');      // replace T with a space
			 umlFileInfo.fileUrl = umlFilePath.replace(/\\/g, '/').match(/public\/(.*)/)[1];
			 umlFileInfo.umlFilePath = umlFilePath.replace(/\\/g, '/');
			 umlFileInfo.umlModelType = umlModelType;
			 umlFileInfo.umlModelName = umlModelName;
			 // should put in the repo dir.
			 umlFileInfo.outputDir = repoInfo.outputDir+"/"+umlFileInfo.fileId;
			 umlFileInfo.accessDir = repoInfo.accessDir+"/" + umlFileInfo.fileId;
			 return umlFileInfo;
		}
	}
}())