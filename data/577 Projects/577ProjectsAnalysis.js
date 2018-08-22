/**
 * This script takes two parameters --command repo-descriptive-file-path
 */


var path = require('path');
var mkdirp = require('mkdirp');

// 2010 - 2011
var testProject1 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\bookTicketsExamplev5.xml";
var testProject2 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\bookTicketsExamplev5.xml";
var testProject3 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\bookTicketsExamplev5.xml";
var testProject4 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\bookTicketsExamplev5.xml";
var testProject5 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\bookTicketsExamplev5.xml";
//var testProject1 = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\data\577 Projects\2011-2012\XMIsV1.1\Amer_I_Can_Re_Up.xml";
//var testProject2 = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\data\577 Projects\2011-2012\XMIsV1.1\Improving_Thai_CDC.xml";
//var testProject3 = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\data\577 Projects\2011-2012\XMIsV1.1\Istartonmonday_com.xml";
//var testProject4 = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\data\577 Projects\2011-2012\XMIsV1.1\Leamos_TM.xml";
//var testProject5 = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\data\577 Projects\2011-2012\XMIsV1.1\LEMA_FAMILY_ACCOUNTABILITY_SYSTEM.xml";
//var testProject6 = "C:\Users\flyqk\Documents\Google Drive\ResearchSpace\Research Projects\UMLx\data\577 Projects\2011-2012\XMIsV1.1\Los_Angeles_Child_Guidance_Clinic_Employment_Opportunities_Online_Application_System.xml";
//var testProject7 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\httpcomponents-core";
//var testProject8 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit";
//var testProject9 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit-filevault";
//var testProject10 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit-oak";

//// 2011 - 2012
var testProject11 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012\\XMIsV1.1\\Amer_I_Can_Re_Up.xml";
var testProject12 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012\\XMIsV1.1\\Improving_Thai_CDC.xml";
var testProject13 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012\\XMIsV1.1\\Istartonmonday_com.xml";
var testProject14 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012\\XMIsV1.1\\Leamos_TM.xml";
var testProject15 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012\\XMIsV1.1\\LEMA_FAMILY_ACCOUNTABILITY_SYSTEM.xml";
var testProject16 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012\\XMIsV1.1\\Los_Angeles_Child_Guidance_Clinic_Employment_Opportunities_Online_Application_System.xml";
var testProject17 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012\\XMIsV1.1\\LEMA_FAMILY_ACCOUNTABILITY_SYSTEM.xml";
var testProject18 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012\\XMIsV1.1\\LEMA_Pilot_School_Integrated_Scheduling_System.xml";
//var testProject19 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit-filevault";
//var testProject20 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jackrabbit-oak";
//
//// 2012 - 2013
var testProject21 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2012-2013\\XMIsV1.1\\Art_Crafts_Website.xml";
var testProject22 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2012-2013\\XMIsV1.1\\Improvementon_on_VITA_website.xml";
var testProject23 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2012-2013\\XMIsV1.1\\Pediatric_Trauma_Society_Research_Investigator_Databank _PTS_RID.xml";
var testProject24 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2012-2013\\XMIsV1.1\\Web_based_product_configurator_and_data_service_system.xml";
var testProject25 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2012-2013\\XMIsV1.1\\Web_Media_Modernization_2012.xml";
var testProject26 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2012-2013\\XMIsV1.1\\XL_2.xml";
//var testProject27 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\jclouds";

// 2013 - 2014
var testProject131 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_City_of_LosAngeles_Public_Safety_Applicant_Resource_Center.xml";
var testProject132 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_Cityof_LosAngeles_Personnel_Department_Mobile_Applications.xml";
var testProject133 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_LA_Commons_upgradeof_website.xml";
var testProject134 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_LiveRiot_Video_Editing_System_and_socialNetworking_enhancement.xml";
var testProject135 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_MedFRS_Device_Diagnostic_Software.xml";
var testProject136 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_Mission_Science_Information_and Data_Management_System.xml";
var testProject137 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_OnlineWedding_Management_System.xml";
var testProject138 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_Spherical_Modeling_Tool.xml";
var testProject139 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_Surgery_Assist.xml";
var testProject140 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\F13a_Yanomamo Interactive CDROM.xml";
var testProject141 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S13b_PTS_RID.xml";
var testProject142 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S13b_SomaticsWeb_DataServices.xml";
var testProject143 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S13b_United_Direct_Marketing.xml";
var testProject144 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S14b_E-LockBox.xml";
var testProject145 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S14b_Healthy_Kids_Zone_SurveyApp.xml";
var testProject146 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S14b_JEP_Online_Platform.xml";
var testProject147 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S14b_Lose4Good.org_Database_Driven_Socially_Connected_Website.xml";
var testProject148 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S14b_Student_Scheduling_Systemb.xml";
//var testProject149 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014\\XMIs\\S14b_ThrdPlace_Social_Networking.xml";

// 2014 - 2015
var testProject231 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F14a_black_professionals_net.xml";
var testProject232 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\f14a_cash_doctor.xml";
var testProject233 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\f14a_e_lock_box.xml";
var testProject234 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\f14a_gotrla.xml";
var testProject235 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F14a_mobile_application_for_mobile_controlled_lighting.xml";
var testProject236 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F14a_REFERsy.xml";
var testProject237 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F14a_sharethetraining_com.xml";
var testProject238 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F14a_snapp_voice_communication_system.xml";
var testProject239 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F14a_soccer_data_web_crawler.xml";
var testProject240 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F14a_tipsure_com.xml";
var testProject241 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F14a_women_at_work_website_redesign.xml";
var testProject242 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F15a_combat_conflict.xml";
var testProject243 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F15a_construction_meeting_minutes_application.xml";
var testProject244 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F15a_linggo.xml";
var testProject245 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F15a_nice_ecommerse.xml";
var testProject246 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\F15a_tour_conductor.xml";
var testProject247 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\S15b_mission_science_irobots.xml";
var testProject248 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\s15b_snap_valet.xml";
var testProject249 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\S15b_we_are_trojans_network.xml";
var testProject250 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\s16b_combat_conflict.xml";
var testProject251 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\S16b_flower_seeker.xml";
var testProject252 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\s16b_Picshare_AA.xml";
var testProject253 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015\\xmls\\s16b_Picshare_RA.xml";

////2015 - 2016
var testProject41 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2015-2016\\XMIsV1.2\\f15a_CombatConflict.xml";
var testProject42 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2015-2016\\XMIsV1.2\\f15a_ConstructionMeeting_MinutesApp.xml";
var testProject43 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2015-2016\\XMIsV1.2\\f15a_Lingggo.xml";
var testProject44 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2015-2016\\XMIsV1.2\\f15a_NICE.xml";

////2016 - 2017
var testProject51 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2016-2017\\XMIsV1.0\\f16a_Fuppy.xml";
var testProject52 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2016-2017\\XMIsV1.0\\f16a_GoGrrrlsApp.xml";
var testProject53 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2016-2017\\XMIsV1.0\\f16a_Newlette_Coins.xml";
//var testProject54 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2016-2017\\XMIsV1.2\\f15a_NICE.xml";


//var config = require("../../config.js");

var reportDir2010_2011 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\test"

	var targetProjects2010_2011 = [
		testProject1,
		testProject2,
		testProject3,
		testProject4,
		testProject5 
		];

var reportDir2011_2012 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2011-2012"

var targetProjects2011_2012 = [
	testProject11,
	testProject12,
	testProject13, 
	testProject14, 
	testProject15, 
	testProject16, 
	testProject17, 
	testProject18, 
	];

var reportDir2012_2013 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2012-2013"

var targetProjects2012_2013 = [
	testProject21,
	testProject22,
	testProject23, 
	testProject24, 
	testProject25, 
	testProject26,
	];

var reportDir2013_2014 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2013-2014"

	var targetProjects2013_2014 = [
//		testProject131, //error
//		testProject132,//error with empty set of transactions
//		testProject133,
		testProject134,
//		testProject135,
//		testProject136,
//		testProject137,
//		testProject138,
//		testProject139,
//		testProject140,
//		testProject141,
//		testProject142,
//		testProject143,
//		testProject144,
//		testProject145,
//		testProject146,
//		testProject147,
//		testProject148,
//		testProject149 //error
		];

var reportDir2014_2015 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2014-2015"

	var targetProjects2014_2015 = [
//		testProject231,
//		testProject232,
//		testProject233,
//		testProject234,
//		testProject235,
//		testProject236,
//		testProject237,
//		testProject238,
//		testProject239,
//		testProject240,
//		testProject241,
//		testProject242,
		testProject243,
		testProject244,
		testProject245,
		testProject246,
		testProject247,
		testProject248,
		testProject249,
		testProject250,
		testProject251,
		testProject252,
		testProject253
		];

var reportDir2015_2016 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2015-2016"

var targetProjects2015_2016 = [
	testProject41,
	testProject42,
	testProject43, 
	testProject44,
	];

var reportDir2016_2017 = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects\\2016-2017"

var targetProjects2016_2017 = [
	testProject51,
//	testProject52,
//	testProject53,//error
	];

var fs = require('fs');
var exec = require('child_process').exec;
var EclipseUtil = require("../../utils/EclipseUtil.js");
var FileManagerUtil = require("../../utils/FileManagerUtil.js");
var RScriptExec = require('../../utils/RScriptUtil.js');

var UMLxAnalyticToolKit = require("../../utils/UMLxAnalyticToolKitCore.js");

function recoverKDMModel(repoListPath){
	
	var currentWorkSpace = "C:\\Users\\flyqk\\workspace\\.metadata"
	FileManagerUtil.deleteFolderRecursive(currentWorkSpace);

	  //use promise to construct the repo objects
    function recoverModel(projectPath, override){
        return new Promise((resolve, reject) => {
        		
        	var modelFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
        	
        	console.log(modelFile);
        	
        	fs.exists(modelFile, (exists) => {
        	if(exists && !override){
        		console.log(modelFile +" already exist.");
        		resolve();
        	}
        	else{
            //to recover kdm model
        		
        		EclipseUtil.generateKDMModel2(projectPath, function(filePath){
        			console.log("finished recovering kdm model");
        			console.log(filePath);
            		resolve();
        		});
        		
        	}
      	  });
        	
        });
    }
    
    return Promise.all(targetProjects.map(projectPath=>{
        return recoverModel(projectPath, false);
    })).then(
        function(){
            return new Promise((resolve, reject) => {
                setTimeout(function(){
                	console.log("recoverFinished");
                    resolve();

                }, 0);
            });
        }

    ).catch(function(err){
        console.log(err);
    });

}

function analyseXMIModel(projectXMIs){
	

	var reportPath = reportDir+"\\analysis-results-folders.txt";
//	FileManagerUtil.deleteFileSync(reportPath);
	
	  //use promise to construct the repo objects
    function analyseModel(projectXMI){
        return new Promise((resolve, reject) => {
//        	config.setDebugOutputDir(projectPath+"/debug");
        	var projectName = path.basename(projectXMI).replace(/\..+$/, '');
        	var outputDir = path.dirname(projectXMI)+"\\"+projectName;
        	global.debugOutputDir = outputDir + "/debug";
        	var inputFile = projectXMI;
        	
        	console.log(inputFile);
        	
        	mkdirp(outputDir, function(err) { 
        	fs.exists(inputFile, (exists) => {
        	if(!exists){
        		console.log(inputFile+" doesn't exist.");
        		resolve();
        	}
        	else{
            //to generate svg file.
        	UMLxAnalyticToolKit.analyseSrc(inputFile, outputDir, projectName, function(model){
        		if(!model){
        			console.log('analysis error!');
            		resolve();
            		return;
        		}
        		console.log("finished sr analysis");
        		FileManagerUtil.appendFile(reportPath, model.OutputDir+"\n", function(message){
            		console.log('analysis finished!');
            		console.log(message);
            		resolve();
        		})
        		  
        	});
        	
        	}
      	  });
        	});
        	
        });
    }
    
    return Promise.all(projectXMIs.map(projectXMI=>{
        return analyseModel(projectXMI);
    })).then(
        function(){
            return new Promise((resolve, reject) => {
                setTimeout(function(){
                	console.log("analysis finished");
                    resolve();

                }, 0);
            });
        }

    ).catch(function(err){
        console.log(err);
    });
	
}


function requestEffortData(targetProjects){
    
      //use promise to construct the repo objects
  function requestEffort(projectPath, override){
      return new Promise((resolve, reject) => {
            
//          var outputFolder = projectPath;
//          var inputFile = projectPath + "/eclipse_gen_umlx_kdm.xmi";
        var outputFilePath = projectPath + "/requested_effort.txt";
        
        fs.exists(outputFilePath, (exists) => {
        if(exists && !override){
            console.log(outputFilePathe+" doesn't exist.");
            resolve();
        }
        else{
 
            var gitUrlFile = projectPath + "/git-url.txt";
            
            fs.exists(gitUrlFile, (exists) => {
                if(!exists){
                    console.log(gitUrlFile+" doesn't exist.");
                    resolve();
                }
                else{
                fs.readFile(gitUrlFile, 'utf-8', (err, str) => {
                   if (err) throw err;
//                  console.log(data);
                   
            var gitUrl = str;
            var command = './data/TransactionWeighting/active_contributors_every_30.R "'+gitUrl+'" "'+outputFilePath+'" ';
            
          //to generate svg file.
            RScriptExec.runRScript(command,function(result){
                if (!result) {
//                  console.log('exec error: ' + error);
                    console.log("project effort estimation error");
                }
                console.log(gitUrl+": effort request finished.");
                resolve();
            });
 
            });
                }
          });
        }
      });
  });
  }
  
  return Promise.all(targetProjects.map(projectPath=>{
      return requestEffort(projectPath);
  })).then(
      function(){
          return new Promise((resolve, reject) => {
              setTimeout(function(){
                console.log("analysis finished");
                  resolve();
 
              }, 0);
          });
      }
 
  ).catch(function(err){
      console.log(err);
  });
    
}

function scanRepo(repoListPath, repoRecordPath){
      //to generate svg file.
	var classPath = '"C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
    var command = 'java -classpath '+classPath+' repo.AnalysisKit "scan-repo" "'+repoListPath+'" "'+repoRecordPath+'"';
  	console.log(command);
  	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
  		if (error !== null) {
  			console.log('exec error: ' + error);
  		}
  		console.log('The file was saved!');
  		  
  	});
  	
  	child.stdout.on('data', function(data) {
  	    console.log(data); 
  	});
  	
}

function selectFiles(repoRecordPath){
	 //to generate svg file.
	var classPath = '"C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
    var command = 'java -classpath '+classPath+' repo.AnalysisKit "select-files" "'+repoRecordPath+'"';
  	console.log(command);
  	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
  		if (error !== null) {
  			console.log('exec error: ' + error);
  		}
  		console.log('The file was saved!');
  		  
  	});
  	
  	child.stdout.on('data', function(data) {
  	    console.log(data); 
  	});
}

function analyseSloc(repoRecordPath){
	 //to generate svg file.
	var classPath = '"C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
   var command = 'java -classpath '+classPath+' repo.AnalysisKit "analyse-sloc" "'+repoRecordPath+'"';
 	console.log(command);
 	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
 		if (error !== null) {
 			console.log('exec error: ' + error);
 		}
 		console.log('The file was saved!');
 		  
 	});
 	
 	child.stdout.on('data', function(data) {
 	    console.log(data); 
 	});
}

function generateReport(repoRecordPath){
	 //to generate svg file.
	var classPath = '"C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\facility-tools\\Repo Analyser\\bin"';
  var command = 'java -classpath '+classPath+' repo.AnalysisKit "generate-report" "'+repoRecordPath+'"';
	console.log(command);
	var child = exec(command, {maxBuffer: 1024 * 1024*100, stdio: 'ignore' }, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		}
		console.log('The file was saved!');
		  
	});
	
	child.stdout.on('data', function(data) {
	    console.log(data); 
	});
}

var repoListPath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Repositories\\Open Source\\repositories.txt";
//var repoRecordPath = ".\\data\\RufusLabs\\sloc";
var repoRecordPath = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\OpenSource\\sloc";

var functionSelection = process.argv[2];

var reportDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects";

//1. create a list of projects:
 		
if(functionSelection === "--scan-repo"){
//2. scan the projects in repo
scanRepo(repoListPath, repoRecordPath);
}
else if(functionSelection === "--select-files"){
//3. open repo browser to select the files that should be include in the list
selectFiles(repoRecordPath);
}
else if(functionSelection === "--analyse-sloc"){
//4. calculate sloc for each repo
analyseSloc(repoRecordPath);
}
else if(functionSelection === "--generate-report"){
	//4. calculate sloc for each repo
generateReport(repoRecordPath);
}

else if(functionSelection === "--recover-kdm"){
	
recoverKDMModel(repoListPath)

}
else if(functionSelection === "--analyse-xmi-model"){
//	reportDir = reportDir2010_2011;
//	analyseXMIModel(targetProjects2010_2011);
//	reportDir = reportDir2011_2012;
//	analyseXMIModel(targetProjects2011_2012);
//	reportDir = reportDir2012_2013;
//	analyseXMIModel(targetProjects2012_2013);
	reportDir = reportDir2013_2014;
	analyseXMIModel(targetProjects2013_2014);
//	reportDir = reportDir2014_2015;
//	analyseXMIModel(targetProjects2014_2015);
//	reportDir = reportDir2015_2016;
//	analyseXMIModel(targetProjects2015_2016);
//	reportDir = reportDir2016_2017;
//	analyseXMIModel(targetProjects2016_2017);

}
else if(functionSelection === "--generate-model-analysis-report"){
//  reportDir = reportDir2010_2011;
//  reportDir = reportDir2011_2012;
//  reportDir = reportDir2012_2013;
reportDir = reportDir2013_2014;
//reportDir = reportDir2014_2015;
//  reportDir = reportDir2015_2016;
//  reportDir = reportDir2016_2017;
  
  var modelOutputDirs = FileManagerUtil.readFileSync(reportDir+"\\analysis-results-folders.txt").split(/\r?\n/g);
  var transactionFiles = [];
  var modelEvaluationFiles = [];
  for(var i in modelOutputDirs){
      //code here using lines[i] which will give you each line
  	var modelOutputDir = modelOutputDirs[i];

  	if(modelOutputDir === ""){
  		continue;
  	}
  	
  	transactionFiles.push(modelOutputDir+"\\"+"transactionEvaluation.csv");
  	modelEvaluationFiles.push(modelOutputDir+"\\"+"modelEvaluation.csv");
  }
  
  var modelEvaluationContents = FileManagerUtil.readFilesSync(modelEvaluationFiles);
  var modelEvaluationConsolidation = "";
  for(var i in modelEvaluationContents){
	  var modelEvaluationLines = modelEvaluationContents[i].split(/\r?\n/g);
	  if(i == 0){
		  modelEvaluationConsolidation += modelEvaluationLines[0]+","+"transaction_file";
	  }
	 
	  modelEvaluationConsolidation += "\n"+modelEvaluationLines[1]+","+transactionFiles[i];
  }
  
  FileManagerUtil.writeFileSync(reportDir+"\\modelEvaluations.csv", modelEvaluationConsolidation);
}
else if(functionSelection === "--request-effort-data"){
    
	requestEffortData(targetProjects);
	 
}
else if(functionSelection === "--generate-repo-analysis-report"){
	
var repoDir = "C:\\Users\\flyqk\\Documents\\Google Drive\\ResearchSpace\\Research Projects\\UMLx\\data\\577 Projects";
var repoModelEvaluationDirs = [
//		reportDir2010_2011+"\\modelEvaluations-8-14-1.csv",
		reportDir2011_2012+"\\modelEvaluations-8-14-1.csv",
		reportDir2012_2013+"\\modelEvaluations-8-14-1.csv",
		reportDir2013_2014+"\\modelEvaluations-8-14-1.csv",
		reportDir2014_2015+"\\modelEvaluations-8-14-1.csv",
		reportDir2015_2016+"\\modelEvaluations-8-14-1.csv",
		reportDir2016_2017+"\\modelEvaluations-8-14-1.csv",
]

var modelEvaluationContents = FileManagerUtil.readFilesSync(repoModelEvaluationDirs);
var modelEvaluationConsolidation = "";
var transactionFilePaths = [];
for(var i in modelEvaluationContents){
	 var modelEvaluationLines = modelEvaluationContents[i].split(/\r?\n/g);
	  if(i == 0){
		  modelEvaluationConsolidation += modelEvaluationLines[0]
	  }
	  
		  for(var j = 1; j < modelEvaluationLines.length; j++){
		  if(modelEvaluationLines[j] === ""){
			  continue;
		  }
		  modelEvaluationConsolidation += "\n"+modelEvaluationLines[j].replace("transactionEvaluation", "filteredTransactionEvaluation");
		  var fields = modelEvaluationLines[j].split(/,/g);
		  transactionFilePaths.push(fields[fields.length - 1]);
		  }
}
	  
FileManagerUtil.writeFileSync(repoDir+"\\modelEvaluations-8-16.csv", modelEvaluationConsolidation);

var transactionEvaluationContents = FileManagerUtil.readFilesSync(transactionFilePaths);
var transactionEvaluationConsolidation = "";

function filter(transaction){
	var invalidTerms = ["message", "Message", "undefined", "error", "information", "Information"]
	for(var i in invalidTerms){
		if(transaction.indexOf(invalidTerms[i])>-1 && transaction.split("->").length < 3){
			return true;
		}
	}
	
	return false;
}

for(var i in transactionEvaluationContents){
	var identifiedTransactions = {};
	//remove duplicate transactions and write back.
	 var transactionEvaluationLines = transactionEvaluationContents[i].split(/\r?\n/g);
	 var filteredTransactionEvaluationStr = transactionEvaluationLines[0];
	  if(i == 0){
		  transactionEvaluationConsolidation += transactionEvaluationLines[0];
	  }
		  for(var j = 1; j < transactionEvaluationLines.length; j++){
		 var transactionEvaluationFields = transactionEvaluationLines[j].split(/,/g);
		  if(transactionEvaluationLines[j] === "" || filter(transactionEvaluationFields[1]) || identifiedTransactions[transactionEvaluationFields[1].replace(/\s/g, "").toLowerCase()]){
			  	  console.log("duplicates");
			  	  console.log(transactionEvaluationFields[1]);
				  continue;
		  }
		  identifiedTransactions[transactionEvaluationFields[1].replace(/\s+/g, "").toLowerCase()] = 1;
		  filteredTransactionEvaluationStr += "\n"+transactionEvaluationLines[j];
		  transactionEvaluationConsolidation += "\n"+transactionEvaluationLines[j]+","+i;
		  
		  }
	  
	  var transactionFilePath = transactionFilePaths[i];
	  FileManagerUtil.writeFileSync(path.dirname(transactionFilePath)+"\\filteredTransactionEvaluation.csv",  filteredTransactionEvaluationStr);
}

FileManagerUtil.writeFileSync(repoDir+"\\transactionEvaluations-8-16.csv", transactionEvaluationConsolidation);

}

