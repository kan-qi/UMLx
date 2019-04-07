(function() {
	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var path = require('path')
	const mkdirpSync = require('mkdirp-sync');
	
	 function deleteFolderRecursive(dir, rmSelf){
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

	 function existsSync(filePath){
			return fs.existsSync(filePath);
	 }
	 
	 function mkDirSync(dirPath){
		 mkdirpSync(dirPath);
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

	  function readJSONFilesSync(filePaths){
     		 var fileContents = [];
     		 for(var i in filePaths){
     		 var path = filePaths[i];
     		 if( fs.existsSync(path) ) {
     			 var fileContent = fs.readFileSync(path, 'utf8');
     			 fileContents.push(JSON.parse(fileContent));
     		 }
     		 else{
     			 fileContents.push(null);
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
	 

		function parseCSVData(csvData, header){
				 var data = [];
				    var lines = csvData.split(/\r?\n/g);
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
		loadCSVFileSync: function(csvFilePath, header){
			var str = fs.readFileSync(csvFilePath, 'utf-8');
				    data = parseCSVData(str, header);
				    
					return data;
		},
		readFile: function(filePath, callbackfunc){
			fs.readFile(filePath, 'utf-8', (err, str) => {
				   if (err) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				   }
//				    console.log(data);
				   if(callbackfunc){
					   callbackfunc(str);
				   }
			});
		},
		readJSON: function(filePath, callbackfunc){
			fs.readFile(filePath, 'utf-8', (err, str) => {
				   if (err) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				   }
//				    console.log(data);
				 var obj = JSON.parse(str);
				   if(callbackfunc){
					   callbackfunc(obj);
				   }
			});
		},
		readJSONSync: function(filePath){
			var str = fs.readFileSync(filePath, 'utf-8');
				 var obj = JSON.parse(str);
				  return obj
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
		parseCSVData: parseCSVData,
			deleteFolderRecursive : deleteFolderRecursive,
			readFilesSync : readFilesSync,
			readFileSync: readFileSync,
			writeFileSync: writeFileSync,
			deleteFileSync: deleteFileSync,
			appendFile: appendFile,
			existsSync: existsSync,
			mkDirSync: mkDirSync,
			readJSONFilesSync: readJSONFilesSync
	}
}())