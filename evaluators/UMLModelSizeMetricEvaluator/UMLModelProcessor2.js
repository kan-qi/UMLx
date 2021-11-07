/*
 * Script Name: UMLModelProcessor2.js
 * Author: kqi
 * Purpose:
 *  1. provide helper functions, for example, the graph traversal functions.
 *  2. provide classification rules for identifying specific entities.
 *  3. provide weights for calculating metrics.
 */

(function(){

	module.exports = {
			processTransaction: function(transaction, usecase){
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				var actorNum = 0;
				var TransactionStr = "";
				var i = 0;
				for(var j in transaction.Nodes)
				{
					var node = transaction.Nodes[j];

					if(node.Component){
						var component = node.Component;

						if(component.Type=="actor")actorNum++;
						if(component.Type=="boundary")boundaryNum++;
						if(component.Type=="control")controlNum++;
						if(component.Type=="entity")entityNum++;
					}

					if(i !== 0){
						TransactionStr += "-->";
					}

					TransactionStr += node.Name;

					i++

				}
				transaction.TransactionStr = TransactionStr;

				if(transaction.TransactionStr.includes("undefined")){
					console.log("undefined transactions");
					return false;
				}

				transaction.boundaryNum = boundaryNum;
				transaction.controlNum = controlNum;
				transaction.entityNum = entityNum;
				transaction.actorNum = actorNum;
				transaction.length = transaction.Nodes.length;

				return true;

			},
			processElement: function(element, usecase){
				element.Name = element.Name ? element.Name.replace(/,/gi, "") : "undefined";
				if(element.Component){
					var component = element.Component;
					element.Type = component.Type;
					element.ComponentName = component.Name;
				}


				return true;
			},
			processLink: function(link){
				return true;
			},
			identifyParents: function(element, relations){
				var parents = [];
				for(var i in relations){
					var relation = relations[i];
					if(relation.end && relation.end.UUID === element.UUID){
						parents.push(relation.start);
					}
				}
				return parents;
			},
			identifyAncestors: function(element, relations){
//				var Ancestors = [];
				var visited = {};
				var maxDepth = 0;
				var searchAncestors = function(id, relations, depth){
				if(maxDepth < depth){
					maxDepth = depth;
				}

			    var ancestors = [];
				for(var i in relations){
					var relation = relations[i];
					if(relation.end && relation.end.UUID === id && !visited[relation.start]){
						ancestors.push(relation.start.UUID);
						visited[relation.start.UUID] = 1;
						var searchedAncestors = searchAncestors(relation.start.UUID, relations, ++depth);
						for(var j in searchedAncestors){
							ancestors.push(searchedAncestors[j]);
						}
					}
				}
				return ancestors;
				}

				var ancestors = searchAncestors(element.UUID, relations, 0);

				return {
					elements: ancestors,
					depth: maxDepth
				}

			},
			identifyChildren: function(element, relations){
				var children = [];
				for(var i in relations){
					var relation = relations[i];
					if(relation.start && relation.start.UUID === element.UUID){
						children.push(relation.end);
					}
				}
				return children;
			},
			identifyOffSprings: function(element, relations){
			   // console.log("searching: ");
			   // console.log(element);
				var visited = {};
				var maxDepth = 0;

				var searchOffSprings = function(id, relations, depth){
			    if(maxDepth < depth){
			    	maxDepth = depth;
			    }
			    var offSprings = [];

				for(var i in relations){
					var relation = relations[i];
					//console.log("search path: "+relation.start.name);
					//console.log(id+ " "+relation.start.UUID);
					if(relation.start && relation.start.UUID === id && !visited[relation.end.UUID]){
						offSprings.push(relation.end.UUID);
						visited[relation.end.UUID] = 1;
						var searchedOffSprings = searchOffSprings(relation.end.UUID, relations, ++depth);
						for(var i in searchedOffSprings){
							offSprings.push(searchedOffSprings[i]);
						}
					}
				}
				return offSprings;
				}

				var offSprings = searchOffSprings(element.UUID, relations, 1);

				return {
					depth: maxDepth,
					elements: offSprings
				}
			},
		    identifyClassUnitType: function(classUnit, responseMethods, accessGraph){
                // Three class unit types are generated: view, control, entity.
                for(var i in classUnit.methodUnits){
                      var methodUnit = classUnit.methodUnits[i];
                      if(responseMethods[methodUnit.UUID]){
                            return "boundary";
                      }
                }

                if(classUnit.attrUnits.length > 0){
                    for(var i in accessGraph.edges){
                       var accessComponent = accessGraph.edges[i].start;
                       if(accessComponent.UUID === classUnit.UUID){
                            return "control";
                       }
                    }

                    return "entity";
                }
                else{
                    return "control";
                }
		    },
		    identifyInheritanceGraph: function(extendsGraph){
                var inheritanceEdges = [];
                for(var i in extendsGraph.edges){
                    var edge = extendsGraph.edges[i];
                    if(edge.start.component.type !== "interface"){
                        inheritanceEdges.push(edge);
                    }
                }
                return {edges: inheritanceEdges};
		    },
		    identifyImplementationGraph: function(extendsGraph){
                var implementationEdges = [];
                                for(var i in extendsGraph.edges){
                                    var edge = extendsGraph.edges[i];
                                    if(edge.start.component.type === "interface" || edge.start.component.type === "abstract"){
                                        implementationEdges.push(edge);
                                    }
                                }
                 return {edges: implementationEdges};
		    },
		    identifyInstanceVariables: function(cls, classUnitsByName){
		        var instanceVariables = [];
		        for(var i in cls.attrUnits){
		            var attrUnit = cls.attrUnits[i];
		            var type = attrUnit.type;
		            if(type.lastIndexOf(".")){
		                type = type.substring(type.lastIndexOf(".")+1, type.length);
		            }
//		            console.log(type);
		            if(classUnitsByName[type]){
		                instanceVariables.push(attrUnit);
		            }
		        }
		        return instanceVariables;
		    },
			identifyMethodWeights: function(mtd, accessGraph, callGraph){
			    //using the weightings schema provided in predictive object points to assess the weights for the methods.
                var numMessages = 0;
                var numProperties = 0;

                //assess the number of messages sent to the method.
                for(var i in callGraph.edges){
                    var edge = callGraph.edges[i];
                    if(edge.end.UUID === mtd.UUID){
                        numMessages++;
                    }
                }

                //assess the number of properties accessed by the method.
                for(var i in accessGraph.edges){
                    var edge = accessGraph.edges[i];
                    if(edge.start.UUID === mtd.UUID){
                        numProperties++;
                    }
                }

                var mtdWeights = [ [ '', 'x<=1', 'x>=2&&x<=6', 'x>=7' ],
                				[ 'y<=1', '12', '12', '16' ], [ 'y>=2 && y <=3', '16', '16', '16' ],
                				[ 'y>=4', '16', '20', '20' ], ];

                return assessMethodWeight(numProperties, numMessages, mtdWeights);

                function assessMethodWeight(x, y, weightingSchema){
                		var weight = 0;
                		for (var j = 1; j < weightingSchema[0].length; j++) {
                			var xCondition = weightingSchema[0][j];
                			var xEvaluationStr = "var x="
                					+ x
                					+ ";if("
                					+ xCondition
                					+ "){module.exports = true;}else{module.exports = false;}";
                			var xResult = eval(xEvaluationStr);
                			if (xResult) {
                				for (var k = 1; k < weightingSchema.length; k++) {
                					var yCondition = weightingSchema[k][0];
                					var yEvaluationStr = "var y="
                							+ y
                							+ ";if("
                							+ yCondition
                							+ "){module.exports = true;}else{module.exports = false;}";
                					var yResult = eval(yEvaluationStr);
                					// console.log(yResult);
                					if (yResult) {
                						weight = Number(weightingSchema[k][j]);
                						break;
                					}
                				}
                				break;
                			}
                		}

                		if(weight == 0){
                			weight = Number(weightingSchema[2][2]);
                		}

                		return weight;
                }

                return
			}
	}
})();
