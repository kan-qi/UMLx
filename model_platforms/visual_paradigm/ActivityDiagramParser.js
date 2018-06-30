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
    	
    	for(var i in XMIActivityDiagrams){
    		
    	XMIActivityDiagram = XMIActivityDiagrams[i];
    	
    	var UseCase = {
				_id: XMIActivityDiagram['$']['xmi:id'],
				Name: XMIActivityDiagram['$']['name'],
				PrecedenceRelations : [],
				Activities : [],
				OutputDir : Model.OutputDir+"/"+XMIActivityDiagram['$']['xmi:id'],
				AccessDir : Model.AccessDir+"/"+XMIActivityDiagram['$']['xmi:id'],
		}
    	
    	var XMIActivitiesReferenced = jp.query(XMIActivityDiagram, '$..[\'uml:DiagramElement\'][?(@[\'$\'][\'subject\'])]');

        console.log("Parsing activity diagram: visual paradigm");
        console.log(XMIActivitiesReferenced);
        var Activities = [];
        var PrecedenceRelations = [];
        var Partitions = [];

    	
    	for(var j in XMIActivitiesReferenced){
    		
    	var XMIActivityReferenced = XMIActivitiesReferenced[j];
    	
//        var XMIActivities = jp.query(XMIUseCase, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
        
        var XMIActivities = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:id\']==\''+XMIActivityReferenced['$']['subject']+'\')]');

        console.log("Parsing activity diagram: visual paradigm");
        console.log(XMIActivitiesReferenced);
        
        if(!XMIActivities[0]){
        	continue;
        }
        
            console.log("Found an activity");
            var XMIActivity = XMIActivities[0];
            var XMINodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\']==\'uml:CallBehaviorAction\')]');
            for (var i in XMINodes) {
                var XMINode = XMINodes[i];
                var activity = {
                    Type: "action",
                    _id: XMINode['$']['xmi:id'],
                    Name: XMINode['$']['name'],
                    Partition: (XMINode['$']['inPartition'] === undefined) ? "" : XMINode['$']['inPartition'],
                    Stimulus: false,
                    Scope: false,
                };
                Activities.push(activity);
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

            var XMIInitialNodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\']==\'uml:InitialNode\')]');
            for (var i in XMIInitialNodes) {
                var XMIInitialNode = XMIInitialNodes[i];
                var activity = {
                    Type: "initialNode",
                    _id: XMIInitialNode['$']['xmi:id'],
                    Name: (XMIInitialNode['$']['name'] === undefined) ? "" : XMIInitialNode['$']['name'],
                    Partition: (XMIInitialNode['$']['inPartition'] === undefined) ? "" : XMIInitialNode['$']['inPartition'],
                };
                Activities.push(activity);
            }

            var XMIEndNodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\']==\'uml:ActivityFinalNode\')]');
            for (var i in XMIEndNodes) {
                var XMIEndNode = XMIEndNodes[i];
                var activity = {
                    Type: "finalNode",
                    _id: XMIEndNode['$']['xmi:id'],
                    Name: (XMIEndNode['$']['name'] === undefined) ? "" : XMIEndNode['$']['name'],
                    Partition: (XMIEndNode['$']['inPartition'] === undefined) ? "" : XMIEndNode['$']['inPartition'],
                };
                Activities.push(activity);
            }

            var XMIForkNodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\']==\'uml:ForkNode\')]');
            for (var i in XMIForkNodes) {
                var XMIForkNode = XMIForkNodes[i];
                var activity = {
                    Type: "forkNode",
                    _id: XMIForkNode['$']['xmi:id'],
                    Name: (XMIForkNode['$']['name'] === undefined) ? "" : XMIForkNode['$']['name'],
                    Partition: (XMIForkNode['$']['inPartition'] === undefined) ? "" : XMIForkNode['$']['inPartition'],
                };
                Activities.push(activity);
            }

            var XMIJoinNodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\']==\'uml:JoinNode\')]')
            for (var i in XMIJoinNodes) {
                var XMIJoinNode = XMIJoinNodes[i];
                var activity = {
                    Type: "joinNode",
                    _id: XMIJoinNode['$']['xmi:id'],
                    Name: (XMIJoinNode['$']['name'] === undefined) ? "" : XMIJoinNode['$']['name'],
                    Partition: (XMIJoinNode['$']['inPartition'] === undefined) ? "" : XMIJoinNode['$']['inPartition'],
                }
                Activities.push(activity);
            }

            var XMIDecisionNodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\']==\'uml:DecisionNode\')]')
            for (var i in XMIDecisionNodes) {
                var XMIDecisionNode = XMIDecisionNodes[i];
                var activity = {
                    Type: "decisionNode",
                    _id: XMIDecisionNode['$']['xmi:id'],
                    Name: (XMIDecisionNode['$']['name'] === undefined) ? "" : XMIDecisionNode['$']['name'],
                    Partition: (XMIDecisionNode['$']['inPartition'] === undefined) ? "" : XMIDecisionNode['$']['inPartition'],
                }
                Activities.push(activity);
            }

            var XMIMergeNodes = jp.query(XMIActivity, '$..node[?(@[\'$\'][\'xmi:type\']==\'uml:MergeNode\')]')
            for (var i in XMIMergeNodes) {
                var XMIMergeNode = XMIMergeNodes[i];
                var activity = {
                    Type: "mergeNode",
                    _id: XMIMergeNode['$']['xmi:id'],
                    Name: (XMIMergeNode['$']['name'] === undefined) ? "" : XMIMergeNode['$']['name'],
                    Partition: (XMIMergeNode['$']['inPartition'] === undefined) ? "" : XMIMergeNode['$']['inPartition'],
                }
                Activities.push(activity);
            }

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
