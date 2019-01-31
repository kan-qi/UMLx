(function(){
	
	var pathPatternMatchUtil = require("../../utils/TransactionPatternMatchUtil.js");

	var functionalPatterns = [
		[ 'boundary', 'control[+]', 'entity', 'pattern#1', 'EI', 'functional', 'External input' ],
		[ 'entity', 'control[+]', 'boundary', 'actor', 'pattern#2', 'EO', 'functional', 'External output' ],
		[ 'entity', 'boundary', 'actor', 'pattern#2', 'EO', 'functional', 'External Output' ],
		[ 'boundary', 'control[+]', 'boundary', 'pattern#3', 'EQ', 'functional', 'External inquiry' ],
		[ 'boundary', 'control[+]', 'boundary', 'actor', 'pattern#4', 'EQ', 'functional', 'External inquiry' ],
		[ 'boundary', 'entity', 'boundary', 'actor', 'pattern#4', 'EQ', 'functional', 'External inquiry' ],
		[ 'boundary', 'control[+]', 'entity', 'control[+]', 'boundary', 'actor[!E]', 'pattern#5', 'EQ', 'functional', 'External inquiry' ],
		[ 'boundary', 'control[+]', 'entity', 'boundary', 'actor[!E]', 'pattern#5', 'EQ', 'functional', 'External inquiry' ] ];
	 
	var functionalPatternTreeRoot = pathPatternMatchUtil.establishPatternParseTree(functionalPatterns);
	
	module.exports = {
			// determine the type of the transaction - EI, EO, EQ
			processTransaction: function(path, usecase){
				path["FPAnalytics"] = {};
				path["FPAnalytics"].Operations = {};
				var functionalOperations = pathPatternMatchUtil.recognizePattern(path, functionalPatternTreeRoot);
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
					path["FPAnalytics"].Functional = ['EQ'];
				}
				
				path["FPAnalytics"].FunctionalTag = path["FPAnalytics"].Functional.join(',');
				
				path["FPAnalytics"].DET = 0;
				path["FPAnalytics"].FTR = 0;
				
				if(path){
					path["FPAnalytics"].DET = path['TransactionAnalytics'].TC;
					path["FPAnalytics"].FTR = path['TransactionAnalytics'].DETs;
					
				}
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
