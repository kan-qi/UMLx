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
		
		var XMIActivityDiagrams = jp.query(XMIUMLModel, '$..[\'uml:Diagram\'][?(@[\'$\'][\'diagramType\']==\'ActivityDiagram\')]');
		var DiagramsByID = {};
		
	for ( var i in XMIActivityDiagrams) {

		XMIActivityDiagram = XMIActivityDiagrams[i];
		
		
		var Diagram = {
				_id : XMIActivityDiagram['$']['xmi:id'],
				Name : XMIActivityDiagram['$']['name'],
				Elements: []
			}

		var XMIActivitiesReferenced = jp.query(XMIActivityDiagram, '$..[\'uml:DiagramElement\'][?(@[\'$\'][\'subject\'])]');
		for ( var j in XMIActivitiesReferenced) {
			var XMIActivityReferenced = XMIActivitiesReferenced[j];
			Diagram.Elements.push(XMIActivityReferenced['$']['subject']);
		}
		
		DiagramsByID[Diagram._id] = Diagram;
	}

		// identify the use cases by diagrams.
		
		var XMIActivities = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');

		for ( var i in XMIActivities) {

			XMIActivity = XMIActivities[i];

//			var UseCase = {
//				_id : XMIActivityDiagram['$']['xmi:id'],
//				Name : XMIActivityDiagram['$']['name'],
//				PrecedenceRelations : [],
//				Activities : [],
//				OutputDir : Model.OutputDir + "/"
//						+ XMIActivityDiagram['$']['xmi:id'],
//				AccessDir : Model.AccessDir + "/"
//						+ XMIActivityDiagram['$']['xmi:id'],
//			}
			
			var Activities = [];
			var PrecedenceRelations = [];
			var Partitions = [];



			var XMIActions = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\'])]');
			var activity = null;
			
			for ( var j in XMIActions) {

				var XMIAction = XMIActions[j];
				
			if (XMIAction['$']['xmi:type'] == 'uml:CallBehaviorAction') {
					var XMINode = XMIAction;
					activity = {
						Type : "action",
						_id : XMINode['$']['xmi:id'],
						Name : XMINode['$']['name'],
						Partition : (XMINode['$']['inPartition'] === undefined) ? ""
								: XMINode['$']['inPartition'],
						Stimulus : false,
						Scope : false,
					};
				}  else if (XMIAction['$']['xmi:type'] == 'uml:InitialNode') {
					var XMIInitialNode = XMIAction;
					activity = {
						Type : "initialNode",
						_id : XMIInitialNode['$']['xmi:id'],
						Name : (XMIInitialNode['$']['name'] === undefined) ? ""
								: XMIInitialNode['$']['name'],
						Partition : (XMIInitialNode['$']['inPartition'] === undefined) ? ""
								: XMIInitialNode['$']['inPartition'],
					};
				} else if (XMIAction['$']['xmi:type'] == 'uml:ActivityFinalNode') {
					var XMIEndNode = XMIAction;
					activity = {
						Type : "finalNode",
						_id : XMIEndNode['$']['xmi:id'],
						Name : (XMIEndNode['$']['name'] === undefined) ? ""
								: XMIEndNode['$']['name'],
						Partition : (XMIEndNode['$']['inPartition'] === undefined) ? ""
								: XMIEndNode['$']['inPartition'],
					};
				} else if (XMIAction['$']['xmi:type'] == 'uml:ForkNode') {
					var XMIForkNode = XMIAction;
					activity = {
						Type : "forkNode",
						_id : XMIForkNode['$']['xmi:id'],
						Name : (XMIForkNode['$']['name'] === undefined) ? ""
								: XMIForkNode['$']['name'],
						Partition : (XMIForkNode['$']['inPartition'] === undefined) ? ""
								: XMIForkNode['$']['inPartition'],
					};
				} else if (XMIAction['$']['xmi:type'] == 'uml:JoinNode') {
					var XMIJoinNode = XMIAction;
					activity = {
						Type : "joinNode",
						_id : XMIJoinNode['$']['xmi:id'],
						Name : (XMIJoinNode['$']['name'] === undefined) ? ""
								: XMIJoinNode['$']['name'],
						Partition : (XMIJoinNode['$']['inPartition'] === undefined) ? ""
								: XMIJoinNode['$']['inPartition'],
					}
				} else if (XMIAction['$']['xmi:type'] == 'uml:DecisionNode') {
					var XMIDecisionNode = XMIAction;
					activity = {
						Type : "decisionNode",
						_id : XMIDecisionNode['$']['xmi:id'],
						Name : (XMIDecisionNode['$']['name'] === undefined) ? ""
								: XMIDecisionNode['$']['name'],
						Partition : (XMIDecisionNode['$']['inPartition'] === undefined) ? ""
								: XMIDecisionNode['$']['inPartition'],
					}
				} else if (XMIAction['$']['xmi:type'] == 'uml:MergeNode') {
					var XMIMergeNode = XMIAction;
					activity = {
						Type : "mergeNode",
						_id : XMIMergeNode['$']['xmi:id'],
						Name : (XMIMergeNode['$']['name'] === undefined) ? ""
								: XMIMergeNode['$']['name'],
						Partition : (XMIMergeNode['$']['inPartition'] === undefined) ? ""
								: XMIMergeNode['$']['inPartition'],
					}
				}
				
				
				Activities.push(activity);
				}
					
					var XMIEdges = jp.query(XMIActivity, '$..edge[?(@[\'$\'][\'xmi:type\'])]');
					
					 var XMIEdges = jp.query(XMIActivity, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]');
			            for (var i in XMIEdges) {
			                var XMIEdge = XMIEdges[i];
			                var XMIEdgeByStandard = {
			                    _id: XMIEdge['$']['xmi:id'],
			                    Name: (XMIEdge['$']['name'] === undefined) ? "" : XMIEdge['$']['name'],
			                    Start: XMIEdge['$']['source'],
			                    End: XMIEdge['$']['target']
			                };
			                PrecedenceRelations.push(XMIEdgeByStandard);
			          }
					
					 var XMIPartitions = jp.query(XMIActivity, '$..group[?(@[\'$\'][\'xmi:type\']==\'uml:ActivityPartition\')]');
			            for (var i in XMIPartitions) {
			                var XMIPartition = XMIPartitions[i];
			                var partition = {
			                    Type: "partition",
			                    _id: XMIPartition['$']['xmi:id'],
			                    Name: XMIPartition['$']['name']
			                }
			                Partitions.push(partition);
			            }

					
				
			
			console.log("Finished parsing activity diagram");
			
			var UseCase = {
					_id: "hello",
					Name: "hello",
					Activities : Activities,
					PrecedenceRelations : PrecedenceRelations,
					Partitions : Partitions
			}

			Model.UseCases.push(UseCase);
		}
	}

	module.exports = {
		parseActivityDiagram : parseActivityDiagram
	}
}());
