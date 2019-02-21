/**
 *
 */

(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	var util = require('util');
    const uuidv4 = require('uuid/v4');
    var FileManagerUtil = require("../../utils/FileManagerUtils.js");
    var androidLogUtil = require("../../utils/AndroidLogUtil.js");

    function identifyUseCasesfromCFG(cfgGraph, ModelOutputDir, ModelAccessDir, domainElementsByID){

		var UseCases = [];

		var UseCase = {
				_id: "src",
				Name: "src",
				PrecedenceRelations : [],
				Activities : [],
				OutputDir : ModelOutputDir+"/src",
				AccessDir : ModelAccessDir+"/src",
				DiagramType : "none"
		}

		var nodes = cfgGraph.nodes;
		var edges = cfgGraph.edges;

		var activities = [];
		var activitiesByID = {}

		for(var i in nodes){
			var node = nodes[i];

			var domainElement = null;

			if(node.component){
				domainElement = domainElementsByID["c"+node.component.UUID.replace(/\-/g, "_")];
			}

			var activity = {
					Name: node['name'],
					_id: "a"+node['UUID'].replace(/\-/g, "_"),
					Type: "activity",
					isResponse: node.isResponse,
					Stimulus: node.type === "stimulus" ? true: false,
					OutScope: false,
					Group: "System",
					Component: domainElement
			}

			activities.push(activity);
			activitiesByID[activity._id] = activity;
		}

		var precedenceRelations = [];

		for(var i in edges){
			var edge = edges[i];

			console.log("edge");
			console.log(edge);

			var startId = "a"+edge.start.UUID.replace(/\-/g, "_");
			var endId = "a"+edge.end.UUID.replace(/\-/g, "_");

			var start = activitiesByID[startId];
			var end = activitiesByID[endId];
			
			if(!start || !end){
				continue;
			}

			console.log("push edge");
			precedenceRelations.push({start: start, end: end});
		}

		UseCase.Activities = UseCase.Activities.concat(activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);

		UseCases.push(UseCase);

		return UseCases;

	}
    
  function identifyUseCasesfromAndroidLog(dicComponent, dicComponentDomainElement, dicResponseMethodUnits, ModelOutputDir, ModelAccessDir, androidLogPath, useCaseRecordPath, callback){
		
//		var androidLogPath = "./data/GitAndroidAnalysis/android-demo-log.txt"	;
	  
//
//		console.log(androidLogPath);
//		process.exit(0);
//		
		var UseCases = [];
		

		if(!useCaseRecordPath){
			return UseCases;
		}
		
		var useCaseRecords = FileManagerUtil.readFileSync(useCaseRecordPath).split(/\r?\n/g);
		
		var useCaseRecordList = [];
		
		
		for(var i = 0; i < useCaseRecords.length; i++){
			
			var useCaseRecord = useCaseRecords[i];
			
			var tagPos = useCaseRecord.indexOf(" Start ");
	    	
	    	if(tagPos == -1){
	    		continue;
	    	}
	    	
	    	var startTime = new Date(useCaseRecord.substring(0, tagPos)).getTime();
	    	var useCaseName = useCaseRecord.substring(tagPos+7, useCaseRecord.length);
	    	
//	    	console.log("use case record:");
//	    	console.log(startTime);
//	    	console.log(useCaseName);
	    	
	    	var nextUseCaseRecord = useCaseRecords[++i];
	    	
	    	tagPos = nextUseCaseRecord.indexOf(" End ");
	    	
	    	if(tagPos == -1){
	    		console.log("tag doesn't match as pairs");
	    		i--;
	    		continue;
	    	}
	    	
	    	var endTime = new Date(nextUseCaseRecord.substring(0, tagPos)).getTime();
	    	
//	    	console.log(endTime);
	    	
	    	if(useCaseName !== nextUseCaseRecord.substring(tagPos+5, nextUseCaseRecord.length)){
	    		console.log("tag doesn't match as pairs");
	    		i--;
	    		continue;
	    	}
	    	
	    	useCaseRecordList.push({
	    		useCaseName: useCaseName,
	    		startTime: startTime,
	    		endTime: endTime
	    	});
	    	
		
//			var UseCase = {
//					_id: useCaseName,
//					Name: useCaseName,
//					PrecedenceRelations : [],
//					Activities : [],
//					OutputDir : ModelOutputDir+"/"+useCaseName,
//					AccessDir : ModelAccessDir+"/"+useCaseName,
//					DiagramType : "none"
//			}
//
//			var activities = [];
//			var activitiesByID = {}
//			var precedenceRelations = [];
			
			
//		var transactions = androidLogUtil.identifyTransactions(androidLogPath, dicComponent, startTime, endTime);
//		
////		console.log("dicComponent");
////		console.log(dicComponent);
//		console.log("identified transactions");
//		console.log(transactions);
//		process.exit(0);
//
//		for(var i in transactions){
//			var transaction = transactions[i];
//		var prevNode = null;
//		for(var j in transaction.Nodes){
//			var node = transaction.Nodes[j];
//
//			activities.push(node);
//			activitiesByID[node._id] = node;
//			if(prevNode){
//				precedenceRelations.push({start: prevNode, end: node});
//			}
//			prevNode = node;
//		}
//		}
//
//		UseCase.Activities = UseCase.Activities.concat(activities);
//		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);
//
//		UseCases.push(UseCase);
	    	
		}

//		return UseCases;
		
		
		function identifyUseCase(useCaseRecord){
			return new Promise((resolve, reject) => {
			androidLogUtil.identifyTransactions(androidLogPath, dicComponent, dicComponentDomainElement, dicResponseMethodUnits, useCaseRecord.startTime, useCaseRecord.endTime, function(transactions){
				
//		    	process.exit(0);
		    	
				var UseCase = {
						_id: useCaseRecord.useCaseName,
						Name: useCaseRecord.useCaseName,
						PrecedenceRelations : [],
						Activities : [],
						OutputDir : ModelOutputDir+"/"+useCaseRecord.useCaseName,
						AccessDir : ModelAccessDir+"/"+useCaseRecord.useCaseName,
						DiagramType : "none"
				}

				var activities = [];
				var activitiesByID = {}
				var precedenceRelations = [];
				
//				console.log("dicComponent");
//				console.log(dicComponent);
//				console.log("identified transactions");
//				console.log(transactions);
//				process.exit(0);

				for(var i in transactions){
					var transaction = transactions[i];
					var prevNode = null;
					for(var j in transaction.Nodes){
						var node = transaction.Nodes[j];
					
						activities.push(node);
						activitiesByID[node._id] = node;
						if(prevNode){
							precedenceRelations.push({start: prevNode, end: node});
						}
						prevNode = node;
					}
				}

				UseCase.Activities = UseCase.Activities.concat(activities);
				UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);
				
//				console.log(UseCase);
//            	process.exit(0);

				UseCases.push(UseCase);
				
				resolve();
				
			});
			});
		}
		
		
//		console.log("use case list");
//		console.log(useCaseRecordList);
//		process.exit(0);
		
		 return Promise.all(useCaseRecordList.map(useCaseRecord=>{
		        return identifyUseCase(useCaseRecord);
		    })).then(
		        function(){
					console.log("=============Cache==============");
//					var OutputDir = global.debugOutputDir ? global.debugOutputDir : './debug';
//					for (var key in global.debugCache) {
//						mkdirp(OutputDir, function(err) { 
//							fs.writeFile(key, global.debugCache[key], function(err){
//								if(err){
//									console.log(err);
//								}
//							});
//							});
//						}
					console.log("Finish write debug cache in files");
		            return new Promise((resolve, reject) => {
		                setTimeout(function(){
		                	console.log("analysis finished");
		                	if(callback){
		                		callback(UseCases);
		                	}
//		                	console.log(UseCases);
//		                	process.exit(0);
		                    resolve();
		                }, 0);
		            });
		        }

		    ).catch(function(err){
		        console.log(err);
		    });


	}

	module.exports = {
			identifyUseCasesfromCFG: identifyUseCasesfromCFG,
			identifyUseCasesfromAndroidLog: identifyUseCasesfromAndroidLog
	}
}());
