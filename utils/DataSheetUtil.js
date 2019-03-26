(function() {
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	
	function parseCSVData(csvData, header){
			 var data = [];
			    var lines = csvData.split(/\r?\n/g);
//			    console.log(lines);
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
		loadJSONFile: function(jsonFilePath, callbackfunc){
			fs.readFile(jsonFilePath, 'utf-8', (err, str) => {
				   if (err) throw err;
//				    console.log(str);
				  
				   var result = JSON.parse(str);
				    
//				    console.log("csv data is loaded");
//				    console.log(data);
				    
				    if(callbackfunc){
				    	callbackfunc(result);
				    }
			});
		},
		parseCSVData: parseCSVData
	}
}())