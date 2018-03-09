

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
}
