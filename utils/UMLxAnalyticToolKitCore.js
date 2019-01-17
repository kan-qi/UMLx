(function() {

    var fs = require("fs");
    var csv = require('csv-parser')
    var mkdirp = require("mkdirp");
    var rimraf = require('rimraf');
    var fs_extra = require('fs-extra');

    var jp = require('jsonpath');
    var xml2js = require('xml2js');
    
	var uuidV1 = require('uuid/v1');
    
    var UMLEvaluator = require('../UMLEvaluator.js');
    var UMLModelExtractor = require("../UMLModelExtractor.js");
    var EffortPredictor = require("../UMLxEffortPredictor.js");
    
	var path = require('path');

	// var isForPackage = false;

    function analyseUML(inputFilePath, outputDir, projectName, callbackfunc) {

//        let date = new Date();
//        let analysisDate = date.getFullYear() + "-" + date.getMonth()+ "-" + date.getDate();

//        outputDir = outputDir+"/"+analysisDate+"@"+Date.now();

    	var xmiModel = {
    		Name: projectName,
    		umlFilePath: inputFilePath,
    		OutputDir: outputDir,
    		AccessDir: outputDir,
    		_id: uuidV1()
    	}
    	
    	UMLModelExtractor.extractModelInfo(xmiModel, function(modelInfo){
    		console.log("model is extracted");
			if(!modelInfo){
				if(callbackfunc){
					callbackfunc(xmiModel);
				}
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
						callbackfunc(modelInfo);
					}
					return;
				}
				
				EffortPredictor.predictEffort(modelInfo2, function(modelInfo3){
					if(!modelInfo3){
						console.log("effort prediction failed");
						if(callbackfunc){
							callbackfunc(modelInfo2);
						}
						return;
					}
				
				
				var debug = require("../utils/DebuggerOutput.js");
				debug.writeJson("evaluated_model_example_"+modelInfo3.Name, modelInfo3);
				
//				console.log(modelInfo3);
				if(callbackfunc){
					callbackfunc(modelInfo3);
					console.log("updated analysis 8-12")
				}
				});
			});
    	});

       
    }

    function readUsecaseJson(model, callback) {
      //   let html_table = `<div style='height:6%'>&nbsp;</div>
						// <table class='table table-hover table-bordered'; id='usecase_table2'; style='width:100%'>
						// 	<tr>
						// 		<th>Usecase ID</th>
						// 		<th>Column Name</th>
						// 		<th>Mean</th>
						// 		<th>Variance</th>
						// 		<th>First Quartile</th>
						// 		<th>Median</th>
						// 		<th>Third Quartile</th>
						// 		<th>Kurtosis</th>
						// 	</tr>
						// `;
		let html_table = "";

        let count = 0;
        //error
        for(i in model.UseCases) {
        	var usecase = model.UseCases[i];
            let filePath = usecase.OutputDir + "/element_statistics.json";
            fs.exists(filePath, (exists) => {
                count ++;
                if (exists) {
                    count --;
                    fs.readFile(filePath, (err, data) => {
                        count ++;
                        if (err) throw err;
                        let obj = JSON.parse(data);
                        //console.log(obj);

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

                    });
                }
            });
        }

        html_table += `</table>`;
        if (callback) {
            callback(html_table);
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

		let usecase_list = '';
		let detail_list = '';

		if (model) {
			for (var key in model.UseCases) {
				usecase_list += 
				`
					<li>
						<a class="use-case-title" data-toggle="tab" href="#${model.UseCases[key]._id}">
							${model.UseCases[key].Name}
						</a>
					</li>
				`

				let model_elements_table_content = '';

				let model_elements_folder = '';
				// if (isForPackage) {
					// model_elements_folder = './public/output/repo' + model.repo_id + '/' + model.fileId + '/' + model.UseCases[key]._id;
				// } else {
					// model_elements_folder = './data/StandAloneToolKit/output/' + model.UseCases[key]._id;
				// }				

				model_elements_folder = model.OutputDir+"/"+ model.UseCases[key]._id;

				fs.readdirSync(model_elements_folder).forEach((file, index) => {
					let stats = fs.statSync(model_elements_folder + '/' + file);
					let fileSizeInBytes = stats["size"];
					let fileTime = stats["birthtime"].toISOString();
					fileTime = fileTime.slice(0, -5);
					fileTime = fileTime.replace('T', ' ');
				  	model_elements_table_content += 
				  		`
				  			<tr class="estimation-table">
				  				<td>
				  					${index + 1}
				  				</td>
					  			<td>
									<a href="./${model.UseCases[key]._id}/${file}" target="_blank">${file}</a>
								</td>
								<td>
									${fileSizeInBytes} B
								</td>
								<td>
									${fileTime}
								</td>								
							</tr>
				  		`
				})				

				detail_list +=
				`
					<div class="tab-pane fade" id="${model.UseCases[key]._id}">
						<ul class="nav nav-tabs">
							<li class="active">
								<a data-toggle='tab' href='#${model.UseCases[key]._id}_use-case-info-pane'>UseCase Info</a>
							</li>
							<li>
								<a data-toggle='tab' href='#${model.UseCases[key]._id}_use-case-analytics'>Analytics</a>
							</li>
						</ul>
						<div class="tab-content">
							<div class="tab-pane fade in active" id="${model.UseCases[key]._id}_use-case-info-pane">
								<a href="./${model.UseCases[key]._id}/robustness_diagram.svg" target="_blank">SVG Diagram</a>
							</div>
							<div class="tab-pane fade" id="${model.UseCases[key]._id}_use-case-analytics">
								<a href="./${model.UseCases[key]._id}/elementAnalytics.csv" target="_blank">Analytics CVS</a>
								<table class="table-bordered" style="margin: 10px auto">
									<tr class="estimation-table">
										<th>ID</th>
										<th>File Name</th>
										<th>Size</th>
										<th>Creation Time</th>
									</tr>
									${model_elements_table_content}
								</table>
							</div>
						</div>
					</div>
				`
			}			

		let EUCP_content = generateEstimationReshltPane(model.eucp_lm, model);
		let EXUCP_content = generateEstimationReshltPane(model.exucp_lm, model);
		let DUCP_content = generateEstimationReshltPane(model.ducp_lm, model);

		let model_analytics_table_content = '';

		let testFolder = '';
		// if (isForPackage) {
		// 	testFolder = './public/output/repo' + model.repo_id + '/' + model.fileId;
		// } else {
		// 	testFolder = './data/StandAloneToolKit/output';
		// }		

		testFolder = model.OutputDir;

		fs.readdirSync(testFolder).forEach((file, index) => {
			let stats = fs.statSync(testFolder + '/' + file);
			let fileSizeInBytes = stats["size"];
			let fileTime = stats["birthtime"].toISOString();
			fileTime = fileTime.slice(0, -5);
			fileTime = fileTime.replace('T', ' ');
		  	model_analytics_table_content += 
		  		`
		  			<tr class="estimation-table">
		  				<td>
		  					${index + 1}
		  				</td>
			  			<td>
							<a href="./${file}" target="_blank">${file}</a>
						</td>
						<td>
							${fileSizeInBytes} B
						</td>
						<td>
							${fileTime}
						</td>
					</tr>
		  		`
		});		

        let model_analysis_chart =
            `
		<div class="model-info-content">
			<ul class="nav nav-tabs">
				<li class="active">
					<a data-toggle="tab" href="#overview">Overview</a>
				</li>
				<li>
					<a data-toggle="tab" href="#usecase-analysis" onclick="">Model Elements</a>
				</li>
				<li>
					<a data-toggle="tab" href="#model-evaluation" id="model-evaluation-tab">Model Info</a>
				</li>
				<li>
					<a data-toggle="tab" href="#model-analytics">Model Analytics</a>
				</li>
			</ul>
			<div class="tab-content">
				<div id="overview" class="tab-pane fade in active">
					${cards_selection}
				</div>
				<div id="usecase-analysis" class="tab-pane fade">
					<div id="model-usecase-analysis">
						<div class="col-md-3 no-padding-margin">
							<div class="panel panel-default" id="model-use-cases-panel">
								<div class="block-title panel-heading ">
									<h3 class="panel-title analytics-title pull-left">
										Use Cases
									</h3>
								</div>
								<div class="panel-body">
									<ul class="nav">
										${usecase_list}
									</ul>
								</div>
							</div>
						</div>	
						<div class="col-md-9">
							<div class="panel panel-default">
								<div class="block-title panel-heading">
									Use Case Detail
								</div>
								<div class="panel-body" id="use-case-detail-panel">
									<div class="tab-content">
										${detail_list}
									</div>
								</div>
							</div>
						</div>			
					</div>
				</div>
				<div id="model-evaluation" class="tab-pane fade">
					<div class="model-evaluation">
						<ul class="nav nav-pills">
							<li class="nav-item active">
								<a class="nav-links" data-toggle="pill" href="#pills-EUCP">EUCP</a>
							</li>
							<li class="nav-item">
								<a class="nav-links" data-toggle="pill" href="#pills-EXUCP">EXUCP</a>
							</li>	
							<li class="nav-item">
								<a class="nav-links" data-toggle="pill" href="#pills-DUCP">DUCP</a>
							</li>													
						</ul>
					</div>
					<div class="tab-content">
						<div class="tab-pane fade in active" id="pills-EUCP">
							<div class="eucp-evaluation">
								<h4>EUCP</h4>
								${EUCP_content}
							</div>
						</div>
						<div class="tab-pane fade" id="pills-EXUCP">
							<div class="excup-evaluation">
								<h4>EXUCP</h4>
								${EXUCP_content}
							</div>
						</div>
						<div class="tab-pane fade" id="pills-DUCP">
							<div class="ducp-evaluation">
								<h4>DUCP</h4>
								${DUCP_content}
							</div>
						</div>												
					</div>
				</div> 
				<div id="model-analytics" class="tab-pane fade">
					<table class="table-bordered" style="margin: 10px auto">
						<tr class="estimation-table">
							<th>ID</th>
							<th>File Name</th>
							<th>Size</th>
							<th>Creation Time</th>
						</tr>
						${model_analytics_table_content}						
					</table>
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
				<style>
					table td {
						padding: 5px;
					}
				</style>
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
							<div id="model-stats-chart" class="panel-body" style="min-height: 90vh">
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
		else{
			if(callback){
				callback(false);
			}
		}
    }

    function generateEstimationReshltPane(estimationResults, modelInfo) {
    	if (estimationResults) {
    		let estimationResults_table = "";
	        for (var i = 0; i < estimationResults.UseCases.length; i++) {
	        	estimationResults_table += `
	        	<tr class="estimation-table">
					<td>${i}</td>
					<td>${estimationResults.UseCases[i].Name}</td>
					<td>${estimationResults.UseCases[i].Effort}</td>
					<td>${estimationResults.UseCases[i].useCasePMEffort}</td>
					<td>${estimationResults.UseCases[i].useCaseDEVEffort}</td>
					<td>${estimationResults.UseCases[i].synthesizedEffort}</td>
					<td>${estimationResults.UseCases[i].BusinessValue}</td>
					<td>${estimationResults.UseCases[i].EffortBVRatio}</td>
					<td>${estimationResults.UseCases[i].SizeMeasurement}</td>
					<td>${estimationResults.UseCases[i].Duration}</td>
					<td>${estimationResults.UseCases[i].Personnel}</td>
					<td>${estimationResults.UseCases[i].Personnel_UI}</td>
					<td>${estimationResults.UseCases[i].Personnel_FS}</td>
					<td>${estimationResults.UseCases[i].Personnel_DB}</td>
	        	</tr>
	        	`;
	        }
    		let content = `
    			<div id="estimation-results-tables" data-estimation-model="${estimationResults.EstimationModel}">
    				<div class="model-predictions">
    					<table class="class table-bordered">
    						<thead>
    							<tr>
    								<th>Model</th>
						            <th>Effort (PH)</th>
						            <th>Schedule (Months)</th>
						            <th>${estimationResults.SizeMetric}</th>
						            <th>Personnel (FT Developers)</th>
						            <th>UI Developer</th>
						            <th>Full Stack</th>
						            <th>Database Developer</th>
						            <th>Model</th>
						            <th>View</th>
						            <th>Control</th>
    							</tr>
    						</thead>
    						<tbody>
    							<tr class="estimation-table">
    								<td>${estimationResults.EstimationModel}</td>
						            <td>${estimationResults.Effort}</td>
						            <td>${estimationResults.Duration}</td>
						            <td>${estimationResults.SizeMeasurement}</td>
						            <td>${estimationResults.Personnel}</td>
						            <td>${estimationResults.Personnel_UI}</td>
						            <td>${estimationResults.Personnel_FS}</td>
						            <td>${estimationResults.Personnel_DB}</td>
						            <td>${estimationResults.DomainModel.MVCEstimates.ModelEffort}</td>
						            <td>${estimationResults.DomainModel.MVCEstimates.ViewEffort}</td>
						            <td>${estimationResults.DomainModel.MVCEstimates.ControlEffort}</td>						            
    							</tr>
    						</tbody>
    					</table>
    				</div>
    			</div>
    			<div>
    				<a href="./${estimationResults.EstimationResultsFile}" target="_blank"> Diagram Json</a>
    			</div>
    			<div class="use-case-predictions table-responsive">
    				<table class="table table-bordered">
    					<thead>
    						<tr>
    							<th id="number_column">Number</th>
								<th id="Use_Case">Use Case</th>
								<th id="EffortPH">Effort (PH)</th>
								<th id="EffortPM">Effort PM</th>
								<th id="EffortDev">Effort Dev</th>
								<th id="EffortSyn">Effort Syn</th>
								<th id="Business">Business Value</th>
								<th id="EffortBV">Effort/BV</th>
								<th id="SizeMeasurement">${estimationResults.SizeMetric}</th>
								<th id="Duration">Schedule (Months)</th>
								<th id="Personnel">Personnel (FT Developers)</th>
								<th id="Personnel_UI">UI Developer</th>
								<th id="Personnel_FS">Full Stack</th>
								<th id="Personnel_DB">Database Developer</th>
    						</tr>
    					</thead>
    					<tbody>
    						${estimationResults_table}
    					<tbody>
    				</table>
    			</div>
    		`;
    		return content;
    	} else {
    		return "";
    	}
    }

    function writeHTML(model, htmlBody){
        fs.writeFile(model.OutputDir + "/analysis_report.html", htmlBody, (err) => {
            if(err) throw err;
            console.log("Result HTML Page has been successfully created!");
        });
    }

	function generateReport(model, callbackfunc) {
		// isForPackage = true;
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
	                        callbackfunc(model);
	                    }
	                });
	            });
	        });
	    });    	
	}    

    module.exports = {
    	generateReport: generateReport,
        analyseSrc: function(inputFilePath, outputDir, projectName, callbackfunc){
            console.log("analysi src");
            analyseUML(inputFilePath, outputDir, projectName, function (model) {
                console.log("analyse UML finishes");
                if(!model){
                	if(callbackfunc){
                        callbackfunc(false);
                    }
                	return;
                }
                readUsecaseJson(model, function (html_table) {
                    console.log("generate use cases");
                    createStream(model, function (rt_object) {
                        const yswi = rt_object.swtI;
                        const yswtii = rt_object.swtII;
                        const yswtiii = rt_object.swtIII;
                        const xcategories = rt_object.category;

                        // console.log("xcategories"+xcategories);
                        // console.log("yswi"+yswi);
                        // console.log("yswii"+yswtii);
                        // console.log("yswiii"+yswtiii);

                        getHTML(xcategories,yswi,yswtii,yswtiii,html_table, model, function (data) {
                            writeHTML(model, data);
                            //console.log(`result : [${xcategories}]`);
                            copyAuxiliaryFiles(model, function(message){
                                //console.log(message);
                                if(callbackfunc){
                                    callbackfunc(model);
                                }
                            });
                        });
                    });
                });

            });
        }
    }
}())