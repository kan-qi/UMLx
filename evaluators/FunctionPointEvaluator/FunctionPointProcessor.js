(function(){
	/*
	* Implementing the specific rules to identify the elements.
	*/
	var pathPatternMatchUtil = require("../../utils/TransactionPatternMatchUtil.js");

	var functionalPatterns = [
		[ 'boundary[+]', 'control[+]', 'entity[+]', 'pattern#1', 'EI', 'functional', 'External Input' ],
		[ 'boundary[+]', 'control[+]', 'entity[+]', 'control[+]', 'pattern#2', 'EI', 'functional', 'External Input' ],
		[ 'boundary[+]', 'entity[+]', 'control[+]', 'pattern#3', 'EI', 'functional', 'External Input' ],
		[ 'boundary[+]', 'entity[+]', 'control[+]', 'entity[+]', 'pattern#4', 'EI', 'functional', 'External Input' ],
		[ 'boundary[+]', 'control[+]', 'boundary[+]', 'pattern#5', 'EQ', 'functional', 'External Inquiry' ],
		[ 'boundary[+]', 'control[+]', 'pattern#6', 'EI', 'functional', 'External Input' ],
		[ 'boundary[+]', 'entity[+]', 'pattern#7', 'EI', 'functional', 'External Input' ],
		[ 'boundary[+]', 'pattern#8', 'EQ', 'functional', 'External Inquiry' ],
		[ 'boundary[+]', 'entity[+]', 'boundary[+]', 'pattern#9', 'EQ', 'functional', 'External Inquiry' ],
		[ 'entity[+]', 'control[+]', 'boundary[+]', 'pattern#10', 'EO', 'functional', 'External Output' ],
		[ 'entity[+]', 'boundary[+]', 'pattern#11', 'EO', 'functional', 'External Output' ],
		[ 'entity[+]', 'control[+]', 'entity[+]', 'boundary[+]', 'pattern#12', 'EO', 'functional', 'External Output' ],
		[ 'entity[+]', 'control[+]', 'entity[+]', 'pattern#13', 'EI', 'functional', 'External Input' ],
		[ 'entity[+]', 'control[+]', 'pattern#14', 'EO', 'functional', 'External Output' ],
		[ 'control[+]', 'entity[+]', 'boundary[+]', 'pattern#15', 'EO', 'functional', 'External Output' ],
		[ 'control[+]', 'boundary[+]', 'pattern#16', 'EO', 'functional', 'External Output' ],
		[ 'control[+]', 'entity[+]', 'pattern#17', 'EI', 'functional', 'External Input' ],
		[ 'control[+]', 'entity[+]', 'control[+]', 'boundary[+]', 'pattern#18', 'EI', 'functional', 'External Input' ],
		[ 'control[+]', 'entity[+]', 'control[+]', 'pattern#19', 'EQ', 'functional', 'External Inquiry' ],
		[ 'control[+]', 'entity[+]', 'pattern#20', 'EI', 'functional', 'External Input' ],
	    [ 'control[+]', 'pattern#20', 'EQ', 'functional', 'External Inquiry' ],
	    [ 'entity[+]', 'pattern#21', 'EQ', 'functional', 'External Inquiry' ],
		];
	 
	var functionalPatternTreeRoot = pathPatternMatchUtil.establishPatternParseTree(functionalPatterns);
	
	module.exports = {
			// determine the type of the transaction - EI, EO, EQ
			processTransaction: function(path, usecase){
			    if(!path){
			        console.log("path is null");
			        return;
			    }

			    //console.log(path);
			    //process.exit();

				path["FPAnalytics"] = {};
				path["FPAnalytics"].Operations = {};

				if(path.Nodes.length > 0){
				    path.Nodes = path.Nodes.slice(1, path.Nodes.length);
				}
				var functionalOperations = pathPatternMatchUtil.recognizePattern(path, functionalPatternTreeRoot);
				var functionalOperationStr = "";
				for(var i=0; i < functionalOperations.length; i++){
					if(i !== 0){
						functionalOperationStr += ",";
					}
					functionalOperationStr += functionalOperations[i].semantics;
				}

				var typeStr = "";
				var index = 0;
				var componentNum = 0;
				while(index < path.Nodes.length){
                				var node = path.Nodes[index];
                				if(node && node.Component && node.Component.Type){
                				    if(componentNum != 0){
                                        typeStr += "->"
                				    }
                					typeStr += node.Component.Type;
                					componentNum++;
                				}
                				index ++;
                }

                path["FPAnalytics"].typeStr = typeStr;

				if(functionalOperationStr !== ''){
					path["FPAnalytics"].Functional = functionalOperationStr.split(/,/g);
				}
				else{
					path["FPAnalytics"].Functional = ['EQ'];
				}
				
				path["FPAnalytics"].FunctionalTag = path["FPAnalytics"].Functional.join(',');

				path["FPAnalytics"].DET = path['TransactionAnalytics'].DETs;
		        path["FPAnalytics"].FTR = path['TransactionAnalytics'].TC; //the associated number of class file

                //do a round of counting of elements of different types: boundary, control, entity.

                var boundaries = 0;
                var controls = 0;
                var entities = 0;

                for(var i in path.Nodes){
                    var node = path.Nodes[i];
                    var type = node.Component.Type;
                    if(type === "boundary"){
                        boundaries++;
                    }
                    else if(type === "control"){
                        controls++;
                    }
                    else{
                        entities++;
                    }
                }

                path["FPAnalytics"].boundaries = boundaries;
                path["FPAnalytics"].controls = controls;
                path["FPAnalytics"].entities = entities;
			},
			// determine the type of the domain elements - ILF, EIF
			processElement: function(element, domainModel){
				// determine if the element is the duplicate of a existing one, if it is, keep the one that is more complex: OutboundNumber+InboundNumber
				// some of the element may not have type. just filter out the element.
				element['FPAnalytics'] = {};
				if(element.Type === "boundary"){
					element["FPAnalytics"].EIF = true;
				}
				else{
					element["FPAnalytics"].ILF = true;
				}
				
			}
	}
})();
