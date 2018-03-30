

function display()
{
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

$('.statistical-item').click(function() {
  //console.log(this.innerHTML);
  var url ="http://localhost:3000/result?metric_name="+ this.innerHTML.substr(0, this.innerHTML.length-2);
  $( ".statistical-item" ).removeClass( "bolder" );
   $(this).addClass('bolder');
  //console.log(url);
      $.ajax({
        url: url,
        type:"GET",
        dataType: "json",
        success: function(response){
          console.log(response);
          document.getElementById("details").innerHTML ="<div style='height:6%'>&nbsp;</div><table class='table table-hover table-bordered'><tbody><tr><th>Metric Name</th><td>"+response[0].metric_name+"</td></tr><tr><th>Mean</th><td>"+response[0].mean+"</td></tr><tr><th>Variance</th><td>"+response[0].variance+"</td></tr><tr><th>1-quartile</th><td>"+response[0].one_quartile+"</td></tr><tr><th>Median</th><td>"+response[0].median+"</td></tr><tr><th>3-quartile</th><td>"+response[0].three_quartile+"</td></tr><tr><th>4-quartile</th><td>"+response[0].four_quartile+"</td></tr></tbody></table><img src='"+response[0].distribution_chart_path+"'>'";
        },
        error:function(error){
          console.log("failed");
        }


      });
});

}
