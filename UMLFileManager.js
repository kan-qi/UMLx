(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	
	function parseCSVData(csvData, header){
			 var data = [];
			    var lines = csvData.split(/\r?\n/g);
//			    console.log(lines);
			    var cols = [];
			    for(var i = 0;i < lines.length;i++){
			        //code here using lines[i] which will give you each line
			    	var line = lines[i];

			    	if(line === ""){
			    		continue;
			    	}
			    	
			    	
			    	var segs = line.split(/,/g);
//			    	console.log(segs);
//			    	console.log("iteration: "+i);
			    	
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
			    
			    return data;
	}
	
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
				  
				    data = parseCSVData(str, header);
				    
//				    console.log("csv data is loaded");
//				    console.log(data);
				    
				    if(callbackfunc){
				    	callbackfunc(data);
				    }
			});
		},
		parseCSVData: parseCSVData,
		deleteFolder: function(url, callbackfunc){
			//fill out the function.
			if(callbackfunc){
			callbackfunc(url);
			}
		},
		writeFiles: function(dir, files, callbackfunc){
			function writeFile(path, content){
				return new Promise((resolve, reject) => {
					fs.writeFile(path, content, function(err){
						if(err){
							reject(err);
							return;
						}
						resolve();
					});
				  });
			}
			
			
			
			let chain = Promise.resolve();
			
			mkdirp(dir, function(err) { 
				if(err) {
					console.log(err);
					if(!callbackfunc){
						callbackfunc(err);
					}
					return;
				}
			for(var i in files){
				var file = files[i];
				chain = chain.then(writeFile(dir+"/"+file.fileName, file.content));
			}
			
			chain.then(function(){
				if(callbackfunc){
					callbackfunc();
				}
			}).catch(function(err){
				console.log(err);
				if(callbackfunc){
					callbackfunc(err);
				}
			})
			});
			
		},
		deleteUMLFileInfo: function(umlFileInfo) {
			fs.unlinkSync(umlFileInfo.umlFilePath);
		},
		getUMLFileInfo: function(repoInfo, umlFilePath, umlModelType, formInfo){
			 var stats = fs.statSync(umlFilePath);
			 var fileSizeInBytes = stats["size"];
			 //Convert the file size to megabytes (optional)
			 var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
			 var umlFileInfo = {};
			 umlFileInfo.fileId = path.parse(umlFilePath).base;
			 umlFileInfo.fileSize = fileSizeInMegabytes;
			 umlFileInfo.creationTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');      // replace T with a space
			 umlFileInfo.fileUrl = umlFilePath.replace(/\\/g, '/').match(/public\/(.*)/)[1];
			 umlFileInfo.umlFilePath = umlFilePath.replace(/\\/g, '/');
			 umlFileInfo.umlModelType = umlModelType;
			 // should put in the repo dir.
			 umlFileInfo.formInfo = formInfo;
			 return umlFileInfo;
		}
	}
}())