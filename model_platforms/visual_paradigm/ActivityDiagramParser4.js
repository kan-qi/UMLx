(function() {
	var fs = require('fs');
	var xml2js = require('xml2js');
	var parser = new xml2js.Parser();
	var jsonQuery = require('json-query');
	var jp = require('jsonpath');
	const uuidv4 = require('uuid/v4');

	function standardizeName(name) {
		return name.replace(/\s/g, '').toUpperCase();
	}

	function parseActivityDiagram(XMIUMLModel, Model) {
	
//	function findDiagramByActivity(action, DiagramsByID){
//		for(var i in DiagramsByID){
//			var diagram = DiagramsByID[i];
//			for(var j in diagram.Elements){
//				var element = Diagram.Elements[j];
//				if(element === action._id){
//					return diagram;
//				}
//			}
//		}
//		
//		return null;
//	}

		// identify the use cases by diagrams.
//		var Activities = [];
		var ActivitiesByID = {};
		var PrecedenceRelationsBySource = {};
				
		var XMIActivities = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');

		for ( var i in XMIActivities) {

			XMIActivity = XMIActivities[i];
			
			var PartitionsByID = {};
			
			 var XMIPartitions = jp.query(XMIActivity, '$..group[?(@[\'$\'][\'xmi:type\']==\'uml:ActivityPartition\')]');
	            for (var i in XMIPartitions) {
	                var XMIPartition = XMIPartitions[i];
	                var partition = {
	                    Type: "partition",
	                    _id: XMIPartition['$']['xmi:id'],
	                    Name: XMIPartition['$']['name']
	                }
	                PartitionsByID[partition._id] = partition.Name;
	            }

			

//			var referencedDiagram = null;
			
			var XMIActions = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\'])]');
			var activity = null;
			
			for ( var j in XMIActions) {

				var XMIAction = XMIActions[j];
				
			if (XMIAction['$']['xmi:type'] == 'uml:CallBehaviorAction') {
					var XMINode = XMIAction;
					activity = {
						Type : "uml:CallBehaviorAction",
						_id : XMINode['$']['xmi:id'],
						Name : XMINode['$']['name'],
						Partition : (PartitionsByID[XMINode['$']['inPartition']] === undefined) ? ""
								: PartitionsByID[XMINode['$']['inPartition']],
						Stimulus : false,
						Scope : true,
					};
				}  else if (XMIAction['$']['xmi:type'] == 'uml:InitialNode') {
					var XMIInitialNode = XMIAction;
					activity = {
						Type : "uml:InitialNode",
						_id : XMIInitialNode['$']['xmi:id'],
						Name : (XMIInitialNode['$']['name'] === undefined) ? ""
								: XMIInitialNode['$']['name'],
						Partition : (PartitionsByID[XMINode['$']['inPartition']] === undefined) ? ""
										: PartitionsByID[XMINode['$']['inPartition']],
						Stimulus : false,
						Scope : true,
					};
				} else if (XMIAction['$']['xmi:type'] == 'uml:ActivityFinalNode') {
					var XMIEndNode = XMIAction;
					activity = {
						Type : "uml:ActivityFinalNode",
						_id : XMIEndNode['$']['xmi:id'],
						Name : (XMIEndNode['$']['name'] === undefined) ? ""
								: XMIEndNode['$']['name'],
						Partition : (PartitionsByID[XMINode['$']['inPartition']] === undefined) ? ""
										: PartitionsByID[XMINode['$']['inPartition']],
						Stimulus : false,
						Scope : true,
					};
				} else if (XMIAction['$']['xmi:type'] == 'uml:ForkNode') {
					var XMIForkNode = XMIAction;
					activity = {
						Type : "uml:ForkNode",
						_id : XMIForkNode['$']['xmi:id'],
						Name : (XMIForkNode['$']['name'] === undefined) ? ""
								: XMIForkNode['$']['name'],
						Partition : (PartitionsByID[XMINode['$']['inPartition']] === undefined) ? ""
										: PartitionsByID[XMINode['$']['inPartition']],
					    Stimulus : false,
					    Scope : true,
					};
				} else if (XMIAction['$']['xmi:type'] == 'uml:JoinNode') {
					var XMIJoinNode = XMIAction;
					activity = {
						Type : "uml:JoinNode",
						_id : XMIJoinNode['$']['xmi:id'],
						Name : (XMIJoinNode['$']['name'] === undefined) ? ""
								: XMIJoinNode['$']['name'],
						Partition : (PartitionsByID[XMINode['$']['inPartition']] === undefined) ? ""
										: PartitionsByID[XMINode['$']['inPartition']],
					    Stimulus : false,
						Scope : true,
					}
				} else if (XMIAction['$']['xmi:type'] == 'uml:DecisionNode') {
					var XMIDecisionNode = XMIAction;
					activity = {
						Type : "uml:DecisionNode",
						_id : XMIDecisionNode['$']['xmi:id'],
						Name : (XMIDecisionNode['$']['name'] === undefined) ? ""
								: XMIDecisionNode['$']['name'],
						Partition : (PartitionsByID[XMINode['$']['inPartition']] === undefined) ? ""
										: PartitionsByID[XMINode['$']['inPartition']],
						Stimulus : false,
						Scope : true,
					}
				} else if (XMIAction['$']['xmi:type'] == 'uml:MergeNode') {
					var XMIMergeNode = XMIAction;
					activity = {
						Type : "uml:MergeNode",
						_id : XMIMergeNode['$']['xmi:id'],
						Name : (XMIMergeNode['$']['name'] === undefined) ? ""
								: XMIMergeNode['$']['name'],
						Partition : (PartitionsByID[XMINode['$']['inPartition']] === undefined) ? ""
										: PartitionsByID[XMINode['$']['inPartition']],
						Stimulus : false,
						Scope : true,
					}
				}
				
//				if(!referencedDiagram){
//					referencedDiagram = findDiagramByActivity(activity, DiagramsByID);
//				}
				
				ActivitiesByID[activity._id] = activity;
//				Activities.push(activity);
				}
					
					var XMIEdges = jp.query(XMIActivity, '$..edge[?(@[\'$\'][\'xmi:type\'])]');
					
					 var XMIEdges = jp.query(XMIActivity, '$..edge[?(@[\'$\'][\'xmi:type\']==\'uml:ControlFlow\')]');
			            for (var i in XMIEdges) {
			                var XMIEdge = XMIEdges[i];
			                var PrecedenceRelation = {
			                    _id: XMIEdge['$']['xmi:id'],
			                    Name: (XMIEdge['$']['name'] === undefined) ? "" : XMIEdge['$']['name'],
			                    start: ActivitiesByID[XMIEdge['$']['source']],
			                    end: ActivitiesByID[XMIEdge['$']['target']]
			                };
			                
			                var PrecedenceRelationsReferenced = PrecedenceRelationsBySource[XMIEdge['$']['source']];
			                if(!PrecedenceRelationsReferenced){
			                	PrecedenceRelationsReferenced = [];
			                	PrecedenceRelationsBySource[XMIEdge['$']['source']] = PrecedenceRelationsReferenced;
			                }
			                PrecedenceRelationsReferenced.push(PrecedenceRelation);
			          }
					
					
				
			
			console.log("Finished parsing activity diagram");
			
			
		}
			var XMIActivityDiagrams = jp.query(XMIUMLModel, '$..[\'uml:Diagram\'][?(@[\'$\'][\'diagramType\']==\'ActivityDiagram\')]');
			var DiagramsByID = {};
			
		for ( var i in XMIActivityDiagrams) {
			var Activities = [];
			var PrecedenceRelations = [];

			XMIActivityDiagram = XMIActivityDiagrams[i];
		
//			var Diagram = {
//					_id : XMIActivityDiagram['$']['xmi:id'],
//					Name : XMIActivityDiagram['$']['name'],
//					Elements: []
//				}

			var XMIActivitiesReferenced = jp.query(XMIActivityDiagram, '$..[\'uml:DiagramElement\'][?(@[\'$\'][\'subject\'])]');
			for ( var j in XMIActivitiesReferenced) {
				var XMIActivityReferenced = XMIActivitiesReferenced[j];
				if(ActivitiesByID[XMIActivityReferenced['$']['subject']]){
				Activities.push(ActivitiesByID[XMIActivityReferenced['$']['subject']]);
				}
				
				if(PrecedenceRelationsBySource[XMIActivityReferenced['$']['subject']]){
					PrecedenceRelations = PrecedenceRelations.concat(PrecedenceRelationsBySource[XMIActivityReferenced['$']['subject']]);
				}
			}
			
//			DiagramsByID[Diagram._id] = Diagram;
	

//			if(!referencedDiagram){
//				var uuid = uuidv4();
//				referencedDiagram = {
//						_id: uuid,
//						Name: "UC-"+uuid
//				}
//			}
			
			console.log(Activities);
			console.log(PrecedenceRelationsBySource);
			
			var ActivitiesToEliminate = [];
			//to  eliminate unnecessary activities
			for(var i in Activities){
				var activity = Activities[i];

//				console.log("determine fragement node");
//				console.log(Activities);
//				console.log(activity.Name);
				if(activity.Type === "uml:DecisionNode" || activity.Type === "uml:ActivityFinalNode" || activity.Type === "uml:InitialNode" || activity.Type === "uml:FlowFinalNode"){
//						var activityToEliminate = activity;
					ActivitiesToEliminate.push(activity);
				}
			}
			
			for(var j in ActivitiesToEliminate){
				var activityToEliminate = ActivitiesToEliminate[j];
				var outEdges = [];
				var inEdges = [];
				var leftEdges = [];
				for(var k in PrecedenceRelations){
					var precedenceRelation = PrecedenceRelations[k];
					if(precedenceRelation.end == activityToEliminate){
						inEdges.push(precedenceRelation);
					} else if(precedenceRelation.start == activityToEliminate){
						outEdges.push(precedenceRelation);
					} else {
						leftEdges.push(precedenceRelation);
					}
				}
				
				for(var k in inEdges){
					var  inEdge = inEdges[k];
					for(var l in outEdges){
						var outEdge = outEdges[l];
						 //create a new edge by triangle rules.
						leftEdges.push({start: inEdge.start, end: outEdge.end});
					}
				}
				
				Activities.splice(Activities.indexOf(activityToEliminate), 1);
				PrecedenceRelations = leftEdges;
			}
			
			//logic to decide Stimulus
			for(var j in PrecedenceRelations){
				var edge = PrecedenceRelations[j];
				 //create a new edge by triangle rules.
				if(edge.start.Partition !== "System" && edge.end.Partition === "System"){
					console.log("Stimulus...");
					console.log(edge.start);
					edge.start.Stimulus = true;
				}
			}
			
			var UseCase = {
			_id : XMIActivityDiagram['$']['xmi:id'],
			Name : XMIActivityDiagram['$']['name'],
			Activities : Activities,
			PrecedenceRelations : PrecedenceRelations,
			OutputDir : Model.OutputDir + "/"
					+ XMIActivityDiagram['$']['xmi:id'],
			AccessDir : Model.AccessDir + "/"
					+ XMIActivityDiagram['$']['xmi:id'],
			}
			Model.UseCases.push(UseCase);
		}
	}

	module.exports = {
		parseActivityDiagram : parseActivityDiagram
	}
}());
