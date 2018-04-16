function setCookie(cname, cvalue, exdays) {
    var expires="";
    if(exdays > 0){
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        expires = "expires="+d.toUTCString();
    }

    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}



function model_file_upload_fnc() {
    var formData = new FormData($('#model-file-submit-form')[0]);
    console.log("starting the ajax call to some where");
    console.log(formData);
//  formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
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
        },
        error : function() {
            console.log("fail");
            console.log(err);
            alert("There was an error submitting commentA");
        }
    });

}

function highlight_diagram_element(idString, elementType, diagramType) {
  //var diagramType = $(".use-case").attr("data-diagram-type"); //read this by "data-diagram-type" at the line 3 of diagramDispla.jade. Need to be implemented.
  var svg = document.getElementsByClassName("use-case")[0];
  var svgDoc = svg.contentDocument;
  var elementToHighlight = svgDoc.getElementById(idString);

  if(diagramType === "analysis_diagram"){
           //have put robustness diagram script under robustness diagram - Aishwarya
  }
    
  else if(diagramType === "robustness_diagram") {
      const edges = Array.prototype.slice.apply(svgDoc.getElementsByClassName('edge'));
      idString = idString.replace('___', '->');
      for(var i = 0; i < edges.length; i++) {
        if(edges[i].firstElementChild.textContent === idString) {
            edges[i].children[1].setAttribute('stroke', 'blue');
            edges[i].children[2].setAttribute('stroke', 'blue');
        }
        else {
            edges[i].children[1].setAttribute('stroke', 'black');
            edges[i].children[2].setAttribute('stroke', 'black');
        }
      }
  }
    
  else if(diagramType === "sequence_diagram"){
      //call kate's, not ready.
  }
  else if(diagramType === "activity_diagram"){
    //call Traci's method.
    if(elementToHighlight) {
      highlight_activity_diagram(elementToHighlight);
    }
  }
  else if(diagramType === "class_diagram"){
      //call Lingquan's method.
  }
  else if(diagramType === "usim"){
      // leave it now.
  }
}

function highlight_activity_diagram(element) {
  if(element.getElementsByTagName("path")) {
    element.getElementsByTagName("path")[0].setAttribute("style", "stroke:yellow;stroke-width:3px;stroke-opacity:0.5;");
  }
}

function send_analytics_data(uuid, clientIpAddress, pageNumber) {
    var data = {
        ip: clientIpAddress,
        uuid: uuid,
        page: pageNumber
    };

    $.ajax({
        url: "surveyAnalytics",
        type: 'GET',
        contentType: "application/json",
        data: data,
        success: function (response) {
            console.log(response);
        },
        error: function(xhr, textStatus, errorThrown){
            console.log('request failed->'+textStatus);
        }
    });
}


function model_survey_file_upload_fnc() {
    var formData = new FormData($('#model-file-submit-form')[0]);
    console.log("starting the ajax call to some where");
    console.log(formData);
//  formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
    $.ajax({
        type : 'POST',
        url : "uploadSurveyData",
        data : formData,
        success : function(response) {
            console.log(response);
        },
        error : function() {
            console.log("fail");
            console.log(err);
            alert("There was an error submitting survey data");
        }
    });
}


function model_file_update_fnc(){
    var formData = new FormData($('#model-file-update-submit-form')[0]);
//  formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
    $.ajax({
        type : 'POST',
        url : "uploadUMLFileVersion",
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
            alert("There was an error submitting commentC");
        }
    });

    return false;

}

function predict_project_effort_func(){
    var formData = new FormData($('#project-effort-prediction-form')[0]);
    console.log("starting the ajax call to some where");
    console.log(formData);

//  formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
    $.ajax({
        type : 'POST',
        url : "predictProjectEffort",
        cache : false,
        processData : false, // Don't process the files
        contentType : false, // Set content type to false as jQuery will tell the server its a query string request
        data : formData,
        enctype : 'multipart/form-data',
        success : function(response) {
            console.log(response);
            $("#estimation-result-panel-body").html(response);
        },
        error : function() {
            console.log("fail");
            console.log(err);
            alert("There was an error submitting commentA");
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
            alert("There was an error submitting commentD");
        }
    });

    return false;
}


function estimate_project_effort_func(){
	//var formData = new FormData($('#project-effort-estimation-form')[0]);
	var form_data = new FormData();                  
    form_data.append('distributed_system',1);
    form_data.append('response_time', 2);
    form_data.append('end_user_efficiency', 3);
    form_data.append('complex_internal_processing', 4);
    form_data.append('code_must_be_reusable', 5);
    form_data.append('easy_to_install', 1);
    form_data.append('easy_to_use', 2);
    form_data.append('portable', 3);
    form_data.append('easy_to_change', 4);
    form_data.append('concurrent', 5);
    form_data.append('includes_special_security_objectives', 1);
    form_data.append('provides_direct_access_for_third_parties', 2);
    form_data.append('special_user_training_facilities_are_required', 3);
    form_data.append('familiar_with_the_project_model_that_is_used', 4);
    form_data.append('application_experience', 5);
    form_data.append('object_oriented_experience', 1);
    form_data.append('lead_analyst_capability', 2);
    form_data.append('motivation', 3);
    form_data.append('stable_requirements', 4);
    form_data.append('part_time_staff', 5);
    form_data.append('difficult_programming_language', 1);
    form_data.append('uml_file', "temp.uml");
    form_data.append('estimator', "Linear Regression");
    form_data.append('model', "EUCP");
    form_data.append('simulation', 0);
	//console.log(formData);
//	formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
	$.ajax({
		type : 'POST',
		url : "saveEstimation",
		cache : false,
		processData : false, // Don't process the files
		contentType : false, // Set content type to false as jQuery will tell the server its a query string request
		data : form_data,
		enctype : 'multipart/form-data',
		success : function(response) {
			console.log(response);
			$("#estimation-results-tables").html(response);
		},
		error : function(err) {
			console.log("fail");
			console.log(err);			
		}
	});

}

function query_model_detail_func(){
    var url = $(this).attr("href");
    console.log(url);
    $.ajax({
        type : 'GET',
        url : url,
        async: false,
        success : function(response) {
            console.log(response);
            $("#display-panel").html("");
            $("#display-panel").append(response);
            $('.model-info-content a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var breadCrumb = $('ol.breadcrumb')[0];
                if (breadCrumb.children.length == 3) {
                    breadCrumb.removeChild(breadCrumb.children[2]);
                }
                console.dir(e);
            });

            display();
            //createCharts();
        },
        error : function() {
            console.log("fail");
            alert("There was an error submitting commentE");
        }
    });

    return false;
}

function delete_use_case_func(){
//  alert('delete use case func');
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
            alert("There was an error submitting commentF");
        }
    });

    return false;
}

function query_model_usecase_func(modelId) {
//  console.log(modelId);
//  var url = $(this).attr("href");
//  console.log(url);
    if ($('.model-info-content a[href="#usecase-analysis"]').parent()[0].classList.contains('active')) {
        return;
    }
    console.log('query_model_usecase_func');
    $.ajax({
        type : 'GET',
        url : 'requestModelUseCases?model_id='+modelId,
        success : function(response) {
//          console.log(response);
            $("#model-usecase-analysis").html("");
            $("#model-usecase-analysis").append(response);
        },
        error : function() {
            console.log("fail");
            alert("There was an error submitting commentG");
        }
    });

    return false;
}

function reanalyse_model_func(){
    var url = $(this).attr("href");
    console.log(url);
//  console.log(modelId);
//  var url = $(this).attr("href");
//  console.log(url);
    console.log('reanalyse_model_func');
    $.ajax({
        type : 'GET',
        url : url,
        success : function(response) {
//          console.log(response);
            $("#display-panel").html("");
            $("#display-panel").append(response);
        },
        error : function() {
            console.log("fail");
            alert("There was an error submitting commentH");
        }
    });

    return false;
}

function use_case_evaluation_upload_fnc(){
//  alert('use_case_evaluation_upload_fnc');
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
            alert("There was an error submitting commentI");
        }
    });

    return false;
}

function model_evaluation_upload_fnc(){
//  alert('model_evaluation_upload_fnc');
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
            alert("There was an error submitting commentJ");
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
//          console.log(response);
            $("#use-case-detail-panel").html("");
            $("#use-case-detail-panel").append(response);
            var breadCrumb = $('ol.breadcrumb')[0];
            if (breadCrumb.children.length == 3) {
                breadCrumb.children[2].innerText = $(response).data('use-case-title');
            } else {
                breadCrumb.innerHTML += "<li class='breadcrumb-item active'>"+ $(response).data('use-case-title') +"</li>"
            }
        },
        error : function() {
            console.log("fail");
            alert("There was an error submitting commentK");
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
//          console.log(response);
            $("#display-panel").html("");
            $("#display-panel").append(response);
        },
        error : function() {
            console.log("fail");
            alert("There was an error submitting commentL");
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
//          console.log(response);
                    var parsedCSV = d3.csvParseRows(response);
                    $('.modal-title')[0].innerHTML = "Report";
                    $("#model-evaluation-dump-display").html("");
                    var container = d3.select("#model-evaluation-dump-display")
                        .append("table").attr('class', 'table table-striped table-bordered table-hover')
                        .append("tbody")
                        .selectAll("tr")
                            .data(parsedCSV).enter()
                            .append("tr")

                        .selectAll("td")
                            .data(function(d) { return d; }).enter()
                            .append("td")
                            .text(function(d) { return d == "undefined" ? "-" : d; });

        },
        error : function() {
            console.log("fail");
            alert("There was an error submitting commentM");
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
//          console.log(response);

                    var parsedCSV = d3.csvParseRows(response);
                    $('.modal-title')[0].innerHTML = "Report";
                    $("#overlay-frame .modal-body").html("");
                    var container = d3.select("#overlay-frame .modal-body")
                        .append("table").attr('class', 'table table-striped table-bordered table-hover')
                        .append("tbody")
                        .selectAll("tr")
                            .data(parsedCSV).enter()
                            .append("tr")

                        .selectAll("td")
                            .data(function(d) { return d; }).enter()
                            .append("td")
                            .text(function(d) { return d == "undefined" ? "-" : d; });

        },
        error : function() {
            console.log("fail");
            alert("There was an error submitting commentN");
        }
    });

    return false;
}

function query_estimation_models_func(){
//  alert($(this).closest('.dropdown').find('.dropdown-toggle').data('query-url'));
    var estimator = $('#estimator-selector-box').data('estimator');
    var model = $('#model-selector-box').data('model');
    var simulation = $('#model-query-box input[type="checkbox"]').is(":checked");
    var repoId = $(this).data('repo-id');
    $('#model-query-progressing').removeClass('hidden').addClass('shown');
    $.ajax({
        type : 'GET',
        url : "queryEstimationModel?estimator="+estimator+"&model="+model+"&repo_id="+repoId+"&simulation="+simulation,
//      url: $(this).closest('.dropdown').find('.dropdown-toggle').data('query-url'),
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

//function estimate_project_effort_func(){
////    alert($(this).closest('.dropdown').find('.dropdown-toggle').data('query-url'));
//  var estimator = $('#estimator-selector-box').data('estimator');
//  var model = $('#model-selector-box').data('model');
//  var simulation = $('#model-query-box input[type="checkbox"]').is(":checked");
//  var repoId = $(this).data('repo-id');
//  $('#model-query-progressing').removeClass('hidden').addClass('shown');
//  $.ajax({
//      type : 'GET',
//      url : "queryEstimationModel?estimator="+estimator+"&model="+model+"&repo_id="+repoId+"&simulation="+simulation,
////        url: $(this).closest('.dropdown').find('.dropdown-toggle').data('query-url'),
//      success : function(response) {
//          console.log(response);
//          $("#estimation-model-detail").html("");
//          $("#estimation-model-detail").append(response);
//          $('#model-query-progressing').removeClass('shown').addClass('hidden');
//      },
//      error : function() {
//          console.log("fail");
//          $('#model-query-progressing').removeClass('shown').addClass('hidden');
//          alert("There was an error");
//      }
//  });
//
//  return false;
//}


function validateEmail(email) {
    //var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var filter =  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!filter.test(email.value)) {
    return false;
    }

    return true;
}

function signUpFormSubmit (e){
    e.preventDefault();
    var formData = new FormData($('#sign-up')[0]);
//  formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
    var usernameMissing  = $('#sign-up #username').val().length>0 ? false : true;
    var emailMissing  = $('#sign-up #email').val().length>0 ? false : true;
    var pwdMissing = $('#sign-up #password').val().length > 0 ? false : true;

    var successDiv = '<div class="alert alert-success alert-dismissible">'+
    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';

    var alertDiv = '<div class="alert alert-danger alert-dismissible">'+
    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';

    if(emailMissing){
        alertDiv+='Please enter your email </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    }

    if(!validateEmail(email)){
        alertDiv+='Please enter a valid email </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    }

    if(usernameMissing){
        alertDiv+='Please choose a username </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    }
    if(pwdMissing){
        alertDiv+='Please enter your password </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    }

    $.ajax({
        type : 'POST',
        url : "signup",
        cache : false,
        processData : false, // Don't process the files
        contentType : false, // Set content type to false as jQuery will tell the server its a query string request
        data : formData,
        enctype : 'multipart/form-data',
        success : function(response) {

            if(response.success==true){
                setCookie("appToken",response.token,0);
                // redirect to home url with this token set
                window.location ="/";
                return false;

            } else {

                console.log('failure');
                alertDiv+=response.message+' </div>';
                $('#messageDiv').html(alertDiv);
                return false;

            }
        },
        error : function() {
            console.log("fail");
            alert("There was an error signing up");
        }
    });

    return false;
}

function loginFormSubmit (e){
    e.preventDefault();
    var formData = new FormData($('#login-form')[0]);

    var usernameMissing  = $('#login-form #username').val().length>0 ? false : true;
    var pwdMissing = $('#login-form #password').val().length > 0 ? false : true;

    var successDiv = '<div class="alert alert-success alert-dismissible">'+
    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';

    var alertDiv = '<div class="alert alert-danger alert-dismissible">'+
    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';

    if(usernameMissing && pwdMissing){
        alertDiv+='Please enter the Username and Password </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    } else if(usernameMissing){
        alertDiv+='Please enter the Username </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    } else if(pwdMissing){
        alertDiv+='Please enter the Password </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    }

    $.ajax({
        type : 'POST',
        url : "login",
        cache : false,
        processData : false, // Don't process the files
        contentType : false, // Set content type to false as jQuery will tell the server its a query string request
        data : formData,
        enctype : 'multipart/form-data',
        success : function(response) {
            if(response.success==true){
                setCookie("appToken",response.token,0);
                // redirect to home url with this token set
                window.location ="/";
            } else {
                alertDiv+=response.message+' </div>';
                $('#messageDiv').html(alertDiv);
            }
        },
        error : function() {
            console.log("fail");
            alert("There was an error logging in");
        }
    });

    return false;
}

function inviteFormSubmit (e){
    e.preventDefault();
    var formData = new FormData($('#invite-form')[0]);
//  formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');

    var emailMissing  = $('#invite-form #email').val().length>0 ? false : true;

    var successDiv = '<div class="alert alert-success alert-dismissible">'+
    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';

    var alertDiv = '<div class="alert alert-danger alert-dismissible">'+
    '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';

    if(emailMissing){
        alertDiv+='Please enter your email </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    }

    if(!validateEmail(email)){
        alertDiv+='Please enter a valid email </div>'
        $('#messageDiv').html(alertDiv);
        return false;
    }


    $.ajax({
        type : 'POST',
        url : "inviteUser",
        cache : false,
        processData : false, // Don't process the files
        contentType : false, // Set content type to false as jQuery will tell the server its a query string request
        data : formData,
        enctype : 'multipart/form-data',
        success : function(response) {

            if(response.success==true){
                console.log('success');
                successDiv+=response.message+' </div>';
                $('#messageDiv').html(successDiv);

                return false;

            } else {

                console.log('failure');
                alertDiv+=response.message+' </div>';
                $('#messageDiv').html(alertDiv);
                return false;

            }
        },
        error : function() {
            console.log("fail");
            alert("There was an error signing up");
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
//  var parseTime = d3.timeParse("%d-%b-%y");

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
//    data.forEach(function(d) {
//        d.date = parseTime(d.date);
//        d.close = +d.close;
//    });

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
//  $(document).on('click','a.model-list-title.domain-model-title', query_domain_model_detail_func);
    $(document).on('click','#model-title', query_model_detail_func);
    $(document).on('click','.request-repo-analytics', query_repo_analytics_func);
    $(document).on('click','#use-case-evaluation-form-submit-button', use_case_evaluation_upload_fnc);
    $(document).on('click','#model-evaluation-form-submit-button', model_evaluation_upload_fnc);
    $(document).on('click','#query-model-btn', query_estimation_models_func);
//  $(document).on('click','#estimate-project-effort-button', estimate_project_effor_func);
    $(document).on('click','#delete-use-case-btn', delete_use_case_func);
    $(document).on('click','#reanalyse-model', reanalyse_model_func);
    $(document).on('click','#dump-model-evaluation-for-use-cases-btn', dump_model_evaluation_for_use_cases_func);
    $(document).on('click','.dumpEvaluationData', request_display_data);
    $(document).on('click','.dumpAnalyticsData', request_display_data);

    $(document).on('click', '#estimator-selector-box .dropdown-menu li a', function(){
//       alert($(this).closest('.dropdown').find('.btn').text());
        $(this).closest('.dropdown').find('.dropdown-toggle').html($(this).text()+'<span class="caret"></span>');
        $('#estimator-selector-box').data('estimator', $(this).data('estimator'));
    });

    $(document).on('click', '#model-selector-box .dropdown-menu li a', function(){
//        alert($(this).closest('.dropdown').find('.btn').text());
        $(this).closest('.dropdown').find('.dropdown-toggle').html($(this).text()+'<span class="caret"></span>');
        $('#model-selector-box').data('model', $(this).data('model'));

    });

    $('.nav.nav-tabs').tab();

    $('form#sign-up').submit(signUpFormSubmit);
    $('form#login-form').submit(loginFormSubmit);
    $('form#invite-form').submit(inviteFormSubmit);

    $('[data-toggle="popover"]').popover({'html':true});
    createCharts();
});

function openDialogueBox(repoId, type) {
    var formUseCase = '<form id="load-file-submit-form" onsubmit="load_file_upload_fnc('+type+'); return false;"><div class="form-group"><input type="file" name="usecase-file" id="upload-file" class="form-control"></div><div> <p>The supported file type: .csv </p><input type="hidden" id="repo-id" name="repo-id" value="'+repoId+'"></div><div><input type="submit" class="btn btn-primary"></div></form>';
    var formModel = '<form id="load-file-submit-form" onsubmit="load_file_upload_fnc('+type+'); return false;"><div class="form-group"><input type="file" name="model-file" id="upload-file" class="form-control"></div><div> <p>The supported file type: .csv </p><input type="hidden" id="repo-id" name="repo-id" value="'+repoId+'"></div><div><input type="submit" class="btn btn-primary"></div></form>';
    var formCOCOMO = '<form id="load-file-submit-form" onsubmit="load_file_upload_fnc('+type+'); return false;"><div class="form-group"><input type="file" name="COCOMO-file" id="upload-file" class="form-control"></div><div> <p>The supported file type: .csv </p><input type="hidden" id="repo-id" name="repo-id" value="'+repoId+'"></div><div><input type="submit" class="btn btn-primary"></div></form>';
    //$('#overlay-frame').addClass('upload');
    $('#dialog-frame').modal();
    $("#dialog-frame .modal-title").html("Upload File");
    $("#dialog-frame .modal-body").html("");
    if (type == "1") {
        form = formUseCase;
    } else if( type == "2") {
        form = formModel;
    } else {
        form = formCOCOMO;
    }
    $("#dialog-frame .modal-body").html(form);
}

function openDialogueBoxForModelFileUpdate(repoId, modelId) {
    var form = '<form id="model-file-update-submit-form" onsubmit="model_file_update_fnc(); return false;"><div class="form-group"><input type="file" name="uml-file" id="uml-file" class="form-control"></div><div> <p>The supported file type: .xml </p><input type="hidden" id="repo-id" name="repo-id" value="'+repoId+'"><input type="hidden" id="model-id" name="model-id" value="'+modelId+'"></div><div><input type="submit" class="btn btn-primary"></div></form>';
    //$('#overlay-frame').addClass('upload');
    $('#dialog-frame').modal();
    $("#dialog-frame .modal-title").html("Upload File");
    $("#dialog-frame .modal-body").html("");
    $("#dialog-frame .modal-body").html(form);
}

function load_file_upload_fnc(type) {
    if (!($('#upload-file')[0].value)) {
        alert("No files selected");
        return;
    }
    var formData = new FormData($('#load-file-submit-form')[0]);
    //  formData.append('file', $('#model-file-submit-form')[0].files[0], 'uml_file');
    $('#dialog-frame .modal-footer .btn-default').click();
    //$('#overlay-frame').removeClass('upload')
    if (type == "1") {
        url = "uploadUseCaseFile"
    } else if( type == "2") {
        url = "uploadModelFile";
    } else {
        url = "uploadCOCOMOFile";
    }

    $.ajax({
        type : 'POST',
        url : url,
        cache : false,
        processData : false, // Don't process the files
        contentType : false, // Set content type to false as jQuery will tell the server its a query string request
        data : formData,
        enctype : 'multipart/form-data',
        success : function(response) {
            console.log(response);
            $("#main-panel").html("");
            $("#main-panel").append($(response).children().splice(1,$(response).children().length));
        },
        error : function() {
            // $("#commentList").append($("#name").val() + "<br/>" +
            // $("#body").val());
            console.log("fail");
            alert("There was an error submitting commentO");
        }
    });
}

function toggleQueryList() {
    $("#use-case-list").slideToggle();
}

function toggleZoom() {
    panZoomInstance = svgPanZoom('object', {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.1
    });

    // zoom out
    panZoomInstance.zoom(1)
}




function toggleDomainList() {
    $("#domain-model-list").slideToggle();
}

// added for zoom control on svg


function toggleDiagram() {
	var obj_data = document.getElementsByTagName("object")[0].getAttribute("data");
	var pos = obj_data.search("/useCase.svg");
	var new_obj_data = "";
	if (pos != -1) {
		new_obj_data = obj_data.slice(0, pos)+"/uml_diagram.svg";
	} else {
		pos = obj_data.search("uml_diagram.svg");
		new_obj_data = obj_data.slice(0, pos)+"/useCase.svg";
	}
	document.getElementsByTagName("object")[0].setAttribute("data", new_obj_data);
}

function get_diagram_name() {
	return diagram_name;
}







var activatedItem, activatedPath = [];
function colorUseCaseElementAndPath(name, type) {
    clearSelectedPathAndEdge();
    var svg = $('.use-case')[0].getSVGDocument();
    var list = svg.getElementsByTagName('g');
    if(type == "element") {
        for (var item of list) {
            if(item.getElementsByTagName("title")[0].innerHTML == name) {
                item.getElementsByTagName('ellipse')[0].style.fill = "red";
                activatedItem = item.getElementsByTagName('ellipse')[0].style;
            }
        }
    } else {
        var pathArray = name.split('->');
        for(var i=0; i<pathArray.length-1; i++) {
            for (var item of list) {
                if(item.getElementsByTagName("title")[0].innerHTML == pathArray[i]+'-&gt;'+pathArray[i+1]) {
                    item.getElementsByTagName('polygon')[0].style.stroke = "green";
                    item.getElementsByTagName('polygon')[0].style.fill = "green";
                    item.getElementsByTagName('path')[0].style.stroke = "green";
                    activatedPath.push(item);
                }
            }
        }
    }
}

function clearSelectedPathAndEdge() {
    if(activatedPath.length) {
        for(var path of activatedPath) {
            path.getElementsByTagName('polygon')[0].style.stroke = "black";
            path.getElementsByTagName('polygon')[0].style.fill = "black";
            path.getElementsByTagName('path')[0].style.stroke = "black";
        }
    }
    if(activatedItem) {
        activatedItem.fill = "white";
    }
}

function createCharts() {
    createTrendingLines();
    //createPieChart();
    createHistogram();
    creatAvgHistograms();
    createHistogramForPathNumber();
}

function createTrendingLines() {
    var url = $('#trending-line')[0].attributes.getNamedItem('data').value;
    d3.csv(url, function(error, data) {
        if (error) {
            console.error(error);
            return;
        }
        var tempData = [];
        data.forEach(function(d) {
            d.update_time = new Date(d.update_time).getTime();
            d.number_of_paths = +d.number_of_paths;
            tempData.push([d.update_time, d.number_of_paths])
        });
        data= tempData;
        console.dir(data)
        Highcharts.chart('trending-line', {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Number of Transactions'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Update Time'
                }
            },
            yAxis: {
                title: {
                    text: 'Number of Paths'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'line',
                name: 'Number of Transactions',
                data: data
            }]
        });
    });
}
function createPieChart() {
    var url = $('#transaction-pie')[0].attributes.getNamedItem('data').value;
    var newData =[];
    d3.csv(url, function(error, data) {
        if (error) {
            console.error(error);
            return;
        }
        var counter = [], transactionLable = [];
        data.forEach(function(d) {
            counter[d.transactional] ?  counter[d.transactional]++ : counter[d.transactional]= 1;
            if (transactionLable.indexOf(d.transactional) == -1) {
                transactionLable.push(d.transactional);
            }
        });
        transactionLable.forEach(function(transaction) {
            newData.push({
                name: transaction,
                y: counter[transaction]
            });
        })

        // Build the chart :  refer highchart pie-chart for more information
        Highcharts.chart('transaction-pie', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Distribution of Types of operations'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Transactions',
                colorByPoint: true,
                data: newData
            }]
        });
    });
}

function createHistogram(dataList, max) {
    var url = $('#model-analysis')[0] ? $('#model-analysis')[0].attributes.getNamedItem('data-expandedPathURL').value : "";
    if (url) {
        d3.csv(url, function(error, data) {
            if (error) {
                console.error(error);
                return;
            }
            var newData = {
                CTRL: {
                    list: [],
                    chartName: "Control Operation Number"
                },
                EI: {
                    list: [],
                    chartName: "Extra Input Operation Number"
                },
                EQ: {
                    list: [],
                    chartName: "Extra Query Operation Number"
                },
                EXTIVK: {
                    list: [],
                    chartName: "Extra Invocation Operation Number"
                },
                EXTCLL: {
                    list: [],
                    chartName: "Extra adCall Operation Number"
                },
                INT: {
                    list: [],
                    chartName: "Interface Operation Number"
                },
                TRAN_NA: {
                    list: [],
                    chartName: "Not Matched Operation Number"
                }
            };
            data.forEach(function(d) {
                var temp = newData[d.transactional] ? newData[d.transactional] : undefined;
                if (temp) {
                    temp.list[+d.path_length] ? temp.list[+d.path_length]++ : temp.list[+d.path_length] = 1;
                }
            });
            var maxLength = 0;
            var dataList = [];
            for (var chartData in newData) {
                if (newData.hasOwnProperty(chartData)) {
                    var temp = newData[chartData];
                    maxLength = (maxLength < temp.list.length ? temp.list.length : maxLength);
                    for(i= 0;i < temp.list.length; i++) {
                        temp.list[i] = (temp.list[i] ? temp.list[i] : 0);
                    }
                    dataList.push({
                        data: temp.list,
                        name: temp.chartName
                    })
                }
            }
            //refer http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/column-basic/ for sample
            var categoriesList = [];
            for(i= 0; i< maxLength; i++) {
                categoriesList.push(i.toString());
            }
            Highcharts.chart('chart-1', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Distribution Graph'
                },
                xAxis: {
                    categories: categoriesList,
                    crosshair: true,
                    title: {
                        text: 'path_length'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Frequency'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">&#x26AB;: </td>' +
                        '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
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
                series: dataList
            });
        });
    }
}
function creatAvgHistograms() {
    var url = $('#model-analysis')[0] ? $('#model-analysis')[0].attributes.getNamedItem('data-pathAnalyticsURL').value : "";
    if (url) {
        d3.csv(url, function(error, data) {
            if (error) {
                console.error(error);
                return;
            }
            var newData = [
                {
                    list: [],
                    id: "chart-8",
                    xAxis: "Architecture Difficulty",
                    yAxis: "Frequency",
                    chartName: "Architecture Difficulty"
                }, {
                    list: [],
                    id: "chart-9",
                    xAxis: "Average Degree",
                    yAxis: "Frequency",
                    chartName: "Average Degree"
                }, {
                    list: [],
                    id: "chart-10",
                    xAxis: "Average Path Length",
                    yAxis: "Frequency",
                    chartName: "Average Path Length"
                }
            ];
            data.forEach(function(d) {
                newData[0].list[+d.arch_diff] ? newData[0].list[+d.arch_diff]++ : newData[0].list[+d.arch_diff] = 1;
                newData[1].list[+d.avg_degree] ? newData[1].list[+d.avg_degree]++ : newData[1].list[+d.avg_degree] = 1;
                newData[2].list[+d.path_length] ? newData[2].list[+d.path_length]++ : newData[2].list[+d.path_length] = 1;
            });
            newData.forEach(function(chartData) {
                for(i= 0;i < chartData.list.length; i++) {
                    chartData.list[i] = (chartData.list[i] ? chartData.list[i] : 0);
                }
                createHistogramIndividually(chartData.id, chartData.list , chartData.xAxis, chartData.yAxis, chartData.chartName);
            });
        });
    }
}

function createHistogramForPathNumber() {
    var url = $('#model-analysis')[0] ? $('#model-analysis')[0].attributes.getNamedItem('data-usecaseAnalyticsURL').value : "";
    var list= [],
        id= "chart-11",
        xAxis= "Path Number",
        yAxis= "Frequency",
        chartName= "Path Number";
    if (url) {
        d3.csv(url, function(error, data) {
            if (error) {
                console.error(error);
                return;
            }
            data.forEach(function(d) {
                list[+d.path_number] ? list[+d.path_number]++ : list[+d.path_number] = 1;
            });
            for(i= 0;i < list.length; i++) {
                list[i] = (list[i] ? list[i] : 0);
            }
            createHistogramIndividually(id, list , xAxis, yAxis, chartName);
        });
    }
}
function createHistogramIndividually(id, data, xAxisName, yAxisName, histogramTitle) {
    Highcharts.chart(id, {
        title: {
            text: histogramTitle
        },
        xAxis: [{
            title: { text: xAxisName }
        }],

        yAxis: [{
            title: { text: yAxisName }
        }],

        series: [{
            name: xAxisName,
            type: 'histogram',
            data: data
        }]
    });
}

function editFunction(button) {
//    document.getElementById("editNumber1").contentEditable = "true";
//    document.getElementById("editNumber2").contentEditable = "true";
//    document.getElementById("editNumber3").contentEditable = "true";
//    document.getElementById("editNumber4").contentEditable = "true";
//    document.getElementById("editNumber5").contentEditable = "true";
//    document.getElementById("editNumber6").contentEditable = "true";
//    document.getElementById("editNumber7").contentEditable = "true";
//    document.getElementById("editNumber8").contentEditable = "true";
//    document.getElementById("editNumber9").contentEditable = "true";
//    document.getElementById("editNumber10").contentEditable = "true";
//    document.getElementById("editNumber11").contentEditable = "true";
//    document.getElementById("editNumber12").contentEditable = "true";
//    document.getElementById("editNumber13").contentEditable = "true";
//    document.getElementById("editNumber14").contentEditable = "true";
//    document.getElementById("editNumber15").contentEditable = "true";
//    document.getElementById("editNumber16").contentEditable = "true";
//    document.getElementById("editNumber17").contentEditable = "true";
//    document.getElementById("editNumber18").contentEditable = "true";
//    document.getElementById("editNumber19").contentEditable = "true";
//    document.getElementById("editNumber20").contentEditable = "true";
//    document.getElementById("editNumber21").contentEditable = "true";
   document.getElementById("editNumber1").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber2").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber3").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber4").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber5").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber6").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber7").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber8").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber9").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber10").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber11").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber12").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber13").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber14").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber15").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber16").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber17").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber18").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber19").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber20").attributes.removeNamedItem("disabled");
   document.getElementById("editNumber21").attributes.removeNamedItem("disabled");

    document.getElementById("submitButton").classList.remove("hidden");
    document.getElementById("cancelButton").classList.remove("hidden");
    document.getElementById("modifyButton").classList.add("hidden");
}

function submitEdit(){
		var form_data = new FormData();                  
	    form_data.append('distributed_system',$("#editNumber1").text());
	    form_data.append('response_time', $("#editNumber2").text());
	    form_data.append('end_user_efficiency', $("#editNumber3").text());
	    form_data.append('complex_internal_processing', $("#editNumber4").text());
	    form_data.append('code_must_be_reusable', $("#editNumber5").text());
	    form_data.append('easy_to_install', $("#editNumber6").text());
	    form_data.append('easy_to_use', $("#editNumber7").text());
	    form_data.append('portable', $("#editNumber8").text());
	    form_data.append('easy_to_change', $("#editNumber9").text());
	    form_data.append('concurrent', $("#editNumber10").text());
	    form_data.append('includes_special_security_objectives', $("#editNumber11").text());
	    form_data.append('provides_direct_access_for_third_parties', $("#editNumber12").text());
	    form_data.append('special_user_training_facilities_are_required', $("#editNumber13").text());
	    form_data.append('familiar_with_the_project_model_that_is_used', $("#editNumber14").text());
	    form_data.append('application_experience', $("#editNumber15").text());
	    form_data.append('object_oriented_experience', $("#editNumber16").text());
	    form_data.append('lead_analyst_capability', $("#editNumber17").text());
	    form_data.append('motivation', $("#editNumber18").text());
	    form_data.append('stable_requirements', $("#editNumber19").text());
	    form_data.append('part_time_staff', $("#editNumber20").text());
	    form_data.append('difficult_programming_language', $("#editNumber21").text());
	    form_data.append('modelID', $("#mymodelId").val());
	    
		$.ajax({
			type : 'POST',
			url : "saveModelInfoCharacteristics",
			cache : false,
			processData : false, // Don't process the files
			contentType : false, // Set content type to false as jQuery will tell the server its a query string request
			data : form_data,
			enctype : 'multipart/form-data',
			success : function(response) {
				console.log(response);
				$("#estimation-results-tables").html(response);
			},
			error : function(err) {
				console.log("fail");
				console.log(err);			
			}
		});	
	}

function cancelEdit() {
//    document.getElementById("editNumber1").contentEditable = "false";
//    document.getElementById("editNumber2").contentEditable = "false";
//    document.getElementById("editNumber3").contentEditable = "false";
//    document.getElementById("editNumber4").contentEditable = "false";
//    document.getElementById("editNumber5").contentEditable = "false";
//    document.getElementById("editNumber6").contentEditable = "false";
//    document.getElementById("editNumber7").contentEditable = "false";
//    document.getElementById("editNumber8").contentEditable = "false";
//    document.getElementById("editNumber9").contentEditable = "false";
//    document.getElementById("editNumber10").contentEditable = "false";
//    document.getElementById("editNumber11").contentEditable = "false";
//    document.getElementById("editNumber12").contentEditable = "false";
//    document.getElementById("editNumber13").contentEditable = "false";
//    document.getElementById("editNumber14").contentEditable = "false";
//    document.getElementById("editNumber15").contentEditable = "false";
//    document.getElementById("editNumber16").contentEditable = "false";
//    document.getElementById("editNumber17").contentEditable = "false";
//    document.getElementById("editNumber18").contentEditable = "false";
//    document.getElementById("editNumber19").contentEditable = "false";
//    document.getElementById("editNumber20").contentEditable = "false";
//    document.getElementById("editNumber21").contentEditable = "false";

   var attr1 = document.createAttribute("disabled");
   var attr2 = document.createAttribute("disabled");
   var attr3 = document.createAttribute("disabled");
   var attr4 = document.createAttribute("disabled");
   var attr5 = document.createAttribute("disabled");
   var attr6 = document.createAttribute("disabled");
   var attr7 = document.createAttribute("disabled");
   var attr8 = document.createAttribute("disabled");
   var attr9 = document.createAttribute("disabled");
   var attr10 = document.createAttribute("disabled");
   var attr11 = document.createAttribute("disabled");
   var attr12 = document.createAttribute("disabled");
   var attr13 = document.createAttribute("disabled");
   var attr14 = document.createAttribute("disabled");
   var attr15 = document.createAttribute("disabled");
   var attr16 = document.createAttribute("disabled");
   var attr17 = document.createAttribute("disabled");
   var attr18 = document.createAttribute("disabled");
   var attr19 = document.createAttribute("disabled");
   var attr20 = document.createAttribute("disabled");
   var attr21 = document.createAttribute("disabled");

   attr1.value = "disabled";
   attr2.value = "disabled";
   attr3.value = "disabled";
   attr4.value = "disabled";
   attr5.value = "disabled";
   attr6.value = "disabled";
   attr7.value = "disabled";
   attr8.value = "disabled";
   attr9.value = "disabled";
   attr10.value = "disabled";
   attr11.value = "disabled";
   attr12.value = "disabled";
   attr13.value = "disabled";
   attr14.value = "disabled";
   attr15.value = "disabled";
   attr16.value = "disabled";
   attr17.value = "disabled";
   attr18.value = "disabled";
   attr19.value = "disabled";
   attr20.value = "disabled";
   attr21.value = "disabled";

   document.getElementById("editNumber1").attributes.setNamedItem(attr1);
   document.getElementById("editNumber2").attributes.setNamedItem(attr2);
   document.getElementById("editNumber3").attributes.setNamedItem(attr3);
   document.getElementById("editNumber4").attributes.setNamedItem(attr4);
   document.getElementById("editNumber5").attributes.setNamedItem(attr5);
   document.getElementById("editNumber6").attributes.setNamedItem(attr6);
   document.getElementById("editNumber7").attributes.setNamedItem(attr7);
   document.getElementById("editNumber8").attributes.setNamedItem(attr8);
   document.getElementById("editNumber9").attributes.setNamedItem(attr9);
   document.getElementById("editNumber10").attributes.setNamedItem(attr10);
   document.getElementById("editNumber11").attributes.setNamedItem(attr11);
   document.getElementById("editNumber12").attributes.setNamedItem(attr12);
   document.getElementById("editNumber13").attributes.setNamedItem(attr13);
   document.getElementById("editNumber14").attributes.setNamedItem(attr14);
   document.getElementById("editNumber15").attributes.setNamedItem(attr15);
   document.getElementById("editNumber16").attributes.setNamedItem(attr16);
   document.getElementById("editNumber17").attributes.setNamedItem(attr17);
   document.getElementById("editNumber18").attributes.setNamedItem(attr18);
   document.getElementById("editNumber19").attributes.setNamedItem(attr19);
   document.getElementById("editNumber20").attributes.setNamedItem(attr20);
   document.getElementById("editNumber21").attributes.setNamedItem(attr21);

    document.getElementById("submitButton").classList.add("hidden");
    document.getElementById("cancelButton").classList.add("hidden");
    document.getElementById("modifyButton").classList.remove("hidden");
}


function highlightElement_classDia(element) {
      clearHighlight_classDia() ;
       var allNodes = document.getElementById(element).getElementsByTagName("text");
       for(var i = 0; i < allNodes.length; i++) {
               allNodes[i].style.stroke = "red";
       }

   }
function highlightElement(id) {
    clearHighlight() ;
document.getElementById(id).style.stroke =  "red";

}
   function clearHighlight() {
       var allNodes = document.getElementsByTagName("text");

       for(var i = 0; i < allNodes.length; i++) {
               allNodes[i].style.stroke = "";
       }
   }

// var filesystem = require("fs");
// var _getAllFilesFromFolder = function(dir) {
//     // var filesystem = require("fs");
//     var results = [];
//
//     filesystem.readdirSync(dir).forEach(function(file) {
//
//         file = dir+'/'+file;
//         var stat = filesystem.statSync(file);
//
//         if (stat && stat.isDirectory()) {
//             results = results.concat(_getAllFilesFromFolder(file))
//         } else results.push(file);
//
//     });
//
//     console.log(results);
// };

function walkDir(fileFolder) {
    $.ajax({
    	type: 'GET',
        url: 'listFileUnderDir?fileFolder='+fileFolder,
        success: function (data) {
    		console.log(data);

            var out = "<table class='table-striped'>";
            out += "<tr><th>File Lists</th></tr>";

            for(var i = 0; i < data.length; i++) {
            	// var fatherUrl = data[i].parent.substring(data[i].parent.lastIndexOf("/")+1);
            	// if (fatherUrl == fileFolder) {
            	// 	if (data[i].isFolder == 'true') {
            	// 		var clickValue = data[i].parent+"/"+data[i].url;
            	// 		console.log(clickValue);
                 //        out += "<tr><td><a href='#'>" +
                 //            data[i].url+
                 //            "</a></td>";
					// } else {
                        out += "<tr><td>" +
                            data[i].url+
                            "</td>";
				// 	}
				// }
            }
            out += "</table>";
            document.getElementById("displayArchive").innerHTML = out;
        }
    });
}

// function walkDir() {
//     const testFolder = './tests/';
//     const fs = require('fs');
//
//     fs.readdir(testFolder, (err, files) => {
//         files.forEach(file => {
//         console.log(file);
//      });
//  })
// });