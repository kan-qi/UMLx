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
//		console.log("hello");
		
//		var outputDir = "./Grading_Report";
//		var inputDir = "./Grading_Report_0_9";
//		var mergingDirs = ["./Grading_Report_10_19", "./Grading_Report_20_29", "./Grading_Report_30_39", "./Grading_Report_40_49"];
////		
//		var outputDir = "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17_1/Grading_Report";
//		var inputDir = "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17_1/Grading_Report_0_9";
//		var mergingDirs = ["C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17_1/Grading_Report_10_19", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17_1/Grading_Report_20_29", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17_1/Grading_Report_30_39", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17_1/Grading_Report_40_49"];
//		
		var outputDir = "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17/Grading_Report";
		var inputDir = "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17/Grading_Report_0_9";
		var mergingDirs = ["C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17/Grading_Report_10_19", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17/Grading_Report_20_29", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17/Grading_Report_30_39", "C:/Users/flyqk/Documents/Google Drive/2019 Spring/561/hw1/grading_report_merging_2_17/Grading_Report_40_49"];
		
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
		

		var l = 0;
		
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
			

//			console.log(mergingFilePaths);
			
//			if(fileName.indexOf("Kirk Goleniak") > -1){
//				return;
//			}
			
			var fileContents = fileManagerUtil.readFilesSync(mergingFilePaths);
//			console.log(fileContents);
			var fileContent = "";
			var losses = 0;
			var ties = 0;
			var wins = 0;
			var total = 0;
			
			var duplicates = [];
			var files = [];
			var blocks = {};
			block = "";
			
			var head = "";
			
			var linesToInspect = [];
			
			for(var i in fileContents){
				var filePath = mergingFilePaths[i];
				 var lines = fileContents[i].split(/\r?\n/g);
				 for(var j in lines){

					 var line = lines[j];
					 
					 if(line.indexOf("Executed at")>-1 || line.indexOf("The testing results for the grading test")>-1){
							head += line+"\n"
							}
							else{
								fileContent += line+"\n"
//								linesToInspect.push(line);
								
//								var line = linesToInspect[m];
								 var newblock = createBlock(line);
								 if(newblock){
								if(blocks[newblock]){
									 duplicates.push(newblock);
									 files.push(filePath);
								 }
								 else{
									 blocks[newblock] = 1;
								 }
								 }
							}
					 
					 if(line.indexOf("win")>-1){
						 wins++;
					 }
					 else if(line.indexOf("tie")>-1){
						 ties++;
					 }
					 else if(line.indexOf("lose") >-1 || line.indexOf("loss") > -1){
						 losses++;
					 }
					 	
				 	}
			}
			
			 total = losses + ties + wins;
				
				var append = "\n\n\n'Wins'\n"+
					wins+"\n"+
					"'Ties'\n"+
					ties+"\n"+
					"'Losses'\n"+
					losses;
				
				l++;
				
//				for(var m in linesToInspect){
//					var line = linesToInspect[m];
//					 var newblock = createBlock(line);
//					 if(newblock){
//					if(blocks[newblock]){
//						 duplicates.push(newblock);
//					 }
//					 else{
//						 blocks[newblock] = 1;
//					 }
//					 }
//				}
				
//			if(total != 50){
			console.log("\n"+fileName+" Wins: "+
					wins+" "+
					" Ties: "+
					ties+" "+
					" Losses: "+
					losses+" Total: "+total + " Grade: "+2*wins+" Duplicates: "+duplicates.length);
//				for(var k in duplicates){
//				console.log("...block....");
//				console.log(files[k]);
//				console.log(duplicates[k]);
//				}
//			}
			


			fileContent += fileContent+"\n";
			fileContent = head + "\n" + fileContent;
			
			fileContent += append;
				
			fileManagerUtil.writeFileSync(outputDir+"/"+fileName,fileContent)
		});
		
	}
	
	var block = "";
	function createBlock(line){
		var newblock = false;
		if(line.indexOf("Content from test case") > -1){
			if(block !== ""){
				newblock = block;
				block = "";
			}
		}
		else if(line === "" || line.indexOf("win") > -1 || line.indexOf("lose") > -1 || line.indexOf("loss") > -1|| line.indexOf("invalid") > -1 || line.indexOf("time") > -1){
			
		}
		else{
			if(block !== ""){
				block += "\n";
			}
			block += line;
		}
		
		return newblock;
	}
	
	console.log("hello");
	mergeFiles();
