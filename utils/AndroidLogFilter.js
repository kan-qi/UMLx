(function() {
	// the data structure are assumed in the upper analysis.
	
	var fs = require('fs');
	var path = require('path');
	var fileManagerUtil = require("./FileManagerUtils.js");

	var async = require("async");
	
	//the log file might be very large, specical stream reader is required.
	
	var es = require('event-stream');

	function filterAndroidLog(logPath, filterFilePath, outputDir){
		// can also use this function as a filter of the file.
		console.log("filter android log");
		
		if(fs.lstatSync(logPath).isDirectory()){
			filterAndroidLogs(logPath, filterFilePath, outputDir);
			return;
		}
		
		var lineNr = 0;

	    var lastMethodSign = "";

		var debuggerOutputUtil = require("./DebuggerOutput.js");
		

		var filterNames = []
		
		if(fileManagerUtil.existsSync(filterFilePath)){
			filterNames = fileManagerUtil.readFileSync(filterFilePath).split(/\r?\n/g);
		}

		var s = fs.createReadStream(logPath)
		.pipe(es.split())
		.pipe(es.mapSync(function(line){
			
			
			// pause the readstream
			s.pause();

			lineNr += 1;
			
			for(var i in filterNames){
				if(line.indexOf(filterNames[i])>-1){
					s.resume();
					return;
				}
			}
			
			console.log(line);
			
			debuggerOutputUtil.appendFile2("filtered_android_log", line+"\n", outputDir);

			s.resume();
		})
		.on('error', function(err){
			console.log('Error while reading file.', err);
		})
		.on('end', function(){
			console.log('Read entire file.')
		})
		);
	}
	
	
	function filterAndroidLogs(logFolder, filterFilePath, outputDir){
		
		var debuggerOutputUtil = require("./DebuggerOutput.js");
		
		fs.readdir(logFolder, function (err, logPaths) {
			
			console.log(logFolder);
			
		    const stringData = {};
		    
			var filterNames = []
			
			if(fileManagerUtil.existsSync(filterFilePath)){
				filterNames = fileManagerUtil.readFileSync(filterFilePath).split(/\r?\n/g);
			}
	    
		  async.eachSeries(logPaths, function (file, done) {
			console.log(file);

		    fs.stat(logFolder+"/"+file, function (err, stats) {
		      if(err){done(); return;}
		      
		      if (stats.isDirectory()) { done(); return;}
		      console.log("read file: "+file);

		      var stream = fs.createReadStream(logFolder+"/"+file).on('end', function () {
		    	  console.log("end file"+file);
		    	  done()
		    	  
		      }).on('data', function (data) {
		    	  if(!stringData[file]){
		    		  stringData[file] = [];
		    	  }
		    	  stringData[file].push(data);
		    });
		      
		  });
		  }, function () {

			  for(var i in stringData){
				  console.log("log files");
				  console.log(i);
				  var str = Buffer.concat(stringData[i]).toString();
			  	
					 var lines = str.split(/\r?\n/g);
					 var lineNr = 0;
					 
					 for(var j in lines){
				

				    lineNr += 1;
				
					var line = lines[j];

			    	if(line === ""){
			    		continue;
			    	}
			    	
			    	var toFilter = false;
			    	
					for(var k in filterNames){
						if(line.indexOf(filterNames[k])>-1){
							toFilter = true;
							break;
						}
					}
					
					if(toFilter){
						continue;
					}

					debuggerOutputUtil.appendFile2(i, line+"\n", outputDir+"/filteredLogs");
					
				}
			  }
			  
			  
			  process.exit();
		  });
		  
		});
	}
	
	
	module.exports = {
			filterAndroidLog: filterAndroidLog,
			filterAndroidLogs: filterAndroidLogs
		}
	}())

