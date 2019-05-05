/**
 * http://usejsdoc.org/
 *
 * This evaluator will be responsible for evaluating the basic elements of UML diagrams: class diagrams, sequence diagrams, activity diagrams, etc.
 *
 * The basic elements, for example, include:
 *
 * Number of Class (NOC)
 * Number of Attributes (NOA)
 * Number of external methods (NEM)
 * Number of actors (NOA)
 * Number of use cases (NUC)
 * Number of roles (NOR)
 * Average number of actors per use case (ANA_UC)
 * Average number of roles per use case (ANR_UC)
 * Number of inheritance relationships (NOIR)
 * Number of use relationships (NOUR)
 * Number of realize relationships (NORR)
 * Number of methods (NOM)
 * Number of parameters (NOP)
 * Number of class attributes (NOCA)
 * Number of associations (NOASSOC)
 * Average number of methods per class (ANM_CLS)
 * Average Number of parameters per class (ANP_CLS)
 * Average number of class attributes per class (ANCA_CLS)
 * Average number of associations per class (ANASSOC_CLS)
 * Average number of relationships per class (ANREL_CLS)
 * Number of transactions (NOT)
 * EI
 * EO
 * EQ
 * ILF
 * EIF
 * DETs
 * FTRs
 * Number of use cases/scenario scripts
 * Weighted methods per class (WMC)
 * Methods per class (MPC)
 * Number of children (NOC)
 * Depth in Inheritance tree (DIT)
 * Method size (LOC) // no need
 * Coupling Between Objects (CBO)
 * Number of instance variables per class (NIV)
 * Number of unique messages sent (NUM)
 * Number of classes inherited (derived classes)
 * Number of classes inherited from (base classes)
 * reuse ration (RR)
 * Number of Top Level Classes (TLC)
 * Average number of weighted methods per classes(WMC)
 * Average Depth of Inheritance Tree (DIT)
 * Average number of children per base class (NOC)
 * Input services (IS)
 * Output services (OS)
 * Inquiry services (IQS)
 * Object data (OD)
 * External interface files (EIF)
 *
 * We need to generalize a profile for those basic elements.
 */

(function() {

	var fs = require('fs');
	var mkdirp = require('mkdirp');
	var RScriptExec = require('../../utils/RScriptUtil.js');
	var umlFileManager = require('../../UMLFileManager');
	var useCaseComponentsProcessor = require('./UseCaseComponentsProcessor.js');

	function toDomainModelEvaluationHeader() {

		return "Attribute_Num," +
			"Operation_Num," +
			"Class_Num," +
			"Top_Level_Classes," +
			"Average_Depth_Inheritance_Tree," +
			"Average_Number_Of_Children_Per_Base_Class," +
			"Number_Of_Inheritance_Relationships," +
			"Depth_Inheritance_Tree," +
			"para_num,usage_num," +
			"real_num,assoc_num," +
			"external_oper_num," +
			"data_object_num," +
			"avg_operation," +
			"avg_attribute," +
			"avg_parameter," +
			"avg_usage," +
			"avg_real," +
			"avg_assoc," +
			"avg_instVar," +
			"weighted_oper_num";
	}

	function toDomainModelEvaluationRow(domainModelInfo, index) {

		return domainModelInfo["ComponentAnalytics"].AttributeNum + ","
		+ domainModelInfo["ComponentAnalytics"].OperationNum + ","
		+ domainModelInfo["ComponentAnalytics"].ClassNum + ","
        + domainModelInfo["ComponentAnalytics"].TopLevelClasses + ","
        + domainModelInfo["ComponentAnalytics"].AverageDepthInheritanceTree + ","
        + domainModelInfo["ComponentAnalytics"].AverageNumberOfChildrenPerBaseClass + ","
        + domainModelInfo["ComponentAnalytics"].NumberOfInheritanceRelationships + ","
        + domainModelInfo["ComponentAnalytics"].DepthInheritanceTree + ","
        + domainModelInfo["ComponentAnalytics"].ParameterNum + ","
		+ domainModelInfo["ComponentAnalytics"].UsageNum + ","
	    + domainModelInfo["ComponentAnalytics"].RealNum + ","
		+ domainModelInfo["ComponentAnalytics"].AssocNum + ","
		+ domainModelInfo["ComponentAnalytics"].ExternalOperNum + ","
		+ domainModelInfo["ComponentAnalytics"].ObjectDataNum + ","
		+ domainModelInfo["ComponentAnalytics"].AvgOperation + ","
		+ domainModelInfo["ComponentAnalytics"].AvgAttribute  + ","
		+ domainModelInfo["ComponentAnalytics"].AvgParameter + ","
		+ domainModelInfo["ComponentAnalytics"].AvgUsage + ","
		+ domainModelInfo["ComponentAnalytics"].AvgReal + ","
		+ domainModelInfo["ComponentAnalytics"].AvgAssoc + ","
		+ domainModelInfo["ComponentAnalytics"].AvgInstVar + ","
		+ domainModelInfo["ComponentAnalytics"].WeightedOperNum;
	}

	// to output the header for data for the use cases.
	function toUseCaseEvaluationHeader() {
		return "Tran_Num,Activity_Num,Actor_Num,Component_num,Boundary_Num,Control_Num,Entity_Num";
	}

	// to output each row of the data for the use cases.
	function toUseCaseEvaluationRow(useCase, index) {
//		var useCaseEmpirics = useCase.UseCaseEmpirics;

		return useCase["ComponentAnalytics"].TranNum + ","
		+ useCase["ComponentAnalytics"].ActivityNum + ","
		+ useCase["ComponentAnalytics"].ActorNum + ","
		+ useCase["ComponentAnalytics"].ComponentNum + ","
		+ useCase["ComponentAnalytics"].BoundaryNum + ","
		+ useCase["ComponentAnalytics"].ControlNum + ","
		+ useCase["ComponentAnalytics"].EntityNum;
	}
	
	// callbackfunc is called when the elements are dumped into the files?
	function evaluateUseCase(useCase, model, callbackfunc) {
		
		useCase["ComponentAnalytics"] = {
		TranNum : 0,
		ActivityNum : 0,
		ActorNum : 0,
		ComponentNum : 0,
		BoundaryNum : 0,
		ControlNum : 0,
		EntityNum : 0,
		};
		
				// element analytics
				var totalDegree = 0;
				var activityNum = 0;

				var actors = new Set();
				var boundaryElements = new Set();
				var controlElements = new Set();
				var entityElements = new Set();
				var componentElements = new Set();
				
//				var transactionNum = 0;

				for ( var j in useCase.Activities) {
					var activity = useCase.Activities[j]; // tag: elements
//					var components = diagram.allocate(Activity);
					// if it is mvc decomposed. we are able to understand the boundry, control, and entity.
					if(activity.Component){
						var component = activity.Component;
						totalDegree += component.InboundNumber;
						
						var type = component.Type;
						if (type === "actor") {
//							actorNum++;
                                if(!actors.has(component)){
                                        actors.add(component);
                                }
						} else if (type === "boundary") {
//							boundaryNum++;
                                if(!boundaryElements.has(component)){
                                        boundaryElements.add(component);
                                }
						} else if (type === "control") {
//							controlNum++;
                                if(!controlElements.has(component)){
                                       controlElements.add(component);
                                }
						} else if (type === "entity") {
//							entityNum++;
                                if(!entityElements.has(component)){
                                       entityElements.add(component);
                                  }
						}

						 if(!componentElements.has(component)){
                                componentElements.add(component);
                          }

//						componentNum++;
					}

					activityNum++;
				}
				
//				for(var j in useCase.Actors){
//					actorNum++;
//				}

				useCase["ComponentAnalytics"].TotalDegree = totalDegree;
				// these numbers are different from the numbers for the entire model
				useCase["ComponentAnalytics"].Actors = actors;
                useCase["ComponentAnalytics"].BoundaryElements = boundaryElements;
                useCase["ComponentAnalytics"].ControlElements = controlElements;
                useCase["ComponentAnalytics"].EntityElements = entityElements;
                useCase["ComponentAnalytics"].ComponentElements = componentElements;

				useCase["ComponentAnalytics"].ActorNum = useCase["ComponentAnalytics"].Actors.size;
				useCase["ComponentAnalytics"].BoundaryNum = useCase["ComponentAnalytics"].BoundaryElements.size;
				useCase["ComponentAnalytics"].ControlNum = useCase["ComponentAnalytics"].ControlElements.size;
				useCase["ComponentAnalytics"].EntityNum = useCase["ComponentAnalytics"].EntityElements.size;
				useCase["ComponentAnalytics"].ActivityNum = activityNum;
				useCase["ComponentAnalytics"].ComponentNum = useCase["ComponentAnalytics"].ComponentElements.size;
				useCase["ComponentAnalytics"].TranNum = useCase.Transactions.length;

		if (callbackfunc) {

		useCase["ComponentAnalytics"].TransactionAnalyticsFileName = "transactionAnalytics.csv";
		useCase["ComponentAnalytics"].ElementAnalyticsFileName = "elementAnalytics.csv";

		console.log("test use case element analytics");
		console.log(useCase);
		dumpUseCaseElementsInfo(useCase, function(err, res){

				if(err){
					console.log(err);
					return;
				}

				console.log("evaluate uml elements for use cases");
				//
//				var command = './evaluators/UMLModelElementsEvaluator/UseCaseElementsAnalyticsScript.R "'+useCase.OutputDir+"/"+useCase["ComponentAnalytics"].ElementAnalyticsFileName+'" "'+useCase.OutputDir+"/"+useCase["ComponentAnalytics"].TransactionAnalyticsFileName+'" "'+useCase.OutputDir+'" "."';
				var command1 = '"./Rscript/OutputStatistics.R" "'+useCase.OutputDir+"/"+useCase["ComponentAnalytics"].ElementAnalyticsFileName+'" "'+useCase.OutputDir+'" "." "element_statistics.json"';
				console.log(command1);
				
				RScriptExec.runRScript(command1,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					
					var command2 = '"./Rscript/OutputStatistics.R" "'+useCase.OutputDir+"/"+useCase["ComponentAnalytics"].TransactionAnalyticsFileName+'" "'+useCase.OutputDir+'" "." "transaction_statistics.json"';
					console.log(command2);
					
					RScriptExec.runRScript(command2,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						if(callbackfunc){
							callbackfunc(useCase["ComponentAnalytics"]);
						}
					});
				});
		});	
		}

		return useCase["ComponentAnalytics"];
	}

	function evaluateDomainModel(domainModelInfo, callbackfunc) {

		domainModelInfo["ComponentAnalytics"] = {
				AttributeNum :0,
				OperationNum :0,
				// EntityNum :0,
				ClassNum: 0,
                TopLevelClasses :0,
                AverageDepthInheritanceTree :0,
                AverageNumberOfChildrenPerBaseClass :0,
                NumberOfInheritanceRelationships :0,
                DepthInheritanceTree :0,
                ParameterNum :0,
				UsageNum: 0,
				RealNum: 0,
				AssocNum: 0,
				GeneralNum: 0,
				ExternalOperNum: 0,
				ObjectDataNum: 0,
				AvgOperation :0,
				AvgAttribute :0,
				AvgParameter :0,
				AvgUsage: 0,
				AvgReal: 0,
				AvgAssoc: 0,
				AvgInstVar: 0,
				WeightedOperNum: 0,
				InstanceVarNum: 0,
				EntityAnalyticsFileName : 'entityAnalytics.csv',
				AttributeAnalyticsFileName :  'attributeAnalytics.csv',
				OperationAnalyticsFileName : 'operationAnalytics.csv',
                ComponentNum : 0,
                BoundaryNum : 0,
                ControlNum : 0,
                EntityNum : 0
	        }

			var attributeNum = 0;
			var operationNum = 0;
			// var entityNum = 0;
			var classNum = 0;
            var topLevelClasses = 0;
            var averageDepthInheritanceTree = 0;
            var averageNumberOfChildrenPerBaseClass = 0;
            var numberOfInheritanceRelationships = 0;
            var depthInheritanceTree = 0;
            var totalNumberOfChildrenOfTopLevelClasses = 0;

            var parameterNum = 0;
			var instanceVarNum = 0;
			var externalOperNum = 0;
			var dataObjectNum = 0;
			var weightedOperNum = 0;

             var boundaryNum = 0;
             var controlNum = 0;
             var entityNum = 0;
             var componentNum = 0;
			
			var totalNumberOfChildrenClass = 0;

			for ( var i in domainModelInfo.Elements) {
                            var element = domainModelInfo.Elements[i];
                            // entityNum++;
                            classNum++;
                            
                            var attributeNum_cls = 0;
                            var instanceVarNum_cls = 0;
                            var operationNum_cls = 0;
                            var externalOperNum_cls = 0;
                            var parameterNum_cls = 0;
                            var weightedOperNum_cls = 0;
                            
                            for ( var j in element.Attributes) {
                                var attribute = element.Attributes[j];
                                attributeNum_cls++;
                                if ( !attribute['isStatic']){
									instanceVarNum_cls++;
								}
                            }

                            for ( var j in element.Operations) {
                                var operation = element.Operations[j];
                                operationNum_cls++;
                                if (operation['visibility'] == "public"){
									externalOperNum_cls++;
								}
								for ( var k in operation.Parameters){
									var parameter = operation.Parameters[k];
									parameterNum_cls++;
								}
							
					               var w = 0.3;
					               weightedOperNum_cls += w*1;
                            }
                            
                            
                            if(element.Attributes.length>0 && element.Operations.length==0){
								dataObjectNum++;
							}

                            var type = element.Type;
							if (type === "boundary") {
                            			boundaryNum++;
                            	} else if (type === "control") {
                            			controlNum++;
                            	} else if (type === "entity") {
                            			entityNum++;
                            }

                            componentNum++;
                            
                            
                element.attributeNum = attributeNum_cls;
                element.instanceVarNum = instanceVarNum_cls;
                element.operationNum = operationNum_cls;
                element.externalOperNum = externalOperNum_cls;
                element.parameterNum = parameterNum_cls;
                element.weightedOperNum = weightedOperNum_cls;
                            
               // determine the inheritance relationships
               var derivedClasses = useCaseComponentsProcessor.identifyParents(element, domainModelInfo.Generalizations);
               element.numberOfDerivedClasses = derivedClasses.length;
               element.numberOfChildren = element.numberOfDerivedClasses;
               
               console.log("derivedClasses");
               console.log(derivedClasses);
               
               var inheritedClasses = useCaseComponentsProcessor.identifyAncestors(element, domainModelInfo.Generalizations);
               element.numberOfClassesInherited = inheritedClasses.elements.length;
               element.depthInheritanceTree = inheritedClasses.depth;
               
               console.log("inheritedClasses");
               console.log(inheritedClasses);
               
               averageDepthInheritanceTree += element.depthInheritanceTree;
               if(depthInheritanceTree < element.depthInheritanceTree){
            	   depthInheritanceTree = element.depthInheritanceTree;
               }
               
               var derivingClasses = useCaseComponentsProcessor.identifyChildren(element, domainModelInfo.Generalizations);
               element.numberOfDerivingClasses = derivingClasses.length;
               if(element.numberOfDerivingClasses == 0){
            	   element.isTopLevelClass = true;
            	   totalNumberOfChildrenOfTopLevelClasses += element.numberOfDerivedClasses;
            	   topLevelClasses++;
               }
               else{
            	   element.isTopLevelClass = false;
               }
               
               var ancestors = useCaseComponentsProcessor.identifyOffSprings(element, domainModelInfo.Generalizations);
               element.numberOfClassesInheritedFrom = ancestors.elements.length;
               
               element.numberOfInheritanceRelationships = element.numberOfDerivedClasses+element.numberOfClassesInherited;
               numberOfInheritanceRelationships += element.numberOfInheritanceRelationships;
               
            // determine the associations relationships
               
               var associatedClasses = useCaseComponentsProcessor.identifyChildren(element, domainModelInfo.Associations);
               element.numberOfAssociatedClasses = associatedClasses.length;
               
               var associatingClasses = useCaseComponentsProcessor.identifyParents(element, domainModelInfo.Associations);
               element.numberOfAssociatingClasses = associatingClasses.length;
            
               element.numberOfAssociationRelationships = element.numberOfAssociatedClasses+element.numberOfAssociatingClasses;
               
               
            // determine the usages relationships
               
               var usedClasses = useCaseComponentsProcessor.identifyChildren(element, domainModelInfo.Usages);
               element.numberOfUsedClasses = usedClasses.length;
               
               var usingClasses = useCaseComponentsProcessor.identifyParents(element, domainModelInfo.Usages);
               element.numberOfUsingClasses = usingClasses.length;
               
               element.numberOfUsageRelationships = element.numberOfUsedClasses+element.numberOfUsingClasses;
               
               attributeNum += attributeNum_cls;
               instanceVarNum += instanceVarNum_cls;
               operationNum += operationNum_cls;
               externalOperNum += externalOperNum_cls;
               parameterNum += parameterNum_cls;
               weightedOperNum += weightedOperNum_cls;
               
               element.couplingBetweenObjects = element.numberOfInheritanceRelationships+element.numberOfAssociationRelationships+element.numberOfUsageRelationships;
		 }
			
			averageDepthInheritanceTree = classNum === 0? 0: averageDepthInheritanceTree/classNum;
			 numberOfInheritanceRelationships =  numberOfInheritanceRelationships/2;
			
			var usageNum = 0;
			var realNum = 0;
			var assocNum = 0;
			var generalNum = 0;

			for ( var i in domainModelInfo.Usages) {
				var usage = domainModelInfo.Usages[i];
					usageNum++;
			}
			for ( var i in domainModelInfo.Associations) {
				var association = domainModelInfo.Associations[i];
					assocNum++;
			}
			
			for(var i in domainModelInfo.Generalizations){
				var generalization = domainModelInfo.Generalizations[i];
					generalNum++;
					realNum++; //realization and generalization are regarded as the same.
			}

//			diagram["ComponentAnalytics"] = {};
			domainModelInfo["ComponentAnalytics"].AttributeNum = attributeNum;
			domainModelInfo["ComponentAnalytics"].InstanceVarNum = instanceVarNum;
			domainModelInfo["ComponentAnalytics"].OperationNum = operationNum;
			// domainModelInfo["ComponentAnalytics"].ClassNum = entityNum;
			domainModelInfo["ComponentAnalytics"].ClassNum = classNum;
            domainModelInfo["ComponentAnalytics"].TopLevelClasses = topLevelClasses;
            domainModelInfo["ComponentAnalytics"].AverageDepthInheritanceTree = averageDepthInheritanceTree;
            domainModelInfo["ComponentAnalytics"].DepthInheritanceTree = depthInheritanceTree;
            domainModelInfo["ComponentAnalytics"].AverageNumberOfChildrenPerBaseClass = topLevelClasses == 0? 0 : totalNumberOfChildrenOfTopLevelClasses/topLevelClasses;
            domainModelInfo["ComponentAnalytics"].NumberOfInheritanceRelationships = numberOfInheritanceRelationships;
            domainModelInfo["ComponentAnalytics"].WeightedOperNum =  weightedOperNum;

            domainModelInfo["ComponentAnalytics"].ObjectDataNum = dataObjectNum;
			domainModelInfo["ComponentAnalytics"].ParameterNum = parameterNum;
			domainModelInfo["ComponentAnalytics"].ExternalOperNum = externalOperNum;
			domainModelInfo["ComponentAnalytics"].AvgInstVar = domainModelInfo["ComponentAnalytics"].ClassNum == 0 ? 0 : instanceVarNum / domainModelInfo["ComponentAnalytics"].ClassNum;
			domainModelInfo["ComponentAnalytics"].UsageNum = usageNum;
			domainModelInfo["ComponentAnalytics"].RealNum = realNum;
			domainModelInfo["ComponentAnalytics"].AssocNum = assocNum;
			domainModelInfo["ComponentAnalytics"].GeneralNum = generalNum;
			domainModelInfo["ComponentAnalytics"].AvgOperation = domainModelInfo["ComponentAnalytics"].ClassNum == 0 ? 0 : domainModelInfo["ComponentAnalytics"].OperationNum / domainModelInfo["ComponentAnalytics"].ClassNum;
			domainModelInfo["ComponentAnalytics"].AvgAttribute = domainModelInfo["ComponentAnalytics"].ClassNum == 0 ? 0 : domainModelInfo["ComponentAnalytics"].AttributeNum / domainModelInfo["ComponentAnalytics"].ClassNum;
			domainModelInfo["ComponentAnalytics"].AvgParameter = domainModelInfo["ComponentAnalytics"].ClassNum == 0 ? 0 : domainModelInfo["ComponentAnalytics"].ParameterNum / domainModelInfo["ComponentAnalytics"].ClassNum;
			domainModelInfo["ComponentAnalytics"].AvgUsage = domainModelInfo["ComponentAnalytics"].ClassNum == 0 ? 0 : domainModelInfo["ComponentAnalytics"].UsageNum / domainModelInfo["ComponentAnalytics"].ClassNum;
			domainModelInfo["ComponentAnalytics"].AvgReal = domainModelInfo["ComponentAnalytics"].ClassNum == 0 ? 0 : domainModelInfo["ComponentAnalytics"].RealNum / domainModelInfo["ComponentAnalytics"].ClassNum;
			domainModelInfo["ComponentAnalytics"].AvgAssoc = domainModelInfo["ComponentAnalytics"].ClassNum == 0 ? 0 : domainModelInfo["ComponentAnalytics"].AssocNum / domainModelInfo["ComponentAnalytics"].ClassNum;

            domainModelInfo["ComponentAnalytics"].EntityNum = entityNum;
			domainModelInfo["ComponentAnalytics"].ControlNum = controlNum;
			domainModelInfo["ComponentAnalytics"].BoundaryNum = boundaryNum;
			domainModelInfo["ComponentAnalytics"].ComponentNum = componentNum;

		if (callbackfunc) {

			dumpDomainModelElementsInfo(domainModelInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			console.log("evaluate uml elements for domain model");

//			var command = './evaluators/UMLModelElementsEvaluator/DomainModelElementsAnalyticsScript.R "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ComponentAnalytics"].EntityAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ComponentAnalytics"].AttributeAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ComponentAnalytics"].OperationAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ComponentAnalytics"].EntityAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "domain_model_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				var command2 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ComponentAnalytics"].AttributeAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "attribute_statistics.json"';
				
				
				RScriptExec.runRScript(command2,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					var command3 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ComponentAnalytics"].OperationAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "operation_statistics.json"';
					
					
					RScriptExec.runRScript(command3,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						if(callbackfunc){
							callbackfunc(domainModelInfo["ComponentAnalytics"]);
						}
					});
				});
			});
		});
		}

		return domainModelInfo["ComponentAnalytics"];
	}
	

	function toModelEvaluationHeader() {
		return "Tran_Num," +
				"UseCase_Num," +
//				"Total_Degree," +
				"Activity_Num," +
//				"Total_Links," +
				"Actor_Num," +
//				"Role_Num," +
				"Avg_Actor," +
//				"Avg_Role," +
				"Boundary_Num," +
				"ControlNum," +
				"Entity_Num," +
				"Component_num," +
				"Attribute_num," +
				"Operation_num," +
				"class_num," +
				"Top_Level_Classes," +
				"Average_Depth_Inheritance_Tree," +
				"Average_Number_Of_Children_Per_Base_Class," +
				"Number_Of_Inheritance_Relationships," +
				"Depth_Inheritance_Tree," +
				"para_num," +
				"usage_num," +
				"real_num," +
				"assoc_num," +
				"external_oper_num," +
				"data_object_num," +
				"avg_operation," +
				"avg_attribute," +
				"avg_parameter," +
				"avg_usage," +
				"avg_real," +
				"avg_assoc," +
				"avg_instVar," +
				"weighted_oper_num";;
	}

	function toModelEvaluationRow(modelInfo, index) {

		return modelInfo["ComponentAnalytics"].TranNum + ","
				+ modelInfo["ComponentAnalytics"].UseCaseNum + ","
				+ modelInfo["ComponentAnalytics"].ActivityNum + ","
				+ modelInfo["ComponentAnalytics"].ActorNum + ","
				+ modelInfo["ComponentAnalytics"].AvgActor + ","
				+ modelInfo["ComponentAnalytics"].BoundaryNum + ","
				+ modelInfo["ComponentAnalytics"].ControlNum + ","
				+ modelInfo["ComponentAnalytics"].EntityNum + ","
				+ modelInfo["ComponentAnalytics"].ComponentNum + ","
				//metrics for the domain model
				+ modelInfo["ComponentAnalytics"].AttributeNum + ","
				+ modelInfo["ComponentAnalytics"].OperationNum + ","
				+ modelInfo["ComponentAnalytics"].ClassNum  + ","
		        + modelInfo["ComponentAnalytics"].TopLevelClasses + ","
		        + modelInfo["ComponentAnalytics"].AverageDepthInheritanceTree + ","
		        + modelInfo["ComponentAnalytics"].AverageNumberOfChildrenPerBaseClass + ","
		        + modelInfo["ComponentAnalytics"].NumberOfInheritanceRelationships + ","
		        + modelInfo["ComponentAnalytics"].DepthInheritanceTree + ","
		        + modelInfo["ComponentAnalytics"].ParameterNum + ","
				+ modelInfo["ComponentAnalytics"].UsageNum + ","
				+ modelInfo["ComponentAnalytics"].RealNum + ","
				+ modelInfo["ComponentAnalytics"].AssocNum + ","
				+ modelInfo["ComponentAnalytics"].ExternalOperNum + ","
				+ modelInfo["ComponentAnalytics"].ObjectDataNum + ","
				+ modelInfo["ComponentAnalytics"].AvgOperation + ","
				+ modelInfo["ComponentAnalytics"].AvgAttribute  + ","
				+ modelInfo["ComponentAnalytics"].AvgParameter + ","
				+ modelInfo["ComponentAnalytics"].AvgUsage + ","
				+ modelInfo["ComponentAnalytics"].AvgReal + ","
				+ modelInfo["ComponentAnalytics"].AvgAssoc + ","
				+ modelInfo["ComponentAnalytics"].AvgInstVar + ","
				+ modelInfo["ComponentAnalytics"].WeightedOperNum;
				//added metrics for the domain model
	}

	function evaluateModel(modelInfo, callbackfunc) {

		modelInfo["ComponentAnalytics"] = {
				ActivityNum : 0,
				TranNum : 0,
				UseCaseNum : 0,
				ActorNum : 0,
				BoundaryNum : 0,
				ControlNum : 0,
				EntityNum : 0,
				ComponentNum: 0,
				AvgActor : 0,
				AttributeNum : 0,
				OperationNum : 0,
				ClassNum  : 0,
		        TopLevelClasses : 0,
		        AverageDepthInheritanceTree : 0,
		        AverageNumberOfChildrenPerBaseClass : 0,
		        NumberOfInheritanceRelationships : 0,
		        DepthInheritanceTree : 0,
		        ParameterNum : 0,
				UsageNum : 0,
				RealNum : 0,
				AssocNum : 0,
				ExternalOperNum : 0,
				ObjectDataNum : 0,
				AvgOperation : 0,
				AvgAttribute  : 0,
				AvgParameter : 0,
				AvgUsage : 0,
				AvgReal : 0,
				AvgAssoc : 0,
				AvgInstVar : 0,
				WeightedOperNum : 0,
				EntityAnalyticsFileName : "entityAnalytics.csv",
				AttributeAnalyticsFileName : "attributeAnalytics.csv",
				OperationAnalyticsFileName : "operationAnalytics.csv",
				ElementAnalyticsFileName : "elementAnalytics.csv",
				TransactionAnalyticsFileName : "transactionAnalytics.csv"
		}
		
//		var totalTransactionLength = 0;
		var totalActorNum = 0;
		var actors = new Set();
		
		for ( var i in modelInfo.UseCases) {
			var useCase = modelInfo.UseCases[i];

			if(useCase["ComponentAnalytics"]){
			modelInfo["ComponentAnalytics"].TranNum += useCase["ComponentAnalytics"].TranNum;
			modelInfo["ComponentAnalytics"].UseCaseNum++;

			modelInfo["ComponentAnalytics"].ActivityNum += useCase["ComponentAnalytics"].ActivityNum;

			//need to recalculate here.
			modelInfo["ComponentAnalytics"].RoleNum += useCase["ComponentAnalytics"].RoleNum;


			for(var i in useCase["ComponentAnalytics"].actors){
			        if(!actors.has(useCase["ComponentAnalytics"].Actors[i])){
			            actors.add(useCase["ComponentAnalytics"].Actors[i])
			        }
			}
			}

			
			modelInfo["ComponentAnalytics"].UseCaseNum++;
		}

        modelInfo["ComponentAnalytics"].Actors = actors;
		if(modelInfo["ComponentAnalytics"].Actors.size == 0){
		    totalActorNum = 1;
		}
		else {
		    totalActorNum = modelInfo["ComponentAnalytics"].Actors.size
		}

        modelInfo["ComponentAnalytics"].ActorNum = totalActorNum;
		modelInfo["ComponentAnalytics"].AvgActorNum = modelInfo["ComponentAnalytics"].ActivtyNum == 0 ? 0 : totalActorNum / modelInfo["ComponentAnalytics"].UseCaseNum;

		// analyse domain model
		var domainModelInfo = modelInfo.DomainModel;


		if(domainModelInfo && domainModelInfo["ComponentAnalytics"]){
		modelInfo["ComponentAnalytics"].AttributeNum = domainModelInfo["ComponentAnalytics"].AttributeNum;
		modelInfo["ComponentAnalytics"].OperationNum = domainModelInfo["ComponentAnalytics"].OperationNum;
		modelInfo["ComponentAnalytics"].ClassNum  = domainModelInfo["ComponentAnalytics"].ClassNum;
        modelInfo["ComponentAnalytics"].TopLevelClasses = domainModelInfo["ComponentAnalytics"].TopLevelClasses;
        modelInfo["ComponentAnalytics"].AverageDepthInheritanceTree = domainModelInfo["ComponentAnalytics"].AverageDepthInheritanceTree;
        modelInfo["ComponentAnalytics"].AverageNumberOfChildrenPerBaseClass = domainModelInfo["ComponentAnalytics"].AverageNumberOfChildrenPerBaseClass;
        modelInfo["ComponentAnalytics"].NumberOfInheritanceRelationships = domainModelInfo["ComponentAnalytics"].NumberOfInheritanceRelationships;
        modelInfo["ComponentAnalytics"].DepthInheritanceTree = domainModelInfo["ComponentAnalytics"].DepthInheritanceTree;
        modelInfo["ComponentAnalytics"].ParameterNum = domainModelInfo["ComponentAnalytics"].ParameterNum;
		modelInfo["ComponentAnalytics"].UsageNum = domainModelInfo["ComponentAnalytics"].UsageNum;
		modelInfo["ComponentAnalytics"].RealNum = domainModelInfo["ComponentAnalytics"].RealNum;
		modelInfo["ComponentAnalytics"].AssocNum = domainModelInfo["ComponentAnalytics"].AssocNum;
		modelInfo["ComponentAnalytics"].ExternalOperNum = domainModelInfo["ComponentAnalytics"].ExternalOperNum;
		modelInfo["ComponentAnalytics"].ObjectDataNum = domainModelInfo["ComponentAnalytics"].ObjectDataNum;
		modelInfo["ComponentAnalytics"].AvgOperation = domainModelInfo["ComponentAnalytics"].AvgOperation;
		modelInfo["ComponentAnalytics"].AvgAttribute  = domainModelInfo["ComponentAnalytics"].AvgAttribute;
		modelInfo["ComponentAnalytics"].AvgParameter = domainModelInfo["ComponentAnalytics"].AvgParameter;
		modelInfo["ComponentAnalytics"].AvgUsage = domainModelInfo["ComponentAnalytics"].AvgUsage;
		modelInfo["ComponentAnalytics"].AvgReal = domainModelInfo["ComponentAnalytics"].AvgReal;
		modelInfo["ComponentAnalytics"].AvgAssoc = domainModelInfo["ComponentAnalytics"].AvgAssoc;
		modelInfo["ComponentAnalytics"].AvgInstVar = domainModelInfo["ComponentAnalytics"].AvgInstVar;
		modelInfo["ComponentAnalytics"].WeightedOperNum = domainModelInfo["ComponentAnalytics"].WeightedOperNum;


        modelInfo["ComponentAnalytics"].EntityNum = domainModelInfo["ComponentAnalytics"].EntityNum;
		modelInfo["ComponentAnalytics"].ControlNum = domainModelInfo["ComponentAnalytics"].ControlNum;
		modelInfo["ComponentAnalytics"].BoundaryNum = domainModelInfo["ComponentAnalytics"].BoundaryNum;
		modelInfo["ComponentAnalytics"].ComponentNum = domainModelInfo["ComponentAnalytics"].ComponentNum;

		}

		if (callbackfunc) {

			dumpModelElementsInfo(modelInfo, function(err){
			if(err){
				callbackfunc(err);
			}

			//Needs to be upgraded soon
			console.log("evaluate uml elements at model level");

//			var command = './evaluators/UMLModelElementsEvaluator/ModelElementsAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].EntityAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].AttributeAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].OperationAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].ElementAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].TransactionAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].EntityAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "entity_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				var command2 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].AttributeAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "attribute_statistics.json"';
				
				
				RScriptExec.runRScript(command2,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					var command3 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].ElementAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "element_statistics.json"';
					
					
					RScriptExec.runRScript(command3,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						var command4 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["ComponentAnalytics"].TransactionAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "transaction_statistics.json"';
						
						
						RScriptExec.runRScript(command4,function(result){
							if (!result) {
								if(callbackfunc){
									callbackfunc(false);
								}
								return;
							}
							if(callbackfunc){
								callbackfunc(modelInfo["ComponentAnalytics"]);
							}
						});
					});
				});
			});
		});
		}

		return modelInfo["ComponentAnalytics"];
	}

	function evaluateRepo(repoInfo, callbackfunc) {
		repoInfo["ComponentAnalytics"] = {
		TranNum:0,
		ActorNum:0,
		UseCaseNum: 0,
		BoundaryNum:0,
		ControlNum:0,
		EntityNum:0,
		ComponentNum:0,
		ActivtyNum:0,
		EntityAnalyticsFileName : "entityAnalytics.csv",
		AttributeAnalyticsFileName : "attributeAnalytics.csv",
		OperationAnalyticsFileName : "operationAnalytics.csv",
		ElementAnalyticsFileName : "elementAnalytics.csv",
		TransactionAnalyticsFileName : "transactionAnalytics.csv"
		}
		var totalActorNum = 0;

		
		for ( var i in repoInfo.Models) {
			var modelInfo = repoInfo.Models[i];

			if(modelInfo["ComponentAnalytics"]){
			repoInfo["ComponentAnalytics"].TranNum += modelInfo["ComponentAnalytics"].TranNum;
			repoInfo["ComponentAnalytics"].UseCaseNum += modelInfo["ComponentAnalytics"].UseCaseNum;

			repoInfo["ComponentAnalytics"].ActorNum += modelInfo["ComponentAnalytics"].ActorNum;
			repoInfo["ComponentAnalytics"].BoundaryNum += modelInfo["ComponentAnalytics"].BoundaryNum;
			repoInfo["ComponentAnalytics"].ControlNum += modelInfo["ComponentAnalytics"].ControlNum;
			repoInfo["ComponentAnalytics"].EntityNum += modelInfo["ComponentAnalytics"].EntityNum;
			repoInfo["ComponentAnalytics"].ComponentNum += modelInfo["ComponentAnalytics"].ComponentNum;
//			repoInfo["ComponentAnalytics"].TotalDegree += modelInfo["ComponentAnalytics"].TotalDegree;
			repoInfo["ComponentAnalytics"].ActivtyNum += modelInfo["ComponentAnalytics"].ActivtyNum;
			
			totalActorNum += modelInfo["ComponentAnalytics"].ActorNum;
			
			}
		}

		repoInfo["ComponentAnalytics"].AvgActorNum = repoInfo["ComponentAnalytics"].UseCaseNum == 0 ? 0 : repoInfo["ComponentAnalytics"].ActorNum / repoInfo["ComponentAnalytics"].UseCaseNum;

		repoInfo["ComponentAnalytics"].repoModelEvaluationResultsTransaction = repoInfo.OutputDir + "/Model_Evaluation_Results";

		if (callbackfunc) {

			dumpRepoElementsInfo(repoInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			//Needs to be upgraded soon
			console.log("evaluate uml elements at repo level");

			var command1 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["ComponentAnalytics"].EntityAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "entity_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				var command2 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["ComponentAnalytics"].AttributeAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "attribute_statistics.json"';
				
				
				RScriptExec.runRScript(command2,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					var command3 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["ComponentAnalytics"].OperationAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "operation_statistics.json"';
					
					
					RScriptExec.runRScript(command3,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						var command4 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["ComponentAnalytics"].TransactionAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "transaction_statistics.json"';
						
						
						RScriptExec.runRScript(command4,function(result){
							if (!result) {
								if(callbackfunc){
									callbackfunc(false);
								}
								return;
							}
							if(callbackfunc){
								callbackfunc(repoInfo["ComponentAnalytics"]);
							}
						});
					});
				});
			});

		});
		}

		return repoInfo["ComponentAnalytics"];
	}

	function dumpUseCaseElementsInfo(useCase, callbackfunc, elementNum, transactionNum, expandedTransactionNum) {
		// console.log("dump useCase analytics");

		elementNum = !elementNum ? 0 : elementNum;
		transactionNum = !transactionNum ? 0 : transactionNum;

		var elementAnalyticsStr = elementNum == 0 ? "id,element,useCase,type,component\n" : "";
		var transactionAnalyticsStr = transactionNum == 0 ? "id,transaction,useCase,transaction_length, boundry_num, control_num, entity_num, actor_num\n" : "";

			var i = useCase.Transactions.length;
			
			while (i--) {

				var transaction = useCase.Transactions[i];
				console.log(transaction);

				if(!useCaseComponentsProcessor.processTransaction(transaction, useCase)){
					useCase.Transactions.splice(i, 1);
					continue;
				}

				// useCaseComponentsProcessor.processTransaction(transaction, useCase);
				transactionNum++;
				transactionAnalyticsStr += transactionNum + ","
						+ transaction.TransactionStr.replace(/,/gi, "") + ","
//						+ diagram.Name + ","
						+ useCase.Name + ","
						+ transaction.length + ","
						+ transaction.boundaryNum + ","
						+ transaction.controlNum + ","
						+ transaction.entityNum + ","
						+ transaction.actorNum+"\n";
			}


			for ( var i in useCase.Activities) {
				var element = useCase.Activities[i];
				useCaseComponentsProcessor.processElement(element, useCase);
				elementNum++;
				elementAnalyticsStr += elementNum + ","
						+ element.Name + ","
						+ useCase.Name + ","
						+ element.Type + ","
						+ element.ComponentName +"\n";
			}



		if(callbackfunc){

			var files = [{fileName : useCase["ComponentAnalytics"].ElementAnalyticsFileName, content : elementAnalyticsStr},
				{fileName : useCase["ComponentAnalytics"].TransactionAnalyticsFileName, content : transactionAnalyticsStr}];

			umlFileManager.writeFiles(useCase.OutputDir, files, callbackfunc);
			callbackfunc();
		}

		return {
			elementAnalyticsStr: elementAnalyticsStr,
			elementNum: elementNum,
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum,
		}

	}

	function dumpDomainModelElementsInfo(domainModelInfo, callbackfunc, entityNum, attributeNum, operationNum) {

		entityNum = !entityNum ? 0 : entityNum;
		attributeNum = !attributeNum ? 0 : attributeNum;
		operationNum = !operationNum ? 0 : operationNum;

		var entityAnalyticsStr = entityNum == 0 ? "id,element,attributeNum,operationNum,instanceVarNum,externalOperNum,parameterNum,weightedOperNum,numberOfDerivedClasses,numberOfChildren,numberOfClassesInherited,depthInheritanceTree,numberOfDerivingClasses,isTopLevelClass,numberOfClassesInheritedFrom,numberOfInheritanceRelationships,numberOfAssociatedClasses,numberOfAssociatingClasses,numberOfAssociationRelationships,numberOfUsedClasses,numberOfUsingClasses,numberOfUsageRelationships,couplingBetweenObjects\n" : "";
		var attributeAnalyticsStr = attributeNum == 0 ? "id,attribute,type,element\n" : "";
		var operationAnalyticsStr = operationNum == 0 ? "id,operation,element\n" : "";

			for ( var i in domainModelInfo.Elements) {

				var element = domainModelInfo.Elements[i];

					entityNum++;
					entityAnalyticsStr += entityNum + ","
						+ element.Name + ","
						+ element.attributeNum + ","
						+ element.operationNum + ","
						+ element.instanceVarNum + ","
						+ element.externalOperNum + ","
						+ element.parameterNum + ","
						+ element.weightedOperNum + ","
						+ element.numberOfDerivedClasses + ","
						+ element.numberOfChildren + ","
						+ element.numberOfClassesInherited + ","
						+ element.depthInheritanceTree + ","
						+ element.numberOfDerivingClasses + ","
						+ element.isTopLevelClass + ","
						+ element.numberOfClassesInheritedFrom + ","
						+ element.numberOfInheritanceRelationships + ","
						+ element.numberOfAssociatedClasses + ","
						+ element.numberOfAssociatingClasses + ","
						+ element.numberOfAssociationRelationships + ","
						+ element.numberOfUsedClasses + ","
						+ element.numberOfUsingClasses + ","
						+ element.numberOfUsageRelationships+","
						+ element.couplingBetweenObjects+"\n";
					
				for ( var j in element.Attributes) {
					attributeNum++;
					var attribute = element.Attributes[j];
					attributeAnalyticsStr += attributeNum + ","
							+ attribute.Name + ","
							+ attribute.Type + ","
							+ element.Name + "\n";
				}

				for ( var j in element.Operations) {
					operationNum++;
					var operation = element.Operations[j];
					operationAnalyticsStr += operationNum + ","
							+ operation.Name + ","
							+ element.Name + "\n";
				}

			}

		if(callbackfunc){

		var files = [{fileName : domainModelInfo["ComponentAnalytics"].EntityAnalyticsFileName , content : entityAnalyticsStr },
			{fileName : domainModelInfo["ComponentAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : domainModelInfo["ComponentAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr}];

		console.log("checking domain model");
		console.log(domainModelInfo);
		umlFileManager.writeFiles(domainModelInfo.OutputDir, files, callbackfunc);

		}

		return {
			entityAnalyticsStr: entityAnalyticsStr,
			entityNum: entityNum,
			attributeAnalyticsStr: attributeAnalyticsStr,
			attributeNum: attributeNum,
			operationAnalyticsStr: operationAnalyticsStr,
			operationNum: operationNum
		}
	}

	function dumpModelElementsInfo(modelInfo, callbackfunc, elementNum, transactionNum, entityNum, attributeNum, operationNum) {


		elementNum = !elementNum ? 0 : elementNum;
		transactionNum = !transactionNum ? 0 : transactionNum;
		entityNum = !entityNum ? 0 : entityNum;
		attributeNum = !attributeNum ? 0 : attributeNum;
		operationNum = !operationNum ? 0 : operationNum;

		var elementAnalyticsStr = "";
		var transactionAnalyticsStr = "";
		var entityAnalyticsStr = "";
		var attributeAnalyticsStr = "";
		var operationAnalyticsStr = "";


		for ( var i in modelInfo.UseCases) {
			var useCase = modelInfo.UseCases[i];
			var useCaseDump = dumpUseCaseElementsInfo(useCase, null, elementNum, transactionNum);
			transactionNum = useCaseDump.transactionNum;
			transactionAnalyticsStr += useCaseDump.transactionAnalyticsStr;
			elementNum = useCaseDump.elementNum;
			elementAnalyticsStr += useCaseDump.elementAnalyticsStr;
		}

		
		if(modelInfo.DomainModel){
	    domainModelDump = dumpDomainModelElementsInfo(modelInfo.DomainModel);
		
	    entityNum = domainModelDump.entityNum;
	    entityAnalyticsStr += domainModelDump.entityAnalyticsStr;
	    attributeNum = domainModelDump.attributeNum;
	    attributeAnalyticsStr += domainModelDump.attributeAnalyticsStr;
	    operationNum = domainModelDump.operationNum;
	    operationAnalyticsStr += domainModelDump.operationAnalyticsStr;
		}
		


		if(callbackfunc){

		var files = [{fileName : modelInfo["ComponentAnalytics"].TransactionAnalyticsFileName , content : transactionAnalyticsStr },
			{fileName : modelInfo["ComponentAnalytics"].ElementAnalyticsFileName, content : elementAnalyticsStr},
			{fileName : modelInfo["ComponentAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr},
			{fileName : modelInfo["ComponentAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : modelInfo["ComponentAnalytics"].EntityAnalyticsFileName, content : entityAnalyticsStr}
		];

		umlFileManager.writeFiles(modelInfo.OutputDir, files, callbackfunc);
		
		

		}

		return {
			entityAnalyticsStr: entityAnalyticsStr,
			entityNum: entityNum,
			attributeAnalyticsStr: attributeAnalyticsStr,
			attributeNum: attributeNum,
			operationAnalyticsStr: operationAnalyticsStr,
			operationNum: operationNum,
			elementAnalyticsStr: elementAnalyticsStr,
			elementNum: elementNum,
			transactionAnalyticsStr: transactionAnalyticsStr,
			transactionNum: transactionNum,
		}

	}

	function dumpRepoElementsInfo(repoInfo, callbackfunc) {

		var elementNum = 0;
		var transactionNum = 0;
		var entityNum = 0;
		var attributeNum = 0;
		var operationNum = 0;

		var transactionAnalyticsStr = "";
		var elementAnalyticsStr = "";
		var entityAnalyticsStr = "";
		var attributeAnalyticsStr = "";
		var operationAnalyticsStr = "";

		for ( var i in repoInfo.Models) {

			var modelInfo = repoInfo.Models[i];
			var modelDump = dumpModelElementsInfo(modelInfo, null, elementNum, transactionNum, entityNum, attributeNum, operationNum);

			transactionNum = modelDump.transactionNum;
			transactionAnalyticsStr += modelDump.transactionAnalyticsStr;
			elementNum = modelDump.elementNum;
			elementAnalyticsStr += modelDump.elementAnalyticsStr;
			entityNum = modelDump.entityNum;
			entityAnalyticsStr += modelDump.entityAnalyticsStr;
			attributeNum = modelDump.attributeNum;
			attributeAnalyticsStr += modelDump.attributeAnalyticsStr;
			operationNum = modelDump.operationNum;
			operationAnalyticsStr += modelDump.operationAnalyticsStr;
		}


		if(callbackfunc){

			var files = [{fileName : repoInfo["ComponentAnalytics"].TransactionAnalyticsFileName , content : transactionAnalyticsStr},
				{fileName : repoInfo["ComponentAnalytics"].ElementAnalyticsFileName, content : elementAnalyticsStr},
				{fileName : repoInfo["ComponentAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr},
				{fileName : repoInfo["ComponentAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
				{fileName : repoInfo["ComponentAnalytics"].EntityAnalyticsFileName, content : entityAnalyticsStr}
			];

		umlFileManager.writeFiles(repoInfo.OutputDir, files, callbackfunc);

		}

	}

	function analyseModelEvaluation(modelInfo, callbackfunc){
		console.log("evaluate uml elements at repo level");
//		var command = './evaluators/UMLModelElementsEvaluator/UseCaseAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo.UseCaseEvaluationFileName+'" "'+modelInfo.OutputDir+'" "."';
		
		var command = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo.UseCaseEvaluationFileName+'" "'+modelInfo.OutputDir+'" "." "use_case_statistics.json"';
		console.log(command);
		console.log("analyse model")

		RScriptExec.runRScript(command,function(result){
			if (!result) {
				if(callbackfunc){
					callbackfunc(false);
				}
				return;
			}
			if(callbackfunc){
				callbackfunc(modelInfo);
			}
		});
	}


	module.exports = {
		toModelEvaluationHeader : toModelEvaluationHeader,
		toModelEvaluationRow : toModelEvaluationRow,
		toUseCaseEvaluationHeader : toUseCaseEvaluationHeader,
		toUseCaseEvaluationRow : toUseCaseEvaluationRow,
		toDomainModelEvaluationHeader: toDomainModelEvaluationHeader,
		toDomainModelEvaluationRow: toDomainModelEvaluationRow,
		// loadFromModelEmpirics: loadFromModelEmpirics,
//		loadFromUseCaseEmpirics : loadFromUseCaseEmpirics,
		evaluateRepo : evaluateRepo,
		evaluateUseCase : evaluateUseCase,
		evaluateModel : evaluateModel,
		evaluateDomainModel : evaluateDomainModel,
		analyseModelEvaluation: analyseModelEvaluation
	}

}())
