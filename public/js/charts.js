

function display()
{
  var repoID = $("#myrepoId").val();
  var modelID = $("#mymodelId").val();
console.log(repoID);
console.log(modelID);
var chart_url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/useCaseEvaluation.csv";
  /* Parse csv file using d3.js and display the required data  */
  d3.csv(chart_url, function(data) {
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
      // console.log(ueucw);
      // console.log(uexucw);
      // console.log(uducw);

      $('#chart-1').highcharts({
        chart: {
        type: 'column',
        spacingLeft: 200,
        width:1000
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

$('.statistical-item').click(function() {
  //console.log(this.innerHTML);
  var name =this.innerHTML.substring(0,this.innerHTML.length-2);
  //console.log(name);
  var url = "output/repo"+ repoID + "/" + modelID.substring(0,modelID.length-13) + "/use_case_evaluation_statistics/database.json";
    $( ".statistical-item" ).removeClass( "bolder" );
   $(this).addClass('bolder');
  //console.log(url);
      $.ajax({
        url: url,
        type:"GET",
        dataType: "json",
        success: function(response)
        {
          //  console.log(response.result[0]);

            for (var i=0;i< response.result.length;i++)
            {
              //console.log(key);
              var obj = response.result[i];
                console.log(obj);
                if (obj.metric_name==name)
                {
                    //console.log(obj);
                    document.getElementById("details").innerHTML ="<div style='height:6%'>&nbsp;</div><table class='table table-hover table-bordered'><tbody><tr><th>Metric Name</th><td>"+obj.metric_name+"</td></tr><tr><th>Mean</th><td>"+obj.mean+"</td></tr><tr><th>Variance</th><td>"+obj.variance+"</td></tr><tr><th>1-quartile</th><td>"+obj.one_quartile+"</td></tr><tr><th>Median</th><td>"+obj.median+"</td></tr><tr><th>3-quartile</th><td>"+obj.three_quartile+"</td></tr><tr><th>4-quartile</th><td>"+obj.four_quartile+"</td></tr></tbody></table><img src='"+obj.distribution_chart_path+"'>'";
                    break;
                }
                
            }

        },
        error:function(error){
          console.log("failed");
        }


      });
});

}
