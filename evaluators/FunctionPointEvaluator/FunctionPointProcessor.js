(function(){
	
	var pathPatternMatchUtil = require("../../utils/PathPatternMatchUtil.js");

	var functionalPatterns = [
		[ 'actor', 'boundary', 'control[+]', 'entity', 'pattern#1', 'EI',
				'functional', 'External input' ],
		[ 'entity', 'control[+]', 'boundary', 'actor', 'pattern#2', 'EO',
				'functional', 'External output' ],
		[ 'entity', 'boundary', 'actor', 'pattern#2', 'EO', 'functional',
				'External Output' ],
		[ 'actor', 'boundary', 'control[+]', 'boundary', 'pattern#3', 'EQ',
				'functional', 'External inquiry' ],
		[ 'actor', 'boundary', 'control[+]', 'boundary', 'actor',
				'pattern#4', 'EI,EQ', 'functional',
				'External input and inquiry' ],
		[ 'boundary', 'entity', 'boundary', 'actor', 'pattern#4', 'EI,EQ',
				'functional', 'External input and inquiry' ],
		[ 'actor', 'boundary', 'control[+]', 'entity', 'control[+]',
				'boundary', 'actor[!E]', 'pattern#5', 'EQ', 'functional',
				'External input and inquiry' ],
		[ 'actor', 'boundary', 'control[+]', 'entity', 'boundary',
				'actor[!E]', 'pattern#5', 'EQ', 'functional',
				'External input and inquiry' ] ];
	 
	var functionalPatternTreeRoot = pathPatternMatchUtil.establishPatternParseTree(functionalPatterns);
	
	module.exports = {
//			processDiagram: function(diagram, usecase){
//				return true;
//			},
			processPath: function(path, usecase){
				path["FPAnalytics"] = {};
				path["FPAnalytics"].Operations = {};
				var functionalOperations = pathPatternMatchUtil.recognizePattern(path.Components, functionalPatternTreeRoot);
				var functionalOperationStr = "";
				for(var i=0; i < functionalOperations.length; i++){
					if(i !== 0){
						functionalOperationStr += ",";
					}
					functionalOperationStr += functionalOperations[i].semantics;
				}
				
				if(functionalOperationStr !== ''){
					path["FPAnalytics"].Functional = functionalOperationStr.split(/,/g);
				}
				else{
					path["FPAnalytics"].Functional = ['FUNC_NA'];
				}
				
					
				path["FPAnalytics"].FunctionalTag = path["FPAnalytics"].Functional.join(',');
				
				return true;
			},
			processElement: function(element, usecase){
				// determine if the element is the duplicate of a existing one, if it is, keep the one that is more complex: OutboundNumber+InboundNumber
				// some of the element may not have type. just filter out the element.
				return true;
			},
			processLink: function(link){
				return true;
			}
	}
})();
