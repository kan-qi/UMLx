
    function updateModelInfo(modelInfo, repoId, callbackfunc){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            var o_id = new mongo.ObjectID(modelInfo._id);
            
            //adding model_id in domainModelInfo
            modelInfo.DomainModel.model_id = o_id;
            
            modelInfo._id = new mongo.ObjectID(o_id);
            
            //adding rep_id as an element in modelInfo
            modelInfo.rep_id = new mongo.ObjectID(repoId);
        
            var domainModel = modelInfo.DomainModel;
            var useCases = modelInfo.UseCases;
            
             for(var i in useCases){
                //console.log("Before "+useCases[i]._id);
                useCases[i].model_id = o_id;
                useCases[i]._id = new mongo.ObjectID(useCases[i]._id);
                         
                //Call to update useCaseInfo
                updateUseCaseInfo(modelInfo._id, repoId, useCases[i],callbackfunc);
            }
            
            //removing domainModel & useCases from the model object 
            delete modelInfo.DomainModel;
            delete modelInfo.UseCases;
            
            db.collection("modelInfo").insertOne(modelInfo, function(err, res){
                if (err) throw err;
                    console.log(" adding model info");
            
                     
            //updating domainModelInfo to add model_id element
            db.collection("domainModelInfo").insertOne(domainModel, function(err, res) {
                if (err) throw err;
                console.log("updating domainModelInfo");
           
                 db.close();
                    if(callbackfunc !== null){
                        callbackfunc(modelInfo);
                    }
                 
                 });
               });
         });
    }
    
     function updateUseCaseInfo(modelId, repoId, useCase,callbackfunc){
        
         MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            
            db.collection("useCaseInfo").insert(useCase, function(err, res) {
                if (err) throw err;
                    console.log("1 record inserted");
                
                db.close();
                if(callbackfunc !== null){
                    callbackfunc("Use Case Updated: ");
                }
             });
         });
    }