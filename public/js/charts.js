

function display()
{
  var repoID = $("#myrepoId").val();
  var modelID = $("#mymodelId").val();
// console.log(repoID);
// console.log(modelID);
var chart_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/useCaseEvaluation.csv";
  /* Parse csv file using d3.js and display the required data  */
  d3.csv("useCaseEvaluation.csv", function(data) {
      //console.log(data[0].UEUCW);
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
      console.log(ueucw);
      console.log(uexucw);
      console.log(uducw);

      $('#chart-1').highcharts({
        chart: {
        type: 'column'
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


  //console.log(this.innerHTML);
//<<<<<<< HEAD
//  var url ="http://localhost:3000/result?metric_name="+ this.innerHTML.substr(0, this.innerHTML.length-2);
//  $( ".statistical-item" ).removeClass( "bolder" );
//   $(this).addClass('bolder');
//  //console.log(url);
//=======
  // var name =this.innerHTML.substring(0,this.innerHTML.length-2);
  //console.log(name);
  var url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/use_case_evaluation_statistics/statistics.json";
  var domain_model_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/domain_model_evaluation_statistics/statistics.json";
   //  $( ".statistical-item" ).removeClass( "bolder" );
   // $(this).addClass('bolder');
  console.log(url);
//>>>>>>> c0be937d12b101350e92a51b1b4765ec48d3bd4d
      $.ajax({
        url: url,
        type:"GET",
        dataType: "json",
//<<<<<<< HEAD
//        success: function(response){
//          console.log(response);
//          document.getElementById("details").innerHTML ="<div style='height:6%'>&nbsp;</div><table class='table table-hover table-bordered'><tbody><tr><th>Metric Name</th><td>"+response[0].metric_name+"</td></tr><tr><th>Mean</th><td>"+response[0].mean+"</td></tr><tr><th>Variance</th><td>"+response[0].variance+"</td></tr><tr><th>1-quartile</th><td>"+response[0].one_quartile+"</td></tr><tr><th>Median</th><td>"+response[0].median+"</td></tr><tr><th>3-quartile</th><td>"+response[0].three_quartile+"</td></tr><tr><th>4-quartile</th><td>"+response[0].four_quartile+"</td></tr></tbody></table><img src='"+response[0].distribution_chart_path+"'>'";
//=======

        success: function(response)
        {
          //console.log(response[0].statistics.third_quartile);
          document.getElementById("details").innerHTML ="<div style='height:6%'>&nbsp;</div><h3>Use case evaluation statistics</h3><table class='table table-hover table-bordered'; id='mytable'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>";
            for (var i=0;i<response.length;i++)
            {

                  document.getElementById("mytable").innerHTML +=  "<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><img src='" + response[i]['dist chart path'] +"'></td></tr>" ;

            }
            //document.getElementById("details").innerHTML+= "</table>";
        },
        error:function(error){
          console.log("failed");
        }


      });
      //domain model evaluation statistics
      $.ajax({
        url: domain_model_url,
        type:"GET",
        dataType: "json",

        success: function(response)
        {
          //console.log(response[0].statistics.third_quartile);
          document.getElementById("details").innerHTML +="<div style='height:6%'>&nbsp;</div><h3>Doamin Model evaluation statistics</h3><table class='table table-hover table-bordered'; id='domain_table'; style='width:100%'><tr><th>Column Name</th><th>Mean</th><th>Variance</th><th>First Quartile</th><th>Median</th><th>Third Quartile</th><th>Kurtosis</th><th>Distribution chart</th></tr>";
            for (var i=0;i<response.length;i++)
            {

                  document.getElementById("domain_table").innerHTML +=  "<tr><td>"+response[i]["column name"] +"</td><td>" + response[i].statistics.mean + "</td><td>" +  response[i].statistics.variance + "</td><td>" +  response[i].statistics.first_quartile + "</td><td>" +  response[i].statistics.median + "</td><td>" + response[i].statistics.third_quartile + "</td><td>" + response[i].statistics.kurtosis + "</td><td><img src='" + response[i]['dist chart path'] +"'></td></tr>" ;

            }
            //document.getElementById("details").innerHTML+= "</table>";
//>>>>>>> c0be937d12b101350e92a51b1b4765ec48d3bd4d
        },
        error:function(error){
          console.log("failed");
        }


      });


}
