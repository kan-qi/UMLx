<<<<<<< HEAD
app.get('/save_model', function(req, res){

	umlModelInfoManager.save_model_utility(function(){
		
	    });





})

/Users/chengxiansheng/project_dr/UMLx/data/GitAndroidAnalysis/accuracy_analysis2/models


console.log(jsonDatalist);
     for (var i in jsonDatalist) { //save data into mongodb from array
       // dbase.collection('estimation_models').save(jsonDatalist[i], function (err, records) {
            //if (err) throw err;
           // console.log("record added");
            console.log(jsonDatalist[i]['model_name']);
            let query={ model_name: jsonDatalist[i]['model_name']};
            var records_check;
            rdbase.collection('estimation_models').findOne(query, function (err, records) {
              if(records)
              {
                console.log(query);
                       dbase.collection('estimation_models').deleteOne(query);//, function (err, records) {
           // if (err) throw err;
            //console.log("record deleted");
        //}); 
                               dbase.collection('estimation_models').save(jsonDatalist[i], function (err, records) {
            if (err) throw err;
            console.log("record replaced");
        });

              }
              else
              {

                console.log(query);
                   dbase.collection('estimation_models').save(jsonDatalist[i], function (err, records) {
            if (err) throw err;
            console.log("record added");
        });
              }

            });

       }

=======
var UMLModelSizeMetricEvaluator = require('./evaluators/UMLModelSizeMetricEvaluator/UMLModelSizeMetricEvaluator1.js');
UMLModelSizeMetricEvaluator.evaluateDomainModel();
>>>>>>> 51347c4a2e1047226912f8b6a7b254614e344ef8
