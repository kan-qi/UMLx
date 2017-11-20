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
	
	function loadModelEmpirics(modelLoad, modelInfo, modelIndex){
	
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
				
				modelInfo.COCOMOData = COCOMOData;
	}
	
	function calculateCCOCOMOEffortEstimation(cocomoData){
		//normalize effort with the equation in use case driven paper
		//var effort_actual = cocomoData.Effort;
		var ksloc = cocomoData.KSLOC;
//		var cocomoData = modelInfo.COCOMOData;
		var sfFactors = cocomoData.SF.PREC + 
		cocomoData.SF.FLEX + 
		cocomoData.SF.RESL + 
		cocomoData.SF.TEAM + 
		cocomoData.SF.PMAT;
		
		var emFactors = cocomoData.EM.PROD.RELY *
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
		
		var A = 2.94;
		var B = 0.91;
		var E = 0.91 + 0.01*sfFactors;
		
		return A*(ksloc^E)*emFactors;
	}
	
	// call this method to read the data from 
	function loadAndCalculateCocomoEffortEstimation(){
		//var ModelDataFilePath = modelFile ? modelFile :repoInfo.outputDir+"/ModelDataLoad.csv";
		var ModelDataFilePath = "./ModelDataLoad.csv"
		console.log('loadModelEmpirics:', ModelDataFilePath);
		fs.readFile(ModelDataFilePath, 'utf-8', (err, str) => {
			   if (err) throw err;
//			    console.log(str);
			  
			    data = parseCSVData(str, header);
			    
//			    console.log("csv data is loaded");
//			    console.log(data);
			    
			    if(callbackfunc){
			    	callbackfunc(data);
			    }
			    
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
			
			var models = repoInfo.models;
			var modelIndex = 0;
			for(var i in models){
				var model = models[i];
				var modelName = model.Name;
				var modelLoad = modelDataArray[modelName];
				if(!modelLoad){
					continue;
				}
				
				
				loadModelEmpirics(modelLoad, model, modelIndex);
				modelInfo.cocomoEffortEstimation = calculateCCOCOMOEffortEstimation(modelInfo.COCOMOData);
				//You can get the output from console. Or you call modify here to output into a csv file for your further analysis.
				console.log(modelInfo.cocomoEffortEstimation);
				modelIndex++;
			}
		});
}
	
	