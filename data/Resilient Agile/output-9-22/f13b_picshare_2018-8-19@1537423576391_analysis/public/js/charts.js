function display()
{
    var repoID = $("#myrepoId").val();
    var modelID = $("#mymodelId").val();
// console.log(repoID);
// console.log(modelID);
    var chart_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/useCaseEvaluation.csv";
    /* Parse csv file using d3.js and display the required data  */
    d3.csv(chart_url, function(data) {

        var swti = [];
        var swtii = [];
        var swtiii =[];
        var categories=[];
        for(var i=0;i<data.length;i++)
        {
            swti.push([parseInt(data[i].SWTI)]);
            swtii.push([parseInt(data[i].SWTII)]);
            swtiii.push([parseInt(data[i].SWTIII)]);
            categories.push(["UC"+data[i].NUM]);
        }

        // console.log("===============chart_url================");
        // console.log(chart_url);
        // console.log("====================data=====================");
        // console.log(data);
        // console.log("====================swti=====================");
        // console.log(swti);
        // console.log("====================swtii=====================");
        // console.log(swtii);
        // console.log("====================swtiii=====================");
        // console.log(swtiii);
        // console.log("====================categories=====================");
        // console.log(categories);

        $('#chart-1').highcharts({
            chart: {
                type: 'column',
                spacingLeft: 0

            },
            title: {
                text: 'Evaluation of Use Case Complexity'
            },

            xAxis: {
                categories: categories,
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
                pointFormat:
                '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
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
            series: [ {
                name: 'SWTI',
                data: swti

            }, {
                name: 'SWTII',
                data: swtii

            }, {
                name: 'SWTIII',
                data: swtiii

            }]

        });
    });


    var url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/use_case_evaluation_statistics/statistics.json";
    var domain_model_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) +
        "/domain_model_evaluation_statistics/statistics.json";

    console.log(url);
    //do not know the function of the two ajaxes below!!!
     $.ajax({
       url: url,
       type:"GET",
       dataType: "json",
    
       success: function(response)
       {
    
             document.getElementById("details").innerHTML ="<div style='height:6%'>&nbsp;</div><div class='modal fade' id='myModal1' role='dialog'><div class='modal-dialog'>'<div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button><h4 class='modal-title'>Chart</h4></div><div class='modal-body'></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button></div></div></div></div></div<h3>Use case evaluation statistics</h3><table class='table table-hover table-bordered'; id='mytable'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>";
               for (var i=0;i<response.length;i++)
               {
                     var img_link = response[i]['dist chart path'].substring(7,response[i]['dist chart path'].length);
                     $('.modal-body').html('<img src="' + img_link + '">');
                     document.getElementById("mytable").innerHTML +=  "<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><button type='button' class='btn btn-light'onclick = 'showModalDetails(\"" + img_link +  "\")'> Display Chart</button></td></tr>" ;
    
               }
    
       },
       error:function(error){
         console.log("failed");
       }
    
    
     });
     //The below code is to populate the json data for domain model evaluation statistics (model level)
     $.ajax({
       url: domain_model_url,
       type:"GET",
       dataType: "json",
    
       success: function(response)
       {
    
               document.getElementById("details").innerHTML +="<div style='height:6%'>&nbsp;</div><div class='modal fade' id='myModal2' role='dialog'><div class='modal-dialog'>'<div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button><h4 class='modal-title'>Chart</h4></div><div class='modal-body'></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button></div></div></div></div></div><h3>Domain Model evaluation statistics</h3><table class='table table-hover table-bordered'; id='domain_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>";
                 for (var i=0;i<response.length;i++)
                 {
                   var img_link2 = response[i]['dist chart path'].substring(7,response[i]['dist chart path'].length);
                   $('.modal-body').html('<img src="' + img_link2 + '">');
                       document.getElementById("domain_table").innerHTML +=  "<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><button type='button' class='btn btn-light' onclick = 'showModal(\"" + img_link2 +  "\")'>Display Chart</button></td></tr>" ;
    
                 }
    
       },
       error:function(error){
         console.log("failed");
       }
    
    
     });

}
// The below code is to populate the json data at the repo level

var repoID = $("#myrepoId").val();
//  console.log("found");
//console.log($('.repo-metrics').html());
var repo_url = "output/repo"+ repoID  +  "/model_evaluation_statistics/statistics.json";
console.log("++++++++++++++++++++++++++++++++");
console.log(repo_url);
$.ajax({
    url: repo_url,
    type:"GET",
    dataType: "json",

    success: function(response)
    {
        console.log("++++++++++++++++++++++++++++++++");
        console.log(response)

        $('.repo-metrics').html("<div style='height:6%'>&nbsp;</div><div class='modal fade' id='myModal' role='dialog'><div class='modal-dialog'>'<div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button><h4 class='modal-title'>Chart</h4></div><div class='modal-body'><p id='r'></p></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button></div></div></div></div></div><h3>Statistics</h3><table class='table table-hover table-bordered'; id='repo_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>");
        for (var i=0;i<response.length;i++)
        {
            var img_link3 = response[i]['dist chart path'].substring(7,response[i]['dist chart path'].length);
            //console.log(img_link3);
            $('#r').html('<img src="' + img_link3 + '">');
            //console.log($('#r').html());
            $('#repo_table').append("<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><button type='button' class=' btn btn-light' onclick = 'showRepoModal(\"" + img_link3 +  "\")'>Display Chart</button></td></tr>");

        }
        $('.repo-metrics').append( "</table>");
    },
    error:function(error){
        console.log("failed");
    }


});
// the below function is to populate data for usecase
function populate_usecase_data()
{
    var use_case_id = $("#UseCaseId").val();
    //var modelID = $("#mymodelId").val();
    //console.log(use_case_id);
    //console.log(modelID);

    var repoID = $("#myrepoId").val();

    var modelID = $("#mymodelId").val();

    var usecase_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/" + use_case_id + "/element_statistics.json" ;
    var usecase_url2 = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/" + use_case_id + "/path_statistics.json" ;
    //console.log(usecase_url);
    // $('.use-case-analytics').html("hi");
    //console.log($('.use-case-analytics').html());
    console.log("div data" + $('#analysis-data').html())
    $.ajax({
        url: usecase_url,
        type:"GET",
        dataType: "json",

        success: function(response)
        {
            //console.log(response)
            $('#analysis-data').css("display","block");
            $('#analysis-data').html("<div style='height:6%'>&nbsp;</div><div class='modal fade' id='myModal3' role='dialog'><div class='modal-dialog'>'<div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button><h4 class='modal-title'>Chart</h4></div><div class='modal-body'></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button></div></div></div></div></div><h3>Use case statistics</h3><table class='table table-hover table-bordered'; id='usecase_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>");
            for (var i=0;i<response.length;i++)
            {
                var img_link4 =  response[i]['dist chart path'].substring(7,response[i]['dist chart path'].length);

                $('.modal-body').html('<img src="' + img_link4 + '">');
                $('#usecase_table').append("<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><button type='button' class='btn btn-light'onclick = 'showUseCaseUrlModal(\"" + img_link4 +  "\")'>Display Chart</button></td></tr>");

            }
            //  $('.repo-metrics').append( "</table>");
        },
        error:function(error){
            console.log("failed");
        }


    });
    $.ajax({
        url: usecase_url2,
        type:"GET",
        dataType: "json",

        success: function(response)
        {
            console.log(response)

            $('#analysis-data').append("<div style='height:6%'>&nbsp;</div><div class='modal fade' id='myModal4' role='dialog'><div class='modal-dialog'>'<div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button><h4 class='modal-title'>Chart</h4></div><div class='modal-body'></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button></div></div></div></div><table class='table table-hover table-bordered'; id='usecase_table2'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>");
            for (var i=0;i<response.length;i++)
            {
                var img_link5 = response[i]['dist chart path'].substring(7,response[i]['dist chart path'].length);
                $('.modal-body').html('<img src="' + img_link5 + '">');
                $('#usecase_table2').append("<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><button type='button' class='btn btn-light' onclick = 'showUrl2Modal(\"" + img_link5 +  "\")'>Display Chart</button></td></tr>");

            }
            //  $('.repo-metrics').append( "</table>");
        },
        error:function(error){
            console.log("failed");
        }


    });
}
function populate_domainAnalysis_data()
{

    var repoID = $("#myrepoId").val();

    var modelID = $("#mymodelId").val();
    console.log("analysis!");
    var usecase_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/" +  "/domainModel/domain_model_statistics.json" ;
    $.ajax({
        url: usecase_url,
        type:"GET",
        dataType: "json",

        success: function(response)
        {
            console.log(response)
            //$('#domainAnalysis_table').css("display", "none");
            $('#show_Domain_JsonData').html("<div style='height:6%'>&nbsp;</div><div class='modal fade' id='myModal5' role='dialog'><div class='modal-dialog'>'<div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal'>&times;</button><h4 class='modal-title'>Chart</h4></div><div class='modal-body'></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button></div></div></div></div><h3>Domain Model statistics</h3><table class='table table-hover table-bordered'; id='domainAnalysis_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>");
            for (var i=0;i<response.length;i++)
            {
                var img_link6 = response[i]['dist chart path'].substring(7,response[i]['dist chart path'].length);
                $('.modal-body').html('<img src="' + img_link6 + '">');
                $('#domainAnalysis_table').append("<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><button type='button' class='btn btn-light'  onclick = 'showDomainModal(\"" + img_link6 +  "\")'>Display Chart</button></td></tr>");

            }
            //  $('.repo-metrics').append( "</table>");
        },
        error:function(error){
            console.log("failed");
        }


    });
}

function showRepoModal(result)
{
    console.log(result);
    $('.modal-body').html('<img class="img-responsive" src="' + result + '">');
    $('#myModal').modal('toggle');

}
function showUseCaseUrlModal(url)
{

    $('.modal-body').html('<img class="img-responsive" src="' + url + '">');
    $('#myModal3').modal('toggle');
}
function showUrl2Modal(url2)
{
    $('.modal-body').html('<img class="img-responsive" src="' + url2 + '">');
    $('#myModal4').modal('toggle');
}
function showDomainModal(chart_url)
{
    $('.modal-body').html('<img class="img-responsive" src="' + chart_url + '">');
    $('#myModal5').modal('toggle');
}
function showModal(svg_url)
{
    console.log(svg_url);
    $('.modal-body').html('<img class="img-responsive" src="' + svg_url + '">');
    $('#myModal2').modal('toggle');
}
function showModalDetails(domainurl)
{
    $('.modal-body').html('<img class="img-responsive" src="' + domainurl + '">');
    $('#myModal1').modal('toggle');
}
// This function displays the chart for the estimation result (estimation tab)
function showEstimationChart(chartsTag)
{
    console.log("inside estimation chart function");
    console.log(chartsTag);
//    console.log($('#estimation-result-panel-body').html());
//            var effort_estimation_url = "output/repo"+ repoID  +  "/estimationResult.json";
   
	var effort_estimation_url = $(chartsTag).data('url');
    $.ajax({
        url: effort_estimation_url,
        type:"GET",
        dataType: "json",

        success: function(response)
        {
            console.log(response);
            var SizeMeasurement = [];
            var Effort = [];
            var Duration =[];
            var Personnel=[];
            var name = [];
            for(var i=0;i<response.UseCases.length;i++)
            {
                SizeMeasurement.push([parseFloat(response.UseCases[i].SizeMeasurement)]);
                Effort.push([parseFloat(response.UseCases[i].Effort)]);
                Duration.push([parseFloat(response.UseCases[i].Duration)]);
                Personnel.push([parseFloat(response.UseCases[i].Personnel)]);
                name.push(response.UseCases[i].Name);
            }
            console.log(Effort);
            $(chartsTag).find('#estimation-charts').highcharts({
                chart: {
                    type: 'column',
                    spacingLeft: 0

                },
                title: {
                    text: 'Estimation Results'
                },

                xAxis: {
                    categories: name,
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
                series: [ {
                    name: 'SizeMeasurement',
                    data: SizeMeasurement

                }, {
                    name: 'Duration',
                    data: Duration

                },
                {
                    name: 'Effort',
                    data: Effort

                },
                {
                    name: 'Personnel',
                    data: Personnel

                }]

            });
            //});

        },
        error:function(error){
            console.log("failed");
        }


    });

}
var column_data_name='';
var column_name='';
function drawNewHighCharts(column_data_name,column_name)
{
    var unit = "";
    if (column_data_name === "SizeMeasurement") {
        unit = "units";
    }
    else if (column_data_name === "Duration") {
        unit = "months";
    }
    else if (column_data_name === "Effort") {
        unit = "person-hours"
    }
    else if (column_data_name === "Personnel") {
        unit = "FT"
    }
    column_data_name = column_data_name;
    column_name = column_name;
    console.log(column_data_name, column_name);
    console.log("begin drawwing");
    var effort_estimation_url = $('div [data-myURL="url_id"]').data('url');
    console.log(effort_estimation_url);
    $.ajax({
        url: effort_estimation_url,
        type:"GET",
        dataType: "json",

        success: function(response)
        {
            // var column_data_name = column_data_name;
            // var column_name = column_name;
            console.log("column_data_name");
            console.log(column_data_name);
            console.log(column_name);
            console.log("response");
            console.log(response);
            var items = [];
            for(var i=0;i<response.UseCases.length;i++)
            {
                var temp = {};
                temp.th_param = parseFloat(response.UseCases[i][column_data_name]);
                temp.name = response.UseCases[i].Name;
                items.push(temp);
            }

            items.sort(function(a,b) {
                return (a.th_param > b.th_param) ? -1 : ((b.th_param > a.th_param) ? 1 : 0);
            });

            var name = [];
            var th_param = [];

            for (let j of items) {
                name.push(j.name);
                th_param.push(j.th_param);
            }

            console.log(items);
            $('#estimation-charts').highcharts({
                chart: {
                    type: 'column',
                    spacingLeft: 0

                },
                title: {
                    text: 'Estimation Results'
                },

                xAxis: {
                    categories: name,
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
                    pointFormat: `<tr><td style="color:{series.color};padding:0">{series.name}: </td>` +
                    `<td style="padding:0"><b>{point.y:.1f} ${unit} </b></td></tr>`,
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
                        name: column_name,
                        data: th_param

                    }]

            });

        },
        error:function(error){
            console.log("failed");
        }


    });

}