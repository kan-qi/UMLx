var modelID;

function display()
{
  var repoID = $("#myrepoId").val();
  modelID = $("#mymodelId").val();
// console.log(repoID);
// console.log(modelID);
var chart_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/useCaseEvaluation.csv";
  /* Parse csv file using d3.js and display the required data  */
  d3.csv(chart_url, function(data) {

      var ueucw = [];
      var uexucw = [];
      var uducw =[];
      var categories=[];
      for(var i=0;i<data.length;i++)
      {
        ueucw.push([parseInt(data[i].UEUCW)]);
        uexucw.push([parseInt(data[i].UEXUCW)]);
        uducw.push([parseInt(data[i].UDUCW)]);
        categories.push(["UC"+data[i].NUM]);
      }

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
    series: [ {
        name: 'UDUCW',
        data: ueucw

    }, {
        name: 'UEXUCW',
        data: uexucw

    }, {
        name: 'UDUCW',
        data: uducw

    }]

    });
    });


  var url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/use_case_evaluation_statistics/statistics.json";
  var domain_model_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/domain_model_evaluation_statistics/statistics.json";

  console.log(url);
      $.ajax({
        url: url,
        type:"GET",
        dataType: "json",

        success: function(response)
        {

              document.getElementById("details").innerHTML ="<div style='height:6%'>&nbsp;</div><h3>Use case evaluation statistics</h3><table class='table table-hover table-bordered'; id='mytable'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>";
                for (var i=0;i<response.length;i++)
                {

                      document.getElementById("mytable").innerHTML +=  "<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><img src='" + response[i]['dist chart path'] +"'></td></tr>" ;

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

                document.getElementById("details").innerHTML +="<div style='height:6%'>&nbsp;</div><h3>Doamin Model evaluation statistics</h3><table class='table table-hover table-bordered'; id='domain_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>";
                  for (var i=0;i<response.length;i++)
                  {

                        document.getElementById("domain_table").innerHTML +=  "<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><img src='" + response[i]['dist chart path'] +"'></td></tr>" ;

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
  console.log(repo_url);
  $.ajax({
          url: repo_url,
          type:"GET",
          dataType: "json",

          success: function(response)
          {
                //console.log(response)

                $('.repo-metrics').html("<div style='height:6%'>&nbsp;</div><h3>statistics</h3><table class='table table-hover table-bordered'; id='repo_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>");
                  for (var i=0;i<response.length;i++)
                  {

                          $('#repo_table').append("<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><img src='" + response[i]['dist chart path'] +"'></td></tr>");

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
                    $('#analysis-data').html("<div style='height:6%'>&nbsp;</div><h3>Use case statistics</h3><table class='table table-hover table-bordered'; id='usecase_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>");
                      for (var i=0;i<response.length;i++)
                      {

                              $('#usecase_table').append("<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><img src='" + response[i]['dist chart path'] +"'></td></tr>");

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

                    $('#analysis-data').append("<div style='height:6%'>&nbsp;</div><table class='table table-hover table-bordered'; id='usecase_table2'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>");
                      for (var i=0;i<response.length;i++)
                      {

                              $('#usecase_table2').append("<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><img src='" + response[i]['dist chart path'] +"'></td></tr>");

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
                  $('#show_Domain_JsonData').html("<div style='height:6%'>&nbsp;</div><h3>Domain Model statistics</h3><table class='table table-hover table-bordered'; id='domainAnalysis_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>");
                    for (var i=0;i<response.length;i++)
                    {

                            $('#domainAnalysis_table').append("<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><img src='" + response[i]['dist chart path'] +"'></td></tr>");

                    }
                  //  $('.repo-metrics').append( "</table>");
            },
            error:function(error){
                  console.log("failed");
            }


    });
  }
