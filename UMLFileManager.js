(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	
	function deleteUMLRepo(path) {
		  if( fs.existsSync(path) ) {
			    fs.readdirSync(path).forEach(function(file,index){
			      var curPath = path + "/" + file;
			      if(fs.lstatSync(curPath).isDirectory()) { // recurse
			    	  deleteUMLRepo(curPath);
			      } else { // delete file
			        fs.unlinkSync(curPath);
			      }
			    });
			    fs.rmdirSync(path);
			  }
	}
	
//	function parseCSVData(csvData, header){
//			 var data = [];
//			    var lines = csvData.split(/\r?\n/g);
////			    console.log(lines);
//			    var cols = [];
//			    for(var i = 0;i < lines.length;i++){
//			        //code here using lines[i] which will give you each line
//			    	var line = lines[i];
//
//			    	if(line === ""){
//			    		continue;
//			    	}
//			    	
//			    	
//			    	var segs = line.split(/,/g);
////			    	console.log(segs);
////			    	console.log("iteration: "+i);
//			    	
//			    	if(header && i==0){
//			    		for(var j in segs){
//			    			cols.push(segs[j].replace(/[^A-Za-z0-9_]/gi, ""));
//			    		}
//			    		continue;
//			    	}
//			    	
//			    	
//			    	
//			    	var dataElement = {};
//			    	for(var j in segs){
//			    		var col = cols[j];
//			    		if(!col){
//			    			col = j;
//			    		}
//			    		dataElement[col] = segs[j];
//			    	}
//			    	
//			    	data.push(dataElement);
//			    }
//			    
//			    return data;
//	}
	
	module.exports = {
//		loadCSVFileAsString: function(csvFilePath, callbackfunc){
//			fs.readFile(csvFilePath, 'utf-8', (err, str) => {
//				   if (err) throw err;
////				    console.log(data);
//				   if(callbackfunc){
//					   callbackfunc(str);
//				   }
//			});
//		},
//		loadCSVFile:function(csvFilePath, header, callbackfunc){
//			fs.readFile(csvFilePath, 'utf-8', (err, str) => {
//				   if (err) throw err;
////				    console.log(str);
//				  
//				    data = parseCSVData(str, header);
//				    
////				    console.log("csv data is loaded");
////				    console.log(data);
//				    
//				    if(callbackfunc){
//				    	callbackfunc(data);
//				    }
//			});
//		},
//		parseCSVData: parseCSVData,
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
			});
			});
			
		},
		deleteUMLFileInfo: function(umlFileInfo) {
			fs.unlinkSync(umlFileInfo.umlFilePath);
		},
		deleteUMLRepo : deleteUMLRepo,
		getUMLFileInfo: function(repoInfo, umlFilePath, umlModelType, formInfo){
			 var stats = fs.statSync(umlFilePath);
			 var fileSizeInBytes = stats["size"];
			 //Convert the file size to megabytes (optional)
			 var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
			 var umlFileInfo = {};
			 umlFileInfo.fileId = path.parse(umlFilePath).base;
			 umlFileInfo.fileSize = fileSizeInMegabytes;
			 umlFileInfo.creationTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');      // replace T with a space
			 if (umlFilePath.replace(/\\/g, '/').match(/public\/(.*)/) !== null) {
			 	umlFileInfo.fileUrl = umlFilePath.replace(/\\/g, '/').match(/public\/(.*)/)[1];
			 }			 
			 umlFileInfo.umlFilePath = umlFilePath.replace(/\\/g, '/');
			 umlFileInfo.umlModelType = umlModelType;
			 // should put in the repo dir.
			 umlFileInfo.formInfo = formInfo;
			 return umlFileInfo;
		},
		duplicateUMLFileInfo: function(umlFileInfo){
			return {
				 fileId: umlFileInfo.fileId,
				 fileSize: umlFileInfo.fileSize,
				 creationTime: umlFileInfo.creationTime,
				 fileUrl: umlFileInfo.fileUrl,
				 umlFilePath: umlFileInfo.umlFilePath,
				 umlModelType: umlFileInfo.umlModelType,
				 // should put in the repo dir.
				 formInfo: umlFileInfo.formInfo
			}
		},
		makeDir: function(dir, callbackfunc){
			mkdirp(dir, function(err) { 
				if(err) {
					console.log(err);
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				
				if(callbackfunc){
					callbackfunc(true);
				}
		
			});
		},
		makeDirs: function(dirs, callbackfunc){
			function mkdir(dir){
				return new Promise((resolve, reject) => {
					mkdirp(dir, function(err){
						if(err){
							reject(err);
							return;
						}
						resolve();
					});
				  });
			}
			
			let chain = Promise.resolve();
			
			for(var i in dirs){
				var dir = dirs[i];
				chain = chain.then(mkdir(dir));
			}
			
			chain.then(function(){
				if(callbackfunc){
					callbackfunc(true);
				}
			}).catch(function(err){
				console.log(err);
				if(callbackfunc){
					callbackfunc(err);
				}
			});
			
		}
	}
}())