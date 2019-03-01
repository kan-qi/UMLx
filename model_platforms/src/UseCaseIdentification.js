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

			var startId = "a"+edge.start.UUID.replace(/\-/g, "_");
			var endId = "a"+edge.end.UUID.replace(/\-/g, "_");

			var start = activitiesByID[startId];
			var end = activitiesByID[endId];
			
			if(!start || !end){
				continue;
			}

			precedenceRelations.push({start: start, end: end});
		}

		UseCase.Activities = UseCase.Activities.concat(activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);

		UseCases.push(UseCase);

		return UseCases;

	}
    
  function identifyUseCasesfromAndroidLog(dicComponent, dicComponentDomainElement, dicResponseMethodUnits, ModelOutputDir, ModelAccessDir, androidLogPath, useCaseRecordPath, callback){
		
		var UseCases = [];
		

		if(!useCaseRecordPath){
			return UseCases;
		}
		
		var useCaseRecords = FileManagerUtil.readFileSync(useCaseRecordPath).split(/\r?\n/g);
		
		var useCaseRecordList = [];
		
		
		for(var i = 0; i < useCaseRecords.length; i++){
			
			var useCaseRecord = useCaseRecords[i];
			
			var tagPos = useCaseRecord.indexOf(" Start ") == -1? useCaseRecord.indexOf(" start ") : useCaseRecord.indexOf(" Start ");
			
	    	if(tagPos == -1){
	    		continue;
	    	}
	    	
	    	var startTime = new Date(useCaseRecord.substring(0, tagPos)).getTime();
	    	var useCaseName = useCaseRecord.substring(tagPos+7, useCaseRecord.length);
	    	
	    	if(!useCaseName){
	    		continue;
	    	}
	    	
	    	var nextUseCaseRecord = useCaseRecords[++i];
	    	
	    	tagPos = nextUseCaseRecord.indexOf(" End ") == -1? nextUseCaseRecord.indexOf(" end ") : nextUseCaseRecord.indexOf(" End ");
	    	
	    	if(tagPos == -1){
	    		console.log("tag doesn't match as pairs");
	    		i--;
	    		continue;
	    	}
	    	
	    	var endTime = new Date(nextUseCaseRecord.substring(0, tagPos)).getTime();
	    	
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
	    
		}

			androidLogUtil.identifyTransactions(androidLogPath, dicComponent, dicComponentDomainElement, dicResponseMethodUnits, useCaseRecordList, function(useCaseData){
//
//				console.log(useCaseData);
//				process.exit();
//				
				for(var i in useCaseData){
				var useCaseRecord = useCaseData[i];
				
				var UseCase = {
						_id: useCaseRecord.useCaseName,
						Name: useCaseRecord.useCaseName,
						PrecedenceRelations : [],
						Activities : [],
						OutputDir : ModelOutputDir+"/"+useCaseRecord.useCaseName,
						AccessDir : ModelAccessDir+"/"+useCaseRecord.useCaseName,
						DiagramType : "none",
						Transactions: []
				}

				var activities = [];
				var activitiesByID = {}
				var precedenceRelations = [];
				

				for(var j in useCaseRecord.transactions){
					var transaction = useCaseRecord.transactions[j];
					var prevNode = null;
					for(var k in transaction.Nodes){
						var node = transaction.Nodes[k];
					
						activities.push(node);
						activitiesByID[node._id] = node;
						if(prevNode){
							precedenceRelations.push({start: prevNode, end: node});
						}
						prevNode = node;
					}
					UseCase.Transactions.push(transaction);
				}

				UseCase.Activities = UseCase.Activities.concat(activities);
				UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);
				
				UseCases.push(UseCase);
				}
				
				
				if(callback){
            		callback(UseCases);
            	}
			});


	}

	module.exports = {
			identifyUseCasesfromCFG: identifyUseCasesfromCFG,
			identifyUseCasesfromAndroidLog: identifyUseCasesfromAndroidLog
	}
}());
