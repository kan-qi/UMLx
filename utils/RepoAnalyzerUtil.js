(function(){
	var fs = require('fs');
	var exec = require('child_process').exec;
	var path = require('path');
	var mkdirp = require('mkdirp');
	
	function analyseSLOC(filePath, outputDir, callback){
			 //to generate svg file.

//	var classPath = '"C:\\Users\\flyqk\\Documents\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
	var classPath = '".\\facility-tools\\Repo Analyser\\bin"';

   var command = 'java -classpath '+classPath+' repo.AnalysisKit "cloc" "'+filePath+'" "'+outputDir+'"';
 	console.log(command);
 	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
 		if (error !== null) {
 			console.log('exec error: ' + error);
		    if(callback){
			 callback(false);
			}
			return;
		}
		 console.log('The file was saved!');
		 
		 if(callback){
			 callback(filePath);
		 }
 		  
 	});
 	
 	child.stdout.on('data', function(data) {
 	    console.log(data); 
 	});
	
	}

	function generateSlocReport(projectListPath, outputPath){
  //to generate svg file.
//	var classPath = '"C:\\Users\\flyqk\\Documents\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
	var classPath = '".\\facility-tools\\Repo Analyser\\bin"';

  var command = 'java -classpath '+classPath+' repo.AnalysisKit "generate-report" "'+projectListPath+'" "'+outputPath+'"';
	console.log(command);
	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		}
		console.log('The file was saved!');
		  
	});
	
	child.stdout.on('data', function(data) {
	    console.log(data); 
	});
}
	
	
	module.exports = {
			 analyseSLOC:  analyseSLOC,
			 generateSlocReport: generateSlocReport
	}
})();
