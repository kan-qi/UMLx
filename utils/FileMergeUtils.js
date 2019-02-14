	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var uuidV1 = require('uuid/v1');
	var stringSimilarity = require('string-similarity');
	var fileManagerUtil = require("./FileManagerUtils.js");
	var path = require("path");
	
	//the log file might be very large, specical stream reader is required.
	
	var es = require('event-stream');

	function mergeFiles(){
		
//		var outputDir = "./Grading_Report";
//		var inputDir = "./Grading_Report_0_9";
//		var mergingDirs = ["./Grading_Report_10_19", "./Grading_Report_20_29", "./Grading_Report_30_39", "./Grading_Report_40_49"];
////		
//		var outputDir = "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1_1/Grading_Report";
//		var inputDir = "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1_1/Grading_Report_0_9";
//		var mergingDirs = ["C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1_1/Grading_Report_10_19", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1_1/Grading_Report_20_29", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1_1/Grading_Report_30_39", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1_1/Grading_Report_40_49"];
//		
		var outputDir = "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/Grading_Report";
		var inputDir = "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/Grading_Report_0_9";
		var mergingDirs = ["C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/Grading_Report_10_19", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/Grading_Report_20_29", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/Grading_Report_30_39", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/Grading_Report_40_49"];
		
//		//rename the files
//			fs.readdirSync(inputDir).forEach(file => {
//				var fileName = path.basename(file);
//				if(fileName.indexOf(".txt") > 0){
//					var newFileName = fileName.replace(/\.txt/g, "").trim()+".txt";
//					fs.renameSync(inputDir+"/"+fileName, inputDir+"/"+newFileName);
//				}
//			});
//		
//		return;
//		
//		
//		//rename the files
//		for(var i in mergingDirs){
//			fs.readdirSync(mergingDirs[i]).forEach(file => {
//				var fileName = path.basename(file);
//				if(fileName.indexOf(".txt") > 0){
//					var newFileName = fileName.replace(/\.txt/g, "").trim()+".txt";
//					fs.renameSync(mergingDirs[i]+"/"+fileName, mergingDirs[i]+"/"+newFileName);
//				}
//			});
//		}
//		
//		return;
		
		fs.readdirSync(inputDir).forEach(file => {
			var fileName = path.basename(file);
//			console.log(fileName);
//			console.log(file);
			
			if(fileName.indexOf("_1") > 0 || fileName.indexOf("_2") > 0  || fileName.indexOf("_3") > 0 || fileName.indexOf("_4") > 0 ){
				return;
			}
			
			var mergingFilePaths = [];
			
			var inputFilePath = inputDir+"/"+file;
			
			mergingFilePaths.push(inputFilePath);
			
			if(fileManagerUtil.existsSync(inputFilePath.replace(/\.txt/g, "")+"_1"+".txt")){
				mergingFilePaths.push(inputFilePath.replace(/\.txt/g,"")+"_1"+".txt");
			}
			
			if(fileManagerUtil.existsSync(inputFilePath.replace(/\.txt/g,"")+"_2"+".txt")){
				mergingFilePaths.push(inputFilePath.replace(/\.txt/g,"")+"_2"+".txt");
			}
			
			if(fileManagerUtil.existsSync(inputFilePath.replace(/\.txt/g,"")+"_3"+".txt")){
				mergingFilePaths.push(inputFilePath.replace(/\.txt/g,"")+"_3"+".txt");
			}
			
			if(fileManagerUtil.existsSync(inputFilePath.replace(/\.txt/g,"")+"_4"+".txt")){
				mergingFilePaths.push(inputFilePath.replace(/\.txt/g,"")+"_4"+".txt");
			}
			
			for(var i in mergingDirs){
				var mergingFile = mergingDirs[i]+"/"+fileName;
				
				if(fileManagerUtil.existsSync(mergingFile)){
					mergingFilePaths.push(mergingFile);
				}
				
				if(fileManagerUtil.existsSync(mergingFile.replace(/\.txt/g, "")+"_1"+".txt")){
					mergingFilePaths.push(mergingFile.replace(/\.txt/g,"")+"_1"+".txt");
				}
				
				if(fileManagerUtil.existsSync(mergingFile.replace(/\.txt/g,"")+"_2"+".txt")){
					mergingFilePaths.push(mergingFile.replace(/\.txt/g,"")+"_2"+".txt");
				}
				
				if(fileManagerUtil.existsSync(mergingFile.replace(/\.txt/g,"")+"_3"+".txt")){
					mergingFilePaths.push(mergingFile.replace(/\.txt/g,"")+"_3"+".txt");
				}
				
				if(fileManagerUtil.existsSync(mergingFile.replace(/\.txt/g,"")+"_4"+".txt")){
					mergingFilePaths.push(mergingFile.replace(/\.txt/g,"")+"_4"+".txt");
				}
			}
			

			console.log(mergingFilePaths);
			
			var fileContents = fileManagerUtil.readFilesSync(mergingFilePaths);
//			console.log(fileContents);
			var fileContent = "";
			for(var i in fileContents){
				fileContent += fileContents[i]+"\n";
			}
			fileManagerUtil.writeFileSync(outputDir+"/"+fileName,fileContent)
		});
		
	}
	
	mergeFiles()
