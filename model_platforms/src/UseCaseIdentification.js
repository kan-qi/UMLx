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
    const uuidV4 = require('uuid/v4');
    var FileManagerUtil = require("../../utils/FileManagerUtils.js");
    var androidLogUtil = require("../../utils/AndroidLogUtil.js");

	var kdmModelDrawer = require("./KDMModelDrawer.js");


// should directly analysis the inter-component control flow on top of the soot-cfg.

    function identifyUseCasesfromCFG(dicComponents, dicClassComponent, dicMethodClass, dicResponseMethodUnits, dicMethodUnits, dicClassUnits, icfg, ModelOutputDir, ModelAccessDir, domainElementsByID){

		var UseCases = [];

		if(!icfg){
		    return UseCases;
		}

		icfg = FileManagerUtil.readJSONSync(icfg);

		var UseCase = {
				_id: "src",
				Name: "src",
				PrecedenceRelations : [],
				Activities : [],
				Transactions: [],
				OutputDir : ModelOutputDir+"/src",
				AccessDir : ModelAccessDir+"/src",
				DiagramType : "none"
		}

//		function establishHyperControlFlow(dicComponents, dicClassComponent, dicMethodClass, dicResponseMethodUnits, dicMethods, disClassUnits, cfgGraph, outputDir){
//        		var edges = [];
//        		var nodes = [];

        		var methodSequences = [];

        		function expandMethod(methodUnitUUID, cfgGraph, dicMethods, expandedMethods){

                		var methodSequence = [];

                			var calledMethods = findCalledMethodsForMethod(methodUnitUUID, cfgGraph, dicMethods);
                			expandedMethods[methodUnitUUID] = 1;

//                			console.log(calls);

                			for(var i in calledMethods){
                			var calledMethod = calledMethods[i];

                			methodSequence.push({
                			methodUnit: calledMethod
                			});

                			if(!expandedMethods[calledMethod.UUID]){
                			var result = expandMethod(calledMethod.UUID, cfgGraph, dicMethods, expandedMethods);
                			methodSequence = methodSequence.concat(result);
                			}
                		}

                		return methodSequence;
                }

                	/*
                	 * this function will exclude the calls within another function
                	 */
                	function findCalledMethodsForMethod(methodUnitUUID, cfgGraph, dicMethods){
//                		var calls = [];

//                		for(var i in cfgGraph.edges){
//                			var edge = cfgGraph.edges[i];
//                			if(edge.start.UUID === methodUnit.UUID){
//                				calls.push({action:dicMethods[edge.start.UUID], methodUnit:dicMethods[edge.end.UUID]});
//                			}
//                		}

//                        console.log(cfgGraph);

                        var calledMethods = [];

                        if(cfgGraph[methodUnitUUID]){
                        for(var i in cfgGraph[methodUnitUUID].calls){
//                        if(!cfgGraph[methodUnitUUID]){
//                            return [];
//                        }
//                        else{
//                		    return cfgGraph[methodUnitUUID].calls;
//                		}
                                var calledMethod = dicMethods[cfgGraph[methodUnitUUID].calls[i]];
                                if(calledMethod){
                                       calledMethods.push(calledMethod);
                                }
                           }
                		}

                		return calledMethods;
                	}

        		for(var i in dicResponseMethodUnits){
        			var responseMethod = dicResponseMethodUnits[i];
        			var methodSequence = [];
        			methodSequence.push({
        				action:"response",
        				methodUnit: responseMethod
        			});
        			var expandedMethods = expandMethod(responseMethod.UUID, icfg, dicMethodUnits,{});
        			methodSequence = methodSequence.concat(expandedMethods);
        			methodSequences.push(methodSequence)

        		}

//        		console.log(methodSequences);
//        		process.exit();

//        		var nodes = [];
//        		var nodesByID = {};


		var activities = [];
		var activitiesByID = {};

		var precedenceRelations = [];
//		var precedenceRelationsByIDs = {};

		var transactions = [];

        		var methodSequenceProfile = [];
                // each method sequence is defined as a transaction and each transaction has a stimulus
        		for(var i in methodSequences){
        			var methodSequence = methodSequences[i];

                    //create a stimulus node for the response node.
                    stimulus = {
                            Name: uuidV4()+"_stm",
                                                                                                                     					_id: uuidV4(),
                                                                                                                     					Type: "activity",
                                                                                                                     					Stimulus: true,
                                                                                                                     					OutScope: true,
                                                                                                                     					Group: "User",
                                                                                                                     					Component: {
                                                                                                                     					  type: "actor",
                                                                                                                                                            						    _id: uuidV4()
                                                                                                                     					}
                                                                                                                     			}


        			var preActivity = stimulus;
        			var preDomainElement = stimulus.Component;

        			var methodSequenceP = {};

        			var transaction = {
        			Nodes: [],
        			OutScope: false
        			};

        			transaction.Nodes.push(stimulus);

        			for(var j in methodSequence){
        				var action = methodSequence[j].action;
        				var targetMethodUnit = methodSequence[j].methodUnit;
        				var targetClassUnitUUID = dicMethodClass[targetMethodUnit.UUID];
        				var targetComponent = dicComponents[dicClassComponent[targetClassUnitUUID]];
                        var targetClassUnit = dicClassUnits[targetClassUnitUUID]

                        methodSequenceP[j] = {
                          mtd: targetMethodUnit.signature.name,
                          cls: targetClassUnit ? targetClassUnit.name : "",
                          cmp: targetComponent.name
                        }

        				if(!targetComponent){
        					continue;
        				}

//        				var node = nodesByID[targetMethodUnit.UUID];
//        				if(!node){
//        					node = {
//        							name: targetComponent.name+"_"+targetMethodUnit.signature.name,
//        							isResponse: action === "response" ? true : false,
//        							component: {
//        								UUID: targetComponent.UUID
//        							},
//        							trigger: action,
//        							UUID: targetMethodUnit.UUID
//        					};
//        					nodes.push(node);
//        					nodesByID[node.UUID] = node;
//        				}


        				var domainElement = domainElementsByID["c"+targetComponent.UUID.replace(/\-/g, "_")];

        				if(!domainElement){
        				continue;
        				}

//                        if(!preActivity){
//                                    var activityID = "a"+targetMethodUnit['UUID'].replace(/\-/g, "_");
//
//                                                            var activity = activitiesByID[activityID];
//                                                            if(!activity){
//                                                            	activity = {
//                                                            					Name: targetComponent.name+"_"+targetMethodUnit.signature.name,
//                                                            					_id: activityID,
//                                                            					Type: "activity",
//                                                            					isResponse: action === "response" ? true : false,
//                                    //                        					Stimulus: node.type === "stimulus" ? true: false,
//                                                            					OutScope: false,
//                                                            					Group: "System",
//                                                            					Component: domainElement
//                                                            			}
//
//                                                            			activitiesByID[activity._id] = activity;
//
//                        			                                    activities.push(activity);
//                                                            }
//
//        				            transaction.Nodes.push(activity);
//
//        				            preActivity = activity;
//        				            preDomainElement = domainElement;
//
//                        }
//        				else if(preActivity && preDomainElement != domainElement){
                        if(preDomainElement != domainElement){
                        			 var activityID = "a"+targetMethodUnit['UUID'].replace(/\-/g, "_");

                                                                                                var activity = activitiesByID[activityID];
                                                                                                if(!activity){
                                                                                                	activity = {
                                                                                                					Name: targetComponent.name+"_"+targetMethodUnit.signature.name,
                                                                                                					_id: activityID,
                                                                                                					Type: "activity",
                                                                                                					isResponse: action === "response" ? true : false,
                                                                        //                        					Stimulus: node.type === "stimulus" ? true: false,
                                                                                                					OutScope: false,
                                                                                                					Group: "System",
                                                                                                					Component: domainElement
                                                                                                			}

                                                                                                			activitiesByID[activity._id] = activity;
                                                                                                }
                                   activities.push(activity);

        				           transaction.Nodes.push(activity);
        				           precedenceRelations.push({start: preActivity, end: activity});
                                    preActivity = activity;
                                     preDomainElement = domainElement;
        				}

        			}

        			transactions.push(transaction);

        			methodSequenceProfile.push(methodSequenceP);
        		}

        		var debug = require("../../utils/DebuggerOutput.js");
        		debug.writeJson2("identified_method_sequences", methodSequenceProfile);

        //		var cfg = identifyStimuli(nodes, edges);


        		kdmModelDrawer.drawGraph(precedenceRelations, activities, ModelOutputDir, "kdm_cfg_graph.dotty");

//        		return {
//        		    nodes: nodes,
//        		    edges: edges
//        		}
//        	}
//
//        var hcfg = establishHyperControlFlow(dicComponents, dicClassComponent, dicMethodClass, dicResponseMethodUnits, dicMethodUnits, dicClassUnits, icfg, ModelOutputDir);
//		var nodes = hcfg.nodes;
//		var edges = hcfg.edges;


//		for(var i in nodes){
//			var node = nodes[i];
//
//			var domainElement = null;
//
//			if(node.component){
//				domainElement = domainElementsByID["c"+node.component.UUID.replace(/\-/g, "_")];
//			}
//
//			var activity = {
//					Name: node['name'],
//					_id: "a"+node['UUID'].replace(/\-/g, "_"),
//					Type: "activity",
//					isResponse: node.isResponse,
//					Stimulus: node.type === "stimulus" ? true: false,
//					OutScope: false,
//					Group: "System",
//					Component: domainElement
//			}
//
//			activities.push(activity);
//			activitiesByID[activity._id] = activity;
//		}
//
//		var precedenceRelations = [];
//
//		for(var i in edges){
//			var edge = edges[i];
//
//			var startId = "a"+edge.start.UUID.replace(/\-/g, "_");
//			var endId = "a"+edge.end.UUID.replace(/\-/g, "_");
//
//			var start = activitiesByID[startId];
//			var end = activitiesByID[endId];
//
//			if(!start || !end){
//				continue;
//			}
//
//			precedenceRelations.push({start: start, end: end});
//		}

		UseCase.Activities = UseCase.Activities.concat(activities);
		UseCase.PrecedenceRelations = UseCase.PrecedenceRelations.concat(precedenceRelations);
		UseCase.Transactions = UseCase.Transactions.concat(transactions);

		UseCases.push(UseCase);

		return UseCases;

	}


//function traverseUseCaseForTransactions(useCase){
//
//		function isCycled(path){
//			var lastNode = path[path.length-1];
//				for(var i=0; i < path.length-1; i++){
//					if(path[i] == lastNode){
//						return true;
//					}
//				}
//			return false;
//		}
//
//			var toExpandCollection = new Array();
//
//			for (var j in useCase.Activities){
//				var activity = useCase.Activities[j];
//				//define the node structure to keep the infor while traversing the graph
//				if(activity.Stimulus){
//				var node = {
//					//id: startElement, //ElementGUID
//					Node: activity,
//					PathToNode: [activity],
//					OutScope: activity.OutScope
//				};
//				toExpandCollection.push(node);
//				}
//			}
//
//			var Paths = new Array();
//			var toExpand;
//
//			while((toExpand = toExpandCollection.pop()) != null){
//				console.log("path searching...");
//				var node = toExpand.Node;
//				var pathToNode = toExpand.PathToNode;
//
//					var childNodes = [];
//					for(var j in useCase.PrecedenceRelations){
//						var edge = useCase.PrecedenceRelations[j];
//						if(edge.start == node){
//							childNodes.push(edge.end);
//						}
//					}
//
//				if(childNodes.length == 0){
//					Paths.push({Nodes: pathToNode, OutScope: toExpand.OutScope});
//				}
//				else{
//					for(var j in childNodes){
//						var childNode = childNodes[j];
//						if(!childNode){
//							continue;
//						}
//
//						var OutScope = false;
//						if(toExpand.OutScope||childNode.OutScope){
//							OutScope = true;
//						}
//
//						var toExpandNode = {
//							Node: childNode,
//							PathToNode: pathToNode.concat(childNode),
//							OutScope: OutScope
//						}
//
//						if(!isCycled(toExpandNode.PathToNode) && childNode.Group === "System"){
//						toExpandCollection.push(toExpandNode);
//						}
//						else{
//						Paths.push({Nodes: toExpandNode.PathToNode, OutScope: toExpandNode.OutScope});
//						}
//					}
//				}
//
//
//			}
//
//			//eliminate the duplicates
//			var pathsByString = {};
//			var uniquePaths = [];
//			for(var i in Paths){
//				path = Paths[i];
//				var pathString = "";
//				for(var j in path.Nodes){
//					var node = path.Nodes[j];
//					pathString += node._id;
//				}
//				if(!pathsByString[pathString]){
//					pathsByString[pathString] = 1;
//					uniquePaths.push(path);
//				}
//				else{
//				console.log("duplicate");
//				}
//			}
//
//			return uniquePaths;
//	}


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
                        if(activitiesByID[node._id]){
						activities.push(node);
						activitiesByID[node._id] = node;
						}
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
