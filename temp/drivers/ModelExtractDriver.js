/**
 *  Work as a test stub
 */

var modelXMLParser = require('../model_platforms/ea/XMI2.1Parser.js');
var UMLDiagramProfiler = require('../diagram_profilers/UMLDiagramProfiler.js');
var UMLModelAnalyser = require('../UMLModelAnalyzer.js');
var mkdirp = require('mkdirp');
var fs = require('fs');

var umlFileInfo = {
		umlFilePath: '../data/Experiment/model_example2.xml',
		umlModelName: 'model_test',
		outputDir: '../data/Experiment/output_model_diagram',
		accessDir: '../data/Experiment/output_model_diagram'
};

UMLModelAnalyser.extractModelInfoTest(umlFileInfo, function(models){
//	console.log(models);
	console.log(models['Packages']);
//	console.log('============models=========');
//	console.log(models['Packages']['EAPK_E02547B7_FD0F_49cc_A157_A4A7DE101829']);
//	console.log('============domain model=========');
//	console.log(models['Packages']['EAPK_E02547B7_FD0F_49cc_A157_A4A7DE101829']['EAID_6B01EB03_2900_4f92_9B06_8948A62306B4']['Elements']);
//	console.log('============domain model elements=========');
//	console.log(models['Packages']['EAPK_E02547B7_FD0F_49cc_A157_A4A7DE101829']['EAID_6B01EB03_2900_4f92_9B06_8948A62306B4']['Elements']['EAID_A8B16E1B_8EAF_4d54_A32C_31362F8E5339']['Attributes']);
//	console.log('============domain model element properties=========');
//	console.log(models['Packages']['EAPK_A6F95B25_2DA6_4dfa_836A_536001EED9BC']['UseCases']);
//	console.log('============use cases=========');
//	console.log(models['Packages']['EAPK_A6F95B25_2DA6_4dfa_836A_536001EED9BC']['UseCases']['EAID_E58FFDE5_14E4_4ffb_B657_867CEE44ECDE']['EAID_E719B8F4_70EF_4aa3_AB05_FAEF2407FAFB']);
//	console.log('============Elements=========');
//	console.log(models['Packages']['EAPK_A6F95B25_2DA6_4dfa_836A_536001EED9BC']['UseCases']['EAID_E58FFDE5_14E4_4ffb_B657_867CEE44ECDE']['EAID_E719B8F4_70EF_4aa3_AB05_FAEF2407FAFB']);
//	console.log('============Elements=========');
//	console.log(models['Packages']['EAPK_A6F95B25_2DA6_4dfa_836A_536001EED9BC']['UseCases']['EAID_E58FFDE5_14E4_4ffb_B657_867CEE44ECDE']['EAID_E719B8F4_70EF_4aa3_AB05_FAEF2407FAFB']);
//	console.log('============Elements=========');
});