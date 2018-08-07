(function() {

    var fs = require("fs");
    var csv = require('csv-parser')
    var mkdirp = require("mkdirp");
    var rimraf = require('rimraf');
    var fs_extra = require('fs-extra');

    var jp = require('jsonpath');
    var xml2js = require('xml2js');

//    var parser = new xml2js.Parser();
//    var eaParser = require('../model_platforms/ea/XMI2.1Parser.js');
//    var srcParser = require('../model_platforms/src/SrcParser.js');

//    var pathsDrawer = require("../model_drawers/TransactionsDrawer.js");
//    var vpParser = require('../model_platforms/visual_paradigm/XML2.1Parser.js');
//    var modelDrawer = require("../model_drawers/UserSystemInteractionModelDrawer.js");
//    var domainModelDrawer = require("../model_drawers/DomainModelDrawer.js");

//    var umlEvaluator = require("../UMLEvaluator.js");
//    var umlFileManager = require("../UMLFileManager.js");
//    var RScriptExec = require('../utils/RScriptUtil.js');

// current available evaluators
//    var useCaseComponentsEvaluator = require('../evaluators/UseCaseComponentsEvaluator/UseCaseComponentsEvaluator.js');
//    var transactionEvaluator = require('../evaluators/TransactionEvaluator/TransactionEvaluator.js');
//    var modelVersionEvaluator = require('../evaluators/ModelVersionEvaluator/UMLModelVersionEvaluator.js');
//    var cocomoCalculator = require('../evaluators/COCOMOEvaluator/COCOMOCalculator.js');
//    var useCasePointEvaluator = require('../evaluators/UseCasePointEvaluator/UseCasePointEvaluator.js');
//    var extendedUseCasePointEvaluator = require('../evaluators/UseCasePointEvaluator/ExtendedUseCasePointEvaluator.js');
//    var projectTypeEvaluator = require('../evaluators/ProjectTypeEvaluator.js');
//    var UMLSizeMetricEvaluator = require('../evaluators/UMLModelSizeMetricEvaluator/UMLModelSizeMetricEvaluator.js');
//    var userStoryEvaluator = require('../evaluators/UserStoryEvaluator/UserStoryEvaluator.js');
    
    var UMLEvaluator = require('../UMLEvaluator.js');
    var UMLModelExtractor = require("../UMLModelExtractor.js");
    var EffortPredictor = require("../EffortPredictor.js");
    
	var path = require('path');

//    var evaluators = [
//        useCaseComponentsEvaluator,
//        transactionEvaluator,
//        modelVersionEvaluator,
//        projectTypeEvaluator,
//        cocomoCalculator,
//        useCasePointEvaluator,
//        extendedUseCasePointEvaluator,
//        UMLSizeMetricEvaluator,
//        userStoryEvaluator
//    ];


//    var useCaseEvaluationStr = "";
//    var domainModelEvaluationStr = "";
//    var modelEvaluationStr = "";
//
//    var useCaseNum = 1;

    function analyseUML(inputFilePath, outputDir, callbackfunc) {

        let date = new Date();
        let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();

        outputDir = outputDir+"/"+analysisDate+"@"+Date.now();

    	var xmiModel = {
    		Name: "src-model-"+analysisDate,
    		umlFilePath: inputFilePath,
    		OutputDir: outputDir,
    		AccessDir: outputDir
    	}
    	
    	UMLModelExtractor.extractModelInfo(xmiModel, function(modelInfo){
    		console.log("model is extracted");
			if(!modelInfo){
				res.end("error");
				return;
			}
			UMLEvaluator.evaluateModel(modelInfo, function(modelInfo2){
				console.log("model analysis complete");
				
//				console.log(modelInfo2);
				
				if(!modelInfo2){
//					 res.redirect('/');
//					 return;
					console.log("error in model evaluation");
					if(callbackfunc){
						callbackfunc(modelInfo2);
					}
				}
				
				EffortPredictor.predictEffort(modelInfo2, function(modelInfo3){
					if(!modelInfo3){
						console.log("effort prediction failed");
					}
				
				
				var debug = require("../utils/DebuggerOutput.js");
				debug.writeJson("evaluated_model_example"+modelInfo3._id, modelInfo3);
				
				console.log(modelInfo3);
				if(callbackfunc){
					callbackfunc(modelInfo3);
					console.log("updated analysis 8-6")
				}
				});
			});
    	});

       
    }

    function readUsecaseJson(model, callback) {
        let html_table = `<div style='height:6%'>&nbsp;</div>
						<table class='table table-hover table-bordered'; id='usecase_table2'; style='width:100%'>
							<tr>
								<th>Usecase ID</th>
								<th>Column Name</th>
								<th>Mean</th>
								<th>Variance</th>
								<th>First Quartile</th>
								<th>Median</th>
								<th>Third Quartile</th>
								<th>Kurtosis</th>
							</tr>
						`;

        let count = 0;

        for(usecase of model.UseCases) {
            let filePath = usecase.OutputDir + "/element_statistics.json";
            fs.exists(filePath, (exists) => {
                count ++;
                if (exists) {
                    count --;
                    fs.readFile(filePath, (err, data) => {
                        count ++;
                        if (err) throw err;
                        let obj = JSON.parse(data);
                        console.log(obj);

                        for(let i = 0;i < obj.length;i++){
                            let element = obj[i];
                            if(i === 0) {
                                html_table += `<tr class="estimation-table">
									<td rowspan="${obj.length}"> ID </td>
									<td> ${element['column name']} </td>
									<td> ${element.statistics['mean']} </td>
									<td> ${element.statistics.variance} </td>
									<td> ${element.statistics.first_quartile} </td>
									<td> ${element.statistics.median} </td>
									<td> ${element.statistics.third_quartile} </td>
									<td> ${element.statistics.kurtosis} </td>
									</tr>
                    			`;
                            }
                            else {
                                html_table += `<tr class="estimation-table">
									<td> ${element['column name']} </td>
									<td> ${element.statistics['mean']} </td>
									<td> ${element.statistics.variance} </td>
									<td> ${element.statistics.first_quartile} </td>
									<td> ${element.statistics.median} </td>
									<td> ${element.statistics.third_quartile} </td>
									<td> ${element.statistics.kurtosis} </td>
									</tr>
								`;
                            }
                        }

                        if (count === model.UseCases.length && callback) {
                            html_table += `</table>`;
                            callback(html_table);
                        }

                    });
                }
            });
        }
    }


    function createStream(model, callback) {
  	
      var swti = [];
      var swtii = [];
      var swtiii = [];
      var categories=[];
      var rt_object = {swtI:[],swtII:[],swtIII:[],category:[]};

        let chart_url = model.OutputDir + "/useCaseEvaluation.csv";
        fs.createReadStream(chart_url)
            .pipe(csv())
            .on('data', function (data) {
                swti.push(parseInt(data.SWTI));
                swtii.push([parseInt(data.SWTII)]);
                swtiii.push([parseInt(data.SWTIII)]);
                categories.push("'"+("UC"+data.NUM)+"'");
            })
            .on('end', function(data) {
                // console.log("hello" + swti);
                // console.log("hello" + swtii);
                // console.log("hello" + swtiii);
                // console.log("hello" + categories);
                rt_object.swtI = swti;
                rt_object.swtII = swtii;
                rt_object.swtIII = swtiii;
                rt_object.category = categories;
                if (callback) {
                    callback(rt_object);
                }
            });
        
    }

    function copyAuxiliaryFiles(model, callbackfunc){
        var folderList = [
            "public/css/",
            'public/js/',
            "public/fonts/",
            "public/img/"
        ];



        //use promise to construct the repo objects
        function copyFolder(source, destination){
            return new Promise((resolve, reject) => {

                // copy source folder to destination
                fs_extra.copy(source, destination, function (err) {
                    if (err){
                        console.log('An error occured while copying the folder.');

                    }
                    console.log('Copy completed!');
                    resolve();
                });

            });
        }

        return Promise.all(folderList.map(source=>{
            return copyFolder(source, model.OutputDir+"/"+source);
        })).then(
            function(){
                return new Promise((resolve, reject) => {
                    setTimeout(function(){
                        console.log("copying finished");
                        if(callbackfunc){
                            callbackfunc("copy finished");
                        }
                        resolve();

                    }, 0);
                });
            }

        ).catch(function(err){
            console.log(err);
        });
    }

    function getHTML(xcategories,yswti,yswtii,yswtiii,html_table, model, callback) {
      var useCasesSum = 0;
      var transactionsSum = 0;
      var classesSum = 0;
      var actorsSum = 0;
    	
        var location_transfer = "public/";
        //var test_loca = "./abc/analysisresults";

//	if (outputDir1) {//
//	    outputDir = outputDir1+"/"+analysisDate+"@"+Date.now();
//	var times = 1;
//	var outputDir = model.OutputDir;
//
//	    for (let j of outputDir) {
//	        if (j === '/') times ++;
//	    }
//
//	    for (let i = 0; i < times; i ++) {
//	        location_transfer += "../"
//	    }
//	    location_transfer += 'public/'
//	}
//	else {
//	    outputDir = "public/analysisResult/"+analysisDate+"@"+Date.now();
//	    location_transfer = '../../'
//	}

        let model_analysis_button =
            `
		<div class='model-analytics-ops pull-right'>
			<div class="dropdown">
				<button data-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false" class="btn btn-secondary dropdown-toggle btn-default">Dump Repo<span class="caret"></span></button>
				<ul class="dropdown-menu">
					<li><a href="./modelEvaluation.csv" class="dumpEvaluationData dropdown-item">Evaluation For Models</a></li>
					<li><a href="./modelEvaluation.csv" class="dumpEvaluationData dropdown-item">Evaluation For Models (simulation)</a></li>
					<li><a href="./useCaseEvaluation.csv" class="dumpEvaluationData dropdown-item">Evaluation For Use Cases</a></li>
					<li><a href="./domainModelEvaluation.csv" class="dumpEvaluationData dropdown-item">Evaluation For Domain Models</a></li>
					<li><a href="./transactionAnalytics.csv" class="dumpEvaluationData dropdown-item">Evaluation For Transactions</a></li>
					<li><a href="./entityAnalytics.csv.csv" class="dumpEvaluationData dropdown-item">Evaluation For Classes</a></li>
					<li><a href="./elementAnalytics.csv" class="dumpEvaluationData dropdown-item">Evaluation For Elements</a></li>
				</ul>
			</div>
			
			<div class='dropdown'>
				<button data-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false" class="btn btn-secondary dropdown-toggle btn-default">Load<span class="caret"></span></button>
				<ul class="dropdown-menu">
					<li><a id="update-model" onclick="" href="javaScript:void(0);" class="dropdown-item">Model Version</a></li>
				</ul>
			</div>
		</div>
		`;

        let cards_selection =
            `
		<div class="col-sm-12 status-row">
			<div class="col-sm-3">
				<div class="blue-card analytics-card">
					<div class="col-sm-4 image-box">
						<img src="${location_transfer}img/project.png" alt="">
					</div>
					<div class="col-sm-8 text-box">
						<h2>${useCasesSum}</h2>
						<span>Use Cases</span>
					</div>
				</div>
			</div>
			<div class="col-sm-3">
				<div class="red-card analytics-card">
					<div class="col-sm-4 image-box">
						<img src="${location_transfer}img/project.png" alt="">
					</div>
					<div class="col-sm-8 text-box">
						<h2>${transactionsSum}</h2>
						<span>Transactions</span>
					</div>
				</div>
			</div>
			<div class="col-sm-3">
				<div class="green-card analytics-card">
					<div class="col-sm-4 image-box">
						<img src="${location_transfer}img/project.png" alt="">
					</div>
					<div class="col-sm-8 text-box">
						<h2>${classesSum}</h2>
						<span>Classes</span>
					</div>
				</div>
			</div>
			<div class="col-sm-3">
				<div class="purple-card analytics-card">
					<div class="col-sm-4 image-box">
						<img src="${location_transfer}img/project.png" alt="">
					</div>
					<div class="col-sm-8 text-box">
						<h2>${actorsSum}</h2>
						<span>Actors</span>
					</div>
				</div>
			</div>
		</div>
	
		<div id="result_chart">here should be distributions</div>
		`;

        let model_analysis_chart =
            `
		<div class="model-info-content">
			<ul class="nav nav-tabs">
				<li class="active">
					<a data-toggle="tab" href="#model-analytics">Overview</a>
				</li>
				<li>
					<a data-toggle="tab" href="#usecase-analysis" onclick="">Model Elements</a>
				</li>
			</ul>
			<div class="tab-content">
				<div id="model-analytics" class="tab-pane fade in active">
					${cards_selection}
				</div>
				<div id="usecase-analysis" class="tab-pane fade">
					<div id="model-usecase-analysis">
						<h3>loading...</h3>
					</div>
				</div>
				<div id="repo-analysis-detail" class="panel-body">
					<div class="repo-metrics table-responsive">
						${html_table}
					</div>
				</div> 
			</div>
		</div>	  
		`
        ;

        let htmlBody =
            `
		<!DOCTYPE html>
		<html>
			<head>
				<title>UMLx</title>
				<link href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css', rel='stylesheet'>
				<link href='${location_transfer}css/style.css', rel='stylesheet'>
				<link href="${location_transfer}css/lightgallery.css" rel="stylesheet">
			</head>
			
			<body>
				<div class="banner">
					<div class="content-flex">
						<div class="col-md-10 banner-title">
							<h2>UMLx</h2>
						</div>
					</div>
				</div>
	
				<div id='main-panel'>
					<div id='display-panel'>
						<div class='block panel panel-default'>
							<div id='panel-heading'>
								${model_analysis_button}
							</div>
	
							<div id="model-stats-chart" class="panel-body">
								${model_analysis_chart}
							</div>
						</div>
					</div>
				</div>
				
	
				<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
				<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
				<script type="text/javascript" src="https://code.highcharts.com/highcharts.src.js"></script>
				<script type="text/javascript" src="https://code.highcharts.com/modules/histogram-bellcurve.js"></script>
				<script type="text/javascript" src="http://ariutta.github.io/svg-pan-zoom/dist/svg-pan-zoom.min.js"></script>
				<script type="text/javascript" src="http://d3js.org/d3.v4.min.js"></script>
				<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
				<script type="text/javascript" src="${location_transfer}/js/scripts.js"></script>
				<script type="text/javascript" src="http://requirejs.org/docs/release/2.2.0/minified/require.js"></script>
				<script> 
					function display(){
						$('#result_chart').highcharts({
							chart: {
								type: 'column',
								spacingLeft: 0
							},
	
							title: {
								text: 'Evaluation of Use Case Complexity'
							},
			
							xAxis: {
								categories: [${xcategories}],
								crosshair: true
							},
							yAxis: {
								min: 0,
								title: {
									text: 'Frequency'
								}
							},
							tooltip: {
								headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
								pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
									'<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
								footerFormat: '</table>',
								shared: true,
								useHTML: true
							},
							plotOptions: {
								column: {
									pointPadding: 0.2,
									borderWidth: 0
								}
							},
							series: [ 
								{
									name: 'SWTI',
									data: [${yswti}]
								}, 
								{
									name: 'SWTII',
									data: [${yswtii}]
								}, 
								{
									name: 'SWTIII',
									data: [${yswtiii}]
								}
							]
						});
					}
	
					window.onload = display;
				</script>
			</body>
		</html>
		`;
        if (callback) {
            callback(htmlBody);
        }
    }

    function writeHTML(model, htmlBody){
        fs.writeFile(model.OutputDir + "/analysis_report.html", htmlBody, (err) => {
            if(err) throw err;
            console.log("Result HTML Page has been successfully created!");
        });
    }

    module.exports = {
        analyseSrc: function(inputFilePath, outputDir, callbackfunc){
            console.log("analysi src");
            analyseUML(inputFilePath, outputDir, function (model) {
                console.log("analyse UML finishes");
                readUsecaseJson(model, function (html_table) {
                    console.log("generate use cases");
                    createStream(model, function (rt_object) {
                        const yswi = rt_object.swtI;
                        const yswtii = rt_object.swtII;
                        const yswtiii = rt_object.swtIII;
                        const xcategories = rt_object.category;
                        console.log("xcategories"+xcategories);
                        console.log("yswi"+yswi);
                        console.log("yswii"+yswtii);
                        console.log("yswiii"+yswtiii);
                        getHTML(xcategories,yswi,yswtii,yswtiii,html_table, model, function (data) {
                            writeHTML(model, data);
                            console.log(`result : [${xcategories}]`);
                            copyAuxiliaryFiles(model, function(message){
                                console.log(message);
                                if(callbackfunc){
                                    callbackfunc();
                                }
                            });
                        });
                    });
                });

            });
        }
    }


}())