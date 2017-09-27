function model_file_upload_fnc() {
	var formData = new FormData($('#model-file-submit-form')[0]);
//	formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
	$.ajax({
		type : 'POST',
		url : "uploadUMLFile",
		cache : false,
		processData : false, // Don't process the files
		contentType : false, // Set content type to false as jQuery will tell the server its a query string request
		data : formData,
		enctype : 'multipart/form-data',
		success : function(response) {
			console.log(response);
			$("#main-panel").html("");
			$("#main-panel").append(response);
		},
		error : function() {
			// $("#commentList").append($("#name").val() + "<br/>" +
			// $("#body").val());
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function query_exist_models_fnc(projectId) {
	$.ajax({
		type : 'GET',
		url : "queryExistingModels?project_id="+projectId,
		success : function(response) {
			console.log(response);
			$("#use-cases-block").append(response);
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function query_model_detail_func(){
	var url = $(this).attr("href");
	console.log(url);
	$.ajax({
		type : 'GET',
		url : url,
		success : function(response) {
			console.log(response);
			$("#display-panel").html("");
			$("#display-panel").append(response);
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function delete_use_case_func(){
//	alert('delete use case func');
	var url = $(this).attr("href");
	console.log(url);
	$.ajax({
		type : 'GET',
		url : url,
		success : function(response) {
			console.log(response);
			$("#display-panel").html("");
			$("#display-panel").append(response);
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function query_model_analytics_func(){
	var modelId = $(this).closest('.list-item').data('model-id');
//	console.log(modelId);
//	var url = $(this).attr("href");
//	console.log(url);
	console.log('query_model_analytics_func');
	$.ajax({
		type : 'GET',
		url : 'queryModelAnalytics?model_id='+modelId,
		success : function(response) {
//			console.log(response);
			$("#display-panel").html("");
			$("#display-panel").append(response);
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function reanalyse_model_func(){
	var url = $(this).attr("href");
	console.log(url);
//	console.log(modelId);
//	var url = $(this).attr("href");
//	console.log(url);
	console.log('reanalyse_model_func');
	$.ajax({
		type : 'GET',
		url : url,
		success : function(response) {
//			console.log(response);
			$("#display-panel").html("");
			$("#display-panel").append(response);
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function use_case_evaluation_upload_fnc(){
//	alert('use_case_evaluation_upload_fnc');
	var formData = new FormData($('#use-case-evaluation-form')[0]);
	$.ajax({
		type : 'POST',
		url : 'uploadUseCaseEvaluation',
		cache : false,
		processData : false, // Don't process the files
		contentType : false, // Set content type to false as jQuery will tell the server its a query string request
		data: formData,
		enctype : 'multipart/form-data',
		success : function(response) {
			console.log(response);
			$("#use-case-detail-panel").html("");
			$("#use-case-detail-panel").append(response);
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function model_evaluation_upload_fnc(){
//	alert('model_evaluation_upload_fnc');
	var formData = new FormData($('#model-evaluation-form')[0]);
	$.ajax({
		type : 'POST',
		url : 'uploadModelEvaluation',
		cache : false,
		processData : false, // Don't process the files
		contentType : false, // Set content type to false as jQuery will tell the server its a query string request
		data: formData,
		enctype : 'multipart/form-data',
		success : function(response) {
			console.log(response);
			$("#display-panel").html("");
			$("#display-panel").append(response);
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function query_sub_model_detail_func(){
	var url = $(this).attr("href");
	console.log(url);
	$.ajax({
		type : 'GET',
		url : url,
		success : function(response) {
//			console.log(response);
			$("#use-case-detail-panel").html("");
			$("#use-case-detail-panel").append(response);
			$('#use-case-title').html('-'+$(response).data('use-case-title'));
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}


function query_repo_analytics_func(){
	var url = $(this).attr("href");
	$.ajax({
		type : 'GET',
		url : url,
		success : function(response) {
//			console.log(response);
			$("#display-panel").html("");
			$("#display-panel").append(response);
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function dump_model_evaluation_for_use_cases_func(){
	var url = $(this).attr("href");
	console.log(url);
	$.ajax({
		type : 'GET',
		url : url,
		success : function(response) {
//			console.log(response);
	                var parsedCSV = d3.csvParseRows(response);
	                
	                $("#model-evaluation-dump-display").html("");
	                var container = d3.select("#model-evaluation-dump-display")
	                    .append("table")

	                    .selectAll("tr")
	                        .data(parsedCSV).enter()
	                        .append("tr")

	                    .selectAll("td")
	                        .data(function(d) { return d; }).enter()
	                        .append("td")
	                        .text(function(d) { return d; });
			
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function request_display_data(){
	var url = $(this).attr("href");
	$('#overlay-frame').modal();
	$("#overlay-frame .modal-body").html("");
	$("#overlay-frame .modal-body").html("<img class='progress-bar-icon' src='img/progress-bar.gif'\> Requesting data ...");  
	console.log(url);
	$.ajax({
		type : 'GET',
		url : url,
		success : function(response) {
//			console.log(response);
					
	                var parsedCSV = d3.csvParseRows(response);
	                $("#overlay-frame .modal-body").html("");
	                var container = d3.select("#overlay-frame .modal-body")
	                    .append("table")

	                    .selectAll("tr")
	                        .data(parsedCSV).enter()
	                        .append("tr")

	                    .selectAll("td")
	                        .data(function(d) { return d; }).enter()
	                        .append("td")
	                        .text(function(d) { return d; });
			
		},
		error : function() {
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});

	return false;
}

function query_estimation_models_func(){
//	alert($(this).closest('.dropdown').find('.dropdown-toggle').data('query-url'));
	var estimator = $('#estimator-selector-box').data('estimator');
	var model = $('#model-selector-box').data('model');
	var simulation = $('#model-query-box input[type="checkbox"]').is(":checked");
	var repoId = $(this).data('repo-id');
	$('#model-query-progressing').removeClass('hidden').addClass('shown');
	$.ajax({
		type : 'GET',
		url : "queryEstimationModel?estimator="+estimator+"&model="+model+"&repo_id="+repoId+"&simulation="+simulation,
//		url: $(this).closest('.dropdown').find('.dropdown-toggle').data('query-url'),
		success : function(response) {
			console.log(response);
			$("#estimation-model-detail").html("");
			$("#estimation-model-detail").append(response);
			$('#model-query-progressing').removeClass('shown').addClass('hidden');
		},
		error : function() {
			console.log("fail");
			$('#model-query-progressing').removeClass('shown').addClass('hidden');
			alert("There was an error");
		}
	});

	return false;
}



function drawChartBySVG(){
	// set the dimensions and margins of the use case
	var margin = {top: 20, right: 20, bottom: 50, left: 70},
	    width = 920 - margin.left - margin.right,
	    height = 400 - margin.top - margin.bottom;

	// parse the date / time
//	var parseTime = d3.timeParse("%d-%b-%y");

	// set the ranges
	var xValue = function(d) { return d.measurement;}; // data -> value
	var x = d3.scaleLinear().range([0, width]);
	var xMap = function(d) { return x(xValue(d));}; // data -> display
	var yValue = function(d) { return d.ph;}; // data -> value
	var y = d3.scaleLinear().range([height, 0]);
	var yMap = function(d) { return y(yValue(d));}; // data -> display
	
	var lineData = [],
	n = 100,
	a = 1,
	b = 2;
	
	for (var k = 0; k < 1000; k++) {
	lineData.push({x: k, y: a * k+300});
	}
	
	console.log(lineData);
	
	var line = d3.line()
	.x(function(d) { return x(d.x); })
	.y(function(d) { return y(d.y); });
	
	
	
////setup fill color
	var cValue = function(d) { return d.metric;},
	    color = d3.scaleOrdinal(d3.schemeCategory10);

	// define the line
	var valueline = d3.line()
	    .x(function(d) { return x(d.measurement); })
	    .y(function(d) { return y(d.ph); });

	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("#repo-stats-chart").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	          "translate(" + margin.left + "," + margin.top + ")");

	// Get the data
	d3.csv("output/model-analytics.csv", function(error, data) {
	  if (error) throw error;

	  // format the data
//	  data.forEach(function(d) {
//	      d.date = parseTime(d.date);
//	      d.close = +d.close;
//	  });

	  // Scale the range of the data
	  x.domain([0, d3.max(data, function(d) { return d.measurement; })]);
	  y.domain([0, d3.max(data, function(d) { return d.ph; })]);



	  // Add the x Axis
	  svg.append("g")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(x));

	  // text label for the x axis
	  svg.append("text")             
	      .attr("transform",
	            "translate(" + (width/2) + " ," + 
	                           (height + margin.top + 20) + ")")
	      .style("text-anchor", "middle")
	      .text("Measurement");

	  // Add the y Axis
	  svg.append("g")
	      .call(d3.axisLeft(y));

	  // text label for the y axis
	  svg.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 0 - margin.left)
	      .attr("x",0 - (height / 2))
	      .attr("dy", "1em")
	      .style("text-anchor", "middle")
	      .text("Effort");
	  
	//  // draw dots
	  svg.selectAll(".dot")
	      .data(data)
	    .enter().append("circle")
	      .attr("class", "dot")
	      .attr("r", 3.5)
	      .attr("cx", xMap)
	      .attr("cy", yMap)
	      .style("fill", function(d) { return color(cValue(d));}) 
	      .on("mouseover", function(d) {
	          tooltip.transition()
	               .duration(200)
	               .style("opacity", .9);
	          tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d) 
		        + ", " + yValue(d) + ")")
	               .style("left", (d3.event.pageX + 5) + "px")
	               .style("top", (d3.event.pageY - 28) + "px");
	      })
	      .on("mouseout", function(d) {
	          tooltip.transition()
	               .duration(500)
	               .style("opacity", 0);
	      });
	  

	  svg.append("path")
	      .datum(lineData)
	      .attr("fill", "none")
	      .attr("stroke", "steelblue")
	      .attr("stroke-linejoin", "round")
	      .attr("stroke-linecap", "round")
	      .attr("stroke-width", 1.5)
	      .attr("d", line);
	  
	});
	
	


$('#repo-stats-chart').append('<div id="model-selection-panel"> \
		 <div class="two-column"> \
		 <div class="dropdown"> \
	    Model:<button class="btn btn-default dropdown-toggle" type="button" id="menu1" data-toggle="dropdown">Select Model to Fit \
	    <span class="caret"></span></button> \
	    <ul class="dropdown-menu" role="menu" aria-labelledby="menu1"> \
	      <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Linear Regression</a></li> \
	      <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Linear Spline</a></li> \
	    </ul> \
	  </div> \
		</div> \
		<div class="two-column"> \
		<p>Calibration analytics:</p>\
		<div class="box"> \
		<p>b1:129.08</p> \
		<p>b0:2.31</p> \
		<p>R^2:0.98</p> \
		</div> \
		</div> \
		<div class="clear"></div> \
		</div>');
}

$(document).ready(function() {
	$(document).on('click','a.sub-model-title', query_sub_model_detail_func);
//	$(document).on('click','a.model-list-title.domain-model-title', query_domain_model_detail_func);
	$(document).on('click','a.model-title', query_model_detail_func);
	$(document).on('click','.request-repo-analytics', query_repo_analytics_func);
	$(document).on('click','.btn.model-analytics', query_model_analytics_func);
	$(document).on('click','#use-case-evaluation-form-submit-button', use_case_evaluation_upload_fnc);
	$(document).on('click','#model-evaluation-form-submit-button', model_evaluation_upload_fnc);
	$(document).on('click','#query-model-btn', query_estimation_models_func);
	$(document).on('click','#delete-use-case-btn', delete_use_case_func);
	$(document).on('click','#reanalyse-model', reanalyse_model_func);
	$(document).on('click','#dump-model-evaluation-for-use-cases-btn', dump_model_evaluation_for_use_cases_func);
	$(document).on('click','.dumpEvaluationData', request_display_data);
	$(document).on('click','.dumpAnalyticsData', request_display_data);
	
	 $(document).on('click', '#estimator-selector-box .dropdown-menu li a', function(){
//		 alert($(this).closest('.dropdown').find('.btn').text());
	      $(this).closest('.dropdown').find('.dropdown-toggle').html($(this).text()+'<span class="caret"></span>');
	      $('#estimator-selector-box').data('estimator', $(this).data('estimator'));
	   });
	 
	 $(document).on('click', '#model-selector-box .dropdown-menu li a', function(){
//		  alert($(this).closest('.dropdown').find('.btn').text());
		  $(this).closest('.dropdown').find('.dropdown-toggle').html($(this).text()+'<span class="caret"></span>');
		  $('#model-selector-box').data('model', $(this).data('model'));
	      
	   });
	
	 $('.nav.nav-tabs').tab();
//	drawChartBySVG();
});

function openDialogueBox(repoId) {
	var form = '<form id="usecase-file-submit-form" onsubmit="usecase_file_upload_fnc(); return false;"><div class="form-group"><input type="file" name="usecase-file" id="usecase-file" class="form-control"></div><div><input type="hidden" id="repo-id" name="repo-id" value="'+repoId+'"></div><div><input type="submit" class="btn btn-primary"></div></form>';
	$('#overlay-frame').modal();
	$("#overlay-frame .modal-title").html("Upload File");
	$("#overlay-frame .modal-body").html("");
	$("#overlay-frame .modal-body").html(form);  	
}

function usecase_file_upload_fnc() {
	if (!($('#usecase-file')[0].value)) {
		alert("No files selected");
		return;
	}
	var formData = new FormData($('#usecase-file-submit-form')[0]);
	//	formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
	$('.modal-footer .btn-default').click();
	$.ajax({
		type : 'POST',
		url : "uploadUseCaseFile",
		cache : false,
		processData : false, // Don't process the files
		contentType : false, // Set content type to false as jQuery will tell the server its a query string request
		data : formData,
		enctype : 'multipart/form-data',
		success : function(response) {
			console.log(response);
			$("#main-panel").html("");
			$("#main-panel").append($(response).children());
		},
		error : function() {
			// $("#commentList").append($("#name").val() + "<br/>" +
			// $("#body").val());
			console.log("fail");
			alert("There was an error submitting comment");
		}
	});
}