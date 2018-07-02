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

        console.log("Parsing activity diagram referenced 	: visual paradigm");
        console.log(XMIActivitiesReferenced);
        var Activities = [];
        var PrecedenceRelations = [];
        var Partitions = [];

    	
    	for(var j in XMIActivitiesReferenced){
    		
    	var XMIActivityReferenced = XMIActivitiesReferenced[j];
    	
//        var XMIActivities = jp.query(XMIUseCase, '$..packagedElement[?(@[\'$\'][\'xmi:type\']==\'uml:Activity\')]');
        
        var XMIActivities = jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:id\']==\''+XMIActivityReferenced['$']['subject']+'\' )]');
        XMIActivities = XMIActivities.concat(jp.query(XMIUMLModel, '$..node[?(@[\'$\'][\'xmi:id\']==\''+XMIActivityReferenced['$']['subject']+'\' )]'));
        
        
//        jp.query(XMIUMLModel, '$..packagedElement[?(@[\'$\'][\'xmi:id\']==\''+XMIActivityReferenced['$']['subject']+'\')]');

        console.log("Parsing activity diagram: visual paradigm");
        console.log(XMIActivities);
        
        if(!XMIActivities[0]){
        	continue;
        }
        
        var activity = null;
        
            console.log("Found an activity");
            var XMIActivity = XMIActivities[0];
            if(XMIActivity['$']['xmi:type']=='uml:Activity'){
                 var activity = {
                     Type: "action",
                     _id: XMIActivity['$']['xmi:id'],
                     Name: XMIActivity['$']['name'],
                     Partition: (XMIActivity['$']['inPartition'] === undefined) ? "" : XMIActivity['$']['inPartition'],
                     Stimulus: false,
                     Scope: false,
                 };
                 Activities.push(activity);
            }
            else if(XMIActivity['$']['xmi:type']=='uml:CallBehaviorAction'){
                var XMINode = XMIActivity;
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
else if(XMIActivity['$']['xmi:type']=='uml:ActivityPartition'){
                var XMIPartition = XMIActivity;
                var partition = {
                    Type: "partition",
                    _id: XMIPartition['$']['xmi:id'],
                    Name: XMIPartition['$']['name']
                }
                Partitions.push(partition);
} else if(XMIActivity['$']['xmi:type']=='uml:InitialNode'){
                var XMIInitialNode = XMIActivity;
                var activity = {
                    Type: "initialNode",
                    _id: XMIInitialNode['$']['xmi:id'],
                    Name: (XMIInitialNode['$']['name'] === undefined) ? "" : XMIInitialNode['$']['name'],
                    Partition: (XMIInitialNode['$']['inPartition'] === undefined) ? "" : XMIInitialNode['$']['inPartition'],
                };
                Activities.push(activity);
} else if(XMIActivity['$']['xmi:type']=='uml:ActivityFinalNode'){
                var XMIEndNode = XMIActivity;
                var activity = {
                    Type: "finalNode",
                    _id: XMIEndNode['$']['xmi:id'],
                    Name: (XMIEndNode['$']['name'] === undefined) ? "" : XMIEndNode['$']['name'],
                    Partition: (XMIEndNode['$']['inPartition'] === undefined) ? "" : XMIEndNode['$']['inPartition'],
                };
                Activities.push(activity);
} else if(XMIActivity['$']['xmi:type']=='uml:ForkNode'){
                var XMIForkNode = XMIActivity;
                var activity = {
                    Type: "forkNode",
                    _id: XMIForkNode['$']['xmi:id'],
                    Name: (XMIForkNode['$']['name'] === undefined) ? "" : XMIForkNode['$']['name'],
                    Partition: (XMIForkNode['$']['inPartition'] === undefined) ? "" : XMIForkNode['$']['inPartition'],
                };
                Activities.push(activity);
} else if(XMIActivity['$']['xmi:type']=='uml:JoinNode'){
                var XMIJoinNode = XMIActivity;
                var activity = {
                    Type: "joinNode",
                    _id: XMIJoinNode['$']['xmi:id'],
                    Name: (XMIJoinNode['$']['name'] === undefined) ? "" : XMIJoinNode['$']['name'],
                    Partition: (XMIJoinNode['$']['inPartition'] === undefined) ? "" : XMIJoinNode['$']['inPartition'],
                }
                Activities.push(activity);
} else if(XMIActivity['$']['xmi:type']=='uml:DecisionNode'){
                var XMIDecisionNode = XMIActivity;
                var activity = {
                    Type: "decisionNode",
                    _id: XMIDecisionNode['$']['xmi:id'],
                    Name: (XMIDecisionNode['$']['name'] === undefined) ? "" : XMIDecisionNode['$']['name'],
                    Partition: (XMIDecisionNode['$']['inPartition'] === undefined) ? "" : XMIDecisionNode['$']['inPartition'],
                }
                Activities.push(activity);
} else if(XMIActivity['$']['xmi:type']=='uml:MergeNode'){
                var XMIMergeNode = XMIActivity;
                var activity = {
                    Type: "mergeNode",
                    _id: XMIMergeNode['$']['xmi:id'],
                    Name: (XMIMergeNode['$']['name'] === undefined) ? "" : XMIMergeNode['$']['name'],
                    Partition: (XMIMergeNode['$']['inPartition'] === undefined) ? "" : XMIMergeNode['$']['inPartition'],
                }
                Activities.push(activity);
} else if(XMIActivity['$']['xmi:type']=='uml:ControlFlow'){
                var XMIEdge = XMIActivity;
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
