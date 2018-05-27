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
 * Number of use cases.(NUC)
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
 * Methods per class
 * Number of children (NOC)
 * Depth in Inheritance tree (DIT)
 * Method size (LOC)
 * Coupling Between Objects (CBO)
 * Number of instance variables per class (NIV)
 * Number of unique messages sent (NUM)
 * Number of classes inherited (derived classes)
 * Number of classes inherited from (base classes)
 * reuse ration. (RR)
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
	var umlModelProcessor = require('./UMLModelProcessor.js');

	
	function toModelEvaluationHeader() {
		return "Path_Num,UseCase_Num,Total_Degree,Element_Num,Total_Links,Actor_Num,Role_Num,Avg_Actor,Avg_Role,Boundary_Num,ControlNum,Entity_Num," +
				"attribute_num,operation_num,class_num,Top_Level_Classes,Average_Depth_Inheritance_Tree,Average_Number_Of_Children_Per_Base_Class," +
				"Number_Of_Inheritance_Relationships,Number_Of_Derived_Classes,Number_Of_Classes_Inherited,Number_Of_Classes_Inherited_From,Number_Of_Children,Depth_Inheritance_Tree,Coupling_Between_Objects," +
				"para_num, usage_num, real_num, assoc_num, externaloper_num, objectdata_num, avg_operation, avg_attribute, avg_parameter, avg_usage, avg_real, avg_assoc, avg_instVar, weightedoper_num, method_size,"+
				"Lines_of_code, External_Method_Num, Services_Requested_Num,Recode_Num,Data_Element_Num,Points_Num,Inher_Rela_Num,Use_Rela_Num,Real_Rela_Num,Method_Num,Parameter_Num,Parameter_Method_Avg"
				"External_Files, Internal_Files,Data_element,File_Type_Referenced";
	}

	function toModelEvaluationRow(modelInfo, index) {
//		var modelInfo["ElementAnalytics"] = modelInfo.ModelAnalytics;
//		var modelEmpirics = modelInfo.ModelEmpirics;

		return modelInfo["ElementAnalytics"].PathNum + ","
				+ modelInfo["ElementAnalytics"].UseCaseNum + ","
//				+ modelInfo["ElementAnalytics"].DiagramNum + ","
				+ modelInfo["ElementAnalytics"].TotalDegree + ","
				+ modelInfo["ElementAnalytics"].ElementNum + ","
				+ modelInfo["ElementAnalytics"].TotalLinks + ","
				+ modelInfo["ElementAnalytics"].ActorNum + ","
				+ modelInfo["ElementAnalytics"].RoleNum + ","
				+ modelInfo["ElementAnalytics"].AvgActor + ","
				+ modelInfo["ElementAnalytics"].AvgRole + ","
				+ modelInfo["ElementAnalytics"].BoundaryNum + ","
				+ modelInfo["ElementAnalytics"].ControlNum + ","
				+ modelInfo["ElementAnalytics"].EntityNum + ","
				//metrics for the domain model
				+ modelInfo["ElementAnalytics"].AttributeNum + ","
				+ modelInfo["ElementAnalytics"].OperationNum + ","
				+ modelInfo["ElementAnalytics"].ClassNum  + ","
		        + modelInfo["ElementAnalytics"].TopLevelClasses + ","
		        + modelInfo["ElementAnalytics"].AverageDepthInheritanceTree + ","
		        + modelInfo["ElementAnalytics"].AverageNumberOfChildrenPerBaseClass + ","
		        + modelInfo["ElementAnalytics"].NumberOfInheritanceRelationships + ","
		        + modelInfo["ElementAnalytics"].NumberOfDerivedClasses + ","
		        + modelInfo["ElementAnalytics"].NumberOfClassesInherited + ","
		        + modelInfo["ElementAnalytics"].NumberOfClassesInheritedFrom + ","
		        + modelInfo["ElementAnalytics"].NumberOfChildren + ","
		        + modelInfo["ElementAnalytics"].DepthInheritanceTree + ","
		        + modelInfo["ElementAnalytics"].CouplingBetweenObjects + ","
		        + modelInfo["ElementAnalytics"].ParameterNum + ","
				+ modelInfo["ElementAnalytics"].UsageNum + ","
				+ modelInfo["ElementAnalytics"].RealNum + ","
				+ modelInfo["ElementAnalytics"].AssocNum + ","
				+ modelInfo["ElementAnalytics"].ExternalOperNum + ","
				+ modelInfo["ElementAnalytics"].ObjectDataNum + ","
				+ modelInfo["ElementAnalytics"].AvgOperation + ","
				+ modelInfo["ElementAnalytics"].AvgAttribute  + ","
				+ modelInfo["ElementAnalytics"].AvgParameter + ","
				+ modelInfo["ElementAnalytics"].AvgUsage + ","
				+ modelInfo["ElementAnalytics"].AvgReal + ","
				+ modelInfo["ElementAnalytics"].AvgAssoc + ","
				+ modelInfo["ElementAnalytics"].AvgInstVar + ","
				+ modelInfo["ElementAnalytics"].WeightedOperNum + ","
				+ modelInfo["ElementAnalytics"].MethodSize;
	}

	// to output the header for data for the use cases.
	function toUseCaseEvaluationHeader() {
		return "Path_Num,UseCase_Num,Total_Degree,Element_Num,Total_Links,Avg_Degree,Avg_Path_Length,Actor_Num," +
				"Role_Num,Avg_Actor,Avg_Role,Boundary_Num,Control_Num,Entity_Num;
	}

	// to output each row of the data for the use cases.
	function toUseCaseEvaluationRow(useCase, index) {
//		var useCaseEmpirics = useCase.UseCaseEmpirics;

		return useCase["ElementAnalytics"].PathNum + ","
		+ useCase["ElementAnalytics"].UseCaseNum + ","
//		+ useCase["ElementAnalytics"].DiagramNum + ","
		+ useCase["ElementAnalytics"].TotalDegree + ","
		+ useCase["ElementAnalytics"].ElementNum + ","
		+ useCase["ElementAnalytics"].TotalLinks + ","
		+ useCase["ElementAnalytics"].AvgDegree + ","
		+ useCase["ElementAnalytics"].AvgPathLength + ","
		+ useCase["ElementAnalytics"].ActorNum + ","
		+ useCase["ElementAnalytics"].RoleNum + ","
		+ useCase["ElementAnalytics"].AvgActor + ","
		+ useCase["ElementAnalytics"].AvgRole + ","
		+ useCase["ElementAnalytics"].BoundaryNum + ","
		+ useCase["ElementAnalytics"].ControlNum + ","
		+ useCase["ElementAnalytics"].EntityNum;

	}

	function toDomainModelEvaluationHeader() {
		return "attribute_num,operation_num,class_num,Top_Level_Classes,Average_Depth_Inheritance_Tree," +
				"Average_Number_Of_Children_Per_Base_Class,Number_Of_Inheritance_Relationships,Number_Of_Derived_Classes," +
				"Number_Of_Classes_Inherited,Number_Of_Classes_Inherited_From,Number_Of_Children,Depth_Inheritance_Tree" +
				",Coupling_Between_Objects, para_num, usage_num, real_num, assoc_num, externaloper_num, objectdata_num, avg_operation," +
				" avg_attribute, avg_parameter, avg_usage, avg_real, avg_assoc, avg_instVar, weightedoper_num, method_size";
	}

	function toDomainModelEvaluationRow(domainModelInfo, index) {
//		var useCaseEmpirics = useCase.UseCaseEmpirics;
//		var domainModelInfo["ElementAnalytics"] = domainModelInfo.DomainModelAnalytics;
//		console.log(domainModelInfo);
		return domainModelInfo["ElementAnalytics"].AttributeNum + ","
		+ domainModelInfo["ElementAnalytics"].OperationNum + ","
		+ domainModelInfo["ElementAnalytics"].ClassNum  + ","
                + domainModelInfo["ElementAnalytics"].TopLevelClasses + ","
                + domainModelInfo["ElementAnalytics"].AverageDepthInheritanceTree + ","
                + domainModelInfo["ElementAnalytics"].AverageNumberOfChildrenPerBaseClass + ","
                + domainModelInfo["ElementAnalytics"].NumberOfInheritanceRelationships + ","
                + domainModelInfo["ElementAnalytics"].NumberOfDerivedClasses + ","
                + domainModelInfo["ElementAnalytics"].NumberOfClassesInherited + ","
                + domainModelInfo["ElementAnalytics"].NumberOfClassesInheritedFrom + ","
                + domainModelInfo["ElementAnalytics"].NumberOfChildren + ","
                + domainModelInfo["ElementAnalytics"].DepthInheritanceTree + ","
                + domainModelInfo["ElementAnalytics"].CouplingBetweenObjects + ","
        + domainModelInfo["ElementAnalytics"].ParameterNum + ","
		+ domainModelInfo["ElementAnalytics"].UsageNum + ","
		+ domainModelInfo["ElementAnalytics"].RealNum + ","
		+ domainModelInfo["ElementAnalytics"].AssocNum + ","
		+ domainModelInfo["ElementAnalytics"].ExternalOperNum + ","
		+ domainModelInfo["ElementAnalytics"].ObjectDataNum + ","
		+ domainModelInfo["ElementAnalytics"].AvgOperation + ","
		+ domainModelInfo["ElementAnalytics"].AvgAttribute  + ","
		+ domainModelInfo["ElementAnalytics"].AvgParameter + ","
		+ domainModelInfo["ElementAnalytics"].AvgUsage + ","
		+ domainModelInfo["ElementAnalytics"].AvgReal + ","
		+ domainModelInfo["ElementAnalytics"].AvgAssoc + ","
		+ domainModelInfo["ElementAnalytics"].AvgInstVar + ","
		+ domainModelInfo["ElementAnalytics"].WeightedOperNum + ","
		+ domainModelInfo["ElementAnalytics"].MethodSize;
	}


	// callbackfunc is called when the elements are dumped into the files?
	function evaluateUseCase(useCase, model, callbackfunc) {
		useCase["ElementAnalytics"] = {
		TotalDegree:0,
		ElementNum:0,
		AvgDegree:0,
		TotalLinks:0,
		ActorNum:0,
		RoleNum:0,
		AvgActor:0,
		AvgRole:0,
		BoundaryNum:0,
		ControlNum:0,
		EntityNum:0,
		TotalPathLength:0,
		PathNum:0,
//		DiagramNum:0,
		};

//		console.log(useCase);

//		for ( var i in useCase.Diagrams) {
//			var diagram = useCase.Diagrams[i];
//			if(!diagram.DiagramAnalytics){
//				diagram.DiagramAnalytics = {};
//			}

				// element analytics
				var totalDegree = 0;
				var elementNum = 0;
				var totalLinks = 0;
				var actorNum = 0;
				var roleNum = 0;
				var boundaryNum = 0;
				var controlNum = 0;
				var entityNum = 0;
				var totalPathLength = 0;
				var pathNum = 0;


				for ( var j in useCase.Activities) {
					var Element = useCase.Activities[j]; // tag: elements
//					var components = diagram.allocate(Element);
					// if it is mvc decomposed. we are able to understand the boundry, control, and entity.
					if(Element.target){
						var component = Element.target;
						totalDegree += component.InboundNumber;
						var type = component.Type;
						if (type === "actor") {
							actorNum++;
						} else if (type === "boundary") {
							boundaryNum++;
						} else if (type === "control") {
							controlNum++;
						} else if (type === "entity") {
							entityNum++;
						}
//						totalLinks += Element.InboundNumber;
					}

					elementNum++;
//					}
				}
				for(var j in useCase.Actors){
					actorNum++;
				}
				for(var j in useCase.Roles){
					roleNum++;
				}


//				totalLinks += diagram.Edges.length;

				for ( var j in useCase.Paths) {
					var Path = useCase.Paths[j];
					totalPathLength += Path.Nodes.length;
					pathNum++;
				}

				useCase["ElementAnalytics"].TotalDegree = totalDegree;
				useCase["ElementAnalytics"].TotalLinks = totalLinks;
				useCase["ElementAnalytics"].ActorNum = actorNum;
				useCase["ElementAnalytics"].RoleNum = roleNum;
				useCase["ElementAnalytics"].BoundaryNum = boundaryNum;
				useCase["ElementAnalytics"].ControlNum = controlNum;
				useCase["ElementAnalytics"].EntityNum = entityNum;
				useCase["ElementAnalytics"].ElementNum = elementNum;
				useCase["ElementAnalytics"].AvgDegree = useCase["ElementAnalytics"].ElementNum == 0 ? 0: useCase["ElementAnalytics"].TotalDegree / useCase["ElementAnalytics"].ElementNum;
				useCase["ElementAnalytics"].PathNum = pathNum;
				useCase["ElementAnalytics"].AvgActor = useCase["ElementAnalytics"].ElementNum == 0 ? 0: useCase["ElementAnalytics"].ActorNum / useCase["ElementAnalytics"].ElementNum;
				useCase["ElementAnalytics"].RoleActor = useCase["ElementAnalytics"].ElementNum == 0 ? 0: useCase["ElementAnalytics"].RoleNum / useCase["ElementAnalytics"].ElementNum;
				useCase["ElementAnalytics"].AvgPathLength = useCase["ElementAnalytics"].PathNum == 0 ? 0 : useCase["ElementAnalytics"].TotalPathLength / useCase["ElementAnalytics"].PathNum;
				useCase["ElementAnalytics"].TotalPathLength = totalPathLength;

//				useCase["ElementAnalytics"].TotalDegree += diagram["ElementAnalytics"].TotalDegree;
//				useCase["ElementAnalytics"].ElementNum += diagram["ElementAnalytics"].ElementNum;
//				useCase["ElementAnalytics"].AvgDegree += diagram["ElementAnalytics"].AvgDegree;
//				useCase["ElementAnalytics"].TotalLinks += diagram["ElementAnalytics"].TotalLinks;
//				useCase["ElementAnalytics"].ActorNum += diagram["ElementAnalytics"].ActorNum;
//				useCase["ElementAnalytics"].BoundaryNum += diagram["ElementAnalytics"].BoundaryNum;
//				useCase["ElementAnalytics"].ControlNum += diagram["ElementAnalytics"].ControlNum;
//				useCase["ElementAnalytics"].EntityNum += diagram["ElementAnalytics"].EntityNum;
//				useCase["ElementAnalytics"].TotalPathLength += diagram["ElementAnalytics"].TotalPathLength;
//				useCase["ElementAnalytics"].PathNum += diagram["ElementAnalytics"].PathNum;
//				useCase["ElementAnalytics"].DiagramNum++;
//		}

		useCase["ElementAnalytics"].AvgDegree = useCase["ElementAnalytics"].ElementNum == 0 ? 0 : useCase["ElementAnalytics"].TotalDegree / useCase["ElementAnalytics"].ElementNum;
		useCase["ElementAnalytics"].AvgPathLength = useCase["ElementAnalytics"].PathNum == 0 ? 0 : useCase["ElementAnalytics"].TotalPathLength / useCase["ElementAnalytics"].PathNum;

		if (callbackfunc) {

		useCase["ElementAnalytics"].PathAnalyticsFileName = "pathAnalytics.csv";
		useCase["ElementAnalytics"].ElementAnalyticsFileName = "elementAnalytics.csv";
//		useCase["ElementAnalytics"].DiagramAnalyticsFileName = "diagramAnalytics.csv";

		console.log("test use case element analytics");
		console.log(useCase);
		dumpUseCaseElementsInfo(useCase, function(err){

				if(err){
					console.log(err);
					return;
				}

				console.log("evaluate uml elements for use cases");
				//
//				var command = './evaluators/UMLModelElementsEvaluator/UseCaseElementsAnalyticsScript.R "'+useCase.OutputDir+"/"+useCase["ElementAnalytics"].ElementAnalyticsFileName+'" "'+useCase.OutputDir+"/"+useCase["ElementAnalytics"].PathAnalyticsFileName+'" "'+useCase.OutputDir+'" "."';
				var command1 = '"./Rscript/OutputStatistics.R" "'+useCase.OutputDir+"/"+useCase["ElementAnalytics"].ElementAnalyticsFileName+'" "'+useCase.OutputDir+'" "." "element_statistics.json"';
				console.log(command1);
				
				RScriptExec.runRScript(command1,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					
					var command2 = '"./Rscript/OutputStatistics.R" "'+useCase.OutputDir+"/"+useCase["ElementAnalytics"].PathAnalyticsFileName+'" "'+useCase.OutputDir+'" "." "path_statistics.json"';
					console.log(command2);
					
					RScriptExec.runRScript(command2,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						if(callbackfunc){
							callbackfunc(useCase["ElementAnalytics"]);
						}
					});
				});
		});	
		}

		return useCase["ElementAnalytics"];
	}

	function evaluateDomainModel(domainModelInfo, callbackfunc) {

		domainModelInfo["ElementAnalytics"] = {
				AttributeNum :0,
				OperationNum :0,
				EntityNum :0,
				ClassNum: 0,
                                TopLevelClasses :0,
                                AverageDepthInheritanceTree :0,
                                AverageNumberOfChildrenPerBaseClass :0,
                                NumberOfInheritanceRelationships :0,
                                NumberOfDerivedClasses :0,
                                NumberOfClassesInherited :0,
                                NumberOfClassesInheritedFrom :0,
                                NumberOfChildren :0,
                                DepthInheritanceTree :0,
                                CouplingBetweenObjects :0,

                ParameterNum :0,
				UsageNum: 0,
				RealNum: 0,
				AssocNum: 0,
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
				MethodSize: 0,
				EntityAnalyticsFileName : 'entityAnalytics.csv',
				AttributeAnalyticsFileName :  'attributeAnalytics.csv',
				OperationAnalyticsFileName : 'operationAnalytics.csv'
	        }
				// ILF += diagram["ElementAnalytics"].ILF;
				// EIF += diagram["ElementAnalytics"].EIF;
//				DiagramNum :0,
				//EntityAnalyticsFileName : 'entityAnalytics.csv',
				//AttributeAnalyticsFileName :  'attributeAnalytics.csv',
				//OperationAnalyticsFileName : 'operationAnalytics.csv'
		//}

// console.log('-----------domain model------------');
//		for ( var i in domainModelInfo.Diagrams) {

//			var diagram = domainModelInfo.Diagrams[i];

			var attributeNum = 0;
			var operationNum = 0;
			var entityNum = 0;
			var classNum = 0;
                        var topLevelClasses = 0;
                        var averageDepthInheritanceTree = 0;
                        var averageNumberOfChildrenPerBaseClass = 0;
                        var numberOfInheritanceRelationships = 0;
                        var numberOfDerivedClasses = 0;
                        var numberOfClassesInherited = 0;
                        var numberOfClassesInheritedFrom = 0;
                        var numberOfChildren = 0;
                        var depthInheritanceTree = 0;
                        var couplingBetweenObjects = 0;

            var parameterNum = 0;
			var instanceVarNum = 0;
			var externalOperNum = 0;
			var objectdataNum = 0;

			for ( var i in domainModelInfo.Elements) {
                            var element = domainModelInfo.Elements[i];
                            entityNum++;
                            classNum++;
                            for ( var j in element.Attributes) {
                                var attribute = element.Attributes[j];
                                attributeNum++;
                                if ( attribute['isStatic'] == "false"){
									instanceVarNum++;
								}

                            }

                            for ( var j in element.Operations) {
                                var operation = element.Operations[j];
                                operationNum++;
                                if (operation['Visibility'] == "public"){
									externalOperNum++;
								}
								for ( var k in operation.Parameters){
									var parameter = operation.Parameters[k];
									parameterNum++;
								}
                            }
                            if(element.Attributes.length>0 && element.Operations.length==0){
								objectdataNum++;
							}
			}
                        if (domainModelInfo.InheritanceStats) {
                            inheritanceStats = domainModelInfo.InheritanceStats;
                            topLevelClasses = inheritanceStats['topLevelClasses'];
                            couplingBetweenObjects = inheritanceStats['coupling'];
                            numberOfInheritanceRelationships = Object.keys(inheritanceStats['children']).length;
                            numberOfClassesInherited = Object.keys(inheritanceStats['children']).length;
                            numberOfClassesInheritedFrom = inheritanceStats['numInheritedFrom'];
                            for (var key in inheritanceStats['numOfChildren']) {
                                numberOfChildren += inheritanceStats['numOfChildren'][key];
                            }
                            numberOfDerivedClasses = numberOfChildren;
                            averageNumberOfChildrenPerBaseClass = (Object.keys(inheritanceStats['numOfChildren']).length === 0) ? 0 : numberOfChildren / Object.keys(inheritanceStats['numOfChildren']).length;
                            for (var key in inheritanceStats['tree']) {
                                depth = 0;
                                val = inheritanceStats['tree'][key];
                                while (val !== '#') {
                                    depth++;
                                    val = inheritanceStats['tree'][val];
                                }
                                depthInheritanceTree += depth;
                            }
                            averageDepthInheritanceTree = (Object.keys(inheritanceStats['numOfChildren']).length === 0) ? 0 : depthInheritanceTree / Object.keys(inheritanceStats['tree']).length;
//                        averageDepthInheritanceTree = (Object.keys(inheritanceStats['numOfChildren']).length === 0) ? 0 : depthInheritanceTree / Object.keys(inheritanceStats['tree']).length;
			}
			var usageNum = 0;
			var realNum = 0;
			var assocNum = 0;

			for ( var i in domainModelInfo.Usages) {
				var usage = domainModelInfo.Usages[i];
					usageNum++;
			}
			for ( var i in domainModelInfo.Realization) {
				var realization = domainModelInfo.Realization[i];
					realNum++;
			}
			for ( var i in domainModelInfo.Assoc) {
				var association = domainModelInfo.Assoc[i];
					assocNum++;
			}

//			diagram["ElementAnalytics"] = {};
			domainModelInfo["ElementAnalytics"].AttributeNum = attributeNum;
			domainModelInfo["ElementAnalytics"].OperationNum = operationNum;
			domainModelInfo["ElementAnalytics"].EntityNum = entityNum;
			domainModelInfo["ElementAnalytics"].ClassNum = classNum;
                        domainModelInfo["ElementAnalytics"].TopLevelClasses = topLevelClasses;
                        domainModelInfo["ElementAnalytics"].AverageDepthInheritanceTree = averageDepthInheritanceTree;
                        domainModelInfo["ElementAnalytics"].DepthInheritanceTree = depthInheritanceTree;
                        domainModelInfo["ElementAnalytics"].AverageNumberOfChildrenPerBaseClass = averageNumberOfChildrenPerBaseClass;
                        domainModelInfo["ElementAnalytics"].NumberOfInheritanceRelationships = numberOfInheritanceRelationships;
                        domainModelInfo["ElementAnalytics"].NumberOfDerivedClasses = numberOfDerivedClasses;
                        domainModelInfo["ElementAnalytics"].NumberOfClassesInherited = numberOfClassesInherited;
                        domainModelInfo["ElementAnalytics"].NumberOfChildren = numberOfChildren;
                        domainModelInfo["ElementAnalytics"].NumberOfClassesInheritedFrom = numberOfClassesInheritedFrom;
                        domainModelInfo["ElementAnalytics"].CouplingBetweenObjects = couplingBetweenObjects;

            domainModelInfo["ElementAnalytics"].ObjectDataNum = objectdataNum;
			domainModelInfo["ElementAnalytics"].ParameterNum = parameterNum;
			domainModelInfo["ElementAnalytics"].ExternalOperNum = externalOperNum;
			domainModelInfo["ElementAnalytics"].AvgInstVar = domainModelInfo["ElementAnalytics"].EntityNum == 0 ? 0 : instanceVarNum / domainModelInfo["ElementAnalytics"].EntityNum;
			domainModelInfo["ElementAnalytics"].UsageNum = usageNum;
			domainModelInfo["ElementAnalytics"].RealNum = realNum;
			domainModelInfo["ElementAnalytics"].AssocNum = assocNum;
			domainModelInfo["ElementAnalytics"].AvgOperation = domainModelInfo["ElementAnalytics"].EntityNum == 0 ? 0 : domainModelInfo["ElementAnalytics"].OperationNum / domainModelInfo["ElementAnalytics"].EntityNum;
			domainModelInfo["ElementAnalytics"].AvgAttribute = domainModelInfo["ElementAnalytics"].EntityNum == 0 ? 0 : domainModelInfo["ElementAnalytics"].AttributeNum / domainModelInfo["ElementAnalytics"].EntityNum;
			domainModelInfo["ElementAnalytics"].AvgParameter = domainModelInfo["ElementAnalytics"].EntityNum == 0 ? 0 : domainModelInfo["ElementAnalytics"].ParameterNum / domainModelInfo["ElementAnalytics"].EntityNum;
			domainModelInfo["ElementAnalytics"].AvgUsage = domainModelInfo["ElementAnalytics"].EntityNum == 0 ? 0 : domainModelInfo["ElementAnalytics"].UsageNum / domainModelInfo["ElementAnalytics"].EntityNum;
			domainModelInfo["ElementAnalytics"].AvgReal = domainModelInfo["ElementAnalytics"].EntityNum == 0 ? 0 : domainModelInfo["ElementAnalytics"].RealNum / domainModelInfo["ElementAnalytics"].EntityNum;
			domainModelInfo["ElementAnalytics"].AvgAssoc = domainModelInfo["ElementAnalytics"].EntityNum == 0 ? 0 : domainModelInfo["ElementAnalytics"].AssocNum / domainModelInfo["ElementAnalytics"].EntityNum;


//
//			domainModelInfo["ElementAnalytics"].AttributeNum += diagram["ElementAnalytics"].AttributeNum;
//			domainModelInfo["ElementAnalytics"].OperationNum += diagram["ElementAnalytics"].OperationNum;
//			domainModelInfo["ElementAnalytics"].EntityNum += diagram["ElementAnalytics"].EntityNum;

//			domainModelInfo["ElementAnalytics"].DiagramNum++;
//		}

		if (callbackfunc) {

			dumpDomainModelElementsInfo(domainModelInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			console.log("evaluate uml elements for domain model");

//			var command = './evaluators/UMLModelElementsEvaluator/DomainModelElementsAnalyticsScript.R "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].OperationAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "domain_model_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				var command2 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "attribute_statistics.json"';
				
				
				RScriptExec.runRScript(command2,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					var command3 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["ElementAnalytics"].OperationAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "operation_statistics.json"';
					
					
					RScriptExec.runRScript(command3,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						if(callbackfunc){
							callbackfunc(domainModelInfo["ElementAnalytics"]);
						}
					});
				});
			});
		});
		}

		return domainModelInfo["ElementAnalytics"];
	}

	function evaluateModel(modelInfo, callbackfunc) {

		modelInfo["ElementAnalytics"] = {
//				DiagramNum : 0,
				AttributeNum : 0,
				OperationNum : 0,
				EntityNum : 0,
				ElementNum : 0,
				TotalPathLength : 0,
				PathNum : 0,
				UseCaseNum : 0,
				TotalLinks : 0,
				ActorNum : 0,
				BoundaryNum : 0,
				ControlNum : 0,
				EntityNum : 0,
				TotalDegree : 0,
				RoleNum : 0,
				AvgActor : 0,
				AvgRole : 0,
				AttributeNum : 0,
				OperationNum : 0,
				ClassNum  : 0,
		        TopLevelClasses : 0,
		        AverageDepthInheritanceTree : 0,
		        AverageNumberOfChildrenPerBaseClass : 0,
		        NumberOfInheritanceRelationships : 0,
		        NumberOfDerivedClasses : 0,
		        NumberOfClassesInherited : 0,
		        NumberOfClassesInheritedFrom : 0,
		        NumberOfChildren : 0,
		        DepthInheritanceTree : 0,
		        CouplingBetweenObjects : 0,
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
				MethodSize : 0,
				EntityAnalyticsFileName : "entityAnalytics.csv",
				AttributeAnalyticsFileName : "attributeAnalytics.csv",
				OperationAnalyticsFileName : "operationAnalytics.csv",
				ElementAnalyticsFileName : "elementAnalytics.csv",
				PathAnalyticsFileName : "pathAnalytics.csv"
		}

		for ( var i in modelInfo.UseCases) {
			var useCase = modelInfo.UseCases[i];

			if(useCase["ElementAnalytics"]){
			modelInfo["ElementAnalytics"].TotalPathLength += useCase["ElementAnalytics"].TotalPathLength;
			modelInfo["ElementAnalytics"].PathNum += useCase["ElementAnalytics"].PathNum;
			modelInfo["ElementAnalytics"].UseCaseNum++;
//			modelInfo["ElementAnalytics"].DiagramNum += useCase["ElementAnalytics"].DiagramNum;

			modelInfo["ElementAnalytics"].TotalLinks += useCase["ElementAnalytics"].TotalLinks;
			modelInfo["ElementAnalytics"].ActorNum += useCase["ElementAnalytics"].ActorNum;
			modelInfo["ElementAnalytics"].BoundaryNum += useCase["ElementAnalytics"].BoundaryNum;
			modelInfo["ElementAnalytics"].ControlNum += useCase["ElementAnalytics"].ControlNum;
			modelInfo["ElementAnalytics"].EntityNum += useCase["ElementAnalytics"].EntityNum;

			modelInfo["ElementAnalytics"].TotalDegree += useCase["ElementAnalytics"].TotalDegree;
			modelInfo["ElementAnalytics"].ElementNum += useCase["ElementAnalytics"].ElementNum;

			//need to recalculate here.
			modelInfo["ElementAnalytics"].RoleNum += useCase["ElementAnalytics"].RoleNum;
			modelInfo["ElementAnalytics"].AvgActor += useCase["ElementAnalytics"].AvgActor;
			modelInfo["ElementAnalytics"].AvgRole += useCase["ElementAnalytics"].AvgRole;
			}
		}

		modelInfo["ElementAnalytics"].AvgPathLength = modelInfo["ElementAnalytics"].PathNum == 0 ? 0 : modelInfo["ElementAnalytics"].TotalPathLength / modelInfo["ElementAnalytics"].PathNum;
		modelInfo["ElementAnalytics"].AvgDegree = modelInfo["ElementAnalytics"].ElementNum == 0 ? 0 : modelInfo["ElementAnalytics"].TotalDegree / modelInfo["ElementAnalytics"].ElementNum;

		// analyse domain model
		var domainModelInfo = modelInfo.DomainModel;


		if(domainModelInfo && domainModelInfo["ElementAnalytics"]){
		modelInfo["ElementAnalytics"].AttributeNum = domainModelInfo["ElementAnalytics"].AttributeNum;
		modelInfo["ElementAnalytics"].OperationNum = domainModelInfo["ElementAnalytics"].OperationNum;
//		modelInfo["ElementAnalytics"].DiagramNum += domainModelInfo["ElementAnalytics"].DiagramNum;
		modelInfo["ElementAnalytics"].EntityNum = domainModelInfo["ElementAnalytics"].EntityNum;
		modelInfo["ElementAnalytics"].AttributeNum = domainModelInfo["ElementAnalytics"].AttributeNum;
		modelInfo["ElementAnalytics"].OperationNum = domainModelInfo["ElementAnalytics"].OperationNum
		modelInfo["ElementAnalytics"].ClassNum  = domainModelInfo["ElementAnalytics"].ClassNum;
                modelInfo["ElementAnalytics"].TopLevelClasses = domainModelInfo["ElementAnalytics"].TopLevelClasses;
                modelInfo["ElementAnalytics"].AverageDepthInheritanceTree = domainModelInfo["ElementAnalytics"].AverageDepthInheritanceTree;
                modelInfo["ElementAnalytics"].AverageNumberOfChildrenPerBaseClass = domainModelInfo["ElementAnalytics"].AverageNumberOfChildrenPerBaseClass;
                modelInfo["ElementAnalytics"].NumberOfInheritanceRelationships = domainModelInfo["ElementAnalytics"].NumberOfInheritanceRelationships;
                modelInfo["ElementAnalytics"].NumberOfDerivedClasses = domainModelInfo["ElementAnalytics"].NumberOfDerivedClasses;
                modelInfo["ElementAnalytics"].NumberOfClassesInherited = domainModelInfo["ElementAnalytics"].NumberOfClassesInherited;
                modelInfo["ElementAnalytics"].NumberOfClassesInheritedFrom = domainModelInfo["ElementAnalytics"].NumberOfClassesInheritedFrom;
                modelInfo["ElementAnalytics"].NumberOfChildren = domainModelInfo["ElementAnalytics"].NumberOfChildren;
                modelInfo["ElementAnalytics"].DepthInheritanceTree = domainModelInfo["ElementAnalytics"].DepthInheritanceTree;
                modelInfo["ElementAnalytics"].CouplingBetweenObjects = domainModelInfo["ElementAnalytics"].CouplingBetweenObjects;
        modelInfo["ElementAnalytics"].ParameterNum = domainModelInfo["ElementAnalytics"].ParameterNum;
		modelInfo["ElementAnalytics"].UsageNum = domainModelInfo["ElementAnalytics"].UsageNum;
		modelInfo["ElementAnalytics"].RealNum = domainModelInfo["ElementAnalytics"].RealNum;
		modelInfo["ElementAnalytics"].AssocNum = domainModelInfo["ElementAnalytics"].AssocNum;
		modelInfo["ElementAnalytics"].ExternalOperNum = domainModelInfo["ElementAnalytics"].ExternalOperNum;
		modelInfo["ElementAnalytics"].ObjectDataNum = domainModelInfo["ElementAnalytics"].ObjectDataNum;
		modelInfo["ElementAnalytics"].AvgOperation = domainModelInfo["ElementAnalytics"].AvgOperation;
		modelInfo["ElementAnalytics"].AvgAttribute  = domainModelInfo["ElementAnalytics"].AvgAttribute;
		modelInfo["ElementAnalytics"].AvgParameter = domainModelInfo["ElementAnalytics"].AvgParameter;
		modelInfo["ElementAnalytics"].AvgUsage = domainModelInfo["ElementAnalytics"].AvgUsage;
		modelInfo["ElementAnalytics"].AvgReal = domainModelInfo["ElementAnalytics"].AvgReal;
		modelInfo["ElementAnalytics"].AvgAssoc = domainModelInfo["ElementAnalytics"].AvgAssoc;
		modelInfo["ElementAnalytics"].AvgInstVar = domainModelInfo["ElementAnalytics"].AvgInstVar;
		modelInfo["ElementAnalytics"].WeightedOperNum = domainModelInfo["ElementAnalytics"].WeightedOperNum;
		modelInfo["ElementAnalytics"].MethodSize = domainModelInfo["ElementAnalytics"].MethodSize;
		}

		if (callbackfunc) {

			dumpModelElementsInfo(modelInfo, function(err){
			if(err){
				callbackfunc(err);
			}

			//Needs to be upgraded soon
			console.log("evaluate uml elements at model level");

//			var command = './evaluators/UMLModelElementsEvaluator/ModelElementsAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].OperationAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].ElementAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].PathAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "entity_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				var command2 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "attribute_statistics.json"';
				
				
				RScriptExec.runRScript(command2,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					var command3 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].ElementAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "element_statistics.json"';
					
					
					RScriptExec.runRScript(command3,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						var command4 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["ElementAnalytics"].PathAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "path_statistics.json"';
						
						
						RScriptExec.runRScript(command4,function(result){
							if (!result) {
								if(callbackfunc){
									callbackfunc(false);
								}
								return;
							}
							if(callbackfunc){
								callbackfunc(modelInfo["ElementAnalytics"]);
							}
						});
					});
				});
			});
		});
		}

		return modelInfo["ElementAnalytics"];
	}

	function evaluateRepo(repoInfo, callbackfunc) {
		repoInfo["ElementAnalytics"] = {
		PathNum:0,
		TotalPathLength:0,
		PathNum:0,
		CCSS:0,
		TotalLinks:0,
		ActorNum:0,
		BoundaryNum:0,
		ControlNum:0,
		EntityNum:0,
		TotalDegree:0,
		ElementNum:0,
		EntityAnalyticsFileName : "entityAnalytics.csv",
		AttributeAnalyticsFileName : "attributeAnalytics.csv",
		OperationAnalyticsFileName : "operationAnalytics.csv",
		ElementAnalyticsFileName : "elementAnalytics.csv",
		PathAnalyticsFileName : "pathAnalytics.csv"
		}
//		repoInfo.RepoAnalytics = repoInfo["ElementAnalytics"];


		for ( var i in repoInfo.Models) {
			var modelInfo = repoInfo.Models[i];

			if(modelInfo["ElementAnalytics"]){
			repoInfo["ElementAnalytics"].TotalPathLength += modelInfo["ElementAnalytics"].TotalPathLength;
			repoInfo["ElementAnalytics"].PathNum += modelInfo["ElementAnalytics"].PathNum;

			repoInfo["ElementAnalytics"].TotalPathLength += modelInfo["ElementAnalytics"].TotalPathLength;
			repoInfo["ElementAnalytics"].PathNum += modelInfo["ElementAnalytics"].PathNum;
			repoInfo["ElementAnalytics"].CCSS += modelInfo["ElementAnalytics"].CCSS;
			repoInfo["ElementAnalytics"].TotalLinks += modelInfo["ElementAnalytics"].TotalLinks;
			repoInfo["ElementAnalytics"].ActorNum += modelInfo["ElementAnalytics"].ActorNum;
			repoInfo["ElementAnalytics"].BoundaryNum += modelInfo["ElementAnalytics"].BoundaryNum;
			repoInfo["ElementAnalytics"].ControlNum += modelInfo["ElementAnalytics"].ControlNum;
			repoInfo["ElementAnalytics"].EntityNum += modelInfo["ElementAnalytics"].EntityNum;

			repoInfo["ElementAnalytics"].TotalDegree += modelInfo["ElementAnalytics"].TotalDegree;
			repoInfo["ElementAnalytics"].ElementNum += modelInfo["ElementAnalytics"].ElementNum;
			}
		}

		repoInfo["ElementAnalytics"].AvgPathLength = repoInfo["ElementAnalytics"].PathNum == 0 ? 0 : repoInfo["ElementAnalytics"].TotalPathLength / repoInfo["ElementAnalytics"].PathNum;
		repoInfo["ElementAnalytics"].AvgDegree = repoInfo["ElementAnalytics"].ElementNum == 0 ? 0 : repoInfo["ElementAnalytics"].TotalDegree / repoInfo["ElementAnalytics"].ElementNum;

		repoInfo["ElementAnalytics"].repoModelEvaluationResultsPath = repoInfo.OutputDir + "/Model_Evaluation_Results";

		if (callbackfunc) {

			dumpRepoElementsInfo(repoInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			//Needs to be upgraded soon
			console.log("evaluate uml elements at repo level");
//			var command = './evaluators/UMLModelElementsEvaluator/ModelElementsAnalyticsScript.R "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].OperationAnalyticsFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].ElementAnalyticsFileName+'" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].PathAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].EntityAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "entity_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				var command2 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].AttributeAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "attribute_statistics.json"';
				
				
				RScriptExec.runRScript(command2,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					var command3 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].OperationAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "operation_statistics.json"';
					
					
					RScriptExec.runRScript(command3,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						var command4 = '"./Rscript/OutputStatistics.R" "'+repoInfo.OutputDir+"/"+repoInfo["ElementAnalytics"].PathAnalyticsFileName+'" "'+repoInfo.OutputDir+'" "." "path_statistics.json"';
						
						
						RScriptExec.runRScript(command4,function(result){
							if (!result) {
								if(callbackfunc){
									callbackfunc(false);
								}
								return;
							}
							if(callbackfunc){
								callbackfunc(repoInfo["ElementAnalytics"]);
							}
						});
					});
				});
			});

		});
		}

		return repoInfo["ElementAnalytics"];
	}

	function dumpUseCaseElementsInfo(useCase, callbackfunc, elementNum, pathNum, expandedPathNum) {
		// console.log("dump useCase analytics");

		elementNum = !elementNum ? 0 : elementNum;
		pathNum = !pathNum ? 0 : pathNum;
//		expandedPathNum = !expandedPathNum ? 0 : expandedPathNum;
//		diagramNum = !diagramNum ? 0 : diagramNum;

		var elementAnalyticsStr = elementNum == 0 ? "id,element,useCase,type,outboundDegree,inboundDegree\n" : "";
		var pathAnalyticsStr = pathNum == 0 ? "id,path,useCase,path_length, boundry_num, control_num, entity_num, actor_num\n" : "";
//		var expandedPathAnalyticsStr = expandedPathNum == 0 ? "id,path,diagram,useCase,transactional,path_length\n" : "";
//		var diagramAnalyticsStr = diagramNum == 0 ? "id,diagram, useCase,path_num,element_num,boundry_num,control_num,entity_num,actor_num,total_degree,avg_degree,avg_path_length,total_links\n" : "";

//		for ( var i in useCase.Diagrams) {
//			var diagram = useCase.Diagrams[i];

			for ( var i in useCase.Paths) {
				var path = useCase.Paths[i];
				umlModelProcessor.processPath(path, useCase);
				pathNum++;
				pathAnalyticsStr += pathNum + ","
						+ path.PathStr.replace(/,/gi, "") + ","
//						+ diagram.Name + ","
						+ useCase.Name + ","
						+ path.length + ","
						+ path.boundaryNum + ","
						+ path.controlNum + ","
						+ path.entityNum + ","
						+ path.actorNum+"\n";
			}


			for ( var i in useCase.Activities) {
				var element = useCase.Activities[i];
				var elementName = element.Name ? element.Name.replace(/,/gi, "") : "undefined";
				var elementType = "";
//				var components = diagram.allocate(Element);
				if(element.target){
					var component = element.target;
					elementType = component.Type;
				}
				elementNum++;
				elementAnalyticsStr += elementNum + ","
						+ elementName + ","
//						+ diagram.Name + ","
						+ useCase.Name + "," +
						+ elementType+ ","
						+ element.OutboundNumber + ","
						+ element.InboundNumber+"\n";
			}



//			var diagram["ElementAnalytics"] = diagram.DiagramAnalytics;
//			diagramAnalyticsStr += diagramNum + ","
//					+ diagram.Name+ ","
//					+ useCase.Name+ ","
//					+ diagram["ElementAnalytics"].PathNum + ","
//					+ diagram["ElementAnalytics"].ElementNum + ","
//					+ diagram["ElementAnalytics"].BoundaryNum + ","
//					+ diagram["ElementAnalytics"].ControlNum + ","
//					+ diagram["ElementAnalytics"].EntityNum + ","
//					+ diagram["ElementAnalytics"].ActorNum + ","
//					+ diagram["ElementAnalytics"].TotalDegree + ","
//					+ diagram["ElementAnalytics"].AvgDegree + ","
//					+ diagram["ElementAnalytics"].AvgPathLength + ","
//					+ diagram["ElementAnalytics"].TotalLinks + "\n"

//			diagramNum++;
//		}

		if(callbackfunc){

		var files = [{fileName : useCase["ElementAnalytics"].ElementAnalyticsFileName, content : elementAnalyticsStr},
			{fileName : useCase["ElementAnalytics"].PathAnalyticsFileName, content : pathAnalyticsStr}];

		umlFileManager.writeFiles(useCase.OutputDir, files, callbackfunc);
		}

		return {
			elementAnalyticsStr: elementAnalyticsStr,
			elementNum: elementNum,
			pathAnalyticsStr: pathAnalyticsStr,
			pathNum: pathNum,
//			diagramAnalyticsStr: diagramAnalyticsStr,
//			diagramNum: diagramNum
		}

	}

	function dumpDomainModelElementsInfo(domainModelInfo, callbackfunc, entityNum, attributeNum, operationNum) {

		entityNum = !entityNum ? 0 : entityNum;
		attributeNum = !attributeNum ? 0 : attributeNum;
		operationNum = !operationNum ? 0 : operationNum;

//		console.log("domain model");
//		console.log(domainModelInfo);

		var entityAnalyticsStr = entityNum == 0 ? "id,element,attributeNum,operationNum\n" : "";
		var attributeAnalyticsStr = attributeNum == 0 ? "id,attribute,type,element\n" : "";
		var operationAnalyticsStr = operationNum == 0 ? "id,operation,element\n" : "";

//		for ( var i in domainModelInfo.Diagrams) {

//			var diagram = domainModelInfo.Diagrams[i];

			for ( var i in domainModelInfo.Elements) {

				var element = domainModelInfo.Elements[i];

					entityNum++;
					entityAnalyticsStr += entityNum + ","
						+ element.Name + ","
						+ element.Attributes.length + ","
						+ element.Operations.length + "\n";

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
//		}

		// console.log(domainModelInfo["ElementAnalytics"]);

		if(callbackfunc){

		var files = [{fileName : domainModelInfo["ElementAnalytics"].EntityAnalyticsFileName , content : entityAnalyticsStr },
			{fileName : domainModelInfo["ElementAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : domainModelInfo["ElementAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr}];

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

	function dumpModelElementsInfo(modelInfo, callbackfunc, elementNum, pathNum, entityNum, attributeNum, operationNum) {


		elementNum = !elementNum ? 0 : elementNum;
		pathNum = !pathNum ? 0 : pathNum;
		entityNum = !entityNum ? 0 : entityNum;
		attributeNum = !attributeNum ? 0 : attributeNum;
		operationNum = !operationNum ? 0 : operationNum;


//		var modelInfo["ElementAnalytics"] = modelInfo.ModelAnalytics;
		// console.log(modelInfo["ElementAnalytics"]);

		var elementAnalyticsStr = "";
		var pathAnalyticsStr = "";
		var entityAnalyticsStr = "";
		var attributeAnalyticsStr = "";
		var operationAnalyticsStr = "";

//		var elementAnalyticsStr = "id,element,type,outbound_degree,inbound_degree,diagram,useCase\n";
//		var pathAnalyticsStr = "id,path,diagram,useCase, path_length, boundary_num, control_num, entity_num, actor_num, utw, \n";

		for ( var i in modelInfo.UseCases) {
			var useCase = modelInfo.UseCases[i];
			var useCaseDump = dumpUseCaseElementsInfo(useCase, null, elementNum, pathNum);
			pathNum = useCaseDump.pathNum;
			pathAnalyticsStr += useCaseDump.pathAnalyticsStr;
			elementNum = useCaseDump.elementNum;
			elementAnalyticsStr += useCaseDump.elementAnalyticsStr;
		}


//		var entityAnalyticsStr = "id,element,attributeNum,operationNum,diagram\n";
//		var attributeAnalyticsStr = "id,attribute,type,element,diagram\n";
//		var operationAnalyticsStr = "id,operation,element,diagram\n";

//		console.log("''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''")
//		console.log(model);
		
		if(modelInfo.DomainModel){
	    domainModelDump = dumpDomainModelElementsInfo(modelInfo.DomainModel);
		
	    entityNum = domainModelDump.entityNum;
	    entityAnalyticsStr += domainModelDump.entityAnalyticsStr;
	    attributeNum = domainModelDump.attributeNum;
	    attributeAnalyticsStr += domainModelDump.attributeAnalyticsStr;
	    operationNum = domainModelDump.operationNum;
	    operationAnalyticsStr += domainModelDump.operationAnalyticsStr;
		}
		

		// console.log(domainModelInfo["ElementAnalytics"]);

		if(callbackfunc){

		var files = [{fileName : modelInfo["ElementAnalytics"].PathAnalyticsFileName , content : pathAnalyticsStr },
			{fileName : modelInfo["ElementAnalytics"].ElementAnalyticsFileName, content : elementAnalyticsStr},
			{fileName : modelInfo["ElementAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr},
			{fileName : modelInfo["ElementAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : modelInfo["ElementAnalytics"].EntityAnalyticsFileName, content : entityAnalyticsStr}
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
			pathAnalyticsStr: pathAnalyticsStr,
			pathNum: pathNum,
		}

	}

	function dumpRepoElementsInfo(repoInfo, callbackfunc) {

		var elementNum = 0;
		var pathNum = 0;
		var entityNum = 0;
		var attributeNum = 0;
		var operationNum = 0;

//		var repoInfo["ElementAnalytics"] = repoInfo.RepoAnalytics;
		// console.log(repoInfo.OutputDir);

		var pathAnalyticsStr = "";
		var elementAnalyticsStr = "";
		var entityAnalyticsStr = "";
		var attributeAnalyticsStr = "";
		var operationAnalyticsStr = "";

//		var pathAnalyticsStr = "id,path,functional,transactional,path_length,avg_degree,arch_diff,diagram,use_case,model\n";
//		var elementAnalyticsStr = "id,element,type,outboundDegree,inboundDegree,diagram,useCase,model\n";
//		var entityAnalyticsStr = "id,element,attributeNum,operationNum,diagram\n";
//		var attributeAnalyticsStr = "id,attribute,type,element,diagram\n";
//		var operationAnalyticsStr = "id,operation,element,diagram\n";

		for ( var i in repoInfo.Models) {

			var modelInfo = repoInfo.Models[i];
			var modelDump = dumpModelElementsInfo(modelInfo, null, elementNum, pathNum, entityNum, attributeNum, operationNum);

			pathNum = modelDump.pathNum;
			pathAnalyticsStr += modelDump.pathAnalyticsStr;
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

			var files = [{fileName : repoInfo["ElementAnalytics"].PathAnalyticsFileName , content : pathAnalyticsStr},
				{fileName : repoInfo["ElementAnalytics"].ElementAnalyticsFileName, content : elementAnalyticsStr},
				{fileName : repoInfo["ElementAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr},
				{fileName : repoInfo["ElementAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
				{fileName : repoInfo["ElementAnalytics"].EntityAnalyticsFileName, content : entityAnalyticsStr}
			];
			
			
			console.log(repoInfo[0]);

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
