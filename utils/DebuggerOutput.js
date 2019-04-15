(function(){

	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var config = require("../config.js");
	var FileManagerUtil = require("./FileManagerUtils.js");
	
//	var OutputDir = './debug';

	function writeJson(token, message, callbackfunc){
//		var OutputDir = global.debugOutputDir ? global.debugOutputDir : './debug';
		var OutputDir = "./debug";
		mkdirp(OutputDir, function(err) { 
		fs.writeFile(OutputDir+'/'+token+'.json', JSON.stringify(message), function(err){
			if(err){
				console.log(err);
			}
		});
		});
	}
	
	function writeJson2(token, message, outputDir){
//		var OutputDir = global.debugOutputDir ? global.debugOutputDir : './debug';
		return;
		if(!outputDir){
			outputDir = "./data/OpenSource/debug";
		}
		fs.writeFileSync(outputDir+'/'+token+'.json', JSON.stringify(message));
	}
	
	function writeJson3(token, message, outputDir){
//		var OutputDir = global.debugOutputDir ? global.debugOutputDir : './debug';
		
		if(!outputDir){
			outputDir = "./data/OpenSource/debug";
		}
		
		var duplicate = JSON.parse(JSON.stringify(message));
		deleteAttrRecur(duplicate, "attachment")
		fs.writeFileSync(outputDir+'/'+token+'.json', JSON.stringify(duplicate));
	}
	
	function writeTxt(token, message, callbackfunc){
		var OutputDir = global.debugOutputDir ? global.debugOutputDir : './debug';
		
		mkdirp(OutputDir, function(err) { 
		fs.writeFile(OutputDir+'/'+token+'.txt', message, function(err){
			if(err){
				console.log(err);
			}
		});
		});
	}
	
	function deleteAttrRecur(object, attrName) {
		if (object instanceof Array) {
			for (var i in object) {
				deleteAttrRecur(object[i], attrName);
			}
		} else if (object instanceof Object) {
			for (var i in object) {
				if(i === attrName){
					object[i] = null;
				}
				deleteAttrRecur(object[i], attrName);
			}
		}
	}
	
	function appendFile(token, message, callbackfunc){
		var OutputDir = global.debugOutputDir ? global.debugOutputDir : './debug';
		var filename = OutputDir+'/'+token+'.txt';
		if (global.debugCache) {
			if (!global.debugCache[filename]){
				global.debugCache[filename] = message;
			}
			else{
				global.debugCache[filename] += message;
			}
		}
		else {
			mkdirp(OutputDir, function(err) { 
				fs.appendFile(OutputDir+'/'+token+'.txt', message,function (err) {
					  if (err) throw err;
					  console.log('Saved!');
					  if(callbackfunc){
						  callbackfunc(OutputDir+'/'+token+'.txt');
					  }
					});
				});
		}
	}
	
	function appendFile1(token, message, callbackfunc){
		var OutputDir = './debug';
		var filename = OutputDir+'/'+token+'.txt';
			mkdirp(OutputDir, function(err) { 
				fs.appendFile(OutputDir+'/'+token+'.txt', message,function (err) {
					  if (err) throw err;
					  console.log('Saved!');
					  if(callbackfunc){
						  callbackfunc(OutputDir+'/'+token+'.txt');
					  }
					});
				});
	}
	
	function appendFile2(token, message, OutputDir){
		if(!OutputDir){
		OutputDir = './debug';
		}
		FileManagerUtil.mkDirSync(OutputDir);
		var filename = OutputDir+'/'+token+'.txt';
		fs.appendFileSync(OutputDir+'/'+token+'.txt', message);
	}
	
	
	module.exports = {
			writeJson: writeJson,
			writeTxt: writeTxt,
			appendFile:appendFile,
			appendFile1:appendFile1,
			appendFile2:appendFile2,
			writeJson2: writeJson2,
			writeJson3: writeJson3
	}
	
	
})();
