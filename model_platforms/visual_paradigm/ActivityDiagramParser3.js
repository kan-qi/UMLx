(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');

	function standardizeName(name) {
		return name.replace(/\s/g, '').toUpperCase();
	}

	function parseActivityDiagram(XMIUMLModel, Model) {
		
		// identify the edges and setup a library of it.
		// there currently seems a bug for visual paradigm. The control flow is not stored. People need to use the function needs to use generic connector to represent the control flow.
		
		var EdgesByID = {};
//		var XMIEdges = jp.query(XMIUMLModel, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\' )]');
//		
//		for(var i in XMIEdges){
//			var XMIEdge = XMIEdges[i];
//			var edge = {
//					_id: XMIEdge['$']['xmi:id'],
//					start: XMIEdge['$']['source'],
//					end: XMIEdge['$']['target']
//			}
//			
//			EdgesBySource[edge._id] = edge;
//		}
//		

		var XMIEdges = jp.query(XMIUMLModel, '$..vpumlModel[?(@[\'$\'][\'xmi:type\']==\'GenericConnector\' )]');
		
		for(var i in XMIEdges){
		var XMIEdge = XMIEdges[i];
		var from = jp.query(XMIEdge, '$..from[?(@[\'$\'][\'idref\'])]')[0];
		var to = jp.query(XMIEdge, '$..to[?(@[\'$\'][\'idref\'])]')[0];
		
		if(!from || !to){
			continue;
		}
		
		var edge = {
				_id: XMIEdge['$']['xmi:id'],
				start: from['$']['idref'],
				end: to['$']['idref']
		}
		
		EdgesByID[edge._id] = edge;
	}
		
//		console.log("edges found");
//		console.log(XMIEdges);
//		console.log(EdgesByID);
	
		

		// identify the use cases by diagrams.
		
		var XMIActivityDiagrams = jp.query(XMIUMLModel, '$..[\'uml:Diagram\'][?(@[\'$\'][\'diagramType\']==\'ActivityDiagram\')]');

		for ( var i in XMIActivityDiagrams) {

			XMIActivityDiagram = XMIActivityDiagrams[i];

			var UseCase = {
				_id : XMIActivityDiagram['$']['xmi:id'],
				Name : XMIActivityDiagram['$']['name'],
				PrecedenceRelations : [],
				Activities : [],
				OutputDir : Model.OutputDir + "/"
						+ XMIActivityDiagram['$']['xmi:id'],
				AccessDir : Model.AccessDir + "/"
						+ XMIActivityDiagram['$']['xmi:id'],
			}

			var XMIActivitiesReferenced = jp.query(XMIActivityDiagram, '$..[\'uml:DiagramElement\'][?(@[\'$\'][\'subject\'])]');

			console.log("Parsing activity diagram referenced 	: visual paradigm");
			console.log(XMIActivitiesReferenced);
			var Activities = [];
			var PrecedenceRelations = [];
			var Partitions = [];

			for ( var j in XMIActivitiesReferenced) {

				var XMIActivityReferenced = XMIActivitiesReferenced[j];

				// var XMIActivities = jp.query(XMIUseCase,
				// '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');

				var XMIActivities = jp.query(XMIUMLModel,
						'$..packagedElement[?(@[\'$\'][\'xmi:id\']==\''
								+ XMIActivityReferenced['$']['subject']
								+ '\' )]');
				XMIActivities = XMIActivities.concat(jp.query(XMIUMLModel,
						'$..node[?(@[\'$\'][\'xmi:id\']==\''
								+ XMIActivityReferenced['$']['subject']
								+ '\' )]'));

				// jp.query(XMIUMLModel,
				// '$..packagedElement[?(@[\'$\'][\'xmi:id\']==\''+XMIActivityReferenced['$']['subject']+'\')]');

				console.log("Parsing activity diagram: visual paradigm");
				console.log(XMIActivities);

				if (!XMIActivities[0]) {
					continue;
				}

				var activity = null;

				console.log("Found an activity");
				var XMIActivity = XMIActivities[0];
				
				if (XMIActivity['$']['xmi:type'] == 'uml:Activity') {
					activity = {
						Type : "action",
						_id : XMIActivity['$']['xmi:id'],
						Name : XMIActivity['$']['name'],
						Partition : (XMIActivity['$']['inPartition'] === undefined) ? ""
								: XMIActivity['$']['inPartition'],
						Stimulus : false,
						Scope : false,
					};
				} else if (XMIActivity['$']['xmi:type'] == 'uml:CallBehaviorAction') {
					var XMINode = XMIActivity;
					activity = {
						Type : "action",
						_id : XMINode['$']['xmi:id'],
						Name : XMINode['$']['name'],
						Partition : (XMINode['$']['inPartition'] === undefined) ? ""
								: XMINode['$']['inPartition'],
						Stimulus : false,
						Scope : false,
					};
				} else if (XMIActivity['$']['xmi:type'] == 'uml:ActivityPartition') {
					var XMIPartition = XMIActivity;
					var partition = {
						Type : "partition",
						_id : XMIPartition['$']['xmi:id'],
						Name : XMIPartition['$']['name']
					}
				} else if (XMIActivity['$']['xmi:type'] == 'uml:InitialNode') {
					var XMIInitialNode = XMIActivity;
					activity = {
						Type : "initialNode",
						_id : XMIInitialNode['$']['xmi:id'],
						Name : (XMIInitialNode['$']['name'] === undefined) ? ""
								: XMIInitialNode['$']['name'],
						Partition : (XMIInitialNode['$']['inPartition'] === undefined) ? ""
								: XMIInitialNode['$']['inPartition'],
					};
				} else if (XMIActivity['$']['xmi:type'] == 'uml:ActivityFinalNode') {
					var XMIEndNode = XMIActivity;
					activity = {
						Type : "finalNode",
						_id : XMIEndNode['$']['xmi:id'],
						Name : (XMIEndNode['$']['name'] === undefined) ? ""
								: XMIEndNode['$']['name'],
						Partition : (XMIEndNode['$']['inPartition'] === undefined) ? ""
								: XMIEndNode['$']['inPartition'],
					};
				} else if (XMIActivity['$']['xmi:type'] == 'uml:ForkNode') {
					var XMIForkNode = XMIActivity;
					activity = {
						Type : "forkNode",
						_id : XMIForkNode['$']['xmi:id'],
						Name : (XMIForkNode['$']['name'] === undefined) ? ""
								: XMIForkNode['$']['name'],
						Partition : (XMIForkNode['$']['inPartition'] === undefined) ? ""
								: XMIForkNode['$']['inPartition'],
					};
				} else if (XMIActivity['$']['xmi:type'] == 'uml:JoinNode') {
					var XMIJoinNode = XMIActivity;
					activity = {
						Type : "joinNode",
						_id : XMIJoinNode['$']['xmi:id'],
						Name : (XMIJoinNode['$']['name'] === undefined) ? ""
								: XMIJoinNode['$']['name'],
						Partition : (XMIJoinNode['$']['inPartition'] === undefined) ? ""
								: XMIJoinNode['$']['inPartition'],
					}
				} else if (XMIActivity['$']['xmi:type'] == 'uml:DecisionNode') {
					var XMIDecisionNode = XMIActivity;
					activity = {
						Type : "decisionNode",
						_id : XMIDecisionNode['$']['xmi:id'],
						Name : (XMIDecisionNode['$']['name'] === undefined) ? ""
								: XMIDecisionNode['$']['name'],
						Partition : (XMIDecisionNode['$']['inPartition'] === undefined) ? ""
								: XMIDecisionNode['$']['inPartition'],
					}
				} else if (XMIActivity['$']['xmi:type'] == 'uml:MergeNode') {
					var XMIMergeNode = XMIActivity;
					activity = {
						Type : "mergeNode",
						_id : XMIMergeNode['$']['xmi:id'],
						Name : (XMIMergeNode['$']['name'] === undefined) ? ""
								: XMIMergeNode['$']['name'],
						Partition : (XMIMergeNode['$']['inPartition'] === undefined) ? ""
								: XMIMergeNode['$']['inPartition'],
					}
				
				} 
				
				if(!activity){
					continue;
				}
				
				Activities.push(activity);
				
				console.log(activity);
				
				//identify the precedence relationships by the activity fromt the edges
				for(var k in EdgesByID){
					var edge = EdgesByID[k];
					if(edge.start === activity._id){
						PrecedenceRelations.push(edge);
					}
				}
				
//				else if (XMIActivity['$']['xmi:type'] == 'uml:ControlFlow') {
//					var XMIEdge = XMIActivity;
//					var XMIEdgeByStandard = {
//						_id : XMIEdge['$']['xmi:id'],
//						Name : (XMIEdge['$']['name'] === undefined) ? ""
//								: XMIEdge['$']['name'],
//						Start : XMIEdge['$']['source'],
//						End : XMIEdge['$']['target']
//					};
//					PrecedenceRelations.push(XMIEdgeByStandard);
//				}
				
				
			}
			
			console.log("Finished parsing activity diagram");
			UseCase.Activities = Activities;
			UseCase.PrecedenceRelations = PrecedenceRelations;
			UseCase.Partitions = Partitions;

			Model.UseCases.push(UseCase);
		}
	}

	module.exports = {
		parseActivityDiagram : parseActivityDiagram
	}
}());
