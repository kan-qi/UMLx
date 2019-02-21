	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var uuidV1 = require('uuid/v1');
	var codeAnalysisUtil = require("./CodeAnalysisUtil.js");
	var stringSimilarity = require('string-similarity');
	var fileManagerUtil = require("./FileManagerUtils.js");
	
	//the log file might be very large, specical stream reader is required.
	
	var es = require('event-stream');

	function filterAndroidLog(logPath){
		// can also use this function as a filter of the file.
		console.log("filter android log");
		
		var lineNr = 0;

	    var lastMethodSign = "";

		var debuggerOutputUtil = require("./DebuggerOutput.js");
		
		var s = fs.createReadStream(logPath)
		.pipe(es.split())
		.pipe(es.mapSync(function(line){
			
			
			// pause the readstream
			s.pause();

			lineNr += 1;
			
			if((line.indexOf("getIntervalWidth()") > -1) || (line.indexOf("getIntervalRead()") > -1) || (line.indexOf("\"logType\":\"exit\"") > -1)){
				s.resume();
				return;
			}
			
			debuggerOutputUtil.appendFile1("filtered_android_log", line+"\n");

	    	
			// resume the readstream, possibly from a callback
			s.resume();
		})
		.on('error', function(err){
			console.log('Error while reading file.', err);
			if(callback){
				callback(false);
			}
		})
		.on('end', function(){
			console.log('Read entire file.')
		})
		);
	}
	
	filterAndroidLog("./data/GitAndroidAnalysis/batch_analysis/AnotherMonitor-release/another_monitor_log.file");
	