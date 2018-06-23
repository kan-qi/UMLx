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
		return "NOET,NOAAE,NORT,NEM,NSR,NOA,NOS,WMC,MPC,NOCH,DIT,CBO,NIVPC,NUMS,NCI,NCIF,RR,NTLC,ANWMC,ADIT,NOCPBC,EIF,ILF,DET,FTR,NT,NOC,NOA,NOA,NOUC,NOR,ANAPUC,ANRPUC,UCP,NOC,NOIR,NOUR,NORR,NOM,NOP,NOCAL,NOASSOC,ANMC,ANPC,ANCAC,ANASSOCC,ANRELC,NOC,NOAPC,NODET,NORET,NOA,NOMPC,NPPM,NMT";
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
				+ modelInfo["SizeMetricAnalytics"].NOA + "," //Number of Attributes
				+ modelInfo["SizeMetricAnalytics"].NOS + "," //Number of use cases/scenario scripts 
				+ modelInfo["SizeMetricAnalytics"].WMC + "," //Weighted methods per class
				+ modelInfo["SizeMetricAnalytics"].MPC + "," //Methods per class
				+ modelInfo["SizeMetricAnalytics"].NOCH + "," //Number of children
				+ modelInfo["SizeMetricAnalytics"].DIT + "," //Depth in inheritance tree
				+ modelInfo["SizeMetricAnalytics"].CBO + "," //Coupling between objects
				+ modelInfo["SizeMetricAnalytics"].NIVPC + "," //Number of instance variables per class
				+ modelInfo["SizeMetricAnalytics"].NUMS + "," //Number of unique messages sent
				+ modelInfo["SizeMetricAnalytics"].NCI + "," //Number of classes inherited
				+ modelInfo["SizeMetricAnalytics"].NCIF  + "," //Number of classes inherited from
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
				+ modelInfo["SizeMetricAnalytics"].NOA + ","  //Number of actors
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
				+ modelInfo["SizeMetricAnalytics"].NOA +"," //Number of associations
				+ modelInfo["SizeMetricAnalytics"].NOMPC + "," //Number of methods per class
				+ modelInfo["SizeMetricAnalytics"].NPPM + "," //Number of parameters per method
				+ modelInfo["SizeMetricAnalytics"].NMT; //Number of method types
	
	console.log("testing row");
	console.log(row);
		
	return row;
	}

	function toDomainModelEvaluationHeader() {
		return "NOET,NOAAE,NORT,NEM,NSR, NOA,WMC,MPC,NOCH,DIT,CBO,NIVPC,NUMS,NCI,NCIF,RR,NTLC,ANWMC,ADIT,NOCPBC,NOC,NOIR,NOUR,NORR,NOM,NOP,NOCA,NOASSOC,ANMC,ANPC,ANCAC,ANASSOCC,ANRELC,NOC,NOAPC,NODET,NORET,NOA,NOMPC,NPPM,NMT";
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
		+ domainModelInfo["SizeMetricAnalytics"].NOA + "," //Number of Attributes
		
		// should be applied to individual classes
		+ domainModelInfo["SizeMetricAnalytics"].WMC + "," //Weighted methods per class
		+ domainModelInfo["SizeMetricAnalytics"].MPC + "," //Methods per class
		
		+ domainModelInfo["SizeMetricAnalytics"].NOCH + "," //Number of children
		+ domainModelInfo["SizeMetricAnalytics"].DIT + "," //Depth in inheritance tree
		+ domainModelInfo["SizeMetricAnalytics"].CBO + "," //Coupling between objects
		
		+ domainModelInfo["SizeMetricAnalytics"].NIVPC + "," //Number of instance variables per class
		
		+ domainModelInfo["SizeMetricAnalytics"].NUMS + "," //Number of unique messages sent
		+ domainModelInfo["SizeMetricAnalytics"].NCI + "," //Number of classes inherited
		+ domainModelInfo["SizeMetricAnalytics"].NCIF  + "," //Number of classes inherited from
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
        + domainModelInfo["SizeMetricAnalytics"].NOA + "," //Number of associations
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
				NOA :0, //Number of Attributes
				
				// should be applied to individual classes
				WMC :0, //Weighted methods per class
				MPC :0, //Methods per class
				
				NOCH :0, //Number of children
				DIT :0, //Depth in inheritance tree
				CBO :0, //Coupling between objects
				
				NIVPC :0, //Number of instance variables per class
				
				NUMS :0, //Number of unique messages sent
				NCI :0, //Number of classes inherited
				NCIF  :0, //Number of classes inherited from
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
				NOA : 0, //Number of associations
				NOMPC: 0, //Number of methods per class
				NPPM: 0, //Number of parameters per method
				NMT: 0, //Number of method types
		        
				SizeMetricsAnalyticsFileName : 'SizeMetricsAnalytics.csv'
	        };
		
			domainModelInfo["SizeMetricAnalytics"].NEM = domainModelInfo["ElementAnalytics"].ExternalOperNum; //Number of External Methods
        	domainModelInfo["SizeMetricAnalytics"].NSR = domainModelInfo["ElementAnalytics"].ExternalOperNum; //Number of Services Requested 
			domainModelInfo["SizeMetricAnalytics"].NOAAE = domainModelInfo["ElementAnalytics"].AttributeNum; //Number of attributes of all the entities
            domainModelInfo["SizeMetricAnalytics"].NOA = domainModelInfo["ElementAnalytics"].AttributeNum; //Number of Attributes
			domainModelInfo["SizeMetricAnalytics"].NTLC = domainModelInfo["ElementAnalytics"].TopLevelClasses; //Number of top level classes
			domainModelInfo["SizeMetricAnalytics"].MPC = domainModelInfo["ElementAnalytics"].AvgOperation; //Methods per class
			domainModelInfo["SizeMetricAnalytics"].WMC =  domainModelInfo["ElementAnalytics"].WeightedOperNum; //Weighted methods per class
			domainModelInfo["SizeMetricAnalytics"].ANWMC = domainModelInfo["ElementAnalytics"].ClassNum == 0? 0: domainModelInfo["ElementAnalytics"].WeightedOperNum/domainModelInfo["ElementAnalytics"].ClassNum; //Average number of weighted methods per classes
			domainModelInfo["SizeMetricAnalytics"].NIVPC = domainModelInfo["ElementAnalytics"].ClassNum == 0? 0: domainModelInfo["ElementAnalytics"].InstanceVarNum/domainModelInfo["ElementAnalytics"].ClassNum; //Number of instance variables per class
			

			domainModelInfo["SizeMetricAnalytics"].ANMC = domainModelInfo["ElementAnalytics"].AvgOperation;  //Average number of methods per class
			domainModelInfo["SizeMetricAnalytics"].ANPC = domainModelInfo["ElementAnalytics"].ClassNum == 0? 0: domainModelInfo["ElementAnalytics"].ParameterNum/domainModelInfo["ElementAnalytics"].ClassNum;  //Average Number of parameters per class
			domainModelInfo["SizeMetricAnalytics"].ANCAC = domainModelInfo["ElementAnalytics"].ClassNum == 0? 0: domainModelInfo["ElementAnalytics"].AttributeNum/domainModelInfo["ElementAnalytics"].ClassNum; //Average number of class attributes per class
			
			for(var i in domainModelInfo.elements){
				var element = domainModelInfo.eleemnts[i];
				
				element.NOCH = element.numberOfChildren; //Number of children
				element.DIT = element.depthInheritanceTree; //Depth in inheritance tree
				element.CBO = element. CouplingBetweenObjects; //Coupling between objects
				
				element.NUMS = 0; //Number of unique messages sent
				element.NCI = element.numberOfClassesInherited; //Number of classes inherited
				element.NCIF = element.numberOfClassesInheritedFrom; //Number of classes inherited from
				// should be applied to individual classes
				
			}
			
			domainModelInfo["SizeMetricAnalytics"].EIF = 0; //External interface files
	        domainModelInfo["SizeMetricAnalytics"].ILF = 0; //Internal logic files
	        domainModelInfo["SizeMetricAnalytics"].DET = 0; //Data element types 
	        domainModelInfo["SizeMetricAnalytics"].FTR = 0; //File type referenced
	        
	        domainModelInfo["SizeMetricAnalytics"].NOC = domainModelInfo["ElementAnalytics"].ClassNum; //Number of classes
	        
	        domainModelInfo["SizeMetricAnalytics"].NOM = domainModelInfo["ElementAnalytics"].OperationNum;  //Number of methods
	        domainModelInfo["SizeMetricAnalytics"].NOP = domainModelInfo["ElementAnalytics"].ParameterNum;  //Number of parameters
	        domainModelInfo["SizeMetricAnalytics"].NOCA = domainModelInfo["ElementAnalytics"].AttributeNum; //Number of class attributes
	        
	        domainModelInfo["SizeMetricAnalytics"].NOC = domainModelInfo["ElementAnalytics"].ClassNum; //Number of classes
			domainModelInfo["SizeMetricAnalytics"].NOAPC = domainModelInfo["ElementAnalytics"].ClassNum == 0? 0: domainModelInfo["ElementAnalytics"].AttributeNum/domainModelInfo["ElementAnalytics"].ClassNum; //Number of attributes per class 
			domainModelInfo["SizeMetricAnalytics"].NODET = 0; //Number of data element types
			domainModelInfo["SizeMetricAnalytics"].NORET = 0; //Number of records
			domainModelInfo["SizeMetricAnalytics"].NOMPC = domainModelInfo["ElementAnalytics"].AvgOperation; //Number of methods per class
			domainModelInfo["SizeMetricAnalytics"].NPPM = domainModelInfo["ElementAnalytics"].ClassNum == 0? 0: domainModelInfo["ElementAnalytics"].ParameterNum/domainModelInfo["ElementAnalytics"].ClassNum; //Number of parameters per method
			domainModelInfo["SizeMetricAnalytics"].NMT = domainModelInfo["ElementAnalytics"].OperationNum; //Number of method types
		    
		    domainModelInfo["SizeMetricAnalytics"].RR = domainModelInfo["ElementAnalytics"].UsageNum; //Reuse ration
    		domainModelInfo["SizeMetricAnalytics"].NOUR = domainModelInfo["ElementAnalytics"].UsageNum; //Number of use relationships
    		domainModelInfo["SizeMetricAnalytics"].NOIR = domainModelInfo["ElementAnalytics"].GeneralNum; //Number of Inheritance Relationships
    		domainModelInfo["SizeMetricAnalytics"].NORR = domainModelInfo["ElementAnalytics"].RealNum;  //Number of realize relationships
	    	domainModelInfo["SizeMetricAnalytics"].NOASSOC = domainModelInfo["ElementAnalytics"].AssocNum; //Number of associations
			domainModelInfo["SizeMetricAnalytics"].NOA = domainModelInfo["ElementAnalytics"].AssocNum; //Number of associations
    		domainModelInfo["SizeMetricAnalytics"].NORT = domainModelInfo["ElementAnalytics"].UsageNum+domainModelInfo["ElementAnalytics"].GeneralNum+domainModelInfo["ElementAnalytics"].RealNum+domainModelInfo["ElementAnalytics"].AssocNum; //Number of relationship types
		    domainModelInfo["SizeMetricAnalytics"].ANASSOCC = domainModelInfo["ElementAnalytics"].ClassNum == 0? 0: domainModelInfo["SizeMetricAnalytics"].NOASSOC*2/domainModelInfo["ElementAnalytics"].ClassNum; //Average number of associations per class
		    domainModelInfo["SizeMetricAnalytics"].ANRELC = domainModelInfo["ElementAnalytics"].ClassNum == 0? 0: domainModelInfo["SizeMetricAnalytics"].NOASSOC*2/domainModelInfo["ElementAnalytics"].ClassNum; //Average number of relationships per class
			
			
		    
		  
		if (callbackfunc) {

			dumpDomainModelElementsInfo(domainModelInfo, function(err){
			if(err){
				callbackfunc(err);
			}
			console.log("evaluate uml elements for domain model");

//			var command = './evaluators/UMLModelElementsEvaluator/DomainModelElementsAnalyticsScript.R "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].EntityAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName+'" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].OperationAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].EntityAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "domain_model_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				var command2 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "attribute_statistics.json"';
				
				
				RScriptExec.runRScript(command2,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					var command3 = '"./Rscript/OutputStatistics.R" "'+domainModelInfo.OutputDir+"/"+domainModelInfo["SizeMetricAnalytics"].OperationAnalyticsFileName+'" "'+domainModelInfo.OutputDir+'" "." "operation_statistics.json"';
					
					
					RScriptExec.runRScript(command3,function(result){
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
				NOCH:0, //Number of children
				DIT:0, //Depth in inheritance tree
				CBO:0, //Coupling between objects
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
				
				SizeMetricsAnalyticsFileName : "sizeMetricsAnalytics.csv"
		}

		for ( var i in modelInfo.UseCases) {
			var useCaseInfo = modelInfo.UseCases[i];

			modelInfo["SizeMetricAnalytics"].NOS ++; //Number of use cases/scenario scripts
			modelInfo["SizeMetricAnalytics"].NT  = useCaseInfo["ElementAnalytics"].PathNum;
			modelInfo["SizeMetricAnalytics"].NOA = useCaseInfo["ElementAnalytics"].ActorNum;
			
			modelInfo["SizeMetricAnalytics"].NOUC ++;
			modelInfo["SizeMetricAnalytics"].NOR = useCaseInfo["ElementAnalytics"].ActorNum; //Number of roles
		}
		
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
			modelInfo["SizeMetricAnalytics"].NOA = domainModelInfo["SizeMetricAnalytics"].NOA; //Number of Attributes
			
			// should be applied to individual classes
			modelInfo["SizeMetricAnalytics"].WMC = domainModelInfo["SizeMetricAnalytics"].WMC; //Weighted methods per class
			modelInfo["SizeMetricAnalytics"].MPC = domainModelInfo["SizeMetricAnalytics"].MPC; //Methods per class
			
			modelInfo["SizeMetricAnalytics"].NOCH = domainModelInfo["SizeMetricAnalytics"].NOCH; //Number of children
			modelInfo["SizeMetricAnalytics"].DIT = domainModelInfo["SizeMetricAnalytics"].DIT; //Depth in inheritance tree
			modelInfo["SizeMetricAnalytics"].CBO = domainModelInfo["SizeMetricAnalytics"].CBO; //Coupling between objects
			
			modelInfo["SizeMetricAnalytics"].NIVPC = domainModelInfo["SizeMetricAnalytics"].NIVPC; //Number of instance variables per class
			
			modelInfo["SizeMetricAnalytics"].NUMS = domainModelInfo["SizeMetricAnalytics"].NUMS; //Number of unique messages sent
			modelInfo["SizeMetricAnalytics"].NCI = domainModelInfo["SizeMetricAnalytics"].NCI; //Number of classes inherited
			modelInfo["SizeMetricAnalytics"].NCIF  = domainModelInfo["SizeMetricAnalytics"].NCIF; //Number of classes inherited from
			// should be applied to individual classes
			
			modelInfo["SizeMetricAnalytics"]. RR = domainModelInfo["SizeMetricAnalytics"]. RR; //Reuse ration
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
			modelInfo["SizeMetricAnalytics"].NOA = domainModelInfo["SizeMetricAnalytics"].NOA; //Number of associations
			modelInfo["SizeMetricAnalytics"].NOMPC= domainModelInfo["SizeMetricAnalytics"].NOA; //Number of methods per class
			modelInfo["SizeMetricAnalytics"].NPPM= domainModelInfo["SizeMetricAnalytics"].NPPM; //Number of parameters per method
			modelInfo["SizeMetricAnalytics"].NMT= domainModelInfo["SizeMetricAnalytics"].NMT; //Number of method types
	        
		}

		if (callbackfunc) {

			dumpModelElementsInfo(modelInfo, function(err){
			if(err){
				callbackfunc(err);
			}

			//Needs to be upgraded soon
			console.log("evaluate uml elements at model level");

//			var command = './evaluators/UMLModelElementsEvaluator/ModelElementsAnalyticsScript.R "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].EntityAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].OperationAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].SizeMetricAnalyticsFileName+'" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].PathAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "."';

			var command1 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].EntityAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "entity_statistics.json"';
			
			
			RScriptExec.runRScript(command1,function(result){
				if (!result) {
					if(callbackfunc){
						callbackfunc(false);
					}
					return;
				}
				var command2 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "attribute_statistics.json"';
				
				
				RScriptExec.runRScript(command2,function(result){
					if (!result) {
						if(callbackfunc){
							callbackfunc(false);
						}
						return;
					}
					var command3 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].SizeMetricAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "element_statistics.json"';
					
					
					RScriptExec.runRScript(command3,function(result){
						if (!result) {
							if(callbackfunc){
								callbackfunc(false);
							}
							return;
						}
						var command4 = '"./Rscript/OutputStatistics.R" "'+modelInfo.OutputDir+"/"+modelInfo["SizeMetricAnalytics"].PathAnalyticsFileName+'" "'+modelInfo.OutputDir+'" "." "path_statistics.json"';
						
						
						RScriptExec.runRScript(command4,function(result){
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
				});
			});
		});
		}

		return modelInfo["SizeMetricAnalytics"];
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



//			var diagram["SizeMetricAnalytics"] = diagram.DiagramAnalytics;
//			diagramAnalyticsStr += diagramNum + ","
//					+ diagram.Name+ ","
//					+ useCase.Name+ ","
//					+ diagram["SizeMetricAnalytics"].PathNum + ","
//					+ diagram["SizeMetricAnalytics"].ElementNum + ","
//					+ diagram["SizeMetricAnalytics"].BoundaryNum + ","
//					+ diagram["SizeMetricAnalytics"].ControlNum + ","
//					+ diagram["SizeMetricAnalytics"].EntityNum + ","
//					+ diagram["SizeMetricAnalytics"].ActorNum + ","
//					+ diagram["SizeMetricAnalytics"].TotalDegree + ","
//					+ diagram["SizeMetricAnalytics"].AvgDegree + ","
//					+ diagram["SizeMetricAnalytics"].AvgPathLength + ","
//					+ diagram["SizeMetricAnalytics"].TotalLinks + "\n"

//			diagramNum++;
//		}

		if(callbackfunc){

		var files = [{fileName : useCaseInfo["SizeMetricAnalytics"].SizeMetricAnalyticsFileName, content : elementAnalyticsStr},
			{fileName : useCaseInfo["SizeMetricAnalytics"].PathAnalyticsFileName, content : pathAnalyticsStr}];

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

		// console.log(domainModelInfo["SizeMetricAnalytics"]);

		if(callbackfunc){

		var files = [{fileName : domainModelInfo["SizeMetricAnalytics"].EntityAnalyticsFileName , content : entityAnalyticsStr },
			{fileName : domainModelInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : domainModelInfo["SizeMetricAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr}];

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


//		var modelInfo["SizeMetricAnalytics"] = modelInfo.ModelAnalytics;
		// console.log(modelInfo["SizeMetricAnalytics"]);

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
			elementNum = useCaseDump.ElementNum;
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
		

		// console.log(domainModelInfo["SizeMetricAnalytics"]);

		if(callbackfunc){

		var files = [{fileName : modelInfo["SizeMetricAnalytics"].PathAnalyticsFileName , content : pathAnalyticsStr },
			{fileName : modelInfo["SizeMetricAnalytics"].SizeMetricAnalyticsFileName, content : elementAnalyticsStr},
			{fileName : modelInfo["SizeMetricAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr},
			{fileName : modelInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
			{fileName : modelInfo["SizeMetricAnalytics"].EntityAnalyticsFileName, content : entityAnalyticsStr}
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

//		var repoInfo["SizeMetricAnalytics"] = repoInfo.RepoAnalytics;
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
			elementNum = modelDump.ElementNum;
			elementAnalyticsStr += modelDump.elementAnalyticsStr;
			entityNum = modelDump.entityNum;
			entityAnalyticsStr += modelDump.entityAnalyticsStr;
			attributeNum = modelDump.attributeNum;
			attributeAnalyticsStr += modelDump.attributeAnalyticsStr;
			operationNum = modelDump.operationNum;
			operationAnalyticsStr += modelDump.operationAnalyticsStr;
		}


		if(callbackfunc){

			var files = [{fileName : repoInfo["SizeMetricAnalytics"].PathAnalyticsFileName , content : pathAnalyticsStr},
				{fileName : repoInfo["SizeMetricAnalytics"].SizeMetricAnalyticsFileName, content : elementAnalyticsStr},
				{fileName : repoInfo["SizeMetricAnalytics"].OperationAnalyticsFileName, content : operationAnalyticsStr},
				{fileName : repoInfo["SizeMetricAnalytics"].AttributeAnalyticsFileName, content : attributeAnalyticsStr},
				{fileName : repoInfo["SizeMetricAnalytics"].EntityAnalyticsFileName, content : entityAnalyticsStr}
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
//		toUseCaseEvaluationHeader : toUseCaseEvaluationHeader,
//		toUseCaseEvaluationRow : toUseCaseEvaluationRow,
		toDomainModelEvaluationHeader: toDomainModelEvaluationHeader,
		toDomainModelEvaluationRow: toDomainModelEvaluationRow,
		// loadFromModelEmpirics: loadFromModelEmpirics,
//		loadFromUseCaseEmpirics : loadFromUseCaseEmpirics,
//		evaluateRepo : evaluateRepo,
//		evaluateUseCase : evaluateUseCase,
		evaluateModel : evaluateModel,
		evaluateDomainModel : evaluateDomainModel,
		analyseModelEvaluation: analyseModelEvaluation
	}

}())
