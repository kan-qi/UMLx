/**
 * Identify use cases from the constructed CFG or Android instrumentation logs.
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

	var kdmModelDrawer = require("./KDMModelDrawer.js");


// should directly analysis the inter-component control flow on top of the soot-cfg.
    function identifyUseCasesfromCFG(dicComponents, dicClassComponent, dicMethodClass, dicResponseMethodUnits, dicMethodUnits, cfgGraph, ModelOutputDir, ModelAccessDir, domainElementsByID){

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

		function establishHyperControlFlow(dicComponents, dicClassComponent, dicMethodClass, dicResponseMethodUnits, dicMethods, cfgGraph, outputDir){
        		var edges = [];
        		var nodes = [];

        		var methodSequences = [];

        		function expandMethod(methodUnit, cfgGraph, dicMethods, expandedMethods){

                		var methodSequence = [];

                			var calls = findCallsForMethod(methodUnit, cfgGraph, dicMethods);
                			expandedMethods[methodUnit.UUID] = 1;

//                			console.log(calls);
//                			process.exit();

                			for(var i in calls){
                			var call = calls[i];

                			methodSequence.push(call);

                			if(!expandedMethods[call.methodUnit.UUID]){
                			var result = expandMethod(call.methodUnit, cfgGraph, dicMethods,expandedMethods);
                			methodSequence = methodSequence.concat(result);
                			}
                		}

                		return methodSequence;
                }

                	/*
                	 * this function will exclude the calls within another function
                	 */
                	function findCallsForMethod(methodUnit, cfgGraph, dicMethods){
                		var calls = [];

                		for(var i in cfgGraph.edges){
                			var edge = cfgGraph.edges[i];
                			if(edge.start.UUID === methodUnit.UUID){
                				calls.push({action:dicMethods[edge.start.UUID], methodUnit:dicMethods[edge.end.UUID]});
                			}
                		}

                		return calls;
                	}

        		for(var i in dicResponseMethodUnits){
        			var responseMethod = dicResponseMethodUnits[i];
        			var methodSequence = [];
        			methodSequence.push({
        				action:"response",
        				methodUnit: responseMethod
        			});
        			var expandedMethods = expandMethod(responseMethod, cfgGraph, dicMethods,{});
        			methodSequence = methodSequence.concat(expandedMethods);
        			methodSequences.push(methodSequence)

        		}

        		var nodes = [];
        		var nodesByID = {};

        		for(var i in methodSequences){
        			var methodSequence = methodSequences[i];
        			var preNode = null;
        			var preComponent = null;
        			for(var j in methodSequence){
        				var action = methodSequence[j].action;
        				var targetMethodUnit = methodSequence[j].methodUnit;
        				var targetClassUnitUUID = dicMethodClass[targetMethodUnit.UUID];
        				var targetComponent = dicComponents[dicClassComponent[targetClassUnitUUID]];

        				if(!targetComponent){
        					continue;
        				}

        				var node = nodesByID[targetMethodUnit.UUID];
        				if(!node){
        					node = {
        							name: targetComponent.name+"_"+targetMethodUnit.signature.name,
        							isResponse: action === "response" ? true : false,
        							component: {
        								UUID: targetComponent.UUID
        							},
        							trigger: action,
        							UUID: targetMethodUnit.UUID
        					};
        					nodes.push(node);
        					nodesByID[node.UUID] = node;
        				}

        				if(preNode && preComponent && preComponent != targetComponent){
        				edges.push({start: preNode, end: node});
        				}

        				preNode = node;
        				preComponent = targetComponent;
        			}
        		}

        //		var cfg = identifyStimuli(nodes, edges);


        		kdmModelDrawer.drawGraph(edges, nodes, outputDir, "kdm_cfg_graph.dotty");

        		return {
        		    nodes: nodes,
        		    edges: edges
        		}
        	}

        var cfgGraph = establishHyperControlFlow(dicComponents, dicClassComponent, dicMethodClass, dicResponseMethodUnits, dicMethodUnits, cfgGraph, ModelOutputDir);
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
		UseCase.Transactions = traverseUseCaseForTransactions(UseCase);
		UseCases.push(UseCase);

		return UseCases;
		
	}
    
    
function traverseUseCaseForTransactions(useCase){
	
		function isCycled(path){
			var lastNode = path[path.length-1];
				for(var i=0; i < path.length-1; i++){
					if(path[i] == lastNode){
						return true;
					}
				}
			return false;
		}

			var toExpandCollection = new Array();
			
			for (var j in useCase.Activities){
				var activity = useCase.Activities[j];
				//define the node structure to keep the infor while traversing the graph
				if(activity.Stimulus){
				var node = {
					//id: startElement, //ElementGUID
					Node: activity,
					PathToNode: [activity],
					OutScope: activity.OutScope
				};
				toExpandCollection.push(node);
				}
			}
			
			var Paths = new Array();
			var toExpand;
			
			while((toExpand = toExpandCollection.pop()) != null){
				console.log("path searching...");
				var node = toExpand.Node;
				var pathToNode = toExpand.PathToNode;

					var childNodes = [];
					for(var j in useCase.PrecedenceRelations){
						var edge = useCase.PrecedenceRelations[j];
						if(edge.start == node){
							childNodes.push(edge.end);
						}
					}
				
				if(childNodes.length == 0){
					Paths.push({Nodes: pathToNode, OutScope: toExpand.OutScope});
				}
				else{
					for(var j in childNodes){
						var childNode = childNodes[j];
						if(!childNode){
							continue;
						}
						
						var OutScope = false;
						if(toExpand.OutScope||childNode.OutScope){
							OutScope = true;
						}
						
						var toExpandNode = {
							Node: childNode,
							PathToNode: pathToNode.concat(childNode),
							OutScope: OutScope
						}

						if(!isCycled(toExpandNode.PathToNode) && childNode.Group === "System"){
						toExpandCollection.push(toExpandNode);
						}
						else{
						Paths.push({Nodes: toExpandNode.PathToNode, OutScope: toExpandNode.OutScope});
						}
					}		
				}
				
				
			}
			
			//eliminate the duplicates
			var pathsByString = {};
			var uniquePaths = [];
			for(var i in Paths){
				path = Paths[i];
				var pathString = "";
				for(var j in path.Nodes){
					var node = path.Nodes[j];
					pathString += node._id;
				}
				if(!pathsByString[pathString]){
					pathsByString[pathString] = 1;
					uniquePaths.push(path);
				}
				else{
				console.log("duplicate");
				}
			}

			return uniquePaths;
	}

    
  function identifyUseCasesfromAndroidLog(dicComponent, dicComponentDomainElement, dicResponseMethodUnits, ModelOutputDir, ModelAccessDir, androidLogPath, useCaseRecordPath, callback){
		
		var UseCases = [];
		

		if(!useCaseRecordPath){
			return UseCases;
		}
		
		if(FileManagerUtil.existsSync(useCaseRecordPath)){
		var useCaseRecords = FileManagerUtil.readFileSync(useCaseRecordPath).split(/\r?\n/g);
		}
		else{
			if(callback){
				callback(false);
			}
		}
		
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
				
				if(callback){
					callback(UseCases);
				}
				
				}
				
			});

	}

	module.exports = {
			identifyUseCasesfromCFG: identifyUseCasesfromCFG,
			identifyUseCasesfromAndroidLog: identifyUseCasesfromAndroidLog
	}
}());
