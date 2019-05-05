/**
 * http://usejsdoc.org/
 *
 * This evaluator will be responsible for evaluating the UML models based on the collected size metrics.
 * 
 * The major method is to map the values from UMLModelElementsEvaluator
 *
 * The basic elements, for example, include:
 *
	// Tan [6]
				NOET:0, //Number of entity type
				NOAAE:0, //Number of attributes of all the entities
				NORT:0, //Number of relationship types
		// Costagliola [7]
				NEM:0, //Number of External Methods
				NSR:0, //Number of Services Requested 
				NOA:0, //Number of Attributes
				NOS:0, //Number of use cases/scenario scripts 
				WMC:0, //Weighted methods per class
				MPC:0, //Methods per class
				NOCH:0, //Number of children
				DIT:0, //Depth in inheritance tree
//				CBO:0, //Coupling between objects
				NIVPC:0, //Number of instance variables per class
				NUMS:0, //Number of unique messages sent
				NCI:0, //Number of classes inherited
				NCIF :0, //Number of classes inherited from
		        RR:0, //Reuse ration
		        NTLC:0, //Number of top level classes
		        ANWMC:0, //Average number of weighted methods per classes
		        ADIT:0, //Average depth of inheritance tree 
		        NOCPBC:0, //Average number of children per base class
	   // Albrecht [3]
		        EIF:0, //External interface files
		        ILF:0, //Internal logic files
		        DET:0, //Data element types 
		        FTR:0, //File type referenced
	  // Karner [4]
		        NT:0, //Number of Transactions
		        NOC:0, //Number of use cases
				NOA:0, //Number of actors
	 // Kim [9]
				NOA:0,  //Number of actors
				NOUC:0, //Number of use cases
				NOR:0, //Number of roles
				ANAPUC:0, //Average number of actors per use case
				ANRPUC:0, //Average number of roles per use case
				UCP:0, //Use Case Points
				NOC:0, //Number of classes
				NOIR:0,  //Number of Inheritance Relationships
				NOUR:0, //Number of use relationships
				NORR:0,  //Number of realize relationships
				NOM:0,  //Number of methods
				NOP:0,  //Number of parameters
				NOCAL:0,   //Number of class attributes
				NOASSOC:0,  //Number of associations
				ANMC:0,  //Average number of methods per class
				ANPC:0, //Average Number of parameters per class
				ANCAC :0,  //Average number of class attributes per class
				ANASSOCC:0, //Average number of associations per class
				ANRELC:0, //Average number of relationships per class 
	// Zivkoviˇc1001[10]
				NOC:0, //Number of classes
				NOAPC:0, //Number of attributes per class 
				NODET:0, //Number of data element types
				NORET:0, //Number of records
				NOA:0, //Number of associations
				NOMPC:0, //Number of methods per class
				NPPM:0, //Number of parameters per method
				NMT:0, //Number of method types
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
		return "NOET,NOAAE,NORT,NEM,NSR,NOS,WMC,MPC,DIT,NIVPC,NUMS,RR,NTLC,ANWMC,ADIT,NOCPBC,EIF,ILF,DET,FTR,NT,NOC,NOA,NOUC,NOR,ANAPUC,ANRPUC,UCP,NOC,NOIR,NOUR,NORR,NOM,NOP,NOCAL,NOASSOC,ANMC,ANPC,ANCAC,ANASSOCC,ANRELC,NOC,NOAPC,NODET,NORET,NOMPC,NPPM,NMT";
	}

	function toModelEvaluationRow(modelInfo, index) {
//		to implement the metrics that should be used to evaluate software size
		var row = 
		// Tan [6]
				modelInfo["SizeMetricAnalytics"].NOET + "," //Number of entity type
				+ modelInfo["SizeMetricAnalytics"].NOAAE+ "," //Number of attributes of all the entities
				+ modelInfo["SizeMetricAnalytics"].NORT + "," //Number of relationship types
		// Costagliola [7]
				+ modelInfo["SizeMetricAnalytics"].NEM + "," //Number of External Methods
				+ modelInfo["SizeMetricAnalytics"].NSR + "," //Number of Services Requested
				+ modelInfo["SizeMetricAnalytics"].NOS + "," //Number of use cases/scenario scripts 
				+ modelInfo["SizeMetricAnalytics"].WMC + "," //Weighted methods per class
				+ modelInfo["SizeMetricAnalytics"].MPC + "," //Methods per class
//				+ modelInfo["SizeMetricAnalytics"].NOCH + "," //Number of children
				+ modelInfo["SizeMetricAnalytics"].DIT + "," //Depth in inheritance tree
//				+ modelInfo["SizeMetricAnalytics"].CBO + "," //Coupling between objects
				+ modelInfo["SizeMetricAnalytics"].NIVPC + "," //Number of instance variables per class
				+ modelInfo["SizeMetricAnalytics"].NUMS + "," //Number of unique messages sent
//				+ modelInfo["SizeMetricAnalytics"].NCI + "," //Number of classes inherited
//				+ modelInfo["SizeMetricAnalytics"].NCIF  + "," //Number of classes inherited from
		        + modelInfo["SizeMetricAnalytics"].RR + "," //Reuse ration
		        + modelInfo["SizeMetricAnalytics"].NTLC + "," //Number of top level classes
		        + modelInfo["SizeMetricAnalytics"].ANWMC + "," //Average number of weighted methods per classes
		        + modelInfo["SizeMetricAnalytics"].ADIT + "," //Average depth of inheritance tree 
		        + modelInfo["SizeMetricAnalytics"].NOCPBC + "," //Average number of children per base class
	   // Albrecht [3]
		        + modelInfo["SizeMetricAnalytics"].EIF + "," //External interface files
		        + modelInfo["SizeMetricAnalytics"].ILF + "," //Internal logic files
		        + modelInfo["SizeMetricAnalytics"].DET + "," //Data element types 
		        + modelInfo["SizeMetricAnalytics"].FTR + "," //File type referenced
	  // Karner [4]
		        + modelInfo["SizeMetricAnalytics"].NT + "," //Number of Transactions
		        + modelInfo["SizeMetricAnalytics"].NOC + "," //Number of use cases
				+ modelInfo["SizeMetricAnalytics"].NOA + "," //Number of actors
	 // Kim [9]
				+ modelInfo["SizeMetricAnalytics"].NOUC + "," //Number of use cases
				+ modelInfo["SizeMetricAnalytics"].NOR + "," //Number of roles
				+ modelInfo["SizeMetricAnalytics"].ANAPUC + "," //Average number of actors per use case
				+ modelInfo["SizeMetricAnalytics"].ANRPUC + "," //Average number of roles per use case
				+ modelInfo["SizeMetricAnalytics"].UCP + "," //Use Case Points
				+ modelInfo["SizeMetricAnalytics"].NOC + "," //Number of classes
				+ modelInfo["SizeMetricAnalytics"].NOIR + ","  //Number of Inheritance Relationships
				+ modelInfo["SizeMetricAnalytics"].NOUR + "," //Number of use relationships
				+ modelInfo["SizeMetricAnalytics"].NORR + ","  //Number of realize relationships
				+ modelInfo["SizeMetricAnalytics"].NOM + ","  //Number of methods
				+ modelInfo["SizeMetricAnalytics"].NOP + ","  //Number of parameters
				+ modelInfo["SizeMetricAnalytics"].NOCA +","   //Number of class attributes
				+ modelInfo["SizeMetricAnalytics"].NOASSOC + ","  //Number of associations
				+ modelInfo["SizeMetricAnalytics"].ANMC + ","  //Average number of methods per class
				+ modelInfo["SizeMetricAnalytics"].ANPC + "," //Average Number of parameters per class
				+ modelInfo["SizeMetricAnalytics"].ANCAC  + ","  //Average number of class attributes per class
				+ modelInfo["SizeMetricAnalytics"].ANASSOCC + "," //Average number of associations per class
				+ modelInfo["SizeMetricAnalytics"].ANRELC + "," //Average number of relationships per class 
	// Zivkoviˇc1001[10]
				+ modelInfo["SizeMetricAnalytics"].NOC + "," //Number of classes
				+ modelInfo["SizeMetricAnalytics"].NOAPC + "," //Number of attributes per class 
				+ modelInfo["SizeMetricAnalytics"].NODET + "," //Number of data element types
				+ modelInfo["SizeMetricAnalytics"].NORET + "," //Number of records
				+ modelInfo["SizeMetricAnalytics"].NOMPC + "," //Number of methods per class
				+ modelInfo["SizeMetricAnalytics"].NPPM + "," //Number of parameters per method
				+ modelInfo["SizeMetricAnalytics"].NMT; //Number of method types
	
	console.log("testing row");
	console.log(row);
		
	return row;
	}

	function toDomainModelEvaluationHeader() {
		return "NOET,NOAAE,NORT,NEM,NSR, WMC,MPC,DIT,NIVPC,NUMS,RR,NTLC,ANWMC,ADIT,NOCPBC,NOC,NOIR,NOUR,NORR,NOM,NOP,NOCA,NOASSOC,ANMC,ANPC,ANCAC,ANASSOCC,ANRELC,NOC,NOAPC,NODET,NORET,NOMPC,NPPM,NMT";
	}

	function toDomainModelEvaluationRow(domainModelInfo, index) {
//		var useCaseEmpirics = useCase.UseCaseEmpirics;
//		var domainModelInfo["SizeMetricAnalytics"] = domainModelInfo.DomainModelAnalytics;
//		console.log(domainModelInfo);
		var row = // Tan [6]
		domainModelInfo["SizeMetricAnalytics"].NOET + "," //Number of entity type
		+ domainModelInfo["SizeMetricAnalytics"].NOAAE + "," //Number of attributes of all the entities
		+ domainModelInfo["SizeMetricAnalytics"].NORT + "," //Number of relationship types
		// Costagliola [7]
		+ domainModelInfo["SizeMetricAnalytics"].NEM + "," //Number of External Methods
		+ domainModelInfo["SizeMetricAnalytics"].NSR + "," //Number of Services Requested
		
		// should be applied to individual classes
		+ domainModelInfo["SizeMetricAnalytics"].WMC + "," //Weighted methods per class
		+ domainModelInfo["SizeMetricAnalytics"].MPC + "," //Methods per class
		
//		+ domainModelInfo["SizeMetricAnalytics"].NOCH + "," //Number of children
		+ domainModelInfo["SizeMetricAnalytics"].DIT + "," //Depth in inheritance tree
//		+ domainModelInfo["SizeMetricAnalytics"].CBO + "," //Coupling between objects
		
		+ domainModelInfo["SizeMetricAnalytics"].NIVPC + "," //Number of instance variables per class
		
		+ domainModelInfo["SizeMetricAnalytics"].NUMS + "," //Number of unique messages sent
//		+ domainModelInfo["SizeMetricAnalytics"].NCI + "," //Number of classes inherited
//		+ domainModelInfo["SizeMetricAnalytics"].NCIF  + "," //Number of classes inherited from
		// should be applied to individual classes
		
		+ domainModelInfo["SizeMetricAnalytics"].RR + "," //Reuse ration
		+ domainModelInfo["SizeMetricAnalytics"].NTLC + "," //Number of top level classes
        + domainModelInfo["SizeMetricAnalytics"].ANWMC + "," //Average number of weighted methods per classes
        + domainModelInfo["SizeMetricAnalytics"].ADIT + "," //Average depth of inheritance tree 
        + domainModelInfo["SizeMetricAnalytics"].NOCPBC + "," //Average number of children per base class
        
        + domainModelInfo["SizeMetricAnalytics"].NOC + "," //Number of classes
        + domainModelInfo["SizeMetricAnalytics"].NOIR + ","  //Number of Inheritance Relationships
        + domainModelInfo["SizeMetricAnalytics"].NOUR + "," //Number of use relationships
        + domainModelInfo["SizeMetricAnalytics"].NORR + ","  //Number of realize relationships
        + domainModelInfo["SizeMetricAnalytics"].NOM + ","  //Number of methods
        + domainModelInfo["SizeMetricAnalytics"].NOP + ","  //Number of parameters
        + domainModelInfo["SizeMetricAnalytics"].NOCA + ","   //Number of class attributes
        + domainModelInfo["SizeMetricAnalytics"].NOASSOC + ","  //Number of associations
        + domainModelInfo["SizeMetricAnalytics"].ANMC + ","  //Average number of methods per class
        + domainModelInfo["SizeMetricAnalytics"].ANPC + "," //Average Number of parameters per class
        + domainModelInfo["SizeMetricAnalytics"].ANCAC  + ","  //Average number of class attributes per class
        + domainModelInfo["SizeMetricAnalytics"].ANASSOCC + "," //Average number of associations per class
        + domainModelInfo["SizeMetricAnalytics"].ANRELC + "," //Average number of relationships per class
		
        + domainModelInfo["SizeMetricAnalytics"].NOC + "," //Number of classes
        + domainModelInfo["SizeMetricAnalytics"].NOAPC + "," //Number of attributes per class 
        + domainModelInfo["SizeMetricAnalytics"].NODET + "," //Number of data element types
        + domainModelInfo["SizeMetricAnalytics"].NORET + "," //Number of records
        + domainModelInfo["SizeMetricAnalytics"].NOMPC + "," //Number of methods per class
        + domainModelInfo["SizeMetricAnalytics"].NPPM + "," //Number of parameters per method
        + domainModelInfo["SizeMetricAnalytics"].NMT; //Number of method types
		
		
		console.log("domain model row");
		console.log(row);
		return row;
	}

	function evaluateDomainModel(domainModelInfo, callbackfunc) {
		
		domainModelInfo["SizeMetricAnalytics"] = {
				// Tan [6]
				NOET :0, //Number of entity type
				NOAAE :0, //Number of attributes of all the entities
				NORT :0, //Number of relationship types
				// Costagliola [7]
				NEM :0, //Number of External Methods
				NSR :0, //Number of Services Requested
				
				// should be applied to individual classes
				WMC :0, //Weighted methods per class
				MPC :0, //Methods per class
				
//				NOCH :0, //Number of children
				DIT :0, //Depth in inheritance tree
//				CBO :0, //Coupling between objects
				
				NIVPC :0, //Number of instance variables per class
				
				NUMS :0, //Number of unique messages sent
//				NCI :0, //Number of classes inherited
//				NCIF  :0, //Number of classes inherited from
				// should be applied to individual classes
				
		        RR :0, //Reuse ration
		        NTLC :0, //Number of top level classes
		        ANWMC :0, //Average number of weighted methods per classes
		        ADIT :0, //Average depth of inheritance tree 
		        NOCPBC :0, //Average number of children per base class
		        
		        NOC : 0, //Number of classes
				NOIR : 0,  //Number of Inheritance Relationships
				NOUR : 0, //Number of use relationships
				NORR : 0,  //Number of realize relationships
				NOM : 0,  //Number of methods
				NOP : 0,  //Number of parameters
				NOCA : 0,   //Number of class attributes
				NOASSOC : 0,  //Number of associations
				ANMC : 0,  //Average number of methods per class
				ANPC : 0, //Average Number of parameters per class
				ANCAC  : 0,  //Average number of class attributes per class
				ANASSOCC : 0, //Average number of associations per class
				ANRELC : 0, //Average number of relationships per class
				
				NOC: 0, //Number of classes
				NOAPC: 0, //Number of attributes per class 
				NODET: 0, //Number of data element types
				NORET: 0, //Number of records
				NOMPC: 0, //Number of methods per class
				NPPM: 0, //Number of parameters per method
				NMT: 0, //Number of method types
		        
				SizeMetricsAnalyticsFileName : 'SizeMetricsAnalytics.csv'
	        };
		
			domainModelInfo["SizeMetricAnalytics"].NEM = domainModelInfo["ComponentAnalytics"].ExternalOperNum; //Number of External Methods
        	domainModelInfo["SizeMetricAnalytics"].NSR = domainModelInfo["ComponentAnalytics"].ExternalOperNum; //Number of Services Requested 
			domainModelInfo["SizeMetricAnalytics"].NOAAE = domainModelInfo["ComponentAnalytics"].AttributeNum; //Number of attributes of all the entities
            domainModelInfo["SizeMetricAnalytics"].NTLC = domainModelInfo["ComponentAnalytics"].TopLevelClasses; //Number of top level classes
			domainModelInfo["SizeMetricAnalytics"].MPC = domainModelInfo["ComponentAnalytics"].AvgOperation; //Methods per class
			domainModelInfo["SizeMetricAnalytics"].WMC =  domainModelInfo["ComponentAnalytics"].WeightedOperNum; //Weighted methods per class
			domainModelInfo["SizeMetricAnalytics"].ANWMC = domainModelInfo["ComponentAnalytics"].ClassNum == 0? 0: domainModelInfo["ComponentAnalytics"].WeightedOperNum/domainModelInfo["ComponentAnalytics"].ClassNum; //Average number of weighted methods per classes
			domainModelInfo["SizeMetricAnalytics"].NIVPC = domainModelInfo["ComponentAnalytics"].ClassNum == 0? 0: domainModelInfo["ComponentAnalytics"].InstanceVarNum/domainModelInfo["ComponentAnalytics"].ClassNum; //Number of instance variables per class

			domainModelInfo["SizeMetricAnalytics"].ANMC = domainModelInfo["ComponentAnalytics"].AvgOperation;  //Average number of methods per class
			domainModelInfo["SizeMetricAnalytics"].ANPC = domainModelInfo["ComponentAnalytics"].ClassNum == 0? 0: domainModelInfo["ComponentAnalytics"].ParameterNum/domainModelInfo["ComponentAnalytics"].ClassNum;  //Average Number of parameters per class
			domainModelInfo["SizeMetricAnalytics"].ANCAC = domainModelInfo["ComponentAnalytics"].ClassNum == 0? 0: domainModelInfo["ComponentAnalytics"].AttributeNum/domainModelInfo["ComponentAnalytics"].ClassNum; //Average number of class attributes per class
			
			var DIT = 0;
			var totalDIT = 0;
			for(var i in domainModelInfo.Elements){
				var element = domainModelInfo.Elements[i];
				
				element.NOCH = element.numberOfChildren; //Number of children
				element.DIT = element.depthInheritanceTree; //Depth in inheritance tree
				element.CBO = element.couplingBetweenObjects; //Coupling between objects
				
				element.NUMS = 0; //Number of unique messages sent
				element.NCI = element.numberOfClassesInherited; //Number of classes inherited
				element.NCIF = element.numberOfClassesInheritedFrom; //Number of classes inherited from
				// should be applied to individual classes
				
				if(DIT < element.DIT){
					DIT = element.DIT;
				}
				
				totalDIT += DIT;
			}
			
//			domainModelInfo["SizeMetricAnalytics"].EIF = 0; //External interface files
//	        domainModelInfo["SizeMetricAnalytics"].ILF = 0; //Internal logic files
//	        domainModelInfo["SizeMetricAnalytics"].DET = 0; //Data element types 
//	        domainModelInfo["SizeMetricAnalytics"].FTR = 0; //File type referenced
			
			domainModelInfo["SizeMetricAnalytics"].NOCPBC = domainModelInfo["ComponentAnalytics"].AverageNumberOfChildrenPerBaseClass;
	        
			domainModelInfo["SizeMetricAnalytics"].DIT = DIT;
			domainModelInfo["SizeMetricAnalytics"].ADIT = totalDIT/domainModelInfo.Elements.length == 0? 0: totalDIT/domainModelInfo.Elements.length;
	        domainModelInfo["SizeMetricAnalytics"].NOC = domainModelInfo["ComponentAnalytics"].ClassNum; //Number of classes
	        
	        domainModelInfo["SizeMetricAnalytics"].NOM = domainModelInfo["ComponentAnalytics"].OperationNum;  //Number of methods
	        domainModelInfo["SizeMetricAnalytics"].NOP = domainModelInfo["ComponentAnalytics"].ParameterNum;  //Number of parameters
	        domainModelInfo["SizeMetricAnalytics"].NOCA = domainModelInfo["ComponentAnalytics"].AttributeNum; //Number of class attributes
	        
	        domainModelInfo["SizeMetricAnalytics"].NOC = domainModelInfo["ComponentAnalytics"].ClassNum; //Number of classes
			domainModelInfo["SizeMetricAnalytics"].NOAPC = domainModelInfo["ComponentAnalytics"].ClassNum == 0? 0: domainModelInfo["ComponentAnalytics"].AttributeNum/domainModelInfo["ComponentAnalytics"].ClassNum; //Number of attributes per class 
			domainModelInfo["SizeMetricAnalytics"].NODET = domainModelInfo["ComponentAnalytics"].ClassNum; //Number of data element types
			domainModelInfo["SizeMetricAnalytics"].NOET = domainModelInfo["ComponentAnalytics"].ClassNum; //Number of data element types
			domainModelInfo["SizeMetricAnalytics"].NORET = domainModelInfo["ComponentAnalytics"].ClassNum; //Number of records
			domainModelInfo["SizeMetricAnalytics"].NOMPC = domainModelInfo["ComponentAnalytics"].AvgOperation; //Number of methods per class
			domainModelInfo["SizeMetricAnalytics"].NPPM = domainModelInfo["ComponentAnalytics"].ClassNum == 0? 0: domainModelInfo["ComponentAnalytics"].ParameterNum/domainModelInfo["ComponentAnalytics"].ClassNum; //Number of parameters per method
			domainModelInfo["SizeMetricAnalytics"].NMT = domainModelInfo["ComponentAnalytics"].OperationNum; //Number of method types
		    
		    domainModelInfo["SizeMetricAnalytics"].RR = domainModelInfo["ComponentAnalytics"].UsageNum; //Reuse ration
    		domainModelInfo["SizeMetricAnalytics"].NOUR = domainModelInfo["ComponentAnalytics"].UsageNum; //Number of use relationships
    		domainModelInfo["SizeMetricAnalytics"].NOIR = domainModelInfo["ComponentAnalytics"].GeneralNum; //Number of Inheritance Relationships
    		domainModelInfo["SizeMetricAnalytics"].NORR = domainModelInfo["ComponentAnalytics"].RealNum;  //Number of realize relationships
	    	domainModelInfo["SizeMetricAnalytics"].NOASSOC = domainModelInfo["ComponentAnalytics"].AssocNum; //Number of associations
    		domainModelInfo["SizeMetricAnalytics"].NORT = domainModelInfo["ComponentAnalytics"].UsageNum+domainModelInfo["ComponentAnalytics"].GeneralNum+domainModelInfo["ComponentAnalytics"].RealNum+domainModelInfo["ComponentAnalytics"].AssocNum; //Number of relationship types
		    domainModelInfo["SizeMetricAnalytics"].ANASSOCC = domainModelInfo["ComponentAnalytics"].ClassNum == 0? 0: domainModelInfo["SizeMetricAnalytics"].NOASSOC*2/domainModelInfo["ComponentAnalytics"].ClassNum; //Average number of associations per class
		    domainModelInfo["SizeMetricAnalytics"].ANRELC = domainModelInfo["ComponentAnalytics"].ClassNum == 0? 0: domainModelInfo["SizeMetricAnalytics"].NOASSOC*2/domainModelInfo["ComponentAnalytics"].ClassNum; //Average number of relationships per class
			
		if (callbackfunc) {

			dumpDomainModelElementSizeMetricInfo(domainModelInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			console.log("evaluate uml elements for domain model");

//			var command = './evaluators/UMLModelElementsEvaluator/DomainModelElementsAnalyticsScript.R "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].EntityAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].OperationAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].SizeMetricsAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "domain_model_size_metric_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
			
						if(callbackfunc){
							callbackfunc(domainModelInfo["SizeMetricAnalytics"]);
						}
			});
		});
		}

		return domainModelInfo["SizeMetricAnalytics"];
	}

	function evaluateModel(modelInfo, callbackfunc) {

		modelInfo["SizeMetricAnalytics"] = {
				// Tan [6]
				NOET:0, //Number of entity type
				NOAAE:0, //Number of attributes of all the entities
				NORT:0, //Number of relationship types
		// Costagliola [7]
				NEM:0, //Number of External Methods
				NSR:0, //Number of Services Requested 
				NOA:0, //Number of Attributes
				NOS:0, //Number of use cases/scenario scripts 
				WMC:0, //Weighted methods per class
				MPC:0, //Methods per class
//				NOCH:0, //Number of children
				DIT:0, //Depth in inheritance tree
//				CBO:0, //Coupling between objects
				NIVPC:0, //Number of instance variables per class
				NUMS:0, //Number of unique messages sent
//				NCI:0, //Number of classes inherited
//				NCIF :0, //Number of classes inherited from
		        RR:0, //Reuse ration
		        NTLC:0, //Number of top level classes
		        ANWMC:0, //Average number of weighted methods per classes
		        ADIT:0, //Average depth of inheritance tree 
		        NOCPBC:0, //Average number of children per base class
	   // Albrecht [3]
		        EIF:0, //External interface files
		        ILF:0, //Internal logic files
		        DET:0, //Data element types 
		        FTR:0, //File type referenced
	  // Karner [4]
		        NT:0, //Number of Transactions
		        NOC:0, //Number of use cases
				NOA:0, //Number of actors
	 // Kim [9]
				NOA:0,  //Number of actors
				NOUC:0, //Number of use cases
				NOR:0, //Number of roles
				ANAPUC:0, //Average number of actors per use case
				ANRPUC:0, //Average number of roles per use case
				UCP:0, //Use Case Points
				NOC:0, //Number of classes
				NOIR:0,  //Number of Inheritance Relationships
				NOUR:0, //Number of use relationships
				NORR:0,  //Number of realize relationships
				NOM:0,  //Number of methods
				NOP:0,  //Number of parameters
				NOCAL:0,   //Number of class attributes
				NOASSOC:0,  //Number of associations
				ANMC:0,  //Average number of methods per class
				ANPC:0, //Average Number of parameters per class
				ANCAC :0,  //Average number of class attributes per class
				ANASSOCC:0, //Average number of associations per class
				ANRELC:0, //Average number of relationships per class 
	// Zivkoviˇc1001[10]
				NOC:0, //Number of classes
				NOAPC:0, //Number of attributes per class 
				NODET:0, //Number of data element types
				NORET:0, //Number of records
				NOA:0, //Number of associations
				NOMPC:0, //Number of methods per class
				NPPM:0, //Number of parameters per method
				NMT:0, //Number of method types
				
				SizeMetricsAnalyticsFileName : "sizeMetricsAnalytics.csv"
		}

		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];

			modelInfo["SizeMetricAnalytics"].NOS ++; //Number of use cases/scenario scripts
			modelInfo["SizeMetricAnalytics"].NT  += useCaseInfo["ComponentAnalytics"].TranNum;
			modelInfo["SizeMetricAnalytics"].NOUC ++;
		}


		modelInfo["SizeMetricAnalytics"].NOA = modelInfo["ComponentAnalytics"].ActorNum;
		modelInfo["SizeMetricAnalytics"].NOR = modelInfo["ComponentAnalytics"].ActorNum; //Number of roles
		modelInfo["SizeMetricAnalytics"].ANAPUC = modelInfo["SizeMetricAnalytics"].NOUC == 0 ? 0 : modelInfo["SizeMetricAnalytics"].NOA/modelInfo["SizeMetricAnalytics"].NOUC;
		modelInfo["SizeMetricAnalytics"].ANRPUC = modelInfo["SizeMetricAnalytics"].NOUC == 0 ? 0 : modelInfo["SizeMetricAnalytics"].NOA/modelInfo["SizeMetricAnalytics"].NOUC;
		modelInfo["SizeMetricAnalytics"].UCP = 0;

		// analyse domain model
		var domainModelInfo = modelInfo.DomainModel;



		if(domainModelInfo && domainModelInfo["SizeMetricAnalytics"]){
			// Tan [6]
			modelInfo["SizeMetricAnalytics"].NOET = domainModelInfo["SizeMetricAnalytics"].NOET; //Number of entity type
			modelInfo["SizeMetricAnalytics"].NOAAE = domainModelInfo["SizeMetricAnalytics"].NOAAE; //Number of attributes of all the entities
			modelInfo["SizeMetricAnalytics"].NORT = domainModelInfo["SizeMetricAnalytics"].NORT; //Number of relationship types
			// Costagliola [7]
			modelInfo["SizeMetricAnalytics"].NEM = domainModelInfo["SizeMetricAnalytics"].NEM; //Number of External Methods
			modelInfo["SizeMetricAnalytics"].NSR = domainModelInfo["SizeMetricAnalytics"].NEM; //Number of Services Requested
			
			// should be applied to individual classes
			modelInfo["SizeMetricAnalytics"].WMC = domainModelInfo["SizeMetricAnalytics"].WMC; //Weighted methods per class
			modelInfo["SizeMetricAnalytics"].MPC = domainModelInfo["SizeMetricAnalytics"].MPC; //Methods per class
			
//			modelInfo["SizeMetricAnalytics"].NOCH = domainModelInfo["SizeMetricAnalytics"].NOCH; //Number of children
			modelInfo["SizeMetricAnalytics"].DIT = domainModelInfo["SizeMetricAnalytics"].DIT; //Depth in inheritance tree
//			modelInfo["SizeMetricAnalytics"].CBO = domainModelInfo["SizeMetricAnalytics"].CBO; //Coupling between objects
			
			modelInfo["SizeMetricAnalytics"].NIVPC = domainModelInfo["SizeMetricAnalytics"].NIVPC; //Number of instance variables per class
			
			modelInfo["SizeMetricAnalytics"].NUMS = domainModelInfo["SizeMetricAnalytics"].NUMS; //Number of unique messages sent
//			modelInfo["SizeMetricAnalytics"].NCI = domainModelInfo["SizeMetricAnalytics"].NCI; //Number of classes inherited
//			modelInfo["SizeMetricAnalytics"].NCIF  = domainModelInfo["SizeMetricAnalytics"].NCIF; //Number of classes inherited from
			// should be applied to individual classes
			
			modelInfo["SizeMetricAnalytics"].RR = domainModelInfo["SizeMetricAnalytics"].RR; //Reuse ration
			modelInfo["SizeMetricAnalytics"].NTLC = domainModelInfo["SizeMetricAnalytics"].NTLC; //Number of top level classes
			modelInfo["SizeMetricAnalytics"].ANWMC = domainModelInfo["SizeMetricAnalytics"].ANWMC; //Average number of weighted methods per classes
			modelInfo["SizeMetricAnalytics"].ADIT = domainModelInfo["SizeMetricAnalytics"].ADIT; //Average depth of inheritance tree 
			modelInfo["SizeMetricAnalytics"].NOCPBC = domainModelInfo["SizeMetricAnalytics"].NOCPBC; //Average number of children per base class
	        
			modelInfo["SizeMetricAnalytics"].NOC = domainModelInfo["SizeMetricAnalytics"]. NOC; //Number of classes
			modelInfo["SizeMetricAnalytics"].NOIR = domainModelInfo["SizeMetricAnalytics"].NOIR;  //Number of Inheritance Relationships
			modelInfo["SizeMetricAnalytics"].NOUR= domainModelInfo["SizeMetricAnalytics"].NOUR; //Number of use relationships
			modelInfo["SizeMetricAnalytics"].NORR= domainModelInfo["SizeMetricAnalytics"].NORR;  //Number of realize relationships
			modelInfo["SizeMetricAnalytics"].NOM= domainModelInfo["SizeMetricAnalytics"].NOM;  //Number of methods
			modelInfo["SizeMetricAnalytics"].NOP= domainModelInfo["SizeMetricAnalytics"].NOP;  //Number of parameters
			modelInfo["SizeMetricAnalytics"].NOCA= domainModelInfo["SizeMetricAnalytics"].NOCA;   //Number of class attributes
			modelInfo["SizeMetricAnalytics"].NOASSOC= domainModelInfo["SizeMetricAnalytics"].NOASSOC;  //Number of associations
			modelInfo["SizeMetricAnalytics"].ANMC= domainModelInfo["SizeMetricAnalytics"].ANMC;  //Average number of methods per class
			modelInfo["SizeMetricAnalytics"].ANPC= domainModelInfo["SizeMetricAnalytics"].ANPC; //Average Number of parameters per class
			modelInfo["SizeMetricAnalytics"].ANCAC = domainModelInfo["SizeMetricAnalytics"].ANCAC;  //Average number of class attributes per class
			modelInfo["SizeMetricAnalytics"].ANASSOCC= domainModelInfo["SizeMetricAnalytics"].ANASSOCC; //Average number of associations per class
			modelInfo["SizeMetricAnalytics"].ANRELC= domainModelInfo["SizeMetricAnalytics"].ANRELC; //Average number of relationships per class
			
			modelInfo["SizeMetricAnalytics"].NOC= domainModelInfo["SizeMetricAnalytics"].NOC; //Number of classes
			modelInfo["SizeMetricAnalytics"].NOAPC= domainModelInfo["SizeMetricAnalytics"].NOAPC; //Number of attributes per class 
			modelInfo["SizeMetricAnalytics"].NODET= domainModelInfo["SizeMetricAnalytics"].NODET; //Number of data element types
			modelInfo["SizeMetricAnalytics"].NORET= domainModelInfo["SizeMetricAnalytics"].NORET; //Number of records
			modelInfo["SizeMetricAnalytics"].NOMPC= domainModelInfo["SizeMetricAnalytics"].NOMPC; //Number of methods per class
			modelInfo["SizeMetricAnalytics"].NPPM= domainModelInfo["SizeMetricAnalytics"].NPPM; //Number of parameters per method
			modelInfo["SizeMetricAnalytics"].NMT= domainModelInfo["SizeMetricAnalytics"].NMT; //Number of method types
	        
		}

		if (callbackfunc) {

			dumpModelElementSizeMetricInfo(modelInfo, function(err){
			if(err){
				callbackfunc(err);
			}

			//Needs to be upgraded soon
			console.log("evaluate uml elements at model level");

//			var command = './evaluators/UMLModelElementsEvaluator/ModelElementsAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].EntityAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].OperationAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].SizeMetricAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].PathAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].SizeMetricsAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "model_size_metric_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
							if(callbackfunc){
								callbackfunc(modelInfo["SizeMetricAnalytics"]);
							}
			});
		});
		}

		return modelInfo["SizeMetricAnalytics"];
	}

	

	function dumpDomainModelElementSizeMetricInfo(domainModelInfo, callbackfunc, entityNum) {

		entityNum = !entityNum ? 0 : entityNum;

		var entityAnalyticsStr = entityNum == 0 ? "id,element,NOCH,DIT,CBO,NUMS,NCI,NCIF\n" : "";
		

//		for ( var i in domainModelInfo.Diagrams) {

//			var diagram = domainModelInfo.Diagrams[i];

			for ( var i in domainModelInfo.Elements) {

				var element = domainModelInfo.Elements[i];

					entityNum++;
					entityAnalyticsStr += entityNum + ","
						+ element.Name + ","
						+ element.NOCH + ","
						+ element.DIT + ","
						+ element.CBO + ","
						+ element.NUMS + ","
						+ element.NCI + ","
						+ element.NCIF + "\n";
			}
//		}

		// console.log(domainModelInfo["SizeMetricAnalytics"]);

		if(callbackfunc){

		var files = [{fileName : domainModelInfo["SizeMetricAnalytics"].SizeMetricsAnalyticsFileName , content : entityAnalyticsStr }];

		console.log("checking domain model");
		console.log(domainModelInfo);
		umlFileManager.writeFiles(domainModelInfo.OutputDir, files, callbackfunc);

		}

		return {
			entityAnalyticsStr: entityAnalyticsStr,
			entityNum: entityNum
		}
	}

	function dumpModelElementSizeMetricInfo(modelInfo, callbackfunc, elementNum) {


		elementNum = !elementNum ? 0 : elementNum;


//		var modelInfo["SizeMetricAnalytics"] = modelInfo.ModelAnalytics;
		// console.log(modelInfo["SizeMetricAnalytics"]);

		var entityAnalyticsStr = "";

		
		if(modelInfo.DomainModel){
	    domainModelDump = dumpDomainModelElementSizeMetricInfo(modelInfo.DomainModel);
		
	    entityNum = domainModelDump.entityNum;
	    entityAnalyticsStr += domainModelDump.entityAnalyticsStr;
	    
		}
		

		// console.log(domainModelInfo["SizeMetricAnalytics"]);

		if(callbackfunc){

		var files = [{fileName : modelInfo["SizeMetricAnalytics"].SizeMetricsAnalyticsFileName , content : entityAnalyticsStr }
		];

		umlFileManager.writeFiles(modelInfo.OutputDir, files, callbackfunc);
		
		

		}

		return {
			entityAnalyticsStr: entityAnalyticsStr,
			entityNum: entityNum
		}

	}


	module.exports = {
		toModelEvaluationHeader : toModelEvaluationHeader,
		toModelEvaluationRow : toModelEvaluationRow,
//		toUseCaseEvaluationHeader : toUseCaseEvaluationHeader,
//		toUseCaseEvaluationRow : toUseCaseEvaluationRow,
		toDomainModelEvaluationHeader: toDomainModelEvaluationHeader,
		toDomainModelEvaluationRow: toDomainModelEvaluationRow,
		// loadFromModelEmpirics: loadFromModelEmpirics,
//		loadFromUseCaseEmpirics : loadFromUseCaseEmpirics,
//		evaluateRepo : evaluateRepo,
//		evaluateUseCase : evaluateUseCase,
		evaluateModel : evaluateModel,
		evaluateDomainModel : evaluateDomainModel
	}

}())
