/**
 * This module is used to parse src code into USIM model. The construction is currently based on KDM. Further implementation can be made by using AST, which needs further investigation.
 * 
 * This script relies on KDM and Java model 
 * 
 * The goal is the establish the control flow between the modules...
 * Identify the stimuli.
 * Identify the boundary.
 * Identify the sytem components.....
 */
(function() {
	
	/*
	 * This method is used to draw different dependency graphs between different nodes.
	 */
		function drawClassDependencyGraph(codeAnalysisResults, outputDir){

		}

		function drawClassDependencyGraphGroupedByCompositeClass(codeAnalysisResults, outputDir){

        }

        function drawClassDependencyGraphGroupedByComponent(codeAnalysisResults, outputDir){

        }

		function drawCompositeClassDependencyGraph(codeAnalysisResults, outputDir){

		}
	
	module.exports = {
			drawClassDependencyGraph : drawClassDependencyGraph,
			drawClassDependencyGraphGroupedByCompositeClass: drawClassDependencyGraphGroupedByCompositeClass,
			drawClassDependencyGraphGroupedByComponent:  drawClassDependencyGraphGroupedByComponent,
			drawCompositeClassDependencyGraph: drawCompositeClassDependencyGraph
	}
}());
