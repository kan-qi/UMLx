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
    
  function identifyUseCasesfromAndroidLog(dicComponent, ModelOutputDir, ModelAccessDir, androidLogPath){
		
//		var androidLogPath = "./data/GitAndroidAnalysis/android-demo-log.txt"	;
		
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

		var activities = [];
		var activitiesByID = {}
		var precedenceRelations = [];

		
		var transactions = androidLogUtil.identifyTransactions(androidLogPath, dicComponent);
		
		console.log("dicComponent");
		console.log(dicComponent);
		console.log(transactions);
//		process.exit(0);

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

		UseCases.push(UseCase);

		return UseCases;

	}

	module.exports = {
			identifyUseCasesfromCFG: identifyUseCasesfromCFG,
			identifyUseCasesfromAndroidLog: identifyUseCasesfromAndroidLog
	}
}());
