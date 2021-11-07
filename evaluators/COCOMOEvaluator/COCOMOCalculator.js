/**
 * http://usejsdoc.org/
 * 
 * Integrate cocomo for normalization, effort estimation integration, factor evaluations
 * 
 * 
 * 	PREC	VL	L	N	H	VH	EXH	
		6.2	4.96	3.72	2.48	1.24	0	
	FLEX	VL	L	N	H	VH	EXH	
		5.07	4.05	3.04	2.03	1.01	0	
	RESL	VL	L	N	H	VH	EXH	
		7.07	5.65	4.24	2.83	1.41	0	
	TEAM	VL	L	N	H	VH	EXH	
		5.48	4.38	3.29	2.19	1.1	0	
	PMAT	VL	L	N	H	VH	EXH	
		7.8	6.24	4.68	3.12	1.56	0	
	RELY	VL	L	N	H	VH	EXH						Product Factors	
		0.82	0.92	1	1.1	1.26	n/a	
	DATA	VL	L	N	H	VH	EXH	
		n/a	0.9	1	1.14	1.28	n/a	
	CPLX	VL	L	N	H	VH	EXH	
		0.73	0.87	1	1.17	1.34	1.74	
	RUSE	VL	L	N	H	VH	EXH	
		n/a	0.95	1	1.07	1.15	1.24	
	DOCU	VL	L	N	H	VH	EXH	
		0.81	0.91	1	1.11	1.23	n/a	
	TIME	VL	L	N	H	VH	EXH						Platform Factors	
		n/a	n/a	1	1.11	0.129	1.63	
	STOR	VL	L	N	H	VH	EXH	
		n/a	n/a	1	1.05	1.17	1.46	
	PVOL	VL	L	N	H	VH	EXH	
		n/a	0.87	1	1.15	1.3	n/a	
	ACAP	VL	L	N	H	VH	EXH						Personnel Factors	
		1.42	1.19	1	0.85	0.71	n/a	
	PCAP	VL	L	N	H	VH	EXH	
		1.34	1.15	1	0.88	0.76	n/a	
	PCON	VL	L	N	H	VH	EXH	
		1.29	1.12	1	0.9	0.81		
	APEX	VL	L	N	H	VH	EXH	
		1.22	1.1	1	0.88	0.81	n/a	
	PLEX	VL	L	N	H	VH	EXH	
		1.19	1.09	1	0.91	0.85	n/a	
	LTEX	VL	L	N	H	VH	EXH	
		1.2	1.09	1	0.91	0.84		
	TOOL	VL	L	N	H	VH	EXH						Project Factors	
		1.17	1.09	1	0.9	0.78	n/a	
	SITE	VL	L	N	H	VH	EXH	
		1.22	1.09	1	0.93	0.86	0.8	
	SCED	VL	L	N	H	VH	EXH	
		1.43	1.14	1	1	1	n/a	

 * 
 * 
 * 
 * 
 */


(function() {
	
	var fs = require('fs');
	var exec = require('child_process').exec;
	var mkdirp = require('mkdirp');
	
	var COCOMO = {
			SF:{
				PREC: {VL:6.2,L:4.96,N:3.72,H:2.48,VH:1.24,EXH:'NA'},
				FLEX: {VL:5.07,L:4.05,N:3.04,H:2.03,VH:1.01,EXH:'NA'},
				RESL: {VL:7.07,L:5.65,N:4.24,H:2.83,VH:1.41,EXH:'NA'},
				TEAM: {VL:5.48,L:4.38,N:3.29,H:2.19,VH:1.1,EXH:'NA'},
				PMAT: {VL:7.8,L:6.24,N:4.68,H:3.12,VH:1.56,EXH:'NA'}
			},
			EM:{
				PROD:{
					RELY: {VL:0.82,L:0.92,N:1,H:1.1,VH:1.26,EXH:'NA'},
					DATA: {VL:'NA',L:0.9,N:1,H:1.14,VH:1.28,EXH:'NA'},
					CPLX: {VL:0.73,L:0.87,N:1,H:1.17,VH:1.34,EXH:1.74},
					RUSE: {VL:'NA',L:0.95,N:1,H:1.07,VH:1.15,EXH:1.24},
					DOCU: {VL:0.81,L:0.91,N:1,H:1.11,VH:1.23,EXH:'NA'}
				},
				PLAT:{
					TIME: {VL:'NA',L:'NA',N:1,H:1.11,VH:1.29,EXH:1.63},
					STOR: {VL:'NA',L:'NA',N:1,H:1.05,VH:1.17,EXH:1.46},
					PVOL: {VL:'NA',L:0.87,N:1,H:1.15,VH:1.3,EXH:'NA'}
				},
				PERS:{
					ACAP: {VL:1.42,L:1.19,N:1,H:0.85,VH:0.71,EXH:'NA'},
					PCAP: {VL:1.34,L:1.15,N:1,H:0.88,VH:0.76,EXH:'NA'},
					PCON: {VL:1.29,L:1.12,N:1,H:0.9,VH:0.81,EXH:'NA'},
					APEX: {VL:1.22,L:1.1,N:1,H:0.88,VH:0.81,EXH:'NA'},
					PLEX: {VL:1.19,L:1.09,N:1,H:0.91,VH:0.85,EXH:'NA'},
					LTEX: {VL:1.19,L:1.09,N:1,H:0.91,VH:0.84,EXH:'NA'}
				},
				PROJ:{
					TOOL: {VL:1.17,L:1.09,N:1,H:0.9,VH:0.78,EXH:'NA'},
					SITE: {VL:1.22,L:1.09,N:1,H:0.93,VH:0.86,EXH:0.8},
					SCED: {VL:1.43,L:1.14,N:1,H:1,VH:1,EXH:'NA'}
				}
			}
	};
	
	
	function covertCOCOMORatings(modelLoad){
		COCOMOData = {
				Effort: 0,
				KSLOC: 0,
				Effort_Norm: 0,
				SF: {
					PREC: COCOMO.SF.PREC.N,
					FLEX: COCOMO.SF.FLEX.N,
					RESL: COCOMO.SF.RESL.N,
					TEAM: COCOMO.SF.TEAM.N,
					PMAT: COCOMO.SF.PMAT.N
				},
				EM: {
					PROD:{
						RELY: COCOMO.EM.PROD.RELY.N,
						DATA: COCOMO.EM.PROD.DATA.N,
						CPLX: COCOMO.EM.PROD.CPLX.N,
						RUSE: COCOMO.EM.PROD.RUSE.N,
						DOCU: COCOMO.EM.PROD.DOCU.N
					},
					PLAT:{
						TIME: COCOMO.EM.PLAT.TIME.N,
						STOR: COCOMO.EM.PLAT.STOR.N,
						PVOL: COCOMO.EM.PLAT.PVOL.N
					},
					PERS:{
						ACAP: COCOMO.EM.PERS.ACAP.N,
						PCAP: COCOMO.EM.PERS.PCAP.N,
						PCON: COCOMO.EM.PERS.PCON.N,
						APEX: COCOMO.EM.PERS.APEX.N,
						PLEX: COCOMO.EM.PERS.PLEX.N,
						LTEX: COCOMO.EM.PERS.LTEX.N
					},
					PROJ:{
						TOOL: COCOMO.EM.PROJ.TOOL.N,
						SITE: COCOMO.EM.PROJ.SITE.N,
						SCED: COCOMO.EM.PROJ.SCED.N
					}						}
			};
		
		
		// populate scale factor data
		COCOMOData['Effort'] = modelLoad['Effort'];
		COCOMOData['KSLOC'] = modelLoad['KSLOC'];
		for(var j in COCOMOData.SF ){
			var rating = modelLoad[j];
			var value = COCOMO['SF'][j][rating];
			COCOMOData['SF'][j] = value;
		}
		// populate effort multiplier data
		// populate product data
		for(var j in COCOMOData.EM.PROD){
			var rating = modelLoad[j];
			var value = COCOMO['EM']['PROD'][j][rating];
			COCOMOData['EM']['PROD'][j] = value;
		}
		// populate platform data
		for(var j in COCOMOData.EM.PLAT){
			var rating = modelLoad[j];
			var value = COCOMO['EM']['PLAT'][j][rating];
			COCOMOData['EM']['PLAT'][j] = value;
		}
		// populate personnel data
		for(var j in COCOMOData.EM.PERS){
			var rating = modelLoad[j];
			var value = COCOMO['EM']['PERS'][j][rating];
			COCOMOData['EM']['PERS'][j] = value;
		}
		// populate project data
		for(var j in COCOMOData.EM.PROJ){
			var rating = modelLoad[j];
			var value = COCOMO['EM']['PROJ'][j][rating];
			COCOMOData['EM']['PROJ'][j] = value;
		}
		
		return COCOMOData;
	}
	
	function loadModelEmpirics(modelLoad, modelInfo, modelIndex){
				var cocomoData = covertCOCOMORatings(modelLoad);
				modelInfo.COCOMOData = cocomoData;
				normalizeEffort(modelInfo.COCOMOData);
				console.log("cocomo load model empirics");
	}
	
	function toModelEvaluationHeader(){
		return "Effort_Norm,Norm_Factor,KSLOC,Effort";
//		return "";
	}
	
	function toModelEvaluationRow(modelInfo, index){
//		cocomoData = modelInfo.COCOMOData;
		
		//COCOMOData may not exist, if COCOMO data is not loaded
//		if(!modelInfo.COCOMOData){
//			modelInfo.COCOMOData = {
//					normEffort : 0,
//					normFactor : 0,
//					ksloc : 0
//			}
//		}
		
		if(modelInfo.COCOMOData){
			return modelInfo.COCOMOData.Effort_Norm+"," + modelInfo.COCOMOData.Norm_Factor+"," + modelInfo.COCOMOData.KSLOC+","+modelInfo.COCOMOData.Effort;
		}
		else {
			return "NA,NA,NA,NA";
		}
	}
	
	function normalizeEffort(cocomoData){
		//normalize effort with the equation in use case driven paper
		var effort_actual = cocomoData.Effort;
		var ksloc = cocomoData.KSLOC;
//		var cocomoData = modelInfo.COCOMOData;
		var sf_delta = (cocomoData.SF.PREC - COCOMO.SF.PREC.N) + 
		(cocomoData.SF.FLEX - COCOMO.SF.FLEX.N) + 
		(cocomoData.SF.RESL - COCOMO.SF.RESL.N) + 
		(cocomoData.SF.TEAM - COCOMO.SF.TEAM.N) + 
		(cocomoData.SF.PMAT - COCOMO.SF.PMAT.N);
		
//		var em_delta = (cocomoData.EM.PROD.RELY - COCOMO.EM.PROD.RELY.N) *
//		(cocomoData.EM.PROD.DATA - COCOMO.EM.PROD.DATA.N) *
//		(cocomoData.EM.PROD.CPLX - COCOMO.EM.PROD.CPLX.N) *
//		(cocomoData.EM.PROD.RUSE - COCOMO.EM.PROD.RUSE.N) *
//		(cocomoData.EM.PROD.DOCU - COCOMO.EM.PROD.DOCU.N) *
//		(cocomoData.EM.PLAT.TIME - COCOMO.EM.PLAT.TIME.N) *
//		(cocomoData.EM.PLAT.STOR - COCOMO.EM.PLAT.STOR.N) *
//		(cocomoData.EM.PLAT.PVOL - COCOMO.EM.PLAT.PVOL.N) *
//		(cocomoData.EM.PERS.ACAP - COCOMO.EM.PERS.ACAP.N) *
//		(cocomoData.EM.PERS.PCAP - COCOMO.EM.PERS.PCAP.N) *
//		(cocomoData.EM.PERS.PCON - COCOMO.EM.PERS.PCON.N) *
//		(cocomoData.EM.PERS.APEX - COCOMO.EM.PERS.APEX.N) *
//		(cocomoData.EM.PERS.PLEX - COCOMO.EM.PERS.PLEX.N) *
//		(cocomoData.EM.PERS.LTEX - COCOMO.EM.PERS.LTEX.N) *
//		(cocomoData.EM.PROJ.TOOL - COCOMO.EM.PROJ.TOOL.N) *
//		(cocomoData.EM.PROJ.SITE - COCOMO.EM.PROJ.SITE.N) *
//		(cocomoData.EM.PROJ.SCED - COCOMO.EM.PROJ.SCED.N);
		
		var em_delta = cocomoData.EM.PROD.RELY *
		cocomoData.EM.PROD.DATA *
		cocomoData.EM.PROD.CPLX *
		cocomoData.EM.PROD.RUSE *
		cocomoData.EM.PROD.DOCU *
		cocomoData.EM.PLAT.TIME *
		cocomoData.EM.PLAT.STOR *
		cocomoData.EM.PLAT.PVOL *
		cocomoData.EM.PERS.ACAP *
		cocomoData.EM.PERS.PCAP *
		cocomoData.EM.PERS.PCON *
		cocomoData.EM.PERS.APEX *
		cocomoData.EM.PERS.PLEX *
		cocomoData.EM.PERS.LTEX *
		cocomoData.EM.PROJ.TOOL *
		cocomoData.EM.PROJ.SITE *
		cocomoData.EM.PROJ.SCED ;
		
		cocomoData.Norm_Factor = 1/(em_delta*Math.pow(ksloc, 0.01*sf_delta));
		cocomoData.Effort_Norm = effort_actual*cocomoData.Norm_Factor;
		
		return cocomoData.Effort_Norm;
	}
	
	function outputCOCOMORatings(cocomoData, modelNum){
		return modelNum+","+
		cocomoData['Effort']+","+
		cocomoData['KSLOC']+","+
		cocomoData.EM.PROD.RELY+","+
		cocomoData.EM.PROD.DATA+","+
		cocomoData.EM.PROD.CPLX+","+
		cocomoData.EM.PROD.RUSE+","+
		cocomoData.EM.PROD.DOCU+","+
		cocomoData.EM.PLAT.TIME+","+
		cocomoData.EM.PLAT.STOR+","+
		cocomoData.EM.PLAT.PVOL+","+
		cocomoData.EM.PERS.ACAP+","+
		cocomoData.EM.PERS.PCAP+","+
		cocomoData.EM.PERS.PCON+","+
		cocomoData.EM.PERS.APEX+","+
		cocomoData.EM.PERS.PLEX+","+
		cocomoData.EM.PERS.LTEX+","+
		cocomoData.EM.PROJ.TOOL+","+
		cocomoData.EM.PROJ.SITE+","+
		cocomoData.EM.PROJ.SCED ;
	}


	function estimateEffortandScheduleWithCocomo(cocomoData){
    		// populateCocomoValues(cocomoData);
    		// setDefaultValues(cocomoData);
    		calEquivalentSize(cocomoData);
    		var A = 2.94;
    		var C = 3.67;
    		var B = 0.91;
    		var D = 0.28;

    		var E = B + 0.01*(
    			cocomoData.SF.PREC+cocomoData.SF.FLEX+cocomoData.SF.RESL+cocomoData.SF.TEAM+cocomoData.SF.PMAT
    		);

    		cocomoData.SIZE = cocomoData.sloc*0.001;
    		cocomoData.PMNS = A*Math.pow(cocomoData.SIZE, E)*
    		cocomoData.EM.PROD.DOCU*
    		cocomoData.EM.PROD.RELY*
    		cocomoData.EM.PROD.CPLX*
    		cocomoData.EM.PROD.DATA*
    		cocomoData.EM.PROD.RUSE*
    		cocomoData.EM.PROJ.TOOL*
    		cocomoData.EM.PROJ.SITE*
    		cocomoData.EM.PROJ.SCED*
    		cocomoData.EM.PERS.APEX*
    		cocomoData.EM.PERS.ACAP*
    		cocomoData.EM.PERS.PCAP*
    		cocomoData.EM.PERS.PCON*
    		cocomoData.EM.PERS.PLEX*
    		cocomoData.EM.PERS.LTEX*
    		cocomoData.EM.PLAT.PVOL*
    		cocomoData.EM.PLAT.TIME*
    		cocomoData.EM.PLAT.STOR;

    		var F = D+ 0.2*(E - B);
    		cocomoData.TDEV = C * Math.pow(cocomoData.PMNS/cocomoData.EM.PROJ.SCED, F)*100/100;

    		if(cocomoData.TDEV != 0){
    		cocomoData.STAFF = cocomoData.PMNS/cocomoData.TDEV;
    		}

    		if(cocomoData.TDEV != 0){
    		cocomoData.PROD = cocomoData.SIZE/cocomoData.TDEV;
    		}

    		cocomoData.E_most_likely = cocomoData.PMNS;
    		cocomoData.E_pessimistic = 1.25*cocomoData.PMNS;
    		cocomoData.E_optimistic = 0.80*cocomoData.PMNS;

    		cocomoData.TDEV_most_likely = cocomoData.TDEV;
    		cocomoData.TDEV_pessimistic = C * Math.pow(cocomoData.E_pessimistic/cocomoData.EM.PROJ.SCED, F)*100/100;
    		cocomoData.TDEV_optimistic = C * Math.pow(cocomoData.E_optimistic/cocomoData.EM.PROJ.SCED, F)*100/100;

    		cocomoData.STAFF_most_likely = cocomoData.STAFF;
    		if(cocomoData.TDEV_pessimistic != 0){
    		cocomoData.STAFF_pessimistic = cocomoData.E_pessimistic/cocomoData.TDEV_pessimistic;
    		cocomoData.STAFF_optimistic = cocomoData.E_optimistic/cocomoData.TDEV_optimistic;
    		}

    		cocomoData.PROD_most_likely = cocomoData.PROD;
    		if(cocomoData.TDEV_pessimistic != 0){
    		cocomoData.PROD_pessimistic = cocomoData.SIZE/cocomoData.TDEV_pessimistic;
    		cocomoData.PROD_optimistic = cocomoData.SIZE/cocomoData.TDEV_optimistic;
    		}

    		cocomoData.PH_most_likely = cocomoData.E_most_likely*156;

    		return cocomoData;
    	}

    	function calEquivalentSize(cocomoData){

        		//AAM - adaptation adjustment modifier
        		//SU - software understanding
        		//AA - assessment and assimilation
        		//AAF - adaptation adjustment factor
        		//DM - design modified.
        		//CM - code modified.
        		//IM - integration modified.

        		cocomoData.reused_sloc_aaf = cocomoData.reused_sloc_design_modified + cocomoData.reused_sloc_code_modified + cocomoData.reused_sloc_integration_modified;
        		cocomoData.modified_sloc_aaf = cocomoData.modified_sloc_design_modified + cocomoData.modified_sloc_code_modified + cocomoData.modified_sloc_integration_modified;

        		if(cocomoData.reused_sloc_aaf > 50){
        		cocomoData.reused_sloc_aam = (cocomoData.aa_3+cocomoData.reused_sloc_aaf+cocomoData.aa_3*cocomoData.unfm_4)/100;
        		}else{
        		cocomoData.reused_sloc_aam = (cocomoData.aa_3+cocomoData.reused_sloc_aaf*(1+0.02*(cocomoData.aa_3*cocomoData.unfm_4)))/100;
        		}

        		cocomoData.reused_esloc = cocomoData.reused_sloc * cocomoData.reused_sloc_aam;

        		if(cocomoData.modified_sloc_aaf > 50){
        		cocomoData.modified_sloc_aam = (cocomoData.aa_3+cocomoData.modified_sloc_aaf+cocomoData.aa_3*cocomoData.unfm_4)/100;
        		}else{
        		cocomoData.modified_sloc_aam = (cocomoData.aa_3+cocomoData.modified_sloc_aaf*(1+0.02*(cocomoData.aa_3*cocomoData.unfm_4)))/100;
        		}

        		cocomoData.modified_esloc = cocomoData.modified_sloc * cocomoData.modified_sloc_aam;

        		cocomoData.sloc = cocomoData.new_sloc + cocomoData.reused_esloc + cocomoData.modified_esloc;

        	}

        	function covertCOCOMORatings(modelLoad){

        		COCOMOData = {
        				Effort: 0,
        				KSLOC: 0,
        				Effort_Norm: 0,
        				new_sloc:0,
        				reused_sloc_design_modified:0,
        				reused_sloc_code_modified:0,
        				reused_sloc_integration_modified:0,
        				modified_sloc_design_modified:0,
        				modified_sloc_code_modified:0,
        				modified_sloc_integration_modified:0,
        				reused_sloc:0,
        				modified_sloc:0,
        				aa_1:0,
        				aa_2:2,
        				aa_3:4,
        				aa_4:6,
        				aa_5:8,
        				unfm_1:0.0,
        				unfm_2:0.2,
        				unfm_3:0.4,
        				unfm_4:0.6,
        				unfm_5:0.8,
        				unfm_6:1,
        				SF: {
        					PREC: COCOMO.SF.PREC.N,
        					FLEX: COCOMO.SF.FLEX.N,
        					RESL: COCOMO.SF.RESL.N,
        					TEAM: COCOMO.SF.TEAM.N,
        					PMAT: COCOMO.SF.PMAT.N
        				},
        				EM: {
        					PROD:{
        						RELY: COCOMO.EM.PROD.RELY.N,
        						DATA: COCOMO.EM.PROD.DATA.N,
        						CPLX: COCOMO.EM.PROD.CPLX.N,
        						RUSE: COCOMO.EM.PROD.RUSE.N,
        						DOCU: COCOMO.EM.PROD.DOCU.N
        					},
        					PLAT:{
        						TIME: COCOMO.EM.PLAT.TIME.N,
        						STOR: COCOMO.EM.PLAT.STOR.N,
        						PVOL: COCOMO.EM.PLAT.PVOL.N
        					},
        					PERS:{
        						ACAP: COCOMO.EM.PERS.ACAP.N,
        						PCAP: COCOMO.EM.PERS.PCAP.N,
        						PCON: COCOMO.EM.PERS.PCON.N,
        						APEX: COCOMO.EM.PERS.APEX.N,
        						PLEX: COCOMO.EM.PERS.PLEX.N,
        						LTEX: COCOMO.EM.PERS.LTEX.N
        					},
        					PROJ:{
        						TOOL: COCOMO.EM.PROJ.TOOL.N,
        						SITE: COCOMO.EM.PROJ.SITE.N,
        						SCED: COCOMO.EM.PROJ.SCED.N
        					}
        				}
        			};


        		// populate scale factor data
        		COCOMOData['Effort'] = modelLoad['Effort'];
        		COCOMOData['KSLOC'] = modelLoad['KSLOC'];
        		COCOMOData['new_sloc'] = modelLoad['KSLOC']*1000;
        		for(var j in COCOMOData.SF ){
        			var rating = modelLoad[j];
        			var value = COCOMO['SF'][j][rating];
        			COCOMOData['SF'][j] = value;
        		}
        		// populate effort multiplier data
        		// populate product data
        		for(var j in COCOMOData.EM.PROD){
        			var rating = modelLoad[j];
        			var value = COCOMO['EM']['PROD'][j][rating];
        			COCOMOData['EM']['PROD'][j] = value;
        		}
        		// populate platform data
        		for(var j in COCOMOData.EM.PLAT){
        			var rating = modelLoad[j];
        			var value = COCOMO['EM']['PLAT'][j][rating];
        			COCOMOData['EM']['PLAT'][j] = value;
        		}
        		// populate personnel data
        		for(var j in COCOMOData.EM.PERS){
        			var rating = modelLoad[j];
        			var value = COCOMO['EM']['PERS'][j][rating];
        			COCOMOData['EM']['PERS'][j] = value;
        		}
        		// populate project data
        		for(var j in COCOMOData.EM.PROJ){
        			var rating = modelLoad[j];
        			var value = COCOMO['EM']['PROJ'][j][rating];
        			COCOMOData['EM']['PROJ'][j] = value;
        		}

        		return COCOMOData;
        	}

	
	module.exports = {
		toModelEvaluationHeader: toModelEvaluationHeader,
		toModelEvaluationRow: toModelEvaluationRow,
		loadModelEmpirics: loadModelEmpirics,
		COCOMO: COCOMO,
		//this function is not used for now.
		getPredictionModels : function(predictionModelIdentifier){

        		    if(predictionModelIdentifier !== "cocomo"){
        		        return null;
        		    }

        		    var estimateProjectEffort = function(cocomoData){
                    			var cocomoData = estimateEffortandScheduleWithCocomo(cocomoData);
                    //			console.log(cocomoData);
                    			return cocomoData;
                    		}


                    return {
                       cocomo: {
                                   predictEffort: estimateProjectEffort
                                                                                                       },
                    }

        },
        		genDefaultValues: function(){
        			var COCOMO = {
        			PREC: "N",
        				FLEX: "N",
        				RESL: "N",
        				TEAM: "N",
        				PMAT: "N",
        					RELY: "N",
        					DATA: "N",
        					CPLX: "N",
        					RUSE:"N",
        					DOCU: "N",
        					TIME:"N",
        					STOR: "N",
        					PVOL: "N",
        					ACAP: "N",
        					PCAP: "N",
        					PCON: "N",
        					APEX: "N",
        					PLEX: "N",
        					LTEX: "N",
        					TOOL: "N",
        					SITE: "N",
        					SCED: "N"
        			};

        			return COCOMO;
        		},
		loadCOCOMOData: function(ModelDataFilePath, callbackfunc){
			var umlFileManager = require("../UMLFileManager.js");
			umlFileManager.loadCSVFile(ModelDataFilePath, true, function(data){
				var modelDataArray = {};
				for(var i in data){
					var dataElement = data[i];
					var modelData = modelDataArray[dataElement['PROJ']];
					if(modelData === undefined){
						modelData = {};
						modelDataArray[dataElement['PROJ']] = modelData;
					}
					
					for(var j in dataElement){
						modelData[j] = dataElement[j];
					}
				}
				
//				var models = repoInfo.models;
				var modelIndex = 0;
				var outputStr = "Project,Effort,KSLOC,RELY,DATA,CPLX,RUSE,DOCU,TIME,STOR,PVOL,ACAP,PCAP,PCON,APEX,PLEX,LTEX,TOOL,SITE,SCED\n";
				
				var modelIndex = 0;
				for(var i in modelDataArray){
				var modelLoad = modelDataArray[i];
//				var modelInfo = {};
//				loadModelEmpirics(modelLoad, modelInfo, modelIndex);
				
				var cocomoData = covertCOCOMORatings(modelLoad);
				
				
				console.log(modelLoad);
				
				outputStr += outputCOCOMORatings(cocomoData, modelIndex)+"\n";
				//console.log(dataInfo);	
				modelIndex++;
				}

				
				if(callbackfunc){
					callbackfunc(outputStr);
				}
			});
		}
	}
	
}())